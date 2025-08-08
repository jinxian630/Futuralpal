import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...')
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}`)
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        primaryWalletAddress: true,
        loginType: true,
        createdAt: true,
        lastLogin: true
      }
    })
    
    console.log('👥 Recent users:', recentUsers)
    
    // Test auth challenges
    const challengeCount = await prisma.authChallenge.count()
    console.log(`🔑 Auth challenges in database: ${challengeCount}`)
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        challengeCount,
        recentUsers
      }
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}