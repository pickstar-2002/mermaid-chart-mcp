/**
 * Mermaid Chart MCP 类型定义
 */

export interface MermaidRenderOptions {
  /** Mermaid 图表代码 */
  mermaidCode: string;
  /** 输出格式，默认为 png */
  format?: 'png' | 'svg';
  /** 主题，如 default, dark, forest 等 */
  theme?: string;
  /** 背景颜色，如 white, transparent 等 */
  backgroundColor?: string;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
}

export interface SaveMermaidOptions extends MermaidRenderOptions {
  /** 本地保存目录路径 */
  localPath: string;
  /** 文件名（可选，不指定则自动生成） */
  filename?: string;
  /** 如果目录不存在是否创建，默认为 true */
  createDir?: boolean;
}

export interface BatchRenderItem extends Omit<SaveMermaidOptions, 'localPath'> {
  /** 本地保存路径（可选） */
  localPath?: string;
}

export interface BatchRenderOptions {
  /** 要处理的 Mermaid 代码列表 */
  items: BatchRenderItem[];
  /** 全局主题设置 */
  theme?: string;
  /** 全局背景颜色设置 */
  backgroundColor?: string;
}

export interface RenderResult {
  /** 在线访问 URL */
  url: string;
  /** 本地文件路径（如果保存到本地） */
  localPath?: string;
  /** 渲染成功状态 */
  success: boolean;
  /** 错误信息（如果有） */
  error?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 图片尺寸 */
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface BatchRenderResult {
  /** 批量处理结果 */
  results: RenderResult[];
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failureCount: number;
  /** 总处理时间（毫秒） */
  totalTime: number;
}

export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 图表类型 */
  chartType?: string;
}

export interface UploadResponse {
  /** 上传成功状态 */
  success: boolean;
  /** 在线访问 URL */
  url: string;
  /** 文件 ID */
  fileId?: string;
  /** 错误信息 */
  error?: string;
}