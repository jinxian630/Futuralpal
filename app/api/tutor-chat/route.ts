import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { openRouterClient } from '@/lib/openrouter-client'

export async function POST(request: NextRequest) {
  try {
    const { question, studyContext, studentHistory } = await request.json()

    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: question'
      }, { status: 400 })
    }

    // Prepare context for the tutor
    const historyContext = studentHistory ? 
      `Student's recent performance: ${JSON.stringify(studentHistory)}` : 
      'First interaction with this student'

    const tutorPrompt = PROMPTS.TUTOR_CHAT
      .replace('{{STUDY_CONTEXT}}', studyContext || 'General learning session')
      .replace('{{QUESTION}}', question)
      .replace('{{HISTORY}}', historyContext)

    const result = await openRouterClient.generateResponse({
      prompt: tutorPrompt,
      systemPrompt: 'You are DeepSeek V3, an expert AI tutor for FuturoPal. Provide helpful, encouraging, and educational responses that support student learning. Be patient, clear, and motivating.',
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 800
      }
    })

    if (!result.success) {
      throw new Error(`AI API error: ${result.error}`)
    }

    const data = result.data

    // Add helpful actions based on the question type
    let suggestedActions = []
    const questionLower = question.toLowerCase()

    if (questionLower.includes('quiz') || questionLower.includes('test') || questionLower.includes('question')) {
      suggestedActions.push({
        label: '📝 Generate Practice Questions',
        action: 'generate_questions',
        icon: '📝'
      })
    }

    if (questionLower.includes('note') || questionLower.includes('summary') || questionLower.includes('study')) {
      suggestedActions.push({
        label: '📚 Create Study Notes',
        action: 'generate_notes',
        icon: '📚'
      })
    }

    if (questionLower.includes('easy') || questionLower.includes('beginner') || questionLower.includes('start')) {
      suggestedActions.push({
        label: '🎯 Easy Practice',
        action: 'easy_quiz',
        icon: '🎯'
      })
    }

    if (questionLower.includes('hard') || questionLower.includes('difficult') || questionLower.includes('challenge')) {
      suggestedActions.push({
        label: '🚀 Advanced Challenge',
        action: 'hard_quiz',
        icon: '🚀'
      })
    }

    if (questionLower.includes('explain') || questionLower.includes('understand') || questionLower.includes('clarify')) {
      suggestedActions.push({
        label: '💡 Get More Examples',
        action: 'explain_more',
        icon: '💡'
      })
    }

    // Add default actions if no specific ones were triggered
    if (suggestedActions.length === 0) {
      suggestedActions.push(
        {
          label: '📝 Practice Questions',
          action: 'generate_questions',
          icon: '📝'
        },
        {
          label: '📚 Study Tips',
          action: 'study_tips',
          icon: '📚'
        }
      )
    }

    // Generate follow-up encouragement
    const encouragementOptions = [
      "Feel free to ask follow-up questions - I'm here to help! 🌟",
      "What would you like to explore next? I can help with more practice! 💪",
      "Keep up the great learning momentum! What else can I help you with? 🚀",
      "You're doing fantastic! Let me know if you need clarification on anything! ✨",
      "Great question! Is there anything specific you'd like to dive deeper into? 🧠"
    ]

    const followUpEncouragement = encouragementOptions[Math.floor(Math.random() * encouragementOptions.length)]

    // Assess confidence level based on question content
    let confidenceLevel = 75 // Default confidence
    
    if (questionLower.includes('confused') || questionLower.includes('don\'t understand') || questionLower.includes('help')) {
      confidenceLevel = 60
    } else if (questionLower.includes('sure') || questionLower.includes('confident') || questionLower.includes('ready')) {
      confidenceLevel = 90
    }

    return NextResponse.json({
      success: true,
      response: data?.response || 'I\'m here to help you learn!',
      suggestedActions: suggestedActions,
      followUpEncouragement: followUpEncouragement,
      confidenceLevel: confidenceLevel,
      metadata: {
        model: 'DeepSeek V3',
        provider: 'OpenRouter',
        respondedAt: new Date().toISOString(),
        questionAnalysis: {
          topic: studyContext ? 'Context-based' : 'General',
          suggestionsCount: suggestedActions.length,
          confidenceLevel: confidenceLevel
        }
      }
    })

  } catch (error) {
    console.error('Tutor chat error:', error)
    
    let errorMessage = 'Failed to get tutor response'
    let fallbackMessage = "I'm having a technical issue right now, but don't let that stop your learning! 💪\n\nHere are some things you can try:\n• Review your study notes\n• Practice with flashcards\n• Try generating some questions\n• Take a short break and come back refreshed\n\nI'll be ready to help when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        fallbackMessage = "I'm having trouble connecting right now, but here's what I suggest:\n\n🔄 **Quick Study Tips:**\n• Review your recent notes\n• Practice key concepts\n• Try explaining topics out loud\n• Take notes on what you want to ask me later\n\n💡 I'll be back online soon to help with your questions!"
      } else if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to recharge! ⚡\n\n⏰ **While we wait:**\n• Review your study materials\n• Practice previous concepts\n• Think of questions to ask me\n• Take a quick study break\n\n🚀 Try asking again in a moment!"
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallbackMessage: fallbackMessage,
      // Provide helpful suggestions even when there's an error
      suggestedActions: [
        {
          label: '📚 Review Notes',
          action: 'review_notes',
          icon: '📚'
        },
        {
          label: '🔄 Try Again',
          action: 'retry',
          icon: '🔄'
        }
      ],
      metadata: {
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: 500 })
  }
} 