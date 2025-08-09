import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Session validation: Starting...')
    const sessionToken = req.cookies.get('session')?.value

    console.log('🍪 Session cookie present:', !!sessionToken)
    if (sessionToken) {
      console.log('🍪 Cookie length:', sessionToken.length)
    }

    if (!sessionToken) {
      console.log('❌ No session token found in cookies')
      return NextResponse.json({ user: null })
    }

    console.log('🔑 Verifying JWT token...')
    console.log('🔑 Using JWT secret length:', process.env.JWT_SECRET?.length || 0)
    // Verify the JWT token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as any
    console.log('✅ JWT decoded successfully:', {
      userId: decoded.userId,
      oidcSub: decoded.oidcSub,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry'
    })

    if (!decoded.userId) {
      console.log('❌ No userId in decoded token')
      return NextResponse.json({ user: null })
    }

    // Fetch user from database
    console.log('🗄️ Fetching user from database with ID:', decoded.userId)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      console.log('❌ User not found in database for ID:', decoded.userId)
      // Clear invalid session
      const response = NextResponse.json({ user: null })
      response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      return response
    }

    console.log('✅ User found in database:', {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      address: user.primaryWalletAddress,
      loginType: user.loginType
    })

    return NextResponse.json({
      user: {
        id: user.id,
        address: user.primaryWalletAddress,
        email: user.email,
        name: user.displayName,
        picture: user.picture,
        loginType: user.loginType as 'zklogin' | 'wallet',
        nftPoints: user.nftPoints,
        admin: user.admin,
        isFirstTime: user.isFirstTime,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString()
      }
    })
  } catch (error) {
    console.error('💥 Session validation failed:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('🔑 JWT Error type:', error.name)
      console.error('🔑 JWT Error message:', error.message)
    }
    
    // Clear invalid session cookie
    const response = NextResponse.json({ user: null })
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return response
  }
}

export async function DELETE(req: NextRequest) {
  // Logout - clear the session cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  return response
}