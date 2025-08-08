import express from 'express';
import cors from 'cors';
import path from 'path';
import { MermaidRenderer } from '../services/mermaidRenderer';
import { RenderRequest, SaveRequest, BatchRenderRequest } from '../types';

export class ExpressServer {
  private app: express.Application;
  private renderer: MermaidRenderer;
  private port: number;

  constructor(port: number = 3000, baseUrl?: string) {
    this.app = express();
    this.port = port;
    this.renderer = new MermaidRenderer('public', baseUrl || `http://localhost:${port}`);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // 静态文件服务
    this.app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
  }

  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 渲染 Mermaid 图表
    this.app.post('/api/render', async (req, res) => {
      try {
        const request: RenderRequest = req.body;
        
        if (!request.mermaidCode) {
          return res.status(400).json({
            success: false,
            error: 'mermaidCode is required'
          });
        }

        const result = await this.renderer.renderMermaid(request);
        
        if (result.success) {
          res.json(result);
        } else {
          res.status(500).json(result);
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: `Server error: ${error}`
        });
      }
    });

    // 保存 Mermaid 图表到本地
    this.app.post('/api/save', async (req, res) => {
      try {
        const request: SaveRequest = req.body;
        
        if (!request.mermaidCode || !request.localPath) {
          return res.status(400).json({
            success: false,
            error: 'mermaidCode and localPath are required'
          });
        }

        const result = await this.renderer.saveMermaid(request);
        
        if (result.success) {
          res.json(result);
        } else {
          res.status(500).json(result);
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: `Server error: ${error}`
        });
      }
    });

    // 批量处理
    this.app.post('/api/batch', async (req, res) => {
      try {
        const request: BatchRenderRequest = req.body;
        
        if (!request.items || !Array.isArray(request.items)) {
          return res.status(400).json({
            success: false,
            error: 'items array is required'
          });
        }

        const requests = request.items.map(item => ({
          ...item,
          theme: item.theme || request.theme,
          backgroundColor: item.backgroundColor || request.backgroundColor
        }));

        const results = await this.renderer.batchRender(requests);
        
        res.json({
          success: true,
          results
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: `Server error: ${error}`
        });
      }
    });

    // 获取图片信息
    this.app.get('/api/info/:imageId', async (req, res) => {
      try {
        const { imageId } = req.params;
        const imagePath = path.join(process.cwd(), 'public', 'images', `${imageId}.png`);
        
        if (await require('fs-extra').pathExists(imagePath)) {
          const stats = await require('fs-extra').stat(imagePath);
          res.json({
            success: true,
            imageId,
            exists: true,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Image not found'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: `Server error: ${error}`
        });
      }
    });

    // 404 处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`Mermaid Chart Server running on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}