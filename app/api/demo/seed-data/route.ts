import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any // Temporary fix for type issues

export async function POST(request: NextRequest) {
  try {
    console.log('Starting demo data seeding...')
    
    // Create a demo course
    const course = await prisma.course.upsert({
      where: { id: 'demo-course-1' },
      update: {},
      create: {
        id: 'demo-course-1',
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
        pricePoints: 50,
        isActive: true
      }
    })
    console.log('Created demo course:', course.title)

    // Create some assignments for the course
    const assignments = await Promise.all([
      prisma.assignment.upsert({
        where: { id: 'assignment-1' },
        update: {},
        create: {
          id: 'assignment-1',
          courseId: course.id,
          title: 'HTML Basics Quiz',
          description: 'Complete the HTML fundamentals quiz',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxScore: 100
        }
      }),
      prisma.assignment.upsert({
        where: { id: 'assignment-2' },
        update: {},
        create: {
          id: 'assignment-2',
          courseId: course.id,
          title: 'CSS Styling Project',
          description: 'Create a styled webpage using CSS',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          maxScore: 100
        }
      }),
      prisma.assignment.upsert({
        where: { id: 'assignment-3' },
        update: {},
        create: {
          id: 'assignment-3',
          courseId: course.id,
          title: 'JavaScript Functions Exercise',
          description: 'Write JavaScript functions to solve programming challenges',
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          maxScore: 100
        }
      })
    ])
    console.log('Created assignments:', assignments.length)

    // Get the first user to enroll in demo course
    const firstUser = await prisma.user.findFirst()
    
    if (firstUser) {
      // Enroll user in demo course
      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: firstUser.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          userId: firstUser.id,
          courseId: course.id,
          progress: 25
        }
      })
      console.log('Enrolled user in demo course')

      // Create homework records with varied completion status
      await prisma.homework.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: assignments[0].id,
            userId: firstUser.id
          }
        },
        update: {},
        create: {
          assignmentId: assignments[0].id,
          userId: firstUser.id,
          completed: true,
          score: 85,
          content: 'Completed HTML basics quiz',
          submittedAt: new Date()
        }
      })

      await prisma.homework.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: assignments[1].id,
            userId: firstUser.id
          }
        },
        update: {},
        create: {
          assignmentId: assignments[1].id,
          userId: firstUser.id,
          completed: false,
          score: null,
          content: null,
          submittedAt: null
        }
      })

      await prisma.homework.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: assignments[2].id,
            userId: firstUser.id
          }
        },
        update: {},
        create: {
          assignmentId: assignments[2].id,
          userId: firstUser.id,
          completed: false,
          score: null,
          content: null,
          submittedAt: null
        }
      })

      console.log('Created homework records')
    }

    // Create a second demo user if needed
    const secondUser = await prisma.user.upsert({
      where: { oidcSub: 'demo-student-2' },
      update: {},
      create: {
        oidcSub: 'demo-student-2',
        email: 'demo.student2@example.com',
        displayName: 'Demo Student 2',
        role: 'student',
        nftPoints: 150,
        isFirstTime: false
      }
    })

    // Enroll second user with poor performance to show at-risk status
    if (secondUser) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: secondUser.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          userId: secondUser.id,
          courseId: course.id,
          progress: 5
        }
      })

      // Create homework with poor completion
      await prisma.homework.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: assignments[0].id,
            userId: secondUser.id
          }
        },
        update: {},
        create: {
          assignmentId: assignments[0].id,
          userId: secondUser.id,
          completed: false,
          score: null,
          content: null,
          submittedAt: null
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo data seeded successfully',
      data: {
        course: course.title,
        assignments: assignments.length,
        enrollments: firstUser ? 2 : 0
      }
    })
  } catch (error) {
    console.error('Error seeding demo data:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed demo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}