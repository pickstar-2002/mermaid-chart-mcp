import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs-extra';
import { dirname } from 'path';
import sharp from 'sharp';
import { MinIOUploader, UploadResult, createDefaultMinIOConfig } from './minio-uploader.js';

export interface RenderOptions {
  mermaidCode: string;
  outputPath: string;
  format?: 'png' | 'svg' | 'pdf';
  width?: number;
  height?: number;
  backgroundColor?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  uploadToMinio?: boolean; // 是否上传到MinIO
  minioExpiryDays?: number; // MinIO文件有效期（天数），默认7天，最大30天
}

export interface RenderResult {
  outputPath: string;
  format: string;
  width: number;
  height: number;
  minioUrl?: string; // 新增：MinIO访问链接
  uploadResult?: UploadResult; // 新增：上传结果详情
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
          '--force-device-scale-factor=2', // 高DPI渲染
          '--high-dpi-support',
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
      uploadToMinio = false,
      minioExpiryDays = 7,
    } = options;

    try {
      // 确保输出目录存在
      const outputDir = dirname(outputPath);
      await fs.ensureDir(outputDir);

      // 初始化浏览器
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // 设置高分辨率视口和设备像素比
      await page.setViewport({ 
        width, 
        height,
        deviceScaleFactor: 2, // 设置设备像素比为2，提高PNG渲染质量
      });

      // 增加页面错误监听
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error('页面控制台错误:', msg.text());
        }
      });

      page.on('pageerror', error => {
        console.error('页面运行时错误:', error);
      });

      // 创建 HTML 内容
      const htmlContent = this.createHtmlContent(mermaidCode, theme, backgroundColor);

      // 加载 HTML 内容
      console.log('加载HTML内容...');
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // 等待 Mermaid 渲染完成，增加更长的超时时间
      console.log('等待Mermaid渲染...');
      try {
        await page.waitForSelector('#mermaid-diagram', { timeout: 30000 });
        
        // 检查是否渲染成功
        const isRendered = await page.waitForFunction(
          () => {
            const element = document.querySelector('#mermaid-diagram');
            const hasRendered = element && element.getAttribute('data-rendered') === 'true';
            const hasSvg = element && element.querySelector('svg');
            console.log('渲染状态检查:', { hasRendered, hasSvg });
            return hasRendered || hasSvg; // 任一条件满足即可
          },
          { timeout: 60000, polling: 1000 }
        );
        
        console.log('Mermaid渲染完成');
      } catch (timeoutError) {
        // 如果超时，尝试获取页面状态信息
        const pageContent = await page.content();
        console.error('渲染超时，页面内容:', pageContent.substring(0, 500));
        
        const diagramElement = await page.$('#mermaid-diagram');
        if (diagramElement) {
          const innerHTML = await page.evaluate(el => el.innerHTML, diagramElement);
          console.error('图表元素内容:', innerHTML);
        }
        
        throw new Error(`Mermaid渲染超时: ${timeoutError instanceof Error ? timeoutError.message : String(timeoutError)}`);
      }

      // 根据格式渲染
      if (format === 'svg') {
        await this.renderSVG(page, outputPath);
      } else if (format === 'pdf') {
        await this.renderPDF(page, outputPath, width, height);
      } else {
        await this.renderPNG(page, outputPath, width, height);
      }

      await page.close();

      // 基础渲染结果
      const result: RenderResult = {
        outputPath,
        format,
        width,
        height,
      };

      // 如果需要上传到MinIO
      if (uploadToMinio) {
        try {
          console.log('🔄 开始MinIO上传...');
          const minioConfig = createDefaultMinIOConfig();
          const minioUploader = new MinIOUploader(minioConfig);
          await minioUploader.initialize();
          
          const uploadResult = await minioUploader.uploadFile(outputPath, {
            expiryDays: minioExpiryDays
          });
          
          result.uploadResult = uploadResult;
          if (uploadResult.success && uploadResult.url) {
            result.minioUrl = uploadResult.url;
            console.log('✅ MinIO上传成功');
          } else {
            console.error('❌ MinIO上传失败:', uploadResult.error);
          }
        } catch (minioError) {
          console.error('❌ MinIO上传过程中发生错误:', minioError);
          result.uploadResult = {
            success: false,
            error: `MinIO上传失败: ${minioError instanceof Error ? minioError.message : String(minioError)}`
          };
        }
      }

      return result;
    } catch (error) {
      throw new Error(`渲染失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 创建包含 Mermaid 图表的 HTML 内容
   */
  private createHtmlContent(mermaidCode: string, theme: string, backgroundColor: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid Chart</title>
    <script src="https://unpkg.com/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${backgroundColor};
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Microsoft YaHei', 'SimHei', 'Arial', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        #mermaid-diagram {
            max-width: 100%;
            max-height: 100%;
        }
        .mermaid {
            background-color: ${backgroundColor};
        }
        svg text {
            font-family: 'Microsoft YaHei', 'SimHei', 'Arial', sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
        }
        svg .node rect,
        svg .node circle,
        svg .node ellipse,
        svg .node polygon {
            stroke-width: 2px !important;
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
                htmlLabels: true,
                curve: 'basis',
                padding: 15
            },
            sequence: {
                useMaxWidth: true,
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35
            },
            gantt: {
                useMaxWidth: true,
                fontSize: 11,
                fontFamily: 'Microsoft YaHei'
            },
            fontFamily: 'Microsoft YaHei, SimHei, Arial, sans-serif',
            fontSize: 14
        });
        
        async function renderDiagram() {
            try {
                console.log('Starting mermaid render');
                const element = document.getElementById('mermaid-diagram');
                await mermaid.run({
                    nodes: [element]
                });
                console.log('Mermaid render completed');
                if (element) {
                    element.setAttribute('data-rendered', 'true');
                }
            } catch (error) {
                console.error('Mermaid render error:', error);
                const errorMsg = error && error.message ? error.message : 'Unknown error';
                document.body.innerHTML = '<div style="color: red;">Render Error: ' + errorMsg + '</div>';
            }
        }
        
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

    // 截取 SVG 元素的截图，使用高质量设置
    const screenshot = await svgElement.screenshot({
      type: 'png',
      omitBackground: false,
      clip: undefined, // 让Puppeteer自动检测边界
    });

    // 使用 Sharp 处理图像，提高质量
    const processedImage = await sharp(screenshot)
      .resize(width * 2, height * 2, { // 先放大2倍提高质量
        fit: 'inside',
        withoutEnlargement: false,
        background: 'white',
      })
      .resize(width, height, { // 再缩小到目标尺寸，实现抗锯齿效果
        fit: 'inside',
        withoutEnlargement: false,
        kernel: sharp.kernel.lanczos3, // 使用高质量缩放算法
      })
      .png({ 
        quality: 100,
        compressionLevel: 0, // 不压缩，保持最高质量
        adaptiveFiltering: false,
        force: true
      })
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
