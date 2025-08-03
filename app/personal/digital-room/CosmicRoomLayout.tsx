import { useState, useRef } from 'react';
import { Users, MessageSquare, Trophy, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, Folder, Tag, Clock, BookOpen, Target } from 'lucide-react';

// Interfaces and types
interface DraggableItem {
  id: number;
  name: string;
  url: string;
  x?: number;
  y?: number;
}

interface LeaderboardItem {
  rank: number;
  name: string;
  score: number;
}

interface StockImages {
  [key: string]: DraggableItem[];
}


// CosmicRoomLayout component
const CosmicRoomLayout = () => {
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [droppedItems, setDroppedItems] = useState<DraggableItem[]>([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBottomBarExpanded, setIsBottomBarExpanded] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const stockImages: StockImages = {
    Stickers: [
      { id: 1, name: 'Galaxy', url: '🌌' },
      { id: 2, name: 'Comet', url: '☄️' },
      { id: 3, name: 'Star', url: '⭐' },
      { id: 4, name: 'Planet', url: '🪐' },
      { id: 5, name: 'Sparkles', url: '✨' },
      { id: 6, name: 'Moon', url: '🌙' },
      { id: 7, name: 'Sun', url: '☀️' },
      { id: 8, name: 'Nebula', url: '🌠' },
      { id: 9, name: 'Alien', url: '👽' },
      { id: 10, name: 'UFO', url: '🛸' }
    ],
    Badges: [
      { id: 11, name: 'Aries', url: '♈' },
      { id: 12, name: 'Taurus', url: '♉' },
      { id: 13, name: 'Gemini', url: '♊' },
      { id: 14, name: 'Cancer', url: '♋' },
      { id: 15, name: 'Leo', url: '♌' },
      { id: 16, name: 'Virgo', url: '♍' },
      { id: 17, name: 'Libra', url: '♎' },
      { id: 18, name: 'Scorpio', url: '♏' },
      { id: 19, name: 'Sagittarius', url: '♐' },
      { id: 20, name: 'Capricorn', url: '♑' },
      { id: 21, name: 'Aquarius', url: '♒' },
      { id: 22, name: 'Pisces', url: '♓' }
    ],
    Achievements: [
      { id: 23, name: 'Rocket', url: '🚀' },
      { id: 24, name: 'Satellite', url: '🛰️' },
      { id: 25, name: 'Telescope', url: '🔭' },
      { id: 26, name: 'Crystal Ball', url: '🔮' },
      { id: 27, name: 'Milky Way', url: '🌌' },
      { id: 28, name: 'Meteorite', url: '☄️' },
      { id: 29, name: 'Space Station', url: '🚀' },
      { id: 30, name: 'Astronaut', url: '👨‍🚀' }
    ]
  };

  const [activeCategory, setActiveCategory] = useState('Stickers');

  const leaderboard: LeaderboardItem[] = [
    { rank: 1, name: 'Alex', score: 2450 },
    { rank: 2, name: 'Sarah', score: 2380 },
    { rank: 3, name: 'Mike', score: 2210 }
  ];

  const handleDragStart = (e: React.DragEvent, item: DraggableItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  if (!draggedItem || !canvasRef.current) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  setDroppedItems(prev => {
    // Check if this is an existing item being moved (has x/y coordinates)
    const isExistingItem = draggedItem.x !== undefined && draggedItem.y !== undefined;

    if (isExistingItem) {
      // Update position of existing item
      return prev.map(item => 
        item.id === draggedItem.id 
          ? { ...item, x, y } 
          : item
      );
    } else {
      // Add new sticker
      return [...prev, {
        ...draggedItem,
        x,
        y,
        id: Date.now()
      }];
    }
  });

  setDraggedItem(null);
};

  const FloatingElements = () => (
    <>
      <div className="absolute top-12 left-16 text-blue-200 text-3xl animate-pulse">⭐</div>
      <div className="absolute top-20 left-24 text-purple-200 text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
      <div className="absolute top-28 left-32 text-indigo-200 text-xl animate-pulse" style={{animationDelay: '1s'}}>⭐</div>
      
      <div className="absolute top-16 right-20 text-yellow-300 text-4xl animate-pulse">♌</div>
      <div className="absolute top-10 right-32 text-blue-300 text-2xl animate-pulse">⭐</div>
      <div className="absolute top-24 right-28 text-purple-300 text-xl animate-pulse" style={{animationDelay: '0.7s'}}>✨</div>
      
      <div className="absolute top-1/4 left-1/4 text-pink-200 text-5xl animate-bounce">🌌</div>
      <div className="absolute top-1/3 right-1/3 text-cyan-200 text-3xl animate-pulse" style={{animationDelay: '1.2s'}}>🌠</div>
      
      <div className="absolute bottom-40 left-20 text-teal-300 text-4xl animate-pulse">♓</div>
      <div className="absolute bottom-32 left-12 text-blue-200 text-2xl animate-pulse" style={{animationDelay: '0.3s'}}>⭐</div>
      <div className="absolute bottom-48 left-28 text-purple-200 text-xl animate-pulse" style={{animationDelay: '0.9s'}}>✨</div>
      
      <div className="absolute bottom-1/3 right-1/4 text-orange-300 text-4xl animate-pulse">♐</div>
      <div className="absolute bottom-1/4 right-1/5 text-yellow-200 text-2xl animate-pulse" style={{animationDelay: '0.6s'}}>⭐</div>
      
      <div className="absolute top-1/2 left-1/6 text-purple-300 text-3xl animate-bounce" style={{animationDelay: '1.5s'}}>☄️</div>
      <div className="absolute top-2/3 right-1/6 text-cyan-300 text-2xl animate-pulse" style={{animationDelay: '0.4s'}}>🪐</div>
      
      <div className="absolute top-3/4 left-1/3 text-green-300 text-3xl animate-pulse" style={{animationDelay: '1.8s'}}>♊</div>
      <div className="absolute top-5/6 right-2/5 text-pink-300 text-3xl animate-pulse" style={{animationDelay: '2.1s'}}>♒</div>
      
      <div className="absolute top-8 left-1/2 text-white text-xl animate-pulse opacity-60" style={{animationDelay: '2.5s'}}>✨</div>
      <div className="absolute bottom-20 left-2/3 text-blue-100 text-lg animate-pulse opacity-70" style={{animationDelay: '1.3s'}}>⭐</div>
      <div className="absolute top-1/5 left-3/4 text-purple-100 text-sm animate-pulse opacity-50" style={{animationDelay: '0.8s'}}>✨</div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex">
      {/* Main Canvas Area */}
      <div className="flex-1 p-8">
        <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-black shadow-2xl rounded-xl h-full relative overflow-hidden border-8 border-purple-400">
          <div 
            ref={canvasRef}
            className="w-full h-full relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #312e81 25%, #1e1b4b 50%, #0f172a 75%, #000000 100%)',
              backgroundImage: `
                radial-gradient(2px 2px at 20px 30px, #ffffff, transparent),
                radial-gradient(2px 2px at 40px 70px, #ffffff, transparent),
                radial-gradient(1px 1px at 90px 40px, #ffffff, transparent),
                radial-gradient(1px 1px at 130px 80px, #ffffff, transparent),
                radial-gradient(2px 2px at 160px 30px, #ffffff, transparent),
                radial-gradient(1px 1px at 200px 60px, #ffffff, transparent),
                radial-gradient(2px 2px at 240px 90px, #ffffff, transparent),
                radial-gradient(1px 1px at 280px 40px, #ffffff, transparent),
                radial-gradient(1px 1px at 320px 80px, #ffffff, transparent),
                radial-gradient(2px 2px at 360px 20px, #ffffff, transparent)
              `,
              backgroundRepeat: 'repeat',
              backgroundSize: '400px 200px'
            }}
            >
            <FloatingElements />

           {droppedItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', '');
                setDraggedItem(item);
              }}
              style={{
                position: 'absolute',
                left: `${item.x}px`,
                top: `${item.y}px`,
                fontSize: '2rem',
                cursor: 'move',
                userSelect: 'none'
              }}
            >
              {item.url}
            </div>
          ))}
          </div>
        </div>
  
      </div>

      {/* Leaderboard Sidebar */}
      <div className={`bg-gradient-to-b from-indigo-900 via-purple-900 to-black shadow-2xl border-l-4 border-cyan-400 transition-all duration-300 ${
        isLeaderboardVisible ? 'w-80' : 'w-12'
      }`}style={{boxShadow: 'inset 0 0 20px rgba(34, 211, 238, 0.3)'}}>
        <div className="flex justify-end p-2">
          <button
            onClick={() => setIsLeaderboardVisible(!isLeaderboardVisible)}
            className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-colors border-2 border-cyan-300 shadow-lg"
            style={{boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)'}}
          >
            {isLeaderboardVisible ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {isLeaderboardVisible && (
          <div className="px-6 pb-6">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" style={{filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))'}} />
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Cosmic Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-lg border-4 border-cyan-300 shadow-lg backdrop-blur-sm ${
                      user.rank === 1 ? 'bg-gradient-to-r from-yellow-900/80 to-orange-900/80' :
                      user.rank === 2 ? 'bg-gradient-to-r from-gray-800/80 to-slate-800/80' :
                      'bg-gradient-to-r from-orange-900/80 to-red-900/80'
                    }`}
                    style={{boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)'}}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-300 shadow-md ${
                        user.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        user.rank === 2 ? 'bg-gradient-to-r from-gray-500 to-slate-600' :
                        'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                      style={{boxShadow: '0 0 10px rgba(34, 211, 238, 0.4)'}}
                      >
                        {user.rank}
                      </div>
                      <span className="ml-3 font-bold text-cyan-100">{user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))'}} />
                      <span className="text-sm font-bold text-cyan-200">{user.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 rounded-lg p-4 border-4 border-cyan-300 shadow-lg backdrop-blur-sm"
                 style={{boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)'}}>
              <h3 className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">Your Cosmic Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-300 font-medium">Stickers Used:</span>
                  <span className="font-bold text-cyan-100">{droppedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-300 font-medium">Current Rank:</span>
                  <span className="font-bold text-cyan-100">#4</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticker Bar */}
      <div className={`fixed bottom-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-black border-t-4 border-cyan-400 shadow-2xl transition-all duration-300 ${
        isLeaderboardVisible ? 'right-80' : 'right-12'
      } ${isBottomBarExpanded ? 'h-44' : 'h-12'} ${
        isCollapsed ? 'left-16' : 'left-64'
      }`}style={{boxShadow: 'inset 0 0 30px rgba(34, 211, 238, 0.2)'}}>
        <div className={`absolute top-0 ${
          isLeaderboardVisible ? 'right-80' : 'right-0'
        } transform -translate-y-full`}>
          <button
            onClick={() => setIsBottomBarExpanded(!isBottomBarExpanded)}
            className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 border-4 border-cyan-300 rounded-t-lg hover:from-cyan-400 hover:to-purple-500 transition-colors shadow-lg"
            style={{boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)'}}
          >
            {isBottomBarExpanded ? (
              <ChevronDown className="w-5 h-5 text-white" />
            ) : (
              <ChevronUp className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <div className="p-4 overflow-hidden">
          <div className="flex space-x-2 mb-4">
            {Object.keys(stockImages).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-bold capitalize transition-all border-4 border-cyan-300 shadow-lg transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-indigo-700 to-purple-800 text-cyan-200 hover:from-indigo-600 hover:to-purple-700'
                }`}
                style={{boxShadow: '0 0 10px rgba(34, 211, 238, 0.4)'}}
              >
                {category === 'Stickers' && <Folder className="w-4 h-4 inline mr-2" />}
                {category === 'Badges' && <Users className="w-4 h-4 inline mr-2" />}
                {category === 'Achievements' && <Tag className="w-4 h-4 inline mr-2" />}
                {category}
              </button>
            ))}
          </div>

          {isBottomBarExpanded && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {stockImages[activeCategory].map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-800 rounded-full p-4 border-4 border-cyan-300 shadow-2xl hover:shadow-cyan-400/50 cursor-grab active:cursor-grabbing transition-all transform hover:scale-110 hover:-translate-y-1"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  style={{
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), 0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="text-2xl text-center filter drop-shadow-lg">{item.url}</div>
                  <div className="text-xs text-cyan-200 text-center whitespace-nowrap mt-1 font-medium">{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CosmicRoomLayout;