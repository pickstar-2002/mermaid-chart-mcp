#!/usr/bin/env node

import { MermaidMCPServer } from './mcp-server';

async function main() {
  const server = new MermaidMCPServer();
  
  console.error('Mermaid Chart MCP Server 启动中...');
  console.error('版本: 1.0.0');
  console.error('支持的功能:');
  console.error('- 渲染 Mermaid 图表为 PNG/SVG');
  console.error('- 批量渲染');
  console.error('- 静态文件服务器');
  console.error('- 在线链接生成');
  console.error('');
  
  try {
    await server.run();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('未处理的错误:', error);
    process.exit(1);
  });
}