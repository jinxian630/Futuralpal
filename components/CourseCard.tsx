import { Clock, Star, Users } from 'lucide-react'

interface CourseCardProps {
  id: number
  title: string
  duration: string
  difficulty: number
  icon: string
  color: string
}

const CourseCard = ({ id, title, duration, difficulty, icon, color }: CourseCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 ${color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span>{difficulty}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            View course
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard 