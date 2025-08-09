'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { MessageSquare, X, Minimize2, Maximize2, Bot, Send } from 'lucide-react'
import { getEmojiForEffort } from '@/lib/effort-calculator'

export interface BotMessage {
  id: string
  role: 'bot' | 'user'
  content: string
  timestamp: Date
  actions?: BotAction[]
}

export interface BotAction {
  id: string
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface BotState {
  isOpen: boolean
  isMinimized: boolean
  messages: BotMessage[]
  effort?: number
  emoji?: string
  status?: string
  needsReminder?: boolean
  lastInteraction?: string
}

interface ModularBotProps {
  module: string // e.g. 'dashboard', 'course:123', 'marketplace'
  userId: string
  personality: BotPersonality
  quickActions?: BotAction[]
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  variant?: 'floating' | 'embedded'
}

export interface BotPersonality {
  name: string
  avatar: string
  systemPrompt: string
  welcomeMessage: string
  reminderMessages: string[]
  encouragementMessages: string[]
}

export interface ModularBotRef {
  sendMessage: (message: string) => void
}

export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  dashboard: {
    name: 'GuideBot',
    avatar: '🤖',
    systemPrompt: 'You are the FuturoPal Dashboard Assistant. When users ask about learning, AI Tutor, courses, or Digital Room features, provide helpful 2-3 sentence explanations with specific benefits and next steps. Keep answers under 100 words. Always be encouraging and actionable.',
    welcomeMessage: '👋 Hi there! I\'m your Dashboard Guide. I can help you navigate FuturoPal, check your stats, and suggest your next learning steps. What would you like to do?',
    reminderMessages: [
      '📚 You have some courses waiting for you!',
      '⭐ Ready to continue your learning journey?'
    ],
    encouragementMessages: [
      '🎉 Great progress! Keep it up!',
      '💪 You\'re doing amazing!'
    ]
  },
  course: {
    name: 'StudyPal',
    avatar: '📚',
    systemPrompt: 'You are the Course Assistant. Provide step-by-step study guidance, break complex ideas into 3 simple steps, and give a 5-minute micro task. If the student is behind, offer encouragement and a suggested 15-minute plan.',
    welcomeMessage: '📖 Welcome to your course! I\'m here to help you succeed. I can remind you about assignments, break down complex topics, and cheer you on!',
    reminderMessages: [
      '📝 You have homework due soon!',
      '⏰ Don\'t forget about your assignments!',
      '🎯 Let\'s get back on track with your studies!'
    ],
    encouragementMessages: [
      '🌟 Excellent work on that assignment!',
      '🚀 You\'re making great progress!',
      '💯 Keep up the fantastic effort!'
    ]
  },
  marketplace: {
    name: 'ShopBot',
    avatar: '🛍️',
    systemPrompt: 'You recommend courses balancing user\'s points and learning history. Return top 3 courses with a short reasoning and show a \"Redeem\" CTA.',
    welcomeMessage: '🛒 Looking for new courses? I can help you find the perfect learning opportunities that match your interests and budget!',
    reminderMessages: [
      '💰 You have enough points for some great courses!',
      '📚 Check out these new course recommendations!'
    ],
    encouragementMessages: [
      '🎉 Great choice on that course!',
      '💫 Happy learning!'
    ]
  },
  'digital-room': {
    name: 'RoomGuide',
    avatar: '🏠',
    systemPrompt: 'You help users use the digital room: how to invite, share files, start research sessions, and find collaborators. Provide step-by-step commands and link to quick tutorial.',
    welcomeMessage: '🏠 Welcome to your Digital Room! I can help you collaborate with others, share files, and organize study groups. Need help getting started?',
    reminderMessages: [
      '👥 Your study group is waiting!',
      '📋 Don\'t forget about your group project!'
    ],
    encouragementMessages: [
      '🤝 Great teamwork!',
      '🎯 Your collaboration is paying off!'
    ]
  }
}

const ModularBot = forwardRef<ModularBotRef, ModularBotProps>(({
  module,
  userId,
  personality,
  quickActions = [],
  className = '',
  position = 'bottom-right',
  variant = 'floating'
}, ref) => {
  const [botState, setBotState] = useState<BotState>({
    isOpen: false,
    isMinimized: false,
    messages: [],
    effort: undefined,
    emoji: personality.avatar,
    status: 'neutral'
  })
  
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load bot state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`bot-state-${module}-${userId}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setBotState(prev => ({
          ...prev,
          ...parsed,
          messages: parsed.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })) || []
        }))
      } catch (e) {
        console.error('Failed to parse bot state:', e)
      }
    } else {
      // Initialize with welcome message
      setBotState(prev => ({
        ...prev,
        messages: [{
          id: 'welcome',
          role: 'bot' as const,
          content: personality.welcomeMessage,
          timestamp: new Date(),
          actions: quickActions
        }]
      }))
    }
  }, [module, userId, personality.welcomeMessage, quickActions])

  // Save bot state to localStorage whenever it changes
  useEffect(() => {
    if (botState.messages.length > 0) {
      localStorage.setItem(`bot-state-${module}-${userId}`, JSON.stringify(botState))
    }
  }, [botState, module, userId])

  // Load effort score from API if this is a course bot
  useEffect(() => {
    if (module.startsWith('course:')) {
      fetchEffortScore()
    }
  }, [module])

  const fetchEffortScore = async () => {
    try {
      const response = await fetch(`/api/bot/effort-score?module=${module}&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBotState(prev => ({
          ...prev,
          effort: data.effort,
          emoji: data.emoji || personality.avatar,
          status: data.status,
          needsReminder: data.needsReminder
        }))
      }
    } catch (error) {
      console.error('Failed to fetch effort score:', error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setBotState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: personality.systemPrompt },
            ...botState.messages.slice(-5).map(msg => ({ // Last 5 messages for context
              role: msg.role === 'bot' ? 'assistant' : 'user',
              content: msg.content
            })),
            { role: 'user', content: content.trim() }
          ],
          module,
          userId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: BotMessage = {
          id: Date.now().toString(),
          role: 'bot',
          content: data.choices[0]?.message?.content || 'Sorry, I didn\'t understand that.',
          timestamp: new Date()
        }

        setBotState(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage]
        }))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: BotMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date()
      }
      setBotState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
    }

    setIsLoading(false)
  }

  const toggleOpen = () => {
    setBotState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }

  const toggleMinimize = () => {
    setBotState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))
  }

  const clearConversation = () => {
    setBotState(prev => ({
      ...prev,
      messages: [{
        id: 'welcome-new',
        role: 'bot' as const,
        content: personality.welcomeMessage,
        timestamp: new Date(),
        actions: quickActions
      }]
    }))
  }

  // Expose sendMessage function through ref
  useImperativeHandle(ref, () => ({
    sendMessage
  }), [sendMessage])

  if (variant === 'embedded') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{botState.emoji}</span>
            <div>
              <h3 className="font-medium text-gray-900">{personality.name}</h3>
              {botState.status && (
                <p className="text-sm text-gray-500 capitalize">{botState.status}</p>
              )}
            </div>
          </div>
        </div>
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {botState.messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.actions && (
                  <div className="mt-2 space-y-1">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className={`block w-full text-left px-2 py-1 rounded text-xs ${
                          action.variant === 'primary' 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage) }} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Floating variant
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {!botState.isOpen ? (
        // Bot trigger button
        <button
          onClick={toggleOpen}
          className="relative bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
        >
          <span className="text-2xl">{botState.emoji}</span>
          {botState.needsReminder && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>
      ) : (
        // Bot chat window
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{botState.emoji}</span>
              <div>
                <h3 className="font-medium text-gray-900">{personality.name}</h3>
                {botState.status && (
                  <p className="text-sm text-gray-500 capitalize">{botState.status}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Minimize chat"
                title="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={toggleOpen}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Close chat"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {!botState.isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {botState.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.actions && (
                        <div className="mt-2 space-y-1">
                          {message.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={action.action}
                              className={`block w-full text-left px-2 py-1 rounded text-xs ${
                                action.variant === 'primary' 
                                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage) }} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                    title="Send message"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

ModularBot.displayName = 'ModularBot'

export default ModularBot