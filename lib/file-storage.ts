import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'data', 'progress.json')

export type UserProgress = {
  xp: number
  level: number
  streak: number
  achievements: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  lastActiveDate: string
}

export const readProgressData = (): Record<string, UserProgress> => {
  try {
    if (!fs.existsSync(filePath)) {
      // Create directory if it doesn't exist
      const dataDir = path.dirname(filePath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8')
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (error) {
    console.error('Error reading progress data:', error)
    return {}
  }
}

export const getUserProgress = (userId: string): UserProgress => {
  const data = readProgressData()
  return data[userId] || { 
    xp: 0, 
    level: 1, 
    streak: 0, 
    achievements: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  }
}

export const updateUserProgress = (userId: string, progress: UserProgress): boolean => {
  try {
    const data = readProgressData()
    
    // Calculate level based on XP (same logic as before)
    progress.level = Math.floor(progress.xp / 100) + 1
    progress.lastActiveDate = new Date().toISOString().split('T')[0]
    
    data[userId] = progress
    
    // Ensure directory exists
    const dataDir = path.dirname(filePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`[File Storage] Updated progress for user: ${userId}`, progress)
    return true
  } catch (error) {
    console.error('Error updating progress data:', error)
    return false
  }
}