'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { signOut } from 'next-auth/react'

export interface User {
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

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false
}

const UserContext = createContext<{
  state: UserState
  dispatch: React.Dispatch<UserAction>
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  loadUserFromSession: () => void
  forceRefreshSession: () => void
} | undefined>(undefined)

function userReducer(state: UserState, action: UserAction): UserState {
  console.log('🔄 UserContext: Reducer action', {
    type: action.type,
    payload: action.type === 'SET_USER' ? {
      email: (action as any).payload?.email,
      name: (action as any).payload?.name,
      address: (action as any).payload?.address
    } : action.type === 'SET_LOADING' ? action.payload : 'N/A',
    currentState: {
      hasUser: !!state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading
    }
  })

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      console.log('✅ UserContext: Setting user data', {
        email: action.payload.email,
        name: action.payload.name,
        address: action.payload.address,
        loginType: action.payload.loginType
      })
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      console.log('❌ UserContext: Setting error', action.payload)
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'UPDATE_USER':
      if (!state.user) return state
      const updatedUser = { ...state.user, ...action.payload }
      console.log('🔄 UserContext: Updating user', action.payload)
      return { ...state, user: updatedUser }
    case 'LOGOUT':
      console.log('👋 UserContext: Logging out user')
      return {
        ...initialState,
        isLoading: false
      }
    default:
      return state
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState)

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
    // Backend session is already established via HttpOnly cookie
    // No localStorage operations needed
  }

  const logout = async () => {
    try {
      // Clear client state first
      dispatch({ type: 'LOGOUT' })
      
      // Call backend logout to clear HttpOnly session cookie
      try {
        const logoutResponse = await fetch('/api/auth/me', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (logoutResponse.ok) {
          console.log('✅ Backend session cleared successfully')
        } else {
          console.warn('⚠️ Backend logout failed, but continuing with client-side cleanup')
        }
      } catch (serverError) {
        console.warn('⚠️ Backend logout request failed:', serverError)
      }
      
      // Clear NextAuth session
      await signOut({ redirect: false })
      console.log('✅ Successfully signed out from NextAuth')
    } catch (error) {
      console.error('❌ Error during logout:', error)
      // Even if signOut fails, we still want to clear local state
      dispatch({ type: 'LOGOUT' })
    }
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    // User updates are now handled by backend APIs
    // This just updates the client state - backend sync happens via specific API calls
  }

  const loadUserFromSession = async (retryCount = 0) => {
    const maxRetries = 3
    
    try {
      console.log(`🔄 Loading user session... (attempt ${retryCount + 1}/${maxRetries + 1})`)
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check for existing session via backend API
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      console.log(`📡 Session API response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const result = await response.json()
        console.log('📦 Session API result:', {
          hasUser: !!result.user,
          userEmail: result.user?.email,
          userAddress: result.user?.address,
          loginType: result.user?.loginType
        })

        if (result.user) {
          console.log('✅ Session restored from backend:', {
            email: result.user.email,
            name: result.user.name,
            address: result.user.address,
            loginType: result.user.loginType
          })
          dispatch({ type: 'SET_USER', payload: result.user })
        } else {
          console.log('📋 No active session found in response')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        console.warn(`⚠️ Session check failed: ${response.status} ${response.statusText}`)
        
        // Retry logic for temporary network issues
        if (retryCount < maxRetries && (response.status >= 500 || response.status === 0)) {
          console.log(`🔄 Retrying session load in 1 second...`)
          setTimeout(() => loadUserFromSession(retryCount + 1), 1000)
          return
        }
        
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('❌ Failed to load user from session:', {
        error: error instanceof Error ? error.message : error,
        retry: retryCount,
        maxRetries
      })
      
      // Retry logic for network errors
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying session load due to error in 1 second...`)
        setTimeout(() => loadUserFromSession(retryCount + 1), 1000)
        return
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  useEffect(() => {
    loadUserFromSession()
  }, [])

  const forceRefreshSession = async () => {
    console.log('🔄 Force refreshing user session...')
    await loadUserFromSession()
  }

  const value = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    loadUserFromSession,
    forceRefreshSession
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}