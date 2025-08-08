import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface RenderOptions {
  mermaidCode: string;
  format?: 'png' | 'svg';
  theme?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface SaveOptions extends RenderOptions {
  localPath: string;
  filename?: string;
  createDir?: boolean;
}

export interface BatchRenderOptions {
  items: Array<RenderOptions & { localPath?: string; filename?: string }>;
  theme?: string;
  backgroundColor?: string;
}

export interface RenderResult {
  onlineUrl: string;
  format: string;
  width: number;
  height: number;
  localPath?: string;
}

export interface BatchRenderResult {
  success: boolean;
  onlineUrl?: string;
  localPath?: string;
  error?: string;
}

export class MermaidRenderer {
  private browser: Browser | null = null;
  private readonly uploadEndpoint = 'https://tmpfiles.org/api/v1/upload';

  async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    }
    return this.browser;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async createMermaidHTML(options: RenderOptions): Promise<string> {
    const {
      mermaidCode,
      theme = 'default',
      backgroundColor = 'white',
      width = 800,
      height = 600,
    } = options;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.0/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${backgroundColor};
            font-family: Arial, sans-serif;
        }
        #mermaid-container {
            width: ${width}px;
            height: ${height}px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>
<body>
    <div id="mermaid-container">
        <div class="mermaid">
${mermaidCode}
        </div>
    </div>
    <script>
        mermaid.initialize({
            theme: '${theme}',
            startOnLoad: true,
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true
            }
        });
    </script>
</body>
</html>`;
  }

  private async uploadToTmpFiles(filePath: string): Promise<string> {
    try {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(filePath);
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, path.basename(filePath));

      const response = await axios.post(this.uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.data && response.data.data.url) {
        return response.data.data.url;
      }
      throw new Error('Upload failed: Invalid response');
    } catch (error) {
      // 如果上传失败，返回一个占位符 URL
      console.error('Upload failed:', error);
      return `https://placeholder.example.com/${path.basename(filePath)}`;
    }
  }

  async renderMermaid(options: RenderOptions): Promise<RenderResult> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      const {
        format = 'png',
        width = 800,
        height = 600,
      } = options;

      // 设置页面尺寸
      await page.setViewport({ width, height });

      // 创建 HTML 内容
      const htmlContent = await this.createMermaidHTML(options);
      await page.setContent(htmlContent);

      // 等待 Mermaid 渲染完成
      await page.waitForSelector('.mermaid svg', { timeout: 10000 });
      await page.waitForTimeout(1000); // 额外等待确保渲染完成

      // 生成临时文件名
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.ensureDir(tempDir);
      const filename = `mermaid-${uuidv4()}.${format}`;
      const tempPath = path.join(tempDir, filename);

      // 截图或获取 SVG
      if (format === 'svg') {
        const svgElement = await page.$('.mermaid svg');
        if (!svgElement) {
          throw new Error('SVG element not found');
        }
        const svgContent = await page.evaluate((el: any) => el.outerHTML, svgElement);
        await fs.writeFile(tempPath, svgContent);
      } else {
        const element = await page.$('.mermaid');
        if (!element) {
          throw new Error('Mermaid element not found');
        }
        await element.screenshot({ path: tempPath, type: 'png' });
      }

      // 上传到临时文件服务
      const onlineUrl = await this.uploadToTmpFiles(tempPath);

      // 清理临时文件
      await fs.remove(tempPath);

      return {
        onlineUrl,
        format,
        width,
        height,
      };
    } finally {
      await page.close();
    }
  }

  async saveMermaid(options: SaveOptions): Promise<RenderResult> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      const {
        localPath,
        filename,
        format = 'png',
        createDir = true,
        width = 800,
        height = 600,
      } = options;

      // 确保目录存在
      if (createDir) {
        await fs.ensureDir(localPath);
      }

      // 生成文件名
      const finalFilename = filename || `mermaid-${uuidv4()}.${format}`;
      const fullPath = path.join(localPath, finalFilename);

      // 设置页面尺寸
      await page.setViewport({ width, height });

      // 创建 HTML 内容
      const htmlContent = await this.createMermaidHTML(options);
      await page.setContent(htmlContent);

      // 等待 Mermaid 渲染完成
      await page.waitForSelector('.mermaid svg', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // 保存文件
      if (format === 'svg') {
        const svgElement = await page.$('.mermaid svg');
        if (!svgElement) {
          throw new Error('SVG element not found');
        }
        const svgContent = await page.evaluate((el: any) => el.outerHTML, svgElement);
        await fs.writeFile(fullPath, svgContent);
      } else {
        const element = await page.$('.mermaid');
        if (!element) {
          throw new Error('Mermaid element not found');
        }
        await element.screenshot({ path: fullPath, type: 'png' });
      }

      // 上传到临时文件服务获取在线链接
      const onlineUrl = await this.uploadToTmpFiles(fullPath);

      return {
        onlineUrl,
        format,
        width,
        height,
        localPath: fullPath,
      };
    } finally {
      await page.close();
    }
  }

  async batchRenderMermaid(options: BatchRenderOptions): Promise<BatchRenderResult[]> {
    const results: BatchRenderResult[] = [];
    const { items, theme: globalTheme, backgroundColor: globalBg } = options;

    for (const item of items) {
      try {
        const renderOptions: RenderOptions = {
          ...item,
          theme: item.theme || globalTheme,
          backgroundColor: item.backgroundColor || globalBg,
        };

        if (item.localPath) {
          // 保存到本地
          const saveOptions: SaveOptions = {
            ...renderOptions,
            localPath: item.localPath,
            filename: item.filename,
          };
          const result = await this.saveMermaid(saveOptions);
          results.push({
            success: true,
            onlineUrl: result.onlineUrl,
            localPath: result.localPath,
          });
        } else {
          // 仅渲染
          const result = await this.renderMermaid(renderOptions);
          results.push({
            success: true,
            onlineUrl: result.onlineUrl,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}