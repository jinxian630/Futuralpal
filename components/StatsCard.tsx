import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string
  icon: LucideIcon
  color: string
}

const StatsCard = ({ label, value, icon: Icon, color }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
            <Icon className="text-white" size={24} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
        </div>
        <div className="text-right">
          <div className="w-2 h-2 bg-green-500 rounded-full mb-2"></div>
          <span className="text-xs text-gray-500">Active</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard 