'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, ChevronLeft, ChevronRight, Clock, Users, Award, BookOpen, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import CourseCard from '@/components/CourseCard'
import ProgressChart from '@/components/ProgressChart'
import WelcomeSection from '@/components/WelcomeSection'

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = [
    { label: 'NFT Points', value: '111', icon: Award, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { label: 'Digital Room Design', value: '2', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { label: 'Courses Completed', value: '11', icon: BookOpen, color: 'bg-gradient-to-r from-green-500 to-teal-500' },
    { label: 'Courses in Progress', value: '4', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  ]

  const courses = [
    {
      id: 1,
      title: 'Learn Figma',
      duration: '6h 30min',
      difficulty: 4.9,
      icon: '🎨',
      color: 'bg-gradient-to-r from-pink-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Analog Photography',
      duration: '3h 15min',
      difficulty: 4.7,
      icon: '📷',
      color: 'bg-gradient-to-r from-gray-700 to-gray-900'
    },
    {
      id: 3,
      title: 'Master Instagram',
      duration: '7h 40min',
      difficulty: 4.6,
      icon: '📱',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Basics of Drawing',
      duration: '11h 30min',
      difficulty: 4.8,
      icon: '✏️',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    {
      id: 5,
      title: 'Photoshop - Essence',
      duration: '5h 35min',
      difficulty: 4.7,
      icon: '🖼️',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
  ]

  const courseFilters = ['All Courses', 'The Newest', 'Top Rated', 'Most Popular']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="text-gray-600 hover:text-primary-600 cursor-pointer" size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">J</span>
            </div>
            <div>
              <p className="text-sm font-medium">Josh</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <WelcomeSection />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous courses"
                title="Previous courses"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next courses"
                title="Next courses"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Course Filters */}
          <div className="flex space-x-4 mb-6">
            {courseFilters.map((filter, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  index === 0 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Statistics</h3>
            <div className="flex space-x-4 mb-4">
              <button className="text-primary-600 font-medium border-b-2 border-primary-600 pb-2">
                Learning Hours
              </button>
              <button className="text-gray-500 font-medium pb-2">
                My Courses
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Weekly</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
            <ProgressChart />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow">
                Start AI Tutor Session
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow">
                Generate Quiz
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow">
                Upload Study Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 