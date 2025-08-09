# 🎨 Mermaid Chart MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

> 🚀 基于 AI MCP 协议的 Mermaid 图表渲染器，支持将 Mermaid 代码转换为图片并提供在线访问

## ✨ 特性

- 🎯 **MCP 协议兼容** - 严格遵循官方 MCP 协议规范
- 🖼️ **多格式支持** - 支持 PNG、SVG 格式输出
- 🎨 **主题定制** - 支持多种 Mermaid 主题配置
- 📁 **本地保存** - 支持将图片保存到指定本地路径
- 🔄 **批量处理** - 支持一次性处理多个 Mermaid 图表
- ✅ **输入验证** - 内置 Mermaid 语法验证，防止渲染失败
- 🌐 **在线访问** - 自动生成在线访问 URL
- 🛡️ **类型安全** - 完整的 TypeScript 类型定义

## 📦 安装

```bash
# 推荐使用 @latest 标签获取最新版本
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 快速开始

### 在 MCP 客户端中配置

#### Cursor / Claude Desktop

在配置文件中添加以下内容：

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest", "--mcp"]
    }
  }
}
```

#### WindSurf

```json
{
  "mcp": {
    "servers": {
      "mermaid-chart": {
        "command": "npx",
        "args": ["@pickstar-2002/mermaid-chart-mcp@latest", "--mcp"]
      }
    }
  }
}
```

#### 其他 MCP 兼容客户端

```json
{
  "servers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest", "--mcp"]
    }
  }
}
```

### 直接运行

```bash
# 启动 MCP 服务器
npx @pickstar-2002/mermaid-chart-mcp@latest --mcp
```

## 🛠️ API 工具

### renderMermaid

渲染 Mermaid 代码为图片并返回在线访问 URL。

**参数：**
- `mermaidCode` (string, 必需) - Mermaid 图表代码
- `format` (string, 可选) - 输出格式，默认为 'png'，支持 'png' | 'svg'
- `theme` (string, 可选) - 主题，如 'default', 'dark', 'forest' 等
- `backgroundColor` (string, 可选) - 背景颜色，如 'white', 'transparent' 等
- `width` (number, 可选) - 图片宽度
- `height` (number, 可选) - 图片高度

**示例：**
```javascript
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "format": "png",
  "theme": "default",
  "backgroundColor": "white"
}
```

### saveMermaid

渲染 Mermaid 代码并保存到指定本地路径，同时返回在线 URL。

**参数：**
- 包含 `renderMermaid` 的所有参数
- `localPath` (string, 必需) - 本地保存目录路径
- `filename` (string, 可选) - 文件名，不指定则自动生成
- `createDir` (boolean, 可选) - 如果目录不存在是否创建，默认为 true

**示例：**
```javascript
{
  "mermaidCode": "sequenceDiagram\n    Alice->>Bob: Hello Bob\n    Bob-->>Alice: Hello Alice",
  "localPath": "./output",
  "filename": "sequence-diagram.png",
  "format": "png"
}
```

### batchRenderMermaid

批量处理多个 Mermaid 代码块。

**参数：**
- `items` (array, 必需) - 要处理的 Mermaid 代码列表
- `theme` (string, 可选) - 全局主题设置
- `backgroundColor` (string, 可选) - 全局背景颜色设置

**示例：**
```javascript
{
  "items": [
    {
      "mermaidCode": "graph LR\n    A --> B --> C",
      "format": "png"
    },
    {
      "mermaidCode": "pie title 数据分布\n    \"A\" : 386\n    \"B\" : 85",
      "format": "svg",
      "localPath": "./charts"
    }
  ],
  "theme": "default"
}
```

## 📋 支持的 Mermaid 图表类型

- 🔄 **流程图** (Flowchart)
- 📊 **序列图** (Sequence Diagram)
- 📈 **甘特图** (Gantt Chart)
- 🥧 **饼图** (Pie Chart)
- 🗂️ **类图** (Class Diagram)
- 🌳 **状态图** (State Diagram)
- 👥 **用户旅程图** (User Journey)
- 🎯 **Git 图** (Git Graph)
- 📐 **ER 图** (Entity Relationship Diagram)

## 🎨 支持的主题

- `default` - 默认主题
- `dark` - 深色主题
- `forest` - 森林主题
- `neutral` - 中性主题
- `base` - 基础主题

## 📁 项目结构

```
mermaid-chart-mcp/
├── src/
│   ├── mcp-server.ts      # MCP 服务器主入口
│   ├── service.ts         # 核心业务逻辑
│   ├── renderer.ts        # Mermaid 渲染引擎
│   ├── uploader.ts        # 图片上传服务
│   ├── validator.ts       # 输入验证
│   └── types.ts           # TypeScript 类型定义
├── dist/                  # 编译输出目录
├── examples/              # 使用示例
└── README.md             # 项目文档
```

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式
npm run dev
```

## 📄 许可证

MIT © 2025 pickstar-2002

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

微信: pickstar_loveXX

---

⭐ 如果这个项目对你有帮助，请给个 Star！