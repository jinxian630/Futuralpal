import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/ai-agent'
import { openRouterClient } from '@/lib/openrouter-client'

interface Question {
  id: string
  type: 'mcq' | 'open-ended'
  question: string
  correctAnswer?: string
  options?: string[]
  explanation?: string
  idealAnswer?: string
}

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, studentContext } = await request.json()

    if (!question || !userAnswer) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: question and userAnswer'
      }, { status: 400 })
    }

    let feedback: any = {}
    let isCorrect = false

    if (question.type === 'mcq') {
      // Handle Multiple Choice Questions
      const userChoice = userAnswer.toUpperCase()
      const correctChoice = question.correctAnswer?.toUpperCase()
      
      isCorrect = userChoice === correctChoice

      if (isCorrect) {
        const correctPrompt = PROMPTS.MCQ_CORRECT_FEEDBACK
          .replace('{{CORRECT_ANSWER}}', `${correctChoice}) ${question.options?.[correctChoice.charCodeAt(0) - 65] || 'N/A'}`)
          .replace('{{EXPLANATION}}', question.explanation || 'Well done!')

        feedback = {
          isCorrect: true,
          rating: 5,
          encouragement: correctPrompt,
          explanation: question.explanation || 'Great job!',
          studyTip: 'Keep practicing with similar questions to reinforce your understanding!',
          confidenceBoost: 'You\'re mastering this topic! 🌟'
        }
      } else {
        // Generate study tip using AI for incorrect MCQ answers
        const studyTipPrompt = `The student chose option ${userChoice} for this question, but the correct answer is ${correctChoice}. 
        
Question: ${question.question}
Correct Answer: ${correctChoice}) ${question.options?.[correctChoice.charCodeAt(0) - 65] || 'N/A'}
Student's Choice: ${userChoice}) ${question.options?.[userChoice.charCodeAt(0) - 65] || 'N/A'}

Provide a brief, encouraging study tip to help them understand why ${correctChoice} is correct and how to avoid this mistake in the future.`

        const studyTipResult = await openRouterClient.generateResponse({
          prompt: studyTipPrompt,
          systemPrompt: 'You are DeepSeek V3, a supportive AI tutor. Provide an encouraging, brief study tip that helps the student learn from their mistake.',
          options: {
            temperature: 0.3,
            top_p: 0.8,
            max_tokens: 200
          }
        })

        const studyTip = studyTipResult.success ? 
          studyTipResult.data?.response || 'Review the concept and try again!' : 
          'Review the concept and try again!'

        const incorrectPrompt = PROMPTS.MCQ_INCORRECT_FEEDBACK
          .replace('{{CORRECT_ANSWER}}', `${correctChoice}) ${question.options?.[correctChoice.charCodeAt(0) - 65] || 'N/A'}`)
          .replace('{{EXPLANATION}}', question.explanation || 'Keep learning!')
          .replace('{{STUDY_TIP}}', studyTip)

        feedback = {
          isCorrect: false,
          rating: 2,
          encouragement: incorrectPrompt,
          explanation: question.explanation || 'Keep learning!',
          studyTip: studyTip,
          confidenceBoost: 'Every mistake is a step toward mastery! 💪'
        }
      }
    } else {
      // Handle Open-ended Questions using AI
      const difficultyLevel = studentContext?.difficulty || 'medium'
      
      const evaluationPrompt = `You are DeepSeek V3, an expert educational assessor. Evaluate this student's answer to an open-ended question.

QUESTION: ${question.question}

IDEAL ANSWER (for reference): ${question.idealAnswer || 'Not provided'}

STUDENT'S ANSWER: ${userAnswer}

DIFFICULTY LEVEL: ${difficultyLevel}

Please provide a comprehensive evaluation with:

1. RATING (1-5 stars): Based on accuracy, depth, and understanding
2. CORRECTNESS: Is the answer generally correct? (true/false)
3. STRENGTHS: What did the student do well?
4. IMPROVEMENTS: What specific areas need work?
5. STUDY_TIP: One actionable tip for improvement
6. PRAISE: Encouraging feedback focused on effort and learning
7. CONFIDENCE_BOOST: Motivational message

Format your response as:
RATING: [1-5]
CORRECTNESS: [true/false]
STRENGTHS: [specific strengths]
IMPROVEMENTS: [areas to improve]
STUDY_TIP: [actionable advice]
PRAISE: [encouraging feedback]
CONFIDENCE_BOOST: [motivational message]`

      const evaluationResult = await openRouterClient.generateResponse({
        prompt: evaluationPrompt,
        systemPrompt: 'You are DeepSeek V3, an expert educational assessor. Provide fair, constructive feedback that encourages learning.',
        options: {
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 800
        }
      })

      if (evaluationResult.success && evaluationResult.data?.response) {
        const response = evaluationResult.data.response
        
        // Parse the structured response
        const ratingMatch = response.match(/RATING:\s*(\d)/i)
        const correctnessMatch = response.match(/CORRECTNESS:\s*(true|false)/i)
        const strengthsMatch = response.match(/STRENGTHS:\s*([\s\S]+?)(?=\nIMPROVEMENTS:|$)/i)
        const improvementsMatch = response.match(/IMPROVEMENTS:\s*([\s\S]+?)(?=\nSTUDY_TIP:|$)/i)
        const studyTipMatch = response.match(/STUDY_TIP:\s*([\s\S]+?)(?=\nPRAISE:|$)/i)
        const praiseMatch = response.match(/PRAISE:\s*([\s\S]+?)(?=\nCONFIDENCE_BOOST:|$)/i)
        const confidenceMatch = response.match(/CONFIDENCE_BOOST:\s*([\s\S]+?)$/i)

        const rating = ratingMatch ? parseInt(ratingMatch[1]) : 3
        isCorrect = correctnessMatch ? correctnessMatch[1].toLowerCase() === 'true' : rating >= 3

        const feedbackTemplate = PROMPTS.OPEN_ENDED_FEEDBACK
          .replace('{{RATING}}', rating.toString())
          .replace('{{PRAISE}}', praiseMatch?.[1]?.trim() || 'Good effort!')
          .replace('{{STRENGTHS}}', strengthsMatch?.[1]?.trim() || 'Your answer shows understanding.')
          .replace('{{IMPROVEMENTS}}', improvementsMatch?.[1]?.trim() || 'Keep practicing!')
          .replace('{{STUDY_TIP}}', studyTipMatch?.[1]?.trim() || 'Review the key concepts.')
          .replace('{{CONFIDENCE_BOOST}}', confidenceMatch?.[1]?.trim() || 'Keep up the great work!')

        feedback = {
          isCorrect: isCorrect,
          rating: rating,
          encouragement: feedbackTemplate,
          explanation: question.explanation || 'Well done!',
          studyTip: studyTipMatch?.[1]?.trim() || 'Review the key concepts.',
          confidenceBoost: confidenceMatch?.[1]?.trim() || 'Keep up the great work!'
        }
      } else {
        // Fallback if AI evaluation fails
        feedback = {
          isCorrect: true,
          rating: 3,
          encouragement: 'Thank you for your thoughtful answer!',
          explanation: 'Your response shows good understanding.',
          studyTip: 'Continue exploring this topic in depth.',
          confidenceBoost: 'You\'re making great progress! 🌟'
        }
      }
    }

    // Generate performance message
    const performanceMessages = {
      excellent: "🏆 Outstanding work! You're truly mastering this material!",
      good: "✨ Great job! You're building solid understanding!",
      average: "📚 Good effort! Keep practicing to strengthen your knowledge!",
      needsWork: "💪 You're learning! Review the concepts and try again!"
    }

    let performanceLevel = 'needsWork'
    if (feedback.rating >= 4) performanceLevel = 'excellent'
    else if (feedback.rating >= 3) performanceLevel = 'good'
    else if (feedback.rating >= 2) performanceLevel = 'average'

    const performanceMessage = performanceMessages[performanceLevel as keyof typeof performanceMessages]

    // Suggest next steps
    const nextSteps = isCorrect ? 
      "🚀 Ready for the next challenge? Try a question at the next difficulty level!" :
      "📖 Take some time to review the concept, then try another question to reinforce your learning!"

    return NextResponse.json({
      success: true,
      feedback: feedback,
      performanceMessage: performanceMessage,
      nextSteps: nextSteps,
      metadata: {
        model: 'DeepSeek V3',
        provider: 'OpenRouter',
        evaluatedAt: new Date().toISOString(),
        questionType: question.type
      }
    })

  } catch (error) {
    console.error('Answer checking error:', error)
    
    let errorMessage = 'Failed to check answer'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        errorDetails = 'Please check your internet connection and try again.'
      } else if (error.message.includes('Authentication failed')) {
        errorDetails = 'API authentication issue. Please contact support.'
      } else if (error.message.includes('Rate limit')) {
        errorDetails = 'Rate limit exceeded. Please wait a moment and try again.'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      // Provide fallback feedback
      feedback: {
        isCorrect: false,
        rating: 1,
        encouragement: 'Unable to evaluate your answer due to a technical issue. Please try again.',
        explanation: 'Technical error occurred',
        studyTip: 'Please try submitting your answer again.',
        confidenceBoost: 'Don\'t worry about technical issues - keep learning! 💪'
      }
    }, { status: 500 })
  }
} 