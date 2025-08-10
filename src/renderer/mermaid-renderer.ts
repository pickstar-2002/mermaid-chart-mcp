import { MermaidRenderOptions, MermaidRenderResult } from '../types/index.js';
import { configManager } from '../config/index.js';
import fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Mermaid 渲染器
 */
export class MermaidRenderer {
  private tempDir: string;

  constructor() {
    this.tempDir = configManager.get('tempDir');
    this.ensureTempDir();
  }

  /**
   * 确保临时目录存在
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.ensureDir(this.tempDir);
    } catch (error) {
      console.warn('Failed to create temp directory:', error);
    }
  }

  /**
   * 渲染单个 Mermaid 图表
   */
  async renderSingle(code: string, options: MermaidRenderOptions = {}): Promise<MermaidRenderResult> {
    const startTime = Date.now();
    const format = options.format || 'png';
    const outputPath = options.outputPath || this.generateOutputPath(format);

    console.error(`[MCP Debug] Starting render - Format: ${format}, Output: ${outputPath}`);
    console.error(`[MCP Debug] Mermaid code length: ${code.length} characters`);

    try {
      // 确保临时目录存在
      await this.ensureTempDir();
      
      // 确保输出目录存在
      await fs.ensureDir(path.dirname(outputPath));
      console.error(`[MCP Debug] Output directory ensured: ${path.dirname(outputPath)}`);

      // 创建临时 mermaid 文件
      const tempMermaidFile = path.join(this.tempDir, `${uuidv4()}.mmd`);
      await fs.writeFile(tempMermaidFile, code, 'utf8');
      console.error(`[MCP Debug] Temp file created: ${tempMermaidFile}`);

      // 构建 mmdc 命令
      const command = this.buildMmdcCommand(tempMermaidFile, outputPath, options);
      console.error(`[MCP Debug] Command: ${command}`);

      // 检查 mermaid-cli 是否可用
      try {
        await execAsync('npx @mermaid-js/mermaid-cli --version');
        console.error('[MCP Debug] Mermaid CLI is available');
      } catch (versionError) {
        console.error('[MCP Debug] Mermaid CLI version check failed:', versionError);
        throw new Error(`Mermaid CLI not available: ${versionError instanceof Error ? versionError.message : String(versionError)}`);
      }

      // 执行渲染
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 30000, // 30秒超时
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      if (stderr) {
        console.error(`[MCP Debug] Command stderr: ${stderr}`);
      }
      if (stdout) {
        console.error(`[MCP Debug] Command stdout: ${stdout}`);
      }

      // 检查输出文件是否存在
      if (!(await fs.pathExists(outputPath))) {
        throw new Error(`Output file was not created at: ${outputPath}`);
      }

      // 获取文件大小信息
      const stats = await fs.stat(outputPath);
      console.error(`[MCP Debug] Output file size: ${stats.size} bytes`);
      
      let size: { width: number; height: number } | undefined;

      if (format === 'png') {
        // 对于 PNG，尝试获取图片尺寸（简化实现）
        size = {
          width: options.width || 1200,
          height: options.height || 800,
        };
      }

      // 清理临时文件
      await fs.remove(tempMermaidFile).catch((cleanupError) => {
        console.error('[MCP Debug] Failed to cleanup temp file:', cleanupError);
      });

      console.error(`[MCP Debug] Render successful in ${Date.now() - startTime}ms`);

      return {
        success: true,
        filePath: outputPath,
        format,
        size,
        renderTime: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MCP Debug] Render failed: ${errorMessage}`);
      console.error(`[MCP Debug] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      
      return {
        success: false,
        error: `Mermaid render failed: ${errorMessage}`,
        renderTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 构建 mmdc 命令
   */
  private buildMmdcCommand(inputFile: string, outputFile: string, options: MermaidRenderOptions): string {
    const args = [
      'npx', '@mermaid-js/mermaid-cli',
      '-i', `"${inputFile}"`,
      '-o', `"${outputFile}"`,
    ];

    if (options.theme) {
      args.push('-t', options.theme);
    }

    if (options.backgroundColor) {
      args.push('-b', options.backgroundColor);
    }

    if (options.width) {
      args.push('-w', options.width.toString());
    }

    if (options.height) {
      args.push('-H', options.height.toString());
    }

    if (options.format === 'svg') {
      args.push('-f', 'svg');
    }

    return args.join(' ');
  }

  /**
   * 生成输出路径
   */
  private generateOutputPath(format: string): string {
    const outputDir = configManager.get('defaultOutputDir');
    const filename = `mermaid-${uuidv4()}.${format}`;
    return path.join(outputDir, filename);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      // 清理临时目录中的旧文件
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24小时

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath).catch(() => {});
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }
}