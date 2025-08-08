'use client'

import { useCallback } from 'react'
import { useUserContext, User } from '../contexts/UserContext'

export function useUser() {
  const { state, login, logout, updateUser, loadUserFromSession, forceRefreshSession } = useUserContext()

  const fetchUserData = useCallback(async (address?: string) => {
    try {
      // Fetch current user from backend session
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data from backend')
      }

      const result = await response.json()
      if (!result.user) {
        throw new Error('No user session found')
      }

      return result.user as User
    } catch (error) {
      console.error('Error fetching user data from backend:', error)
      throw error
    }
  }, [])

  const loginWithAddress = useCallback(async (address?: string) => {
    try {
      const userData = await fetchUserData()
      login(userData)
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [fetchUserData, login])

  const refreshUserData = useCallback(async () => {
    try {
      const userData = await fetchUserData()
      updateUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      throw error
    }
  }, [fetchUserData, updateUser])

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
    loadUserFromSession,
    forceRefreshSession,
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