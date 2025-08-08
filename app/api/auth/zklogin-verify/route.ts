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

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { oidcSub }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          oidcSub,
          email: payload.email,
          displayName: payload.name,
          picture: payload.picture,
          primaryWalletAddress: ephemeralAddress, // Store the wallet address
          loginType: 'zklogin',
          lastLogin: new Date()
        }
      })
      
      console.log('🆕 Created new user with ephemeral address:', {
        userId: user.id,
        email: user.email,
        address: ephemeralAddress,
        storedAddress: user.primaryWalletAddress
      })

      // Create session token for new user too
      const sessionToken = jwt.sign(
        { userId: user.id, oidcSub: user.oidcSub },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      const response = NextResponse.json({
        success: true,
        needBindWallet: false, // Already bound during creation
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

      response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response
    } else {
      // Update existing user with new ephemeral address
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          primaryWalletAddress: ephemeralAddress, // Update with new ephemeral address
          lastLogin: new Date(),
          isFirstTime: false
        }
      })
      
      console.log('🔄 Updated existing user with new ephemeral address:', {
        userId: user.id,
        email: user.email,
        newAddress: ephemeralAddress,
        oldAddress: user.primaryWalletAddress // This will show the old address before update
      })

      // Create session token
      const sessionToken = jwt.sign(
        { userId: user.id, oidcSub: user.oidcSub },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      // Set HttpOnly cookie
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
          isFirstTime: false,
          createdAt: user.createdAt.toISOString(),
          lastLogin: user.lastLogin?.toISOString()
        }
      })

      response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response
    }
  } catch (error) {
    console.error('zkLogin verification failed:', error)
    return NextResponse.json({
      error: 'zkLogin verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}