import * as fs from 'fs-extra';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'node:child_process';
import { MermaidRenderOptions, MermaidRenderResult } from '../types/index.js';
import { configManager } from '../config/index.js';

/**
 * Mermaid 渲染器
 */
export class MermaidRenderer {
  private tempDir: string;

  constructor() {
    this.tempDir = configManager.get('tempDir') || path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  /**
   * 确保临时目录存在
   */
  private async ensureTempDir(): Promise<void> {
    await fs.ensureDir(this.tempDir);
  }

  /**
   * 执行 Mermaid CLI 渲染
   */
  private async executeRender(
    inputFile: string,
    outputFile: string,
    options: MermaidRenderOptions & { format: 'png' | 'svg' }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputFile,
        '-o', outputFile,
        '-t', options.theme || 'default',
        '-b', options.backgroundColor || 'white'
      ];

      if (options.format === 'png') {
        args.push('-s', String(options.dpi ? options.dpi / 96 : 3)); // 缩放因子
        if (options.width) args.push('-w', options.width.toString());
        if (options.height) args.push('-H', options.height.toString());
      }

      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'npx.cmd' : 'npx';
      
      const mmdc = spawn(command, ['@mermaid-js/mermaid-cli', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: isWindows
      });

      let stderr = '';

      mmdc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      mmdc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Mermaid CLI failed with code ${code}: ${stderr}`));
        }
      });

      mmdc.on('error', (error) => {
        reject(new Error(`Failed to spawn mermaid CLI: ${error.message}`));
      });
    });
  }

  /**
   * 渲染单个 Mermaid 图表
   */
  async renderSingle(
    code: string,
    options: MermaidRenderOptions = {}
  ): Promise<MermaidRenderResult> {
    const startTime = Date.now();
    const result: MermaidRenderResult = {
      originalCode: code,
      success: false,
    };

    try {
      // 设置默认选项
      const renderOptions = {
        format: 'png' as const,
        dpi: 300,
        width: 1200,
        height: 800,
        backgroundColor: 'white',
        theme: 'default' as const,
        ...options,
      };

      // 生成临时文件名
      const tempId = uuidv4();
      const inputFile = path.join(this.tempDir, `${tempId}.mmd`);
      const outputFile = path.join(
        this.tempDir,
        `${tempId}.${renderOptions.format}`
      );

      // 写入 Mermaid 代码到临时文件
      await fs.writeFile(inputFile, code, 'utf8');

      // 执行渲染
      await this.executeRender(inputFile, outputFile, renderOptions);

      // 检查输出文件是否存在
      if (!(await fs.pathExists(outputFile))) {
        throw new Error('Render output file not generated');
      }

      // 获取文件大小
      const stats = await fs.stat(outputFile);
      result.fileSize = stats.size;

      // 处理输出路径
      if (options.outputPath) {
        const finalPath = path.resolve(options.outputPath);
        await fs.ensureDir(path.dirname(finalPath));
        await fs.move(outputFile, finalPath);
        result.filePath = finalPath;
      } else {
        // 移动到默认输出目录
        const defaultOutputDir = configManager.get('defaultOutputDir')!;
        await fs.ensureDir(defaultOutputDir);
        const finalPath = path.join(
          defaultOutputDir,
          `mermaid-${tempId}.${renderOptions.format}`
        );
        await fs.move(outputFile, finalPath);
        result.filePath = finalPath;
      }

      result.success = true;

      // 清理临时文件
      await fs.remove(inputFile);

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    result.renderTime = Date.now() - startTime;
    return result;
  }

  /**
   * 批量渲染 Mermaid 图表
   */
  async renderBatch(
    codes: string[],
    options: MermaidRenderOptions = {}
  ): Promise<MermaidRenderResult[]> {
    const results: MermaidRenderResult[] = [];

    for (const code of codes) {
      const result = await this.renderSingle(code, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 清理临时目录
   */
  async cleanup(): Promise<void> {
    try {
      await fs.emptyDir(this.tempDir);
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }
}