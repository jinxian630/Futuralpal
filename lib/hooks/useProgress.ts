import { useEffect, useState, useCallback } from 'react'

export interface UserProgress {
  xp: number
  level: number
  streak: number
  achievements: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  lastActiveDate: string
}

export const useProgress = (userId: string = 'default') => {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch progress from API
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/personal/api/user-progress?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.progress) {
        setProgress({
          xp: data.progress.xp || 0,
          level: data.progress.level || 1,
          streak: data.progress.streak || 0,
          achievements: data.progress.achievements || 0,
          totalQuestionsAnswered: data.progress.totalQuestionsAnswered || 0,
          totalCorrectAnswers: data.progress.totalCorrectAnswers || 0,
          lastActiveDate: data.progress.lastActiveDate || new Date().toISOString().split('T')[0]
        })
      } else {
        throw new Error(data.error || 'Failed to load progress')
      }
    } catch (err) {
      console.error('Failed to load user progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress')
      
      // Set default progress as fallback
      setProgress({
        xp: 0,
        level: 1,
        streak: 0,
        achievements: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Update progress (optimistic updates)
  const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!progress) return false

    // Optimistically update UI immediately
    const newProgress = { ...progress, ...updates }
    setProgress(newProgress)

    try {
      // Send update to backend
      const response = await fetch('/personal/api/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          ...newProgress
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update progress')
      }
      
      console.log('[Progress] Successfully updated:', newProgress)
      return true
    } catch (err) {
      console.error('Failed to update progress:', err)
      
      // Revert optimistic update on failure
      setProgress(progress)
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      return false
    }
  }, [progress, userId])

  // Convenience methods for common operations
  const addXP = useCallback((points: number) => {
    if (!progress) return Promise.resolve(false)
    
    const newXP = progress.xp + points
    const newLevel = Math.floor(newXP / 100) + 1
    
    return updateProgress({ 
      xp: newXP,
      level: newLevel
    })
  }, [progress, updateProgress])

  const incrementStreak = useCallback(() => {
    if (!progress) return Promise.resolve(false)
    return updateProgress({ streak: progress.streak + 1 })
  }, [progress, updateProgress])

  const addAchievement = useCallback(() => {
    if (!progress) return Promise.resolve(false)
    return updateProgress({ achievements: progress.achievements + 1 })
  }, [progress, updateProgress])

  // Load progress on mount
  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    updateProgress,
    addXP,
    incrementStreak,
    addAchievement,
    refetch: fetchProgress
  }
}