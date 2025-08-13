# 🎨 Mermaid Chart MCP 服务器

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@pickstar-2002/mermaid-chart-mcp)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@pickstar-2002/mermaid-chart-mcp)](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)

> 🚀 一个强大的模型上下文协议 (MCP) 服务器，可将 Mermaid 图表渲染为高质量图像，与 AI 无缝集成。

## ✨ 功能特性

- 🎯 **AI 优先设计**：与 Claude Desktop 和其他 MCP 客户端无缝集成
- 🖼️ **多种格式**：支持导出为 PNG、SVG 和 PDF 高质量格式
- 🎨 **丰富主题**：支持默认、深色、森林和中性主题
- 📊 **全面图表**：流程图、序列图、甘特图、类图等多种图表类型
- ⚡ **高性能**：使用 Puppeteer 和 Sharp 优化渲染
- 🔧 **零配置**：开箱即用，包含所有依赖项
- 🛡️ **类型安全**：使用 TypeScript 构建，确保可靠性

## 📦 安装

### Claude Desktop 推荐安装

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### 开发环境安装

```bash
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 快速开始

### Claude Desktop 配置

将以下配置添加到 Claude Desktop 配置文件中：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### 其他 MCP 客户端配置

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "node",
      "args": ["node_modules/@pickstar-2002/mermaid-chart-mcp/dist/index.js"]
    }
  }
}
```

### Cursor IDE 配置

在 Cursor 中使用，请在设置中添加 MCP 服务器配置：

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

### WindSurf IDE 配置

在 WindSurf 中配置 MCP 服务器：

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

## 📖 用法说明

配置完成后，您可以在 AI 对话中使用 MCP 工具：

### 基础示例

```json
{
  "tool": "render_mermaid_chart",
  "arguments": {
    "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
    "outputPath": "./diagrams/flowchart.png"
  }
}
```

### 高级配置

```json
{
  "tool": "render_mermaid_chart",
  "arguments": {
    "mermaidCode": "sequenceDiagram\n    participant 用户\n    participant 系统\n    用户->>系统: 请求\n    系统-->>用户: 响应",
    "outputPath": "./diagrams/sequence.svg",
    "format": "svg",
    "width": 1400,
    "height": 1000,
    "theme": "dark",
    "backgroundColor": "#1e1e1e"
  }
}
```

## 🛠️ API 参考

### `render_mermaid_chart`

将 Mermaid 代码渲染为高质量图像。

#### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `mermaidCode` | string | ✅ | - | Mermaid 图表代码 |
| `outputPath` | string | ✅ | - | 输出文件路径（含扩展名） |
| `format` | string | ❌ | `"png"` | 输出格式：`png`、`svg`、`pdf` |
| `width` | number | ❌ | `1200` | 图像宽度（像素） |
| `height` | number | ❌ | `800` | 图像高度（像素） |
| `theme` | string | ❌ | `"default"` | 主题：`default`、`dark`、`forest`、`neutral` |
| `backgroundColor` | string | ❌ | `"white"` | 背景颜色 |

## 📊 支持的图表类型

| 类型 | 描述 | 使用场景 |
|------|------|----------|
| 📈 **流程图** | 流程和决策树 | 业务流程、算法 |
| 🔄 **序列图** | 系统交互时序 | API 调用、用户工作流 |
| 📅 **甘特图** | 项目时间线和进度 | 项目规划、里程碑 |
| 🏗️ **类图** | 面向对象设计 | 软件架构、数据模型 |
| 📊 **XY 图表** | 数据可视化 | 性能指标、对比分析 |
| 🔀 **状态图** | 状态转换 | UI 状态、工作流状态 |
| 🗺️ **用户旅程图** | 用户体验映射 | UX 设计、客户流程 |
| 🧠 **思维导图** | 思维结构化 | 头脑风暴、知识整理 |
| ⏰ **时间线** | 事件时序 | 历史记录、项目进展 |

## 🔧 开发

### 本地设置

```bash
# 克隆仓库
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 启动 MCP 服务器
npm start
```

### 项目结构

```
mermaid-chart-mcp/
├── src/
│   ├── index.ts          # MCP 服务器实现
│   └── renderer.ts       # Mermaid 渲染引擎
├── dist/                 # 编译后的 JavaScript
├── bin/                  # 可执行脚本
└── examples/             # Mermaid 示例文件
```

### 开发脚本

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 🐛 故障排除

### 常见问题

**Puppeteer 下载问题**
```bash
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
npm install
```

**权限错误**
- 确保输出目录具有写入权限
- 在 Windows 上，如需要请以管理员身份运行

**内存问题**
```bash
node --max-old-space-size=4096 node_modules/@pickstar-2002/mermaid-chart-mcp/dist/index.js
```

**字体问题**
- 确保系统安装了中文字体
- 在 Linux 上可能需要安装额外的字体包

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

### 贡献指南

- 遵循现有的代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有测试通过

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙋‍♂️ 支持与联系

- 📧 **问题反馈**: [GitHub Issues](https://github.com/pickstar-2002/mermaid-chart-mcp/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/pickstar-2002/mermaid-chart-mcp/discussions)
- 🌐 **项目仓库**: [GitHub](https://github.com/pickstar-2002/mermaid-chart-mcp)
- 📦 **NPM 包**: [@pickstar-2002/mermaid-chart-mcp](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)

## 📈 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持基本的 Mermaid 图表生成和渲染功能
- 🎨 支持多种主题和输出格式
- 🔧 完整的 MCP 协议支持

---

**微信: pickstar_loveXX**

---

*Built with ❤️ by pickstar-2002*