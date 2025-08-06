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
    const baseStyles = "relative overflow-hidden transition-all duration-200 transform"
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg`
      case 'secondary':
        return `${baseStyles} bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500 text-white shadow-md hover:shadow-lg`
      case 'accent':
        return `${baseStyles} bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-md hover:shadow-lg`
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg`
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
        ${isHovered ? 'scale-105 -translate-y-1' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        px-4 py-3 rounded-2xl font-medium text-sm
        flex items-center space-x-2
        min-w-fit max-w-xs
        group
      `}
    >
      {/* Background animation overlay */}
      <div className={`
        absolute inset-0 bg-white opacity-0 transition-opacity duration-200
        ${isClicked ? 'opacity-20' : ''}
        rounded-2xl
      `} />
      
      {/* Content */}
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span className="relative z-10 font-medium">
        {text}
      </span>
      
      {/* Send icon that appears on hover */}
      <Send 
        size={14} 
        className={`
          transition-all duration-200 relative z-10
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
        `}
      />
      
      {/* Shimmer effect for extra engagement */}
      <div className={`
        absolute inset-0 -top-2 -bottom-2
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        skew-x-12 transition-transform duration-1000
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
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
    <div className="mt-4 space-y-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="font-medium">Quick suggestions to get started:</span>
      </div>
      
      <div className={`grid gap-3 ${
        maxColumns === 1 ? 'grid-cols-1' : 
        maxColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {suggestions.map((suggestion, index) => (
          <SuggestionChip
            key={index}
            text={suggestion.text}
            icon={suggestion.icon}
            variant={suggestion.variant || (index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent')}
            onClick={onChipClick}
            disabled={disabled}
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center pt-2 italic">
        💡 <strong>Pro tip:</strong> Click any suggestion to jump right in, or type your own question below!
      </div>
    </div>
  )
}

export default SuggestionChip