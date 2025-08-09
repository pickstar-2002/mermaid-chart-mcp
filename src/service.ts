/**
 * Mermaid Chart 服务
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MermaidRenderer } from './renderer';
import { FileUploader } from './uploader';
import { validateRenderOptions, validateSaveOptions, validateBatchOptions } from './validator';
import {
  MermaidRenderOptions,
  SaveMermaidOptions,
  BatchRenderOptions,
  RenderResult,
  BatchRenderResult
} from './types';

export class MermaidChartService {
  private renderer: MermaidRenderer;
  private uploader: FileUploader;

  constructor() {
    this.renderer = new MermaidRenderer();
    this.uploader = new FileUploader();
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    await this.renderer.initialize();
  }

  /**
   * 渲染 Mermaid 代码为图片并返回在线访问 URL
   */
  async renderMermaid(options: MermaidRenderOptions): Promise<RenderResult> {
    const startTime = Date.now();

    try {
      // 验证输入参数
      const validation = validateRenderOptions(options);
      if (!validation.isValid) {
        return {
          url: '',
          success: false,
          error: `参数验证失败: ${validation.errors.join(', ')}`
        };
      }

      // 渲染图表
      const buffer = await this.renderer.render(options);
      const dimensions = await this.renderer.getDimensions();

      // 生成文件名
      const filename = this.uploader.generateFilename(options.format || 'png');

      // 上传到在线服务
      const uploadResult = await this.uploader.uploadFile(buffer, filename);

      if (!uploadResult.success) {
        return {
          url: '',
          success: false,
          error: uploadResult.error
        };
      }

      return {
        url: uploadResult.url,
        success: true,
        fileSize: buffer.length,
        dimensions: dimensions || undefined
      };

    } catch (error) {
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 渲染 Mermaid 代码并保存到指定本地路径，同时返回在线 URL
   */
  async saveMermaid(options: SaveMermaidOptions): Promise<RenderResult> {
    try {
      // 验证输入参数
      const validation = validateSaveOptions(options);
      if (!validation.isValid) {
        return {
          url: '',
          success: false,
          error: `参数验证失败: ${validation.errors.join(', ')}`
        };
      }

      // 渲染图表
      const buffer = await this.renderer.render(options);
      const dimensions = await this.renderer.getDimensions();

      // 确保目录存在
      if (options.createDir !== false) {
        await fs.ensureDir(options.localPath);
      }

      // 生成文件名
      const format = options.format || 'png';
      const filename = options.filename || `mermaid-${Date.now()}-${uuidv4().substring(0, 8)}.${format}`;
      const localFilePath = path.join(options.localPath, filename);

      // 保存到本地
      await fs.writeFile(localFilePath, buffer);

      // 上传到在线服务
      const uploadResult = await this.uploader.uploadFile(buffer, filename);

      return {
        url: uploadResult.success ? uploadResult.url : '',
        localPath: localFilePath,
        success: true,
        fileSize: buffer.length,
        dimensions: dimensions || undefined,
        error: uploadResult.success ? undefined : `在线上传失败: ${uploadResult.error}`
      };

    } catch (error) {
      return {
        url: '',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量处理多个 Mermaid 代码块
   */
  async batchRenderMermaid(options: BatchRenderOptions): Promise<BatchRenderResult> {
    const startTime = Date.now();

    try {
      // 验证输入参数
      const validation = validateBatchOptions(options);
      if (!validation.isValid) {
        return {
          results: [],
          successCount: 0,
          failureCount: 1,
          totalTime: Date.now() - startTime
        };
      }

      const results: RenderResult[] = [];
      let successCount = 0;
      let failureCount = 0;

      // 并发处理（限制并发数量以避免资源耗尽）
      const concurrency = Math.min(options.items.length, 5);
      const chunks = this.chunkArray(options.items, concurrency);

      for (const chunk of chunks) {
        const promises = chunk.map(async (item) => {
          const renderOptions: MermaidRenderOptions = {
            mermaidCode: item.mermaidCode,
            format: item.format || 'png',
            theme: item.theme || options.theme,
            backgroundColor: item.backgroundColor || options.backgroundColor,
            width: item.width,
            height: item.height
          };

          if (item.localPath) {
            const saveOptions: SaveMermaidOptions = {
              ...renderOptions,
              localPath: item.localPath,
              filename: item.filename,
              createDir: item.createDir
            };
            return await this.saveMermaid(saveOptions);
          } else {
            return await this.renderMermaid(renderOptions);
          }
        });

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);

        // 统计成功和失败数量
        chunkResults.forEach(result => {
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        });
      }

      return {
        results,
        successCount,
        failureCount,
        totalTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        results: [],
        successCount: 0,
        failureCount: options.items.length,
        totalTime: Date.now() - startTime
      };
    }
  }

  /**
   * 关闭服务
   */
  async close(): Promise<void> {
    await this.renderer.close();
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}