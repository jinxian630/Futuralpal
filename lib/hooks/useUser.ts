'use client'

import { useCallback } from 'react'
import { useUserContext, User } from '../contexts/UserContext'

export function useUser() {
  const { state, login, logout, updateUser, loadUserFromStorage } = useUserContext()

  const fetchUserData = useCallback(async (address: string) => {
    try {
      // For hackathon demo - use localStorage instead of API
      if (typeof window !== 'undefined') {
        const { getUserFromStorage } = await import('../utils/localStorage')
        const user = getUserFromStorage(address)
        
        if (!user) {
          throw new Error('User not found')
        }
        
        return user as User
      } else {
        throw new Error('localStorage not available on server side')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  }, [])

  const loginWithAddress = useCallback(async (address: string) => {
    try {
      const userData = await fetchUserData(address)
      login(userData)
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [fetchUserData, login])

  const refreshUserData = useCallback(async () => {
    if (!state.user?.address) {
      throw new Error('No user address available')
    }

    try {
      const userData = await fetchUserData(state.user.address)
      updateUser(userData)
      
      // Also update localStorage with latest data
      if (typeof window !== 'undefined') {
        const { updateUserInStorage } = await import('../utils/localStorage')
        updateUserInStorage(state.user.address, userData)
      }
      
      return userData
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }, [state.user?.address, fetchUserData, updateUser])

  const incrementNftPoints = useCallback((points: number = 1) => {
    if (state.user) {
      updateUser({ nftPoints: state.user.nftPoints + points })
    }
  }, [state.user, updateUser])

  return {
    // State
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,

    // Actions
    login,
    logout,
    updateUser,
    loginWithAddress,
    fetchUserData,
    refreshUserData,
    loadUserFromStorage,
    incrementNftPoints,

    // Computed values
    isFirstTimeUser: state.user?.isFirstTime ?? false,
    hasProfilePicture: !!state.user?.picture,
    isZkLoginUser: state.user?.loginType === 'zklogin',
    formattedAddress: state.user?.address 
      ? `${state.user.address.slice(0, 6)}...${state.user.address.slice(-4)}`
      : null
  }
}