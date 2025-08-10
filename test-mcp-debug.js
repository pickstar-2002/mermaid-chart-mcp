import { spawn } from 'child_process';

async function testMCPWithDebug() {
  console.log('🔍 测试MCP调用并查看详细日志...');
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  
  // 监听服务器启动和调试信息
  serverProcess.stderr.on('data', (data) => {
    const message = data.toString();
    console.log('🔧 Server Log:', message.trim());
    if (message.includes('Mermaid Chart MCP Server started')) {
      serverReady = true;
      setTimeout(sendRenderRequest, 1000); // 等待1秒后发送请求
    }
  });

  // 监听响应
  serverProcess.stdout.on('data', (data) => {
    console.log('📤 Response:', data.toString());
    setTimeout(() => {
      serverProcess.kill();
      process.exit(0);
    }, 2000);
  });

  function sendRenderRequest() {
    if (!serverReady) return;
    
    console.log('📨 发送渲染请求...');
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'render_mermaid',
        arguments: {
          code: `sequenceDiagram
    participant MD as 市场数据Agent
    participant HD as 历史数据Agent
    participant ED as 外部数据Agent
    participant FA as 特征工程Agent
    participant PA as 预测算法Agent
    participant EA as 集成评估Agent
    participant DA as 决策支持Agent
    
    MD->>FA: 市场趋势数据
    HD->>FA: 历史销售数据
    ED->>FA: 经济指标、天气数据
    
    FA->>PA: 特征工程处理
    Note over FA: 数据清洗、特征选择、降维
    
    PA->>PA: 多模型并行预测
    Note over PA: LSTM、ARIMA、XGBoost
    
    PA->>EA: 各模型预测结果
    EA->>EA: 模型融合与评估
    Note over EA: 加权平均、投票机制
    
    EA->>DA: 最终预测结果
    DA->>DA: 生成决策建议
    Note over DA: 库存调整、采购计划`,
          options: {
            format: 'png',
            outputPath: 'test/sequence-diagram.png',
            dpi: 300,
            width: 1200,
            height: 800,
            backgroundColor: 'white',
            theme: 'default'
          }
        }
      }
    };

    serverProcess.stdin.write(JSON.stringify(request) + '\n');
  }

  // 超时处理
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      console.log('⏰ 测试超时，终止进程');
      serverProcess.kill();
      process.exit(1);
    }
  }, 60000); // 60秒超时
}

testMCPWithDebug().catch(console.error);