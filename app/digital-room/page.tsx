'use client'

import { useState } from 'react'
import { Users, MessageSquare, Video, Calendar, Trophy, Target, Clock, BookOpen, Star, Share2 } from 'lucide-react'

const DigitalRoomPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const studyGroups = [
    {
      id: 1,
      name: 'JavaScript Mastery',
      members: 24,
      online: 8,
      description: 'Learning advanced JavaScript concepts together',
      nextSession: '2024-01-15T18:00:00Z',
      image: '⚡',
      level: 'Advanced'
    },
    {
      id: 2,
      name: 'UI/UX Design Workshop',
      members: 16,
      online: 5,
      description: 'Collaborative design practice and feedback',
      nextSession: '2024-01-16T19:30:00Z',
      image: '🎨',
      level: 'Intermediate'
    },
    {
      id: 3,
      name: 'Spanish Conversation',
      members: 12,
      online: 3,
      description: 'Practice Spanish speaking with native speakers',
      nextSession: '2024-01-17T17:00:00Z',
      image: '🇪🇸',
      level: 'Beginner'
    },
  ]

  const achievements = [
    {
      id: 1,
      title: 'Study Streak',
      description: '7 days in a row',
      icon: '🔥',
      progress: 7,
      total: 30,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      id: 2,
      title: 'Quiz Master',
      description: '50 quizzes completed',
      icon: '🧠',
      progress: 50,
      total: 100,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Team Player',
      description: '10 group sessions',
      icon: '🤝',
      progress: 10,
      total: 20,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500'
    },
  ]

  const recentActivity = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'completed',
      target: 'JavaScript Basics Quiz',
      time: '2 hours ago',
      score: 95,
      avatar: '👩‍💻'
    },
    {
      id: 2,
      user: 'Michael Chen',
      action: 'joined',
      target: 'UI/UX Design Workshop',
      time: '4 hours ago',
      avatar: '👨‍🎨'
    },
    {
      id: 3,
      user: 'Emma Davis',
      action: 'earned',
      target: 'Study Streak Achievement',
      time: '6 hours ago',
      avatar: '👩‍🏫'
    },
    {
      id: 4,
      user: 'Carlos Rodriguez',
      action: 'started',
      target: 'Spanish Conversation Session',
      time: '8 hours ago',
      avatar: '👨‍🎓'
    },
  ]

  const leaderboard = [
    { rank: 1, name: 'Alex Turner', points: 1250, avatar: '👨‍💼', trend: 'up' },
    { rank: 2, name: 'Josh (You)', points: 1180, avatar: '👨‍🎓', trend: 'same' },
    { rank: 3, name: 'Lisa Wang', points: 1150, avatar: '👩‍🔬', trend: 'down' },
    { rank: 4, name: 'Emma Davis', points: 1100, avatar: '👩‍🏫', trend: 'up' },
    { rank: 5, name: 'Michael Chen', points: 1050, avatar: '👨‍🎨', trend: 'up' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Room</h1>
        <p className="text-gray-600">Connect, learn, and grow with your study community</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'groups', label: 'Study Groups', icon: MessageSquare },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Star },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-600">Study Hours</span>
                  </div>
                  <span className="font-bold text-gray-900">24.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className="text-green-500" />
                    <span className="text-sm text-gray-600">Courses</span>
                  </div>
                  <span className="font-bold text-gray-900">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    
                    <Target size={16} className="text-purple-500" />
                    <span className="text-sm text-gray-600">Quizzes</span>
                  </div>
                  <span className="font-bold text-gray-900">42</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Study Streak</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">7 Days</p>
                <p className="text-sm text-gray-600">Keep it up!</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{activity.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action} {activity.target}
                        {activity.score && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {activity.score}% score
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {studyGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  {group.image}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>{group.members} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{group.online} online</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  group.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {group.level}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Next session: Today 6:00 PM</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                    <Video size={16} />
                    <span>Join</span>
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div key={achievement.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 ${achievement.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {achievement.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{achievement.progress}/{achievement.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Learners</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {leaderboard.map(user => (
              <div key={user.rank} className={`flex items-center space-x-4 p-4 rounded-lg ${
                user.name.includes('You') ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    user.rank === 1 ? 'bg-yellow-500 text-white' :
                    user.rank === 2 ? 'bg-gray-400 text-white' :
                    user.rank === 3 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="text-2xl">{user.avatar}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    {user.trend === 'up' && <span className="text-green-500">↗</span>}
                    {user.trend === 'down' && <span className="text-red-500">↘</span>}
                  </div>
                  <p className="text-sm text-gray-600">{user.points} NFT points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalRoomPage 