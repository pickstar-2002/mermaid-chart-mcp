# 🎨 Mermaid Chart MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

> 🚀 A powerful Mermaid chart rendering service with MCP (Model Context Protocol) support for AI assistants

## ✨ 特性

- 🎯 **MCP 协议支持**: 完全兼容 Model Context Protocol，可与各种 AI 助手无缝集成
- 🖼️ **多格式输出**: 支持 PNG 和 SVG 格式的图表生成
- 💾 **本地保存**: 支持将生成的图表保存到指定本地目录
- 🌐 **在线访问**: 提供持久化的 HTTP 访问地址
- ⚡ **智能缓存**: 使用 MD5 哈希避免重复生成相同图表
- 📦 **批量处理**: 支持同时处理多个 Mermaid 代码块
- 🔧 **TypeScript**: 完全使用 TypeScript 开发，提供类型安全

## 📦 安装

### 推荐方式（使用 @latest 标签）

```bash
npx @pickstar-2002/mermaid-chart-mcp@latest
```

### 全局安装

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### 本地安装

```bash
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 快速开始

### 1. MCP 服务器模式（推荐）

在您的 AI 助手配置中添加以下 MCP 服务器配置：

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
    }
  }
}
```

### 2. HTTP 服务器模式

```bash
# 启动 HTTP 服务器
npx @pickstar-2002/mermaid-chart-mcp@latest --server

# 或者设置环境变量
SERVER_MODE=true npx @pickstar-2002/mermaid-chart-mcp@latest
```

服务器将在 `http://localhost:3000` 启动。

## 🛠️ 使用方法

### MCP 工具

#### `renderMermaid`
渲染 Mermaid 代码为图片并返回在线访问 URL。

```json
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "format": "png",
  "theme": "default"
}
```

#### `saveMermaid`
渲染图片并保存到指定本地路径，同时返回在线 URL。

```json
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "localPath": "/Users/username/Documents/diagrams",
  "filename": "my-flowchart.png",
  "format": "png"
}
```

#### `batchRenderMermaid`
批量处理多个 Mermaid 代码块。

```json
{
  "items": [
    {
      "mermaidCode": "graph TD\n    A --> B",
      "format": "png",
      "localPath": "/path/to/save",
      "filename": "chart1.png"
    },
    {
      "mermaidCode": "sequenceDiagram\n    A->>B: Hello",
      "format": "svg"
    }
  ]
}
```

### HTTP API

#### `POST /api/render`
渲染 Mermaid 图表

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
    "format": "png"
  }'
```

#### `POST /api/save`
渲染并保存到本地

```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
    "localPath": "/path/to/save",
    "filename": "my-chart.png",
    "format": "png"
  }'
```

#### `GET /images/{id}.png`
访问生成的图片

```bash
curl http://localhost:3000/images/abc123def456.png
```

## 🎨 支持的图表类型

- 📊 **流程图** (Flowchart)
- 🔄 **序列图** (Sequence Diagram)  
- 📈 **甘特图** (Gantt Chart)
- 🏛️ **类图** (Class Diagram)
- 🗂️ **状态图** (State Diagram)
- 🌳 **Git 图** (Git Graph)
- 📋 **用户旅程图** (User Journey)
- 🥧 **饼图** (Pie Chart)
- 📊 **象限图** (Quadrant Chart)
- 🎯 **需求图** (Requirement Diagram)

## ⚙️ 配置选项

### 环境变量

```bash
# 服务器端口（默认: 3000）
PORT=3000

# 服务器模式
SERVER_MODE=true

# MCP 模式
MCP_MODE=true

# 图片存储目录（默认: public/images）
IMAGES_DIR=public/images

# 临时文件目录（默认: temp）
TEMP_DIR=temp
```

### 支持的格式

- **PNG**: 高质量位图格式，适合展示和打印
- **SVG**: 矢量格式，支持缩放且文件较小

### 主题选项

- `default`: 默认主题
- `dark`: 深色主题  
- `forest`: 森林主题
- `neutral`: 中性主题

## 🔧 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start
```

### 项目结构

```
mermaid-chart-mcp/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── types.ts              # 类型定义
│   ├── mcp/
│   │   └── server.ts         # MCP 服务器实现
│   ├── server/
│   │   └── express.ts        # HTTP 服务器实现
│   ├── services/
│   │   └── mermaidRenderer.ts # Mermaid 渲染服务
│   └── utils/
│       ├── hash.ts           # 哈希工具
│       └── fileSystem.ts     # 文件系统工具
├── public/images/            # 生成的图片存储目录
├── temp/                     # 临时文件目录
└── dist/                     # 编译输出目录
```

## 🔍 疑难解答

### 常见问题

#### ❌ `Connection closed` 错误

这通常是由于 `npx` 缓存问题导致的。请按以下顺序尝试解决：

**1. 首选方案：确认使用 @latest 标签**
```bash
npx @pickstar-2002/mermaid-chart-mcp@latest
```

**2. 备用方案：锁定到特定稳定版本**
```bash
npx @pickstar-2002/mermaid-chart-mcp@1.0.0
```

**3. 终极方案：清理 npx 缓存**
```bash
# 清理 npx 缓存
npx clear-npx-cache

# 或者手动删除缓存目录
# Windows: %APPDATA%\npm-cache\_npx
# macOS/Linux: ~/.npm/_npx

# 然后重新运行
npx @pickstar-2002/mermaid-chart-mcp@latest
```

#### ❌ 端口被占用

```bash
# 检查端口占用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# 使用不同端口
PORT=3001 npx @pickstar-2002/mermaid-chart-mcp@latest
```

#### ❌ 权限错误

```bash
# 确保有写入权限
chmod 755 /path/to/save/directory

# 或者使用 sudo（不推荐）
sudo npx @pickstar-2002/mermaid-chart-mcp@latest
```

#### ❌ Node.js 版本不兼容

确保您的 Node.js 版本 >= 18.0.0：

```bash
node --version
# 如果版本过低，请升级 Node.js
```

### 调试模式

启用详细日志输出：

```bash
DEBUG=mermaid-chart-mcp npx @pickstar-2002/mermaid-chart-mcp@latest
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

⭐ 如果这个项目对您有帮助，请给个 Star！