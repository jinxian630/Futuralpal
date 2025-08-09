import { NextRequest, NextResponse } from 'next/server'
import { getStudentHomeworkData, computeEffortScore, updateBotEffortState } from '@/lib/effort-calculator'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any // Temporary fix for type issues

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    const userId = searchParams.get('userId')

    if (!module || !userId) {
      return NextResponse.json(
        { error: 'Module and userId are required' },
        { status: 400 }
      )
    }

    // Check if this is a course module
    if (!module.startsWith('course:')) {
      return NextResponse.json(
        { error: 'Effort score only available for course modules' },
        { status: 400 }
      )
    }

    const courseId = module.replace('course:', '')

    // Verify user is enrolled in this course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 404 }
      )
    }

    // Get or calculate effort score
    const existingState = await prisma.botState.findUnique({
      where: {
        userId_module: {
          userId,
          module
        }
      }
    })

    let effortData
    if (existingState) {
      const state = JSON.parse(existingState.stateJson)
      effortData = {
        effort: state.effort || 0,
        emoji: state.emoji || '😐',
        status: state.status || 'neutral',
        needsReminder: state.needsReminder || false,
        lastCalculated: state.lastCalculated
      }
    } else {
      // Calculate effort score
      const homeworkData = await getStudentHomeworkData(userId, courseId)
      const effortScore = computeEffortScore(homeworkData)
      await updateBotEffortState(userId, courseId, effortScore)
      
      effortData = {
        effort: effortScore.score,
        emoji: effortScore.emoji,
        status: effortScore.status,
        needsReminder: effortScore.status === 'at-risk' || effortScore.status === 'concerned',
        lastCalculated: new Date().toISOString()
      }
    }

    return NextResponse.json(effortData)
  } catch (error) {
    console.error('Error fetching effort score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { module, userId } = await request.json()

    if (!module || !userId) {
      return NextResponse.json(
        { error: 'Module and userId are required' },
        { status: 400 }
      )
    }

    if (!module.startsWith('course:')) {
      return NextResponse.json(
        { error: 'Effort score calculation only available for course modules' },
        { status: 400 }
      )
    }

    const courseId = module.replace('course:', '')

    // Calculate fresh effort score
    const homeworkData = await getStudentHomeworkData(userId, courseId)
    const effortScore = computeEffortScore(homeworkData)
    const updatedState = await updateBotEffortState(userId, courseId, effortScore)

    return NextResponse.json({
      effort: effortScore.score,
      emoji: effortScore.emoji,
      status: effortScore.status,
      needsReminder: updatedState.needsReminder,
      details: {
        completionRate: effortScore.completionRate,
        averageQuizScore: effortScore.averageQuizScore,
        streakScore: effortScore.streakScore
      }
    })
  } catch (error) {
    console.error('Error calculating effort score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}