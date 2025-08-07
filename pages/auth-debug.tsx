import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { authOptions } from '@/lib/auth/authOptions'
import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'

interface AuthDebugProps {
  serverSession: any
}

const AuthDebugPage = ({ serverSession }: AuthDebugProps) => {
  const { data: clientSession, status } = useSession()
  const { user, isAuthenticated, logout } = useUser()
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    // Check localStorage data
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('futuropal_user')
      const loginTime = localStorage.getItem('futuropal_login_time')
      const onboardingCompleted = localStorage.getItem('futuropal_onboarding_completed')
      
      setLocalStorageData({
        user: userData ? JSON.parse(userData) : null,
        loginTime,
        onboardingCompleted
      })
    }
  }, [])

  const handleClearAll = async () => {
    await logout()
    localStorage.clear()
    window.location.reload()
  }

  const handleNextAuthSignOut = async () => {
    await signOut({ redirect: false })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 Authentication Debug Dashboard</h1>
        
        {/* Navigation */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="flex space-x-4">
            <Link href="/register" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Register Page
            </Link>
            <Link href="/personal/dashboard" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              🛡️ SSR-Protected Dashboard
            </Link>
          </div>
        </div>

        {/* Server Session */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🖥️ Server Session (getServerSideProps)</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(serverSession, null, 2) || 'null'}
            </pre>
          </div>
        </div>

        {/* Client Session */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🌐 Client Session (useSession)</h2>
          <p><strong>Status:</strong> {status}</p>
          <div className="bg-gray-50 p-4 rounded mt-2">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(clientSession, null, 2) || 'null'}
            </pre>
          </div>
        </div>

        {/* UserContext */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">👤 UserContext State</h2>
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</p>
          <div className="bg-gray-50 p-4 rounded mt-2">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(user, null, 2) || 'null'}
            </pre>
          </div>
        </div>

        {/* localStorage */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">💾 localStorage Data</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(localStorageData, null, 2) || 'null'}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🔧 Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🧹 Full Logout & Clear All
            </button>
            <button
              onClick={handleNextAuthSignOut}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              🚪 NextAuth SignOut Only
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  
  return {
    props: {
      serverSession: session
    }
  }
}

export default AuthDebugPage