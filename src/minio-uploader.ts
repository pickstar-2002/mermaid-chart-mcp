import * as Minio from 'minio';
import * as https from 'https';
import * as http from 'http';
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
  region?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  size?: number;
  expiresAt?: Date;
  expiryDays?: number;
}

export interface UploadOptions {
  customFileName?: string;
  expiryDays?: number;
  retryCount?: number;
}

/**
 * MinIO文件上传服务 - 针对nginx反向代理优化
 */
export class MinIOUploader {
  private client: Minio.Client;
  private bucketName: string;
  private config: MinIOConfig;

  constructor(config: MinIOConfig) {
    this.config = config;
    this.bucketName = config.bucketName;
    
    console.log('MinIO配置:', {
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      bucketName: config.bucketName,
      region: config.region
    });
    
    // 简化配置，先不使用自定义Agent
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region || 'us-east-1',
    });
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(`正在测试MinIO连接: ${this.config.useSSL ? 'https' : 'http'}://${this.config.endPoint}:${this.config.port}`);
      console.log(`访问密钥: ${this.config.accessKey}`);
      console.log(`存储桶: ${this.config.bucketName}`);
      
      // 添加超时控制
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('连接超时 (30秒)')), 30000);
      });
      
      const connectPromise = this.client.listBuckets();
      
      const buckets = await Promise.race([connectPromise, timeoutPromise]) as any[];
      console.log('MinIO连接测试成功，可用存储桶:', buckets.map(b => b.name));
      return true;
    } catch (error) {
      console.error('MinIO连接测试失败:', error);
      console.error('错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        syscall: (error as any)?.syscall,
        hostname: (error as any)?.hostname,
        config: {
          endPoint: this.config.endPoint,
          port: this.config.port,
          useSSL: this.config.useSSL,
          bucketName: this.config.bucketName
        }
      });
      return false;
    }
  }

  /**
   * 初始化MinIO连接，确保存储桶存在
   */
  async initialize(): Promise<void> {
    try {
      console.log('开始初始化MinIO连接...');
      
      // 先测试连接
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('无法连接到MinIO服务器');
      }

      console.log(`检查存储桶是否存在: ${this.bucketName}`);
      // 检查存储桶是否存在
      const bucketExists = await this.client.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        console.log(`存储桶不存在，正在创建: ${this.bucketName}`);
        // 创建存储桶
        await this.client.makeBucket(this.bucketName, this.config.region || 'us-east-1');
        console.log(`已创建存储桶: ${this.bucketName}`);
        
        // 等待一下确保存储桶创建完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        
        try {
          console.log('正在设置存储桶策略...');
          await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
          console.log(`已设置存储桶 ${this.bucketName} 为公开读取`);
        } catch (policyError) {
          console.warn('设置存储桶策略失败，但不影响基本功能:', policyError);
        }
      } else {
        console.log(`存储桶 ${this.bucketName} 已存在`);
      }
      
      console.log('MinIO初始化成功！');
    } catch (error) {
      console.error('MinIO初始化失败:', error);
      console.error('错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config: {
          endPoint: this.config.endPoint,
          port: this.config.port,
          useSSL: this.config.useSSL,
          bucketName: this.config.bucketName,
          region: this.config.region
        }
      });
      throw new Error(`MinIO初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 带重试机制的上传文件
   */
  async uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult> {
    const { retryCount = 3 } = options || {};
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`开始上传文件 (尝试 ${attempt}/${retryCount}): ${filePath}`);
        const result = await this.doUpload(filePath, options);
        
        if (result.success) {
          console.log(`文件上传成功: ${result.fileName}`);
          return result;
        }
        
        if (attempt === retryCount) {
          return result;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        
      } catch (error) {
        console.error(`上传尝试 ${attempt} 失败:`, error);
        
        if (attempt === retryCount) {
          return {
            success: false,
            error: `所有上传尝试都失败: ${error instanceof Error ? error.message : String(error)}`
          };
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return {
      success: false,
      error: '未知错误'
    };
  }

  /**
   * 执行实际的上传操作
   */
  private async doUpload(filePath: string, options?: UploadOptions): Promise<UploadResult> {
    try {
      console.log(`开始上传文件: ${filePath}`);
      
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
        console.error(`文件不存在: ${filePath}`);
        return {
          success: false,
          error: `文件不存在: ${filePath}`
        };
      }

      // 获取文件信息
      const fileStats = await fs.stat(filePath);
      const originalName = basename(filePath);
      const fileExtension = extname(originalName);
      
      console.log(`文件信息: ${originalName}, 大小: ${fileStats.size} bytes`);
      
      // 生成唯一的文件名
      const fileName = customFileName || `mermaid-${uuidv4()}${fileExtension}`;
      console.log(`生成文件名: ${fileName}`);
      
      // 确定MIME类型
      const mimeType = this.getMimeType(fileExtension);
      console.log(`MIME类型: ${mimeType}`);
      
      // 读取文件
      const fileStream = fs.createReadStream(filePath);
      
      console.log(`正在上传到存储桶 ${this.bucketName}...`);
      
      // 上传文件 - 添加更多元数据
      const uploadInfo = await this.client.putObject(
        this.bucketName,
        fileName,
        fileStream,
        fileStats.size,
        {
          'Content-Type': mimeType,
          'Cache-Control': `max-age=${expiryDays * 24 * 60 * 60}`,
          'Expires': expiresAt.toISOString(),
          'X-Expires-Days': expiryDays.toString(),
          'X-Upload-Date': new Date().toISOString(),
          'X-Original-Name': originalName,
          'X-File-Size': fileStats.size.toString(),
        }
      );

      console.log('上传完成，ETag:', uploadInfo.etag);

      // 生成访问URL
      const publicUrl = this.getPublicUrl(fileName);
      console.log(`生成访问URL: ${publicUrl}`);

      // 验证上传是否成功
      try {
        console.log('验证文件是否上传成功...');
        const objStat = await this.client.statObject(this.bucketName, fileName);
        console.log(`文件上传并验证成功: ${fileName}, 大小: ${objStat.size}, URL: ${publicUrl}, 有效期: ${expiryDays}天`);
      } catch (verifyError) {
        console.warn('上传后验证失败，但文件可能已上传成功:', verifyError);
      }

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
      console.error('上传错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        statusCode: (error as any)?.statusCode,
        region: (error as any)?.region,
        bucketName: this.bucketName
      });
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
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.ico': 'image/x-icon'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 生成公开访问URL
   */
  private getPublicUrl(fileName: string): string {
    const protocol = this.config.useSSL ? 'https' : 'http';
    // nginx反向代理通常使用标准端口，不需要指定端口号
    const port = (this.config.port === 80 || this.config.port === 443) ? '' : `:${this.config.port}`;
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

  /**
   * 获取文件信息
   */
  async getFileInfo(fileName: string): Promise<any> {
    try {
      const stat = await this.client.statObject(this.bucketName, fileName);
      return {
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        metaData: stat.metaData
      };
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<any> {
    try {
      const buckets = await this.client.listBuckets();
      return {
        endpoint: this.config.endPoint,
        buckets: buckets.map(b => ({ name: b.name, creationDate: b.creationDate })),
        currentBucket: this.bucketName,
        region: this.config.region
      };
    } catch (error) {
      console.error('获取服务器信息失败:', error);
      return null;
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(filePaths: string[], options?: UploadOptions): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const filePath of filePaths) {
      try {
        const result = await this.uploadFile(filePath, options);
        results.push(result);
        
        // 每个文件之间稍微等待，避免过载
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          error: `批量上传失败: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    return results;
  }

  /**
   * 复制文件
   */
  async copyFile(sourceFileName: string, destFileName: string): Promise<boolean> {
    try {
      await this.client.copyObject(
        this.bucketName,
        destFileName,
        `${this.bucketName}/${sourceFileName}`
      );
      console.log(`文件复制成功: ${sourceFileName} -> ${destFileName}`);
      return true;
    } catch (error) {
      console.error('文件复制失败:', error);
      return false;
    }
  }

  /**
   * 设置文件标签
   */
  async setFileTags(fileName: string, tags: { [key: string]: string }): Promise<boolean> {
    try {
      await this.client.setObjectTagging(this.bucketName, fileName, tags);
      console.log(`文件标签设置成功: ${fileName}`);
      return true;
    } catch (error) {
      console.error('设置文件标签失败:', error);
      return false;
    }
  }

  /**
   * 获取文件标签
   */
  async getFileTags(fileName: string): Promise<{ [key: string]: string } | null> {
    try {
      const tags = await this.client.getObjectTagging(this.bucketName, fileName);
      // 将 MinIO 的 Tag[] 格式转换为 { [key: string]: string } 格式
      const tagMap: { [key: string]: string } = {};
      if (Array.isArray(tags)) {
        tags.forEach((tag: any) => {
          if (tag.Key && tag.Value) {
            tagMap[tag.Key] = tag.Value;
          }
        });
      }
      return tagMap;
    } catch (error) {
      console.error('获取文件标签失败:', error);
      return null;
    }
  }
}

/**
 * 创建针对您服务器的MinIO配置（生产环境 - 使用域名）
 */
export function createMinIOConfig(): MinIOConfig {
  return {
    endPoint: 'api.minio.pickstar.site',
    port: 443, // nginx反向代理使用443端口
    useSSL: true,
    accessKey: 'khazixminio',
    secretKey: 'khazixminio',
    bucketName: 'mermaid-charts',
    region: 'us-east-1'
  };
}

/**
 * 创建测试配置（调试环境 - 直连服务器IP）
 */
export function createDirectMinIOConfig(): MinIOConfig {
  return {
    endPoint: '124.222.230.153',
    port: 9000, // MinIO默认端口
    useSSL: false, // 不使用SSL，直连HTTP
    accessKey: 'khazix', // 修正为正确的用户名
    secretKey: 'khazixminio', // 密码保持不变
    bucketName: 'mermaid-charts',
    region: 'us-east-1'
  };
}

/**
 * 创建默认配置（兼容原有接口）
 */
export function createDefaultMinIOConfig(): MinIOConfig {
  return createDirectMinIOConfig(); // 回到直连配置，使用HTTP
}

// 使用示例：
/*
// 生产环境使用域名
const uploader = new MinIOUploader(createMinIOConfig());

// 调试环境直连IP
const directUploader = new MinIOUploader(createDirectMinIOConfig());

// 初始化
await uploader.initialize();

// 上传单个文件
const result = await uploader.uploadFile('/path/to/file.png', {
  expiryDays: 7,
  retryCount: 3,
  customFileName: 'my-custom-name.png'
});

// 批量上传
const batchResults = await uploader.uploadMultipleFiles([
  '/path/to/file1.png',
  '/path/to/file2.jpg'
], { expiryDays: 10 });

// 清理过期文件
const cleanupResult = await uploader.cleanupExpiredFiles();

// 获取服务器信息
const serverInfo = await uploader.getServerInfo();
*/
