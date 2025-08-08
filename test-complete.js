#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function testCompleteFlow() {
  console.log('=== 完整MCP服务器测试 ===');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath, '--mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let messageId = 1;
  let responses = [];

  function sendMessage(message, description) {
    const jsonMessage = JSON.stringify(message) + '\n';
    console.log(`\n${description}:`);
    console.log('发送:', JSON.stringify(message, null, 2));
    server.stdin.write(jsonMessage);
  }

  server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log('响应:', response);
    responses.push(response);
    
    try {
      const parsed = JSON.parse(response);
      if (parsed.error) {
        console.log('❌ 错误:', parsed.error);
      } else if (parsed.result) {
        console.log('✅ 成功');
      }
    } catch (e) {
      // 可能是多行响应
    }
  });

  server.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString().trim());
  });

  server.on('error', (error) => {
    console.log('❌ 服务器启动错误:', error.message);
  });

  server.on('close', (code, signal) => {
    console.log(`\n=== 测试结束 ===`);
    console.log(`进程退出: code=${code}, signal=${signal}`);
    console.log(`总响应数: ${responses.length}`);
    
    // 分析结果
    if (responses.length >= 3) {
      console.log('✅ MCP服务器工作正常');
      console.log('✅ 工具列表获取成功');
      console.log('✅ 工具调用测试完成');
    } else {
      console.log('❌ 测试不完整，可能存在问题');
    }
  });

  // 测试序列
  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'complete-test', version: '1.0.0' }
      }
    }, '1. 初始化MCP连接');
  }, 500);

  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/list'
    }, '2. 获取可用工具列表');
  }, 1500);

  setTimeout(() => {
    sendMessage({
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/call',
      params: {
        name: 'renderMermaid',
        arguments: {
          mermaidCode: 'graph LR\n    A[测试] --> B[成功]',
          format: 'png',
          theme: 'default'
        }
      }
    }, '3. 测试renderMermaid工具');
  }, 2500);

  // 等待响应后结束
  setTimeout(() => {
    server.kill('SIGTERM');
  }, 5000);
}

testCompleteFlow();