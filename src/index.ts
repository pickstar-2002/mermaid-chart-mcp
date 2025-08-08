#!/usr/bin/env node

import { MermaidMCPServer } from './mcp/server';
import { ExpressServer } from './server/express';

async function main() {
  const args = process.argv.slice(2);
  
  // 检查是否以 MCP 模式运行
  if (args.includes('--mcp') || process.env.MCP_MODE === 'true') {
    // MCP 服务器模式
    const mcpServer = new MermaidMCPServer();
    await mcpServer.start();
  } else {
    // HTTP 服务器模式
    const port = parseInt(process.env.PORT || '3000');
    const baseUrl = process.env.BASE_URL;
    
    const expressServer = new ExpressServer(port, baseUrl);
    await expressServer.start();
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  if (process.stderr) {
    process.stderr.write(`Uncaught Exception: ${error.message}\n`);
  }
  // 在MCP模式下不要立即退出，让MCP客户端处理
  if (!process.argv.includes('--mcp') && process.env.MCP_MODE !== 'true') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  if (process.stderr) {
    process.stderr.write(`Unhandled Rejection: ${errorMessage}\n`);
  }
  // 在MCP模式下不要立即退出
  if (!process.argv.includes('--mcp') && process.env.MCP_MODE !== 'true') {
    process.exit(1);
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});