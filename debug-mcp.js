#!/usr/bin/env node

// 调试MCP服务器的脚本
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== MCP Server Debug Tool ===');

// 检查必要文件
const distPath = path.join(__dirname, 'dist', 'index.js');
const packagePath = path.join(__dirname, 'package.json');

console.log('1. 检查文件存在性:');
console.log(`   dist/index.js: ${fs.existsSync(distPath) ? '✓' : '✗'}`);
console.log(`   package.json: ${fs.existsSync(packagePath) ? '✓' : '✗'}`);

// 检查依赖
console.log('\n2. 检查关键依赖:');
try {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = pkg.dependencies || {};
  console.log(`   @modelcontextprotocol/sdk: ${deps['@modelcontextprotocol/sdk'] || '✗'}`);
  console.log(`   @mermaid-js/mermaid-cli: ${deps['@mermaid-js/mermaid-cli'] || '✗'}`);
} catch (error) {
  console.log(`   读取package.json失败: ${error.message}`);
}

// 尝试启动MCP服务器
console.log('\n3. 启动MCP服务器测试:');
if (fs.existsSync(distPath)) {
  const server = spawn('node', [distPath, '--mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let hasOutput = false;
  
  server.stdout.on('data', (data) => {
    hasOutput = true;
    console.log('   STDOUT:', data.toString().trim());
  });

  server.stderr.on('data', (data) => {
    hasOutput = true;
    console.log('   STDERR:', data.toString().trim());
  });

  server.on('error', (error) => {
    console.log('   启动错误:', error.message);
  });

  server.on('close', (code, signal) => {
    console.log(`   进程退出: code=${code}, signal=${signal}`);
    if (!hasOutput) {
      console.log('   ⚠️  没有任何输出，可能存在问题');
    }
  });

  // 发送测试消息
  setTimeout(() => {
    const testMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'debug-client', version: '1.0.0' }
      }
    };
    
    console.log('   发送初始化消息...');
    server.stdin.write(JSON.stringify(testMessage) + '\n');
  }, 1000);

  // 5秒后结束测试
  setTimeout(() => {
    server.kill();
    console.log('\n4. 测试完成');
  }, 5000);
} else {
  console.log('   ✗ dist/index.js 不存在，请先运行 npm run build');
}