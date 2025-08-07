'use client'

import { useSearchParams } from 'next/navigation';
import { useState } from 'react'
import { Search, Filter, BookOpen, Clock, Star, Users, TrendingUp, CheckCircle, Play, Award } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import CourseCard from '@/components/CourseCard'

const CoursesPage = () => {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('address');

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const stats = [
    { label: 'Courses Enrolled', value: '15', icon: BookOpen, color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { label: 'Courses Completed', value: '11', icon: CheckCircle, color: 'bg-gradient-to-r from-green-500 to-teal-500' },
    { label: 'In Progress', value: '4', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { label: 'NFT Points Earned', value: '111', icon: Award, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  ]

  const categories = [
    { id: 'all', label: 'All Courses', count: 15 },
    { id: 'in-progress', label: 'In Progress', count: 4 },
    { id: 'completed', label: 'Completed', count: 11 },
    { id: 'not-started', label: 'Not Started', count: 0 },
  ]

  const courses = [
    {
      id: 1,
      title: 'Learn Figma',
      duration: '6h 30min',
      difficulty: 4.9,
      icon: '🎨',
      color: 'bg-gradient-to-r from-pink-500 to-purple-500',
      progress: 85,
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Analog Photography',
      duration: '3h 15min',
      difficulty: 4.7,
      icon: '📷',
      color: 'bg-gradient-to-r from-gray-700 to-gray-900',
      progress: 100,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Master Instagram',
      duration: '7h 40min',
      difficulty: 4.8,
      icon: '📱',
      color: 'bg-gradient-to-r from-pink-600 to-red-500',
      progress: 45,
      status: 'in-progress'
    },
    {
      id: 4,
      title: 'Advanced JavaScript',
      duration: '12h 20min',
      difficulty: 4.9,
      icon: '⚡',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      progress: 100,
      status: 'completed'
    },
    {
      id: 5,
      title: 'UI/UX Fundamentals',
      duration: '8h 45min',
      difficulty: 4.6,
      icon: '✨',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      progress: 20,
      status: 'in-progress'
    },
    {
      id: 6,
      title: 'Digital Marketing',
      duration: '5h 30min',
      difficulty: 4.5,
      icon: '📊',
      color: 'bg-gradient-to-r from-green-500 to-blue-500',
      progress: 100,
      status: 'completed'
    }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.status === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-1">Track your learning progress and continue your educational journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-200`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-gray-600">{filteredCourses.length} courses</p>
          </div>

          <div className="grid gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${course.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span>{course.difficulty}</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{course.progress}% complete</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.status === 'completed' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play size={12} className="mr-1" />
                            Continue
                          </>
                        )}
                      </span>
                      <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        {course.status === 'completed' ? 'Review' : 'Continue'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage