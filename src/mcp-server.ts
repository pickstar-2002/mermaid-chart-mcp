import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { MermaidRenderer } from './renderer/mermaid-renderer.js';
import { StaticFileServer } from './services/static-server.js';
import { ImageHostingService } from './services/image-hosting.js';
import { configManager } from './config/index.js';
import {
  MermaidRenderRequest,
  BatchMermaidRenderRequest,
  MermaidRenderResult,
  BatchMermaidRenderResult,
} from './types/index.js';

/**
 * Mermaid Chart MCP Server
 */
export class MermaidChartMcpServer {
  private server: Server;
  private renderer: MermaidRenderer;
  private staticServer: StaticFileServer;
  private imageHosting: ImageHostingService;

  constructor() {
    // 动态读取版本号
    let version = 'latest';
    try {
      const fs = require('fs');
      const path = require('path');
      const packagePath = path.join(__dirname, '../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      version = packageJson.version;
    } catch (error) {
      console.error('Failed to read version from package.json:', error instanceof Error ? error.message : String(error));
      version = '2.0.5'; // 使用固定版本作为后备
    }

    this.server = new Server(
      {
        name: 'mermaid-chart-mcp',
        version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.renderer = new MermaidRenderer();
    this.staticServer = new StaticFileServer();
    this.imageHosting = new ImageHostingService();

    this.setupHandlers();
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'render_mermaid':
          return this.handleRenderMermaid(args);
        case 'batch_render_mermaid':
          return this.handleBatchRenderMermaid(args);
        case 'start_static_server':
          return this.handleStartStaticServer(args);
        case 'stop_static_server':
          return this.handleStopStaticServer(args);
        case 'update_config':
          return this.handleUpdateConfig(args);
        case 'get_config':
          return this.handleGetConfig(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * 获取可用工具列表
   */
  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'render_mermaid',
        description: '渲染单个 Mermaid 图表为图片',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Mermaid 代码',
            },
            options: {
              type: 'object',
              properties: {
                format: {
                  type: 'string',
                  enum: ['png', 'svg'],
                  description: '输出格式',
                  default: 'png',
                },
                outputPath: {
                  type: 'string',
                  description: '输出文件路径（可选）',
                },
                generateOnlineLink: {
                  type: 'boolean',
                  description: '是否生成在线链接',
                  default: false,
                },
                dpi: {
                  type: 'number',
                  description: 'DPI 设置（仅对 PNG 有效）',
                  default: 300,
                },
                width: {
                  type: 'number',
                  description: '图片宽度',
                  default: 1200,
                },
                height: {
                  type: 'number',
                  description: '图片高度',
                  default: 800,
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色',
                  default: 'white',
                },
                theme: {
                  type: 'string',
                  enum: ['default', 'dark', 'forest', 'neutral'],
                  description: '主题',
                  default: 'default',
                },
              },
              description: '渲染选项',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'batch_render_mermaid',
        description: '批量渲染多个 Mermaid 图表',
        inputSchema: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'Mermaid 代码',
                  },
                  options: {
                    type: 'object',
                    description: '渲染选项（可选）',
                  },
                },
                required: ['code'],
              },
              description: '渲染请求列表',
            },
            globalOptions: {
              type: 'object',
              description: '全局渲染选项（可选）',
            },
          },
          required: ['requests'],
        },
      },
      {
        name: 'start_static_server',
        description: '启动静态文件服务器',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: '服务器端口',
            },
            host: {
              type: 'string',
              description: '服务器主机',
            },
          },
        },
      },
      {
        name: 'stop_static_server',
        description: '停止静态文件服务器',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'update_config',
        description: '更新服务器配置',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              description: '配置更新',
            },
          },
          required: ['config'],
        },
      },
      {
        name: 'get_config',
        description: '获取当前服务器配置',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  /**
   * 处理单个 Mermaid 渲染
   */
  private async handleRenderMermaid(args: any): Promise<{ content: MermaidRenderResult[] }> {
    const { code, options = {} } = args as MermaidRenderRequest;

    try {
      const result = await this.renderer.renderSingle(code, options);

      // 如果需要生成在线链接
      if (options.generateOnlineLink && result.success && result.filePath) {
        try {
          if (configManager.get('enableStaticServer') && this.staticServer.isRunning()) {
            // 使用静态服务器
            result.onlineUrl = this.staticServer.getFileUrl(result.filePath);
          } else {
            // 使用图床
            result.onlineUrl = await this.imageHosting.uploadImage(result.filePath);
          }
        } catch (error) {
          console.warn('Failed to generate online link:', error);
        }
      }

      return { content: [result] };
    } catch (error) {
      throw new Error(`Render failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理批量 Mermaid 渲染
   */
  private async handleBatchRenderMermaid(args: any): Promise<{ content: BatchMermaidRenderResult[] }> {
    const { requests, globalOptions = {} } = args as BatchMermaidRenderRequest;
    const startTime = Date.now();

    try {
      const results: MermaidRenderResult[] = [];

      for (const request of requests) {
        const mergedOptions = { ...globalOptions, ...request.options };
        const result = await this.renderer.renderSingle(request.code, mergedOptions);

        // 处理在线链接
        if (mergedOptions.generateOnlineLink && result.success && result.filePath) {
          try {
            if (configManager.get('enableStaticServer') && this.staticServer.isRunning()) {
              result.onlineUrl = this.staticServer.getFileUrl(result.filePath);
            } else {
              result.onlineUrl = await this.imageHosting.uploadImage(result.filePath);
            }
          } catch (error) {
            console.warn('Failed to generate online link:', error);
          }
        }

        results.push(result);
      }

      const batchResult: BatchMermaidRenderResult = {
        results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        totalTime: Date.now() - startTime,
      };

      return { content: [batchResult] };
    } catch (error) {
      throw new Error(`Batch render failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理启动静态服务器
   */
  private async handleStartStaticServer(args: any): Promise<{ content: any[] }> {
    const { port, host } = args;

    if (port) configManager.set('serverPort', port);
    if (host) configManager.set('serverHost', host);

    try {
      const baseUrl = await this.staticServer.start();
      return {
        content: [{
          success: true,
          message: 'Static server started',
          baseUrl,
          port: configManager.get('serverPort'),
          host: configManager.get('serverHost'),
        }],
      };
    } catch (error) {
      throw new Error(`Failed to start static server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理停止静态服务器
   */
  private async handleStopStaticServer(args: any): Promise<{ content: any[] }> {
    try {
      await this.staticServer.stop();
      return {
        content: [{
          success: true,
          message: 'Static server stopped',
        }],
      };
    } catch (error) {
      throw new Error(`Failed to stop static server: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理配置更新
   */
  private async handleUpdateConfig(args: any): Promise<{ content: any[] }> {
    const { config } = args;

    try {
      configManager.updateConfig(config);
      const validation = configManager.validateConfig();

      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      return {
        content: [{
          success: true,
          message: 'Configuration updated',
          config: configManager.getConfig(),
        }],
      };
    } catch (error) {
      throw new Error(`Failed to update config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理获取配置
   */
  private async handleGetConfig(args: any): Promise<{ content: any[] }> {
    return {
      content: [{
        config: configManager.getConfig(),
      }],
    };
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // 如果配置启用静态服务器，自动启动
    if (configManager.get('enableStaticServer')) {
      try {
        await this.staticServer.start();
      } catch (error) {
        console.warn('Failed to auto-start static server:', error);
      }
    }

    console.error('Mermaid Chart MCP Server started');
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    await this.staticServer.stop();
    await this.renderer.cleanup();
    console.error('Mermaid Chart MCP Server stopped');
  }
}