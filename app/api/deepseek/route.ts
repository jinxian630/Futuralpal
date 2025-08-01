import { NextRequest, NextResponse } from 'next/server'
import { openRouterClient } from '@/lib/openrouter-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt = 'You are DeepSeek V3, a helpful AI assistant.' } = await request.json()

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: prompt'
      }, { status: 400 })
    }

    const result = await openRouterClient.generateResponse({
      prompt,
      systemPrompt,
      options: {
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 1000
      }
    })

    if (!result.success) {
      throw new Error(result.error)
    }
    
    return NextResponse.json({
      success: true,
      response: result.data?.response || 'Response generated successfully',
      model: result.data?.model || 'DeepSeek V3',
      usage: result.data?.usage,
      metadata: {
        provider: 'OpenRouter',
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI API error:', error)
    
    let errorMessage = 'Failed to connect to AI service'
    
    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error connecting to AI service. Please check your internet connection.'
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please check API key configuration.'
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      success: false, 
      error: errorMessage
    }, { status: 500 })
  }
} 