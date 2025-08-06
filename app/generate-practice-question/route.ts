import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { input, topic, context, difficulty = 'medium', questionCount = 5 } = await request.json()

    if (!input) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: input'
      }, { status: 400 })
    }

    // Enhanced prompt for generating practice questions
    const systemPrompt = `You are an expert educational assessment creator who generates high-quality practice questions to help students learn and test their knowledge.

QUESTION DESIGN PRINCIPLES:
- Create questions that test understanding, not just memorization
- Include a mix of question types (multiple choice, short answer, analytical)
- Provide comprehensive answers with explanations
- Design questions that build upon each other
- Ensure questions are appropriately challenging for the difficulty level

DIFFICULTY GUIDELINES:
- **Easy**: Basic recall and recognition, simple application
- **Medium**: Comprehension, analysis, connecting concepts
- **Hard**: Synthesis, evaluation, complex problem-solving

For each question, provide:
1. **Question**: Clear, well-constructed question
2. **Answer**: Complete answer with explanation
3. **Learning Objective**: What skill/knowledge this tests
4. **Difficulty Rationale**: Why this is at the specified difficulty level`

    const userPrompt = `Generate ${questionCount} practice questions based on this content: "${input}"

**Content Details:**
${topic ? `Topic: ${topic}` : ''}
${context ? `Context: ${context}` : ''}
**Difficulty Level:** ${difficulty}

**IMPORTANT**: If the input contains a specific student learning goal or question (e.g., "I don't understand fractions. Can you teach me with simple examples?"), create questions that directly test their understanding of that specific learning objective. Focus on their original request rather than generating generic questions.

**Requirements:**
- Create questions that directly address the student's specific learning objective
- Create a variety of question types (multiple choice, short answer, analytical)
- Questions should test different aspects of their specific learning goal
- Include detailed answers and explanations that reinforce their original question
- Make questions progressively build understanding of their specific request
- Ensure questions are engaging and educational

**Format for each question:**

**📝 QUESTION [X]: [Question Type]**
**Question:** [The actual question]
**Options:** [If multiple choice - A) B) C) D)]
**Answer:** [Complete answer with reasoning]
**Explanation:** [Why this answer is correct and what it teaches]
**Learning Focus:** [What skill/concept this tests]

Create questions that help students truly understand and apply the concepts, not just memorize facts.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    // Count generated questions
    const questionMatches = response.match(/\*\*📝 QUESTION/g) || []
    const actualQuestionCount = questionMatches.length

    return NextResponse.json({
      success: true,
      practiceQuestions: response,
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        inputContent: input.substring(0, 200) + (input.length > 200 ? '...' : ''),
        topic: topic || 'General',
        difficulty: difficulty,
        requestedQuestions: questionCount,
        actualQuestions: actualQuestionCount,
        responseLength: response.length
      }
    })

  } catch (error) {
    console.error('Generate practice questions error:', error)
    
    let errorMessage = 'Failed to generate practice questions'
    let fallbackMessage = "I'm having trouble creating practice questions right now. Here are some self-study tips:\n\n📝 **DIY Practice Questions:**\n• Turn key concepts into 'what', 'why', and 'how' questions\n• Create scenarios: 'What would happen if...?'\n• Make comparison questions: 'How is X different from Y?'\n• Practice explaining concepts to others\n• Test yourself without looking at notes first\n\n💡 I'll be ready to create custom questions when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to prepare your practice questions! 📝\n\n⏰ **While we wait:**\n• Write your own test questions\n• Think of real-world applications\n• Create 'what if' scenarios\n• Review and question what you've learned\n\n🚀 Try asking again in a moment!"
        
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