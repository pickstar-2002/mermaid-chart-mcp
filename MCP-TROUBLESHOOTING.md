# MCP服务器连接问题解决方案

## 问题诊断

你遇到的 `error -32000: Connection closed` 错误已经解决。主要问题是：

1. **代码重复**：server.ts文件中有重复的import和class定义
2. **错误处理不当**：异常处理导致服务器意外退出
3. **构造函数阻塞**：异步初始化阻塞了构造函数

## 解决方案

### 1. 修复了代码重复问题
- 清理了重复的import语句
- 移除了重复的class定义

### 2. 改进了错误处理
- 在MCP模式下不会因为未捕获异常而立即退出
- 添加了更详细的错误日志
- 使用stderr输出调试信息，避免干扰MCP通信

### 3. 优化了初始化流程
- 构造函数不再阻塞异步操作
- 添加了启动成功/失败的反馈

## 使用方法

### 1. 本地测试
```bash
# 构建项目
npm run build

# 测试MCP服务器
node debug-mcp.js

# 测试工具功能
node test-tools.js
```

### 2. IDE配置
在你的IDE中配置MCP服务器：

```json
{
  "mcpServers": {
    "mermaid-chart-mcp": {
      "command": "npx",
      "args": ["@pickstar-2002/mermaid-chart-mcp", "--mcp"],
      "env": {
        "MCP_MODE": "true"
      }
    }
  }
}
```

### 3. 直接使用npm包
```bash
npx @pickstar-2002/mermaid-chart-mcp --mcp
```

## 验证服务器状态

运行调试脚本应该看到：
```
=== MCP Server Debug Tool ===
1. 检查文件存在性:
   dist/index.js: ✓
   package.json: ✓

2. 检查关键依赖:
   @modelcontextprotocol/sdk: ^0.4.0
   @mermaid-js/mermaid-cli: ^10.6.1

3. 启动MCP服务器测试:
   STDERR: Mermaid MCP Server started successfully
   发送初始化消息...
   STDOUT: {"result":{"protocolVersion":"2024-11-05"...}}

4. 测试完成
```

## 可用工具

MCP服务器提供以下工具：

1. **renderMermaid**: 渲染Mermaid代码为图片并返回在线URL
2. **saveMermaid**: 渲染并保存到本地路径
3. **batchRenderMermaid**: 批量处理多个Mermaid代码

## 常见问题

### Q: 仍然出现连接关闭错误
A: 检查：
- Node.js版本是否>=18.0.0
- 依赖是否正确安装：`npm install`
- 是否正确构建：`npm run build`

### Q: 工具调用失败
A: 检查：
- mermaid-cli是否正确安装
- 系统是否有足够权限创建临时文件
- 网络连接是否正常（用于在线URL生成）

### Q: 图片生成失败
A: 确保：
- 系统安装了Chrome/Chromium（mermaid-cli需要）
- 有足够的磁盘空间
- Mermaid代码语法正确