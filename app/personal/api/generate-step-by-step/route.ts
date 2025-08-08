import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { topic, studyContext, customPrompt, difficulty = 'medium' } = await request.json()

    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: topic'
      }, { status: 400 })
    }

    const stepByStepPrompt = `You are GPT-3.5, an expert educational instructor specializing in creating comprehensive step-by-step learning guides.

INSTRUCTIONAL DESIGN PRINCIPLES:
- Break complex topics into digestible steps
- Use scaffolding to build understanding progressively
- Include practical examples and applications
- Provide checkpoints for self-assessment
- Adapt complexity to student level

TOPIC TO EXPLAIN: ${topic}
DIFFICULTY LEVEL: ${difficulty}
${studyContext ? `Study Context: ${studyContext}` : ''}
${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

STEP-BY-STEP GUIDE FRAMEWORK:

**DIFFICULTY ADAPTATION:**

**FOR EASY LEVEL:**
- Use simple language and basic concepts
- Provide more examples and analogies
- Include frequent comprehension checks
- Break steps into smaller sub-steps

**FOR MEDIUM LEVEL:**
- Balance theory with practical application
- Introduce intermediate concepts gradually
- Connect to related topics
- Include problem-solving exercises

**FOR HARD LEVEL:**
- Assume foundational knowledge
- Focus on complex relationships
- Include advanced applications
- Challenge critical thinking

REQUIRED OUTPUT FORMAT:

# 📚 Step-by-Step Guide: ${topic}

## 🎯 Learning Objectives
By completing this guide, you will be able to:
- [Objective 1 based on difficulty level]
- [Objective 2 based on difficulty level]
- [Objective 3 based on difficulty level]

## 📋 Prerequisites
**You should already know:**
- [Required background knowledge]
- [Basic concepts needed]

## 🚀 Step-by-Step Process

### Step 1: [Foundation/Introduction]
**What we're doing:** [Clear explanation of this step]

**Why it matters:** [Importance and context]

**How to do it:**
1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]

**💡 Key Point:** [Most important takeaway]

**✅ Check Yourself:** [Quick self-assessment question]

---

### Step 2: [Building Understanding]
**What we're doing:** [Clear explanation]

**Connection to Step 1:** [How this builds on previous learning]

**How to do it:**
1. [Detailed instruction]
2. [Practical example]
3. [Common pitfall to avoid]

**🎯 Example:** [Real-world or concrete example]

**✅ Check Yourself:** [Practice opportunity]

---

### Step 3: [Application/Practice]
**What we're doing:** [Explanation of application step]

**Why this is crucial:** [Importance for mastery]

**How to do it:**
1. [Application method 1]
2. [Practice technique]
3. [Troubleshooting tip]

**🔧 Practice Exercise:** [Hands-on activity]

**✅ Check Yourself:** [Assessment question]

---

[Continue for 4-6 total steps based on topic complexity]

## 🎯 Summary & Next Steps

### Key Takeaways:
- [Main concept 1]
- [Main concept 2]
- [Main concept 3]

### What to Practice:
- [Practice recommendation 1]
- [Practice recommendation 2]

### Ready for More?
- [Advanced topic to explore next]
- [Related concepts to study]

## 💡 Study Tips for This Topic:
- [Specific study strategy 1]
- [Memory technique for key concepts]
- [Common mistakes to avoid]

INSTRUCTIONAL QUALITY STANDARDS:
✓ Clear progression from basic to advanced concepts
✓ Multiple examples and practical applications
✓ Regular self-assessment opportunities
✓ Connections between steps are explicit
✓ Language appropriate for difficulty level
✓ Actionable and specific instructions`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert educational instructor specializing in creating clear, comprehensive step-by-step learning guides that help students master complex topics progressively.' },
        { role: 'user', content: stepByStepPrompt }
      ],
      temperature: 0.6,
      max_tokens: 3000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    return NextResponse.json({
      success: true,
      stepByStepGuide: response,
      response: response, // Include both for compatibility
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        topic: topic,
        difficulty: difficulty,
        responseLength: response.length,
        stepCount: (response.match(/### Step \d+:/g) || []).length,
        hasCustomPrompt: !!customPrompt,
        hasStudyContext: !!studyContext
      }
    })

  } catch (error) {
    console.error('Personal API - Generate step-by-step guide error:', error)
    
    let errorMessage = 'Failed to generate step-by-step guide'
    let fallbackMessage = `I'm having trouble creating a step-by-step guide right now. Here's a manual approach for learning ${topic}:\n\n📋 **DIY Step-by-Step Learning:**\n• Break the topic into smaller parts\n• Start with basics and build up\n• Practice each step before moving on\n• Use examples and analogies\n• Test your understanding regularly\n\n💡 I'll be ready to create a detailed guide when the connection is restored!`
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Rate limit')) {
        fallbackMessage = "I need a moment to prepare your step-by-step guide! 📋\n\n⏰ **While we wait:**\n• Outline what you want to learn\n• Think about the logical order of concepts\n• Consider what examples would help\n• Identify any prerequisites\n\n🚀 Try asking again in a moment!"
        
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
        fallbackMessage = "🔑 **API Configuration Issue**\n\nThere seems to be an issue with the AI service configuration. Please check that the OpenAI API key is properly set up.\n\n🛠️ **For now, you can:**\n• Create step-by-step guides manually\n• Use the other learning features\n• Try again later when the issue is resolved"
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