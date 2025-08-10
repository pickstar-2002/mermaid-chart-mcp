import { configManager } from '../config/index.js';
import fs from 'fs-extra';
import * as path from 'path';

/**
 * 图床服务
 */
export class ImageHostingService {
  /**
   * 上传图片到图床
   */
  async uploadImage(filePath: string): Promise<string> {
    const config = configManager.get('imageHosting');

    switch (config.type) {
      case 'imgur':
        return this.uploadToImgur(filePath);
      case 'custom':
        return this.uploadToCustom(filePath);
      default:
        throw new Error(`Unsupported image hosting type: ${config.type}`);
    }
  }

  /**
   * 上传到 Imgur
   */
  private async uploadToImgur(filePath: string): Promise<string> {
    const config = configManager.get('imageHosting');
    
    if (!config.apiKey) {
      throw new Error('Imgur API key not configured');
    }

    try {
      // 读取文件
      const imageBuffer = await fs.readFile(filePath);
      const base64Image = imageBuffer.toString('base64');

      // 发送到 Imgur API
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          type: 'base64',
        }),
      });

      if (!response.ok) {
        throw new Error(`Imgur API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.success) {
        throw new Error(`Imgur upload failed: ${data.data?.error || 'Unknown error'}`);
      }

      return data.data.link;
    } catch (error) {
      throw new Error(`Failed to upload to Imgur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 上传到自定义图床
   */
  private async uploadToCustom(filePath: string): Promise<string> {
    const config = configManager.get('imageHosting');
    
    if (!config.uploadUrl) {
      throw new Error('Custom upload URL not configured');
    }

    try {
      // 创建 FormData
      const formData = new FormData();
      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      
      // 创建 Blob 对象
      const blob = new Blob([fileBuffer], { 
        type: this.getMimeType(fileName) 
      });
      
      formData.append('file', blob, fileName);

      // 发送请求
      const response = await fetch(config.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Custom upload API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      // 假设自定义API返回 { url: "..." } 格式
      if (!data.url) {
        throw new Error('Custom upload API did not return URL');
      }

      return data.url;
    } catch (error) {
      throw new Error(`Failed to upload to custom service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取MIME类型
   */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.svg':
        return 'image/svg+xml';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}