'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface ZkLoginHandlerProps {
  onSuccess?: (address: string) => void
  onError?: (error: string) => void
}

const ZkLoginHandler: React.FC<ZkLoginHandlerProps> = ({ onSuccess, onError }) => {
  const { data: session, status } = useSession()
  const [userInfo, setUserInfo] = useState<any>(null)

  // This component now only shows session status
  // All zkLogin processing is handled by GoogleSignInButton
  
  if (status === 'authenticated' && session) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-600 mb-2">
          ✅ Signed in as: {session.user?.email}
        </div>
        <div className="text-xs text-gray-500">
          zkLogin processing will be handled automatically
        </div>
      </div>
    )
  }

  return null
}

export default ZkLoginHandler