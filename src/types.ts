export interface RenderRequest {
  mermaidCode: string;
  format?: 'png' | 'svg';
  theme?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface SaveRequest extends RenderRequest {
  localPath: string;
  filename?: string;
  createDir?: boolean;
}

export interface RenderResponse {
  success: boolean;
  imageUrl?: string;
  imageId?: string;
  format?: string;
  error?: string;
}

export interface SaveResponse extends RenderResponse {
  localFilePath?: string;
}

export interface BatchRenderItem {
  mermaidCode: string;
  format?: 'png' | 'svg';
  localPath?: string;
  filename?: string;
  theme?: string;
  backgroundColor?: string;
}

export interface BatchRenderRequest {
  items: BatchRenderItem[];
  theme?: string;
  backgroundColor?: string;
}

export interface BatchRenderResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    imageUrl?: string;
    localFilePath?: string;
    error?: string;
  }>;
  error?: string;
}

export interface MermaidConfig {
  theme?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  puppeteerConfig?: {
    headless?: boolean;
    args?: string[];
  };
}