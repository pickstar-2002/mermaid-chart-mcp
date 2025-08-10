import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import { ServerConfig } from './types';

export class StaticServer {
  private app: express.Application;
  private server: any = null;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // 静态文件服务
    this.app.use('/files', express.static(this.config.outputDir));
  }

  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 获取文件列表
    this.app.get('/api/files', async (req, res) => {
      try {
        const files = await fs.readdir(this.config.outputDir);
        const fileList = files
          .filter(file => file.endsWith('.png') || file.endsWith('.svg'))
          .map(file => ({
            name: file,
            url: `${this.config.baseUrl}/files/${file}`,
            path: path.join(this.config.outputDir, file)
          }));
        
        res.json({ files: fileList });
      } catch (error) {
        res.status(500).json({ 
          error: '无法读取文件列表',
          details: error instanceof Error ? error.message : '未知错误'
        });
      }
    });

    // 删除文件
    this.app.delete('/api/files/:filename', async (req, res) => {
      try {
        const filename = req.params.filename;
        const filePath = path.join(this.config.outputDir, filename);
        
        // 安全检查：确保文件在输出目录内
        const resolvedPath = path.resolve(filePath);
        const resolvedOutputDir = path.resolve(this.config.outputDir);
        
        if (!resolvedPath.startsWith(resolvedOutputDir)) {
          return res.status(400).json({ error: '无效的文件路径' });
        }

        await fs.unlink(filePath);
        res.json({ success: true, message: '文件删除成功' });
      } catch (error) {
        res.status(500).json({ 
          error: '删除文件失败',
          details: error instanceof Error ? error.message : '未知错误'
        });
      }
    });
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        const url = `http://${this.config.host}:${this.config.port}`;
        console.log(`静态服务器启动成功: ${url}`);
        resolve(url);
      });

      this.server.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('静态服务器已停止');
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  updateConfig(newConfig: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ServerConfig {
    return { ...this.config };
  }
}