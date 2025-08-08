#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function testMCPTools() {
  console.log('=== 测试MCP工具功能 ===');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath, '--mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let messageId = 1;

  function sendMessage(message) {
    const jsonMessage = JSON.stringify(message) + '\n';
    console.log('发送:', JSON.stringify(message, null, 2));
    server.stdin.write(jsonMessage);
  }

  server.stdout.on('data', (data) => {
    console.log('响应:', data.toString().trim());
  });

  server.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString().trim());
  });

  // 1. 初始化
  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });
  }, 500);

  // 2. 列出工具
  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/list'
    });
  }, 1500);

  // 3. 测试渲染工具
  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/call',
      params: {
        name: 'renderMermaid',
        arguments: {
          mermaidCode: 'graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]',
          format: 'png'
        }
      }
    });
  }, 2500);

  // 结束测试
  setTimeout(() => {
    server.kill();
    console.log('\n=== 测试完成 ===');
  }, 4000);
}

testMCPTools();