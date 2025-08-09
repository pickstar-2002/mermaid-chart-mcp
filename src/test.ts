/**
 * 测试文件
 */

import { MermaidChartService } from './service';

async function test() {
  const service = new MermaidChartService();
  
  try {
    await service.initialize();
    
    // 测试基本渲染
    const result = await service.renderMermaid({
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
    
    console.log('渲染结果:', result);
    
    await service.close();
  } catch (error) {
    console.error('测试失败:', error);
  }
}

if (require.main === module) {
  test();
}