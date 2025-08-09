import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const courseCount = await prisma.course.count()
    const roomCount = await prisma.digitalRoom.count()
    
    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        courses: courseCount,
        rooms: roomCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 })
  }
}