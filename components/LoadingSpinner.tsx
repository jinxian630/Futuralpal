'use client'

import React from 'react'
import { Loader2, Brain, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  type?: 'default' | 'thinking' | 'generating'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  type = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  }

  const getIcon = () => {
    switch (type) {
      case 'thinking':
        return <Brain className={`${sizeClasses[size]} animate-pulse text-purple-500`} />
      case 'generating':
        return <Sparkles className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-gray-600`} />
    }
  }

  const getMessage = () => {
    if (message) return message
    
    switch (type) {
      case 'thinking':
        return 'AI is thinking...'
      case 'generating':
        return 'Generating content...'
      default:
        return 'Loading...'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
      <div className="relative">
        {getIcon()}
        
        {/* Animated ring around the icon */}
        <div className={`absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin ${sizeClasses[size]}`} />
      </div>
      
      {(message || type !== 'default') && (
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-gray-700 animate-pulse">
            {getMessage()}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping animation-delay-200" />
            <div className="w-1 h-1 bg-pink-500 rounded-full animate-ping animation-delay-400" />
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner