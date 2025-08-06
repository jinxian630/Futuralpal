'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AccordionItemProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  disabled?: boolean
  className?: string
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = false,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <button
        onClick={toggleOpen}
        disabled={disabled}
        className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-all duration-200 ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : isOpen
              ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
              : 'bg-white hover:bg-gray-50'
        }`}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <span className={`font-medium text-sm truncate ${isOpen ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            <ChevronDown size={16} className={isOpen ? 'text-blue-500' : 'text-gray-500'} />
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${id}`}
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  )
}

interface AccordionProps {
  children: ReactNode
  className?: string
  allowMultiple?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className = "",
  allowMultiple = false
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  )
}

export default Accordion