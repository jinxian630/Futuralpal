'use client'

import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface SuggestionChipProps {
  text: string
  icon?: string
  onClick: (text: string) => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'accent'
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  text,
  icon = '💡',
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  const [isClicked, setIsClicked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (disabled) return
    
    setIsClicked(true)
    onClick(text)
    
    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 300)
  }

  const getVariantStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 transform"
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-2xl`
      case 'secondary':
        return `${baseStyles} bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 hover:from-teal-500 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-2xl`
      case 'accent':
        return `${baseStyles} bg-gradient-to-br from-pink-400 via-rose-500 to-purple-600 hover:from-pink-500 hover:via-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl`
      default:
        return `${baseStyles} bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-2xl`
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${getVariantStyles()}
        ${isClicked ? 'scale-95 ring-4 ring-blue-300 ring-opacity-50' : ''}
        ${isHovered ? 'scale-110 -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:cursor-pointer'}
        px-5 py-4 rounded-2xl font-semibold text-sm
        flex items-center space-x-3
        min-w-fit w-full sm:max-w-xs
        group active:scale-95
      `}
    >
      {/* Enhanced Background animation overlay */}
      <div className={`
        absolute inset-0 bg-white opacity-0 transition-all duration-300
        ${isClicked ? 'opacity-30' : ''}
        ${isHovered ? 'opacity-10' : ''}
        rounded-2xl
      `} />
      
      {/* Content with enhanced animations */}
      <span className={`text-2xl transition-all duration-300 ${
        isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'
      }`}>
        {icon}
      </span>
      
      <span className="relative z-10 font-bold flex-1 text-left">
        {text}
      </span>
      
      {/* Enhanced Send icon that appears on hover */}
      <Send 
        size={16} 
        className={`
          transition-all duration-300 relative z-10 flex-shrink-0
          ${isHovered ? 'opacity-100 translate-x-0 scale-110' : 'opacity-0 -translate-x-3 scale-75'}
        `}
      />
      
      {/* Enhanced shimmer effect */}
      <div className={`
        absolute inset-0 -top-4 -bottom-4
        bg-gradient-to-r from-transparent via-white/30 to-transparent
        skew-x-12 transition-transform duration-700
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
        pointer-events-none
      `} />
      
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl transition-opacity duration-300
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20
        blur-xl -z-10
      `} />
    </button>
  )
}

interface SuggestionChipsProps {
  suggestions: Array<{
    text: string
    icon?: string
    variant?: 'primary' | 'secondary' | 'accent'
  }>
  onChipClick: (text: string) => void
  disabled?: boolean
  maxColumns?: number
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onChipClick,
  disabled = false,
  maxColumns = 2
}) => {
  return (
    <div className="mt-6 space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse animation-delay-200"></div>
        </div>
        <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🚀 Quick-start suggestions:
        </span>
      </div>
      
      <div className={`grid gap-4 ${
        maxColumns === 1 ? 'grid-cols-1' : 
        maxColumns === 2 ? 'grid-cols-1 lg:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="opacity-0 animate-slideInUp"
            style={{ 
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <SuggestionChip
              text={suggestion.text}
              icon={suggestion.icon}
              variant={suggestion.variant || (index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent')}
              onClick={onChipClick}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
          <span className="text-xs text-gray-600 font-medium">
            ✨ <strong>Pro tip:</strong> Tap any suggestion to dive right in, or ask me anything!
          </span>
        </div>
      </div>
    </div>
  )
}

export default SuggestionChip