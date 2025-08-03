import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { openRouterClient } from '@/lib/openrouter-client'

// 🧠 Student Learning Analysis Functions
function analyzeStudentNeeds(question: string, studentHistory: any) {
  const questionLower = question.toLowerCase()
  
  // Detect learning intent
  let intent = 'general'
  if (questionLower.includes('explain') || questionLower.includes('understand')) intent = 'explanation'
  else if (questionLower.includes('practice') || questionLower.includes('quiz')) intent = 'practice'
  else if (questionLower.includes('help') || questionLower.includes('confused')) intent = 'support'
  else if (questionLower.includes('memorize') || questionLower.includes('remember')) intent = 'memorization'
  
  // Detect if extra patience is needed
  const patienceKeywords = ['confused', "don't understand", 'struggling', 'difficult', 'hard', 'help me', 'lost']
  const needsExtraPatience = patienceKeywords.some(keyword => questionLower.includes(keyword))
  
  // Analyze learning patterns from history
  let patterns = 'First interaction'
  if (studentHistory) {
    patterns = 'Regular learner with consistent engagement'
  }
  
  return {
    intent,
    needsExtraPatience,
    patterns
  }
}

// 🌡️ Dynamic Temperature Control
function getDynamicTemperature(question: string): number {
  const questionLower = question.toLowerCase()
  
  if (questionLower.includes('brainstorm') || questionLower.includes('creative') || questionLower.includes('ideas')) {
    return 0.7 // Higher creativity
  } else if (questionLower.includes('explain') || questionLower.includes('define') || questionLower.includes('formula')) {
    return 0.2 // Lower for precision
  } else if (questionLower.includes('example') || questionLower.includes('practice')) {
    return 0.4 // Moderate for variety
  }
  
  return 0.3 // Default balanced temperature
}

// 🏷️ Topic Tagging
function extractTopicTags(question: string, studyContext?: string): string[] {
  const questionLower = question.toLowerCase()
  const tags = ['General']
  
  // Subject detection
  const subjects = {
    'Math': ['math', 'algebra', 'calculus', 'geometry', 'arithmetic', 'equation', 'formula'],
    'Science': ['science', 'biology', 'chemistry', 'physics', 'experiment', 'hypothesis'],
    'History': ['history', 'historical', 'century', 'war', 'ancient', 'civilization'],
    'Language': ['grammar', 'writing', 'literature', 'essay', 'vocabulary', 'language'],
    'Programming': ['code', 'programming', 'algorithm', 'function', 'variable', 'syntax']
  }
  
  for (const [subject, keywords] of Object.entries(subjects)) {
    if (keywords.some(keyword => questionLower.includes(keyword))) {
      tags.push(subject)
    }
  }
  
  if (studyContext && !tags.includes(studyContext)) {
    tags.push(studyContext)
  }
  
  return tags.filter(tag => tag !== 'General').length > 0 ? 
    tags.filter(tag => tag !== 'General') : ['General']
}

// 💖 Adaptive Encouragement
function getAdaptiveEncouragement(studentAnalysis: any, topicTags: string[]): string[] {
  const baseEncouragement: string[] = [
    "You're doing great! Keep up the wonderful learning momentum! 🌟",
    "Excellent question! I'm here to support your learning journey! 💪",
    "I love your curiosity! What would you like to explore next? 🚀"
  ]
  
  const patienceEncouragement: string[] = [
    "Take your time - learning is a journey, not a race! I'm here to help every step of the way! 🌱",
    "You're asking great questions! Remember, every expert was once a beginner. Keep going! 💙",
    "It's completely normal to find this challenging. Let's break it down together - you've got this! 🤝",
    "Learning takes patience, and you're showing great determination! I'm proud of your effort! ⭐"
  ]
  
  if (studentAnalysis.needsExtraPatience) {
    return patienceEncouragement
  }
  
  return baseEncouragement
}

// 📊 Enhanced Confidence Assessment
function assessStudentConfidence(question: string, studentHistory: any, studentAnalysis: any): number {
  const questionLower = question.toLowerCase()
  let confidenceLevel = 75 // Default
  
  // Negative confidence indicators
  if (questionLower.includes('confused') || questionLower.includes("don't understand") || 
      questionLower.includes('lost') || questionLower.includes('struggling')) {
    confidenceLevel = 40
  } else if (questionLower.includes('help') || questionLower.includes('difficult')) {
    confidenceLevel = 55
  }
  
  
  // Positive confidence indicators
  else if (questionLower.includes('sure') || questionLower.includes('confident') || 
           questionLower.includes('ready') || questionLower.includes('understand')) {
    confidenceLevel = 90
  } else if (questionLower.includes('practice') || questionLower.includes('try')) {
    confidenceLevel = 80
  }
  
  return confidenceLevel
}

// 🎯 Patience Level Calculator
function calculatePatienceNeeded(confidenceLevel: number, studentAnalysis: any): string {
  if (confidenceLevel < 50 || studentAnalysis.needsExtraPatience) {
    return 'High - Extra patience and encouragement needed'
  } else if (confidenceLevel < 70) {
    return 'Medium - Standard supportive approach'
  } else {
    return 'Low - Student is confident, can provide more challenge'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, studyContext, studentHistory, language, customSystemPrompt } = await request.json()

    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: question'
      }, { status: 400 })
    }

    // Analyze student's learning patterns and needs
    const studentAnalysis = analyzeStudentNeeds(question, studentHistory)
    
    // Prepare context for the tutor with enhanced patience indicators
    const historyContext = studentHistory ? 
      `Student's recent performance: ${JSON.stringify(studentHistory)}\nLearning patterns: ${studentAnalysis.patterns}` : 
      'First interaction with this student - be extra patient and encouraging'

    let tutorPrompt = PROMPTS.TUTOR_CHAT
      .replace('{{STUDY_CONTEXT}}', studyContext || 'General learning session')
      .replace('{{QUESTION}}', question)
      .replace('{{HISTORY}}', historyContext)
    
    // Add language instruction if specified
    if (language && language !== 'English') {
      tutorPrompt += `\n\nPlease respond in ${language}.`
    }
    
    // Add patience reminders based on student needs
    if (studentAnalysis.needsExtraPatience) {
      tutorPrompt += '\n\nIMPORTANT: This student may need extra patience and encouragement. Break down complex concepts into smaller steps.'
    }

    // Dynamic temperature control based on intent
    const temperature = getDynamicTemperature(question)
    
    // Enhanced system prompt for patient teaching
    const enhancedSystemPrompt = customSystemPrompt || `You are an expert AI tutor for FuturoPal with infinite patience and empathy. Your teaching philosophy:

🎯 CORE PRINCIPLES:
- NEVER rush or overwhelm students
- Break complex topics into digestible steps
- Celebrate small wins and progress
- Use encouraging, positive language
- Adapt explanations to student's level
- Provide multiple examples when needed

💡 TEACHING APPROACH:
- Start with what the student already knows
- Use analogies and real-world examples
- Ask guiding questions to promote thinking
- Offer practice opportunities
- Be enthusiastic about learning

🌟 PATIENCE INDICATORS:
- If student seems confused, slow down and simplify
- Repeat important concepts in different ways
- Acknowledge when topics are challenging
- Remind students that learning takes time
- Encourage questions and curiosity

Respond as a patient, understanding teacher who genuinely cares about student success.`
    
    console.debug('🎓 Tutor Prompt Analysis:', {
      questionIntent: studentAnalysis.intent,
      temperature,
      promptLength: tutorPrompt.length,
      needsPatience: studentAnalysis.needsExtraPatience
    })

    const result = await openRouterClient.generateResponse({
      prompt: tutorPrompt,
      systemPrompt: enhancedSystemPrompt,
      options: {
        temperature,
        top_p: 0.9,
        max_tokens: 1000
      }
    })

    if (!result.success) {
      throw new Error(`AI API error: ${result.error}`)
    }

    const data = result.data

    // Add helpful actions based on the question type with flashcard support
    let suggestedActions = []
    const questionLower = question.toLowerCase()
    
    // 🃏 Flashcard Support
    if (questionLower.includes('flashcard') || questionLower.includes('memory') || questionLower.includes('spaced repetition') || questionLower.includes('memorize')) {
      suggestedActions.push({
        label: '🃏 Create Flashcards',
        action: 'generate_flashcards',
        icon: '🃏'
      })
    }

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
    
    // Add visual learning support
    if (questionLower.includes('visual') || questionLower.includes('diagram') || questionLower.includes('picture') || questionLower.includes('image')) {
      suggestedActions.push({
        label: '🎨 Visual Learning Aid',
        action: 'create_visual',
        icon: '🎨'
      })
    }
    
    // Add step-by-step breakdown for complex topics
    if (questionLower.includes('step') || questionLower.includes('process') || questionLower.includes('how to')) {
      suggestedActions.push({
        label: '📋 Step-by-Step Guide',
        action: 'step_by_step',
        icon: '📋'
      })
    }

    // Add default actions if no specific ones were triggered
    if (suggestedActions.length === 0) {
      suggestedActions.push(
        {
          label: '🃏 Create Flashcards',
          action: 'generate_flashcards',
          icon: '🃏'
        },
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

    // Topic tagging for better analytics
    const topicTags = extractTopicTags(question, studyContext)
    
    // Generate adaptive follow-up encouragement based on student needs
    const encouragementOptions = getAdaptiveEncouragement(studentAnalysis, topicTags)
    const followUpEncouragement = encouragementOptions[Math.floor(Math.random() * encouragementOptions.length)]

    // Enhanced confidence assessment with patience indicators
    const confidenceLevel = assessStudentConfidence(question, studentHistory, studentAnalysis)
    const patienceLevel = calculatePatienceNeeded(confidenceLevel, studentAnalysis)

    return NextResponse.json({
      success: true,
      response: data?.response || 'I\'m here to help you learn!',
      suggestedActions: suggestedActions,
      followUpEncouragement: followUpEncouragement,
      confidenceLevel: confidenceLevel,
      metadata: {
        model: 'Google Gemini 2.5 Flash',
        provider: 'OpenRouter',
        respondedAt: new Date().toISOString(),
        questionAnalysis: {
          intent: studentAnalysis.intent,
          topicTags: topicTags,
          suggestionsCount: suggestedActions.length,
          confidenceLevel: confidenceLevel,
          patienceLevel: patienceLevel,
          promptTemperature: temperature,
          finalPromptLength: tutorPrompt.length,
          needsExtraPatience: studentAnalysis.needsExtraPatience
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
        
        // Handle rate limiting with retry headers
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: fallbackMessage,
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
            errorAt: new Date().toISOString(),
            retryAfter: 10
          }
        }, { 
          status: 429,
          headers: { 
            'Retry-After': '10',
            'X-RateLimit-Reset': new Date(Date.now() + 10000).toISOString()
          }
        })
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