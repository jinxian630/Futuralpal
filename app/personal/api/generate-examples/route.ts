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

    const examplesPrompt = `You are GPT-3.5, an expert educational content creator specializing in generating clear, practical examples that enhance student understanding.

EXAMPLE CREATION PRINCIPLES:
- Use concrete, relatable examples that students can understand
- Progress from simple to more complex examples
- Include real-world applications when possible
- Show different contexts and variations
- Explain the reasoning behind each example

CONTENT TO CREATE EXAMPLES FOR: ${input}
${topic ? `Topic focus: ${topic}` : ''}
${context ? `Additional context: ${context}` : ''}

EXAMPLE GENERATION GUIDELINES:

**TYPES OF EXAMPLES TO CREATE:**
1. **Basic Examples**: Simple, clear illustrations of core concepts
2. **Real-World Examples**: Practical applications students encounter
3. **Comparative Examples**: Show similarities and differences
4. **Step-by-Step Examples**: Detailed process demonstrations
5. **Problem-Solution Examples**: Common scenarios with solutions

REQUIRED OUTPUT FORMAT:

# 🔍 Examples for Better Understanding

## 📚 Core Concept Examples

### Example 1: Basic Illustration
**Concept:** [The main idea being demonstrated]

**Example:** [Clear, simple example]

**Why this works:** [Explanation of how the example illustrates the concept]

**Key Point:** [Most important takeaway]

---

### Example 2: Real-World Application
**Context:** [Where this applies in real life]

**Example:** [Practical, relatable scenario]

**Connection:** [How this relates to the original concept]

**Why it matters:** [Practical importance]

---

### Example 3: Step-by-Step Process
**Scenario:** [Situation requiring the concept/process]

**Step 1:** [First action with explanation]
**Step 2:** [Second action with reasoning]
**Step 3:** [Final action with outcome]

**Result:** [What this achieves]

**Learning Point:** [What students should remember]

---

### Example 4: Comparative Example
**Comparison:** [What we're comparing - Option A vs Option B]

**Option A Example:** [First approach/scenario]
- Advantages: [Benefits of this approach]
- When to use: [Appropriate situations]

**Option B Example:** [Alternative approach/scenario]  
- Advantages: [Benefits of this approach]
- When to use: [Appropriate situations]

**Key Insight:** [When to choose which approach]

---

### Example 5: Problem-Solution Example
**Problem:** [Common challenge or question students face]

**Given:** [What information/context is provided]

**Solution Process:**
1. [First step in solving]
2. [Second step with reasoning]
3. [Final step to completion]

**Answer:** [Clear solution]

**Why this approach works:** [Explanation of methodology]

---

## 💡 Additional Examples for Practice

### Quick Example A: [Brief scenario]
[Concise illustration with key point]

### Quick Example B: [Different scenario]
[Another angle showing the same concept]

### Quick Example C: [Challenging scenario]
[More complex application for advanced understanding]

## 🎯 How to Use These Examples:
- **Study Strategy:** [How to learn from these examples]
- **Practice Tip:** [How to create similar examples]
- **Remember:** [Key pattern to recognize]

## 🔗 Connecting the Examples:
[Explanation of how all examples relate and what overall pattern they show]

QUALITY STANDARDS:
✓ Examples are concrete and specific
✓ Multiple contexts and applications shown
✓ Clear explanations for each example
✓ Progressive complexity from simple to advanced
✓ Real-world relevance when possible
✓ Connections between examples are clear`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator specializing in generating clear, practical examples that help students understand complex concepts through concrete illustrations.' },
        { role: 'user', content: examplesPrompt }
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
      examples: response,
      response: response, // Include both for compatibility
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        inputContent: input.substring(0, 200) + (input.length > 200 ? '...' : ''),
        topic: topic || 'General',
        responseLength: response.length,
        exampleCount: (response.match(/### Example \d+:|### Quick Example/g) || []).length,
        hasContext: !!context
      }
    })

  } catch (error) {
    console.error('Personal API - Generate examples error:', error)
    
    let errorMessage = 'Failed to generate examples'
    let fallbackMessage = "I'm having trouble creating examples right now. Here are some manual example tips:\n\n🔍 **DIY Example Creation:**\n• Think of real-world situations\n• Use familiar analogies\n• Start simple, then add complexity\n• Compare different scenarios\n• Show step-by-step processes\n\n💡 I'll be ready to create custom examples when the connection is restored!"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to prepare your examples! 🔍\n\n⏰ **While we wait:**\n• Think of real-world applications\n• Consider different scenarios\n• Create your own simple examples\n• Look for patterns and connections\n\n🚀 Try asking again in a moment!"
        
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
        fallbackMessage = "🔑 **API Configuration Issue**\n\nThere seems to be an issue with the AI service configuration. Please check that the OpenAI API key is properly set up.\n\n🛠️ **For now, you can:**\n• Create examples manually\n• Use the other learning features\n• Try again later when the issue is resolved"
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