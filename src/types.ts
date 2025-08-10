export interface RenderOptions {
  format?: 'png' | 'svg';
  outputPath?: string;
  generateOnlineLink?: boolean;
  dpi?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

export interface RenderRequest {
  code: string;
  options?: RenderOptions;
}

export interface RenderResult {
  success: boolean;
  outputPath?: string;
  onlineLink?: string;
  error?: string;
  format?: string;
  size?: {
    width: number;
    height: number;
  };
}

export interface BatchRenderRequest {
  requests: RenderRequest[];
  globalOptions?: RenderOptions;
}

export interface BatchRenderResult {
  results: RenderResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
  outputDir: string;
  baseUrl: string;
}