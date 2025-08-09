/**
 * Mermaid 渲染引擎
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MermaidRenderOptions, RenderResult } from './types';

export class MermaidRenderer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * 初始化浏览器
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // 设置页面内容
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          #mermaid-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .mermaid {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div id="mermaid-container">
          <div class="mermaid" id="mermaid-diagram"></div>
        </div>
        <script>
          window.renderMermaid = async function(code, options = {}) {
            try {
              mermaid.initialize({
                startOnLoad: false,
                theme: options.theme || 'default',
                themeVariables: {
                  background: options.backgroundColor || 'white'
                },
                securityLevel: 'loose',
                fontFamily: 'Arial, sans-serif'
              });

              const element = document.getElementById('mermaid-diagram');
              element.innerHTML = code;
              
              await mermaid.run();
              
              return { success: true };
            } catch (error) {
              return { success: false, error: error.message };
            }
          };

          window.getSVGContent = function() {
            const svg = document.querySelector('#mermaid-diagram svg');
            return svg ? svg.outerHTML : null;
          };

          window.getDimensions = function() {
            const svg = document.querySelector('#mermaid-diagram svg');
            if (svg) {
              const rect = svg.getBoundingClientRect();
              return {
                width: rect.width,
                height: rect.height
              };
            }
            return null;
          };
        </script>
      </body>
      </html>
    `);

    await this.page.waitForFunction(() => typeof (window as any).renderMermaid === 'function');
  }

  /**
   * 渲染 Mermaid 图表
   */
  async render(options: MermaidRenderOptions): Promise<Buffer> {
    if (!this.page) {
      throw new Error('渲染器未初始化');
    }

    // 设置页面尺寸
    if (options.width && options.height) {
      await this.page.setViewport({
        width: options.width,
        height: options.height
      });
    }

    // 渲染 Mermaid 图表
    const renderResult = await this.page.evaluate(
      (code: string, opts: any) => {
        return (window as any).renderMermaid(code, opts);
      },
      options.mermaidCode,
      {
        theme: options.theme,
        backgroundColor: options.backgroundColor
      }
    );

    if (!renderResult.success) {
      throw new Error(`Mermaid 渲染失败: ${renderResult.error}`);
    }

    // 等待渲染完成
    await this.page.waitForSelector('#mermaid-diagram svg', { timeout: 10000 });

    let buffer: Buffer;

    if (options.format === 'svg') {
      // 获取 SVG 内容
      const svgContent = await this.page.evaluate(() => {
        return (window as any).getSVGContent();
      });

      if (!svgContent) {
        throw new Error('无法获取 SVG 内容');
      }

      buffer = Buffer.from(svgContent, 'utf8');
    } else {
      // 截图生成 PNG
      const element = await this.page.$('#mermaid-diagram svg');
      if (!element) {
        throw new Error('无法找到渲染的图表元素');
      }

      buffer = await element.screenshot({
        type: 'png',
        omitBackground: options.backgroundColor === 'transparent'
      });
    }

    return buffer;
  }

  /**
   * 获取图表尺寸
   */
  async getDimensions(): Promise<{ width: number; height: number } | null> {
    if (!this.page) return null;

    return await this.page.evaluate(() => {
      return (window as any).getDimensions();
    });
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}