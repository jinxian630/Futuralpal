'use client'

import { useEffect, useRef } from 'react'

const ProgressChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const data = [
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 1.5 },
    { day: 'Wed', hours: 2.5 },
    { day: 'Thu', hours: 1 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 3 },
    { day: 'Sun', hours: 2 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Chart dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Find max value for scaling
    const maxHours = Math.max(...data.map(d => d.hours))
    const scale = chartHeight / (maxHours || 1)

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw the line chart
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      const y = height - padding - (point.hours * scale)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = '#3b82f6'
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      const y = height - padding - (point.hours * scale)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'

    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      ctx.fillText(point.day.toLowerCase(), x, height - 10)
    })

    // Draw Y-axis labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5
      const value = maxHours - (i * maxHours) / 5
      ctx.fillText(`${value.toFixed(1)}h`, padding - 10, y + 4)
    }

  }, [])

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="w-full h-48"
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Total this week: <span className="font-semibold text-primary-600">14.5 hours</span>
        </p>
      </div>
    </div>
  )
}

export default ProgressChart 