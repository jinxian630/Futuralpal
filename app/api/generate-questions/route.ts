import { NextRequest, NextResponse } from 'next/server'
import { openRouterClient } from '@/lib/openrouter-client'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json()

    if (!content || !fileName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: content and fileName'
      }, { status: 400 })
    }

    const prompt = `Based on the following content from "${fileName}", generate 3 educational questions that would help a student learn and test their understanding:

Content: ${content}

Please format your response as:
1. [Question 1]
2. [Question 2] 
3. [Question 3]

Make the questions clear, educational, and appropriate for the content level. Focus on testing comprehension and application of the key concepts.`

    const result = await openRouterClient.generateResponse({
      prompt: prompt,
      systemPrompt: 'You are DeepSeek V3, an expert educational AI. Create meaningful questions that test understanding of the provided content.',
      options: {
        temperature: 0.2,
        top_p: 0.8,
        max_tokens: 600
      }
    })

    if (!result.success) {
      throw new Error(`OpenRouter API error: ${result.error}`)
    }
    
    return NextResponse.json({
      success: true,
      response: result.data?.response || 'Questions generated successfully',
      metadata: {
        model: 'DeepSeek V3',
        provider: 'OpenRouter',
        fileName: fileName,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Question generation error:', error)
    
    let errorMessage = 'Failed to generate questions'
    
    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'API authentication issue. Please contact support.'
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