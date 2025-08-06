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
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <Zap size={14} className="mr-1 text-blue-500" />
          Quick Actions
        </h3>
        <div className="text-xs text-gray-500">Most used</div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.tooltip}
            className={`
              relative p-2 rounded-md text-xs font-medium transition-all duration-200
              flex flex-col items-center space-y-1
              disabled:opacity-50 disabled:cursor-not-allowed
              ${action.primary 
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
            `}
          >
            <div className={`flex-shrink-0 ${action.primary ? 'text-white' : 'text-gray-600'}`}>
              {action.icon}
            </div>
            <span className="text-center leading-tight">{action.label}</span>
            
            {/* Subtle shine effect for primary buttons */}
            {action.primary && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md" />
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-500 italic">
          💡 One-click access to your favorites
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