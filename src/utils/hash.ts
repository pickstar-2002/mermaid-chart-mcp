import { createHash } from 'crypto';

/**
 * 生成 Mermaid 代码的 MD5 哈希值
 */
export function generateHash(mermaidCode: string, format: string = 'png'): string {
  const content = `${mermaidCode}-${format}`;
  return createHash('md5').update(content).digest('hex');
}

/**
 * 生成唯一的文件名
 */
export function generateUniqueFilename(extension: string = 'png'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}.${extension}`;
}