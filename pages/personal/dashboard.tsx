import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Search, Bell, ChevronLeft, ChevronRight, Clock, Users, Award, BookOpen, TrendingUp, LogOut } from 'lucide-react'
import { useRouter } from 'next/router'
import StatsCard from '@/components/StatsCard'
import CourseCard from '@/components/CourseCard'
import ProgressChart from '@/components/ProgressChart'
import WelcomeSection from '@/components/WelcomeSection'
import OnboardingModal from '@/components/OnboardingModal'
import { useUser } from '@/lib/hooks/useUser'
import { generateAvatarFromAddress } from '@/lib/utils/wallet'

interface DashboardProps {
  session: any
  hasValidSession: boolean
}

const Dashboard = ({ session: serverSession, hasValidSession }: DashboardProps) => {
  const router = useRouter()
  const { data: clientSession } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { user, isAuthenticated, loginWithAddress, logout, isLoading } = useUser()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show onboarding for first-time users
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasCompletedOnboarding = localStorage.getItem('futuropal_onboarding_completed')
      if (!hasCompletedOnboarding && (user.isFirstTime || !hasCompletedOnboarding)) {
        setShowOnboarding(true)
      }
    }
  }, [isAuthenticated, user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Failed to logout:', error)
      router.push('/')
    }
  }

  const getUserAvatar = () => {
    if (user?.picture) {
      return user.picture
    }
    
    if (user?.address) {
      return generateAvatarFromAddress(user.address)
    }
    
    return generateAvatarFromAddress('default')
  }

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Use session data (server or client) for display
  const session = clientSession || serverSession
  const displayName = user?.name || session?.user?.name || 'User'
  const displayEmail = user?.email || session?.user?.email

  const stats = [
    { label: 'NFT Points', value: user?.nftPoints?.toString() || '0', icon: Award, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Server-side protection indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800">
          🛡️ This dashboard is server-side protected. Session validated: {hasValidSession ? '✅' : '❌'}
        </p>
      </div>

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
            <div className="relative">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{getUserInitial()}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-gray-500">
                {hasValidSession ? 'Authenticated User' : 'Student'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
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

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🛡️ Server-side dashboard protection check...')
  
  try {
    const session = await getServerSession(context.req, context.res, authOptions)
    
    console.log('📋 Server session status:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      hasIdToken: !!(session as any)?.idToken
    })

    if (!session) {
      console.log('❌ No session found, redirecting to register')
      return {
        redirect: {
          destination: '/register',
          permanent: false,
        },
      }
    }

    console.log('✅ Valid session found, allowing dashboard access')
    return {
      props: {
        session,
        hasValidSession: true
      },
    }
  } catch (error) {
    console.error('💥 Error in getServerSideProps:', error)
    return {
      redirect: {
        destination: '/register',
        permanent: false,
      },
    }
  }
}

export default Dashboard