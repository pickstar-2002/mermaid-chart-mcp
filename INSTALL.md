# 安装和使用指南

## 快速开始

### 1. 全局安装（推荐）

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp
```

### 2. 在 AI 编辑器中配置

#### Cursor 配置
在 Cursor 的设置中添加 MCP 服务器配置：

```json
{
  "mcp": {
    "servers": {
      "mermaid-chart": {
        "command": "npx",
        "args": ["@pickstar-2002/mermaid-chart-mcp"]
      }
    }
  }
}
```

#### Claude Desktop 配置
在 `~/.claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp"]
    }
  }
}
```

#### WindSurf 配置
在 WindSurf 的 MCP 设置中添加：

```json
{
  "servers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp"]
    }
  }
}
```

### 3. 本地开发安装

```bash
# 克隆项目
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 测试运行
npm start
```

## 使用示例

### 基础渲染
```javascript
// 使用 renderMermaid 工具
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "format": "png",
  "theme": "default",
  "backgroundColor": "white",
  "width": 800,
  "height": 600
}
```

### 保存到本地
```javascript
// 使用 saveMermaid 工具
{
  "mermaidCode": "sequenceDiagram\n    Alice->>Bob: Hello Bob\n    Bob-->>Alice: Hello Alice",
  "localPath": "./diagrams",
  "filename": "sequence.png",
  "format": "png",
  "theme": "dark",
  "createDir": true
}
```

### 批量渲染
```javascript
// 使用 batchRenderMermaid 工具
{
  "items": [
    {
      "mermaidCode": "graph LR\n    A --> B",
      "localPath": "./output",
      "filename": "graph1.png"
    },
    {
      "mermaidCode": "pie title 数据分布\n    \"A\" : 386\n    \"B\" : 85",
      "format": "svg"
    }
  ],
  "theme": "forest",
  "backgroundColor": "transparent"
}
```

## 支持的主题

- `default` - 默认主题
- `dark` - 深色主题
- `forest` - 森林主题
- `neutral` - 中性主题
- `base` - 基础主题

## 支持的格式

- `png` - PNG 图片格式（默认）
- `svg` - SVG 矢量格式

## 故障排除

### 1. 安装问题
如果遇到安装问题，请确保：
- Node.js 版本 >= 18.0.0
- 网络连接正常
- 有足够的磁盘空间

### 2. 渲染问题
如果图表渲染失败：
- 检查 Mermaid 语法是否正确
- 确保有足够的内存
- 检查网络连接（用于上传图片）

### 3. 权限问题
如果无法保存文件：
- 检查目标目录的写入权限
- 确保路径存在或设置 `createDir: true`

## 更新

```bash
# 更新到最新版本
npm update -g @pickstar-2002/mermaid-chart-mcp
```

## 卸载

```bash
# 卸载全局安装
npm uninstall -g @pickstar-2002/mermaid-chart-mcp