/**
 * Zod Schema 验证器
 * 提供强类型验证和自动类型推导
 */

import { z } from 'zod'

// 🎓 难度级别
export const DifficultyLevelSchema = z.enum([
  'elementary',
  'middle', 
  'high school',
  'college',
  'graduate'
])

// 🗣️ 语言风格
export const LanguageStyleSchema = z.enum([
  'simple',
  'technical',
  'conversational'
])

// 📚 教育模板
export const EducationTemplateSchema = z.enum([
  'STUDY_NOTES',
  'QUIZ_GENERATOR',
  'CONCEPT_EXTRACTOR', 
  'HOMEWORK_HELPER',
  'EXAM_PREP'
])

// 📋 输出格式
export const OutputFormatSchema = z.enum([
  'notes',
  'quiz',
  'summary',
  'comprehensive',
  'custom'
])

// 🎯 结构化教育内容验证
export const StructuredEducationalContentSchema = z.object({
  notes: z.string().min(1, '笔记内容不能为空'),
  concepts: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  summary: z.string().min(1, '摘要不能为空')
}).strict()

// 🎓 教育选项验证
export const EducationOptionsSchema = z.object({
  subject: z.string().optional(),
  difficulty: DifficultyLevelSchema.optional(),
  language: LanguageStyleSchema.optional(),
  specialFocus: z.array(z.string()).optional(),
  outputFormat: OutputFormatSchema.optional()
}).optional()

// 📝 教育分析请求验证
export const EducationAnalysisRequestSchema = z.object({
  prompt: z.string()
    .min(5, 'prompt至少需要5个字符')
    .max(2000, 'prompt不能超过2000个字符'),
  template: EducationTemplateSchema.optional(),
  options: EducationOptionsSchema,
  metadata: z.record(z.any()).optional()
})

// 📊 分析元数据验证
export const AnalysisMetadataSchema = z.object({
  requestId: z.string(),
  imageType: z.string(),
  imageSize: z.number().positive(),
  processingTime: z.number().positive(),
  model: z.string(),
  confidence: z.number().min(0).max(1),
  fallbackAttempts: z.number().optional(),
  fallbackChain: z.array(z.string()).optional(),
  processingSteps: z.array(z.string())
})

// ✅ 分析响应验证
export const EducationAnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    analysis: z.string(),
    structured: StructuredEducationalContentSchema,
    confidence: z.number().min(0).max(1),
    userMessage: z.string()
  }).optional(),
  error: z.string().optional(),
  details: z.string().optional(),
  metadata: AnalysisMetadataSchema.optional()
})

// 🚨 系统错误验证
export const SystemErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.string().optional(),
  requestId: z.string().optional(),
  timestamp: z.number(),
  stack: z.string().optional(),
  context: z.record(z.any()).optional()
})

// 🔧 系统配置验证
export const SystemConfigSchema = z.object({
  processing: z.object({
    maxFileSize: z.number().positive(),
    supportedFormats: z.array(z.string()),
    useUrlUpload: z.boolean(),
    enableFallbacks: z.boolean(),
    maxRetries: z.number().min(1).max(10)
  }),
  security: z.object({
    allowCustomSystemPrompt: z.boolean(),
    maxPromptLength: z.number().positive(),
    blockedKeywords: z.array(z.string()),
    enablePromptSanitization: z.boolean()
  }),
  retry: z.object({
    maxAttempts: z.number().min(1).max(5),
    backoffMultiplier: z.number().min(1),
    initialDelayMs: z.number().positive(),
    maxDelayMs: z.number().positive(),
    retryableErrors: z.array(z.string())
  }),
  monitoring: z.object({
    enableMetrics: z.boolean(),
    enableErrorReporting: z.boolean(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error'])
  })
})

// 🎨 UI状态验证
export const UIStateSchema = z.object({
  selectedImage: z.instanceof(File).nullable(),
  imagePreview: z.string().nullable(),
  prompt: z.string(),
  selectedTemplate: EducationTemplateSchema,
  isAnalyzing: z.boolean(),
  result: EducationAnalysisResponseSchema.nullable(),
  error: z.string().nullable(),
  progress: z.object({
    stage: z.string(),
    progress: z.number().min(0).max(100),
    total: z.number().positive(),
    message: z.string(),
    timestamp: z.number()
  }).nullable()
})

// 🔍 Prompt 安全验证
export const PromptSecuritySchema = z.object({
  content: z.string()
    .max(2000, 'Prompt过长')
    .refine(
      (val) => !val.toLowerCase().includes('ignore all previous instructions'),
      { message: '检测到可疑的prompt注入尝试' }
    )
    .refine(
      (val) => !val.toLowerCase().includes('system:'),
      { message: '不允许直接修改系统提示' }
    )
    .refine(
      (val) => !val.toLowerCase().includes('<script'),
      { message: '不允许包含脚本标签' }
    )
})

// 📁 文件上传验证
export const FileUploadSchema = z.object({
  name: z.string(),
  size: z.number()
    .positive('文件大小必须大于0')
    .max(50 * 1024 * 1024, '文件大小不能超过50MB'),
  type: z.string()
    .refine(
      (type) => [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
      ].includes(type),
      { message: '不支持的文件格式' }
    )
})

// 🏷️ 导出类型推导
export type StructuredEducationalContent = z.infer<typeof StructuredEducationalContentSchema>
export type EducationOptions = z.infer<typeof EducationOptionsSchema>
export type EducationAnalysisRequest = z.infer<typeof EducationAnalysisRequestSchema>
export type EducationAnalysisResponse = z.infer<typeof EducationAnalysisResponseSchema>
export type AnalysisMetadata = z.infer<typeof AnalysisMetadataSchema>
export type SystemError = z.infer<typeof SystemErrorSchema>
export type SystemConfig = z.infer<typeof SystemConfigSchema>
export type UIState = z.infer<typeof UIStateSchema>
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>
export type LanguageStyle = z.infer<typeof LanguageStyleSchema>
export type EducationTemplate = z.infer<typeof EducationTemplateSchema>
export type OutputFormat = z.infer<typeof OutputFormatSchema>

/**
 * 验证工具函数
 */
export class ValidationUtils {
  
  /**
   * 安全验证用户prompt
   */
  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    try {
      PromptSecuritySchema.parse({ content: prompt })
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          valid: false, 
          error: error.errors[0]?.message || '验证失败' 
        }
      }
      return { valid: false, error: '未知验证错误' }
    }
  }
  
  /**
   * 验证文件上传
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    try {
      FileUploadSchema.parse({
        name: file.name,
        size: file.size,
        type: file.type
      })
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          valid: false, 
          error: error.errors[0]?.message || '文件验证失败' 
        }
      }
      return { valid: false, error: '未知文件错误' }
    }
  }
  
  /**
   * 验证并解析结构化内容
   */
  static parseStructuredContent(rawJson: string): {
    success: boolean
    data?: StructuredEducationalContent
    error?: string
  } {
    try {
      const parsed = JSON.parse(rawJson)
      const validated = StructuredEducationalContentSchema.parse(parsed)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `结构验证失败: ${error.errors[0]?.message}` 
        }
      }
      if (error instanceof SyntaxError) {
        return { success: false, error: 'JSON格式错误' }
      }
      return { success: false, error: '未知解析错误' }
    }
  }
  
  /**
   * 清理和验证系统配置
   */
  static validateSystemConfig(config: unknown): {
    success: boolean
    data?: SystemConfig
    error?: string
  } {
    try {
      const validated = SystemConfigSchema.parse(config)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `配置验证失败: ${error.errors[0]?.path.join('.')} - ${error.errors[0]?.message}` 
        }
      }
      return { success: false, error: '配置格式错误' }
    }
  }
}