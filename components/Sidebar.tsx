'use client'


import { useSearchParams } from 'next/navigation';
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatAddress } from '@/lib/formatAddress';
import { 
  Home, 
  GraduationCap, 
  ShoppingCart, 
  Users, 
  MessageSquare,
  Settings,
  BookOpen,
  Trophy,
  Menu,
  X
} from 'lucide-react'

const Sidebar = () => {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('address');

  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: GraduationCap, label: 'AI Tutor', href: '/personal/ai-tutor' },
    { icon: ShoppingCart, label: 'Marketplace', href: '/personal/marketplace' },
    { icon: Users, label: 'Digital Room', href: '/personal/digital-room' },
    { icon: BookOpen, label: 'My Courses', href: '/personal/courses' },
    { icon: Trophy, label: 'Achievements', href: '/personal/achievements' },
    { icon: MessageSquare, label: 'Messages', href: '/personal/messages' },
    { icon: Settings, label: 'Settings', href: '/personal/settings' },
  ]

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-primary-700 text-white flex flex-col shadow-lg`}>
      {/* Header with FuturoPal mascot */}
      <div className="p-4 border-b border-primary-600">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">FuturoPal</h1>
                <p className="text-xs text-blue-200">AI Learning Agent</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'hover:bg-primary-600 hover:shadow-md'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-600">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="text-sm">
              <p className="font-medium">Josh</p>
              <p className="text-blue-200">{formatAddress(walletAddress)}</p>
              <p className="text-blue-200">Online</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar 