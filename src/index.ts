#!/usr/bin/env node

/**
 * Mermaid Chart MCP Server
 * 基于 AI MCP 协议的 Mermaid 图片生成器
 */

import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types';

import { MermaidChartService } from './service';
import { 
  MermaidRenderOptions, 
  SaveMermaidOptions, 
  BatchRenderOptions 
} from './types';

class MermaidChartMCPServer {
  private server: Server;
  private service: MermaidChartService;

  constructor() {
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

    this.service = new MermaidChartService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
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
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'renderMermaid': {
            const options = args as unknown as MermaidRenderOptions;
            const result = await this.service.renderMermaid(options);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'saveMermaid': {
            const options = args as unknown as SaveMermaidOptions;
            const result = await this.service.saveMermaid(options);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'batchRenderMermaid': {
            const options = args as unknown as BatchRenderOptions;
            const result = await this.service.batchRenderMermaid(options);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知工具: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败: ${errorMessage}`
        );
      }
    });
  }

  async run() {
    // 初始化服务
    await this.service.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // 优雅关闭处理
    process.on('SIGINT', async () => {
      await this.service.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.service.close();
      process.exit(0);
    });
  }
}

// 启动服务器
async function main() {
  const server = new MermaidChartMCPServer();
  await server.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });
}

export { MermaidChartMCPServer };