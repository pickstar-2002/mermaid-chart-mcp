#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MermaidRenderer } from './renderer.js';

class MermaidMCPServer {
  private server: Server;
  private renderer: MermaidRenderer;

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

    this.renderer = new MermaidRenderer();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
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
                  description: 'Mermaid 图表代码',
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg'],
                  description: '输出格式，默认为 png',
                },
                theme: {
                  type: 'string',
                  description: '主题，如 default, dark, forest 等',
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色，如 white, transparent 等',
                },
                width: {
                  type: 'number',
                  description: '图片宽度',
                },
                height: {
                  type: 'number',
                  description: '图片高度',
                },
              },
              required: ['mermaidCode'],
            },
          },
          {
            name: 'saveMermaid',
            description: '渲染 Mermaid 代码并保存到指定本地路径，同时返回在线 URL',
            inputSchema: {
              type: 'object',
              properties: {
                mermaidCode: {
                  type: 'string',
                  description: 'Mermaid 图表代码',
                },
                localPath: {
                  type: 'string',
                  description: '本地保存目录路径',
                },
                filename: {
                  type: 'string',
                  description: '文件名（可选，不指定则自动生成）',
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg'],
                  description: '输出格式，默认为 png',
                },
                createDir: {
                  type: 'boolean',
                  description: '如果目录不存在是否创建，默认为 true',
                },
                theme: {
                  type: 'string',
                  description: '主题，如 default, dark, forest 等',
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色，如 white, transparent 等',
                },
                width: {
                  type: 'number',
                  description: '图片宽度',
                },
                height: {
                  type: 'number',
                  description: '图片高度',
                },
              },
              required: ['mermaidCode', 'localPath'],
            },
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
                        description: 'Mermaid 图表代码',
                      },
                      format: {
                        type: 'string',
                        enum: ['png', 'svg'],
                        description: '输出格式',
                      },
                      localPath: {
                        type: 'string',
                        description: '本地保存路径（可选）',
                      },
                      filename: {
                        type: 'string',
                        description: '文件名（可选）',
                      },
                      theme: {
                        type: 'string',
                        description: '主题',
                      },
                      backgroundColor: {
                        type: 'string',
                        description: '背景颜色',
                      },
                    },
                    required: ['mermaidCode'],
                  },
                  description: '要处理的 Mermaid 代码列表',
                },
                theme: {
                  type: 'string',
                  description: '全局主题设置',
                },
                backgroundColor: {
                  type: 'string',
                  description: '全局背景颜色设置',
                },
              },
              required: ['items'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'renderMermaid':
            return await this.handleRenderMermaid(args);
          case 'saveMermaid':
            return await this.handleSaveMermaid(args);
          case 'batchRenderMermaid':
            return await this.handleBatchRenderMermaid(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleRenderMermaid(args: any) {
    const result = await this.renderer.renderMermaid({
      mermaidCode: args.mermaidCode,
      format: args.format || 'png',
      theme: args.theme,
      backgroundColor: args.backgroundColor,
      width: args.width,
      height: args.height,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Mermaid 图表已成功渲染！\n\n在线访问链接: ${result.onlineUrl}\n格式: ${result.format}\n尺寸: ${result.width}x${result.height}`,
        },
      ],
    };
  }

  private async handleSaveMermaid(args: any) {
    const result = await this.renderer.saveMermaid({
      mermaidCode: args.mermaidCode,
      localPath: args.localPath,
      filename: args.filename,
      format: args.format || 'png',
      createDir: args.createDir !== false,
      theme: args.theme,
      backgroundColor: args.backgroundColor,
      width: args.width,
      height: args.height,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Mermaid 图表已成功渲染并保存！\n\n本地路径: ${result.localPath}\n在线访问链接: ${result.onlineUrl}\n格式: ${result.format}\n尺寸: ${result.width}x${result.height}`,
        },
      ],
    };
  }

  private async handleBatchRenderMermaid(args: any) {
    const results = await this.renderer.batchRenderMermaid({
      items: args.items,
      theme: args.theme,
      backgroundColor: args.backgroundColor,
    });

    const summary = results.map((result, index) => 
      `${index + 1}. ${result.success ? '成功' : '失败'}: ${result.success ? result.onlineUrl : result.error}`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `批量渲染完成！\n\n处理结果:\n${summary}\n\n成功: ${results.filter(r => r.success).length}/${results.length}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mermaid Chart MCP Server running on stdio');
  }
}

const server = new MermaidMCPServer();
server.run().catch(console.error);