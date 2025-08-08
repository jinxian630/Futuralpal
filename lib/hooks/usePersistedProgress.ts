import { useState, useEffect, useCallback, useRef } from 'react'

export interface PersistedProgress {
  xpPoints: number
  level: number
  streak: number
  achievements: string[]
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  lastActiveDate: string
  lastSyncedAt?: string
}

const STORAGE_KEY = 'futuropal_user_progress'
const SYNC_INTERVAL = 30000 // 30 seconds
const DEBOUNCE_DELAY = 1000 // 1 second debounce for API calls

// Global state to prevent multiple simultaneous syncs across all hook instances
let globalSyncInProgress = false
let globalLastSyncTime = 0
const globalActiveRequests = new Map<string, AbortController>()

/**
 * Hook for persisting and syncing user progress
 * Handles localStorage persistence and backend synchronization
 */
export function usePersistedProgress(userId: string = 'default') {
  // Default progress state
  const defaultProgress: PersistedProgress = {
    xpPoints: 0,
    level: 1,
    streak: 0,
    achievements: [],
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    lastSyncedAt: undefined
  }

  const [progress, setProgress] = useState<PersistedProgress>(defaultProgress)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Refs for request management and debouncing
  const abortControllerRef = useRef<AbortController | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncTimeRef = useRef<number>(0)
  const initialSyncDoneRef = useRef(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedProgress
        setProgress(parsed)
        console.log('[Progress] Loaded from localStorage:', parsed)
      } else {
        console.log('[Progress] No stored progress found, using defaults')
      }
    } catch (error) {
      console.warn('[Progress] Failed to load from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [userId])

  // Save progress to localStorage whenever it changes
  const saveToLocalStorage = useCallback((progressData: PersistedProgress) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(progressData))
      console.log('[Progress] Saved to localStorage:', progressData)
    } catch (error) {
      console.warn('[Progress] Failed to save to localStorage:', error)
    }
  }, [userId])

  // Update progress and persist
  const updateProgress = useCallback((updates: Partial<PersistedProgress>) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        ...updates,
        lastActiveDate: new Date().toISOString().split('T')[0]
      }
      
      // Recalculate level based on XP if XP changed
      if (updates.xpPoints !== undefined) {
        updated.level = Math.floor(updates.xpPoints / 100) + 1
      }

      // Save to localStorage directly to avoid dependency issues
      try {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated))
        console.log('[Progress] Saved to localStorage:', updated)
      } catch (error) {
        console.warn('[Progress] Failed to save to localStorage:', error)
      }
      
      return updated
    })
  }, [userId])

  // Debounced sync function to prevent rapid calls
  const debouncedSyncFromBackend = useCallback((isInitial: boolean = false) => {
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    // For initial sync, run immediately without debounce
    const delay = isInitial ? 0 : DEBOUNCE_DELAY
    
    syncTimeoutRef.current = setTimeout(() => {
      syncFromBackendInternal()
    }, delay)
  }, [])

  // Internal sync function with proper request management
  const syncFromBackendInternal = useCallback(async () => {
    // Global check: prevent concurrent syncs across all hook instances
    if (globalSyncInProgress || isSyncing) {
      console.log('[Progress] Sync already in progress globally or locally, skipping')
      return false
    }
    
    // Global debounce: prevent too frequent calls across all instances
    const now = Date.now()
    if (now - globalLastSyncTime < DEBOUNCE_DELAY) {
      console.log('[Progress] Global sync debounced, too frequent')
      return false
    }
    
    globalLastSyncTime = now
    lastSyncTimeRef.current = now

    // Cancel any existing global request for this user
    const existingController = globalActiveRequests.get(userId)
    if (existingController) {
      existingController.abort()
      globalActiveRequests.delete(userId)
    }
    
    // Cancel local request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    globalActiveRequests.set(userId, abortControllerRef.current)
    
    globalSyncInProgress = true
    setIsSyncing(true)
    try {
      console.log('[Progress] Starting backend sync for user:', userId)
      
      const response = await fetch(`/personal/api/user-progress?userId=${userId}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.progress) {
          const backendProgress: PersistedProgress = {
            xpPoints: data.progress.xpPoints || 0,
            level: data.progress.level || 1,
            streak: data.progress.streak || 0,
            achievements: data.progress.achievements?.map((a: any) => typeof a === 'string' ? a : a.name) || [],
            totalQuestionsAnswered: data.progress.totalQuestionsAnswered || 0,
            totalCorrectAnswers: data.progress.totalCorrectAnswers || 0,
            lastActiveDate: data.progress.lastActiveDate || new Date().toISOString().split('T')[0],
            lastSyncedAt: new Date().toISOString()
          }

          setProgress(backendProgress)
          // Save to localStorage directly to avoid dependency issues
          try {
            localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(backendProgress))
            console.log('[Progress] Saved synced progress to localStorage')
          } catch (error) {
            console.warn('[Progress] Failed to save synced progress to localStorage:', error)
          }
          console.log('[Progress] Synced from backend successfully')
          return true
        }
      } else {
        console.warn('[Progress] Failed to sync from backend:', response.status)
      }
    } catch (error: any) {
      // Don't log errors for aborted requests
      if (error.name !== 'AbortError') {
        console.warn('[Progress] Backend sync error:', error)
      }
    } finally {
      globalSyncInProgress = false
      setIsSyncing(false)
      globalActiveRequests.delete(userId)
      abortControllerRef.current = null
    }
    return false
  }, [userId])

  // Sync to backend (save progress to server) 
  const syncToBackend = useCallback(async (progressData?: PersistedProgress) => {
    const dataToSync = progressData || progress
    
    try {
      const response = await fetch('/personal/api/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          progress: {
            userId,
            ...dataToSync
          }
        })
      })

      if (response.ok) {
        console.log('[Progress] Synced to backend successfully')
        return true
      } else {
        console.warn('[Progress] Failed to sync to backend:', response.status)
      }
    } catch (error) {
      console.warn('[Progress] Backend sync error:', error)
    }
    return false
  }, [userId, progress])

  // Clean up function
  const cleanup = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      globalActiveRequests.delete(userId)
      abortControllerRef.current = null
    }
  }, [userId])
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Initial sync from backend when component mounts (only once)
  useEffect(() => {
    if (isLoaded && !initialSyncDoneRef.current) {
      console.log('[Progress] Performing initial sync')
      initialSyncDoneRef.current = true
      debouncedSyncFromBackend(true) // isInitial = true for immediate execution
    }
  }, [isLoaded, debouncedSyncFromBackend])

  // Periodic sync (separate from initial sync)
  useEffect(() => {
    if (!isLoaded || !initialSyncDoneRef.current) return

    console.log('[Progress] Setting up periodic sync')
    const interval = setInterval(() => {
      debouncedSyncFromBackend(false) // isInitial = false for debounced execution
    }, SYNC_INTERVAL)

    return () => {
      console.log('[Progress] Cleaning up periodic sync')
      clearInterval(interval)
    }
  }, [isLoaded, debouncedSyncFromBackend])

  return {
    progress,
    updateProgress,
    syncFromBackend: () => debouncedSyncFromBackend(false),
    syncToBackend,
    isLoaded,
    isSyncing,
    
    // Convenience methods
    addXP: (points: number) => updateProgress({ 
      xpPoints: progress.xpPoints + points 
    }),
    
    incrementStreak: () => updateProgress({ 
      streak: progress.streak + 1 
    }),
    
    addAchievement: (achievement: string) => {
      if (!progress.achievements.includes(achievement)) {
        updateProgress({ 
          achievements: [...progress.achievements, achievement] 
        })
      }
    },

    resetProgress: () => {
      updateProgress(defaultProgress)
    }
  }
}