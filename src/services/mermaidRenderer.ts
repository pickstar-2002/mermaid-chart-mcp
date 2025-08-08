import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateHash, generateUniqueFilename } from '../utils/hash';
import { ensureDirectory, fileExists, safeCopyFile } from '../utils/fileSystem';
import { RenderRequest, SaveRequest, RenderResponse, SaveResponse, MermaidConfig } from '../types';

const execAsync = promisify(exec);

export class MermaidRenderer {
  private publicDir: string;
  private imagesDir: string;
  private tempDir: string;
  private baseUrl: string;

  constructor(publicDir: string = 'public', baseUrl: string = 'http://localhost:3000') {
    this.publicDir = publicDir;
    this.imagesDir = path.join(publicDir, 'images');
    this.tempDir = path.join(process.cwd(), 'temp');
    this.baseUrl = baseUrl;
    this.initializeDirectories();
  }

  private async initializeDirectories(): Promise<void> {
    await ensureDirectory(this.imagesDir);
    await ensureDirectory(this.tempDir);
  }

  /**
   * 渲染 Mermaid 代码为图片并返回在线 URL
   */
  async renderMermaid(request: RenderRequest): Promise<RenderResponse> {
    try {
      const { mermaidCode, format = 'png' } = request;
      
      // 生成文件哈希
      const imageId = generateHash(mermaidCode, format);
      const filename = `${imageId}.${format}`;
      const outputPath = path.join(this.imagesDir, filename);

      // 检查缓存
      if (await fileExists(outputPath)) {
        return {
          success: true,
          imageUrl: `${this.baseUrl}/images/${filename}`,
          imageId,
          format
        };
      }

      // 生成图片
      await this.generateImage(mermaidCode, outputPath, request);

      return {
        success: true,
        imageUrl: `${this.baseUrl}/images/${filename}`,
        imageId,
        format
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to render Mermaid: ${error}`
      };
    }
  }

  /**
   * 渲染 Mermaid 代码并保存到指定本地路径
   */
  async saveMermaid(request: SaveRequest): Promise<SaveResponse> {
    try {
      const { mermaidCode, localPath, filename, createDir = true, format = 'png' } = request;

      // 首先渲染图片获取在线 URL
      const renderResult = await this.renderMermaid(request);
      if (!renderResult.success) {
        return {
          success: false,
          error: renderResult.error
        };
      }

      // 生成本地文件路径
      const finalFilename = filename || `mermaid-${Date.now()}.${format}`;
      const localFilePath = path.join(localPath, finalFilename);

      // 确保目录存在
      if (createDir) {
        await ensureDirectory(localPath);
      }

      // 复制文件到本地路径
      const sourceImagePath = path.join(this.imagesDir, `${renderResult.imageId}.${format}`);
      await safeCopyFile(sourceImagePath, localFilePath);

      return {
        success: true,
        imageUrl: renderResult.imageUrl,
        imageId: renderResult.imageId,
        format,
        localFilePath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save Mermaid: ${error}`
      };
    }
  }

  /**
   * 使用 mermaid-cli 命令行工具生成图片
   */
  private async generateImage(mermaidCode: string, outputPath: string, config: MermaidConfig = {}): Promise<void> {
    const tempInputFile = path.join(this.tempDir, `input-${Date.now()}.mmd`);
    
    try {
      // 写入临时文件
      await fs.writeFile(tempInputFile, mermaidCode, 'utf8');

      // 构建 mermaid-cli 命令
      const mmdc = path.join(process.cwd(), 'node_modules', '.bin', 'mmdc');
      let command = `"${mmdc}" -i "${tempInputFile}" -o "${outputPath}"`;

      // 添加配置参数
      if (config.theme) {
        command += ` -t ${config.theme}`;
      }
      if (config.backgroundColor) {
        command += ` -b ${config.backgroundColor}`;
      }
      if (config.width) {
        command += ` -w ${config.width}`;
      }
      if (config.height) {
        command += ` -H ${config.height}`;
      }

      // 执行命令
      await execAsync(command);

      // 验证输出文件是否存在
      if (!(await fileExists(outputPath))) {
        throw new Error('Failed to generate image file');
      }

    } finally {
      // 清理临时文件
      try {
        await fs.remove(tempInputFile);
      } catch (error) {
        console.warn(`Failed to clean up temp file: ${error}`);
      }
    }
  }

  /**
   * 批量处理 Mermaid 代码
   */
  async batchRender(requests: Array<RenderRequest | SaveRequest>): Promise<Array<RenderResponse | SaveResponse>> {
    const results = await Promise.allSettled(
      requests.map(request => {
        if ('localPath' in request) {
          return this.saveMermaid(request as SaveRequest);
        } else {
          return this.renderMermaid(request as RenderRequest);
        }
      })
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: `Batch processing failed: ${result.reason}`
        };
      }
    });
  }
}