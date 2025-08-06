// FuturoPal Gamification System
// Advanced learning motivation and engagement engine

export interface UserProgress {
  userId: string
  xpPoints: number
  level: number
  streak: number
  lastActiveDate: string
  achievements: Achievement[]
  topicProgress: { [topic: string]: TopicProgress }
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  unlockedAt: string
  category: 'learning' | 'engagement' | 'streak' | 'mastery'
  xpReward: number
}

export interface TopicProgress {
  topic: string
  questionsAnswered: number
  correctAnswers: number
  averageDifficulty: number
  masteryLevel: number // 0-100
  firstStudied: string
  lastStudied: string
}

export interface XPAction {
  action: string
  baseXP: number
  multiplier?: number
  description: string
}

// XP Actions and Rewards
export const XP_ACTIONS: { [key: string]: XPAction } = {
  'topic_selection': { action: 'topic_selection', baseXP: 10, description: 'Selecting a new topic to explore' },
  'question_generated': { action: 'question_generated', baseXP: 5, description: 'Generating a new question' },
  'easy_correct': { action: 'easy_correct', baseXP: 15, description: 'Correctly answering an easy question' },
  'medium_correct': { action: 'medium_correct', baseXP: 25, description: 'Correctly answering a medium question' },
  'hard_correct': { action: 'hard_correct', baseXP: 40, description: 'Correctly answering a hard question' },
  'participation': { action: 'participation', baseXP: 5, description: 'Attempting a question (participation bonus)' },
  'conversation': { action: 'conversation', baseXP: 3, description: 'Engaging in educational conversation' },
  'streak_bonus': { action: 'streak_bonus', baseXP: 10, multiplier: 1.5, description: 'Maintaining a learning streak' },
  'daily_return': { action: 'daily_return', baseXP: 20, description: 'Coming back to learn on a new day' },
  'achievement_unlock': { action: 'achievement_unlock', baseXP: 50, description: 'Unlocking a new achievement' }
}

// Achievement Definitions
export const ACHIEVEMENTS: { [key: string]: Omit<Achievement, 'unlockedAt'> } = {
  'first_steps': {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Answer your first question',
    emoji: '👶',
    category: 'learning',
    xpReward: 25
  },
  'question_master': {
    id: 'question_master',
    name: 'Question Master',
    description: 'Answer 10 questions',
    emoji: '🎯',
    category: 'learning',
    xpReward: 100
  },
  'century_club': {
    id: 'century_club',
    name: 'Century Club',
    description: 'Answer 100 questions',
    emoji: '💯',
    category: 'learning',
    xpReward: 500
  },
  'on_fire': {
    id: 'on_fire',
    name: 'On Fire!',
    description: 'Get 3 questions right in a row',
    emoji: '🔥',
    category: 'streak',
    xpReward: 75
  },
  'streak_warrior': {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintain a 7-day learning streak',
    emoji: '⚡',
    category: 'streak',
    xpReward: 200
  },
  'rising_star': {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reach 500 XP points',
    emoji: '⭐',
    category: 'engagement',
    xpReward: 100
  },
  'knowledge_seeker': {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Explore 5 different topics',
    emoji: '🔍',
    category: 'learning',
    xpReward: 150
  },
  'perfectionist': {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '100% accuracy on 10 consecutive questions',
    emoji: '✨',
    category: 'mastery',
    xpReward: 300
  },
  'night_owl': {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    emoji: '🦉',
    category: 'engagement',
    xpReward: 50
  },
  'early_bird': {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 7 AM',
    emoji: '🐦',
    category: 'engagement',
    xpReward: 50
  },
  'chat_master': {
    id: 'chat_master',
    name: 'Chat Master',
    description: 'Have 25 conversations with the AI',
    emoji: '💬',
    category: 'engagement',
    xpReward: 125
  },
  'topic_expert': {
    id: 'topic_expert',
    name: 'Topic Expert',
    description: 'Achieve 90% mastery in any topic',
    emoji: '🧠',
    category: 'mastery',
    xpReward: 250
  }
}

export class GamificationEngine {
  private storageKey = 'futuropal_progress'

  // Load user progress from localStorage
  loadProgress(userId: string = 'default'): UserProgress {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
      if (stored) {
        const progress = JSON.parse(stored)
        // Ensure all required fields exist
        return {
          userId,
          xpPoints: 0,
          level: 1,
          streak: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          achievements: [],
          topicProgress: {},
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          ...progress
        }
      }
    } catch (error) {
      console.warn('Failed to load progress from localStorage:', error)
    }

    // Return default progress
    return {
      userId,
      xpPoints: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: [],
      topicProgress: {},
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0
    }
  }

  // Save user progress to localStorage
  saveProgress(progress: UserProgress): boolean {
    try {
      localStorage.setItem(`${this.storageKey}_${progress.userId}`, JSON.stringify(progress))
      return true
    } catch (error) {
      console.warn('Failed to save progress to localStorage:', error)
      return false
    }
  }

  // Calculate level from XP
  calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1
  }

  // Calculate XP needed for next level
  getXPForNextLevel(level: number): number {
    return level * 100
  }

  // Award XP and check for level up
  awardXP(progress: UserProgress, actionKey: string, context: any = {}): {
    updatedProgress: UserProgress
    leveledUp: boolean
    xpGained: number
    newAchievements: Achievement[]
  } {
    const action = XP_ACTIONS[actionKey]
    if (!action) {
      console.warn(`Unknown XP action: ${actionKey}`)
      return { updatedProgress: progress, leveledUp: false, xpGained: 0, newAchievements: [] }
    }

    let xpGained = action.baseXP
    const oldLevel = progress.level

    // Apply multipliers
    if (action.multiplier && context.streak > 2) {
      xpGained = Math.floor(xpGained * action.multiplier)
    }

    // Difficulty bonus for questions
    if (context.difficulty) {
      const difficultyMultiplier = {
        'easy': 1,
        'medium': 1.5,
        'hard': 2
      }[context.difficulty] || 1
      xpGained = Math.floor(xpGained * difficultyMultiplier)
    }

    // Update progress
    const updatedProgress: UserProgress = {
      ...progress,
      xpPoints: progress.xpPoints + xpGained,
      level: this.calculateLevel(progress.xpPoints + xpGained),
      lastActiveDate: new Date().toISOString().split('T')[0]
    }

    const leveledUp = updatedProgress.level > oldLevel

    // Check for new achievements
    const newAchievements = this.checkAchievements(updatedProgress, context)

    // Save progress
    this.saveProgress(updatedProgress)

    return { updatedProgress, leveledUp, xpGained, newAchievements }
  }

  // Update topic progress
  updateTopicProgress(progress: UserProgress, topic: string, isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): UserProgress {
    const difficultyValue = { 'easy': 1, 'medium': 2, 'hard': 3 }[difficulty]
    const now = new Date().toISOString()

    const currentTopic = progress.topicProgress[topic] || {
      topic,
      questionsAnswered: 0,
      correctAnswers: 0,
      averageDifficulty: 1,
      masteryLevel: 0,
      firstStudied: now,
      lastStudied: now
    }

    const updatedTopic: TopicProgress = {
      ...currentTopic,
      questionsAnswered: currentTopic.questionsAnswered + 1,
      correctAnswers: currentTopic.correctAnswers + (isCorrect ? 1 : 0),
      averageDifficulty: (currentTopic.averageDifficulty * currentTopic.questionsAnswered + difficultyValue) / (currentTopic.questionsAnswered + 1),
      lastStudied: now
    }

    // Calculate mastery level (0-100)
    const accuracy = updatedTopic.correctAnswers / updatedTopic.questionsAnswered
    const difficultyBonus = Math.min(updatedTopic.averageDifficulty / 3, 1)
    const experienceBonus = Math.min(updatedTopic.questionsAnswered / 20, 1)
    updatedTopic.masteryLevel = Math.floor(accuracy * difficultyBonus * experienceBonus * 100)

    return {
      ...progress,
      topicProgress: {
        ...progress.topicProgress,
        [topic]: updatedTopic
      },
      totalQuestionsAnswered: progress.totalQuestionsAnswered + 1,
      totalCorrectAnswers: progress.totalCorrectAnswers + (isCorrect ? 1 : 0)
    }
  }

  // Update streak
  updateStreak(progress: UserProgress, isCorrect: boolean): UserProgress {
    const today = new Date().toISOString().split('T')[0]
    const lastActive = progress.lastActiveDate
    
    // Check if this is a new day
    const isNewDay = today !== lastActive
    
    let newStreak = progress.streak
    
    if (isCorrect) {
      if (isNewDay) {
        // New day, extend or start streak
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastActive === yesterdayStr) {
          // Consecutive day
          newStreak += 1
        } else {
          // New streak
          newStreak = 1
        }
      } else {
        // Same day, maintain streak
        newStreak = Math.max(progress.streak, 1)
      }
    } else {
      // Wrong answer doesn't break daily streak, only consecutive correct answers
      if (isNewDay) {
        newStreak = 0
      }
    }

    return {
      ...progress,
      streak: newStreak,
      lastActiveDate: today
    }
  }

  // Check for achievements
  checkAchievements(progress: UserProgress, context: any = {}): Achievement[] {
    const newAchievements: Achievement[] = []
    const existingIds = progress.achievements.map(a => a.id)

    // Question-based achievements
    if (progress.totalQuestionsAnswered === 1 && !existingIds.includes('first_steps')) {
      newAchievements.push({ ...ACHIEVEMENTS.first_steps, unlockedAt: new Date().toISOString() })
    }
    if (progress.totalQuestionsAnswered === 10 && !existingIds.includes('question_master')) {
      newAchievements.push({ ...ACHIEVEMENTS.question_master, unlockedAt: new Date().toISOString() })
    }
    if (progress.totalQuestionsAnswered === 100 && !existingIds.includes('century_club')) {
      newAchievements.push({ ...ACHIEVEMENTS.century_club, unlockedAt: new Date().toISOString() })
    }

    // Streak achievements
    if (progress.streak >= 3 && !existingIds.includes('on_fire')) {
      newAchievements.push({ ...ACHIEVEMENTS.on_fire, unlockedAt: new Date().toISOString() })
    }
    if (progress.streak >= 7 && !existingIds.includes('streak_warrior')) {
      newAchievements.push({ ...ACHIEVEMENTS.streak_warrior, unlockedAt: new Date().toISOString() })
    }

    // XP achievements
    if (progress.xpPoints >= 500 && !existingIds.includes('rising_star')) {
      newAchievements.push({ ...ACHIEVEMENTS.rising_star, unlockedAt: new Date().toISOString() })
    }

    // Topic exploration
    const topicsExplored = Object.keys(progress.topicProgress).length
    if (topicsExplored >= 5 && !existingIds.includes('knowledge_seeker')) {
      newAchievements.push({ ...ACHIEVEMENTS.knowledge_seeker, unlockedAt: new Date().toISOString() })
    }

    // Mastery achievements
    const highMasteryTopics = Object.values(progress.topicProgress).filter(t => t.masteryLevel >= 90)
    if (highMasteryTopics.length > 0 && !existingIds.includes('topic_expert')) {
      newAchievements.push({ ...ACHIEVEMENTS.topic_expert, unlockedAt: new Date().toISOString() })
    }

    // Time-based achievements
    const currentHour = new Date().getHours()
    if (currentHour >= 22 && !existingIds.includes('night_owl')) {
      newAchievements.push({ ...ACHIEVEMENTS.night_owl, unlockedAt: new Date().toISOString() })
    }
    if (currentHour <= 7 && !existingIds.includes('early_bird')) {
      newAchievements.push({ ...ACHIEVEMENTS.early_bird, unlockedAt: new Date().toISOString() })
    }

    return newAchievements
  }

  // Get motivational message based on progress
  getMotivationalMessage(progress: UserProgress): string {
    const messages = [
      `🌟 Level ${progress.level}! You're making amazing progress!`,
      `🔥 ${progress.streak} question streak! Keep it up!`,
      `🎯 ${progress.totalCorrectAnswers} correct answers! You're getting smarter every day!`,
      `🚀 ${progress.xpPoints} XP earned! Learning is your superpower!`,
      `💫 ${progress.achievements.length} achievements unlocked! You're unstoppable!`
    ]

    // Choose message based on recent activity
    if (progress.streak >= 5) return messages[1]
    if (progress.achievements.length >= 3) return messages[4]
    if (progress.totalCorrectAnswers >= 20) return messages[2]
    if (progress.level >= 3) return messages[0]
    return messages[3]
  }

  // Get learning insights
  getLearningInsights(progress: UserProgress): {
    strongestTopic: string | null
    improvementArea: string | null
    overallAccuracy: number
    studyPattern: string
    nextGoal: string
  } {
    const topics = Object.values(progress.topicProgress)
    
    const strongestTopic = topics.length > 0 
      ? topics.reduce((best, current) => current.masteryLevel > best.masteryLevel ? current : best).topic
      : null

    const improvementArea = topics.length > 0
      ? topics.reduce((worst, current) => current.masteryLevel < worst.masteryLevel ? current : worst).topic
      : null

    const overallAccuracy = progress.totalQuestionsAnswered > 0 
      ? (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
      : 0

    const studyPattern = progress.streak >= 3 ? 'Consistent Learner' : 'Getting Started'

    const nextGoal = progress.level < 5 
      ? `Reach Level ${progress.level + 1} (${this.getXPForNextLevel(progress.level) - (progress.xpPoints % 100)} XP to go)`
      : 'Master a new topic'

    return {
      strongestTopic,
      improvementArea,
      overallAccuracy,
      studyPattern,
      nextGoal
    }
  }
}

// Export singleton instance
export const gamification = new GamificationEngine()