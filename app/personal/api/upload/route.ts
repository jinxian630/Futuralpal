import { NextRequest, NextResponse } from 'next/server'

// Configuration and constants
const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  TIMEOUT_MS: 30000, // 30 seconds
}

// Enhanced logging
function logger(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logData = data ? JSON.stringify(data, null, 2) : ''
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, logData)
}

// ✅ CLEAN PDF PROCESSING: No file system access, buffer-only
async function processPdfBuffer(buffer: Buffer, fileName: string): Promise<string> {
  try {
    // Import the core PDF parsing functionality directly to avoid debug mode
    let pdfParse;
    try {
      // Try to import the core library directly to avoid debug mode
      pdfParse = await import('pdf-parse/lib/pdf-parse')
    } catch (importError) {
      // Fallback to main library but prevent debug mode by mocking module.parent
      const originalModule = global.module
      global.module = { parent: true } as any
      pdfParse = await import('pdf-parse')
      global.module = originalModule
    }
    
    logger('info', '🔍 PDF Processing Started', {
      fileName,
      bufferSize: buffer.length,
      isBuffer: Buffer.isBuffer(buffer)
    })

    // Buffer validation
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid buffer: Not a Buffer object')
    }
    if (buffer.length === 0) {
      throw new Error('Invalid buffer: Buffer is empty')
    }
    if (buffer.length < 4) {
      throw new Error('Invalid buffer: Too small to be a valid PDF')
    }

    // PDF header validation
    const pdfHeader = buffer.subarray(0, 8).toString('ascii')
    if (!pdfHeader.startsWith('%PDF')) {
      throw new Error('Invalid PDF: File does not start with PDF header')
    }

    const result = await pdfParse.default(buffer, {
      max: 0 // Process all pages
    })

    if (!result.text || result.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text')
    }

    logger('info', '✅ PDF Processing Successful', {
      fileName,
      textLength: result.text.length,
      hasValidText: /[a-zA-Z]/.test(result.text)
    })

    return result.text

  } catch (error) {
    logger('error', '❌ PDF Processing Failed', {
      fileName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  const requestId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    logger('info', '📁 File Upload Request Started', { requestId })

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        note: 'Please upload a PDF file'
      }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: `File type "${file.type}" is not supported`,
        note: 'Only PDF files are supported'
      }, { status: 400 })
    }

    // Validate file size
    if (file.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empty file uploaded',
        note: 'The uploaded file has no content'
      }, { status: 400 })
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds ${(CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB limit`
      }, { status: 413 })
    }

    logger('info', '📋 File Validation Passed', {
      requestId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // ✅ CONVERT FILE TO BUFFER (NO FILE SYSTEM ACCESS)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    logger('info', '🔄 Converting to Buffer', {
      requestId,
      originalSize: file.size,
      bufferSize: buffer.length,
      buffersMatch: file.size === buffer.length
    })

    // Extract text using clean buffer-only PDF parser
    const extractedText = await processPdfBuffer(buffer, file.name)

    // Validate extracted text
    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'PDF parsing failed or empty',
        note: 'The PDF may be corrupted, password-protected, or contain no readable text'
      }, { status: 400 })
    }

    logger('info', '✅ Upload Processing Complete', {
      requestId,
      fileName: file.name,
      extractedLength: extractedText.length
    })

    // Success response matching the user's requested format
    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        textLength: extractedText.length,
        processedAt: new Date().toISOString(),
        requestId
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    logger('error', '❌ Upload Request Failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    let errorMessage = 'Unexpected error during file processing'
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