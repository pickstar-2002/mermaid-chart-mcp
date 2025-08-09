# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2024-01-10

### 新增
- 🎉 初始版本发布
- ✨ 支持 Mermaid 代码渲染为 PNG/SVG 图片
- 🌐 自动上传图片到在线服务并返回访问 URL
- 💾 支持保存图片到本地指定路径
- 🚀 支持批量处理多个 Mermaid 代码块
- ✅ 完整的输入验证和错误处理
- 🎨 支持多种主题和背景颜色配置
- 📝 支持所有主流 Mermaid 图表类型：
  - 流程图 (Flowchart)
  - 序列图 (Sequence Diagram)
  - 类图 (Class Diagram)
  - 状态图 (State Diagram)
  - 实体关系图 (ER Diagram)
  - 用户旅程图 (User Journey)
  - 甘特图 (Gantt Chart)
  - 饼图 (Pie Chart)
  - Git 图 (Git Graph)
  - 思维导图 (Mindmap)
  - 时间线 (Timeline)
  - 桑基图 (Sankey)
  - 需求图 (Requirement)
  - C4 图 (C4 Context)
  - 象限图 (Quadrant Chart)

### 技术特性
- 🔧 基于官方 MCP SDK 构建
- 🛡️ TypeScript 开发，完整类型安全
- 🎭 使用 Puppeteer + Mermaid.js 进行渲染
- 📦 打包所有依赖，开箱即用
- 🔄 支持多个备用图片托管服务
- ⚡ 支持并发批量处理
- 🎯 毫秒级精度的尺寸控制

### 工具
- `renderMermaid` - 渲染 Mermaid 代码为图片并返回在线访问 URL
- `saveMermaid` - 渲染图片并保存到指定本地路径，同时返回在线 URL
- `batchRenderMermaid` - 批量处理多个 Mermaid 代码块

### 文档
- 📚 完整的 README 文档
- 🎯 详细的使用示例
- 🧪 多种测试图表模板
- ⚙️ MCP 客户端配置示例

## [未来计划]

### 计划新增
- 🔐 更多图片托管服务支持
- 🎨 自定义 CSS 样式支持
- 📊 渲染性能统计
- 🔄 图片缓存机制
- 📱 移动端优化渲染
- 🌍 国际化支持
- 🔌 插件系统
- 📈 使用分析和监控

### 计划改进
- ⚡ 渲染性能优化
- 🛡️ 更强的错误恢复能力
- 📝 更多图表类型支持
- 🎯 更精确的尺寸控制
- 🔧 更灵活的配置选项