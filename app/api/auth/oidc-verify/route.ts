import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { verifyIdToken } from '@/lib/utils/verifyIdToken'

export async function POST(req: NextRequest) {
  try {
    const { id_token } = await req.json()
    
    if (!id_token) {
      return NextResponse.json({ error: 'Missing id_token' }, { status: 400 })
    }

    // Verify the Google ID token
    const payload: any = await verifyIdToken(
      id_token, 
      process.env.OIDC_ISSUER!, 
      process.env.OIDC_CLIENT_ID!
    )

    const oidcSub = payload.sub
    
    if (!oidcSub) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    // Generate a random challenge for zkLogin proof
    const challenge = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Clean up expired challenges for this user
    await prisma.authChallenge.deleteMany({
      where: {
        oidcSub,
        expiresAt: { lt: new Date() }
      }
    })

    // Store the challenge in database
    await prisma.authChallenge.create({
      data: {
        oidcSub,
        challenge,
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      challenge,
      expiresAt: expiresAt.toISOString(),
      userInfo: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    })
  } catch (error) {
    console.error('OIDC verification failed:', error)
    return NextResponse.json({
      error: 'OIDC verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}