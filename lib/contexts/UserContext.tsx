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
  loadUserFromStorage: () => void
} | undefined>(undefined)

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
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
      return { ...state, user: updatedUser }
    case 'LOGOUT':
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
    localStorage.setItem('futuropal_user', JSON.stringify(user))
    localStorage.setItem('futuropal_login_time', Date.now().toString())
  }

  const logout = async () => {
    try {
      // Clear localStorage first
      dispatch({ type: 'LOGOUT' })
      localStorage.removeItem('futuropal_user')
      localStorage.removeItem('futuropal_login_time')
      
      // Call server-side logout endpoint
      try {
        const logoutResponse = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (logoutResponse.ok) {
          console.log('✅ Server-side logout successful')
        } else {
          console.warn('⚠️  Server-side logout failed, but continuing with client-side cleanup')
        }
      } catch (serverError) {
        console.warn('⚠️  Server-side logout request failed:', serverError)
      }
      
      // Clear NextAuth session
      await signOut({ redirect: false })
      console.log('✅ Successfully signed out from NextAuth')
    } catch (error) {
      console.error('❌ Error during logout:', error)
      // Even if signOut fails, we still want to clear local state
      dispatch({ type: 'LOGOUT' })
      localStorage.removeItem('futuropal_user')
      localStorage.removeItem('futuropal_login_time')
    }
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    if (state.user) {
      const updatedUser = { ...state.user, ...updates }
      localStorage.setItem('futuropal_user', JSON.stringify(updatedUser))
      
      // Also update the localStorage database for consistency
      try {
        const usersData = localStorage.getItem('futuropal_users')
        if (usersData) {
          const users = JSON.parse(usersData)
          if (users[state.user.address]) {
            users[state.user.address] = updatedUser
            localStorage.setItem('futuropal_users', JSON.stringify(users))
          }
        }
      } catch (error) {
        console.error('Failed to sync with users storage:', error)
      }
    }
  }

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('futuropal_user')
      const loginTime = localStorage.getItem('futuropal_login_time')
      
      if (storedUser && loginTime) {
        const user = JSON.parse(storedUser) as User
        const loginTimestamp = parseInt(loginTime)
        const now = Date.now()
        const sessionDuration = now - loginTimestamp
        const maxSessionDuration = 7 * 24 * 60 * 60 * 1000 // 7 days
        
        if (sessionDuration < maxSessionDuration) {
          dispatch({ type: 'SET_USER', payload: user })
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      logout()
    }
  }

  useEffect(() => {
    loadUserFromStorage()
  }, [])

  const value = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    loadUserFromStorage
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