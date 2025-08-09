import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { updateBotEffortState, getStudentHomeworkData, computeEffortScore } from '@/lib/effort-calculator'

const prisma = new PrismaClient() as any // Temporary fix for type issues

// GET /api/homework - Get homework for a user/course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const assignmentId = searchParams.get('assignmentId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (assignmentId) {
      // Get specific homework
      const homework = await prisma.homework.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId,
            userId
          }
        },
        include: {
          assignment: {
            include: {
              course: true
            }
          }
        }
      })

      return NextResponse.json(homework)
    }

    if (courseId) {
      // Get all homework for a course
      const homework = await prisma.homework.findMany({
        where: {
          userId,
          assignment: {
            courseId
          }
        },
        include: {
          assignment: {
            include: {
              course: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(homework)
    }

    // Get all homework for user
    const homework = await prisma.homework.findMany({
      where: { userId },
      include: {
        assignment: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/homework - Create or submit homework
export async function POST(request: NextRequest) {
  try {
    const { assignmentId, userId, content, completed = false } = await request.json()

    if (!assignmentId || !userId) {
      return NextResponse.json(
        { error: 'assignmentId and userId are required' },
        { status: 400 }
      )
    }

    // Get the assignment to verify it exists and get courseId
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: assignment.courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User not enrolled in this course' },
        { status: 403 }
      )
    }

    // Create or update homework
    const homework = await prisma.homework.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId
        }
      },
      update: {
        content,
        completed,
        submittedAt: completed ? new Date() : null
      },
      create: {
        assignmentId,
        userId,
        content,
        completed,
        submittedAt: completed ? new Date() : null
      },
      include: {
        assignment: {
          include: {
            course: true
          }
        }
      }
    })

    // Recalculate effort score for this course
    if (completed) {
      const homeworkData = await getStudentHomeworkData(userId, assignment.courseId)
      const effortScore = computeEffortScore(homeworkData)
      await updateBotEffortState(userId, assignment.courseId, effortScore)
    }

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Error creating homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/homework - Update homework score (for tutors)
export async function PUT(request: NextRequest) {
  try {
    const { assignmentId, userId, score } = await request.json()

    if (!assignmentId || !userId || score === undefined) {
      return NextResponse.json(
        { error: 'assignmentId, userId, and score are required' },
        { status: 400 }
      )
    }

    // Get the assignment to get courseId
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Update homework with score
    const homework = await prisma.homework.update({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId
        }
      },
      data: {
        score: Math.max(0, Math.min(100, score)) // Clamp score between 0-100
      },
      include: {
        assignment: {
          include: {
            course: true
          }
        }
      }
    })

    // Recalculate effort score for this course
    const homeworkData = await getStudentHomeworkData(userId, assignment.courseId)
    const effortScore = computeEffortScore(homeworkData)
    await updateBotEffortState(userId, assignment.courseId, effortScore)

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Error updating homework score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/homework - Delete homework
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const userId = searchParams.get('userId')

    if (!assignmentId || !userId) {
      return NextResponse.json(
        { error: 'assignmentId and userId are required' },
        { status: 400 }
      )
    }

    // Get the assignment to get courseId for effort score update
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Delete homework
    await prisma.homework.delete({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId
        }
      }
    })

    // Recalculate effort score for this course
    const homeworkData = await getStudentHomeworkData(userId, assignment.courseId)
    const effortScore = computeEffortScore(homeworkData)
    await updateBotEffortState(userId, assignment.courseId, effortScore)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}