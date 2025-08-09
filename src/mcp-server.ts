/**
 * 简化的 MCP 服务器实现
 */

import { MermaidChartService } from './service';
import { 
  MermaidRenderOptions, 
  SaveMermaidOptions, 
  BatchRenderOptions 
} from './types';

interface MCPRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export class SimpleMCPServer {
  private service: MermaidChartService;

  constructor() {
    this.service = new MermaidChartService();
  }

  async initialize() {
    await this.service.initialize();
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
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
            }
          };

        case 'tools/call':
          const { name, arguments: args } = request.params;
          
          switch (name) {
            case 'renderMermaid': {
              const options = args as MermaidRenderOptions;
              const result = await this.service.renderMermaid(options);
              
              return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2)
                    }
                  ]
                }
              };
            }

            case 'saveMermaid': {
              const options = args as SaveMermaidOptions;
              const result = await this.service.saveMermaid(options);
              
              return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2)
                    }
                  ]
                }
              };
            }

            case 'batchRenderMermaid': {
              const options = args as BatchRenderOptions;
              const result = await this.service.batchRenderMermaid(options);
              
              return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2)
                    }
                  ]
                }
              };
            }

            default:
              return {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                  code: -32601,
                  message: `未知工具: ${name}`
                }
              };
          }

        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `未知方法: ${request.method}`
            }
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: `工具执行失败: ${errorMessage}`
        }
      };
    }
  }

  async close() {
    await this.service.close();
  }

  async run() {
    await this.initialize();

    // 监听标准输入
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      try {
        const lines = data.toString().trim().split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          const request = JSON.parse(line) as MCPRequest;
          const response = await this.handleRequest(request);
          
          console.log(JSON.stringify(response));
        }
      } catch (error) {
        console.error('处理请求失败:', error);
      }
    });

    // 优雅关闭处理
    process.on('SIGINT', async () => {
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.close();
      process.exit(0);
    });
  }
}