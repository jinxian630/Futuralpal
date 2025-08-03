
//Whiteboard layout


// 'use client'

// import { useState, useRef } from 'react'
// import { Users, MessageSquare, Video, Calendar, Trophy, Target, Clock, BookOpen, Image, Folder, Tag, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star } from 'lucide-react'

// interface DraggableItem {
//   id: number;
//   name: string;
//   url: string;
//   x?: number;
//   y?: number;
// }

// interface LeaderboardItem {
//   rank: number;
//   name: string;
//   score: number;
// }

// interface StockImages {
//   [key: string]: DraggableItem[];
// }

// const DigitalRoomPage = () => {
//   const [activeTab, setActiveTab] = useState('overview')

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Room</h1>
//         <p className="text-gray-600">Connect, learn, and grow with your study community</p>
//       </div>

//       {/* Tab Navigation */}
//       <div className="mb-6 border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: 'overview', label: 'Overview', icon: Users },
//             { id: 'groups', label: 'Study Groups', icon: MessageSquare },
//           ].map(tab => {
//             const Icon = tab.icon
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                   activeTab === tab.id
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <Icon size={16} />
//                 <span>{tab.label}</span>
//               </button>
//             )
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'overview' && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Quick Stats */}
//           <div className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Clock size={16} className="text-blue-500" />
//                     <span className="text-sm text-gray-600">Study Hours</span>
//                   </div>
//                   <span className="font-bold text-gray-900">24.5h</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <BookOpen size={16} className="text-green-500" />
//                     <span className="text-sm text-gray-600">Courses</span>
//                   </div>
//                   <span className="font-bold text-gray-900">7</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Target size={16} className="text-purple-500" />
//                     <span className="text-sm text-gray-600">Quizzes</span>
//                   </div>
//                   <span className="font-bold text-gray-900">42</span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-lg font-bold text-gray-900 mb-4">Study Streak</h3>
//               <div className="text-center">
//                 <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <span className="text-2xl">🔥</span>
//                 </div>
//                 <p className="text-3xl font-bold text-gray-900">7 Days</p>
//                 <p className="text-sm text-gray-600">Keep it up!</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'groups' && <HandwritingPaperLayout />}
//     </div>
//   )
// }

// const HandwritingPaperLayout = () => {
//   const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
//   const [droppedItems, setDroppedItems] = useState<DraggableItem[]>([]);
//   const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isBottomBarExpanded, setIsBottomBarExpanded] = useState(true);
//   const canvasRef = useRef<HTMLDivElement>(null);

//   // Sample data for different categories
//   const stockImages: StockImages = {
//     Stickers: [
//       { id: 1, name: 'Mountain', url: '🏔️' },
//       { id: 2, name: 'Tree', url: '🌳' },
//       { id: 3, name: 'Ocean', url: '🌊' }
//     ],
//     Badges: [
//       { id: 4, name: 'Cat', url: '🐱' },
//       { id: 5, name: 'Dog', url: '🐶' },
//       { id: 6, name: 'Bird', url: '🐦' }
//     ],
//     Achievements: [
//       { id: 7, name: 'Book', url: '📚' },
//       { id: 8, name: 'Pen', url: '✏️' },
//       { id: 9, name: 'Computer', url: '💻' }
//     ]
//   };

//   const [activeCategory, setActiveCategory] = useState<string>('Stickers');

//   // Leaderboard data
//   const leaderboard: LeaderboardItem[] = [
//     { rank: 1, name: 'Alex', score: 2450 },
//     { rank: 2, name: 'Sarah', score: 2380 },
//     { rank: 3, name: 'Mike', score: 2210 }
//   ];

//   const handleDragStart = (e: React.DragEvent, item: DraggableItem) => {
//     setDraggedItem(item);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     if (draggedItem && canvasRef.current) {
//       const rect = canvasRef.current.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
      
//       setDroppedItems(prev => [...prev, {
//         ...draggedItem,
//         x,
//         y,
//         id: Date.now() // Unique ID for each dropped item
//       }]);
//       setDraggedItem(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Main Handwriting Paper Area */}
//       <div className="flex-1 p-8">
//         <div className="bg-white shadow-lg rounded-lg h-full relative overflow-hidden">
//           {/* Paper with lines */}
//           <div 
//             ref={canvasRef}
//             className="w-full h-full relative bg-white"
//             onDragOver={handleDragOver}
//             onDrop={handleDrop}
//           >
//             {/* Dropped items */}
//             {droppedItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="absolute cursor-move bg-white rounded-lg shadow-md p-2 border-2 border-blue-200"
//                 style={{
//                   left: `${item.x}px`,
//                   top: `${item.y}px`,
//                   transform: 'translate(-50%, -50%)'
//                 }}
//                 draggable
//                 onDragStart={(e) => {
//                   // Allow repositioning
//                   setDraggedItem(item);
//                 }}
//               >
//                 <div className="text-2xl">{item.url}</div>
//                 <div className="text-xs text-gray-600 mt-1">{item.name}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Leaderboard Sidebar */}
//       <div className={`bg-white shadow-lg border-l border-gray-200 transition-all duration-300 ${
//         isLeaderboardVisible ? 'w-80' : 'w-12'
//       }`}>
//         {/* Toggle Button */}
//         <div className="flex justify-end p-2">
//           <button
//             onClick={() => setIsLeaderboardVisible(!isLeaderboardVisible)}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             {isLeaderboardVisible ? (
//               <ChevronRight className="w-5 h-5 text-gray-600" />
//             ) : (
//               <ChevronLeft className="w-5 h-5 text-gray-600" />
//             )}
//           </button>
//         </div>

//         {/* Leaderboard Content */}
//         {isLeaderboardVisible && (
//           <div className="px-6 pb-6">
//             <div className="mb-8">
//               <div className="flex items-center mb-4">
//                 <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
//                 <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
//               </div>
//               <div className="space-y-3">
//                 {leaderboard.map((user) => (
//                   <div
//                     key={user.rank}
//                     className={`flex items-center justify-between p-3 rounded-lg ${
//                       user.rank === 1 ? 'bg-yellow-50 border-2 border-yellow-200' :
//                       user.rank === 2 ? 'bg-gray-50 border-2 border-gray-200' :
//                       'bg-orange-50 border-2 border-orange-200'
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
//                         user.rank === 1 ? 'bg-yellow-500' :
//                         user.rank === 2 ? 'bg-gray-400' :
//                         'bg-orange-400'
//                       }`}>
//                         {user.rank}
//                       </div>
//                       <span className="ml-3 font-medium text-gray-800">{user.name}</span>
//                     </div>
//                     <div className="flex items-center">
//                       <Star className="w-4 h-4 text-yellow-400 mr-1" />
//                       <span className="text-sm font-semibold text-gray-600">{user.score}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="bg-blue-50 rounded-lg p-4">
//               <h3 className="font-semibold text-blue-800 mb-2">Your Progress</h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-blue-600">Items Used:</span>
//                   <span className="font-medium text-blue-800">{droppedItems.length}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-blue-600">Current Rank:</span>
//                   <span className="font-medium text-blue-800">#4</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bottom Stock Bar */}
//         <div className={`fixed bottom-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ${
//           isLeaderboardVisible ? 'right-80' : 'right-12'
//         } ${isBottomBarExpanded ? 'h-40' : 'h-12'} ${
//           isCollapsed ? 'left-16' : 'left-64'
//         }`}>
//           {/* Toggle Button */}
//           <div className={`absolute top-0 ${
//             isLeaderboardVisible ? 'right-80' : 'right-0'
//             } transform -translate-y-full`}>
//             <button
//               onClick={() => setIsBottomBarExpanded(!isBottomBarExpanded)}
//               className="p-2 bg-white border border-gray-200 rounded-t-lg hover:bg-gray-50 transition-colors"
//             >
//             {isBottomBarExpanded ? (
//               <ChevronDown className="w-5 h-5 text-gray-600" />
//             ) : (
//               <ChevronUp className="w-5 h-5 text-gray-600" />
//             )}
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4 overflow-hidden">
//           {/* Category Tabs - Always visible */}
//           <div className="flex space-x-1 mb-4">
//             {Object.keys(stockImages).map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setActiveCategory(category)}
//                 className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
//                   activeCategory === category
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 {category === 'Stickers' && <Folder className="w-4 h-4 inline mr-2" />}
//                 {category === 'Badges' && <Users className="w-4 h-4 inline mr-2" />}
//                 {category === 'Achievements' && <Tag className="w-4 h-4 inline mr-2" />}
//                 {category}
//               </button>
//             ))}
//           </div>

//           {/* Stock Images - Only visible when expanded */}
//           {isBottomBarExpanded && (
//             <div className="flex space-x-4 overflow-x-auto pb-2">
//               {stockImages[activeCategory].map((item) => (
//                 <div
//                   key={item.id}
//                   className="flex-shrink-0 bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 cursor-grab active:cursor-grabbing transition-colors"
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, item)}
//                 >
//                   <div className="text-3xl mb-2 text-center">{item.url}</div>
//                   <div className="text-sm text-gray-600 text-center whitespace-nowrap">{item.name}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DigitalRoomPage;



'use client'

import { useState, useRef } from 'react'
import { Users, MessageSquare, Trophy, Target, Clock, BookOpen, Folder, Tag, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star } from 'lucide-react'
import CosmicRoomLayout from './CosmicRoomLayout';

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

const DigitalRoomPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Room</h1>
        <p className="text-gray-600">Connect, learn, and grow with your study community</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'groups', label: 'Study Groups', icon: MessageSquare },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>
      )}

      {activeTab === 'groups' && <CosmicRoomLayout />}
    </div>
  )
}



export default DigitalRoomPage;