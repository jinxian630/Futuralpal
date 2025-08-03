import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { openRouterClient } from '@/lib/openrouter-client'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json()

    // Validate input
    if (!content || !fileName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: content and fileName'
      }, { status: 400 })
    }

    // Step 1: Content Analysis
    const analysisPrompt = PROMPTS.CONTENT_ANALYSIS.replace('{{CONTENT}}', content)
    
    // ✅ ENHANCED DEBUGGING: Verify exact content being sent to DeepSeek
    console.log('🔍 DEBUGGING PDF CONTENT FLOW TO GEMINI:')
    console.log('📄 Content Preview (first 300 chars):', content.substring(0, 300))
    console.log('📊 Content Length:', content.length, 'characters')
    
    // Check if content contains the enhanced text format
    const containsFileProcessingSummary = content.includes('FILE PROCESSING SUMMARY')
    const containsExtractedContent = content.includes('EXTRACTED CONTENT FOR GEMINI V3 ANALYSIS')
    console.log('📋 Enhanced Format Check:', { containsFileProcessingSummary, containsExtractedContent })
    
    // Extract just the PDF text portion (between the markers)
    const extractedContentStart = content.indexOf('EXTRACTED CONTENT FOR GEMINI V3 ANALYSIS:')
    const extractedContentEnd = content.indexOf('PROCESSING INSTRUCTIONS FOR GEMINI V3:')
    
    if (extractedContentStart !== -1 && extractedContentEnd !== -1) {
      const actualPDFContent = content.substring(
        extractedContentStart + 'EXTRACTED CONTENT FOR GEMINI V3 ANALYSIS:'.length,
        extractedContentEnd
      ).trim()
      
      console.log('📖 ACTUAL PDF CONTENT Preview (first 500 chars):')
      console.log(actualPDFContent.substring(0, 500))
      console.log('📊 ACTUAL PDF CONTENT Length:', actualPDFContent.length, 'characters')
      
      // Check if PDF content looks valid (not empty/garbage)
      const hasValidContent = actualPDFContent.length > 100 && /[a-zA-Z]/.test(actualPDFContent)
      console.log('✅ PDF Content Validation:', { hasValidContent, isEmpty: actualPDFContent.length === 0 })
    } else {
      console.log('⚠️ Could not extract PDF content from enhanced format')
    }
    
    console.log('🎯 Content Analysis Prompt Length:', analysisPrompt.length, 'characters')
    
    // ✅ FINAL VERIFICATION: Log actual prompt being sent to Gemini
    console.log('🔍 SENDING TO GEMINI: Prompt length =', analysisPrompt.length)
    console.log('🔍 SENDING TO GEMINI: First 300 chars of prompt:')
    console.log(analysisPrompt.substring(0, 300))
    
    const analysisResult = await openRouterClient.generateResponse({
      prompt: analysisPrompt,
      systemPrompt: 'You are Google Gemini 2.5 Flash — an advanced educational AI tutor. Your task is to guide students by analyzing content, summarizing key points, simplifying complex ideas, and generating quizzes or flashcards. Always log the exact prompt received and respond with clarity, precision, and usefulness for learning.',
      options: {
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 1200
      }
    })
    
    // ✅ VERIFICATION: Log DeepSeek's response
    console.log('🔍 GEMINI RESPONSE: Success =', analysisResult.success)
    if (analysisResult.success) {
      console.log('🔍 GEMINI RESPONSE: First 200 chars =', analysisResult.data?.response?.substring(0, 200))
    }

    if (!analysisResult.success) {
      throw new Error(`Analysis failed: ${analysisResult.error}`)
    }

    const analysisData = analysisResult.data

    // Step 2: Comprehensive Notes Generation
    const notesPrompt = PROMPTS.COMPREHENSIVE_NOTES.replace('{{CONTENT}}', content)
    
    console.log('📝 Notes Generation Prompt Length:', notesPrompt.length, 'characters')
    
    const notesResult = await openRouterClient.generateResponse({
      prompt: notesPrompt,
      systemPrompt: 'You are Google Gemini 2.5 Flash, an expert AI tutor creating flashcards for spaced repetition. Based on the given study material, generate clear and concise flashcards (1 concept per card) using various types: concept recall, comparison, application, true/false, and fill-in-the-blank. Format: Q: [question] A: [answer]. Limit to 5–10 cards. Keep them accurate, engaging, and optimized for memory retention.',

      options: {
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 2000
      }
    })

    if (!notesResult.success) {
      throw new Error(`Notes generation failed: ${notesResult.error}`)
    }

    const notesData = notesResult.data

    // Step 3: Flashcards Generation
    const flashcardsPrompt = PROMPTS.FLASHCARDS.replace('{{NOTES}}', notesData?.response || '')
    
    console.log('🎯 Flashcards Generation Prompt Length:', flashcardsPrompt.length, 'characters')
    
    const flashcardsResult = await openRouterClient.generateResponse({
      prompt: flashcardsPrompt,
      systemPrompt: 'You are Google Gemini 2.5 Flash creating effective flashcards for spaced repetition learning. Make them engaging and educationally sound.',
      options: {
        temperature: 0.2,
        top_p: 0.8,
        max_tokens: 1500
      }
    })

    if (!flashcardsResult.success) {
      throw new Error(`Flashcards generation failed: ${flashcardsResult.error}`)
    }

    const flashcardsData = flashcardsResult.data

    // Prepare comprehensive response data
    const responseData = {
      success: true,
      message: `Successfully generated comprehensive study materials for "${fileName}" using Google Gemini 2.5 Flash`,
      data: {
        analysis: analysisData?.response || 'Analysis completed',
        notes: notesData?.response || 'Notes generated',
        flashcards: flashcardsData?.response || 'Flashcards created',
        fileName: fileName,
        generatedAt: new Date().toISOString(),
        metadata: {
          contentLength: content.length,
          processingSteps: ['Content Analysis', 'Notes Generation', 'Flashcards Creation'],
          model: 'Google Gemini 2.5 Flash',
          provider: 'OpenRouter'
        }
      }
    }

    console.log('✅ Notes generation completed successfully')
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in generate-notes:', error)
    
    let errorMessage = 'Failed to generate study notes'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Provide specific error guidance
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        errorDetails = 'Please check your internet connection and try again.'
      } else if (error.message.includes('Authentication failed')) {
        errorDetails = 'API authentication issue. Please contact support.'
      } else if (error.message.includes('Rate limit')) {
        errorDetails = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (error.message.includes('content.length')) {
        errorDetails = 'Content may be too large. Please try with a smaller document.'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails
    }, { status: 500 })
  }
} 