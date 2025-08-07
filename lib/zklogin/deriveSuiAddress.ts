import { genAddressSeed, jwtToAddress } from '@mysten/sui/zklogin'

interface GoogleJwtPayload {
  iss: string
  aud: string
  sub: string
  email?: string
  name?: string
  picture?: string
  nonce?: string
}

export function deriveSuiAddress(idToken: string, userSalt: string, jwtPayload: GoogleJwtPayload): string {
  if (!jwtPayload.sub) {
    throw new Error('JWT missing required "sub" claim')
  }

  const saltForAddressSeed = userSalt
  
  const addressSeed = genAddressSeed(saltForAddressSeed, 'sub', jwtPayload.sub, jwtPayload.aud)
  
  const suiAddress = jwtToAddress(idToken, userSalt)
  
  return suiAddress
}