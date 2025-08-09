import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { messages, module, userId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: messages'
      }, { status: 400 })
    }

    // Create completion using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.6,
      top_p: 0.9,
      frequency_penalty: 0.25,
      presence_penalty: 0.0,
      max_tokens: 400
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('AI API error: No response received')
    }

    // Return response in the format expected by ModularBot
    return NextResponse.json({
      choices: [{
        message: {
          content: completion.choices[0].message.content
        }
      }],
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        module: module || 'unknown',
        userId: userId || 'anonymous',
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI chat error:', error)
    
    let errorMessage = 'Failed to get AI response'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Handle rate limiting
      if (error.message.includes('Rate limit') || error.message.includes('429')) {
        statusCode = 429
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: "I need a moment to process your message! 🤖\n\n⏰ Please try again in a few seconds.",
          metadata: {
            errorType: 'rate_limit',
            errorOccurred: true,
            errorAt: new Date().toISOString(),
            retryAfter: 10
          }
        }, { 
          status: statusCode,
          headers: { 
            'Retry-After': '10',
            'X-RateLimit-Reset': new Date(Date.now() + 10000).toISOString()
          }
        })
      }

      // Handle API key issues
      if (error.message.includes('API key') || error.message.includes('Unauthorized') || error.message.includes('401')) {
        statusCode = 401
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: "🔑 There seems to be an issue with the AI service configuration. Please check that the OpenAI API key is properly set up.",
          metadata: {
            errorType: 'api_key',
            errorOccurred: true,
            errorAt: new Date().toISOString()
          }
        }, { status: statusCode })
      }

      // Handle network issues
      if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        statusCode = 503
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: "🌐 There seems to be a temporary connection problem. Please try again in a moment.",
          metadata: {
            errorType: 'network',
            errorOccurred: true,
            errorAt: new Date().toISOString()
          }
        }, { status: statusCode })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallbackMessage: "I'm having trouble processing your message right now. Please try again in a moment.",
      metadata: {
        errorType: 'general',
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: statusCode })
  }
}