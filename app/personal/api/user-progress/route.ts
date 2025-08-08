import { NextRequest, NextResponse } from 'next/server'
import { getUserProgress } from '@/lib/file-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'

    // Load progress from file storage
    const progress = getUserProgress(userId)
    
    console.log(`[User Progress API] Retrieved progress for user: ${userId}`, {
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak,
      achievements: progress.achievements
    })

    return NextResponse.json({
      success: true,
      progress: {
        userId: userId,
        xp: progress.xp,
        level: progress.level,
        streak: progress.streak,
        achievements: progress.achievements,
        totalQuestionsAnswered: progress.totalQuestionsAnswered,
        totalCorrectAnswers: progress.totalCorrectAnswers,
        lastActiveDate: progress.lastActiveDate
      },
      metadata: {
        retrievedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('User progress API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve user progress',
      fallbackProgress: {
        userId: 'default',
        xp: 0,
        level: 1,
        streak: 0,
        achievements: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      }
    }, { status: 500 })
  }
}

