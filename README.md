# 🎨 Mermaid Chart MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@pickstar-2002/mermaid-chart-mcp)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@pickstar-2002/mermaid-chart-mcp)](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 🚀 一个强大的模型上下文协议 (MCP) 服务器，可将 Mermaid 图表渲染为高质量图像，与 AI 无缝集成。

## 📖 简介

Mermaid Chart MCP 是一个专为 AI 交互设计的模型上下文协议服务器，它能够将 Mermaid 代码实时渲染为高质量的图像文件。通过与 Claude Desktop 等 AI 客户端的深度集成，您可以轻松地在对话中生成各种类型的图表和流程图。

## ✨ 功能特性

- 🎯 **AI 优先设计**：与 Claude Desktop 和其他 MCP 客户端无缝集成
- 🖼️ **多种格式**：支持导出为 PNG、SVG 和 PDF 高质量格式
- 🎨 **丰富主题**：支持默认、深色、森林和中性四种主题风格
- 📊 **全面图表**：流程图、序列图、甘特图、类图、状态图等多种图表类型
- ⚡ **高性能**：使用 Puppeteer 和 Sharp 优化渲染引擎
- 🔧 **零配置**：开箱即用，包含所有必要依赖项
- 🛡️ **类型安全**：使用 TypeScript 构建，确保代码可靠性
- ☁️ **云存储**：可选 MinIO 云存储支持，生成可分享的在线链接
- 🎛️ **灵活配置**：自定义尺寸、颜色、主题等多种渲染选项

## 📦 安装

### 🏆 推荐安装（使用 @latest 标签）

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### 开发环境安装

```bash
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 快速开始

### 💻 Claude Desktop 配置

将以下配置添加到 Claude Desktop 配置文件中：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/claude/claude_desktop_config.json`

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

### 🔧 其他 IDE 配置

#### Cursor IDE
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

#### WindSurf IDE
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

配置完成后，您可以在 AI 对话中直接使用此工具生成图表。以下是一些使用示例：

### 🔰 基础示例

"请帮我生成一个简单的流程图，显示用户注册的过程"

AI 将自动调用工具：
```json
{
  "mermaidCode": "graph TD\n    A[用户访问] --> B[填写信息]\n    B --> C[提交表单]\n    C --> D[验证信息]\n    D --> E[注册成功]",
  "outputPath": "./user-registration.png"
}
```

### 🎨 高级配置示例

"创建一个深色主题的序列图，展示 API 调用过程，输出为 SVG 格式"

```json
{
  "mermaidCode": "sequenceDiagram\n    participant 客户端\n    participant API\n    participant 数据库\n    客户端->>API: 发送请求\n    API->>数据库: 查询数据\n    数据库-->>API: 返回结果\n    API-->>客户端: 响应数据",
  "outputPath": "./api-sequence.svg",
  "format": "svg",
  "theme": "dark",
  "width": 1400,
  "height": 1000
}
```

## 🛠️ API 参考

### `render_mermaid_chart`

将 Mermaid 代码渲染为高质量图像。

#### 📋 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `mermaidCode` | string | ✅ | - | Mermaid 图表代码 |
| `outputPath` | string | ✅ | - | 输出文件路径（含扩展名） |
| `format` | string | ❌ | `"png"` | 输出格式：`png`、`svg`、`pdf` |
| `width` | number | ❌ | `1200` | 图像宽度（像素） |
| `height` | number | ❌ | `800` | 图像高度（像素） |
| `theme` | string | ❌ | `"default"` | 主题：`default`、`dark`、`forest`、`neutral` |
| `backgroundColor` | string | ❌ | `"white"` | 背景颜色 |
| `uploadToMinio` | boolean | ❌ | `false` | 是否上传到 MinIO 并返回链接 |
| `minioExpiryDays` | number | ❌ | `7` | MinIO 文件有效期（1-30天） |

## 📊 支持的图表类型

| 类型 | 描述 | 使用场景 |
|------|------|----------|
| 📈 **流程图** | 流程和决策树 | 业务流程、算法描述 |
| 🔄 **序列图** | 系统交互时序 | API 调用、用户工作流 |
| 📅 **甘特图** | 项目时间线和进度 | 项目规划、里程碑管理 |
| 🏗️ **类图** | 面向对象设计 | 软件架构、数据模型 |
| 📊 **饼图** | 数据比例展示 | 统计分析、占比展示 |
| 🔀 **状态图** | 状态转换 | UI 状态、工作流状态 |
| 🗺️ **用户旅程图** | 用户体验映射 | UX 设计、客户流程 |
| 🧠 **思维导图** | 思维结构化 | 头脑风暴、知识整理 |
| ⏰ **时间线** | 事件时序 | 历史记录、项目进展 |
| 🌐 **Git 图** | 代码分支管理 | 版本控制、分支策略 |

## 🔧 开发

### 本地开发设置

```bash
# 克隆仓库
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发模式
npm run dev
```

### 📁 项目结构

```
mermaid-chart-mcp/
├── src/
│   ├── index.ts          # MCP 服务器主入口
│   ├── renderer.ts       # Mermaid 渲染引擎
│   └── minio-uploader.ts # MinIO 云存储上传器
├── dist/                 # 编译后的 JavaScript 文件
├── bin/                  # 可执行脚本
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── README.md            # 项目文档
```

### 🔨 可用脚本

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 启动 MCP 服务器
npm start

# 代码质量检查
npm run lint

# 修复代码格式问题
npm run lint:fix
```

## 🐛 故障排除

### 常见问题解决

#### Puppeteer 下载问题
```bash
# 使用国内镜像
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
npm install
```

#### 权限错误
- 确保输出目录具有写入权限
- Windows 用户：以管理员身份运行命令提示符
- Linux/macOS：使用 `chmod` 调整目录权限

#### 内存不足
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 node_modules/@pickstar-2002/mermaid-chart-mcp/dist/index.js
```

#### 中文字体显示问题
- **Windows**: 通常无需额外配置
- **macOS**: 确保安装了中文字体
- **Linux**: 安装中文字体包
  ```bash
  sudo apt-get install fonts-wqy-zenhei fonts-wqy-microhei
  ```

## 🤝 贡献

我们欢迎所有形式的贡献！🎉

### 如何贡献

1. 🍴 Fork 本仓库
2. 🌟 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 💻 提交您的更改 (`git commit -m 'Add amazing feature'`)
4. 📤 推送到分支 (`git push origin feature/amazing-feature`)
5. 🔃 创建 Pull Request

### 贡献指南

- 📝 遵循现有的代码风格和约定
- ✅ 添加适当的测试用例
- 📚 更新相关文档
- 🧪 确保所有测试通过
- 🔍 使用有意义的提交信息

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源 - 查看 LICENSE 文件了解详情。

## 🙋‍♂️ 支持与联系

- 🐛 **问题反馈**: [GitHub Issues](https://github.com/pickstar-2002/mermaid-chart-mcp/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/pickstar-2002/mermaid-chart-mcp/discussions)
- 🌐 **项目仓库**: [GitHub](https://github.com/pickstar-2002/mermaid-chart-mcp)
- 📦 **NPM 包**: [@pickstar-2002/mermaid-chart-mcp](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)
- 💬 **微信**: pickstar_loveXX

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！