import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { verifyIdToken } from '@/lib/utils/verifyIdToken'

export async function POST(req: NextRequest) {
  try {
    const { proof, ephemeralAddress, challenge, id_token } = await req.json()
    
    if (!proof || !ephemeralAddress || !challenge || !id_token) {
      return NextResponse.json({ 
        error: 'Missing required fields: proof, ephemeralAddress, challenge, id_token' 
      }, { status: 400 })
    }

    // Validate the challenge exists and hasn't expired
    const challengeRecord = await prisma.authChallenge.findUnique({
      where: { challenge }
    })

    if (!challengeRecord || challengeRecord.expiresAt < new Date()) {
      return NextResponse.json({
        error: 'Challenge invalid or expired'
      }, { status: 400 })
    }

    // Verify the ID token again to get user info
    const payload: any = await verifyIdToken(
      id_token,
      process.env.OIDC_ISSUER!,
      process.env.OIDC_CLIENT_ID!
    )

    const oidcSub = payload.sub

    if (oidcSub !== challengeRecord.oidcSub) {
      return NextResponse.json({
        error: 'Challenge does not match token'
      }, { status: 400 })
    }

    // TODO: In production, verify the zkLogin proof here
    // For now, we'll accept any proof for hackathon demo purposes
    console.log('📍 zkLogin proof verification skipped for demo:', { proof, ephemeralAddress })

    // Clean up the used challenge
    await prisma.authChallenge.delete({
      where: { challenge }
    })

    // Find or create the user using upsert to handle race conditions
    const user = await prisma.user.upsert({
      where: { oidcSub },
      update: {
        primaryWalletAddress: ephemeralAddress,
        lastLogin: new Date(),
        isFirstTime: false
      },
      create: {
        oidcSub,
        email: payload.email,
        displayName: payload.name,
        picture: payload.picture,
        primaryWalletAddress: ephemeralAddress,
        loginType: 'zklogin',
        lastLogin: new Date()
      }
    })
    
    console.log('🎉 zkLogin verification successful, user created/found')

    // Create session token
    console.log('🔑 Creating JWT with secret length:', process.env.JWT_SECRET?.length || 0)
    const sessionToken = jwt.sign(
      { userId: user.id, oidcSub: user.oidcSub },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    console.log('🍪 Session token created, length:', sessionToken.length)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        address: user.primaryWalletAddress,
        email: user.email,
        name: user.displayName,
        picture: user.picture,
        loginType: user.loginType,
        nftPoints: user.nftPoints,
        admin: user.admin,
        isFirstTime: user.isFirstTime,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString()
      }
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    }
    
    console.log('🍪 Setting session cookie with options:', cookieOptions)
    response.cookies.set('session', sessionToken, cookieOptions)

    return response
  } catch (error) {
    console.error('zkLogin verification failed:', error)
    return NextResponse.json({
      error: 'zkLogin verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}