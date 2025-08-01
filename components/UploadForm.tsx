'use client'

import { useState } from 'react'

interface UploadResponse {
  success: boolean
  text?: string
  error?: string
  metadata?: {
    fileName: string
    fileSize: number
    textLength: number
    processedAt: string
    requestId: string
  }
}

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [extractedText, setExtractedText] = useState<string>('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset state
    setUploadStatus('')
    setExtractedText('')
    setIsUploading(true)

    console.log('🔍 DEBUGGING: Starting file upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    try {
      // Validate file type on frontend
      if (file.type !== 'application/pdf') {
        throw new Error('Please select a PDF file')
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      setUploadStatus('Uploading and processing PDF...')

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      console.log('🔍 DEBUGGING: Sending request to /api/upload')

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('🔍 DEBUGGING: Received response', {
        status: response.status,
        statusText: response.statusText
      })

      const data: UploadResponse = await response.json()

      console.log('🔍 DEBUGGING: Response data', data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      // Success!
      setUploadStatus(`✅ Successfully extracted ${data.text?.length} characters`)
      setExtractedText(data.text || '')
      
      console.log('🔍 DEBUGGING: Extracted text preview (first 500 chars):', 
        data.text?.substring(0, 500))
      console.log('🔍 DEBUGGING: Full metadata:', data.metadata)

      // Log the extracted text (as requested)
      console.log('Extracted text:', data.text)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setUploadStatus(`❌ Error: ${errorMessage}`)
      console.error('🔍 DEBUGGING: Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div className="mb-4">
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Choose PDF File'
            )}
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </div>
        
        <p className="text-sm text-gray-500">
          Upload a PDF file to extract text (max 10MB)
        </p>
      </div>

      {/* Status Display */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadStatus.startsWith('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : uploadStatus.startsWith('❌')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {uploadStatus}
        </div>
      )}

      {/* Text Preview */}
      {extractedText && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Extracted Text Preview
          </h3>
          <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {extractedText.substring(0, 1000)}
              {extractedText.length > 1000 && '...\n\n[Text truncated for preview]'}
            </pre>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total length: {extractedText.length} characters
          </p>
        </div>
      )}
    </div>
  )
} 