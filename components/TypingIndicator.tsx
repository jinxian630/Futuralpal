'use client'

import React from 'react'

interface TypingIndicatorProps {
  message?: string
  variant?: 'default' | 'compact'
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  message = "AI is thinking...",
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="italic">{message}</span>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-full lg:max-w-4xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 py-3 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          {/* AI Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🤖</span>
            </div>
          </div>
          
          {/* Typing Animation */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-blue-600 font-medium text-sm italic animate-pulse">
                {message}
              </span>
            </div>
          </div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-30" />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator