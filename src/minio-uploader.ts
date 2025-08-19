import * as Minio from 'minio';
import fs from 'fs-extra';
import { basename, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface MinIOConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  size?: number;
  expiresAt?: Date; // 新增：文件过期时间
  expiryDays?: number; // 新增：有效期天数
}

export interface UploadOptions {
  customFileName?: string;
  expiryDays?: number; // 新增：文件有效期（天数），默认7天，最大30天
}

/**
 * MinIO文件上传服务
 */
export class MinIOUploader {
  private client: Minio.Client;
  private bucketName: string;
  private config: MinIOConfig;

  constructor(config: MinIOConfig) {
    this.config = config;
    this.bucketName = config.bucketName;
    
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  /**
   * 初始化MinIO连接，确保存储桶存在
   */
  async initialize(): Promise<void> {
    try {
      // 检查存储桶是否存在
      const bucketExists = await this.client.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        // 创建存储桶
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`已创建存储桶: ${this.bucketName}`);
        
        // 设置存储桶策略为公开读取
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            }
          ]
        };
        
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`已设置存储桶 ${this.bucketName} 为公开读取`);
      }
    } catch (error) {
      console.error('MinIO初始化失败:', error);
      throw new Error(`MinIO初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 上传文件到MinIO
   */
  async uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      // 处理参数
      const { customFileName, expiryDays: inputExpiryDays } = options || {};
      
      // 验证和处理有效期：默认7天，最大30天
      let expiryDays = inputExpiryDays || 7;
      if (expiryDays > 30) {
        expiryDays = 30;
        console.warn(`有效期超过30天，已调整为30天`);
      }
      if (expiryDays < 1) {
        expiryDays = 7;
        console.warn(`有效期小于1天，已调整为7天`);
      }
      
      // 计算过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
      
      // 检查文件是否存在
      if (!await fs.pathExists(filePath)) {
        return {
          success: false,
          error: `文件不存在: ${filePath}`
        };
      }

      // 获取文件信息
      const fileStats = await fs.stat(filePath);
      const originalName = basename(filePath);
      const fileExtension = extname(originalName);
      
      // 生成唯一的文件名
      const fileName = customFileName || `mermaid-${uuidv4()}${fileExtension}`;
      
      // 确定MIME类型
      const mimeType = this.getMimeType(fileExtension);
      
      // 读取文件
      const fileStream = fs.createReadStream(filePath);
      
      // 上传文件
      const uploadInfo = await this.client.putObject(
        this.bucketName,
        fileName,
        fileStream,
        fileStats.size,
        {
          'Content-Type': mimeType,
          'Cache-Control': `max-age=${expiryDays * 24 * 60 * 60}`, // 根据有效期设置缓存
          'Expires': expiresAt.toISOString(), // 设置过期时间
          'X-Expires-Days': expiryDays.toString(), // 自定义元数据：有效期天数
          'X-Upload-Date': new Date().toISOString(), // 自定义元数据：上传时间
        }
      );

      // 生成访问URL
      const publicUrl = this.getPublicUrl(fileName);

      console.log(`文件上传成功: ${fileName}, URL: ${publicUrl}, 有效期: ${expiryDays}天`);

      return {
        success: true,
        url: publicUrl,
        fileName: fileName,
        size: fileStats.size,
        expiresAt: expiresAt,
        expiryDays: expiryDays
      };

    } catch (error) {
      console.error('文件上传失败:', error);
      return {
        success: false,
        error: `上传失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 根据文件扩展名获取MIME类型
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.webp': 'image/webp'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 生成公开访问URL
   */
  private getPublicUrl(fileName: string): string {
    const protocol = this.config.useSSL ? 'https' : 'http';
    const port = this.config.port === 80 || this.config.port === 443 ? '' : `:${this.config.port}`;
    return `${protocol}://${this.config.endPoint}${port}/${this.bucketName}/${fileName}`;
  }

  /**
   * 删除文件
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucketName, fileName);
      console.log(`文件删除成功: ${fileName}`);
      return true;
    } catch (error) {
      console.error('文件删除失败:', error);
      return false;
    }
  }

  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(): Promise<{ deletedCount: number; errors: string[] }> {
    const deletedFiles: string[] = [];
    const errors: string[] = [];
    
    try {
      const stream = this.client.listObjects(this.bucketName);
      const currentTime = new Date();
      
      return new Promise((resolve) => {
        const filesToCheck: string[] = [];
        
        stream.on('data', (obj) => {
          if (obj.name) {
            filesToCheck.push(obj.name);
          }
        });
        
        stream.on('end', async () => {
          // 检查每个文件的元数据
          for (const fileName of filesToCheck) {
            try {
              const stat = await this.client.statObject(this.bucketName, fileName);
              const expiresHeader = stat.metaData?.['expires'];
              
              if (expiresHeader) {
                const expiresAt = new Date(expiresHeader);
                if (currentTime > expiresAt) {
                  // 文件已过期，删除它
                  const deleted = await this.deleteFile(fileName);
                  if (deleted) {
                    deletedFiles.push(fileName);
                    console.log(`已删除过期文件: ${fileName}`);
                  }
                }
              }
            } catch (error) {
              errors.push(`检查文件 ${fileName} 失败: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          
          resolve({
            deletedCount: deletedFiles.length,
            errors: errors
          });
        });
        
        stream.on('error', (error) => {
          errors.push(`列举文件失败: ${error.message}`);
          resolve({
            deletedCount: deletedFiles.length,
            errors: errors
          });
        });
      });
    } catch (error) {
      return {
        deletedCount: 0,
        errors: [`清理过程失败: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * 列出所有文件
   */
  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const stream = this.client.listObjects(this.bucketName, prefix);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });
        
        stream.on('end', () => {
          resolve(files);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('文件列表获取失败:', error);
      return [];
    }
  }

  /**
   * 获取文件预签名URL (有时效性)
   */
  async getPresignedUrl(fileName: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      return await this.client.presignedGetObject(this.bucketName, fileName, expiry);
    } catch (error) {
      console.error('预签名URL生成失败:', error);
      throw error;
    }
  }
}

/**
 * 创建默认MinIO配置
 */
export function createDefaultMinIOConfig(): MinIOConfig {
  return {
    endPoint: 'minio.pickstar.site',
    port: 80,
    useSSL: false,
    accessKey: 'pickstar',
    secretKey: 'pickstar-khazix',
    bucketName: 'mermaid-charts'
  };
}
