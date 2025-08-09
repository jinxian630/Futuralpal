import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Assignment, CreateAssignmentRequest, AssignmentWithStatus } from '@/types/api'

const prisma = new PrismaClient() as any // Temporary fix for type issues

// GET /api/assignments - Get assignments for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId') // Optional: to include homework status

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: true,
        homework: userId ? {
          where: { userId }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to include homework status if userId provided
    const assignmentsWithStatus: AssignmentWithStatus[] = assignments.map((assignment: any) => ({
      ...assignment,
      homeworkStatus: userId && assignment.homework ? {
        completed: assignment.homework[0]?.completed || false,
        score: assignment.homework[0]?.score || null,
        submittedAt: assignment.homework[0]?.submittedAt || null
      } : null
    }))

    return NextResponse.json(assignmentsWithStatus)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/assignments - Create new assignment (for tutors)
export async function POST(request: NextRequest) {
  try {
    const { courseId, title, description, dueDate, maxScore = 100 }: CreateAssignmentRequest = await request.json()

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'courseId and title are required' },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore
      },
      include: {
        course: true
      }
    })

    // Create homework records for all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId }
    })

    if (enrollments.length > 0) {
      await prisma.homework.createMany({
        data: enrollments.map((enrollment: any) => ({
          assignmentId: assignment.id,
          userId: enrollment.userId,
          completed: false
        }))
      })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/assignments - Update assignment
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, dueDate, maxScore } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Assignment id is required' }, { status: 400 })
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxScore !== undefined && { maxScore })
      },
      include: {
        course: true
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/assignments - Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assignment id is required' }, { status: 400 })
    }

    // Delete assignment (cascade will delete related homework)
    await prisma.assignment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}