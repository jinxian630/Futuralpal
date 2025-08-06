// Advanced Gamification Integration for FuturoPal AI Tutor
// Seamless integration of XP, achievements, and motivational systems

import { GamificationEngine, XP_ACTIONS, ACHIEVEMENTS } from './gamification'
import { StudentAnalysis, GamificationContext } from './types/student'

// Initialize gamification system
const gamificationEngine = new GamificationEngine()

// 🎮 XP Calculation for Tutor Interactions
export function calculateTutorXP(
  actionType: string,
  context: {
    intent: string
    difficulty?: 'easy' | 'medium' | 'hard'
    confidenceLevel: number
    isCorrectAnswer?: boolean
    studentStreak?: number
    emotionalState?: string
    patienceLevel?: string
  }
): {
  xpGained: number
  bonusMultiplier: number
  bonusReasons: string[]
  milestoneReached?: {
    type: 'level' | 'xp_threshold' | 'streak'
    value: number
    reward: number
  }
} {
  let baseXP = 0
  let bonusMultiplier = 1.0
  const bonusReasons: string[] = []
  
  // Base XP calculation based on action type
  switch (actionType) {
    case 'ask_question':
      baseXP = 5
      break
    case 'receive_explanation':
      baseXP = 8
      break
    case 'answer_correctly':
      baseXP = context.difficulty === 'easy' ? 15 : context.difficulty === 'medium' ? 25 : 40
      break
    case 'answer_incorrectly':
      baseXP = 3 // Participation points
      break
    case 'use_patience':
      baseXP = 10 // Bonus for working through difficult concepts
      break
    case 'show_curiosity':
      baseXP = 12
      break
    case 'demonstrate_learning':
      baseXP = 20
      break
    default:
      baseXP = 5 // Default interaction XP
  }
  
  // Apply difficulty multiplier for answers
  if (context.isCorrectAnswer && context.difficulty) {
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0
    }[context.difficulty]
    
    bonusMultiplier *= difficultyMultiplier
    bonusReasons.push(`${context.difficulty} difficulty bonus`)
  }
  
  // Apply confidence-based bonuses
  if (context.confidenceLevel < 40) {
    bonusMultiplier *= 1.3 // Extra credit for persistence when struggling
    bonusReasons.push('Persistence bonus for low confidence')
  } else if (context.confidenceLevel > 80) {
    bonusMultiplier *= 1.1 // Small bonus for high confidence
    bonusReasons.push('Confidence bonus')
  }
  
  // Apply streak bonuses
  if (context.studentStreak && context.studentStreak >= 3) {
    const streakBonus = Math.min(2.0, 1 + (context.studentStreak * 0.1))
    bonusMultiplier *= streakBonus
    bonusReasons.push(`${context.studentStreak} question streak bonus`)
  }
  
  // Apply emotional state bonuses
  if (context.emotionalState) {
    switch (context.emotionalState) {
      case 'frustrated':
        bonusMultiplier *= 1.4 // Reward persistence through frustration
        bonusReasons.push('Persistence through frustration bonus')
        break
      case 'excited':
        bonusMultiplier *= 1.2 // Reward enthusiasm
        bonusReasons.push('Enthusiasm bonus')
        break
      case 'curious':
        bonusMultiplier *= 1.3 // Reward curiosity
        bonusReasons.push('Curiosity bonus')
        break
      case 'confused':
        bonusMultiplier *= 1.2 // Reward working through confusion
        bonusReasons.push('Learning through confusion bonus')
        break
    }
  }
  
  // Apply patience level bonuses
  if (context.patienceLevel) {
    switch (context.patienceLevel) {
      case 'maximum':
        bonusMultiplier *= 1.5 // Extra reward for working through very difficult concepts
        bonusReasons.push('Extra patience required bonus')
        break
      case 'high':
        bonusMultiplier *= 1.3
        bonusReasons.push('High patience bonus')
        break
      case 'elevated':
        bonusMultiplier *= 1.1
        bonusReasons.push('Elevated support bonus')
        break
    }
  }
  
  const finalXP = Math.round(baseXP * bonusMultiplier)
  
  return {
    xpGained: finalXP,
    bonusMultiplier,
    bonusReasons,
    // Milestone detection would be handled by the main gamification system
  }
}

// 🏆 Achievement Detection for Tutor Interactions
export function checkTutorAchievements(
  studentProgress: any,
  sessionContext: {
    questionsAsked: number
    correctAnswers: number
    topicsExplored: string[]
    sessionDuration: number // minutes
    emotionalStates: string[]
    difficultyProgression: string[]
    conversationTurns: number
  }
): {
  newAchievements: Array<{
    id: string
    name: string
    description: string
    emoji: string
    xpReward: number
    unlockedAt: string
  }>
  progressUpdates: Array<{
    achievementId: string
    progress: number
    target: number
    description: string
  }>
} {
  const newAchievements: any[] = []
  const progressUpdates: any[] = []
  const now = new Date().toISOString()
  
  // Conversation-based achievements
  if (sessionContext.conversationTurns >= 20 && !studentProgress.achievements?.includes('chatterbox')) {
    newAchievements.push({
      id: 'chatterbox',
      name: 'Chatterbox',
      description: 'Had 20+ exchanges in a single conversation',
      emoji: '💬',
      xpReward: 100,
      unlockedAt: now
    })
  }
  
  // Deep dive achievement
  if (sessionContext.sessionDuration >= 45 && !studentProgress.achievements?.includes('deep_diver')) {
    newAchievements.push({
      id: 'deep_diver',
      name: 'Deep Diver',
      description: 'Spent 45+ minutes in focused learning',
      emoji: '🏊‍♀️',
      xpReward: 150,
      unlockedAt: now
    })
  }
  
  // Emotional intelligence achievements
  const uniqueEmotions = new Set(sessionContext.emotionalStates).size
  if (uniqueEmotions >= 4 && !studentProgress.achievements?.includes('emotional_intelligence')) {
    newAchievements.push({
      id: 'emotional_intelligence',
      name: 'Emotional Intelligence',
      description: 'Expressed diverse emotions while learning',
      emoji: '🧠💝',
      xpReward: 120,
      unlockedAt: now
    })
  }
  
  // Difficulty progression achievement
  const progressedThroughDifficulties = sessionContext.difficultyProgression.includes('easy') &&
                                      sessionContext.difficultyProgression.includes('medium') &&
                                      sessionContext.difficultyProgression.includes('hard')
  
  if (progressedThroughDifficulties && !studentProgress.achievements?.includes('level_climber')) {
    newAchievements.push({
      id: 'level_climber',
      name: 'Level Climber',
      description: 'Progressed from easy to hard difficulty in one session',
      emoji: '🧗‍♀️',
      xpReward: 200,
      unlockedAt: now
    })
  }
  
  // Topic explorer achievement
  if (sessionContext.topicsExplored.length >= 3 && !studentProgress.achievements?.includes('topic_explorer')) {
    newAchievements.push({
      id: 'topic_explorer',
      name: 'Topic Explorer',
      description: 'Explored 3+ different topics in one session',
      emoji: '🗺️',
      xpReward: 130,
      unlockedAt: now
    })
  }
  
  // Curiosity achievements based on question types
  if (sessionContext.questionsAsked >= 10 && !studentProgress.achievements?.includes('question_master')) {
    newAchievements.push({
      id: 'question_master',
      name: 'Question Master',
      description: 'Asked 10+ thoughtful questions',
      emoji: '❓',
      xpReward: 100,
      unlockedAt: now
    })
  }
  
  // Progress tracking for long-term achievements
  const totalQuestions = studentProgress.totalQuestionsAsked || 0
  if (totalQuestions >= 50 && totalQuestions < 100) {
    progressUpdates.push({
      achievementId: 'century_questions',
      progress: totalQuestions,
      target: 100,
      description: 'Ask 100 questions total'
    })
  }
  
  const totalTopics = studentProgress.topicsExplored?.length || 0
  if (totalTopics >= 5 && totalTopics < 10) {
    progressUpdates.push({
      achievementId: 'knowledge_seeker',
      progress: totalTopics,
      target: 10,
      description: 'Explore 10 different topics'
    })
  }
  
  return {
    newAchievements,
    progressUpdates
  }
}

// 🎯 Motivational Message Generation
export function generateMotivationalResponse(
  context: {
    xpGained: number
    bonusReasons: string[]
    newAchievements: any[]
    currentLevel: number
    currentXP: number
    currentStreak: number
    emotionalState?: string
    learningVelocity?: number
  }
): {
  primaryMessage: string
  xpAnnouncement: string
  achievementCelebration?: string
  nextGoalMotivation: string
  personalizedEncouragement: string
} {
  // Primary motivational message based on XP gained
  let primaryMessage = ''
  if (context.xpGained >= 50) {
    primaryMessage = "🌟 Outstanding work! You're making incredible progress! 🚀"
  } else if (context.xpGained >= 30) {
    primaryMessage = "💪 Excellent job! Your dedication is really paying off! ✨"
  } else if (context.xpGained >= 15) {
    primaryMessage = "👏 Great work! You're building solid understanding! 📈"
  } else {
    primaryMessage = "🎯 Good effort! Every step forward counts! 🌱"
  }
  
  // XP announcement with bonuses
  let xpAnnouncement = `+${context.xpGained} XP earned!`
  if (context.bonusReasons.length > 0) {
    xpAnnouncement += ` (${context.bonusReasons.join(', ')})`
  }
  
  // Achievement celebration
  let achievementCelebration: string | undefined
  if (context.newAchievements.length > 0) {
    const achievements = context.newAchievements.map(a => `${a.emoji} **${a.name}**`).join(', ')
    achievementCelebration = `🏆 **Achievement${context.newAchievements.length > 1 ? 's' : ''} Unlocked!** ${achievements}`
  }
  
  // Next goal motivation
  const xpToNextLevel = ((context.currentLevel + 1) * 100) - (context.currentXP % 100)
  let nextGoalMotivation = ''
  
  if (xpToNextLevel <= 20) {
    nextGoalMotivation = `🔥 You're so close to Level ${context.currentLevel + 1}! Just ${xpToNextLevel} XP to go!`
  } else if (xpToNextLevel <= 50) {
    nextGoalMotivation = `⭐ Keep going! Level ${context.currentLevel + 1} is within reach - ${xpToNextLevel} XP away!`
  } else {
    nextGoalMotivation = `🎯 Working towards Level ${context.currentLevel + 1}! ${xpToNextLevel} XP to reach the next milestone!`
  }
  
  // Personalized encouragement based on emotional state and learning velocity
  let personalizedEncouragement = ''
  
  if (context.emotionalState) {
    switch (context.emotionalState) {
      case 'frustrated':
        personalizedEncouragement = "💙 I know this feels challenging, but you're showing incredible persistence! Every question you ask makes you stronger! 🌱"
        break
      case 'excited':
        personalizedEncouragement = "🚀 I love your enthusiasm! This energy will take your learning to amazing places! Keep that curiosity burning! 🔥"
        break
      case 'curious':
        personalizedEncouragement = "🔍 Your curiosity is your superpower! Great learners ask great questions, and you're proving that beautifully! 💡"
        break
      case 'confident':
        personalizedEncouragement = "⚡ Your confidence is inspiring! Ready to take on even bigger challenges? Let's see what you can achieve! 🏆"
        break
      case 'confused':
        personalizedEncouragement = "🤝 Working through confusion shows real intellectual courage! You're building understanding step by step! 🧠"
        break
      case 'tired':
        personalizedEncouragement = "🌟 Even when tired, you're still learning! That dedication will serve you well. Maybe time for a quick energizing break? ☕"
        break
      default:
        personalizedEncouragement = "🎯 Your consistent effort is building real expertise! Keep up this wonderful learning momentum! 📚"
    }
  } else {
    // Default encouragement based on learning velocity
    if (context.learningVelocity && context.learningVelocity > 0.7) {
      personalizedEncouragement = "🚀 You're learning at an impressive pace! Your quick grasp of concepts is remarkable! 🌟"
    } else if (context.learningVelocity && context.learningVelocity < 0.4) {
      personalizedEncouragement = "🌱 Taking your time to really understand - that's the mark of a thoughtful learner! Quality over speed! 💎"
    } else {
      personalizedEncouragement = "📈 You're finding a great learning rhythm! Steady progress leads to lasting understanding! 💪"
    }
  }
  
  // Add streak encouragement if applicable
  if (context.currentStreak >= 5) {
    personalizedEncouragement += ` And that ${context.currentStreak}-question streak? Pure fire! 🔥🔥🔥`
  } else if (context.currentStreak >= 3) {
    personalizedEncouragement += ` Plus you've got a ${context.currentStreak}-question streak going! 🔥`
  }
  
  return {
    primaryMessage,
    xpAnnouncement,
    achievementCelebration,
    nextGoalMotivation,
    personalizedEncouragement
  }
}

// 🎮 Gamification Context Builder
export function buildGamificationContext(
  userId: string,
  sessionData?: {
    questionsAsked: number
    correctAnswers: number
    sessionDuration: number
    topicsExplored: string[]
  }
): GamificationContext {
  // Load current progress from gamification engine
  const progress = gamificationEngine.loadProgress(userId)
  const insights = gamificationEngine.getLearningInsights(progress)
  
  // Determine next milestone
  let nextMilestone: GamificationContext['nextMilestone']
  
  const xpToNextLevel = ((progress.level + 1) * 100) - (progress.xpPoints % 100)
  const questionsToNextAchievement = getQuestionsToNextAchievement(progress.totalQuestionsAnswered)
  
  if (xpToNextLevel <= questionsToNextAchievement.xpEquivalent) {
    nextMilestone = {
      type: 'level',
      target: progress.level + 1,
      progress: (progress.xpPoints % 100) / 100 * 100
    }
  } else {
    nextMilestone = {
      type: 'achievement',
      target: questionsToNextAchievement.name,
      progress: (progress.totalQuestionsAnswered / questionsToNextAchievement.target) * 100
    }
  }
  
  return {
    currentXP: progress.xpPoints,
    currentLevel: progress.level,
    currentStreak: progress.streak,
    achievements: progress.achievements.map(a => a.id),
    nextMilestone
  }
}

// 📊 Progress Integration with Responses
export function integrateProgressWithResponse(
  response: string,
  gamificationResults: {
    xpGained: number
    bonusReasons: string[]
    newAchievements: any[]
    motivationalMessage: any
  }
): {
  enhancedResponse: string
  gamificationSummary: {
    xpGained: number
    achievementsCount: number
    motivationalHighlight: string
  }
} {
  let enhancedResponse = response
  
  // Add motivational section to response
  let gamificationSection = '\n\n---\n\n'
  gamificationSection += gamificationResults.motivationalMessage.primaryMessage + '\n\n'
  gamificationSection += `💎 ${gamificationResults.motivationalMessage.xpAnnouncement}\n`
  
  if (gamificationResults.motivationalMessage.achievementCelebration) {
    gamificationSection += `${gamificationResults.motivationalMessage.achievementCelebration}\n`
  }
  
  gamificationSection += `${gamificationResults.motivationalMessage.nextGoalMotivation}\n\n`
  gamificationSection += gamificationResults.motivationalMessage.personalizedEncouragement
  
  enhancedResponse += gamificationSection
  
  return {
    enhancedResponse,
    gamificationSummary: {
      xpGained: gamificationResults.xpGained,
      achievementsCount: gamificationResults.newAchievements.length,
      motivationalHighlight: gamificationResults.motivationalMessage.primaryMessage
    }
  }
}

// Helper Functions

function getQuestionsToNextAchievement(currentQuestions: number): {
  name: string
  target: number
  xpEquivalent: number
} {
  const questionMilestones = [
    { name: 'Question Master', target: 10, xpReward: 100 },
    { name: 'Curious Mind', target: 25, xpReward: 200 },
    { name: 'Inquiry Expert', target: 50, xpReward: 300 },
    { name: 'Century Club', target: 100, xpReward: 500 },
    { name: 'Question Legend', target: 250, xpReward: 750 }
  ]
  
  for (const milestone of questionMilestones) {
    if (currentQuestions < milestone.target) {
      return {
        name: milestone.name,
        target: milestone.target,
        xpEquivalent: milestone.xpReward
      }
    }
  }
  
  // Default for very high achievers
  return {
    name: 'Ultimate Scholar',
    target: Math.ceil(currentQuestions / 100) * 100 + 100,
    xpEquivalent: 1000
  }
}

// Export the gamification engine instance for use in other modules
export { gamificationEngine }