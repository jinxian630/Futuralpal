import { NextRequest, NextResponse } from 'next/server'
import { validateGoogleJwt } from '@/lib/zklogin/validateGoogleJwt'
import { generateZkLoginKeys } from '@/lib/zklogin/generateZkLoginKeys'
import { deriveSuiAddress } from '@/lib/zklogin/deriveSuiAddress'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    const jwtPayload = validateGoogleJwt(idToken)
    const { userSalt, ephemeralPrivateKey, ephemeralPublicKey, nonce } = generateZkLoginKeys()
    const suiAddress = deriveSuiAddress(idToken, userSalt, jwtPayload)

    // Backend only returns data - frontend handles localStorage storage
    return NextResponse.json({
      success: true,
      address: suiAddress,
      userInfo: {
        email: jwtPayload.email,
        name: jwtPayload.name,
        picture: jwtPayload.picture,
      },
      zkLoginData: {
        userSalt,
        ephemeralPrivateKey: process.env.NODE_ENV === 'development' ? ephemeralPrivateKey : 'hidden',
        nonce,
      }
    })
  } catch (error) {
    console.error('💥 zkLogin Error:', error)
    return NextResponse.json({ 
      error: 'zkLogin failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}