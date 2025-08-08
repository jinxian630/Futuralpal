import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    // Verify the JWT token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as any

    if (!decoded.userId) {
      return NextResponse.json({ user: null })
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
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
    console.error('Session validation failed:', error)
    
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