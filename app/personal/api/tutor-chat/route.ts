import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { getOpenAI } from '@/lib/openai-config'

// Enhanced AI Tutor imports
import { 
  analyzeStudentNeeds, 
  getDynamicTemperature, 
  extractTopicTags, 
  getAdaptiveEncouragement, 
  assessStudentConfidence, 
  calculatePatienceNeeded 
} from '@/lib/learning-utils'
import { 
  analyzeSentimentAndTone, 
  generateEmotionalResponse, 
  integrateEmotionWithLearningStyle 
} from '@/lib/emotion-detection'
import { 
  detectLearningStyle, 
  adaptContentForLearningStyle 
} from '@/lib/learning-style-detection'
import { 
  selectOptimalTeachingStyle, 
  enhancePromptWithTeachingStyle 
} from '@/lib/teaching-style-personalizer'
import { 
  calculateTutorXP, 
  checkTutorAchievements, 
  generateMotivationalResponse, 
  buildGamificationContext, 
  integrateProgressWithResponse 
} from '@/lib/gamification-integration'
import { StudentHistory, TeachingStyle, EmotionalState } from '@/lib/types/student'

export async function POST(request: NextRequest) {
  try {
    const { 
      question, 
      studyContext, 
      studentHistory, 
      language, 
      customSystemPrompt,
      // Enhanced parameters
      userId = 'default',
      sessionId,
      teachingStyle,
      conversationHistory = [],
      userPreferences = {},
      enableGamification = true,
      enableEmotionalIntelligence = true
    } = await request.json()

    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: question'
      }, { status: 400 })
    }

    // 🧠 Enhanced Student Analysis with Emotional Intelligence
    const studentAnalysis = analyzeStudentNeeds(question, studentHistory)
    
    // Emotional intelligence analysis
    let emotionalAnalysis: any = null
    let learningStyleAnalysis: any = null
    let teachingStyleSelection: any = null
    
    if (enableEmotionalIntelligence) {
      emotionalAnalysis = analyzeSentimentAndTone(question, {
        previousEmotions: studentHistory?.emotionalPattern?.emotionHistory?.map((e: any) => e.emotion),
        sessionDuration: userPreferences.sessionDuration,
        recentPerformance: studentHistory?.recentPerformance
      })
      
      // Learning style detection
      learningStyleAnalysis = detectLearningStyle(
        question,
        conversationHistory,
        userPreferences.behaviorPatterns
      )
      
      // Teaching style selection
      teachingStyleSelection = selectOptimalTeachingStyle({
        studentPreference: teachingStyle,
        emotionalState: emotionalAnalysis.primaryEmotion,
        learningStyle: learningStyleAnalysis.detectedStyle,
        confidenceLevel: assessStudentConfidence(question, studentHistory, studentAnalysis),
        topicComplexity: userPreferences.topicComplexity || 'medium'
      })
    }
    
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
    if (studentAnalysis.patienceLevel !== 'standard') {
      tutorPrompt += '\n\nIMPORTANT: This student may need extra patience and encouragement. Break down complex concepts into smaller steps.'
    }

    // 🌡️ Enhanced Dynamic Temperature Control
    const temperature = getDynamicTemperature(question, studentAnalysis)
    
    // 🏷️ Enhanced Topic Analysis
    const topicTags = extractTopicTags(question, studyContext)
    
    // 📊 Enhanced Confidence Assessment
    const confidenceLevel = assessStudentConfidence(question, studentHistory, studentAnalysis)
    const patienceAnalysis = calculatePatienceNeeded(confidenceLevel, studentAnalysis, userPreferences.topicComplexity)
    
    // 🎨 Build Enhanced System Prompt with Teaching Style
    let baseSystemPrompt = customSystemPrompt || `You are an expert AI tutor for FuturoPal with infinite patience and empathy. Your teaching philosophy:`
    
    // Apply teaching style personalization
    let enhancedSystemPrompt = baseSystemPrompt
    if (enableEmotionalIntelligence && teachingStyleSelection) {
      const promptEnhancement = enhancePromptWithTeachingStyle(
        baseSystemPrompt,
        teachingStyleSelection.recommendedStyle,
        {
          emotionalState: emotionalAnalysis?.primaryEmotion,
          learningStyle: learningStyleAnalysis?.detectedStyle,
          topicComplexity: userPreferences.topicComplexity
        }
      )
      enhancedSystemPrompt = promptEnhancement.enhancedPrompt
    } else {
      enhancedSystemPrompt = baseSystemPrompt + `

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
    }
    
    // 💡 Generate Emotional Response Adaptations
    let emotionalResponseGuidance = ''
    if (enableEmotionalIntelligence && emotionalAnalysis) {
      const emotionalResponse = generateEmotionalResponse(
        emotionalAnalysis.primaryEmotion,
        emotionalAnalysis.intensity,
        {
          topic: studyContext,
          difficulty: userPreferences.difficulty,
          attempts: studentHistory?.totalQuestionsAnswered
        }
      )
      
      emotionalResponseGuidance = `\n\nEMOTIONAL GUIDANCE: ${emotionalResponse.encouragement}\nADAPTATIONS: ${emotionalResponse.adaptations.join(', ')}`
      enhancedSystemPrompt += emotionalResponseGuidance
    }
    
    console.debug('🎓 Enhanced Tutor Analysis:', {
      questionIntent: studentAnalysis.intent,
      temperature,
      promptLength: tutorPrompt.length,
      needsPatience: studentAnalysis.patienceLevel,
      emotionalState: emotionalAnalysis?.primaryEmotion,
      learningStyle: learningStyleAnalysis?.detectedStyle,
      teachingStyle: teachingStyleSelection?.recommendedStyle,
      confidenceLevel,
      topicTags: topicTags.tags
    })

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: tutorPrompt }
      ],
      temperature: temperature,
      max_tokens: 1000
    })
    
    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    let data = { response }
    
    // 🎮 Gamification Integration
    let gamificationResults: any = null
    if (enableGamification && response) {
      // Calculate XP for this interaction
      const xpResult = calculateTutorXP('ask_question', {
        intent: studentAnalysis.intent,
        difficulty: userPreferences.difficulty,
        confidenceLevel,
        emotionalState: emotionalAnalysis?.primaryEmotion,
        patienceLevel: studentAnalysis.patienceLevel,
        studentStreak: studentHistory?.streakDays
      })
      
      // Check for new achievements
      const achievementResult = checkTutorAchievements(
        studentHistory,
        {
          questionsAsked: (studentHistory?.totalQuestionsAnswered || 0) + 1,
          correctAnswers: studentHistory?.totalCorrectAnswers || 0,
          topicsExplored: [studyContext, ...(studentHistory?.topicHistory || [])],
          sessionDuration: userPreferences.sessionDuration || 15,
          emotionalStates: [emotionalAnalysis?.primaryEmotion].filter(Boolean),
          difficultyProgression: [userPreferences.difficulty].filter(Boolean),
          conversationTurns: conversationHistory.length + 1
        }
      )
      
      // Generate motivational response
      const motivationalMessage = generateMotivationalResponse({
        userId: userId,
        xpGained: xpResult.xpGained,
        bonusReasons: xpResult.bonusReasons,
        newAchievements: achievementResult.newAchievements,
        emotionalState: emotionalAnalysis?.primaryEmotion,
        learningVelocity: studentAnalysis.learningVelocity
      })
      
      gamificationResults = {
        xpGained: xpResult.xpGained,
        bonusReasons: xpResult.bonusReasons,
        newAchievements: achievementResult.newAchievements,
        motivationalMessage
      }
      
      // Integrate gamification with response
      const enhancedResponseResult = integrateProgressWithResponse(response, gamificationResults)
      data.response = enhancedResponseResult.enhancedResponse
    }

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

    // Use the previously extracted topic tags for analytics
    
    // 💖 Generate Adaptive Encouragement
    const encouragementOptions = getAdaptiveEncouragement(
      studentAnalysis, 
      topicTags, 
      {
        consecutiveCorrect: studentHistory?.streakDays || 0,
        recentMistakes: Math.max(0, (studentHistory?.totalQuestionsAnswered || 0) - (studentHistory?.totalCorrectAnswers || 0))
      }
    )
    const followUpEncouragement = encouragementOptions[Math.floor(Math.random() * encouragementOptions.length)]

    return NextResponse.json({
      success: true,
      response: data?.response || 'I\'m here to help you learn!',
      suggestedActions: suggestedActions,
      followUpEncouragement: followUpEncouragement,
      confidenceLevel: confidenceLevel,
      // 🔄 Enhanced Learning Style Content Adaptation
      contentAdaptations: enableEmotionalIntelligence && learningStyleAnalysis ? 
        adaptContentForLearningStyle(response, learningStyleAnalysis.detectedStyle, studyContext || 'General') : undefined,
      
      // 🎮 Gamification Data
      gamification: gamificationResults ? {
        xpGained: gamificationResults.xpGained,
        newAchievements: gamificationResults.newAchievements.map((a: any) => ({
          id: a.id,
          name: a.name,
          emoji: a.emoji
        })),
        gamificationSummary: {
          xpGained: gamificationResults.xpGained,
          achievementsCount: gamificationResults.newAchievements.length,
          motivationalHighlight: gamificationResults.motivationalMessage.primaryMessage
        }
      } : undefined,
      
      // 📊 Enhanced Metadata
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenRouter',
        respondedAt: new Date().toISOString(),
        enhancedFeatures: {
          emotionalIntelligence: enableEmotionalIntelligence,
          gamification: enableGamification,
          adaptiveTeaching: !!teachingStyleSelection
        },
        questionAnalysis: {
          intent: studentAnalysis.intent,
          topicTags: topicTags.tags,
          primaryTopic: topicTags.primaryTopic,
          difficulty: topicTags.difficulty,
          suggestionsCount: suggestedActions.length,
          confidenceLevel: confidenceLevel,
          patienceLevel: patienceAnalysis.level,
          promptTemperature: temperature,
          finalPromptLength: tutorPrompt.length,
          learningVelocity: studentAnalysis.learningVelocity
        },
        emotionalAnalysis: enableEmotionalIntelligence ? {
          primaryEmotion: emotionalAnalysis?.primaryEmotion,
          confidence: emotionalAnalysis?.confidence,
          intensity: emotionalAnalysis?.intensity,
          recommendedResponse: emotionalAnalysis?.recommendedResponse
        } : undefined,
        learningStyleAnalysis: enableEmotionalIntelligence ? {
          detectedStyle: learningStyleAnalysis?.detectedStyle,
          confidence: learningStyleAnalysis?.confidence,
          indicators: learningStyleAnalysis?.indicators?.slice(0, 3)
        } : undefined,
        teachingStyleAnalysis: enableEmotionalIntelligence ? {
          recommendedStyle: teachingStyleSelection?.recommendedStyle,
          confidence: teachingStyleSelection?.confidence,
          reasoning: teachingStyleSelection?.reasoning?.slice(0, 2)
        } : undefined,
        responseId: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
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