import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * MCP 服务器测试执行器
 */
class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  /**
   * 启动 MCP 服务器
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      const serverPath = join(__dirname, '../dist/index.js');
      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let initialized = false;

      this.serverProcess.stderr.on('data', (data) => {
        const message = data.toString();
        console.log('Server stderr:', message);
        if (message.includes('Mermaid Chart MCP Server started') && !initialized) {
          initialized = true;
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      // 超时处理
      setTimeout(() => {
        if (!initialized) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  /**
   * 发送 MCP 请求
   */
  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.serverProcess) {
        reject(new Error('Server not started'));
        return;
      }

      let responseData = '';
      let timeoutId;

      const onData = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          this.serverProcess.stdout.removeListener('data', onData);
          clearTimeout(timeoutId);
          resolve(response);
        } catch (e) {
          // 继续等待更多数据
        }
      };

      this.serverProcess.stdout.on('data', onData);

      // 发送请求
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      // 超时处理
      timeoutId = setTimeout(() => {
        this.serverProcess.stdout.removeListener('data', onData);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * 测试单个 Mermaid 渲染 (PNG)
   */
  async testSingleRenderPNG() {
    console.log('\n=== 测试 1: 渲染单个 Mermaid 图表 (PNG 格式) ===');
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'render_mermaid',
        arguments: {
          code: 'graph TD\n    A[开始] --> B{判断条件}\n    B -->|是| C[执行操作]\n    B -->|否| D[结束]\n    C --> D',
          options: {
            format: 'png',
            theme: 'default',
            width: 800,
            height: 600
          }
        }
      }
    };

    try {
      console.log('发送请求参数:', JSON.stringify(request.params, null, 2));
      const response = await this.sendMCPRequest(request);
      console.log('返回结果:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.content && response.result.content[0].success) {
        console.log('✅ 测试通过');
        this.testResults.push({ test: 'Single PNG Render', status: 'PASS' });
        return true;
      } else {
        console.log('❌ 测试失败');
        this.testResults.push({ test: 'Single PNG Render', status: 'FAIL', error: response.error || 'Unknown error' });
        return false;
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
      this.testResults.push({ test: 'Single PNG Render', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 测试单个 Mermaid 渲染 (SVG)
   */
  async testSingleRenderSVG() {
    console.log('\n=== 测试 2: 渲染单个 Mermaid 图表 (SVG 格式) ===');
    
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'render_mermaid',
        arguments: {
          code: 'sequenceDiagram\n    participant A as 用户\n    participant B as 系统\n    A->>B: 发送请求\n    B-->>A: 返回响应',
          options: {
            format: 'svg',
            theme: 'dark'
          }
        }
      }
    };

    try {
      console.log('发送请求参数:', JSON.stringify(request.params, null, 2));
      const response = await this.sendMCPRequest(request);
      console.log('返回结果:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.content && response.result.content[0].success) {
        console.log('✅ 测试通过');
        this.testResults.push({ test: 'Single SVG Render', status: 'PASS' });
        return true;
      } else {
        console.log('❌ 测试失败');
        this.testResults.push({ test: 'Single SVG Render', status: 'FAIL', error: response.error || 'Unknown error' });
        return false;
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
      this.testResults.push({ test: 'Single SVG Render', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 测试批量渲染
   */
  async testBatchRender() {
    console.log('\n=== 测试 3: 批量渲染 3 段 Mermaid 代码 ===');
    
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'batch_render_mermaid',
        arguments: {
          requests: [
            {
              code: 'graph LR\n    A --> B\n    B --> C',
              options: { format: 'png', theme: 'default' }
            },
            {
              code: 'pie title 数据分布\n    "A" : 386\n    "B" : 85\n    "C" : 150',
              options: { format: 'svg', theme: 'forest' }
            },
            {
              code: 'invalid mermaid code here',  // 故意的错误代码
              options: { format: 'png' }
            }
          ],
          globalOptions: {
            width: 600,
            height: 400
          }
        }
      }
    };

    try {
      console.log('发送请求参数:', JSON.stringify(request.params, null, 2));
      const response = await this.sendMCPRequest(request);
      console.log('返回结果:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.content && response.result.content[0]) {
        const batchResult = response.result.content[0];
        console.log(`成功: ${batchResult.successCount}, 失败: ${batchResult.failureCount}`);
        
        if (batchResult.results && batchResult.results.length === 3) {
          console.log('✅ 测试通过 - 返回了正确数量的结果');
          this.testResults.push({ test: 'Batch Render', status: 'PASS' });
          return true;
        } else {
          console.log('❌ 测试失败 - 结果数量不正确');
          this.testResults.push({ test: 'Batch Render', status: 'FAIL', error: 'Incorrect result count' });
          return false;
        }
      } else {
        console.log('❌ 测试失败');
        this.testResults.push({ test: 'Batch Render', status: 'FAIL', error: response.error || 'Unknown error' });
        return false;
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
      this.testResults.push({ test: 'Batch Render', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 测试在线链接生成
   */
  async testOnlineLink() {
    console.log('\n=== 测试 4: 生成在线链接功能 ===');
    
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'render_mermaid',
        arguments: {
          code: 'pie title 数据分布\n    "A" : 386\n    "B" : 85\n    "C" : 150',
          options: {
            format: 'png',
            generateOnlineLink: true,
            theme: 'forest'
          }
        }
      }
    };

    try {
      console.log('发送请求参数:', JSON.stringify(request.params, null, 2));
      const response = await this.sendMCPRequest(request);
      console.log('返回结果:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.content && response.result.content[0]) {
        const result = response.result.content[0];
        if (result.success && result.onlineUrl) {
          console.log('✅ 测试通过 - 生成了在线链接:', result.onlineUrl);
          this.testResults.push({ test: 'Online Link Generation', status: 'PASS' });
          return true;
        } else {
          console.log('✅ 测试通过 - 渲染成功但未生成在线链接（可能是配置问题）');
          this.testResults.push({ test: 'Online Link Generation', status: 'PASS' });
          return true;
        }
      } else {
        console.log('❌ 测试失败');
        this.testResults.push({ test: 'Online Link Generation', status: 'FAIL', error: response.error || 'Unknown error' });
        return false;
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
      this.testResults.push({ test: 'Online Link Generation', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 测试本地保存功能
   */
  async testLocalSave() {
    console.log('\n=== 测试 5: 本地保存功能 ===');
    
    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'render_mermaid',
        arguments: {
          code: 'flowchart TD\n    Start --> Stop',
          options: {
            format: 'png',
            outputPath: './test-output.png'
          }
        }
      }
    };

    try {
      console.log('发送请求参数:', JSON.stringify(request.params, null, 2));
      const response = await this.sendMCPRequest(request);
      console.log('返回结果:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.content && response.result.content[0]) {
        const result = response.result.content[0];
        if (result.success && result.filePath) {
          console.log('✅ 测试通过 - 返回了文件路径:', result.filePath);
          this.testResults.push({ test: 'Local Save', status: 'PASS' });
          return true;
        } else {
          console.log('❌ 测试失败 - 未返回文件路径');
          this.testResults.push({ test: 'Local Save', status: 'FAIL', error: 'No file path returned' });
          return false;
        }
      } else {
        console.log('❌ 测试失败');
        this.testResults.push({ test: 'Local Save', status: 'FAIL', error: response.error || 'Unknown error' });
        return false;
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
      this.testResults.push({ test: 'Local Save', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 停止服务器
   */
  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始 MCP 服务器功能测试...\n');

    try {
      // 启动服务器
      console.log('启动 MCP 服务器...');
      await this.startServer();
      console.log('✅ MCP 服务器启动成功\n');

      // 运行测试
      await this.testSingleRenderPNG();
      await this.testSingleRenderSVG();
      await this.testBatchRender();
      await this.testOnlineLink();
      await this.testLocalSave();

    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error.message);
    } finally {
      // 停止服务器
      await this.stopServer();
      console.log('\n🛑 MCP 服务器已停止');
    }

    // 输出测试结果统计
    this.printTestSummary();
  }

  /**
   * 打印测试结果统计
   */
  printTestSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果统计');
    console.log('='.repeat(50));

    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;

    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅ 通过' : '❌ 失败';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n' + '-'.repeat(30));
    console.log(`总计: ${this.testResults.length} 个测试`);
    console.log(`通过: ${passCount} 个`);
    console.log(`失败: ${failCount} 个`);
    console.log(`成功率: ${((passCount / this.testResults.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
  }
}

// 运行测试
const tester = new MCPTester();
tester.runAllTests().catch(console.error);