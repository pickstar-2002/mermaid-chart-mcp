import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs-extra';
import { dirname } from 'path';
import sharp from 'sharp';

export interface RenderOptions {
  mermaidCode: string;
  outputPath: string;
  format?: 'png' | 'svg' | 'pdf';
  width?: number;
  height?: number;
  backgroundColor?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

export interface RenderResult {
  outputPath: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Mermaid 图表渲染器
 * 使用 Puppeteer 和无头浏览器渲染 Mermaid 图表
 */
export class MermaidRenderer {
  private browser: Browser | null = null;

  constructor() {}

  /**
   * 初始化浏览器实例
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * 渲染 Mermaid 图表
   */
  async renderChart(options: RenderOptions): Promise<RenderResult> {
    const {
      mermaidCode,
      outputPath,
      format = 'png',
      width = 1200,
      height = 800,
      backgroundColor = 'white',
      theme = 'default',
    } = options;

    try {
      // 确保输出目录存在
      const outputDir = dirname(outputPath);
      await fs.ensureDir(outputDir);

      // 初始化浏览器
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // 设置视口大小
      await page.setViewport({ width, height });

      // 创建 HTML 内容
      const htmlContent = this.createHtmlContent(mermaidCode, theme, backgroundColor);

      // 加载 HTML 内容
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // 等待 Mermaid 渲染完成
      await page.waitForSelector('#mermaid-diagram', { timeout: 60000 });
      await page.waitForFunction(
        () => {
          const element = document.querySelector('#mermaid-diagram');
          return element && element.getAttribute('data-rendered') === 'true';
        },
        { timeout: 60000 }
      );

      // 根据格式渲染
      if (format === 'svg') {
        await this.renderSVG(page, outputPath);
      } else if (format === 'pdf') {
        await this.renderPDF(page, outputPath, width, height);
      } else {
        await this.renderPNG(page, outputPath, width, height);
      }

      await page.close();

      return {
        outputPath,
        format,
        width,
        height,
      };
    } catch (error) {
      throw new Error(`渲染失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 创建包含 Mermaid 图表的 HTML 内容
   */
  private createHtmlContent(mermaidCode: string, theme: string, backgroundColor: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mermaid Chart</title>
    <script src="https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${backgroundColor};
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Arial', sans-serif;
        }
        #mermaid-diagram {
            max-width: 100%;
            max-height: 100%;
        }
        .mermaid {
            background-color: ${backgroundColor};
        }
        #loading {
            display: none;
        }
    </style>
</head>
<body>
    <div id="loading">Loading Mermaid...</div>
    <div id="mermaid-diagram" class="mermaid">
        ${mermaidCode}
    </div>
    <script>
        console.log('Mermaid script loaded');
        
        mermaid.initialize({
            startOnLoad: false,
            theme: '${theme}',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            },
            sequence: {
                useMaxWidth: true
            },
            gantt: {
                useMaxWidth: true
            }
        });
        
        // 手动渲染图表
        async function renderDiagram() {
            try {
                console.log('Starting mermaid render');
                const element = document.getElementById('mermaid-diagram');
                await mermaid.run({
                    nodes: [element]
                });
                console.log('Mermaid render completed');
                // 添加一个标记表示渲染完成
                element.setAttribute('data-rendered', 'true');
            } catch (error) {
                console.error('Mermaid render error:', error);
                document.body.innerHTML = '<div style="color: red;">Render Error: ' + error.message + '</div>';
            }
        }
        
        // 等待 DOM 加载完成后渲染
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderDiagram);
        } else {
            renderDiagram();
        }
    </script>
</body>
</html>`;
  }

  /**
   * 渲染为 PNG 格式
   */
  private async renderPNG(page: Page, outputPath: string, width: number, height: number): Promise<void> {
    // 获取 SVG 元素
    const svgElement = await page.$('#mermaid-diagram svg');
    if (!svgElement) {
      throw new Error('无法找到生成的 SVG 元素');
    }

    // 截取 SVG 元素的截图
    const screenshot = await svgElement.screenshot({
      type: 'png',
      omitBackground: false,
    });

    // 使用 Sharp 处理图像
    const processedImage = await sharp(screenshot)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: false,
        background: 'white',
      })
      .png({ quality: 100 })
      .toBuffer();

    await fs.writeFile(outputPath, processedImage);
  }

  /**
   * 渲染为 SVG 格式
   */
  private async renderSVG(page: Page, outputPath: string): Promise<void> {
    const svgContent = await page.$eval('#mermaid-diagram svg', (element: Element) => {
      return element.outerHTML;
    });

    if (!svgContent) {
      throw new Error('无法获取 SVG 内容');
    }

    await fs.writeFile(outputPath, svgContent, 'utf-8');
  }

  /**
   * 渲染为 PDF 格式
   */
  private async renderPDF(page: Page, outputPath: string, width: number, height: number): Promise<void> {
    const pdf = await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      width: `${width}px`,
      height: `${height}px`,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
