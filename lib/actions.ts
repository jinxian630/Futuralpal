import { PrismaClient } from '@prisma/client'
import { callOpenAI } from './openai-config'

const prisma = new PrismaClient()

export async function createRoomInDb(userId?: string, payload?: any) {
  const roomData = {
    name: payload?.name || `Study Room ${new Date().toLocaleDateString()}`,
    description: payload?.description || 'A collaborative study space',
    creatorId: userId || 'anonymous',
    isPrivate: payload?.isPrivate || false,
    maxMembers: payload?.maxMembers || 10
  }

  const room = await prisma.digitalRoom.create({
    data: roomData
  })

  // Add creator as first member
  if (userId) {
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: userId,
        role: 'admin'
      }
    })
  }

  return room
}

export async function findStudyGroups(userId?: string, payload?: any) {
  const rooms = await prisma.digitalRoom.findMany({
    where: {
      isPrivate: false
    },
    include: {
      creator: {
        select: {
          displayName: true,
          email: true
        }
      },
      members: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  return rooms.map(room => ({
    id: room.id,
    name: room.name,
    description: room.description,
    creator: room.creator.displayName || room.creator.email,
    memberCount: room.members.length,
    maxMembers: room.maxMembers,
    createdAt: room.createdAt
  }))
}

export async function getCoursesUnderPoints(userId?: string, points: number = 0) {
  const courses = await prisma.course.findMany({
    where: {
      pricePoints: {
        lte: points
      },
      isActive: true
    },
    orderBy: {
      pricePoints: 'asc'
    },
    take: 10
  })

  return courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    pricePoints: course.pricePoints,
    createdAt: course.createdAt
  }))
}

export async function getPopularCourses() {
  const courses = await prisma.course.findMany({
    where: {
      isActive: true
    },
    include: {
      enrollments: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  return courses
    .map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      pricePoints: course.pricePoints,
      enrollmentCount: course.enrollments.length,
      createdAt: course.createdAt
    }))
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
}

export async function getAssignmentsForUser(userId: string) {
  const assignments = await prisma.assignment.findMany({
    include: {
      course: {
        select: {
          title: true
        }
      },
      homework: {
        where: {
          userId: userId
        },
        select: {
          completed: true,
          score: true,
          submittedAt: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    },
    take: 20
  })

  return assignments.map(assignment => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    maxScore: assignment.maxScore,
    courseName: assignment.course.title,
    homework: assignment.homework[0] || null
  }))
}

export async function getProgressForUser(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: userId
    },
    include: {
      course: {
        select: {
          title: true
        }
      }
    }
  })

  const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0)
  const avgProgress = enrollments.length > 0 ? totalProgress / enrollments.length : 0

  return {
    courses: enrollments.map(enrollment => ({
      courseId: enrollment.courseId,
      courseName: enrollment.course.title,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt
    })),
    totalCourses: enrollments.length,
    averageProgress: Math.round(avgProgress),
    completedCourses: enrollments.filter(e => e.progress >= 100).length
  }
}

export async function getAtRiskStudents(tutorId?: string) {
  const atRiskStudents = await prisma.user.findMany({
    where: {
      role: 'student',
      enrollments: {
        some: {
          progress: {
            lt: 30 // Less than 30% progress
          }
        }
      }
    },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              title: true
            }
          }
        },
        where: {
          progress: {
            lt: 30
          }
        }
      }
    },
    take: 20
  })

  return atRiskStudents.map(student => ({
    id: student.id,
    name: student.displayName || student.email,
    email: student.email,
    courses: student.enrollments.map(enrollment => ({
      courseName: enrollment.course.title,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt
    }))
  }))
}

export async function createAssignment(payload: any) {
  const assignmentData = {
    courseId: payload.courseId,
    title: payload.title || 'New Assignment',
    description: payload.description || '',
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    maxScore: payload.maxScore || 100
  }

  const assignment = await prisma.assignment.create({
    data: assignmentData,
    include: {
      course: {
        select: {
          title: true
        }
      }
    }
  })

  return assignment
}

export async function callAiForTips(actionType: string, context?: any) {
  const prompts = {
    collab_tips: {
      system: 'You are FuturoPal Collaboration Assistant. Give short, actionable steps for students to get started in a digital room.',
      user: 'Show 4 tips and 1 quick checklist to start a study group.'
    },
    study_tips: {
      system: 'You are a study advisor. Provide practical study techniques and motivation.',
      user: 'Give me 3 effective study tips and motivational advice for staying focused.'
    },
    teaching_tips: {
      system: 'You are an educational mentor for tutors. Provide guidance on effective teaching methods.',
      user: 'Share 3 teaching strategies and tips for engaging students in online learning.'
    },
    earn_points: {
      system: 'You are a gamification guide. Explain how students can earn points in the platform.',
      user: 'Explain the top 5 ways students can earn points and progress in their learning journey.'
    }
  }

  const prompt = prompts[actionType as keyof typeof prompts]
  if (!prompt) {
    return 'I can help you with collaboration tips, study advice, and teaching guidance!'
  }

  const messages = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user }
  ]

  return await callOpenAI(messages, 300)
}