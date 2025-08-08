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

    // Use the existing flashcard prompt template from ai-agent.ts
    const flashcardPrompt = `You are GPT-3.5 creating intelligent flashcards with advanced learning support capabilities.

FLASHCARD DESIGN PRINCIPLES:
- Use spaced repetition optimization
- Include memory aids and learning techniques
- Support different learning styles
- Create multilingual cards when beneficial
- Use cognitive science for better retention

CONTENT TO PROCESS: ${input}
${topic ? `Topic context: ${topic}` : ''}
${context ? `Additional context: ${context}` : ''}

**IMPORTANT**: If the input contains a specific student learning goal or question (e.g., "I don't understand fractions. Can you teach me with simple examples?"), create flashcards that directly address that specific learning need. Focus on breaking down their exact question into memorable, digestible flashcard pieces.

FLASHCARD CREATION GUIDELINES:

**CARD TYPES TO CREATE:**
1. **Definition Cards**: Key terms and concepts
2. **Process Cards**: Step-by-step procedures
3. **Application Cards**: Real-world usage examples
4. **Connection Cards**: Relationships between ideas
5. **Review Cards**: Quick recall for important facts

**ENHANCED FLASHCARD FORMAT:**

**🎯 CARD 1: [Primary Concept from Content]**
**FRONT:** [Engaging question using active recall]
**BACK:** [Comprehensive answer with memory aids]
- *Core Answer*: [Direct response with content quotes]
- *Memory Hook*: [Mnemonic, analogy, or pattern]
- *Connection*: [Link to related concepts]
- *Study Tip*: [How to remember this effectively]

**🧠 CARD 2: [Application Concept]**
**FRONT:** [Scenario-based question]
**BACK:** [Solution approach with examples]
- *Core Answer*: [Practical application from content]
- *Memory Hook*: [Real-world analogy]
- *Connection*: [How this applies elsewhere]

**📊 CARD 3: [Data/Facts Concept]**
**FRONT:** [Specific factual question]
**BACK:** [Precise information with context]
- *Core Answer*: [Exact facts/numbers from content]
- *Memory Hook*: [Number pattern or association]
- *Connection*: [Why this data matters]

[Continue for 6-8 cards total]

OPTIMIZATION FEATURES:
✓ Each card targets specific cognitive load
✓ Progressive difficulty within card set
✓ Multiple retrieval pathways per concept
✓ Memory activation techniques
✓ Cultural and contextual relevance
✓ Spaced repetition compatibility

Create engaging, educational flashcards that help students memorize and understand the content effectively.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator specializing in creating effective flashcards for student learning.' },
        { role: 'user', content: flashcardPrompt }
      ],
      temperature: 0.6,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    return NextResponse.json({
      success: true,
      flashcards: response,
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        inputContent: input.substring(0, 200) + (input.length > 200 ? '...' : ''),
        topic: topic || 'General',
        responseLength: response.length,
        cardCount: (response.match(/\*\*🎯 CARD|\*\*🧠 CARD|\*\*📊 CARD/g) || []).length
      }
    })

  } catch (error) {
    console.error('Generate flashcards error:', error)
    
    let errorMessage = 'Failed to generate flashcards'
    let fallbackMessage = "I'm having trouble creating flashcards right now. Here are some manual flashcard tips:\n\n🃏 **DIY Flashcard Tips:**\n• Write key terms on one side, definitions on the other\n• Use your own words for better understanding\n• Include examples and mnemonics\n• Review regularly with spaced repetition\n• Test yourself without looking at answers first\n\n💡 I'll be ready to create custom flashcards when the connection is restored!"
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Handle different types of OpenAI errors
      if (error.message.includes('Rate limit') || error.message.includes('429')) {
        statusCode = 429
        fallbackMessage = "I need a moment to prepare your flashcards! 🃏\n\n⏰ **While we wait:**\n• Create your own quick flashcards\n• Write down key terms and concepts\n• Think of memory tricks or mnemonics\n• Review what you want to memorize\n\n🚀 Try asking again in a moment!"
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          fallbackMessage: fallbackMessage,
          metadata: {
            errorType: 'rate_limit',
            errorOccurred: true,
            errorAt: new Date().toISOString(),
            retryAfter: 10
          }
        }, { 
          status: statusCode,
          headers: { 
            'Retry-After': '10',
            'X-RateLimit-Reset': new Date(Date.now() + 10000).toISOString()
          }
        })
      }

      // Handle OpenAI API key issues
      if (error.message.includes('API key') || error.message.includes('Unauthorized') || error.message.includes('401')) {
        statusCode = 401
        fallbackMessage = "🔑 **API Configuration Issue**\n\nThere seems to be an issue with the AI service configuration. Please check that the OpenAI API key is properly set up.\n\n🛠️ **For now, you can:**\n• Create flashcards manually\n• Use the other learning features\n• Try again later when the issue is resolved"
      }

      // Handle network/connection issues
      if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        statusCode = 503
        fallbackMessage = "🌐 **Connection Issue**\n\nThere seems to be a temporary connection problem with the AI service.\n\n🔄 **Please try:**\n• Refreshing the page\n• Trying again in a few moments\n• Checking your internet connection"
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallbackMessage: fallbackMessage,
      metadata: {
        errorType: 'general_error',
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: statusCode })
  }
}