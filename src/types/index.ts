/**
 * 服务器配置接口
 */
export interface ServerConfig {
  serverPort: number;
  serverHost: string;
  enableStaticServer: boolean;
  defaultOutputDir: string;
  tempDir: string;
  imageHosting: {
    type: 'imgur' | 'custom';
    apiKey?: string;
    uploadUrl?: string;
  };
}

/**
 * Mermaid 渲染选项
 */
export interface MermaidRenderOptions {
  format?: 'png' | 'svg';
  outputPath?: string;
  generateOnlineLink?: boolean;
  dpi?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

/**
 * Mermaid 渲染请求
 */
export interface MermaidRenderRequest {
  code: string;
  options?: MermaidRenderOptions;
}

/**
 * 批量渲染请求
 */
export interface BatchMermaidRenderRequest {
  requests: MermaidRenderRequest[];
  globalOptions?: MermaidRenderOptions;
}

/**
 * 渲染结果
 */
export interface MermaidRenderResult {
  success: boolean;
  filePath?: string;
  onlineUrl?: string;
  error?: string;
  format?: string;
  size?: {
    width: number;
    height: number;
  };
  renderTime?: number;
}

/**
 * 批量渲染结果
 */
export interface BatchMermaidRenderResult {
  results: MermaidRenderResult[];
  successCount: number;
  failureCount: number;
  totalTime: number;
}