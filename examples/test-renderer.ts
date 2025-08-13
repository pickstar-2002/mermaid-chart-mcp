import { MermaidRenderer } from '../src/renderer.js';
import { flowchartExample, sequenceExample, ganttExample, classExample } from './mermaid-examples.js';

/**
 * 测试渲染器功能的示例脚本
 */
async function testRenderer() {
  const renderer = new MermaidRenderer();

  try {
    console.log('开始测试 Mermaid 渲染器...');

    // 测试流程图
    console.log('渲染流程图...');
    await renderer.renderChart({
      mermaidCode: flowchartExample,
      outputPath: './examples/output/flowchart.png',
      format: 'png',
      width: 1200,
      height: 800,
      theme: 'default',
    });

    // 测试序列图
    console.log('渲染序列图...');
    await renderer.renderChart({
      mermaidCode: sequenceExample,
      outputPath: './examples/output/sequence.png',
      format: 'png',
      width: 1200,
      height: 800,
      theme: 'default',
    });

    // 测试甘特图
    console.log('渲染甘特图...');
    await renderer.renderChart({
      mermaidCode: ganttExample,
      outputPath: './examples/output/gantt.svg',
      format: 'svg',
      theme: 'forest',
    });

    // 测试类图
    console.log('渲染类图...');
    await renderer.renderChart({
      mermaidCode: classExample,
      outputPath: './examples/output/class.png',
      format: 'png',
      width: 1400,
      height: 1000,
      theme: 'dark',
      backgroundColor: '#1e1e1e',
    });

    console.log('所有测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await renderer.cleanup();
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testRenderer();
}
