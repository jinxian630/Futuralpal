import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, content, previousQuestions = [] } = await request.json()

    if (!topic || !difficulty || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: topic, difficulty, or content'
      }, { status: 400 })
    }

    // Get previous topics to avoid repetition
    const previousTopics = previousQuestions.map((q: any) => q.topic).join(', ')

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

    const userPrompt = `Generate a single ${difficulty} question about "${topic}" based on this content: "${content}"

**Content Context:** ${content}
**Difficulty Level:** ${difficulty}
**Topic Focus:** ${topic}
${previousTopics ? `**Avoid these previously covered topics:** ${previousTopics}` : ''}

**Requirements:**
- Create either a multiple choice question (with 4 options A-D) or an open-ended question
- Question should test understanding of the core concepts from the content
- Include a detailed explanation that reinforces learning
- Make the question engaging and educational
- Ensure it matches the ${difficulty} difficulty level

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