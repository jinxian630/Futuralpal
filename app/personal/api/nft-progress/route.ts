import { NextRequest, NextResponse } from 'next/server'

interface LearningAchievement {
  id: string
  type: 'notes_generated' | 'questions_answered' | 'perfect_score' | 'study_streak' | 'topic_mastery'
  title: string
  description: string
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirements: {
    count?: number
    accuracy?: number
    streak?: number
    topics?: string[]
  }
  earned: boolean
  earnedAt?: string
  nftMetadata?: {
    image: string
    animation_url?: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
}

const ACHIEVEMENT_DEFINITIONS: Omit<LearningAchievement, 'earned' | 'earnedAt'>[] = [
  {
    id: 'first_notes',
    type: 'notes_generated',
    title: '📚 First Steps',
    description: 'Generated your first AI study notes',
    points: 100,
    rarity: 'common',
    requirements: { count: 1 },
    nftMetadata: {
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=first_notes&backgroundColor=3b82f6',
      attributes: [
        { trait_type: 'Category', value: 'Learning Foundation' },
        { trait_type: 'Rarity', value: 'Common' },
        { trait_type: 'Points', value: 100 }
      ]
    }
  },
  {
    id: 'question_master',
    type: 'questions_answered',
    title: '🎯 Question Master',
    description: 'Answered 50 questions correctly',
    points: 500,
    rarity: 'rare',
    requirements: { count: 50, accuracy: 0.8 },
    nftMetadata: {
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=question_master&backgroundColor=10b981',
      attributes: [
        { trait_type: 'Category', value: 'Assessment Excellence' },
        { trait_type: 'Rarity', value: 'Rare' },
        { trait_type: 'Points', value: 500 }
      ]
    }
  },
  {
    id: 'perfect_streak',
    type: 'perfect_score',
    title: '⚡ Perfect Storm',
    description: 'Achieved 10 perfect scores in a row',
    points: 1000,
    rarity: 'epic',
    requirements: { streak: 10, accuracy: 1.0 },
    nftMetadata: {
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=perfect_streak&backgroundColor=f59e0b',
      attributes: [
        { trait_type: 'Category', value: 'Mastery Achievement' },
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Points', value: 1000 }
      ]
    }
  },
  {
    id: 'polyglot_learner',
    type: 'topic_mastery',
    title: '🌐 Polyglot Scholar',
    description: 'Mastered content in multiple languages',
    points: 1500,
    rarity: 'legendary',
    requirements: { topics: ['bilingual_content', 'chinese_english'] },
    nftMetadata: {
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=polyglot&backgroundColor=8b5cf6',
      attributes: [
        { trait_type: 'Category', value: 'Cultural Excellence' },
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Points', value: 1500 }
      ]
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default_user'
    
    // In a real app, fetch from database
    const userProgress = getUserProgress(userId)
    const achievements = calculateAchievements(userProgress)
    
    return NextResponse.json({
      success: true,
      data: {
        totalPoints: achievements.reduce((sum, a) => sum + (a.earned ? a.points : 0), 0),
        earnedAchievements: achievements.filter(a => a.earned),
        availableAchievements: achievements.filter(a => !a.earned),
        nftBadges: achievements.filter(a => a.earned).map(a => a.nftMetadata),
        progressSummary: {
          notesGenerated: userProgress.notesGenerated,
          questionsAnswered: userProgress.questionsAnswered,
          correctAnswers: userProgress.correctAnswers,
          currentStreak: userProgress.currentStreak,
          topicsStudied: userProgress.topicsStudied
        }
      }
    })
  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load progress data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data, userId = 'default_user' } = await request.json()
    
    const userProgress = getUserProgress(userId)
    
    // Update progress based on action
    switch (action) {
      case 'generate_notes':
        userProgress.notesGenerated++
        userProgress.topicsStudied.add(data.topic || 'general')
        break
      case 'answer_question':
        userProgress.questionsAnswered++
        if (data.isCorrect) {
          userProgress.correctAnswers++
          userProgress.currentStreak++
          userProgress.maxStreak = Math.max(userProgress.maxStreak, userProgress.currentStreak)
        } else {
          userProgress.currentStreak = 0
        }
        break
      case 'complete_session':
        userProgress.studySessions++
        break
    }
    
    // Save progress (in real app, save to database)
    saveUserProgress(userId, userProgress)
    
    // Check for new achievements
    const achievements = calculateAchievements(userProgress)
    const newAchievements = achievements.filter(a => 
      a.earned && !userProgress.earnedAchievements.includes(a.id)
    )
    
    // Update earned achievements
    newAchievements.forEach(achievement => {
      userProgress.earnedAchievements.push(achievement.id)
    })
    
    return NextResponse.json({
      success: true,
      data: {
        progressUpdated: true,
        newAchievements: newAchievements,
        totalPoints: achievements.reduce((sum, a) => sum + (a.earned ? a.points : 0), 0),
        currentProgress: userProgress
      }
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// Helper functions (in real app, these would use a database)
function getUserProgress(userId: string) {
  const stored = typeof window !== 'undefined' ? 
    localStorage.getItem(`user_progress_${userId}`) : null
  
  return stored ? JSON.parse(stored) : {
    notesGenerated: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    maxStreak: 0,
    studySessions: 0,
    topicsStudied: new Set(),
    earnedAchievements: [],
    joinedAt: new Date().toISOString()
  }
}

function saveUserProgress(userId: string, progress: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`user_progress_${userId}`, JSON.stringify({
      ...progress,
      topicsStudied: Array.from(progress.topicsStudied)
    }))
  }
}

function calculateAchievements(userProgress: any): LearningAchievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let earned = false
    let earnedAt: string | undefined
    
    switch (def.type) {
      case 'notes_generated':
        earned = userProgress.notesGenerated >= (def.requirements.count || 0)
        break
      case 'questions_answered':
        const accuracy = userProgress.questionsAnswered > 0 ? 
          userProgress.correctAnswers / userProgress.questionsAnswered : 0
        earned = userProgress.questionsAnswered >= (def.requirements.count || 0) &&
                 accuracy >= (def.requirements.accuracy || 0)
        break
      case 'perfect_score':
        earned = userProgress.maxStreak >= (def.requirements.streak || 0)
        break
      case 'topic_mastery':
        const requiredTopics = def.requirements.topics || []
        const studiedTopics = Array.from(userProgress.topicsStudied) as string[]
        earned = requiredTopics.some(topic => 
          studiedTopics.some((studied: string) => studied.includes(topic))
        )
        break
    }
    
    if (earned && userProgress.earnedAchievements.includes(def.id)) {
      earnedAt = new Date().toISOString() // In real app, store actual earned date
    }
    
    return {
      ...def,
      earned,
      earnedAt
    }
  })
} 