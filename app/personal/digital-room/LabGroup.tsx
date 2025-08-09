'use client'

import { useState, useRef } from 'react'
import { Users, MessageSquare, Trophy, Target, Clock, BookOpen, Folder, Tag, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star } from 'lucide-react'
import DoorImage from './door.png' // adjust filename to match yours
import MyLab from './MyLab'
import BuildRoom from './BuildRoom'






interface DraggableItem {
  id: number
  name: string
  url: string
  x?: number
  y?: number
}

interface LeaderboardItem {
  rank: number
  name: string
  score: number
}

interface StockImages {
  [key: string]: DraggableItem[]
}

const LabGroup = () => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Room</h1>
        <p className="text-gray-600">Connect, learn, and grow with your study community</p>
      </div> */}

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'lab', label: 'My Lab', icon: MessageSquare },
            { id: 'build', label: 'Building Lab', icon: MessageSquare },          
                    
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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

      {activeTab === 'overview' && (
        <div className="">
          {/* First column */}
          <div className="lg:col-span-1 space-y-6">
  
            <div className="bg-white rounded-lg shadow-lg p-6 flex gap-6">
              {/* Door 3.1 — Build Room */}
              <div
                className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setActiveTab('lab')}
              >
                <img
                  src={DoorImage.src}
                  alt="Door"
                  className="w-full rounded-lg mb-4"
                />
                <div className="text-center">
                  <span className="block text-gray-600">My Lab</span>
                </div>
              </div>

              {/* Door 2
              <div className="flex-1">
                <div
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('learn')}
                >
                  <img src={DoorImage.src} alt="Door" className="w-full rounded-lg mb-4" />
                  <div className="text-center">
                    <span className="block text-gray-600">Learning group</span>
                  </div>
                </div>
              </div> */}

              {/* Door 3 */}
              <div className="flex-1">
                <div
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('build')}
                >
                  <img src={DoorImage.src} alt="Door" className="w-full rounded-lg mb-4" />
                  <div className="text-center">
                    <span className="block text-gray-600">Building Lab</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      )}

      {activeTab === 'lab' && <MyLab/>}
      {/*activeTab === 'learn' && <CosmicRoomLayout />*/}
      {activeTab === 'build' && <BuildRoom/>}
    </div>
  )
}



export default LabGroup;