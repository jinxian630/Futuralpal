import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🚪 Server-side logout request received')
    
    // Get the current session to verify user is authenticated
    const session = await getServerSession(req, res, authOptions)
    
    if (session) {
      console.log('📋 Session found during logout:', {
        userEmail: session.user?.email,
        hasIdToken: !!(session as any)?.idToken
      })
    } else {
      console.log('ℹ️  No session found during logout (already logged out)')
    }

    // Clear any server-side session data if needed
    // NextAuth automatically handles JWT token invalidation when signOut() is called on client
    
    console.log('✅ Server-side logout completed successfully')
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    })
    
  } catch (error) {
    console.error('💥 Error during server-side logout:', error)
    return res.status(500).json({ 
      error: 'Logout failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}