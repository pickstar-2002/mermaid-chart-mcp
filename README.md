# Mermaid Chart MCP 服务器

一个用于生成和渲染 Mermaid 图表的 Model Context Protocol (MCP) 服务器。

## 功能特性

- 生成各种类型的 Mermaid 图表
- 将 Mermaid 代码渲染为 SVG 格式
- 支持多种图表类型：流程图、序列图、甘特图、类图等
- 与 MCP 兼容的客户端无缝集成

## 安装

```bash
npm install -g mermaid-chart-mcp
```

## 使用方法

### 作为 MCP 服务器

在你的 MCP 客户端配置中添加此服务器：

```json
{
  "mcpServers": {
    "mermaid-chart": {
      "command": "mermaid-chart-mcp",
      "args": []
    }
  }
}
```

### 可用工具

#### `generate_mermaid_chart`

生成指定类型的 Mermaid 图表代码。

**参数：**
- `type` (string): 图表类型（flowchart、sequence、gantt、class、state、pie、journey、gitgraph、mindmap、timeline、quadrant、requirement、c4context）
- `description` (string): 图表描述或要求
- `data` (object, 可选): 用于生成图表的结构化数据

**示例：**
```javascript
{
  "type": "flowchart",
  "description": "创建一个显示用户登录流程的流程图",
  "data": {
    "steps": ["开始", "输入凭据", "验证", "成功/失败", "结束"]
  }
}
```

#### `render_mermaid_svg`

将 Mermaid 代码渲染为 SVG 格式。

**参数：**
- `mermaidCode` (string): 要渲染的 Mermaid 代码
- `theme` (string, 可选): 主题（default、dark、forest、neutral）
- `backgroundColor` (string, 可选): 背景颜色

**示例：**
```javascript
{
  "mermaidCode": "graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]",
  "theme": "default",
  "backgroundColor": "white"
}
```

## 支持的图表类型

- **flowchart**: 流程图
- **sequence**: 序列图
- **gantt**: 甘特图
- **class**: 类图
- **state**: 状态图
- **pie**: 饼图
- **journey**: 用户旅程图
- **gitgraph**: Git 图
- **mindmap**: 思维导图
- **timeline**: 时间线
- **quadrant**: 象限图
- **requirement**: 需求图
- **c4context**: C4 上下文图

## 开发

### 构建

```bash
npm run build
```

### 测试

```bash
npm test
```

### 开发模式

```bash
npm run dev
```

## 许可证

MIT

## 贡献

欢迎提交 Pull Request 和 Issue！

## 更新日志

### v1.0.0
- 初始版本
- 支持基本的 Mermaid 图表生成和渲染功能