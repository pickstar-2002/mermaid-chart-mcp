/**
 * Mermaid Chart MCP Server Types
 */

export interface MermaidRenderOptions {
  /** 输出格式 */
  format?: 'png' | 'svg';
  /** 输出文件路径 */
  outputPath?: string;
  /** 是否生成在线链接 */
  generateOnlineLink?: boolean;
  /** DPI 设置（仅对 PNG 有效） */
  dpi?: number;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 主题 */
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

export interface MermaidRenderRequest {
  /** Mermaid 代码 */
  code: string;
  /** 渲染选项 */
  options?: MermaidRenderOptions;
}

export interface BatchMermaidRenderRequest {
  /** 多个 Mermaid 渲染请求 */
  requests: MermaidRenderRequest[];
  /** 全局选项（会被单个请求的选项覆盖） */
  globalOptions?: MermaidRenderOptions;
}

export interface MermaidRenderResult {
  /** 原始 Mermaid 代码 */
  originalCode: string;
  /** 是否成功 */
  success: boolean;
  /** 本地文件路径 */
  filePath?: string;
  /** 在线链接 */
  onlineUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 渲染耗时（毫秒） */
  renderTime?: number;
}

export interface BatchMermaidRenderResult {
  /** 批量处理结果 */
  results: MermaidRenderResult[];
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failureCount: number;
  /** 总耗时（毫秒） */
  totalTime: number;
}

export interface ServerConfig {
  /** 静态文件服务器端口 */
  serverPort?: number;
  /** 静态文件服务器主机 */
  serverHost?: string;
  /** 是否启用静态文件服务器 */
  enableStaticServer?: boolean;
  /** 图床配置 */
  imageHosting?: {
    /** 图床类型 */
    type: 'imgur' | 'sm.ms' | 'custom';
    /** API Key */
    apiKey?: string;
    /** 自定义上传 URL */
    uploadUrl?: string;
    /** 自定义请求头 */
    headers?: Record<string, string>;
  };
  /** 默认输出目录 */
  defaultOutputDir?: string;
  /** 临时文件目录 */
  tempDir?: string;
}

export interface McpError {
  code: number;
  message: string;
  data?: any;
}

export interface McpRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface McpResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: McpError;
}

export interface McpNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}