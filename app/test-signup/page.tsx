'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function TestSignupPage() {
  const [signupComplete, setSignupComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSuccess = (address: string) => {
    console.log('🎉 Test signup successful:', address)
    setSignupComplete(true)
    setErrorMessage(null)
    
    // Redirect after 2 seconds to show success state
    setTimeout(() => {
      router.push('/personal/dashboard')
    }, 2000)
  }

  const handleError = (error: string) => {
    console.error('❌ Test signup failed:', error)
    setErrorMessage(error)
    setSignupComplete(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Test Signup Flow</h1>
        
        {signupComplete ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Signup Successful!</h2>
            <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Test Login to FuturoPal Button</h2>
              <GoogleSignInButton
                onSuccess={handleSuccess}
                onError={handleError}
                disableAutoRedirect={true}
                showLoginButton={true}
              />
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Test Default Auto-Redirect</h2>
              <GoogleSignInButton
                customRedirectPath="/personal/dashboard"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Test Manual Redirect Only</h2>
              <GoogleSignInButton
                onSuccess={handleSuccess}
                onError={handleError}
                disableAutoRedirect={true}
                showLoginButton={false}
              />
            </div>
          </>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        <button
          onClick={() => router.push('/register')}
          className="w-full mt-6 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
        >
          Back to Register
        </button>
      </div>
    </div>
  )
}