import { NextRequest, NextResponse } from 'next/server'
import { openRouterClient } from '@/lib/openrouter-client'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const result = await openRouterClient.healthCheck()
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        status: 'disconnected',
        service: 'OpenRouter'
      }, { status: 503 })
    }

    return NextResponse.json({
      success: true,
      message: 'OpenRouter service is accessible and ready',
      model: result.model,
      status: 'connected',
      service: 'OpenRouter',
      provider: 'Google Gemini 2.5 Flash'
    })

  } catch (error) {
    console.error('OpenRouter health check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during health check',
      status: 'disconnected',
      service: 'OpenRouter'
    }, { status: 503 })
  }
} 