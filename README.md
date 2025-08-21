# 🎨 Mermaid Chart MCP

[![npm version](https://img.shields.io/npm/v/@pickstar-2002/mermaid-chart-mcp.svg)](https://www.npmjs.com/package/@pickstar-2002/mermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

> 🚀 一个强大的 Model Context Protocol (MCP) 服务器，专为将 Mermaid 图表代码渲染为高质量图片而设计

## ✨ 特性

- 🎯 **高质量渲染** - 支持 PNG、SVG、PDF 多种格式输出
- 🎨 **多主题支持** - 内置 default、dark、forest、neutral 四种主题
- ☁️ **云存储集成** - 基于腾讯云服务器 + MinIO 的高性能文件存储服务
- 🔗 **在线预览** - 自动生成在线访问链接，支持即时分享
- 🛡️ **安全可靠** - 文件自动过期机制，保护隐私安全
- ⚡ **高性能** - 使用 Puppeteer + Sharp 优化渲染质量
- 🔧 **易于集成** - 完美兼容各大 AI 编辑器和 MCP 客户端

## 📦 安装

### 快速开始（推荐）

使用 `@latest` 标签获取最新版本：

```bash
npx @pickstar-2002/mermaid-chart-mcp@latest
```

### 全局安装

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

### 项目依赖

```bash
npm install @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 使用方法

### 在 Claude Desktop 中配置

在 `claude_desktop_config.json` 中添加以下配置：

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

### 在 Cursor 中配置

在 `.cursorrules` 或项目配置中添加：

```json
{
  "mcp": {
    "servers": {
      "mermaid-chart": {
        "command": "npx @pickstar-2002/mermaid-chart-mcp@latest"
      }
    }
  }
}
```

### 在 WindSurf 中配置

在 `windsurf_config.json` 中配置：

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

### 在 CodeBuddy 中配置

在项目根目录创建 `.codebuddy/mcp.json`：

```json
{
  "servers": {
    "mermaid-chart": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
    }
  }
}
```

## 🛠️ API 参考

### render_mermaid_chart

将 Mermaid 代码渲染为高质量图片文件。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `mermaidCode` | string | ✅ | - | Mermaid 图表代码 |
| `outputPath` | string | ✅ | - | 输出文件路径（包含文件名和扩展名） |
| `format` | string | ❌ | `png` | 输出格式：`png`、`svg`、`pdf` |
| `width` | number | ❌ | `1200` | 图片宽度（像素） |
| `height` | number | ❌ | `800` | 图片高度（像素） |
| `backgroundColor` | string | ❌ | `white` | 背景颜色 |
| `theme` | string | ❌ | `default` | 主题：`default`、`dark`、`forest`、`neutral` |
| `uploadToMinio` | boolean | ❌ | `false` | 是否上传到云存储并返回在线链接 |
| `minioExpiryDays` | number | ❌ | `7` | 文件有效期（天数），最大30天 |

#### 示例

```javascript
// 基础用法
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "outputPath": "./output/flowchart.png"
}

// 高级用法 - 启用云存储
{
  "mermaidCode": "sequenceDiagram\n    Alice->>Bob: Hello Bob!\n    Bob-->>Alice: Hello Alice!",
  "outputPath": "./output/sequence.png",
  "format": "png",
  "theme": "dark",
  "width": 1600,
  "height": 1000,
  "uploadToMinio": true,
  "minioExpiryDays": 14
}
```

## 🌟 支持的图表类型

- 📊 **流程图** (Flowchart)
- 🔄 **序列图** (Sequence Diagram)  
- 📈 **甘特图** (Gantt Chart)
- 🏗️ **类图** (Class Diagram)
- 🗂️ **状态图** (State Diagram)
- 🍰 **饼图** (Pie Chart)
- 🌐 **Git 图** (Git Graph)
- 👥 **用户旅程图** (User Journey)
- 🎯 **需求图** (Requirement Diagram)

## ☁️ 云存储服务

### 🚀 高性能文件存储

本项目集成了基于**腾讯云服务器 + MinIO**打造的高性能文件存储服务：

- **🌐 全球加速** - 基于腾讯云 CDN 的全球节点加速
- **🔒 安全可靠** - 企业级安全防护，数据加密传输
- **⚡ 极速访问** - 毫秒级响应，支持高并发访问
- **📱 即时分享** - 生成在线预览链接，支持跨平台分享
- **🗂️ 智能管理** - 自动文件过期清理，节省存储空间
- **💰 成本优化** - 按需使用，无需预付费用

### 使用云存储

```javascript
// 启用云存储上传
{
  "mermaidCode": "graph LR\n    A --> B --> C",
  "outputPath": "./chart.png",
  "uploadToMinio": true,
  "minioExpiryDays": 7  // 7天后自动过期
}
```

**返回结果包含：**
- 📁 本地文件路径
- 🔗 在线访问链接
- 📊 文件大小信息
- ⏰ 过期时间详情

## 🎨 主题预览

| 主题 | 描述 | 适用场景 |
|------|------|----------|
| `default` | 经典白色主题 | 📄 文档、报告 |
| `dark` | 深色主题 | 🌙 演示、展示 |
| `forest` | 森林绿主题 | 🌲 自然、环保主题 |
| `neutral` | 中性灰主题 | 🏢 商务、正式场合 |

## 📋 系统要求

- **Node.js** >= 18.0.0
- **操作系统**: Windows, macOS, Linux
- **内存**: 建议 >= 2GB
- **磁盘空间**: >= 500MB（用于 Puppeteer 浏览器）

## 🔧 开发

### 克隆项目

```bash
git clone https://github.com/pickstar-2002/mermaid-chart-mcp.git
cd mermaid-chart-mcp
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. 🍴 Fork 本项目
2. 🌿 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔄 创建 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🐛 问题反馈

如果您遇到任何问题，请在 [GitHub Issues](https://github.com/pickstar-2002/mermaid-chart-mcp/issues) 中提交。

## 📚 相关链接

- 📖 [Mermaid 官方文档](https://mermaid.js.org/)
- 🔗 [Model Context Protocol](https://modelcontextprotocol.io/)
- 🛠️ [Puppeteer 文档](https://pptr.dev/)
- ☁️ [MinIO 文档](https://min.io/docs/)

## 🙏 致谢

感谢以下开源项目：

- [Mermaid](https://github.com/mermaid-js/mermaid) - 强大的图表生成库
- [Puppeteer](https://github.com/puppeteer/puppeteer) - 无头浏览器控制
- [Sharp](https://github.com/lovell/sharp) - 高性能图像处理
- [MinIO](https://github.com/minio/minio) - 高性能对象存储

---

## 📞 联系方式

如有任何问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个 Star！⭐**

Made with ❤️ by [pickstar-2002](https://github.com/pickstar-2002)

</div>