import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Invalid address parameter' }, { status: 400 })
    }

    // For hackathon demo - return mock user data that will be handled by client-side localStorage
    // This API is kept for compatibility but actual data fetching happens client-side
    return NextResponse.json({ 
      success: true, 
      message: 'User data is handled client-side for demo'
    }, { status: 200 })

  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}