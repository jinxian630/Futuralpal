'use client'
import ChatWidget from '@/components/ChatWidget'

export default function TestChatWidget() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">ChatWidget Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-6">
            Test all the ChatWidget buttons below. Each button should trigger a specific action:
          </p>
          
          <ul className="text-sm text-gray-500 mb-6 space-y-1">
            <li>• 🏠 Create Study Room - Should redirect to digital room page</li>
            <li>• 👥 Find Study Group - Should return list of study groups</li>
            <li>• 🤝 Collaboration Tips - Should return AI-generated tips</li>
            <li>• 💰 Courses Under 0 Points - Should return affordable courses</li>
            <li>• 🔥 Popular Courses - Should return popular courses list</li>
            <li>• 💎 Earn Points - Should return tips for earning points</li>
            <li>• 📝 View Assignments - Should return user assignments</li>
            <li>• 📊 Check Progress - Should return user progress data</li>
            <li>• 💡 Study Tips - Should return AI study tips</li>
            <li>• ⚠️ View At-Risk Students - Should return at-risk students list</li>
            <li>• 📝 Create Assignment - Should create a new assignment</li>
            <li>• 🎓 Teaching Tips - Should return AI teaching tips</li>
          </ul>
          
          <ChatWidget />
        </div>
      </div>
    </div>
  )
}