#!/usr/bin/env node

/**
 * CLI 入口文件
 */

import { MermaidChartMCPServer } from './index';

async function main() {
  try {
    const server = new MermaidChartMCPServer();
    await server.run();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

main();