// localStorage utilities for hackathon demo - browser only
interface UserData {
  address: string
  name: string
  email?: string
  picture?: string
  loginType: 'zklogin' | 'wallet'
  nftPoints: number
  admin: boolean
  createdAt: string
  lastLogin: string
  isFirstTime?: boolean
}

const USERS_STORAGE_KEY = 'futuropal_users'

// Browser check utility
const isBrowser = () => typeof window !== 'undefined'

export function saveUserToStorage(userData: UserData): void {
  if (!isBrowser()) {
    console.warn('saveUserToStorage called on server-side, skipping')
    return
  }

  try {
    const users = getUsersFromStorage()
    users[userData.address] = userData
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Failed to save user to localStorage:', error)
    throw new Error('Failed to save user data')
  }
}

export function getUserFromStorage(address: string): UserData | null {
  if (!isBrowser()) {
    console.warn('getUserFromStorage called on server-side, returning null')
    return null
  }

  try {
    const users = getUsersFromStorage()
    return users[address] || null
  } catch (error) {
    console.error('Failed to get user from localStorage:', error)
    return null
  }
}

export function getUsersFromStorage(): Record<string, UserData> {
  if (!isBrowser()) {
    console.warn('getUsersFromStorage called on server-side, returning empty object')
    return {}
  }

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to parse users from localStorage:', error)
    return {}
  }
}

export function updateUserInStorage(address: string, updates: Partial<UserData>): void {
  if (!isBrowser()) {
    console.warn('updateUserInStorage called on server-side, skipping')
    return
  }

  try {
    const users = getUsersFromStorage()
    if (users[address]) {
      users[address] = { ...users[address], ...updates }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } else {
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Failed to update user in localStorage:', error)
    throw new Error('Failed to update user data')
  }
}

export function clearUsersStorage(): void {
  if (!isBrowser()) {
    console.warn('clearUsersStorage called on server-side, skipping')
    return
  }

  try {
    localStorage.removeItem(USERS_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear users from localStorage:', error)
  }
}