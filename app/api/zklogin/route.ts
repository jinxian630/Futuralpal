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

    console.log('🔑 Starting zkLogin flow with backend integration...')

    // Step 1: Get challenge from backend by verifying OIDC token
    const oidcResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/oidc-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken })
    })

    if (!oidcResponse.ok) {
      const errorText = await oidcResponse.text()
      throw new Error(`OIDC verification failed: ${oidcResponse.status} - ${errorText}`)
    }

    const oidcResult = await oidcResponse.json()
    console.log('✅ OIDC verification successful, challenge received')

    // Step 2: Generate zkLogin proof using the challenge
    const jwtPayload = validateGoogleJwt(idToken)
    const { userSalt, ephemeralPrivateKey, ephemeralPublicKey, nonce } = generateZkLoginKeys()
    const suiAddress = deriveSuiAddress(idToken, userSalt, jwtPayload)

    // For demo purposes, create a mock proof - in production, use actual zkLogin proof generation
    const mockProof = {
      pi_a: ["0x123...", "0x456..."],
      pi_b: [["0x789...", "0xabc..."], ["0xdef...", "0x012..."]],
      pi_c: ["0x345...", "0x678..."]
    }

    console.log('🔧 Generated zkLogin keys and proof (demo)')

    // Step 3: Submit proof to backend for verification and user creation
    const zkVerifyResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/zklogin-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof: mockProof,
        ephemeralAddress: suiAddress,
        challenge: oidcResult.challenge,
        id_token: idToken
      })
    })

    if (!zkVerifyResponse.ok) {
      const errorText = await zkVerifyResponse.text()
      throw new Error(`zkLogin verification failed: ${zkVerifyResponse.status} - ${errorText}`)
    }

    const zkVerifyResult = await zkVerifyResponse.json()
    console.log('🎉 zkLogin verification successful, user created/found')

    // Return user data - NO localStorage operations
    return NextResponse.json({
      success: true,
      address: suiAddress,
      user: zkVerifyResult.user,
      needBindWallet: zkVerifyResult.needBindWallet || false,
      userInfo: {
        email: jwtPayload.email,
        name: jwtPayload.name,
        picture: jwtPayload.picture,
      },
      // Keep zkLogin data for frontend compatibility (development only)
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