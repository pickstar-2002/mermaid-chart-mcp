# 使用示例

本目录包含了 Mermaid Chart MCP 的使用示例。

## 文件说明

- `basic-usage.js` - 基本使用示例，展示了所有主要功能
- `mcp-config.json` - MCP 客户端配置示例
- `test-diagrams/` - 测试用的 Mermaid 图表代码

## 运行示例

### 1. 基本使用示例

```bash
# 确保项目已构建
npm run build

# 运行示例
node examples/basic-usage.js
```

### 2. 作为 MCP 服务器使用

将 `mcp-config.json` 中的配置添加到你的 MCP 客户端配置中，然后就可以通过 MCP 协议调用服务了。

### 3. 命令行使用

```bash
# 直接运行 MCP 服务器
npx @pickstar-2002/mermaid-chart-mcp

# 或者本地运行
npm run start
```

## 环境变量

- `IMGBB_API_KEY` - ImgBB API 密钥（可选，用于图片上传）

如果不设置 API 密钥，系统会自动使用备用的免费图片托管服务。

## 测试图表

examples/test-diagrams/ 目录包含了各种类型的 Mermaid 图表示例，可以用来测试渲染功能。