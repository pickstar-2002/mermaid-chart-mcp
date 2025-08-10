import express from 'express';
import * as path from 'node:path';
import { Server } from 'node:http';
import { configManager } from '../config/index.js';

/**
 * 静态文件服务器
 */
export class StaticFileServer {
  private app: express.Application;
  private server: Server | null = null;
  private port: number;
  private host: string;

  constructor() {
    this.app = express();
    this.port = configManager.get('serverPort') || 3000;
    this.host = configManager.get('serverHost') || 'localhost';
    this.setupRoutes();
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 静态文件服务
    const outputDir = configManager.get('defaultOutputDir')!;
    this.app.use('/files', express.static(outputDir));

    // 文件列表 API
    this.app.get('/api/files', (req, res) => {
      // 这里可以实现文件列表功能
      res.json({ message: 'File listing not implemented yet' });
    });

    // 错误处理
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Static server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, this.host, () => {
        const baseUrl = `http://${this.host}:${this.port}`;
        console.log(`Static file server started at ${baseUrl}`);
        resolve(baseUrl);
      });

      this.server.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Static file server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取文件的访问 URL
   */
  getFileUrl(filePath: string): string {
    const outputDir = configManager.get('defaultOutputDir')!;
    const relativePath = path.relative(outputDir, filePath);
    const baseUrl = `http://${this.host}:${this.port}`;
    return `${baseUrl}/files/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * 检查服务器是否运行
   */
  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }
}