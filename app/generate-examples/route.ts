import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { input, topic, context } = await request.json()

    if (!input) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: input'
      }, { status: 400 })
    }

    // Enhanced prompt for generating examples
    const systemPrompt = `You are an expert AI teacher who specializes in providing clear, detailed examples to help students understand difficult concepts.

TEACHING APPROACH:
- Provide multiple diverse examples that illustrate the concept from different angles
- Use real-world applications and relatable scenarios
- Start with simple examples and progressively build complexity
- Include step-by-step explanations where appropriate
- Make connections between examples to reinforce understanding

EXAMPLE STRUCTURE:
For each example, provide:
1. **Context**: Brief setup or scenario
2. **Application**: How the concept applies
3. **Explanation**: Why this example works
4. **Connection**: How it relates to other examples or broader concepts

Always aim to make learning engaging and memorable through practical, relatable examples.`

    const userPrompt = `Please provide detailed, clear examples to help students understand this concept: "${input}"

${topic ? `Topic context: ${topic}` : ''}
${context ? `Additional context: ${context}` : ''}

**IMPORTANT**: If the input contains a specific student learning goal or question (e.g., "I don't understand fractions"), tailor your examples specifically to address that exact learning need. Focus on the student's original request rather than providing generic examples.

Generate 3-5 diverse examples that:
- Directly address the student's specific learning objective or question
- Illustrate different aspects of the concept mentioned in their request
- Range from basic to more advanced applications appropriate to their level
- Include real-world scenarios that connect to their learning goal
- Help students build intuitive understanding of their specific question

Format your response with clear headings and explanations for each example.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    return NextResponse.json({
      success: true,
      examples: response,
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        inputConcept: input,
        topic: topic || 'General',
        responseLength: response.length
      }
    })

  } catch (error) {
    console.error('Generate examples error:', error)
    
    let errorMessage = 'Failed to generate examples'
    let fallbackMessage = "I'm having trouble generating examples right now. Here are some general tips:\n\n• Try breaking down the concept into smaller parts\n• Look for patterns or connections to things you already know\n• Practice with simple cases first\n• Ask specific questions about what confuses you\n\nI'll be ready to help when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to gather more examples! ⚡\n\n⏰ **While we wait:**\n• Think of your own examples\n• Review what you already understand\n• Consider real-world applications\n• Try explaining the concept to someone else\n\n🚀 Try asking again in a moment!"
        
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