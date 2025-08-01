'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

const WelcomeSection = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getTimeOfDay = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* FuturoPal Mascot */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg float-animation">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, Josh!
            </h1>
            <p className="text-blue-100 text-lg">
              It's good to see you again. Ready to continue your learning journey this {getTimeOfDay()}?
            </p>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🇪🇸</span>
              </div>
            </div>
            <p className="text-sm text-blue-100">Spanish B2</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">65%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              aria-label="Previous lesson"
              title="Previous lesson"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2">
              <Play size={16} />
              <span>Continue</span>
            </button>
            <button 
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              aria-label="Next lesson"
              title="Next lesson"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection 