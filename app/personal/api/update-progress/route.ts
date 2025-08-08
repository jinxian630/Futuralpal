import { NextRequest, NextResponse } from 'next/server'
import { updateUserProgress, getUserProgress } from '@/lib/file-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId = 'default', 
      xp, 
      level, 
      streak, 
      achievements, 
      totalQuestionsAnswered, 
      totalCorrectAnswers 
    } = body

    if (typeof xp !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing XP value'
      }, { status: 400 })
    }

    // Get current progress first
    const currentProgress = getUserProgress(userId)
    
    // Merge with new data
    const progressData = {
      xp: xp,
      level: level || Math.floor(xp / 100) + 1, // Auto-calculate level if not provided
      streak: streak !== undefined ? streak : currentProgress.streak,
      achievements: achievements !== undefined ? achievements : currentProgress.achievements,
      totalQuestionsAnswered: totalQuestionsAnswered !== undefined ? totalQuestionsAnswered : currentProgress.totalQuestionsAnswered,
      totalCorrectAnswers: totalCorrectAnswers !== undefined ? totalCorrectAnswers : currentProgress.totalCorrectAnswers,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }

    const success = updateUserProgress(userId, progressData)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        progress: progressData,
        metadata: {
          updatedAt: new Date().toISOString()
        }
      })
    } else {
      throw new Error('Failed to save progress to file')
    }
  } catch (error) {
    console.error('Update progress API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update user progress'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    
    const progress = getUserProgress(userId)
    
    return NextResponse.json({
      success: true,
      progress: progress
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get progress' 
      },
      { status: 500 }
    )
  }
} 