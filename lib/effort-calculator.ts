import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any // Temporary fix for type issues

export interface EffortScore {
  score: number // 0-100
  completionRate: number
  averageQuizScore: number
  streakScore: number
  emoji: string
  status: 'excellent' | 'good' | 'neutral' | 'concerned' | 'at-risk'
}

export interface StudentHomeworkData {
  totalHomework: number
  completedHomework: number
  averageScore: number
  streakDays: number
}

/**
 * Calculate effort score based on homework completion, quiz scores, and streak
 * Formula: effort = 0.5 * completionRate + 0.3 * averageQuizScore + 0.2 * streakScore
 */
export function computeEffortScore(data: StudentHomeworkData): EffortScore {
  const { totalHomework, completedHomework, averageScore, streakDays } = data
  
  // Calculate completion rate (0-100)
  const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0
  
  // Normalize average score (should already be 0-100)
  const averageQuizScore = averageScore || 0
  
  // Calculate streak score (normalize to 0-100, max streak of 7 days = 100%)
  const streakScore = Math.min(streakDays, 7) / 7 * 100
  
  // Apply weighted formula
  const effort = Math.round(
    0.5 * completionRate + 
    0.3 * averageQuizScore + 
    0.2 * streakScore
  )
  
  return {
    score: Math.max(0, Math.min(100, effort)),
    completionRate,
    averageQuizScore,
    streakScore,
    emoji: getEmojiForEffort(effort),
    status: getStatusForEffort(effort)
  }
}

/**
 * Map effort score to emoji state
 */
export function getEmojiForEffort(effort: number): string {
  if (effort >= 80) return '😄' // very happy
  if (effort >= 60) return '🙂' // happy  
  if (effort >= 40) return '😐' // neutral
  if (effort >= 20) return '😟' // concerned
  return '😡' // angry - needs intervention
}

/**
 * Map effort score to status category
 */
export function getStatusForEffort(effort: number): 'excellent' | 'good' | 'neutral' | 'concerned' | 'at-risk' {
  if (effort >= 80) return 'excellent'
  if (effort >= 60) return 'good'
  if (effort >= 40) return 'neutral'
  if (effort >= 20) return 'concerned'
  return 'at-risk'
}

/**
 * Get homework data for a specific user and course
 */
export async function getStudentHomeworkData(userId: string, courseId: string): Promise<StudentHomeworkData> {
  // Get all assignments for this course
  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    include: {
      homework: {
        where: { userId }
      }
    }
  })
  
  const totalHomework = assignments.length
  const completedHomework = assignments.filter(a => 
    a.homework.length > 0 && a.homework[0].completed
  ).length
  
  // Calculate average score from completed homework
  const completedScores = assignments
    .filter(a => a.homework.length > 0 && a.homework[0].score !== null)
    .map(a => a.homework[0].score!)
  
  const averageScore = completedScores.length > 0 
    ? completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length
    : 0
  
  // Calculate streak (simplified - days with activity)
  // In a real implementation, you'd track daily login/activity
  const recentActivity = await prisma.homework.findMany({
    where: {
      userId,
      submittedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
  
  const streakDays = Math.min(recentActivity.length, 7) // Simplified streak calculation
  
  return {
    totalHomework,
    completedHomework,
    averageScore,
    streakDays
  }
}

/**
 * Update bot state with new effort score and emoji
 */
export async function updateBotEffortState(userId: string, courseId: string, effortScore: EffortScore) {
  const moduleId = `course:${courseId}`
  
  const existingState = await prisma.botState.findUnique({
    where: {
      userId_module: {
        userId,
        module: moduleId
      }
    }
  })
  
  const currentState = existingState ? JSON.parse(existingState.stateJson) : {}
  
  const updatedState = {
    ...currentState,
    effort: effortScore.score,
    emoji: effortScore.emoji,
    status: effortScore.status,
    lastCalculated: new Date().toISOString(),
    needsReminder: effortScore.status === 'at-risk' || effortScore.status === 'concerned'
  }
  
  await prisma.botState.upsert({
    where: {
      userId_module: {
        userId,
        module: moduleId
      }
    },
    update: {
      stateJson: JSON.stringify(updatedState)
    },
    create: {
      userId,
      module: moduleId,
      stateJson: JSON.stringify(updatedState)
    }
  })
  
  return updatedState
}

/**
 * Get students at risk across all courses (for tutor dashboard)
 */
export async function getStudentsAtRisk(tutorId?: string): Promise<Array<{
  userId: string
  userName: string
  courseId: string
  courseName: string
  effortScore: number
  status: string
  emoji: string
}>> {
  const botStates = await prisma.botState.findMany({
    where: {
      module: {
        startsWith: 'course:'
      }
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
    }
  })
  
  const studentsAtRisk = []
  
  for (const botState of botStates) {
    const state = JSON.parse(botState.stateJson)
    
    if (state.status === 'at-risk' || state.status === 'concerned') {
      const courseId = botState.module.replace('course:', '')
      
      // Get course info
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })
      
      if (course && (!tutorId || course.tutorId === tutorId)) {
        studentsAtRisk.push({
          userId: botState.userId,
          userName: botState.user.displayName || botState.user.email || 'Unknown',
          courseId: course.id,
          courseName: course.title,
          effortScore: state.effort || 0,
          status: state.status || 'unknown',
          emoji: state.emoji || '😐'
        })
      }
    }
  }
  
  return studentsAtRisk.sort((a, b) => a.effortScore - b.effortScore)
}

/**
 * Compute and update effort scores for all enrolled students in a course
 */
export async function updateAllStudentEffortScores(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { user: true }
  })
  
  const results = []
  
  for (const enrollment of enrollments) {
    const homeworkData = await getStudentHomeworkData(enrollment.userId, courseId)
    const effortScore = computeEffortScore(homeworkData)
    await updateBotEffortState(enrollment.userId, courseId, effortScore)
    
    results.push({
      userId: enrollment.userId,
      userName: enrollment.user.displayName || enrollment.user.email,
      effortScore
    })
  }
  
  return results
}