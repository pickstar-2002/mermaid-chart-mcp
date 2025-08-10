import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs-extra';
import { configManager } from '../config/index.js';

/**
 * 图床上传服务
 */
export class ImageHostingService {
  /**
   * 上传图片到图床
   */
  async uploadImage(filePath: string): Promise<string> {
    const config = configManager.getConfig();
    
    if (!config.imageHosting) {
      throw new Error('Image hosting not configured');
    }

    switch (config.imageHosting.type) {
      case 'imgur':
        return this.uploadToImgur(filePath);
      case 'sm.ms':
        return this.uploadToSmMs(filePath);
      case 'custom':
        return this.uploadToCustom(filePath);
      default:
        throw new Error(`Unsupported image hosting type: ${config.imageHosting.type}`);
    }
  }

  /**
   * 上传到 Imgur
   */
  private async uploadToImgur(filePath: string): Promise<string> {
    const config = configManager.getConfig();
    const apiKey = config.imageHosting?.apiKey;

    if (!apiKey) {
      throw new Error('Imgur API key not configured');
    }

    try {
      const imageBuffer = await fs.readFile(filePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await axios.post(
        'https://api.imgur.com/3/image',
        {
          image: base64Image,
          type: 'base64',
        },
        {
          headers: {
            Authorization: `Client-ID ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data.link;
      } else {
        throw new Error(`Imgur upload failed: ${response.data.data.error}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        throw new Error(`Imgur upload failed: ${axiosError.response?.data?.data?.error || axiosError.message}`);
      }
      throw error;
    }
  }

  /**
   * 上传到 SM.MS
   */
  private async uploadToSmMs(filePath: string): Promise<string> {
    const config = configManager.getConfig();
    const apiKey = config.imageHosting?.apiKey;

    try {
      const formData = new FormData();
      formData.append('smfile', fs.createReadStream(filePath));

      const headers: Record<string, string> = {
        ...formData.getHeaders(),
      };

      if (apiKey) {
        headers['Authorization'] = apiKey;
      }

      const response = await axios.post('https://sm.ms/api/v2/upload', formData, {
        headers,
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(`SM.MS upload failed: ${response.data.message}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        throw new Error(`SM.MS upload failed: ${axiosError.response?.data?.message || axiosError.message}`);
      }
      throw error;
    }
  }

  /**
   * 上传到自定义图床
   */
  private async uploadToCustom(filePath: string): Promise<string> {
    const config = configManager.getConfig();
    const uploadUrl = config.imageHosting?.uploadUrl;
    const headers = config.imageHosting?.headers || {};

    if (!uploadUrl) {
      throw new Error('Custom upload URL not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          ...headers,
        },
      });

      // 假设自定义图床返回格式为 { url: string }
      // 用户可以根据实际情况调整
      if (response.data.url) {
        return response.data.url;
      } else {
        throw new Error('Custom upload failed: No URL in response');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        throw new Error(`Custom upload failed: ${axiosError.response?.data?.message || axiosError.message}`);
      }
      throw error;
    }
  }

  /**
   * 批量上传图片
   */
  async uploadImages(filePaths: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const filePath of filePaths) {
      try {
        const url = await this.uploadImage(filePath);
        results.push(url);
      } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
        results.push(''); // 失败时推入空字符串
      }
    }

    return results;
  }
}