import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MermaidRenderer } from './renderer.js';

/**
 * Mermaid Chart MCP Server
 * 
 * 提供将 Mermaid 代码渲染为高质量图片的 MCP 工具
 */
class MermaidChartMCPServer {
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
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 处理工具列表请求
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'render_mermaid_chart',
            description: '将 Mermaid 代码渲染为高质量图片文件',
            inputSchema: {
              type: 'object',
              properties: {
                mermaidCode: {
                  type: 'string',
                  description: 'Mermaid 图表代码',
                },
                outputPath: {
                  type: 'string',
                  description: '输出文件路径（包含文件名和扩展名）',
                },
                format: {
                  type: 'string',
                  enum: ['png', 'svg', 'pdf'],
                  description: '输出格式（png, svg, pdf），默认为 png',
                  default: 'png',
                },
                width: {
                  type: 'number',
                  description: '图片宽度（像素），默认为 1200',
                  default: 1200,
                },
                height: {
                  type: 'number',
                  description: '图片高度（像素），默认为 800',
                  default: 800,
                },
                backgroundColor: {
                  type: 'string',
                  description: '背景颜色，默认为 white',
                  default: 'white',
                },
                theme: {
                  type: 'string',
                  enum: ['default', 'dark', 'forest', 'neutral'],
                  description: 'Mermaid 主题，默认为 default',
                  default: 'default',
                },
              },
              required: ['mermaidCode', 'outputPath'],
            },
          },
        ],
      };
    });

    // 处理工具调用请求
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'render_mermaid_chart') {
        try {
          const {
            mermaidCode,
            outputPath,
            format = 'png',
            width = 1200,
            height = 800,
            backgroundColor = 'white',
            theme = 'default',
          } = args as {
            mermaidCode: string;
            outputPath: string;
            format?: 'png' | 'svg' | 'pdf';
            width?: number;
            height?: number;
            backgroundColor?: string;
            theme?: 'default' | 'dark' | 'forest' | 'neutral';
          };

          // 验证必需参数
          if (!mermaidCode || !outputPath) {
            throw new Error('mermaidCode 和 outputPath 是必需参数');
          }

          // 渲染图表
          const result = await this.renderer.renderChart({
            mermaidCode,
            outputPath,
            format,
            width,
            height,
            backgroundColor,
            theme,
          });

          return {
            content: [
              {
                type: 'text',
                text: `成功渲染 Mermaid 图表!\n路径: ${result.outputPath}\n格式: ${result.format}\n尺寸: ${result.width}x${result.height}`,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          return {
            content: [
              {
                type: 'text',
                text: `渲染失败: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }

      throw new Error(`未知工具: ${name}`);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mermaid Chart MCP Server 已启动');
  }

  async stop(): Promise<void> {
    await this.renderer.cleanup();
  }
}

// 启动服务器
async function main() {
  const server = new MermaidChartMCPServer();
  
  // 处理进程退出
  process.on('SIGINT', async () => {
    console.error('收到 SIGINT，正在关闭服务器...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('收到 SIGTERM，正在关闭服务器...');
    await server.stop();
    process.exit(0);
  });

  await server.start();
}

main().catch((error) => {
  console.error('启动服务器失败:', error);
  process.exit(1);
});
