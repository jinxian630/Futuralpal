import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { openRouterClient } from '@/lib/openrouter-client'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, content, previousQuestions = [] } = await request.json()

    // Extract previous topics to avoid repetition
    const previousTopics = previousQuestions
      .map((q: any) => q.topic || '')
      .filter((t: string) => t.length > 0)
      .join(', ')

    let prompt: string
    let questionType: string

    // Choose question type based on difficulty
    if (difficulty === 'hard') {
      prompt = PROMPTS.OPEN_ENDED_QUESTION
        .replace('{{TOPIC}}', topic)
        .replace('{{CONTENT}}', content)
      questionType = 'open-ended'
    } else {
      prompt = PROMPTS.MCQ_QUESTION
        .replace('{{DIFFICULTY}}', difficulty.toUpperCase())
        .replace('{{TOPIC}}', topic)
        .replace('{{CONTENT}}', content)
        .replace('{{PREVIOUS_TOPICS}}', previousTopics || 'None')
      questionType = 'mcq'
    }

    const result = await openRouterClient.generateResponse({
      prompt: prompt,
      systemPrompt: `You are DeepSeek V3, an expert educational assessment AI. Create ${questionType === 'mcq' ? 'multiple-choice' : 'open-ended'} questions that test true understanding, not just memorization. Follow the specified difficulty level precisely.`,
      options: {
        temperature: 0.2,
        top_p: 0.8,
        max_tokens: 1000
      }
    })

    if (!result.success) {
      throw new Error(`AI API error: ${result.error}`)
    }

    const data = result.data
    console.log('Question generation response:', data) // Debug log
    
    // Parse the response to extract structured question data
    const questionResponse = data?.response || ''
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    let structuredQuestion: any = {
      id: questionId,
      type: questionType,
      difficulty: difficulty,
      topic: topic,
      rawResponse: questionResponse
    }

    if (questionType === 'mcq') {
      // Parse MCQ format
      const questionMatch = questionResponse.match(/QUESTION:\s*([\s\S]+?)(?=\n[A-D]\))/i)
      const optionsMatch = questionResponse.match(/([A-D]\)\s*.+?)(?=\n[A-D]\)|CORRECT_ANSWER|$)/g)
      const correctAnswerMatch = questionResponse.match(/CORRECT_ANSWER:\s*([A-D])/i)
      const explanationMatch = questionResponse.match(/EXPLANATION:\s*([\s\S]+?)(?=\n\n|\n[A-Z_]+:|$)/i)

      if (questionMatch && optionsMatch && correctAnswerMatch) {
        structuredQuestion.question = questionMatch[1].trim()
        structuredQuestion.options = optionsMatch.map(opt => opt.replace(/^[A-D]\)\s*/, '').trim())
        structuredQuestion.correctAnswer = correctAnswerMatch[1].toUpperCase()
        structuredQuestion.explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided'
      } else {
        // Fallback parsing if strict format isn't followed
        const lines = questionResponse.split('\n').filter(line => line.trim())
        structuredQuestion.question = lines.find(line => 
          line.toLowerCase().includes('question') || 
          (!line.match(/^[A-D]\)/) && !line.includes('CORRECT_ANSWER') && !line.includes('EXPLANATION'))
        )?.replace(/QUESTION:\s*/i, '').trim() || 'Question parsing failed'
        
        structuredQuestion.options = lines
          .filter(line => line.match(/^[A-D]\)/))
          .map(opt => opt.replace(/^[A-D]\)\s*/, '').trim())
        
        const correctMatch = lines.find(line => line.includes('CORRECT_ANSWER'))
        structuredQuestion.correctAnswer = correctMatch?.match(/([A-D])/)?.[1] || 'A'
        
        const explanationIndex = lines.findIndex(line => line.includes('EXPLANATION'))
        structuredQuestion.explanation = explanationIndex >= 0 ? 
          lines.slice(explanationIndex).join(' ').replace(/EXPLANATION:\s*/i, '').trim() : 
          'No explanation provided'
      }
    } else {
      // Parse open-ended format
      const questionMatch = questionResponse.match(/QUESTION:\s*([\s\S]+?)(?=\nIDEAL_ANSWER|EXPLANATION|$)/i)
      const idealAnswerMatch = questionResponse.match(/IDEAL_ANSWER:\s*([\s\S]+?)(?=\nEXPLANATION|$)/i)
      const explanationMatch = questionResponse.match(/EXPLANATION:\s*([\s\S]+?)$/i)

      structuredQuestion.question = questionMatch ? questionMatch[1].trim() : questionResponse.split('\n')[0]
      structuredQuestion.idealAnswer = idealAnswerMatch ? idealAnswerMatch[1].trim() : 'No ideal answer provided'
      structuredQuestion.explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided'
    }

    // Generate encouraging message based on difficulty
    const encouragementMessages = {
      easy: [
        "🌟 Perfect! Let's start with a foundational question to build your confidence!",
        "💪 Great choice! This question will help solidify your understanding!",
        "🎯 Excellent! Let's practice with this accessible question!"
      ],
      medium: [
        "🧠 Ready for a challenge? This question will test your comprehension!",
        "⚡ Time to level up! This question requires some deeper thinking!",
        "🔥 Let's dig deeper! This question will stretch your understanding!"
      ],
      hard: [
        "🚀 Expert mode activated! This question will test your mastery!",
        "💎 Advanced challenge ahead! Show me your analytical skills!",
        "🏆 Ultimate test time! This question requires critical thinking!"
      ]
    }

    const encouragementList = encouragementMessages[difficulty as keyof typeof encouragementMessages]
    const encouragement = encouragementList[Math.floor(Math.random() * encouragementList.length)]

    return NextResponse.json({
      success: true,
      question: structuredQuestion,
      encouragement: encouragement,
      metadata: {
        difficulty: difficulty,
        questionType: questionType,
        model: 'DeepSeek V3',
        provider: 'OpenRouter',
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Question generation error:', error)
    
    let errorMessage = 'Failed to generate question'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        errorDetails = 'Please check your internet connection and try again.'
      } else if (error.message.includes('Authentication failed')) {
        errorDetails = 'API authentication issue. Please contact support.'
      } else if (error.message.includes('Rate limit')) {
        errorDetails = 'Rate limit exceeded. Please wait a moment and try again.'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails
    }, { status: 500 })
  }
} 