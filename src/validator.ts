/**
 * Mermaid 代码验证器
 */

import Joi from 'joi';
import { ValidationResult, MermaidRenderOptions, SaveMermaidOptions, BatchRenderOptions } from './types';

/**
 * Mermaid 图表类型检测
 */
const MERMAID_CHART_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph', 'mindmap', 'timeline',
  'sankey', 'requirement', 'c4Context', 'quadrantChart'
];

/**
 * 验证 Mermaid 代码
 */
export function validateMermaidCode(code: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!code || typeof code !== 'string') {
    result.isValid = false;
    result.errors.push('Mermaid 代码不能为空');
    return result;
  }

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    result.isValid = false;
    result.errors.push('Mermaid 代码不能为空');
    return result;
  }

  // 检测图表类型
  const firstLine = trimmedCode.split('\n')[0].trim().toLowerCase();
  let chartType: string | undefined;

  for (const type of MERMAID_CHART_TYPES) {
    if (firstLine.includes(type.toLowerCase())) {
      chartType = type;
      break;
    }
  }

  if (!chartType) {
    result.warnings.push('无法识别图表类型，可能导致渲染失败');
  } else {
    result.chartType = chartType;
  }

  // 基本语法检查
  const lines = trimmedCode.split('\n');
  
  // 检查是否有基本的图表定义
  if (lines.length < 2) {
    result.warnings.push('图表定义过于简单，建议添加更多内容');
  }

  // 检查常见的语法错误
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 检查括号匹配
    const openBrackets = (line.match(/[\[\(\{]/g) || []).length;
    const closeBrackets = (line.match(/[\]\)\}]/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      result.warnings.push(`第 ${i + 1} 行：括号可能不匹配`);
    }

    // 检查箭头语法
    if (line.includes('->') || line.includes('-->')) {
      if (!line.includes('|') && line.includes('->') && !line.includes('-->')) {
        result.warnings.push(`第 ${i + 1} 行：建议使用 --> 而不是 ->`);
      }
    }
  }

  return result;
}

/**
 * 验证渲染选项
 */
export function validateRenderOptions(options: MermaidRenderOptions): ValidationResult {
  const schema = Joi.object({
    mermaidCode: Joi.string().required().min(1),
    format: Joi.string().valid('png', 'svg').default('png'),
    theme: Joi.string().optional(),
    backgroundColor: Joi.string().optional(),
    width: Joi.number().integer().min(100).max(4000).optional(),
    height: Joi.number().integer().min(100).max(4000).optional()
  });

  const { error } = schema.validate(options);
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
      warnings: []
    };
  }

  // 验证 Mermaid 代码
  const codeValidation = validateMermaidCode(options.mermaidCode);
  
  return {
    isValid: codeValidation.isValid,
    errors: codeValidation.errors,
    warnings: codeValidation.warnings,
    chartType: codeValidation.chartType
  };
}

/**
 * 验证保存选项
 */
export function validateSaveOptions(options: SaveMermaidOptions): ValidationResult {
  const schema = Joi.object({
    mermaidCode: Joi.string().required().min(1),
    localPath: Joi.string().required().min(1),
    filename: Joi.string().optional(),
    createDir: Joi.boolean().default(true),
    format: Joi.string().valid('png', 'svg').default('png'),
    theme: Joi.string().optional(),
    backgroundColor: Joi.string().optional(),
    width: Joi.number().integer().min(100).max(4000).optional(),
    height: Joi.number().integer().min(100).max(4000).optional()
  });

  const { error } = schema.validate(options);
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
      warnings: []
    };
  }

  // 验证 Mermaid 代码
  const codeValidation = validateMermaidCode(options.mermaidCode);
  
  return {
    isValid: codeValidation.isValid,
    errors: codeValidation.errors,
    warnings: codeValidation.warnings,
    chartType: codeValidation.chartType
  };
}

/**
 * 验证批量渲染选项
 */
export function validateBatchOptions(options: BatchRenderOptions): ValidationResult {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        mermaidCode: Joi.string().required().min(1),
        format: Joi.string().valid('png', 'svg').optional(),
        localPath: Joi.string().optional(),
        filename: Joi.string().optional(),
        createDir: Joi.boolean().optional(),
        theme: Joi.string().optional(),
        backgroundColor: Joi.string().optional(),
        width: Joi.number().integer().min(100).max(4000).optional(),
        height: Joi.number().integer().min(100).max(4000).optional()
      })
    ).required().min(1).max(50), // 限制最多 50 个项目
    theme: Joi.string().optional(),
    backgroundColor: Joi.string().optional()
  });

  const { error } = schema.validate(options);
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
      warnings: []
    };
  }

  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // 验证每个项目的 Mermaid 代码
  for (let i = 0; i < options.items.length; i++) {
    const item = options.items[i];
    const codeValidation = validateMermaidCode(item.mermaidCode);
    
    if (!codeValidation.isValid) {
      result.isValid = false;
      result.errors.push(`项目 ${i + 1}: ${codeValidation.errors.join(', ')}`);
    }
    
    if (codeValidation.warnings.length > 0) {
      result.warnings.push(`项目 ${i + 1}: ${codeValidation.warnings.join(', ')}`);
    }
  }

  return result;
}