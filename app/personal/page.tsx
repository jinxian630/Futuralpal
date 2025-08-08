'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

export default function PersonalPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, forceRefreshSession } = useUser()
  const [redirecting, setRedirecting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log(`🔍 PersonalPage: ${info}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    addDebugInfo(`State check - isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, hasUser: ${!!user}`)
    
    const handleRedirect = async () => {
      if (!isLoading && !redirecting) {
        if (isAuthenticated && user) {
          addDebugInfo(`User authenticated, redirecting to dashboard - Email: ${user.email}`)
          setRedirecting(true)
          
          try {
            await router.push('/personal/dashboard')
            addDebugInfo('Successfully redirected to dashboard')
          } catch (error) {
            addDebugInfo(`Redirect failed: ${error}`)
            setRedirecting(false)
          }
        } else {
          addDebugInfo('User not authenticated, trying session refresh...')
          
          // Try to refresh session one more time before redirecting to login
          try {
            await forceRefreshSession()
            addDebugInfo('Session refresh completed, rechecking authentication')
          } catch (error) {
            addDebugInfo(`Session refresh failed: ${error}`)
            addDebugInfo('Redirecting to login page')
            setRedirecting(true)
            router.push('/')
          }
        }
      }
    }

    // Add a small delay to allow any ongoing processes to complete
    const timer = setTimeout(handleRedirect, 500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, isLoading, router, redirecting, forceRefreshSession])

  const getLoadingMessage = () => {
    if (redirecting) {
      return isAuthenticated && user ? 'Redirecting to dashboard...' : 'Redirecting to login...'
    }
    if (isLoading) {
      return 'Loading user session...'
    }
    return 'Checking authentication...'
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-700 font-medium mb-4">{getLoadingMessage()}</p>
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
            <p className="font-semibold mb-2">Debug Log:</p>
            {debugInfo.slice(-5).map((info, idx) => (
              <p key={idx} className="text-gray-600 mb-1">{info}</p>
            ))}
          </div>
        )}

        {/* Manual navigation buttons for fallback */}
        {!isLoading && !redirecting && (
          <div className="mt-6 space-y-2">
            <button
              onClick={() => router.push('/personal/dashboard')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}