/**
 * 统一错误处理和监控系统
 * 提供错误上报、日志记录和监控功能
 */

import { SystemError } from '@/lib/types/education'

export enum ErrorCode {
  // 文件处理错误
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_FORMAT = 'FILE_INVALID_FORMAT',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  
  // API调用错误
  VISION_API_FAILED = 'VISION_API_FAILED',
  VISION_API_TIMEOUT = 'VISION_API_TIMEOUT',
  VISION_API_RATE_LIMITED = 'VISION_API_RATE_LIMITED',
  
  // 验证错误
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PROMPT_INJECTION_DETECTED = 'PROMPT_INJECTION_DETECTED',
  INVALID_REQUEST_FORMAT = 'INVALID_REQUEST_FORMAT',
  
  // 处理错误
  JSON_PARSE_FAILED = 'JSON_PARSE_FAILED',
  CONTENT_STRUCTURE_INVALID = 'CONTENT_STRUCTURE_INVALID',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  
  // 系统错误
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

export interface ErrorContext {
  requestId?: string
  userId?: string
  imageMetadata?: {
    name: string
    size: number
    type: string
  }
  prompt?: string
  template?: string
  processingStage?: string
  apiResponse?: any
  additionalData?: Record<string, any>
}

export interface ErrorReportingConfig {
  enableSentry?: boolean
  enableSlack?: boolean
  enableCustomWebhook?: boolean
  webhookUrl?: string
  slackChannel?: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  enableStackTrace: boolean
}

export class ErrorHandler {
  private static config: ErrorReportingConfig = {
    logLevel: 'error',
    enableStackTrace: true
  }
  
  /**
   * 配置错误处理系统
   */
  static configure(config: Partial<ErrorReportingConfig>) {
    this.config = { ...this.config, ...config }
  }
  
  /**
   * 创建标准化错误对象
   */
  static createError(
    code: ErrorCode,
    message: string,
    context?: ErrorContext,
    originalError?: Error
  ): SystemError {
    return {
      code,
      message,
      details: originalError?.message,
      requestId: context?.requestId,
      timestamp: Date.now(),
      stack: this.config.enableStackTrace ? originalError?.stack : undefined,
      context: {
        ...context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      }
    }
  }
  
  /**
   * 处理和上报错误
   */
  static async handleError(
    error: SystemError | Error | unknown,
    context?: ErrorContext
  ): Promise<SystemError> {
    let systemError: SystemError
    
    // 标准化错误对象
    if (error instanceof Error) {
      systemError = this.createError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message,
        context,
        error
      )
    } else if (this.isSystemError(error)) {
      systemError = error
    } else {
      systemError = this.createError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Unknown error occurred',
        context
      )
    }
    
    // 记录日志
    this.logError(systemError)
    
    // 上报错误
    await this.reportError(systemError)
    
    return systemError
  }
  
  /**
   * 专门处理服务器API错误
   */
  static async handleServerError(
    error: Error | unknown,
    requestId: string,
    context?: Partial<ErrorContext>
  ): Promise<SystemError> {
    const errorContext: ErrorContext = {
      requestId,
      processingStage: 'server_processing',
      ...context
    }
    
    console.error(`❌ [${requestId}] Server error:`, error)
    
    return this.handleError(error, errorContext)
  }
  
  /**
   * 处理Vision API错误
   */
  static async handleVisionApiError(
    error: Error | unknown,
    requestId: string,
    apiResponse?: any
  ): Promise<SystemError> {
    let errorCode = ErrorCode.VISION_API_FAILED
    
    // 根据错误类型确定具体错误码
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorCode = ErrorCode.VISION_API_TIMEOUT
      } else if (error.message.includes('rate limit')) {
        errorCode = ErrorCode.VISION_API_RATE_LIMITED
      }
    }
    
    const systemError = this.createError(
      errorCode,
      'Vision API调用失败',
      {
        requestId,
        processingStage: 'vision_api_call',
        apiResponse
      },
      error instanceof Error ? error : undefined
    )
    
    console.error(`🔍 [${requestId}] Vision API error:`, error)
    
    await this.reportError(systemError)
    return systemError
  }
  
  /**
   * 处理文件上传错误
   */
  static handleFileError(
    file: File,
    errorType: 'size' | 'format' | 'upload',
    requestId?: string
  ): SystemError {
    const errorCodes = {
      size: ErrorCode.FILE_TOO_LARGE,
      format: ErrorCode.FILE_INVALID_FORMAT,
      upload: ErrorCode.FILE_UPLOAD_FAILED
    }
    
    const messages = {
      size: `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      format: `不支持的文件格式: ${file.type}`,
      upload: '文件上传失败'
    }
    
    return this.createError(
      errorCodes[errorType],
      messages[errorType],
      {
        requestId,
        imageMetadata: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }
    )
  }
  
  /**
   * 处理验证错误
   */
  static handleValidationError(
    validationError: string,
    context?: ErrorContext
  ): SystemError {
    return this.createError(
      ErrorCode.VALIDATION_FAILED,
      `验证失败: ${validationError}`,
      context
    )
  }
  
  /**
   * 检测和处理Prompt注入
   */
  static handlePromptInjection(
    prompt: string,
    requestId?: string
  ): SystemError {
    return this.createError(
      ErrorCode.PROMPT_INJECTION_DETECTED,
      '检测到可疑的prompt注入尝试',
      {
        requestId,
        prompt: prompt.substring(0, 100) + '...', // 只记录前100个字符
        processingStage: 'prompt_validation'
      }
    )
  }
  
  /**
   * 记录错误日志
   */
  private static logError(error: SystemError) {
    const logLevel = this.getLogLevel(error.code as ErrorCode)
    const logMessage = `[${error.code}] ${error.message}`
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, {
          requestId: error.requestId,
          timestamp: new Date(error.timestamp).toISOString(),
          context: error.context
        })
        break
      case 'warn':
        console.warn(logMessage, error.context)
        break
      case 'info':
        console.info(logMessage, error.context)
        break
      case 'debug':
        console.debug(logMessage, error)
        break
    }
  }
  
  /**
   * 上报错误到外部服务
   */
  private static async reportError(error: SystemError) {
    const promises: Promise<void>[] = []
    
    // Sentry上报
    if (this.config.enableSentry) {
      promises.push(this.reportToSentry(error))
    }
    
    // Slack通知
    if (this.config.enableSlack && this.shouldNotifySlack(error.code as ErrorCode)) {
      promises.push(this.reportToSlack(error))
    }
    
    // 自定义Webhook
    if (this.config.enableCustomWebhook && this.config.webhookUrl) {
      promises.push(this.reportToWebhook(error))
    }
    
    // 并行执行所有上报任务
    try {
      await Promise.allSettled(promises)
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError)
    }
  }
  
  /**
   * 上报到Sentry
   */
  private static async reportToSentry(error: SystemError): Promise<void> {
    // TODO: 集成Sentry SDK
    console.log('📊 Sentry报告:', error.code, error.message)
  }
  
  /**
   * 上报到Slack
   */
  private static async reportToSlack(error: SystemError): Promise<void> {
    if (!this.config.slackChannel) return
    
    const slackMessage = {
      channel: this.config.slackChannel,
      text: `🚨 系统错误: ${error.code}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: '错误码', value: error.code, short: true },
          { title: '时间', value: new Date(error.timestamp).toISOString(), short: true },
          { title: '请求ID', value: error.requestId || 'N/A', short: true },
          { title: '消息', value: error.message, short: false }
        ]
      }]
    }
    
    // TODO: 发送到Slack
    console.log('💬 Slack通知:', slackMessage)
  }
  
  /**
   * 上报到自定义Webhook
   */
  private static async reportToWebhook(error: SystemError): Promise<void> {
    if (!this.config.webhookUrl) return
    
    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          service: 'education-ai',
          environment: process.env.NODE_ENV || 'development'
        })
      })
    } catch (webhookError) {
      console.warn('Webhook上报失败:', webhookError)
    }
  }
  
  /**
   * 获取错误的日志级别
   */
  private static getLogLevel(errorCode: ErrorCode): 'debug' | 'info' | 'warn' | 'error' {
    const criticalErrors = [
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      ErrorCode.VISION_API_FAILED
    ]
    
    const warningErrors = [
      ErrorCode.FILE_TOO_LARGE,
      ErrorCode.VALIDATION_FAILED,
      ErrorCode.PROMPT_INJECTION_DETECTED
    ]
    
    if (criticalErrors.includes(errorCode)) return 'error'
    if (warningErrors.includes(errorCode)) return 'warn'
    return 'info'
  }
  
  /**
   * 判断是否需要Slack通知
   */
  private static shouldNotifySlack(errorCode: ErrorCode): boolean {
    const notifyErrors = [
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCode.VISION_API_FAILED,
      ErrorCode.DATABASE_ERROR,
      ErrorCode.PROMPT_INJECTION_DETECTED
    ]
    
    return notifyErrors.includes(errorCode)
  }
  
  /**
   * 类型守护函数
   */
  private static isSystemError(error: unknown): error is SystemError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'timestamp' in error
    )
  }
}

/**
 * 简化的错误处理工具函数
 */
export const handleServerError = ErrorHandler.handleServerError.bind(ErrorHandler)
export const handleVisionApiError = ErrorHandler.handleVisionApiError.bind(ErrorHandler)
export const handleFileError = ErrorHandler.handleFileError.bind(ErrorHandler)
export const handleValidationError = ErrorHandler.handleValidationError.bind(ErrorHandler)
export const handlePromptInjection = ErrorHandler.handlePromptInjection.bind(ErrorHandler)