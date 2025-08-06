// FuturoPal Learning Analytics Engine
// Powered by DeepSeek V3 for Advanced Educational Intelligence

export interface StudySession {
  sessionId: string
  userId: string
  startTime: Date
  endTime?: Date
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionsAttempted: number
  questionsCorrect: number
  averageResponseTime: number
  notesGenerated: boolean
  flashcardsCreated: boolean
  aiModel: 'openai/gpt-4o'
  contentType: 'text' // DeepSeek V3 only supports text
}

export interface LearningMetrics {
  comprehensionRate: number
  retentionScore: number
  engagementLevel: number
  difficultyProgression: number
  studyEfficiency: number
  conceptMastery: { [topic: string]: number }
}

export interface AdaptiveFeedback {
  recommendedDifficulty: 'easy' | 'medium' | 'hard'
  suggestedTopics: string[]
  studyStrategies: string[]
  motivationalMessage: string
  nextSessionGoals: string[]
}

export class LearningAnalytics {
  private sessions: StudySession[] = []
  private userProgress: Map<string, LearningMetrics> = new Map()

  // Track study session
  addSession(session: StudySession): void {
    this.sessions.push(session)
    this.updateUserProgress(session.userId)
  }

  // Update user progress metrics
  private updateUserProgress(userId: string): void {
    const userSessions = this.sessions.filter(s => s.userId === userId)
    
    if (userSessions.length === 0) return

    const totalQuestions = userSessions.reduce((sum, s) => sum + s.questionsAttempted, 0)
    const totalCorrect = userSessions.reduce((sum, s) => sum + s.questionsCorrect, 0)
    const avgResponseTime = userSessions.reduce((sum, s) => sum + s.averageResponseTime, 0) / userSessions.length

    // Calculate comprehension rate
    const comprehensionRate = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    // Calculate retention score based on consistency
    const retentionScore = this.calculateRetentionScore(userSessions)

    // Calculate engagement level
    const engagementLevel = this.calculateEngagementLevel(userSessions)

    // Calculate difficulty progression
    const difficultyProgression = this.calculateDifficultyProgression(userSessions)

    // Calculate study efficiency
    const studyEfficiency = this.calculateStudyEfficiency(userSessions)

    // Calculate concept mastery
    const conceptMastery = this.calculateConceptMastery(userSessions)

    const metrics: LearningMetrics = {
      comprehensionRate,
      retentionScore,
      engagementLevel,
      difficultyProgression,
      studyEfficiency,
      conceptMastery
    }

    this.userProgress.set(userId, metrics)
  }

  // Calculate retention score based on session consistency and performance
  private calculateRetentionScore(sessions: StudySession[]): number {
    if (sessions.length < 2) return 50

    // Analyze performance trends over time
    const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    let retentionScore = 0
    let consistencyBonus = 0

    // Check for improvement over time
    for (let i = 1; i < sortedSessions.length; i++) {
      const currentAccuracy = sortedSessions[i].questionsCorrect / Math.max(sortedSessions[i].questionsAttempted, 1)
      const previousAccuracy = sortedSessions[i-1].questionsCorrect / Math.max(sortedSessions[i-1].questionsAttempted, 1)
      
      if (currentAccuracy >= previousAccuracy) {
        retentionScore += 10
      }
    }

    // Check for regular study sessions (consistency)
    const sessionGaps = []
    for (let i = 1; i < sortedSessions.length; i++) {
      const gap = sortedSessions[i].startTime.getTime() - sortedSessions[i-1].startTime.getTime()
      sessionGaps.push(gap / (1000 * 60 * 60 * 24)) // Convert to days
    }

    const avgGap = sessionGaps.reduce((sum, gap) => sum + gap, 0) / sessionGaps.length
    if (avgGap <= 3) consistencyBonus = 20 // Daily study sessions
    else if (avgGap <= 7) consistencyBonus = 10 // Weekly sessions

    return Math.min(100, retentionScore + consistencyBonus)
  }

  // Calculate engagement level based on session duration and activity
  private calculateEngagementLevel(sessions: StudySession[]): number {
    const recentSessions = sessions.slice(-5) // Last 5 sessions
    let engagementScore = 0

    recentSessions.forEach(session => {
      const duration = session.endTime ? 
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60) : 30 // Default 30 min

      // Score based on session duration (sweet spot: 20-45 minutes)
      if (duration >= 20 && duration <= 45) engagementScore += 25
      else if (duration >= 10 && duration <= 60) engagementScore += 15
      else engagementScore += 5

      // Bonus for using various features
      if (session.notesGenerated) engagementScore += 5
      if (session.flashcardsCreated) engagementScore += 5
    })

    return Math.min(100, engagementScore)
  }

  // Calculate difficulty progression
  private calculateDifficultyProgression(sessions: StudySession[]): number {
    const recentSessions = sessions.slice(-10) // Last 10 sessions
    const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 }

    let progressionScore = 0
    let hasProgressed = false

    recentSessions.forEach((session, index) => {
      if (index > 0) {
        const currentLevel = difficultyMap[session.difficulty]
        const previousLevel = difficultyMap[recentSessions[index-1].difficulty]
        
        if (currentLevel > previousLevel) {
          progressionScore += 15
          hasProgressed = true
        } else if (currentLevel === previousLevel && session.questionsCorrect / session.questionsAttempted >= 0.8) {
          progressionScore += 10 // Maintaining high performance at current level
        }
      }
    })

    // Bonus for reaching hard difficulty with good performance
    const hardSessions = recentSessions.filter(s => s.difficulty === 'hard')
    if (hardSessions.length > 0) {
      const hardAccuracy = hardSessions.reduce((sum, s) => sum + (s.questionsCorrect / s.questionsAttempted), 0) / hardSessions.length
      if (hardAccuracy >= 0.7) progressionScore += 20
    }

    return Math.min(100, progressionScore)
  }

  // Calculate study efficiency
  private calculateStudyEfficiency(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0

    const avgAccuracy = sessions.reduce((sum, s) => sum + (s.questionsCorrect / Math.max(s.questionsAttempted, 1)), 0) / sessions.length
    const avgResponseTime = sessions.reduce((sum, s) => sum + s.averageResponseTime, 0) / sessions.length

    // Efficiency = high accuracy + reasonable response time
    let efficiencyScore = avgAccuracy * 70 // 70% weight on accuracy

    // Response time scoring (optimal: 10-30 seconds per question)
    if (avgResponseTime >= 10 && avgResponseTime <= 30) {
      efficiencyScore += 30
    } else if (avgResponseTime >= 5 && avgResponseTime <= 60) {
      efficiencyScore += 20
    } else {
      efficiencyScore += 10
    }

    return Math.min(100, efficiencyScore)
  }

  // Calculate concept mastery by topic
  private calculateConceptMastery(sessions: StudySession[]): { [topic: string]: number } {
    const topicStats: { [topic: string]: { correct: number; total: number } } = {}

    sessions.forEach(session => {
      if (!topicStats[session.topic]) {
        topicStats[session.topic] = { correct: 0, total: 0 }
      }
      topicStats[session.topic].correct += session.questionsCorrect
      topicStats[session.topic].total += session.questionsAttempted
    })

    const conceptMastery: { [topic: string]: number } = {}
    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic]
      conceptMastery[topic] = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    })

    return conceptMastery
  }

  // Generate adaptive feedback for DeepSeek V3 optimization
  generateAdaptiveFeedback(userId: string): AdaptiveFeedback {
    const metrics = this.userProgress.get(userId)
    const userSessions = this.sessions.filter(s => s.userId === userId)

    if (!metrics || userSessions.length === 0) {
      return {
        recommendedDifficulty: 'easy',
        suggestedTopics: ['Getting Started'],
        studyStrategies: ['Begin with foundational concepts', 'Practice regularly'],
        motivationalMessage: 'Welcome to your learning journey! Start with easy topics to build confidence.',
        nextSessionGoals: ['Complete your first study session', 'Generate comprehensive notes']
      }
    }

    // Determine recommended difficulty
    let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
    if (metrics.comprehensionRate >= 85 && metrics.difficultyProgression >= 60) {
      recommendedDifficulty = 'hard'
    } else if (metrics.comprehensionRate < 65) {
      recommendedDifficulty = 'easy'
    }

    // Suggest topics for improvement
    const suggestedTopics = Object.keys(metrics.conceptMastery)
      .filter(topic => metrics.conceptMastery[topic] < 70)
      .slice(0, 3)

    if (suggestedTopics.length === 0) {
      suggestedTopics.push('Advanced Topics', 'Review and Synthesis')
    }

    // Generate study strategies based on performance
    const studyStrategies = []
    if (metrics.retentionScore < 60) {
      studyStrategies.push('Review previous topics regularly')
      studyStrategies.push('Use spaced repetition with flashcards')
    }
    if (metrics.engagementLevel < 70) {
      studyStrategies.push('Try shorter, more frequent study sessions')
      studyStrategies.push('Use active recall techniques')
    }
    if (metrics.studyEfficiency < 70) {
      studyStrategies.push('Focus on understanding concepts before speed')
      studyStrategies.push('Take breaks between difficult topics')
    }

    // Motivational message based on progress
    let motivationalMessage = ''
    if (metrics.comprehensionRate >= 80) {
      motivationalMessage = '🌟 Excellent progress! You\'re mastering the material with confidence.'
    } else if (metrics.comprehensionRate >= 60) {
      motivationalMessage = '📈 Good progress! Keep practicing to strengthen your understanding.'
    } else {
      motivationalMessage = '💪 Every expert was once a beginner. Keep practicing and you\'ll improve!'
    }

    // Set next session goals
    const nextSessionGoals = []
    if (recommendedDifficulty === 'hard') {
      nextSessionGoals.push('Challenge yourself with advanced concepts')
      nextSessionGoals.push('Apply knowledge to real-world scenarios')
    } else if (recommendedDifficulty === 'medium') {
      nextSessionGoals.push('Build on your current understanding')
      nextSessionGoals.push('Practice connecting different concepts')
    } else {
      nextSessionGoals.push('Focus on foundational concepts')
      nextSessionGoals.push('Build confidence with easier topics')
    }

    return {
      recommendedDifficulty,
      suggestedTopics,
      studyStrategies,
      motivationalMessage,
      nextSessionGoals
    }
  }

  // Get user progress metrics
  getUserMetrics(userId: string): LearningMetrics | null {
    return this.userProgress.get(userId) || null
  }

  // Get learning insights
  getLearningInsights(userId: string): {
    totalSessions: number
    totalQuestions: number
    averageAccuracy: number
    studyStreak: number
    strongestTopics: string[]
    improvementAreas: string[]
  } {
    const userSessions = this.sessions.filter(s => s.userId === userId)
    const metrics = this.userProgress.get(userId)

    const totalSessions = userSessions.length
    const totalQuestions = userSessions.reduce((sum, s) => sum + s.questionsAttempted, 0)
    const totalCorrect = userSessions.reduce((sum, s) => sum + s.questionsCorrect, 0)
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    // Calculate study streak (consecutive days with sessions)
    const sortedSessions = userSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    let studyStreak = 0
    let currentDate = new Date()
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime)
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= studyStreak + 1) {
        studyStreak++
        currentDate = sessionDate
      } else {
        break
      }
    }

    // Identify strongest topics and improvement areas
    const conceptMastery = metrics?.conceptMastery || {}
    const strongestTopics = Object.keys(conceptMastery)
      .filter(topic => conceptMastery[topic] >= 80)
      .slice(0, 3)
    
    const improvementAreas = Object.keys(conceptMastery)
      .filter(topic => conceptMastery[topic] < 60)
      .slice(0, 3)

    return {
      totalSessions,
      totalQuestions,
      averageAccuracy,
      studyStreak,
      strongestTopics,
      improvementAreas
    }
  }

  // Export progress data (for external analysis or backup)
  exportUserData(userId: string): {
    sessions: StudySession[]
    metrics: LearningMetrics | null
    insights: any
    exportDate: string
  } {
    const userSessions = this.sessions.filter(s => s.userId === userId)
    const metrics = this.userProgress.get(userId)
    const insights = this.getLearningInsights(userId)

    return {
      sessions: userSessions,
      metrics: metrics || null,
      insights,
      exportDate: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const learningAnalytics = new LearningAnalytics() 