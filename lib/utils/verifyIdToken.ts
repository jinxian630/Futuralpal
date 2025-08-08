import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function verifyIdToken(idToken: string, issuer: string, audience: string) {
  // Google uses a non-standard JWKS endpoint
  const jwksUrl = issuer === 'https://accounts.google.com' 
    ? 'https://www.googleapis.com/oauth2/v3/certs'
    : `${issuer}/.well-known/jwks.json`
  
  try {
    console.log(`🔍 Attempting to fetch JWKS from: ${jwksUrl}`)
    
    // Test JWKS endpoint accessibility
    const response = await fetch(jwksUrl)
    if (!response.ok) {
      throw new Error(`JWKS endpoint returned ${response.status}: ${response.statusText}`)
    }
    
    const jwks = createRemoteJWKSet(new URL(jwksUrl), {
      timeoutDuration: 10000, // 10 seconds timeout
      cooldownDuration: 30000, // 30 seconds cooldown
      cacheMaxAge: 600000 // 10 minutes cache
    })
    
    const { payload } = await jwtVerify(idToken, jwks, { 
      issuer, 
      audience: [audience]
    })
    
    console.log('✅ JWT verification successful')
    return payload
  } catch (error) {
    console.error('❌ JWT verification failed:', {
      error: error instanceof Error ? error.message : error,
      jwksUrl,
      issuer,
      audience
    })
    
    if (error instanceof Error && error.message.includes('JWKS')) {
      throw new Error(`JWKS endpoint error: ${error.message}`)
    }
    
    throw new Error('Invalid ID token')
  }
}