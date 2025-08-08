# 更新日志

## [1.0.0] - 2024-01-08

### 新增功能
- 🎨 支持 Mermaid 图表渲染为 PNG 和 SVG 格式
- 🚀 基于 MCP (Model Context Protocol) 协议的服务器实现
- 📦 批量渲染多个图表的能力
- 🎯 支持多种主题：default, dark, forest 等
- 🌈 可自定义背景颜色和图片尺寸
- 💾 支持本地保存和在线链接生成
- 🔧 开箱即用，无需额外环境配置

### 可用工具
- `renderMermaid`: 渲染 Mermaid 代码为图片并返回在线访问 URL
- `saveMermaid`: 渲染并保存到本地路径，同时返回在线 URL
- `batchRenderMermaid`: 批量处理多个 Mermaid 代码块

### 技术特性
- TypeScript 开发，类型安全
- 使用 Puppeteer 进行浏览器自动化渲染
- 支持多种 Mermaid 图表类型
- 自动上传到临时文件服务获取在线链接
- 完善的错误处理和日志记录

### 支持的图表类型
- 流程图 (Flowchart)
- 序列图 (Sequence Diagram)
- 甘特图 (Gantt Chart)
- 类图 (Class Diagram)
- 状态图 (State Diagram)
- 饼图 (Pie Chart)
- 用户旅程图 (User Journey)
- Git 图 (Git Graph)
- 实体关系图 (ER Diagram)
- 需求图 (Requirement Diagram)