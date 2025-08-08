import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MermaidRenderer } from '../services/mermaidRenderer';
import { RenderRequest, SaveRequest, BatchRenderRequest } from '../types';

export class MermaidMCPServer {
  private server: Server;
  private renderer: MermaidRenderer;

  constructor() {
    this.server = new Server(
      {
        name: 'mermaid-chart-mcp',
        version: '1.0.0',
      }
    );

    this.renderer = new MermaidRenderer();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'renderMermaid',
            description: '渲染 Mermaid 代码为图片并返回在线访问 URL',
            inputSchema: {
              type: 'object',
              properties: {
                mermaidCode: {
                  type: 'string',
                  description: 'Mermaid 图表代码'
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg'],
                  description: '输出格式，默认为 png'
                },
                theme: {
                  type: 'string',
                  description: '主题，如 default, dark, forest 等'
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色，如 white, transparent 等'
                },
                width: {
                  type: 'number',
                  description: '图片宽度'
                },
                height: {
                  type: 'number',
                  description: '图片高度'
                }
              },
              required: ['mermaidCode']
            }
          },
          {
            name: 'saveMermaid',
            description: '渲染 Mermaid 代码并保存到指定本地路径，同时返回在线 URL',
            inputSchema: {
              type: 'object',
              properties: {
                mermaidCode: {
                  type: 'string',
                  description: 'Mermaid 图表代码'
                },
                localPath: {
                  type: 'string',
                  description: '本地保存目录路径'
                },
                filename: {
                  type: 'string',
                  description: '文件名（可选，不指定则自动生成）'
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg'],
                  description: '输出格式，默认为 png'
                },
                createDir: {
                  type: 'boolean',
                  description: '如果目录不存在是否创建，默认为 true'
                },
                theme: {
                  type: 'string',
                  description: '主题，如 default, dark, forest 等'
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色，如 white, transparent 等'
                },
                width: {
                  type: 'number',
                  description: '图片宽度'
                },
                height: {
                  type: 'number',
                  description: '图片高度'
                }
              },
              required: ['mermaidCode', 'localPath']
            }
          },
          {
            name: 'batchRenderMermaid',
            description: '批量处理多个 Mermaid 代码块',
            inputSchema: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      mermaidCode: {
                        type: 'string',
                        description: 'Mermaid 图表代码'
                      },
                      format: {
                        type: 'string',
                        enum: ['png', 'svg'],
                        description: '输出格式'
                      },
                      localPath: {
                        type: 'string',
                        description: '本地保存路径（可选）'
                      },
                      filename: {
                        type: 'string',
                        description: '文件名（可选）'
                      },
                      theme: {
                        type: 'string',
                        description: '主题'
                      },
                      backgroundColor: {
                        type: 'string',
                        description: '背景颜色'
                      }
                    },
                    required: ['mermaidCode']
                  },
                  description: '要处理的 Mermaid 代码列表'
                },
                theme: {
                  type: 'string',
                  description: '全局主题设置'
                },
                backgroundColor: {
                  type: 'string',
                  description: '全局背景颜色设置'
                }
              },
              required: ['items']
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'renderMermaid':
            return await this.handleRenderMermaid(args as RenderRequest);
          
          case 'saveMermaid':
            return await this.handleSaveMermaid(args as SaveRequest);
          
          case 'batchRenderMermaid':
            return await this.handleBatchRender(args as BatchRenderRequest);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (typeof process !== 'undefined' && process.stderr) {
          process.stderr.write(`Tool execution error: ${errorMessage}\n`);
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private async handleRenderMermaid(args: RenderRequest) {
    const result = await this.renderer.renderMermaid(args);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleSaveMermaid(args: SaveRequest) {
    const result = await this.renderer.saveMermaid(args);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleBatchRender(args: BatchRenderRequest) {
    const requests = args.items.map(item => {
      if (item.localPath) {
        // 如果有本地路径，创建 SaveRequest
        const saveRequest: SaveRequest = {
          mermaidCode: item.mermaidCode,
          localPath: item.localPath,
          filename: item.filename,
          format: item.format,
          theme: item.theme || args.theme,
          backgroundColor: item.backgroundColor || args.backgroundColor
        };
        return saveRequest;
      } else {
        // 否则创建 RenderRequest
        const renderRequest: RenderRequest = {
          mermaidCode: item.mermaidCode,
          format: item.format,
          theme: item.theme || args.theme,
          backgroundColor: item.backgroundColor || args.backgroundColor
        };
        return renderRequest;
      }
    });

    const results = await this.renderer.batchRender(requests);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            results
          }, null, 2)
        }
      ]
    };
  }

  public async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      // 使用 stderr 输出启动信息，避免干扰 MCP 通信
      if (typeof process !== 'undefined' && process.stderr) {
        process.stderr.write('Mermaid MCP Server started successfully\n');
      }
    } catch (error) {
      if (typeof process !== 'undefined' && process.stderr) {
        process.stderr.write(`Failed to start MCP server: ${error}\n`);
      }
      throw error;
    }
  }
}