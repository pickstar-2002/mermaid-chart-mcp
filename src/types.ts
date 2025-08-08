export interface RenderOptions {
  mermaidCode: string;
  format?: 'png' | 'svg';
  theme?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface SaveOptions extends RenderOptions {
  localPath: string;
  filename?: string;
  createDir?: boolean;
}

export interface BatchRenderItem extends RenderOptions {
  localPath?: string;
  filename?: string;
}

export interface BatchRenderOptions {
  items: BatchRenderItem[];
  theme?: string;
  backgroundColor?: string;
}

export interface RenderResult {
  onlineUrl: string;
  format: string;
  width: number;
  height: number;
  localPath?: string;
}

export interface BatchRenderResult {
  success: boolean;
  onlineUrl?: string;
  localPath?: string;
  error?: string;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}