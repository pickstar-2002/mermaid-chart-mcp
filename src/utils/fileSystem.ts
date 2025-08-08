import fs from 'fs-extra';
import path from 'path';

/**
 * 确保目录存在，如果不存在则创建
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查目录权限
 */
export async function checkDirectoryPermissions(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全地复制文件到目标路径
 */
export async function safeCopyFile(sourcePath: string, targetPath: string): Promise<void> {
  try {
    const targetDir = path.dirname(targetPath);
    await ensureDirectory(targetDir);
    await fs.copy(sourcePath, targetPath);
  } catch (error) {
    throw new Error(`Failed to copy file from ${sourcePath} to ${targetPath}: ${error}`);
  }
}

/**
 * 生成安全的文件路径
 */
export function generateSafeFilePath(basePath: string, filename: string): string {
  // 清理文件名，移除危险字符
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return path.join(basePath, safeFilename);
}