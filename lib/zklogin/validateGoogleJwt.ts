import { decodeJwt } from 'jose'

interface GoogleJwtPayload {
  iss: string
  aud: string
  sub: string
  email?: string
  name?: string
  picture?: string
  nonce?: string
}

export function validateGoogleJwt(idToken: string): GoogleJwtPayload {
  const decoded = decodeJwt(idToken) as any

  const requiredFields = ['iss', 'aud', 'sub']
  const missing = requiredFields.filter(f => !decoded[f])
  
  if (missing.length > 0) {
    throw new Error(`Missing fields in JWT: ${missing.join(', ')}`)
  }

  if (!decoded.iss.includes('google') && !decoded.iss.includes('accounts.google.com')) {
    throw new Error(`Invalid issuer: ${decoded.iss}. JWT must be issued by Google`)
  }

  return {
    iss: decoded.iss,
    aud: decoded.aud,
    sub: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    nonce: decoded.nonce
  }
}