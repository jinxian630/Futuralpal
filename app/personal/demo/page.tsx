'use client'

import { useState } from 'react'
import { 
  Bot, 
  Users, 
  BookOpen, 
  ShoppingCart, 
  Home, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'

const DemoPage = () => {
  const { user, isAuthenticated } = useUser()
  const router = useRouter()
  const [demoStep, setDemoStep] = useState(0)

  const demoFeatures = [
    {
      title: '🤖 Modular AI Bots',
      description: 'Each section has its own specialized AI assistant with unique personality and capabilities',
      pages: [
        { name: 'Dashboard Bot', path: '/personal/dashboard', description: 'Helps navigate and suggests next actions' },
        { name: 'Course Bot', path: '/personal/courses', description: 'Tracks progress with emoji states 😄→😐→😡' },
        { name: 'Marketplace Bot', path: '/personal/marketplace', description: 'Recommends courses based on points and interests' },
        { name: 'Digital Room Bot', path: '/personal/digital-room', description: 'Guides collaboration and study groups' },
        { name: 'Assignment Bot', path: '/personal/assignments', description: 'Helps with homework and study tips' }
      ]
    },
    {
      title: '👨‍🏫 Tutor Dashboard',
      description: 'AI-powered teacher tools for identifying at-risk students and providing interventions',
      pages: [
        { name: 'Student Risk Dashboard', path: '/personal/tutor', description: 'See struggling students with emoji indicators' },
        { name: 'AI Action Plans', path: '/personal/tutor', description: 'Generate personalized remediation plans' },
        { name: 'Quick Interventions', path: '/personal/tutor', description: 'Create practice quizzes and send encouragement' }
      ]
    },
    {
      title: '📝 Homework System',
      description: 'Complete assignment workflow with effort scoring and automated reminders',
      pages: [
        { name: 'Assignment Submission', path: '/personal/assignments', description: 'Students submit homework with due date tracking' },
        { name: 'Effort Score Calculation', path: '/personal/assignments', description: 'Automatic 😄→😐→😡 emoji based on performance' },
        { name: 'Progress Synchronization', path: '/personal/marketplace', description: 'NFT points sync with actual XP progress' }
      ]
    }
  ]

  const seedDemoData = async () => {
    try {
      const response = await fetch('/api/demo/seed-data', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert('🌱 Demo data created! Now you can see the full system in action with:\n\n• Demo course with assignments\n• Student homework tracking\n• Bot emoji states\n• Tutor risk dashboard')
      } else {
        alert('Failed to create demo data: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">FuturoPal Demo</h2>
          <p className="text-gray-600 mb-6">Please log in to explore the AI-powered learning platform</p>
          <button
            onClick={() => router.push('/register')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold text-gray-900">FuturoPal Demo</h1>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the complete AI-powered learning platform with modular bots, 
              homework tracking, emoji-based engagement, and intelligent tutoring assistance.
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Modular Bot System
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Emoji Engagement States
              </div>
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ AI Tutor Dashboard
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={seedDemoData}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
              >
                <Sparkles size={20} />
                <span>🌱 Create Demo Data</span>
              </button>
              <button
                onClick={() => router.push('/personal/dashboard')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
              >
                <Bot size={20} />
                <span>Start Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-8">
          {demoFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
                <p className="text-blue-100">{feature.description}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feature.pages.map((page, pageIndex) => (
                    <button
                      key={pageIndex}
                      onClick={() => router.push(page.path)}
                      className="group text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {page.name}
                        </h3>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-600">{page.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Demo Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/personal/tutor')}
              className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="text-red-600" size={24} />
              <div className="text-left">
                <h3 className="font-medium text-red-900">View At-Risk Students</h3>
                <p className="text-sm text-red-700">See which students need help</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/personal/assignments')}
              className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="text-blue-600" size={24} />
              <div className="text-left">
                <h3 className="font-medium text-blue-900">Submit Homework</h3>
                <p className="text-sm text-blue-700">Complete and submit assignments</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/personal/marketplace')}
              className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="text-green-600" size={24} />
              <div className="text-left">
                <h3 className="font-medium text-green-900">Check NFT Points</h3>
                <p className="text-sm text-green-700">See synchronized progress</p>
              </div>
            </button>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Implementation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Completed Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Modular bot framework with state persistence</li>
                <li>• Course-specific bots with emoji states</li>
                <li>• Homework tracking and submission system</li>
                <li>• Effort score calculation (😄→😐→😡)</li>
                <li>• Tutor dashboard with student risk detection</li>
                <li>• AI-powered intervention tools</li>
                <li>• Progress synchronization across modules</li>
                <li>• Database models and API endpoints</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-3">🚧 Ready for Extension</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Real-time chat in digital rooms</li>
                <li>• File upload for assignments</li>
                <li>• Advanced analytics dashboard</li>
                <li>• Email/push notifications</li>
                <li>• NFT rewards integration</li>
                <li>• Vector memory for personalization</li>
                <li>• Mobile app companion</li>
                <li>• LMS integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Overview */}
        <div className="bg-gray-900 text-white rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">🔧 Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Backend</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Next.js API routes</li>
                <li>• Prisma ORM + SQLite</li>
                <li>• OpenAI integration</li>
                <li>• Effort calculation engine</li>
                <li>• Bot state management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">Frontend</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Modular bot components</li>
                <li>• Real-time UI updates</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">AI Features</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Module-specific prompts</li>
                <li>• Conversation persistence</li>
                <li>• Contextual quick actions</li>
                <li>• Automated interventions</li>
                <li>• Personalization engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPage