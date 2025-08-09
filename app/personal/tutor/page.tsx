'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Upload, Plus, Settings, BookOpen, Users, AlertTriangle } from 'lucide-react'
import TutorDashboard from '@/components/TutorDashboard'
import ModularBot, { BOT_PERSONALITIES } from '@/components/ModularBot'
import { useUser } from '@/lib/hooks/useUser'

const TutorPage = () => {
  const searchParams = useSearchParams()
  const walletAddress = searchParams.get('address')
  const { user, isAuthenticated, isLoading } = useUser()
  const [activeView, setActiveView] = useState<'dashboard' | 'assignments' | 'upload'>('dashboard')

  // Create a demo button for seeding data
  const seedDemoData = async () => {
    try {
      const response = await fetch('/api/demo/seed-data', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert('Demo data created successfully! Check the student dashboard to see the bot in action.')
        window.location.reload()
      } else {
        alert('Failed to create demo data: ' + data.error)
      }
    } catch (error) {
      alert('Error creating demo data: ' + error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading tutor dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in to access the tutor dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <AlertTriangle size={16} />
                <span>Student Risk Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView('assignments')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'assignments'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen size={16} />
                <span>Manage Assignments</span>
              </button>
              <button
                onClick={() => setActiveView('upload')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload size={16} />
                <span>Course Materials</span>
              </button>
            </div>
            
            <button
              onClick={seedDemoData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              🌱 Create Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && (
        <TutorDashboard tutorId={user.id || user.oidcSub} />
      )}

      {activeView === 'assignments' && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignment Management</h3>
            <p className="text-gray-600 mb-6">
              Create and manage assignments for your courses. This feature will allow you to:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <p>• ✅ Create new assignments with due dates</p>
              <p>• ✅ Grade student submissions</p>
              <p>• ✅ Track completion rates</p>
              <p>• ✅ Send automated reminders</p>
            </div>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                Coming Soon - Assignment Builder
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'upload' && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Materials</h3>
            <p className="text-gray-600 mb-6">
              Upload and manage your course content. This will include:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <p>• 📹 Video lectures</p>
              <p>• 📄 PDF materials</p>
              <p>• 📊 Presentations</p>
              <p>• 🔗 External resources</p>
            </div>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                Coming Soon - Content Uploader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutor Assistant Bot */}
      {isAuthenticated && user && (
        <ModularBot
          module="tutor-dashboard"
          userId={user.oidcSub}
          personality={{
            name: 'TutorBot',
            avatar: '👨‍🏫',
            systemPrompt: 'You are a tutor assistant. Help tutors understand their student analytics, suggest intervention strategies, and provide teaching tips. Keep responses concise and actionable.',
            welcomeMessage: '👋 Hi! I\'m your Tutor Assistant. I can help you understand student performance data, suggest ways to help struggling students, and provide teaching strategies. What would you like to know?',
            reminderMessages: [
              '📊 Check your student risk dashboard!',
              '🎯 Some students might need extra attention.'
            ],
            encouragementMessages: [
              '🌟 Great work supporting your students!',
              '📈 Your interventions are making a difference!'
            ]
          }}
          quickActions={[
            {
              id: 'view-at-risk',
              label: '⚠️ View At-Risk Students',
              action: () => setActiveView('dashboard')
            },
            {
              id: 'create-assignment',
              label: '📝 Create Assignment',
              action: () => setActiveView('assignments')
            },
            {
              id: 'teaching-tips',
              label: '💡 Teaching Tips',
              action: () => alert('Teaching tip: Use positive reinforcement and break complex topics into smaller, manageable chunks!')
            }
          ]}
          variant="floating"
          position="bottom-right"
        />
      )}
    </div>
  )
}

export default TutorPage