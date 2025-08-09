/**
 * 基本使用示例
 */

const { MermaidChartService } = require('../dist/service');

async function example() {
  const service = new MermaidChartService();
  
  try {
    // 初始化服务
    await service.initialize();
    console.log('服务初始化完成');
    
    // 示例 1: 基本渲染
    console.log('\n=== 示例 1: 基本渲染 ===');
    const result1 = await service.renderMermaid({
      mermaidCode: `
        graph TD
          A[开始] --> B{是否登录?}
          B -->|是| C[显示主页]
          B -->|否| D[显示登录页]
          C --> E[结束]
          D --> E
      `,
      format: 'png',
      theme: 'default'
    });
    console.log('渲染结果:', result1);
    
    // 示例 2: 保存到本地
    console.log('\n=== 示例 2: 保存到本地 ===');
    const result2 = await service.saveMermaid({
      mermaidCode: `
        sequenceDiagram
          participant A as 用户
          participant B as 系统
          participant C as 数据库
          
          A->>B: 登录请求
          B->>C: 验证用户
          C-->>B: 返回结果
          B-->>A: 登录响应
      `,
      localPath: './output',
      filename: 'sequence-diagram.png',
      format: 'png',
      theme: 'dark'
    });
    console.log('保存结果:', result2);
    
    // 示例 3: 批量处理
    console.log('\n=== 示例 3: 批量处理 ===');
    const result3 = await service.batchRenderMermaid({
      items: [
        {
          mermaidCode: `
            pie title 用户分布
              "新用户" : 30
              "活跃用户" : 50
              "休眠用户" : 20
          `,
          format: 'svg'
        },
        {
          mermaidCode: `
            gantt
              title 项目进度
              dateFormat YYYY-MM-DD
              section 设计
              需求分析 :done, des1, 2024-01-01, 2024-01-05
              UI设计   :active, des2, 2024-01-06, 2024-01-10
              section 开发
              前端开发 :dev1, 2024-01-11, 2024-01-20
              后端开发 :dev2, 2024-01-15, 2024-01-25
          `,
          format: 'png',
          localPath: './output'
        }
      ],
      theme: 'forest'
    });
    console.log('批量处理结果:', result3);
    
    // 关闭服务
    await service.close();
    console.log('\n服务已关闭');
    
  } catch (error) {
    console.error('示例执行失败:', error);
    await service.close();
  }
}

// 运行示例
example();