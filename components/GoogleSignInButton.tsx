'use client'

import { signIn, useSession, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

interface GoogleSignInButtonProps {
  onSuccess?: (address: string) => void
  onError?: (error: string) => void
  disableAutoRedirect?: boolean // Allow parent to handle redirect
  customRedirectPath?: string // Custom path for redirect
  showLoginButton?: boolean // Show "Login to FuturoPal" button on success
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onSuccess, 
  onError, 
  disableAutoRedirect = false,
  customRedirectPath,
  showLoginButton = false
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [zkLoginStep, setZkLoginStep] = useState<'idle' | 'authenticating' | 'processing' | 'complete' | 'redirecting'>('idle')
  const [successUserData, setSuccessUserData] = useState<{name?: string, email?: string, picture?: string, address?: string} | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { login, forceRefreshSession } = useUser()

  const handleManualLoginToFuturoPal = async () => {
    if (!successUserData?.address) return
    
    setZkLoginStep('redirecting')
    console.log('🚀 Manual login to FuturoPal triggered...')
    
    try {
      const redirectPath = customRedirectPath || '/personal/dashboard'
      await router.push(redirectPath)
      console.log(`✅ Successfully redirected to ${redirectPath}`)
    } catch (error) {
      console.error('❌ Manual redirect failed:', error)
      onError?.('Redirect failed. Please try again.')
      setZkLoginStep('complete')
    }
  }

  // Auto-trigger zkLogin when session becomes available or on mount if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const idToken = (session as any)?.idToken
      
      // If we have a session with idToken but no zkLogin processing has happened yet
      if (idToken && (zkLoginStep === 'idle' || zkLoginStep === 'authenticating')) {
        console.log('🔄 Session found with idToken, starting zkLogin processing...')
        setZkLoginStep('processing')
        setIsLoading(true) // Ensure loading state is set
        processZkLogin()
      }
    }
  }, [status, session, zkLoginStep])

  // Additional effect to handle session changes more reliably
  useEffect(() => {
    if (status === 'authenticated' && session && zkLoginStep === 'authenticating') {
      // Small delay to ensure session is fully established
      const timer = setTimeout(() => {
        const idToken = (session as any)?.idToken
        if (idToken) {
          console.log('🔄 Session established, processing zkLogin...')
          setZkLoginStep('processing')
          setIsLoading(true)
          processZkLogin()
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [status, session])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setZkLoginStep('authenticating')
      console.log('🚀 Starting Google OAuth sign-in process...')
      
      // Trigger Google OAuth sign-in
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/register'
      })

      console.log('🔍 SignIn result:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      })

      if (result?.error) {
        console.error('❌ Google sign-in error:', result.error)
        let errorMessage = 'Failed to sign in with Google'
        
        // Provide specific error messages for common issues
        switch (result.error) {
          case 'OAuthCallback':
            errorMessage = 'OAuth callback error. Please check your Google Console redirect URI configuration.'
            break
          case 'AccessDenied':
            errorMessage = 'Access denied. Please make sure you grant permission to your Google account.'
            break
          case 'Configuration':
            errorMessage = 'OAuth configuration error. Please check your Google Client ID and Secret.'
            break
          default:
            errorMessage = `OAuth Error: ${result.error}`
        }
        
        onError?.(errorMessage)
        setIsLoading(false)
        setZkLoginStep('idle')
        return
      }

      if (!result?.ok) {
        console.error('❌ Sign-in was not successful:', result)
        onError?.('Sign-in was not successful. Please try again.')
        setIsLoading(false)
        setZkLoginStep('idle')
        return
      }

      console.log('✅ Google OAuth successful, waiting for session...')
      // Keep loading state while waiting for session to be established
      // The useEffect hook will trigger zkLogin processing when session is ready

    } catch (error) {
      console.error('💥 Unexpected error during Google sign-in:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      onError?.(`Sign-in failed: ${errorMessage}`)
      setIsLoading(false)
      setZkLoginStep('idle')
    }
  }

  const processZkLogin = async () => {
    try {
      console.log('🔑 Processing zkLogin with JWT token...')
      
      // Use the session from the hook directly
      const idToken = (session as any)?.idToken
      
      console.log('📋 Session data:', {
        hasUser: !!session?.user,
        hasIdToken: !!idToken,
        userEmail: session?.user?.email
      })
      
      if (!idToken) {
        throw new Error('No JWT token available in session. Please try signing in again.')
      }

      // Send JWT to zkLogin API
      const zkResponse = await fetch('/api/zklogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      })

      if (!zkResponse.ok) {
        const errorText = await zkResponse.text()
        throw new Error(`zkLogin API failed: ${zkResponse.status} - ${errorText}`)
      }

      const zkResult = await zkResponse.json()

      console.log('🎯 zkLogin API response:', {
        success: zkResult.success,
        hasAddress: !!zkResult.address,
        error: zkResult.error
      })

      if (!zkResult.success) {
        throw new Error(zkResult.error || 'Failed to process zkLogin')
      }

      console.log('🎉 zkLogin successful! Generated address:', zkResult.address)
      setZkLoginStep('complete')

      // Use user data from backend - NO localStorage operations
      const user = zkResult.user || {
        // Fallback if backend doesn't return user (shouldn't happen)
        address: zkResult.address,
        name: zkResult.userInfo?.name || session?.user?.name || 'User',
        email: zkResult.userInfo?.email || session?.user?.email,
        picture: zkResult.userInfo?.picture || session?.user?.image,
        loginType: 'zklogin' as const,
        nftPoints: 0,
        admin: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isFirstTime: true
      }

      console.log('✅ User data received from backend:', {
        address: user.address,
        email: user.email,
        isFirstTime: user.isFirstTime
      })

      // Store user data for success display
      setSuccessUserData({
        name: user.name,
        email: user.email,
        picture: user.picture,
        address: zkResult.address
      })

      // Login user through context (no localStorage - backend handles persistence)
      login(user)

      // Force refresh session to ensure UserContext is synchronized with backend
      console.log('🔄 Forcing session refresh for synchronization...')
      try {
        await forceRefreshSession()
        console.log('✅ Session synchronization completed')
      } catch (syncError) {
        console.warn('⚠️ Session sync failed, but continuing with login:', syncError)
      }

      // Call success callback with the generated address
      onSuccess?.(zkResult.address)

      // Handle redirect based on props
      if (!disableAutoRedirect) {
        // Show redirecting state
        setZkLoginStep('redirecting')

        // Add delay to ensure UserContext is fully updated before redirect
        console.log('⏳ Waiting for UserContext synchronization...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Use custom redirect path or default to personal area
        const redirectPath = customRedirectPath || '/personal'
        
        try {
          console.log(`🚀 Redirecting to ${redirectPath}...`)
          await router.push(redirectPath)
          console.log(`✅ Successfully redirected to ${redirectPath}`)
        } catch (redirectError) {
          console.error('❌ Redirect failed:', redirectError)
          // Show error and provide manual option
          setZkLoginStep('idle')
          setIsLoading(false)
          onError?.('Login successful but redirect failed. Please navigate manually.')
        }
      } else {
        // If auto redirect is disabled, just complete the login process
        console.log('✅ Login completed successfully, redirect handled by parent')
        console.log('🔍 Success user data set:', successUserData)
        console.log('🔍 Show login button:', showLoginButton)
        setZkLoginStep('complete')
        setIsLoading(false)
      }

    } catch (error) {
      console.error('💥 zkLogin processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process zkLogin'
      onError?.(`zkLogin failed: ${errorMessage}`)
      setIsLoading(false)
      setZkLoginStep('idle')
    }
  }

  if (isLoading) {
    const getLoadingMessage = () => {
      switch (zkLoginStep) {
        case 'authenticating':
          return 'Signing in with Google...'
        case 'processing':
          return 'Generating blockchain identity...'
        case 'complete':
          return 'Success! Setting up account...'
        case 'redirecting':
          return 'Synchronizing session & redirecting...'
        default:
          return 'Processing...'
      }
    }

    return (
      <div className="w-full flex flex-col items-center py-6">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm">{getLoadingMessage()}</p>
        {(zkLoginStep === 'complete' || zkLoginStep === 'redirecting') && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-2">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
        {zkLoginStep === 'redirecting' && (
          <div className="mt-2 text-xs text-blue-600 animate-pulse">
            Taking you to your dashboard...
          </div>
        )}
      </div>
    )
  }

  // Enhanced success UI with "Login to FuturoPal" button
  if (zkLoginStep === 'complete' && showLoginButton && successUserData) {
    return (
      <div className="w-full flex flex-col items-center py-8">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <span className="text-white text-3xl">✓</span>
        </div>

        {/* Success Message */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Successful!</h3>
        <p className="text-lg text-gray-700 mb-4">Welcome to FuturoPal, {successUserData.name?.split(' ')[0] || 'User'}!</p>

        {/* User Info */}
        <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
          {successUserData.picture ? (
            <img 
              src={successUserData.picture} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{successUserData.name?.charAt(0) || 'U'}</span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800">{successUserData.name}</p>
            <p className="text-sm text-gray-600">{successUserData.email}</p>
          </div>
        </div>

        {/* Login to FuturoPal Button */}
        <button
          onClick={handleManualLoginToFuturoPal}
          disabled={zkLoginStep === 'redirecting'}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {zkLoginStep === 'redirecting' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Taking you to FuturoPal...</span>
            </>
          ) : (
            <>
              <span>Login to FuturoPal</span>
              <span className="text-xl">🚀</span>
            </>
          )}
        </button>

        {/* Address Info (for development) */}
        {process.env.NODE_ENV === 'development' && successUserData.address && (
          <p className="text-xs text-gray-500 mt-4">
            Address: {successUserData.address.slice(0, 8)}...{successUserData.address.slice(-8)}
          </p>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Sign in with Google</span>
    </button>
  )
}

export default GoogleSignInButton