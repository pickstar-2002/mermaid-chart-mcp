# 🎨 Mermaid Chart MCP Server

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fmermaid-chart-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

一个基于 MCP (Model Context Protocol) 协议的 Mermaid 图表渲染服务器，支持将 Mermaid 代码转换为高质量的图片文件或在线链接。🚀

## ✨ 功能特性

- 🎨 **多格式支持**: 支持 PNG 和 SVG 格式输出
- 🚀 **批量渲染**: 支持一次性渲染多个图表
- 🌐 **在线链接**: 可生成图片的在线访问链接
- 🎯 **高度可配置**: 支持自定义主题、尺寸、DPI 等参数
- 📦 **开箱即用**: 所有依赖已内置，无需额外配置
- 🔧 **TypeScript**: 完整的类型安全支持

## 📦 安装

推荐使用 `@latest` 标签获取最新版本：

```bash
npm install -g @pickstar-2002/mermaid-chart-mcp@latest
```

或者直接运行（推荐）：

```bash
npx @pickstar-2002/mermaid-chart-mcp@latest
```

## 🚀 使用方法

### 在 IDE 中配置 MCP 服务

#### Claude Desktop
在 `claude_desktop_config.json` 中添加：

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

#### Cursor
在 `.cursorrules` 或项目配置中添加：

```json
{
  "mcp": {
    "servers": {
      "mermaid-chart": {
        "command": "npx",
        "args": ["@pickstar-2002/mermaid-chart-mcp@latest"]
      }
    }
  }
}
```

#### WindSurf
在 MCP 配置中添加：

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

#### 其他支持 MCP 的 IDE
按照相应 IDE 的 MCP 配置方式，使用以下命令：

```bash
npx @pickstar-2002/mermaid-chart-mcp@latest
```

## 🛠️ 可用工具

### 1. render_mermaid - 渲染单个图表

```typescript
{
  code: string,           // Mermaid 代码
  options?: {
    format?: 'png' | 'svg',        // 输出格式，默认 png
    outputPath?: string,           // 输出路径（可选）
    generateOnlineLink?: boolean,  // 是否生成在线链接
    dpi?: number,                  // DPI 设置（PNG），默认 300
    width?: number,                // 图片宽度，默认 1200
    height?: number,               // 图片高度，默认 800
    backgroundColor?: string,      // 背景颜色，默认 white
    theme?: 'default' | 'dark' | 'forest' | 'neutral'  // 主题
  }
}
```

### 2. batch_render_mermaid - 批量渲染

```typescript
{
  requests: Array<{
    code: string,
    options?: RenderOptions
  }>,
  globalOptions?: RenderOptions  // 全局选项
}
```

### 3. start_static_server - 启动静态服务器

```typescript
{
  port?: number,    // 端口号，默认 3000
  host?: string     // 主机地址，默认 localhost
}
```

### 4. stop_static_server - 停止静态服务器

### 5. update_config - 更新配置

### 6. get_config - 获取当前配置

## 💡 使用示例

### 基本渲染

```javascript
// 渲染流程图
const result = await render_mermaid({
  code: `
    graph TD
      A[开始] --> B{判断条件}
      B -->|是| C[执行操作]
      B -->|否| D[结束]
      C --> D
  `,
  options: {
    format: 'png',
    theme: 'default'
  }
});
```

### 生成在线链接

```javascript
const result = await render_mermaid({
  code: `
    sequenceDiagram
      participant A as 用户
      participant B as 系统
      A->>B: 发送请求
      B-->>A: 返回响应
  `,
  options: {
    generateOnlineLink: true,
    theme: 'dark'
  }
});

console.log(result.onlineLink); // http://localhost:3000/files/mermaid-xxx.png
```

### 批量渲染

```javascript
const result = await batch_render_mermaid({
  requests: [
    {
      code: "graph TD; A-->B;",
      options: { theme: 'default' }
    },
    {
      code: "pie title 数据分布; \"A\" : 386; \"B\" : 85;",
      options: { theme: 'forest' }
    }
  ],
  globalOptions: {
    format: 'svg',
    generateOnlineLink: true
  }
});
```

## 📊 支持的 Mermaid 图表类型

- 📈 流程图 (Flowchart)
- 🔄 序列图 (Sequence Diagram)
- 📅 甘特图 (Gantt Chart)
- 🏗️ 类图 (Class Diagram)
- 🔀 状态图 (State Diagram)
- 🥧 饼图 (Pie Chart)
- 🗺️ 用户旅程图 (User Journey)
- 🌳 Git 图 (Git Graph)
- 🗃️ ER 图 (Entity Relationship Diagram)
- 📋 需求图 (Requirement Diagram)

## 🎨 主题支持

- `default`: 默认主题 ⚪
- `dark`: 深色主题 ⚫
- `forest`: 森林主题 🌲
- `neutral`: 中性主题 🔘

## 🏗️ 技术架构

- **MCP SDK**: 基于官方 @modelcontextprotocol/sdk
- **渲染引擎**: Puppeteer + Mermaid.js
- **图像处理**: Sharp
- **静态服务**: Express.js
- **类型安全**: 完整的 TypeScript 支持

## 🔧 开发

```bash
# 克隆项目
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

## 📝 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✅ 支持 PNG/SVG 格式输出
- ✅ 支持批量渲染
- ✅ 支持在线链接生成
- ✅ 支持多种主题和自定义配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**pickstar-2002**

## 📞 联系方式

微信: pickstar_loveXX

---

⭐ 如果这个项目对你有帮助，请给它一个星标！