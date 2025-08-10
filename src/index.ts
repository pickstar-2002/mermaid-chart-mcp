#!/usr/bin/env node

import { MermaidChartMcpServer } from './mcp-server';

/**
 * 主入口文件
 */
async function main() {
  const server = new MermaidChartMcpServer();

  // 处理进程退出信号
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // 启动服务器
  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { MermaidChartMcpServer };