import { saveUserToStorage } from '@/lib/utils/localStorage'

interface UserData {
  address: string
  email?: string
  name?: string
  picture?: string
}

export async function saveUserToDatabase(userData: UserData): Promise<void> {
  try {
    // For hackathon demo - save to localStorage instead of Firebase
    const user = {
      address: userData.address,
      name: userData.name || 'User',
      email: userData.email,
      picture: userData.picture,
      loginType: 'zklogin' as const,
      nftPoints: 0,
      admin: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isFirstTime: true
    }
    
    saveUserToStorage(user)
    
    // Simulate async operation for consistency
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Failed to save user:', error)
    throw new Error('Failed to save user data')
  }
}