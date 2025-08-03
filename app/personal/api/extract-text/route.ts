import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

// Performance and security configuration
const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB limit
  MAX_TEXT_LENGTH: 1 * 1024 * 1024, // 1MB text limit
  TIMEOUT_MS: 30000, // 30 second timeout
}

// Supported file types with validation
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/msword': 'doc',
} as const

type SupportedFileType = typeof SUPPORTED_TYPES[keyof typeof SUPPORTED_TYPES]

// Enhanced logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[EXTRACT-TEXT] ${new Date().toISOString()} INFO: ${message}`, data || '')
  },
  error: (message: string, error?: any, data?: any) => {
    console.error(`[EXTRACT-TEXT] ${new Date().toISOString()} ERROR: ${message}`)
    if (error) console.error('Error details:', error)
    if (data) console.error('Context data:', data)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[EXTRACT-TEXT] ${new Date().toISOString()} WARN: ${message}`, data || '')
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[EXTRACT-TEXT] ${new Date().toISOString()} DEBUG: ${message}`, data || '')
    }
  }
}

// ✅ CLEAN PDF PROCESSING: No file system access, buffer-only
async function processPdfBuffer(buffer: Buffer): Promise<string> {
  // Set environment variables to prevent file system access
  const originalEnv = {
    DISABLE_PDF_PARSE_FS: process.env.DISABLE_PDF_PARSE_FS,
    PDF_PARSE_NO_FILES: process.env.PDF_PARSE_NO_FILES
  }
  
  process.env.DISABLE_PDF_PARSE_FS = 'true'
  process.env.PDF_PARSE_NO_FILES = 'true'

  try {
    // Dynamic import to avoid build-time bundling issues
    const pdfParse = await import('pdf-parse')
    const result = await pdfParse.default(buffer, {
      max: 0 // Process all pages
    })
    
    // Restore environment
    process.env.DISABLE_PDF_PARSE_FS = originalEnv.DISABLE_PDF_PARSE_FS
    process.env.PDF_PARSE_NO_FILES = originalEnv.PDF_PARSE_NO_FILES

    if (!result.text || result.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text')
    }

    return result.text

  } catch (error) {
    // Restore environment on error
    process.env.DISABLE_PDF_PARSE_FS = originalEnv.DISABLE_PDF_PARSE_FS
    process.env.PDF_PARSE_NO_FILES = originalEnv.PDF_PARSE_NO_FILES
    
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ✅ CLEAN DOCX PROCESSING: Buffer-only
async function processDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX contains no extractable text')
    }

    return result.value

  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ✅ CLEAN TEXT PROCESSING: Buffer-only
async function processTextBuffer(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8')
    
    if (text.trim().length === 0) {
      throw new Error('File contains no readable text')
    }

    return text

  } catch (error) {
    throw new Error(`Text parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ✅ MAIN EXTRACTION FUNCTION: Clean buffer-only processing
async function extractTextFromBuffer(buffer: Buffer, fileName: string, fileType: string): Promise<string> {
  logger.debug('Starting text extraction', { fileName, bufferSize: buffer.length, fileType })
    
  const fileExtension = SUPPORTED_TYPES[fileType as keyof typeof SUPPORTED_TYPES]
  
  if (!fileExtension) {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
  
  try {
    let extractedText: string

    switch (fileExtension) {
      case 'pdf':
        extractedText = await processPdfBuffer(buffer)
        break
      case 'docx':
      case 'doc':
        extractedText = await processDocxBuffer(buffer)
        break
      case 'txt':
      case 'md':
        extractedText = await processTextBuffer(buffer)
        break
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`)
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content could be extracted from the file')
    }

    // Limit text length for performance
    if (extractedText.length > CONFIG.MAX_TEXT_LENGTH) {
      logger.warn('Text content truncated due to length limit', {
        fileName,
        originalLength: extractedText.length,
        truncatedLength: CONFIG.MAX_TEXT_LENGTH
      })
      extractedText = extractedText.substring(0, CONFIG.MAX_TEXT_LENGTH) + '\n\n[Content truncated due to length limit]'
    }

    logger.info('Text extraction successful', {
      fileName,
      textLength: extractedText.length,
      fileType: fileExtension
    })

    return extractedText

  } catch (error) {
    logger.error('Text extraction failed', error, { fileName, fileType })
    throw new Error(`Failed to extract text from ${fileExtension.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ✅ MAIN API ROUTE: Clean uploaded file processing (NO HARDCODED PATHS)
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

  try {
    logger.info('File extraction request started', { requestId })

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    // ✅ PRODUCTION: Handle uploaded files (PRIMARY PATH)
    if (file) {
      logger.info('Processing uploaded file', { 
        requestId, 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      })

      // Validate file type
      if (!SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]) {
      return NextResponse.json({
        success: false,
          error: `File type "${file.type}" is not supported`,
          supportedTypes: Object.keys(SUPPORTED_TYPES),
        requestId
      }, { status: 400 })
    }

      // Validate file size
    if (file.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empty file uploaded',
        requestId
      }, { status: 400 })
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds ${(CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB limit`,
        requestId
      }, { status: 413 })
    }

      // ✅ CONVERT FILE TO BUFFER (NO FILE SYSTEM ACCESS)
      const buffer = Buffer.from(await file.arrayBuffer())
      const extractedText = await extractTextFromBuffer(buffer, file.name, file.type)

      // Create enhanced content for AI processing (compatible with existing frontend)
    const fileExtension = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    const enhancedText = `FILE PROCESSING SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 File Name: ${file.name}
📊 File Type: ${fileExtension.toUpperCase()}
📏 File Size: ${(file.size / 1024).toFixed(2)} KB
📝 Text Length: ${extractedText.length} characters
🕒 Processed: ${new Date().toLocaleString()}
🆔 Request ID: ${requestId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXTRACTED CONTENT FOR DEEPSEEK V3 ANALYSIS:

${extractedText}

PROCESSING INSTRUCTIONS FOR DEEPSEEK V3:
- This content has been extracted from a ${fileExtension.toUpperCase()} file
- Focus on educational value and learning objectives  
- Identify key concepts, formulas, and important information
- Structure analysis for optimal learning and retention
- Generate comprehensive study materials based on this content`

      // Success response (compatible with existing frontend)
      logger.info('File extraction completed successfully', { 
      requestId, 
      fileName: file.name, 
      textLength: extractedText.length 
    })

    return NextResponse.json({
      success: true,
      message: `Successfully extracted ${extractedText.length} characters from ${fileExtension.toUpperCase()} file`,
      data: {
        extractedText: enhancedText,
        originalLength: extractedText.length,
        fileInfo: {
          name: file.name,
          type: fileExtension,
          size: file.size,
          processedAt: new Date().toISOString(),
          requestId
        }
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    // ✅ ERROR: No file provided
    return NextResponse.json({
      success: false,
      error: 'No file provided',
      note: 'Please upload a text document (PDF, DOCX, TXT, or MD)',
      requestId
    }, { status: 400 })

  } catch (error) {
    logger.error('API request failed', error, { requestId })

    let errorMessage = 'Unexpected error during text extraction'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        statusCode = 408
        errorMessage = 'File processing timed out'
      } else if (error.message.includes('too large') || error.message.includes('memory')) {
        statusCode = 413
        errorMessage = 'File too large or memory limit exceeded'
      } else if (error.message.includes('Invalid') || error.message.includes('corrupted')) {
        statusCode = 400
        errorMessage = error.message
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      requestId
    }, { status: statusCode })
  }
}

// CORS support
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
} 