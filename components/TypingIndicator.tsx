'use client'

import React from 'react'
import { Brain, Sparkles, Zap } from 'lucide-react'

interface TypingIndicatorProps {
  message?: string
  variant?: 'default' | 'compact' | 'minimal' | 'enhanced'
  type?: 'thinking' | 'generating' | 'processing'
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  message = "AI is thinking...",
  variant = 'default',
  type = 'thinking'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'generating':
        return <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
      case 'processing':
        return <Zap className="w-4 h-4 text-purple-500 animate-pulse" />
      default:
        return <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'generating':
        return {
          dots: ['bg-blue-400', 'bg-cyan-500', 'bg-purple-500'],
          gradient: 'from-blue-500 to-cyan-500'
        }
      case 'processing':
        return {
          dots: ['bg-purple-400', 'bg-pink-500', 'bg-violet-500'],
          gradient: 'from-purple-500 to-pink-500'
        }
      default:
        return {
          dots: ['bg-indigo-400', 'bg-blue-500', 'bg-purple-500'],
          gradient: 'from-indigo-500 to-purple-500'
        }
    }
  }

  const colors = getColors()

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {colors.dots.map((color, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 ${color} rounded-full animate-bounce`}
              style={{ animationDelay: `${index * 150}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 text-sm text-gray-600">
        {getIcon()}
        <div className="flex space-x-1">
          {colors.dots.map((color, index) => (
            <div
              key={index}
              className={`w-2 h-2 ${color} rounded-full animate-bounce`}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
        <span className="italic font-medium">{message}</span>
      </div>
    )
  }

  if (variant === 'enhanced') {
    return (
      <div className="flex justify-start mb-4 animate-fadeIn">
        <div className="max-w-full lg:max-w-4xl bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border-2 border-gray-200 px-6 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse opacity-50" />
          
          <div className="flex items-center space-x-4 relative z-10">
            {/* Enhanced AI Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                <span className="text-white text-lg">🤖</span>
              </div>
            </div>
            
            {/* Enhanced Typing Animation */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                {getIcon()}
                <div className="flex space-x-1">
                  {colors.dots.map((color, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 ${color} rounded-full animate-bounce shadow-sm`}
                      style={{ animationDelay: `${index * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-gray-700 font-semibold text-sm animate-pulse">
                {message}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className={`max-w-full lg:max-w-4xl bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border border-blue-200 px-5 py-3 rounded-xl shadow-sm relative overflow-hidden`}>
        <div className="flex items-center space-x-3 relative z-10">
          {/* Enhanced AI Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-9 h-9 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-md`}>
              <span className="text-white text-base">🤖</span>
            </div>
          </div>
          
          {/* Enhanced Typing Animation */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div className="flex space-x-1">
                {colors.dots.map((color, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 ${color} rounded-full animate-bounce`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
              <span className="text-gray-700 font-semibold text-sm animate-pulse">
                {message}
              </span>
            </div>
          </div>
        </div>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50" />
      </div>
    </div>
  )
}

export default TypingIndicator