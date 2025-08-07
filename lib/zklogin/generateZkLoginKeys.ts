import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { generateRandomness, generateNonce } from '@mysten/sui/zklogin'

interface ZkLoginKeys {
  userSalt: string
  ephemeralPrivateKey: string
  ephemeralPublicKey: any
  nonce: string
}

export function generateZkLoginKeys(): ZkLoginKeys {
  const userSalt = generateRandomness()
  const ephemeralKeyPair = new Ed25519Keypair()
  const ephemeralPrivateKey = ephemeralKeyPair.export().privateKey
  const ephemeralPublicKey = ephemeralKeyPair.getPublicKey()
  
  if (!ephemeralPublicKey || typeof (ephemeralPublicKey as any).toSuiBytes !== 'function') {
    throw new Error('ephemeralPublicKey.toSuiBytes is not a function - invalid public key object')
  }
  
  const maxEpoch = 10
  const randomness = generateRandomness()
  const nonce = generateNonce(ephemeralPublicKey as any, maxEpoch, randomness)

  return {
    userSalt: typeof userSalt === 'string' ? userSalt : String(userSalt),
    ephemeralPrivateKey: typeof ephemeralPrivateKey === 'string' ? ephemeralPrivateKey : String(ephemeralPrivateKey),
    ephemeralPublicKey,
    nonce
  }
}