import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { RenderOptions, RenderResult } from './types';

export class MermaidRenderer {
  private browser: Browser | null = null;
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
  }

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    // 确保输出目录存在
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async renderMermaid(code: string, options: RenderOptions = {}): Promise<RenderResult> {
    try {
      await this.initialize();

      const {
        format = 'png',
        outputPath,
        dpi = 600,
        width = 2400,
        height = 1600,
        backgroundColor = 'white',
        theme = 'default'
      } = options;

      const page = await this.browser!.newPage();
      
      // 设置高分辨率视口，确保高清渲染
      const scaleFactor = Math.max(2, dpi / 96);
      const viewportWidth = Math.round(width * scaleFactor);
      const viewportHeight = Math.round(height * scaleFactor);
      
      await page.setViewport({ 
        width: viewportWidth, 
        height: viewportHeight,
        deviceScaleFactor: scaleFactor
      });

      // 创建HTML内容，使用高分辨率尺寸
      const html = this.createMermaidHTML(code, theme, backgroundColor, viewportWidth, viewportHeight);
      await page.setContent(html);

      // 等待Mermaid渲染完成
      await page.waitForSelector('#mermaid-diagram svg', { timeout: 30000 });

      // 获取SVG元素
      const svgElement = await page.$('#mermaid-diagram svg');
      if (!svgElement) {
        throw new Error('无法找到渲染的SVG元素');
      }

      // 获取SVG的实际尺寸
      const boundingBox = await svgElement.boundingBox();
      if (!boundingBox) {
        throw new Error('无法获取SVG边界框');
      }

      let finalOutputPath: string;
      if (outputPath) {
        finalOutputPath = outputPath;
      } else {
        const filename = `mermaid-${uuidv4()}.${format}`;
        finalOutputPath = path.join(this.outputDir, filename);
      }

      // 确保输出目录存在
      await fs.mkdir(path.dirname(finalOutputPath), { recursive: true });

      if (format === 'svg') {
        // 获取SVG内容
        const svgContent = await page.evaluate(() => {
          const svg = document.querySelector('#mermaid-diagram svg');
          return svg ? svg.outerHTML : null;
        });

        if (!svgContent) {
          throw new Error('无法获取SVG内容');
        }

        await fs.writeFile(finalOutputPath, svgContent, 'utf8');
      } else {
        // 直接截取高分辨率图片，已经通过deviceScaleFactor实现高清
        const screenshot = await svgElement.screenshot({
          type: 'png',
          omitBackground: backgroundColor === 'transparent',
          clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
          }
        });

        // 使用sharp进行最终优化，保持原始高分辨率
        await sharp(screenshot)
          .png({ 
            quality: 100,
            compressionLevel: 0, // 无压缩损失
            adaptiveFiltering: true,
            palette: false // 使用真彩色
          })
          .withMetadata({
            density: dpi // 设置正确的DPI元数据
          })
          .toFile(finalOutputPath);
      }

      await page.close();

      return {
        success: true,
        outputPath: finalOutputPath,
        format,
        size: {
          width: width,
          height: height
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private createMermaidHTML(code: string, theme: string, backgroundColor: string, width: number = 1200, height: number = 800): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${backgroundColor};
            font-family: Arial, sans-serif;
            width: ${width}px;
            height: ${height}px;
        }
        #mermaid-diagram {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
        .mermaid svg {
            max-width: ${width - 40}px !important;
            max-height: ${height - 40}px !important;
            width: auto !important;
            height: auto !important;
        }
    </style>
</head>
<body>
    <div id="mermaid-diagram">
        <div class="mermaid">${code}</div>
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: '${theme}',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true
            },
            timeline: {
                useMaxWidth: false
            }
        });
    </script>
</body>
</html>`;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}