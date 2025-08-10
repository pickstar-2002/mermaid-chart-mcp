import express, { Request, Response } from 'express';
import * as path from 'path';
import { configManager } from '../config/index.js';
import { Server } from 'http';

/**
 * 静态文件服务器
 */
export class StaticFileServer {
  private app: express.Application;
  private server: Server | null = null;
  private isServerRunning = false;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // 静态文件服务
    const outputDir = configManager.get('defaultOutputDir');
    this.app.use('/files', express.static(outputDir));

    // 健康检查
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 根路径
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Mermaid Chart MCP Static Server',
        version: '1.0.0',
        endpoints: {
          files: '/files',
          health: '/health',
        },
      });
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<string> {
    if (this.isServerRunning) {
      return this.getBaseUrl();
    }

    const port = configManager.get('serverPort');
    const host = configManager.get('serverHost');

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, host, () => {
        this.isServerRunning = true;
        const baseUrl = this.getBaseUrl();
        console.error(`Static server started at ${baseUrl}`);
        resolve(baseUrl);
      });

      this.server?.on('error', (error: any) => {
        this.isServerRunning = false;
        reject(error);
      });
    });
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    if (!this.server || !this.isServerRunning) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.isServerRunning = false;
        this.server = null;
        console.error('Static server stopped');
        resolve();
      });
    });
  }

  /**
   * 检查服务器是否运行
   */
  isRunning(): boolean {
    return this.isServerRunning;
  }

  /**
   * 获取基础URL
   */
  private getBaseUrl(): string {
    const port = configManager.get('serverPort');
    const host = configManager.get('serverHost');
    return `http://${host}:${port}`;
  }

  /**
   * 获取文件URL
   */
  getFileUrl(filePath: string): string {
    const outputDir = configManager.get('defaultOutputDir');
    const relativePath = path.relative(outputDir, filePath);
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/files/${relativePath.replace(/\\/g, '/')}`;
  }
}