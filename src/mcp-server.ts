import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { MermaidRenderer } from './renderer';
import { StaticServer } from './server';
import { 
  RenderOptions, 
  RenderResult, 
  BatchRenderRequest, 
  BatchRenderResult,
  ServerConfig 
} from './types';
import path from 'path';
import { promises as fs } from 'fs';

export class MermaidMCPServer {
  private server: Server;
  private renderer: MermaidRenderer;
  private staticServer: StaticServer | null = null;
  private outputDir: string;
  private serverConfig: ServerConfig;

  constructor() {
    this.outputDir = path.resolve('./mermaid-output');
    this.serverConfig = {
      port: 3000,
      host: 'localhost',
      outputDir: this.outputDir,
      baseUrl: 'http://localhost:3000'
    };

    this.server = new Server(
      {
        name: 'mermaid-chart-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.renderer = new MermaidRenderer(this.outputDir);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'render_mermaid',
            description: '渲染单个 Mermaid 图表为图片',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Mermaid 代码'
                },
                options: {
                  type: 'object',
                  properties: {
                    format: {
                      type: 'string',
                      enum: ['png', 'svg'],
                      description: '输出格式',
                      default: 'png'
                    },
                    outputPath: {
                      type: 'string',
                      description: '输出文件路径（可选）'
                    },
                    generateOnlineLink: {
                      type: 'boolean',
                      description: '是否生成在线链接',
                      default: false
                    },
                    dpi: {
                      type: 'number',
                      description: 'DPI 设置（仅对 PNG 有效）',
                      default: 600
                    },
                    width: {
                      type: 'number',
                      description: '图片宽度',
                      default: 2400
                    },
                    height: {
                      type: 'number',
                      description: '图片高度',
                      default: 1600
                    },
                    backgroundColor: {
                      type: 'string',
                      description: '背景颜色',
                      default: 'white'
                    },
                    theme: {
                      type: 'string',
                      enum: ['default', 'dark', 'forest', 'neutral'],
                      description: '主题',
                      default: 'default'
                    }
                  },
                  description: '渲染选项'
                }
              },
              required: ['code']
            }
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
                        description: 'Mermaid 代码'
                      },
                      options: {
                        type: 'object',
                        description: '渲染选项（可选）'
                      }
                    },
                    required: ['code']
                  },
                  description: '渲染请求列表'
                },
                globalOptions: {
                  type: 'object',
                  description: '全局渲染选项（可选）'
                }
              },
              required: ['requests']
            }
          },
          {
            name: 'start_static_server',
            description: '启动静态文件服务器',
            inputSchema: {
              type: 'object',
              properties: {
                port: {
                  type: 'number',
                  description: '服务器端口'
                },
                host: {
                  type: 'string',
                  description: '服务器主机'
                }
              }
            }
          },
          {
            name: 'stop_static_server',
            description: '停止静态文件服务器',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'update_config',
            description: '更新服务器配置',
            inputSchema: {
              type: 'object',
              properties: {
                config: {
                  type: 'object',
                  description: '配置更新'
                }
              },
              required: ['config']
            }
          },
          {
            name: 'get_config',
            description: '获取当前服务器配置',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ] as Tool[]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'render_mermaid':
            return await this.handleRenderMermaid(args);
          
          case 'batch_render_mermaid':
            return await this.handleBatchRenderMermaid(args);
          
          case 'start_static_server':
            return await this.handleStartStaticServer(args);
          
          case 'stop_static_server':
            return await this.handleStopStaticServer();
          
          case 'update_config':
            return await this.handleUpdateConfig(args);
          
          case 'get_config':
            return await this.handleGetConfig();
          
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : '未知错误'}`
            }
          ]
        };
      }
    });
  }

  private async handleRenderMermaid(args: any) {
    const { code, options = {} } = args;
    
    if (!code || typeof code !== 'string') {
      throw new Error('缺少必需参数: code');
    }

    const renderOptions: RenderOptions = { ...options };
    
    // 如果需要生成在线链接，确保静态服务器运行
    if (renderOptions.generateOnlineLink && !this.staticServer) {
      await this.startStaticServer();
    }

    const result = await this.renderer.renderMermaid(code, renderOptions);

    // 生成在线链接
    if (result.success && renderOptions.generateOnlineLink && result.outputPath) {
      const filename = path.basename(result.outputPath);
      result.onlineLink = `${this.serverConfig.baseUrl}/files/${filename}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleBatchRenderMermaid(args: any) {
    const { requests, globalOptions = {} } = args as BatchRenderRequest;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new Error('缺少必需参数: requests');
    }

    const results: RenderResult[] = [];
    let successful = 0;
    let failed = 0;

    // 检查是否需要启动静态服务器
    const needsOnlineLinks = requests.some(req => 
      req.options?.generateOnlineLink || globalOptions.generateOnlineLink
    );
    
    if (needsOnlineLinks && !this.staticServer) {
      await this.startStaticServer();
    }

    for (const request of requests) {
      const mergedOptions = { ...globalOptions, ...request.options };
      const result = await this.renderer.renderMermaid(request.code, mergedOptions);
      
      // 生成在线链接
      if (result.success && mergedOptions.generateOnlineLink && result.outputPath) {
        const filename = path.basename(result.outputPath);
        result.onlineLink = `${this.serverConfig.baseUrl}/files/${filename}`;
      }

      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    const batchResult: BatchRenderResult = {
      results,
      summary: {
        total: requests.length,
        successful,
        failed
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(batchResult, null, 2)
        }
      ]
    };
  }

  private async handleStartStaticServer(args: any = {}) {
    const { port, host } = args;
    
    if (port) this.serverConfig.port = port;
    if (host) this.serverConfig.host = host;
    
    this.serverConfig.baseUrl = `http://${this.serverConfig.host}:${this.serverConfig.port}`;

    const result = await this.startStaticServer();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: '静态服务器启动成功',
            url: result,
            config: this.serverConfig
          }, null, 2)
        }
      ]
    };
  }

  private async handleStopStaticServer() {
    if (this.staticServer) {
      await this.staticServer.stop();
      this.staticServer = null;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: '静态服务器已停止'
          }, null, 2)
        }
      ]
    };
  }

  private async handleUpdateConfig(args: any) {
    const { config } = args;
    
    if (!config || typeof config !== 'object') {
      throw new Error('缺少必需参数: config');
    }

    this.serverConfig = { ...this.serverConfig, ...config };
    
    if (this.staticServer) {
      this.staticServer.updateConfig(this.serverConfig);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: '配置更新成功',
            config: this.serverConfig
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetConfig() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            config: this.serverConfig,
            staticServerRunning: this.staticServer !== null
          }, null, 2)
        }
      ]
    };
  }

  private async startStaticServer(): Promise<string> {
    if (this.staticServer) {
      return this.staticServer.getBaseUrl();
    }

    // 确保输出目录存在
    await fs.mkdir(this.outputDir, { recursive: true });

    this.staticServer = new StaticServer(this.serverConfig);
    return await this.staticServer.start();
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // 优雅关闭处理
    process.on('SIGINT', async () => {
      console.log('\n正在关闭服务器...');
      await this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n正在关闭服务器...');
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.staticServer) {
        await this.staticServer.stop();
      }
      await this.renderer.close();
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  }
}