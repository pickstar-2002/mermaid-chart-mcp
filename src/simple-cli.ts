#!/usr/bin/env node

/**
 * 简化的 CLI 入口文件
 */

import { SimpleMCPServer } from './mcp-server';

async function main() {
  try {
    const server = new SimpleMCPServer();
    await server.run();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

main();