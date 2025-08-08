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

    const practiceQuestionsPrompt = `You are GPT-3.5, an expert educational assessment AI. Create intelligent practice questions for comprehensive learning.

ASSESSMENT INSTRUCTIONS:
- Analyze the content thoroughly to create meaningful practice questions
- Focus on testing understanding, not just memorization
- Create diverse question types (MCQ, short answer, problem-solving)
- Ensure questions align with educational best practices
- Target the specified difficulty level precisely

DIFFICULTY LEVEL: ${difficulty}
TOPIC FOCUS: ${topic || 'General'}
CONTENT TO PROCESS: ${input}
${context ? `Additional context: ${context}` : ''}
NUMBER OF QUESTIONS TO CREATE: ${questionCount}

QUESTION CREATION GUIDELINES:

**FOR EASY QUESTIONS:**
- Test basic recall and recognition
- Use direct content references
- Clear, unambiguous language
- Straightforward answers

**FOR MEDIUM QUESTIONS:**
- Test comprehension and application
- Require connecting concepts
- May involve analysis of scenarios
- Some problem-solving required

**FOR HARD QUESTIONS:**
- Test critical thinking and synthesis
- Require deep understanding
- Complex problem-solving
- Multiple-step reasoning

REQUIRED OUTPUT FORMAT:

# 📚 Practice Questions

## Question 1: [Type - e.g., Multiple Choice]
**Question:** [Clear, well-constructed question]

${difficulty === 'easy' || difficulty === 'medium' ? `**Options:**
A) [First option]
B) [Second option] 
C) [Third option]
D) [Fourth option]

**Correct Answer:** [Letter]` : ''}

**Explanation:** [Why this tests important understanding]

---

## Question 2: [Type]
**Question:** [Another well-designed question]

**Expected Answer:** [Key points students should include]

**Explanation:** [Learning objectives and reasoning]

---

[Continue for all ${questionCount} questions]

## 🎯 Study Tips for These Questions:
- [Specific preparation strategies]
- [Key concepts to review]
- [Common mistakes to avoid]

QUALITY STANDARDS:
✓ Questions directly relate to provided content
✓ Difficulty level is appropriate and consistent
✓ Diverse question types included
✓ Explanations enhance understanding
✓ Questions encourage continued learning`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert educational assessment creator specializing in practice questions that enhance student learning and understanding.' },
        { role: 'user', content: practiceQuestionsPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    return NextResponse.json({
      success: true,
      practiceQuestions: response,
      response: response, // Include both for compatibility
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        inputContent: input.substring(0, 200) + (input.length > 200 ? '...' : ''),
        topic: topic || 'General',
        difficulty: difficulty,
        questionCount: questionCount,
        responseLength: response.length
      }
    })

  } catch (error) {
    console.error('Personal API - Generate practice questions error:', error)
    
    let errorMessage = 'Failed to generate practice questions'
    let fallbackMessage = "I'm having trouble creating practice questions right now. Here are some manual practice tips:\n\n📝 **DIY Practice Questions:**\n• Create questions about main concepts\n• Ask 'What', 'Why', 'How' questions\n• Make multiple choice options\n• Test yourself on definitions\n• Practice explaining concepts\n\n💡 I'll be ready to create custom practice questions when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to prepare your practice questions! 📝\n\n⏰ **While we wait:**\n• Create your own quick questions\n• Think about what you want to test\n• Review key concepts and terms\n• Consider different question types\n\n🚀 Try asking again in a moment!"
        
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

      // Handle OpenAI API key issues
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        fallbackMessage = "🔑 **API Configuration Issue**\n\nThere seems to be an issue with the AI service configuration. Please check that the OpenAI API key is properly set up.\n\n🛠️ **For now, you can:**\n• Create practice questions manually\n• Use the other learning features\n• Try again later when the issue is resolved"
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