/**
 * 教育AI系统的核心类型定义
 * 提供强类型支持和代码提示
 */

// 🎯 结构化教育内容类型
export interface StructuredEducationalContent {
  notes: string
  concepts: string[]
  questions: string[]
  summary: string
}

// 📊 分析元数据
export interface AnalysisMetadata {
  requestId: string
  imageType: string
  imageSize: number
  processingTime: number
  model: string
  confidence: number
  fallbackAttempts?: number
  fallbackChain?: string[]
  processingSteps: string[]
}

// 🔧 处理配置
export interface ProcessingConfig {
  maxFileSize: number
  supportedFormats: string[]
  useUrlUpload: boolean
  enableFallbacks: boolean
  maxRetries: number
}

// 📝 教育分析请求
export interface EducationAnalysisRequest {
  image: File | string // File for upload, string for URL
  prompt: string
  template?: EducationTemplate
  options?: EducationOptions
  metadata?: Record<string, any>
}

// 🎓 教育选项
export interface EducationOptions {
  subject?: string
  difficulty?: DifficultyLevel
  language?: LanguageStyle
  specialFocus?: string[]
  outputFormat?: OutputFormat
}

// 📚 教育模板
export type EducationTemplate = 
  | 'STUDY_NOTES'
  | 'QUIZ_GENERATOR' 
  | 'CONCEPT_EXTRACTOR'
  | 'HOMEWORK_HELPER'
  | 'EXAM_PREP'

// 🎯 难度级别
export type DifficultyLevel = 
  | 'elementary'
  | 'middle'
  | 'high school'
  | 'college'
  | 'graduate'

// 🗣️ 语言风格
export type LanguageStyle = 
  | 'simple'
  | 'technical'
  | 'conversational'

// 📋 输出格式
export type OutputFormat = 
  | 'notes'
  | 'quiz'
  | 'summary'
  | 'comprehensive'
  | 'custom'

// ✅ 分析响应
export interface EducationAnalysisResponse {
  success: boolean
  data?: {
    analysis: string
    structured: StructuredEducationalContent
    confidence: number
    userMessage: string
  }
  error?: string
  details?: string
  metadata?: AnalysisMetadata
}

// 🔄 进度状态
export interface ProcessingProgress {
  stage: string
  progress: number
  total: number
  message: string
  timestamp: number
}

// 🛡️ 安全配置
export interface SecurityConfig {
  allowCustomSystemPrompt: boolean
  maxPromptLength: number
  blockedKeywords: string[]
  enablePromptSanitization: boolean
}

// 📈 质量评估
export interface QualityAssessment {
  confidence: number
  clarity: number
  completeness: number
  educationalValue: number
  suggestions: string[]
}

// 🔗 图片处理结果
export interface ImageProcessingResult {
  success: boolean
  imageUrl?: string
  base64?: string
  metadata: {
    originalSize: number
    processedSize: number
    format: string
    optimizations: string[]
    processingTime: number
  }
  error?: string
}

// 🎯 重试策略
export interface RetryStrategy {
  maxAttempts: number
  backoffMultiplier: number
  initialDelayMs: number
  maxDelayMs: number
  retryableErrors: string[]
}

// 📊 使用统计
export interface UsageStats {
  totalRequests: number
  successRate: number
  averageProcessingTime: number
  averageConfidence: number
  popularTemplates: Record<EducationTemplate, number>
  errorDistribution: Record<string, number>
}

// 🔧 系统配置
export interface SystemConfig {
  processing: ProcessingConfig
  security: SecurityConfig
  retry: RetryStrategy
  monitoring: {
    enableMetrics: boolean
    enableErrorReporting: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

// 🚨 错误类型
export interface SystemError {
  code: string
  message: string
  details?: string
  requestId?: string
  timestamp: number
  stack?: string
  context?: Record<string, any>
}

// 🎨 UI状态
export interface UIState {
  selectedImage: File | null
  imagePreview: string | null
  prompt: string
  selectedTemplate: EducationTemplate
  isAnalyzing: boolean
  result: EducationAnalysisResponse | null
  error: string | null
  progress: ProcessingProgress | null
}

// 📱 组件属性
export interface ImageAnalyzerProps {
  config?: Partial<SystemConfig>
  onAnalysisComplete?: (result: EducationAnalysisResponse) => void
  onError?: (error: SystemError) => void
  onProgress?: (progress: ProcessingProgress) => void
  customTemplates?: Record<string, any>
  defaultTemplate?: EducationTemplate
}