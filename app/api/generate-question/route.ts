import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      difficulty, 
      content, 
      previousQuestions = [], 
      studentSession,
      forceGenerate = false 
    } = await request.json()

    if (!topic || !difficulty || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: topic, difficulty, or content'
      }, { status: 400 })
    }

    // 🛑 STEP 1: Check if student needs to answer current question first
    if (!forceGenerate && studentSession) {
      if (studentSession.currentQuestionId && !studentSession.currentQuestionAnswered) {
        return NextResponse.json({
          success: false,
          blocked: true,
          error: '🛑 Please answer the current question before requesting a new one!',
          message: "I notice you haven't answered the current question yet. Let's complete that first to build on your learning progress!",
          currentQuestionId: studentSession.currentQuestionId,
          metadata: {
            blockReason: 'unanswered_question',
            blockedAt: new Date().toISOString()
          }
        }, { status: 409 }) // 409 Conflict - indicates the request conflicts with current state
      }
    }

    // Get previous topics to avoid repetition
    const previousTopics = previousQuestions.map((q: any) => q.topic).join(', ')

    // 🎯 STEP 2: Context-Aware Question Generation
    let contextualPromptAddition = ''
    let adaptedDifficulty = difficulty

    if (studentSession?.previousAnswers && studentSession.previousAnswers.length > 0) {
      // Calculate performance statistics
      const topicStats = calculateTopicPerformance(studentSession.previousAnswers)
      const overallAccuracy = studentSession.previousAnswers.filter((a: any) => a.isCorrect).length / studentSession.previousAnswers.length
      
      // Find weakest topics for focused learning
      const weakestTopics = Object.entries(topicStats)
        .filter(([_, stats]) => stats.accuracy < 0.6)
        .sort((a, b) => (a[1] as any).accuracy - (b[1] as any).accuracy)
        .slice(0, 3)
        .map(([topic, _]) => topic)

      // Find strongest topics
      const strongestTopics = Object.entries(topicStats)
        .filter(([_, stats]) => stats.accuracy > 0.8 && stats.questionCount >= 2)
        .map(([topic, _]) => topic)

      // Adaptive difficulty based on recent performance
      if (overallAccuracy > 0.8 && difficulty === 'easy') {
        adaptedDifficulty = 'medium'
      } else if (overallAccuracy < 0.4 && difficulty === 'hard') {
        adaptedDifficulty = 'medium'
      }

      // Create contextual guidance for question generation
      contextualPromptAddition = `

**CONTEXTUAL LEARNING ADAPTATION:**
- Student Overall Accuracy: ${(overallAccuracy * 100).toFixed(1)}%
- Total Questions Answered: ${studentSession.previousAnswers.length}
${weakestTopics.length > 0 ? `- Areas Needing Focus: ${weakestTopics.join(', ')}` : ''}
${strongestTopics.length > 0 ? `- Strong Areas: ${strongestTopics.join(', ')}` : ''}
${adaptedDifficulty !== difficulty ? `- Difficulty Adapted: ${difficulty} → ${adaptedDifficulty} (based on performance)` : ''}

**GENERATION PRIORITY:**
${weakestTopics.includes(topic) ? 
  '- HIGH PRIORITY: This topic needs reinforcement. Create a supportive question that builds confidence.' :
  '- STANDARD: Create an engaging question that maintains learning momentum.'
}

Please tailor the question complexity and explanation style based on these insights.`
    }

    // Enhanced prompt for generating a single question
    const systemPrompt = `You are an expert educational assessment creator who generates high-quality individual questions to help students learn and test their knowledge.

QUESTION DESIGN PRINCIPLES:
- Create questions that test understanding, not just memorization
- Choose between multiple choice (MCQ) or open-ended based on the content
- Provide comprehensive explanations that teach concepts
- Ensure questions are appropriately challenging for the difficulty level
- Make questions engaging and educational

DIFFICULTY GUIDELINES:
- **Easy**: Basic recall and recognition, simple application
- **Medium**: Comprehension, analysis, connecting concepts
- **Hard**: Synthesis, evaluation, complex problem-solving

RESPONSE FORMAT:
You must respond with a JSON object containing:
- id: unique identifier
- type: "mcq" or "open-ended"
- difficulty: the specified difficulty level
- topic: the question topic
- question: the actual question text
- options: array of 4 options (only for MCQ)
- correctAnswer: correct option letter (only for MCQ)
- explanation: detailed explanation of the answer
- idealAnswer: comprehensive answer (only for open-ended)`

    // Extract user's original learning prompt and topic from the content
    const extractUserLearningGoal = (content: string) => {
      // Look for patterns that indicate what the user wants to learn
      const patterns = [
        /Student's original learning goal: "([^"]+)"/i,
        /User wants to learn about: ([^\n\.]+)/i,
        /Learning about: ([^\n\.]+)/i,
        /I want to (?:learn|understand|study) ([^\n\.]+)/i,
        /Help me (?:with|understand|learn) ([^\n\.]+)/i,
        /(?:Explain|Teach me|Tell me about) ([^\n\.]+)/i
      ]
      
      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match && match[1]) {
          return match[1].trim()
        }
      }
      return null
    }

    const userLearningGoal = extractUserLearningGoal(content)
    const effectiveTopic = userLearningGoal || topic
    
    const userPrompt = `Generate a single ${adaptedDifficulty} MCQ question that directly helps the user learn what they specifically requested.

**STUDENT'S LEARNING REQUEST:** ${userLearningGoal ? `"${userLearningGoal}"` : `Learning about ${topic}`}
**CONTENT CONTEXT:** ${content}
**DIFFICULTY LEVEL:** ${adaptedDifficulty}${adaptedDifficulty !== difficulty ? ` (adapted from ${difficulty})` : ''}
**TOPIC FOCUS:** ${effectiveTopic}
${previousTopics ? `**AVOID THESE COVERED TOPICS:** ${previousTopics}` : ''}
${contextualPromptAddition}

**CRITICAL REQUIREMENTS:**
- Question MUST be directly relevant to what the student wants to learn: "${userLearningGoal || topic}"
- Create an engaging multiple choice question (4 options A-D) that tests understanding
- Ensure the question helps achieve the student's specific learning goal
- Make it appropriate for ${adaptedDifficulty} difficulty level

**ADDITIONAL GUIDELINES:**
- Include a detailed explanation that connects to the student's learning goal
- Make the question engaging and directly relevant to their interests
- Focus on practical understanding of the concepts they want to learn

**CRITICAL: Return ONLY valid JSON. Example format:**

For MCQ:
{
  "id": "q_unique_id",
  "type": "mcq", 
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "A",
  "explanation": "Detailed explanation here"
}

For open-ended:
{
  "id": "q_unique_id",
  "type": "open-ended",
  "difficulty": "${difficulty}", 
  "topic": "${topic}",
  "question": "Your question here?",
  "explanation": "What to look for in a good answer",
  "idealAnswer": "Comprehensive model answer"
}

Return ONLY the JSON object, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    // Parse the JSON response
    let questionData
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = response.trim()
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Remove any leading/trailing text and try to extract JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0]
      }
      
      questionData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse question JSON:', response)
      console.error('Parse error:', parseError)
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }

    // Validate the question data structure
    if (!questionData.id || !questionData.type || !questionData.question) {
      throw new Error('Invalid question structure returned by AI')
    }

    // Generate a unique ID if not provided
    if (!questionData.id || questionData.id === 'unique_id_here') {
      questionData.id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    }

    return NextResponse.json({
      success: true,
      question: questionData,
      encouragement: getEncouragementMessage(difficulty),
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        topic: topic,
        difficulty: difficulty,
        questionType: questionData.type,
        contentLength: content.length,
        previousQuestionsCount: previousQuestions.length
      }
    })

  } catch (error) {
    console.error('Generate question error:', error)
    
    let errorMessage = 'Failed to generate question'
    let fallbackMessage = "I'm having trouble creating a question right now. Here are some study tips:\n\n🎯 **While we wait:**\n• Review the key concepts\n• Try explaining the topic to yourself\n• Think of real-world examples\n• Create your own practice questions\n\n💡 I'll be ready to generate questions when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to prepare your question! 🎯\n\n⏰ **While we wait:**\n• Review the content\n• Think about what you'd like to be tested on\n• Consider different question types\n• Practice active recall\n\n🚀 Try asking again in a moment!"
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: fallbackMessage,
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
      metadata: {
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// Helper function to get encouraging messages based on difficulty
function getEncouragementMessage(difficulty: string): string {
  const messages = {
    easy: [
      "🌟 Great start! This question will help build your foundation!",
      "🎯 Perfect for building confidence! You've got this!",
      "💪 Nice and manageable - let's see what you know!"
    ],
    medium: [
      "🧠 Time to level up! This will test your understanding!",
      "⚡ A good challenge awaits - show what you've learned!",
      "🎖️ Ready for something more interesting? Let's go!"
    ],
    hard: [
      "🚀 Challenge accepted! This will really make you think!",
      "🔥 High-level thinking time - you're ready for this!",
      "💎 Expert-level question coming up - give it your best shot!"
    ]
  }
  
  const difficultyMessages = messages[difficulty as keyof typeof messages] || messages.medium
  return difficultyMessages[Math.floor(Math.random() * difficultyMessages.length)]
}

// Helper function to calculate topic performance statistics
function calculateTopicPerformance(previousAnswers: Array<{
  questionId: string
  isCorrect: boolean
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  timestamp: string
  responseTime: number
  attempts: number
}>): Record<string, { accuracy: number; questionCount: number; averageTime: number }> {
  const topicStats: Record<string, { 
    correct: number; 
    total: number; 
    totalTime: number; 
    accuracy: number; 
    questionCount: number; 
    averageTime: number 
  }> = {}

  // Calculate raw statistics
  previousAnswers.forEach(answer => {
    if (!topicStats[answer.topic]) {
      topicStats[answer.topic] = {
        correct: 0,
        total: 0,
        totalTime: 0,
        accuracy: 0,
        questionCount: 0,
        averageTime: 0
      }
    }

    const stats = topicStats[answer.topic]
    stats.total++
    stats.totalTime += answer.responseTime
    if (answer.isCorrect) {
      stats.correct++
    }
  })

  // Calculate derived metrics
  Object.values(topicStats).forEach(stats => {
    stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0
    stats.questionCount = stats.total
    stats.averageTime = stats.total > 0 ? stats.totalTime / stats.total : 0
  })

  return topicStats as Record<string, { accuracy: number; questionCount: number; averageTime: number }>
}