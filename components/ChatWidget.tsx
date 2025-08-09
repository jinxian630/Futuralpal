'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type ActionName =
  | 'create_room'
  | 'find_study_group'
  | 'collab_tips'
  | 'market_courses_under_points'
  | 'market_popular'
  | 'earn_points'
  | 'view_assignments'
  | 'check_progress'
  | 'study_tips'
  | 'view_at_risk'
  | 'create_assignment'
  | 'teaching_tips'

type MessageType = {
  role: 'bot' | 'user' | 'system'
  text: string
  isSystemReminder?: boolean
}

export default function ChatWidget() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([])
  const quickActions: { label: string; action: ActionName }[] = [
    { label: '🏠 Create Study Room', action: 'create_room' },
    { label: '👥 Find Study Group', action: 'find_study_group' },
    { label: '🤝 Collaboration Tips', action: 'collab_tips' },
    { label: '💰 Courses Under 0 Points', action: 'market_courses_under_points' },
    { label: '🔥 Popular Courses', action: 'market_popular' },
    { label: '💎 Earn Points', action: 'earn_points' },
    { label: '📝 View Assignments', action: 'view_assignments' },
    { label: '📊 Check Progress', action: 'check_progress' },
    { label: '💡 Study Tips', action: 'study_tips' },
    { label: '⚠️ View At-Risk Students', action: 'view_at_risk' },
    { label: '📝 Create Assignment', action: 'create_assignment' },
    { label: '🎓 Teaching Tips', action: 'teaching_tips' }
  ]

  // Function to parse system reminders from text
  const parseSystemReminders = (text: string): { cleanText: string; systemReminders: string[] } => {
    const systemReminderRegex = /<system-reminder[^>]*>([\s\S]*?)<\/system-reminder>/gi
    const reminders: string[] = []
    let match
    
    while ((match = systemReminderRegex.exec(text)) !== null) {
      reminders.push(match[1].trim())
    }
    
    const cleanText = text.replace(systemReminderRegex, '').trim()
    return { cleanText, systemReminders: reminders }
  }

  async function handleAction(action: ActionName) {
    setLoading(true)
    try {
      const res = await fetch('/api/chat/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload: {} })
      })
      const data = await res.json()
      
      if (data.type === 'redirect' && data.url) {
        router.push(data.url)
      } else if (data.type === 'message') {
        const { cleanText, systemReminders } = parseSystemReminders(data.text)
        
        // Add the main message if there's content
        if (cleanText) {
          setMessages((m) => [...m, { role: 'bot', text: cleanText }])
        }
        
        // Add system reminders as separate messages
        systemReminders.forEach(reminder => {
          setMessages((m) => [...m, { 
            role: 'system', 
            text: reminder, 
            isSystemReminder: true 
          }])
        })
      } else if (data.type === 'object') {
        setMessages((m) => [...m, { role: 'bot', text: JSON.stringify(data.data, null, 2) }])
      } else if (!data.ok) {
        setMessages((m) => [...m, { role: 'bot', text: data.error || 'Something went wrong — try again.' }])
      }
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { role: 'bot', text: 'Something went wrong — try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-widget bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="greeting mb-4 text-lg font-semibold text-gray-800">
        Hi — how can I help? 🤖
      </div>
      
      <div className="actions grid grid-cols-1 gap-2 mb-4">
        {quickActions.map((q) => (
          <button
            key={q.action}
            onClick={() => handleAction(q.action)}
            disabled={loading}
            className="text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg border border-blue-200 text-blue-800 font-medium transition-colors duration-200"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="messages max-h-64 overflow-y-auto space-y-2">
        {messages.map((m, idx) => {
          if (m.isSystemReminder) {
            return (
              <div key={idx} className="message p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-yellow-700 mb-1">System Reminder</div>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{m.text}</pre>
                  </div>
                </div>
              </div>
            )
          }
          
          return (
            <div key={idx} className={`message p-3 rounded-lg ${
              m.role === 'bot' 
                ? 'bg-gray-100 text-gray-800' 
                : m.role === 'system'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-sm">{m.text}</pre>
            </div>
          )
        })}
        {loading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}