'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect?: (file: File) => void
  disabled?: boolean
}

const ImageUpload = ({ onImageSelect, disabled = false }: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    // Show warning that images are not supported
    alert('⚠️ Image files are not supported in the current version.\n\nDeepSeek V3 is a text-only model and cannot process images.\n\nPlease upload text documents instead:\n• PDF files\n• Word documents (.docx)\n• Text files (.txt)\n• Markdown files (.md)')
    return
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-orange-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Image Upload Not Supported
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              DeepSeek V3 is a text-only model and cannot process images.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Supported formats:</strong></p>
              <p>📄 PDF documents</p>
              <p>📘 Word documents (.docx)</p>
              <p>📝 Text files (.txt)</p>
              <p>📋 Markdown files (.md)</p>
            </div>
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="image-upload"
          />
          
          <label
            htmlFor="image-upload"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
            }`}
          >
            Upload Text Documents Instead
          </label>
        </div>
      </div>
      
      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 