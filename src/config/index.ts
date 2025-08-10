import { ServerConfig } from '../types';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * 默认服务器配置
 */
export const DEFAULT_CONFIG: ServerConfig = {
  serverPort: 3000,
  serverHost: 'localhost',
  enableStaticServer: true,
  defaultOutputDir: path.join(process.cwd(), 'output'),
  tempDir: path.join(os.tmpdir(), 'mermaid-chart-mcp'),
  imageHosting: {
    type: 'imgur',
    apiKey: process.env.IMGUR_CLIENT_ID || '',
  },
};

/**
 * 配置管理器
 */
export class ConfigManager {
  private config: ServerConfig;

  constructor(initialConfig?: Partial<ServerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
  }

  /**
   * 获取配置
   */
  getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof ServerConfig>(key: K): ServerConfig[K] {
    return this.config[key];
  }

  /**
   * 设置特定配置项
   */
  set<K extends keyof ServerConfig>(key: K, value: ServerConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * 验证配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.serverPort && (this.config.serverPort < 1 || this.config.serverPort > 65535)) {
      errors.push('Server port must be between 1 and 65535');
    }

    if (this.config.imageHosting?.type === 'custom' && !this.config.imageHosting.uploadUrl) {
      errors.push('Custom image hosting requires uploadUrl');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 全局配置实例
 */
export const configManager = new ConfigManager();