/**
 * 文件上传服务
 */

import axios from 'axios';
import FormData from 'form-data';
import { UploadResponse } from './types';

export class FileUploader {
  private readonly uploadUrl: string;

  constructor() {
    // 使用免费的图片托管服务
    this.uploadUrl = 'https://api.imgbb.com/1/upload';
  }

  /**
   * 上传文件到图片托管服务
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // 使用免费的 imgbb API key (这里应该从环境变量获取)
      const apiKey = process.env.IMGBB_API_KEY || '7d8c9e1f2a3b4c5d6e7f8g9h0i1j2k3l';
      
      formData.append('key', apiKey);
      formData.append('image', buffer.toString('base64'));
      formData.append('name', filename);

      const response = await axios.post(this.uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      if (response.data.success) {
        return {
          success: true,
          url: response.data.data.url,
          fileId: response.data.data.id
        };
      } else {
        return {
          success: false,
          url: '',
          error: response.data.error?.message || '上传失败'
        };
      }
    } catch (error) {
      // 如果主要服务失败，尝试备用方案
      return await this.uploadToBackupService(buffer, filename);
    }
  }

  /**
   * 备用上传服务
   */
  private async uploadToBackupService(buffer: Buffer, filename: string): Promise<UploadResponse> {
    try {
      // 使用 0x0.st 作为备用服务
      const formData = new FormData();
      formData.append('file', buffer, filename);

      const response = await axios.post('https://0x0.st', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      if (response.status === 200 && response.data) {
        const url = response.data.trim();
        return {
          success: true,
          url: url
        };
      } else {
        throw new Error('备用服务上传失败');
      }
    } catch (error) {
      // 最后的备用方案：使用临时文件服务
      return await this.uploadToTempService(buffer, filename);
    }
  }

  /**
   * 临时文件服务
   */
  private async uploadToTempService(buffer: Buffer, filename: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', buffer, filename);

      const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          url: response.data.data.url
        };
      } else {
        throw new Error('临时文件服务上传失败');
      }
    } catch (error) {
      return {
        success: false,
        url: '',
        error: `所有上传服务都失败了: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 生成唯一文件名
   */
  generateFilename(format: string = 'png'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `mermaid-${timestamp}-${random}.${format}`;
  }
}