'use client'

import { useState } from 'react'
import { ShoppingCart, Star, Filter, Search, Coins, Crown, Gift } from 'lucide-react'
import { useProgress } from '@/lib/hooks/useProgress'
import ModularBot, { BOT_PERSONALITIES } from '@/components/ModularBot'
import { useUser } from '@/lib/hooks/useUser'

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Use progress hook to get real XP data
  const { progress, loading, error, addXP } = useProgress('default')
  const nftPoints = progress?.xp || 0
  
  // Get user data for bot
  const { user, isAuthenticated } = useUser()

  const categories = [
    { id: 'all', label: 'All Courses', count: 50 },
    { id: 'design', label: 'Design', count: 15 },
    { id: 'programming', label: 'Programming', count: 12 },
    { id: 'business', label: 'Business', count: 8 },
    { id: 'language', label: 'Language', count: 10 },
    { id: 'science', label: 'Science', count: 5 },
  ]

  const courses = [
    {
      id: 1,
      title: 'Advanced UI/UX Design',
      instructor: 'Sarah Johnson',
      price: 25,
      originalPrice: 40,
      rating: 4.8,
      students: 1200,
      image: '🎨',
      category: 'design',
      duration: '8 weeks',
      level: 'Advanced',
      featured: true
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      instructor: 'Michael Chen',
      price: 30,
      originalPrice: 50,
      rating: 4.9,
      students: 2500,
      image: '⚡',
      category: 'programming',
      duration: '12 weeks',
      level: 'Intermediate',
      featured: true
    },
    {
      id: 3,
      title: 'Digital Marketing Pro',
      instructor: 'Emma Davis',
      price: 20,
      originalPrice: 35,
      rating: 4.7,
      students: 950,
      image: '📱',
      category: 'business',
      duration: '6 weeks',
      level: 'Beginner',
      featured: false
    },
    {
      id: 4,
      title: 'Spanish Fluency',
      instructor: 'Carlos Rodriguez',
      price: 15,
      originalPrice: 25,
      rating: 4.6,
      students: 1800,
      image: '🇪🇸',
      category: 'language',
      duration: '10 weeks',
      level: 'Intermediate',
      featured: false
    },
    {
      id: 5,
      title: 'Data Science Basics',
      instructor: 'Dr. Lisa Wang',
      price: 35,
      originalPrice: 60,
      rating: 4.8,
      students: 750,
      image: '📊',
      category: 'science',
      duration: '14 weeks',
      level: 'Advanced',
      featured: true
    },
    {
      id: 6,
      title: 'Photography Essentials',
      instructor: 'Alex Turner',
      price: 18,
      originalPrice: 30,
      rating: 4.5,
      students: 1400,
      image: '📷',
      category: 'design',
      duration: '5 weeks',
      level: 'Beginner',
      featured: false
    },
  ]

  const filteredCourses = courses.filter(course => 
    (selectedCategory === 'all' || course.category === selectedCategory) &&
    (searchQuery === '' || course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handlePurchase = async (courseId: number, price: number) => {
    if (nftPoints >= price) {
      // Deduct XP points for purchase
      await addXP(-price)
      alert('Course purchased successfully!')
    } else {
      alert('Insufficient NFT points!')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Discover and purchase courses with your NFT points</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Coins size={24} />
                <span className="text-xl font-bold">{nftPoints}</span>
              </div>
              <p className="text-sm opacity-90">NFT Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.label}</span>
                    <span className="text-sm opacity-75">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Special Offers</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown size={20} />
                  <span className="font-bold">Premium Bundle</span>
                </div>
                <p className="text-sm opacity-90">Get 3 courses for 50 NFT points</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift size={20} />
                  <span className="font-bold">Daily Bonus</span>
                </div>
                <p className="text-sm opacity-90">Complete a course today, get 10 bonus points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {course.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-sm font-bold">
                    FEATURED
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      {course.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-gray-600 text-sm">{course.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{course.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{course.students} students</span>
                      <span>•</span>
                      <span>{course.duration}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Coins size={16} className="text-yellow-500" />
                        <span className="text-xl font-bold text-primary-600">{course.price}</span>
                      </div>
                      <span className="text-sm text-gray-500 line-through">{course.originalPrice}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(course.id, course.price)}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart size={16} />
                      <span>Purchase</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace Bot */}
      {isAuthenticated && user && (
        <ModularBot
          module="marketplace"
          userId={user.oidcSub}
          personality={BOT_PERSONALITIES.marketplace}
          quickActions={[
            {
              id: 'browse-by-budget',
              label: `💰 Courses Under ${Math.floor(nftPoints/2)} Points`,
              action: () => alert(`Here are courses you can afford with your ${nftPoints} NFT points!`)
            },
            {
              id: 'popular-courses',
              label: '🔥 Popular Courses',
              action: () => setSelectedCategory('programming') // Show most popular category
            },
            {
              id: 'earn-more-points',
              label: '⭐ How to Earn Points',
              action: () => alert('Complete lessons and quizzes in the AI Tutor to earn more NFT points!')
            }
          ]}
          variant="floating"
          position="bottom-right"
        />
      )}
    </div>
  )
}

export default MarketplacePage 