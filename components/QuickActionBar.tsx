'use client'

import React from 'react'
import { Target, HelpCircle, Zap, Brain, BookOpen } from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tooltip?: string
  primary?: boolean
}

interface QuickActionBarProps {
  actions: QuickAction[]
  className?: string
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({ 
  actions, 
  className = "" 
}) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <div className="p-1 bg-blue-500 rounded-md">
            <Zap size={12} className="text-white" />
          </div>
          Quick Actions
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Ready to go
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.tooltip}
            className={`
              group relative p-3 rounded-xl text-xs font-bold transition-all duration-300
              flex flex-col items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 active:scale-95
              ${action.primary 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
              }
              focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-30
            `}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.5s ease-out forwards'
            }}
          >
            <div className={`flex-shrink-0 transition-all duration-200 ${
              action.primary 
                ? 'text-white group-hover:scale-110' 
                : 'text-gray-600 group-hover:text-blue-500 group-hover:scale-110'
            }`}>
              {action.icon}
            </div>
            <span className="text-center leading-tight text-xs font-semibold">
              {action.label}
            </span>
            
            {/* Enhanced effects for primary buttons */}
            {action.primary && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" />
                </div>
              </>
            )}
            
            {/* Disabled state overlay */}
            {action.disabled && (
              <div className="absolute inset-0 bg-gray-100/50 rounded-xl flex items-center justify-center">
                <div className="text-xs text-gray-400 font-medium">Coming soon</div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <span>✨</span>
          <span className="italic">Tap to activate your learning superpowers</span>
          <span>🚀</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate smart quick actions based on context
export const generateSmartQuickActions = (
  studyContext: string,
  questionsAnswered: number,
  isGenerating: boolean,
  handlers: {
    onStartQuiz: () => void
    onCreateFlashcards: () => void  
    onGetHelp: () => void
    onGetExamples: () => void
  }
): QuickAction[] => {
  const baseActions: QuickAction[] = [
    {
      id: 'quiz',
      label: 'Start Quiz',
      icon: <Target size={16} />,
      onClick: handlers.onStartQuiz,
      disabled: !studyContext || isGenerating,
      tooltip: studyContext ? 'Start an easy quiz to warm up!' : 'Select a topic first',
      primary: !!studyContext && questionsAnswered < 3
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <BookOpen size={16} />,
      onClick: handlers.onCreateFlashcards,
      disabled: !studyContext || isGenerating,
      tooltip: studyContext ? 'Create memory aids for key concepts' : 'Select a topic first',
      primary: questionsAnswered >= 2
    },
    {
      id: 'help',
      label: 'Get Help',
      icon: <HelpCircle size={16} />,
      onClick: handlers.onGetHelp,
      disabled: isGenerating,
      tooltip: 'Ask me anything or get examples',
      primary: false
    }
  ]

  // Add context-aware actions
  if (questionsAnswered >= 5) {
    baseActions[0] = {
      ...baseActions[0],
      label: 'Challenge',
      tooltip: 'Ready for harder questions?',
      primary: true
    }
  }

  if (studyContext && questionsAnswered >= 1) {
    baseActions[2] = {
      id: 'examples',
      label: 'Examples',
      icon: <Brain size={16} />,
      onClick: handlers.onGetExamples,
      disabled: isGenerating,
      tooltip: 'Get detailed examples and explanations',
      primary: false
    }
  }

  return baseActions
}

export default QuickActionBar