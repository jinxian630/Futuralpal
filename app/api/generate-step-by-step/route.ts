import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'
import { 
  analyzeStudentNeeds, 
  getDynamicTemperature, 
  extractTopicTags, 
  getAdaptiveEncouragement 
} from '@/lib/learning-utils'

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      studyContext, 
      customPrompt,
      difficulty = 'medium',
      language = 'English',
      studentHistory = null
    } = await request.json()

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: topic'
      }, { status: 400 })
    }

    // Analyze the request for better step-by-step generation
    const studentAnalysis = analyzeStudentNeeds(topic, studentHistory)
    const topicTags = extractTopicTags(topic, studyContext)
    const temperature = getDynamicTemperature(topic, studentAnalysis)

    // Build specialized step-by-step prompt
    const stepByStepPrompt = `You are an expert educational AI specialized in creating clear, structured step-by-step guides for students.

TOPIC: "${topic}"
CONTEXT: ${studyContext || 'General learning'}
DIFFICULTY LEVEL: ${difficulty}
STUDENT NEEDS: ${studentAnalysis.intent}

YOUR TASK:
Create a comprehensive, easy-to-follow step-by-step guide that breaks down the topic into clear, actionable steps.

FORMATTING REQUIREMENTS:
1. Use numbered main steps (1., 2., 3., etc.)
2. Include substeps with letters (a., b., c.) when needed
3. Add clear explanations for each step
4. Include practical examples where helpful
5. Use encouraging language throughout
6. Add "💡 Tip:" sections for additional insights
7. Include "⚠️ Common Mistake:" warnings where relevant

STRUCTURE YOUR RESPONSE AS:
📋 **Step-by-Step Guide: [Topic Title]**

🎯 **Overview:** [Brief explanation of what we'll accomplish]

**Step 1: [Main Step Title]**
[Detailed explanation]
a. [Substep if needed]
b. [Another substep if needed]
💡 **Tip:** [Helpful insight]

**Step 2: [Next Main Step]**
[Detailed explanation]
⚠️ **Common Mistake:** [What to avoid]

[Continue with remaining steps...]

🌟 **Summary:** [Brief recap of the key points]
🚀 **Next Steps:** [What to do after mastering this]

ADDITIONAL GUIDELINES:
- Keep each step focused and not overwhelming
- Use simple, clear language appropriate for the difficulty level
- Include real-world applications when possible
- Make it engaging and encouraging
- Ensure steps build logically on each other

${customPrompt ? `\nSPECIAL INSTRUCTIONS: ${customPrompt}` : ''}

Now create the step-by-step guide for "${topic}":`

    console.debug('🔧 Step-by-Step Generation:', {
      topic,
      difficulty,
      temperature,
      studentIntent: studentAnalysis.intent,
      topicTags: topicTags.tags
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: stepByStepPrompt }
      ],
      temperature: temperature,
      max_tokens: 1200 // Allow for comprehensive step-by-step content
    })
    
    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    // Generate adaptive encouragement
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
      response: response,
      stepByStepGuide: response, // Alias for clarity
      followUpEncouragement: followUpEncouragement,
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        respondedAt: new Date().toISOString(),
        generationType: 'step_by_step_guide',
        topicAnalysis: {
          topic,
          studyContext,
          difficulty,
          studentIntent: studentAnalysis.intent,
          topicTags: topicTags.tags,
          primaryTopic: topicTags.primaryTopic,
          temperature,
          promptLength: stepByStepPrompt.length
        },
        responseId: `step_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      }
    })

  } catch (error) {
    console.error('Step-by-step generation error:', error)
    
    let errorMessage = 'Failed to generate step-by-step guide'
    let fallbackMessage = "I'm having trouble creating the step-by-step guide right now. 🔧\n\n**Here's what you can try:**\n• Break down the topic into smaller parts\n• Ask more specific questions\n• Try rephrasing your request\n• Come back in a moment and try again\n\nI'm here to help once the connection is restored! 💪"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to recharge my step-by-step guide generator! ⚡\n\n⏰ **While we wait:**\n• Think about what specific steps you'd like to understand\n• Write down questions about the process\n• Review any related materials\n\n🔄 Try asking again in a moment!"
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: fallbackMessage,
          retryAfter: 10
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
      metadata: {
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: 500 })
  }
}