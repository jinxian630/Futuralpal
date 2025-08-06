import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const { 
      question, 
      userAnswer, 
      studentContext,
      studentSession,
      responseStartTime 
    } = await request.json()

    if (!question || !userAnswer) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: question or userAnswer'
      }, { status: 400 })
    }

    // Extract context information
    const difficulty = studentContext?.difficulty || 'medium'
    const originalLearningGoal = studentContext?.originalLearningGoal || ''
    const questionType = question.type || 'mcq'

    // For MCQ questions, do simple correctness check first
    let isCorrectMCQ = false
    if (questionType === 'mcq' && question.correctAnswer) {
      isCorrectMCQ = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
    }

    // Enhanced AI prompt for intelligent feedback
    const systemPrompt = `You are an expert educational AI tutor providing personalized feedback on student answers.

CONTEXT:
- Question Type: ${questionType}
- Difficulty Level: ${difficulty}
- Student's Learning Goal: ${originalLearningGoal || 'General learning'}

FEEDBACK FRAMEWORK:
Your response must be a JSON object with this exact structure:
{
  "rating": <1-5 number>,
  "isCorrect": <true/false boolean>,
  "encouragement": "<motivational message>",
  "explanation": "<detailed explanation>",
  "studyTip": "<specific study advice>",
  "confidenceBoost": "<confidence building message>"
}

GUIDELINES:
- Be encouraging and supportive regardless of correctness
- Reference their original learning goal when possible
- Provide specific, actionable study tips
- Use a warm, patient teaching tone
- Rate based on understanding demonstrated (1-5 scale)
- For MCQ: focus on why the correct answer is right
- For open-ended: evaluate completeness, accuracy, and understanding`

    const userPrompt = `Please evaluate this student's answer and provide detailed feedback.

**QUESTION:** ${question.question}

${questionType === 'mcq' ? `**OPTIONS:** ${question.options?.join(', ')}
**CORRECT ANSWER:** ${question.correctAnswer}` : ''}

**STUDENT'S ANSWER:** ${userAnswer}

${question.explanation ? `**REFERENCE EXPLANATION:** ${question.explanation}` : ''}

${originalLearningGoal ? `**STUDENT'S LEARNING CONTEXT:** The student originally asked: "${originalLearningGoal}"` : ''}

Please provide comprehensive feedback that:
1. ${questionType === 'mcq' ? `Acknowledges their choice and explains why "${question.correctAnswer}" is correct` : 'Evaluates the completeness and accuracy of their response'}
2. Connects back to their learning goal if provided
3. Offers specific study suggestions for this topic
4. Builds their confidence for continued learning

Return ONLY the JSON object, no additional text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI API error: No response received')
    }

    // Parse the JSON response
    let feedbackData
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = response.trim()
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0]
      }
      
      feedbackData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', response)
      // Provide fallback feedback
      feedbackData = {
        rating: questionType === 'mcq' ? (isCorrectMCQ ? 5 : 3) : 3,
        isCorrect: questionType === 'mcq' ? isCorrectMCQ : false,
        encouragement: "Great effort on answering the question!",
        explanation: question.explanation || "Thank you for your thoughtful response.",
        studyTip: "Keep practicing to strengthen your understanding of this topic.",
        confidenceBoost: "You're making progress in your learning journey!"
      }
    }

    // For MCQ, override AI's isCorrect with actual correctness
    if (questionType === 'mcq') {
      feedbackData.isCorrect = isCorrectMCQ
      // Adjust rating based on correctness for MCQ
      if (isCorrectMCQ && feedbackData.rating < 4) {
        feedbackData.rating = Math.max(feedbackData.rating, 4)
      }
    }

    // Enhanced performance messages based on rating and context
    let performanceMessage = ""
    let nextSteps = ""

    if (feedbackData.rating >= 4) {
      performanceMessage = feedbackData.isCorrect ? 
        "🎉 Excellent work! You've demonstrated strong understanding." :
        "👏 Great thinking! You're on the right track with your reasoning."
      nextSteps = difficulty === 'easy' ? 
        "Ready to try a medium-level question?" :
        "You might enjoy exploring more advanced aspects of this topic!"
    } else if (feedbackData.rating >= 3) {
      performanceMessage = "💪 Good effort! You're building solid understanding."
      nextSteps = "Let's review this concept and try a similar question to reinforce your learning."
    } else {
      performanceMessage = "🌟 Every attempt helps you learn! Let's work through this together."
      nextSteps = "Would you like to see more examples or get additional explanations on this topic?"
    }

    // Calculate response time if provided
    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0

    // Create updated session state
    const updatedSessionState = studentSession ? {
      ...studentSession,
      currentQuestionAnswered: true,
      previousAnswers: [
        ...(studentSession.previousAnswers || []),
        {
          questionId: question.id || `q_${Date.now()}`,
          isCorrect: feedbackData.isCorrect,
          topic: question.topic || 'General',
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          timestamp: new Date().toISOString(),
          responseTime: responseTime,
          attempts: 1 // Could be enhanced to track multiple attempts
        }
      ]
    } : null

    return NextResponse.json({
      success: true,
      feedback: {
        rating: feedbackData.rating,
        isCorrect: feedbackData.isCorrect,
        encouragement: feedbackData.encouragement,
        explanation: feedbackData.explanation,
        studyTip: feedbackData.studyTip,
        confidenceBoost: feedbackData.confidenceBoost
      },
      performanceMessage,
      nextSteps,
      updatedSessionState,
      sessionInsights: updatedSessionState ? generateSessionInsights(updatedSessionState) : null,
      metadata: {
        model: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        generatedAt: new Date().toISOString(),
        questionType: questionType,
        difficulty: difficulty,
        hasLearningContext: !!originalLearningGoal,
        responseTime: responseTime,
        sessionUpdated: !!updatedSessionState
      }
    })

  } catch (error) {
    console.error('Check answer error:', error)
    
    let errorMessage = 'Failed to check answer'
    let fallbackFeedback = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Provide fallback feedback for better UX
      fallbackFeedback = {
        rating: 3,
        isCorrect: false, // Conservative assumption
        encouragement: "Thank you for submitting your answer!",
        explanation: "I'm having trouble providing detailed feedback right now, but your effort in answering is valuable for learning.",
        studyTip: "Review the question and consider the key concepts involved.",
        confidenceBoost: "Keep practicing - every attempt helps you improve!"
      }
    }
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json({
        success: false,
        error: errorMessage,
        fallbackFeedback,
        message: "I need a moment to evaluate your answer! ⏰\n\nYour response has been noted, and you can continue learning while I prepare detailed feedback.",
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
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallbackFeedback,
      metadata: {
        errorOccurred: true,
        errorAt: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// Helper function to generate session insights
function generateSessionInsights(sessionState: any) {
  if (!sessionState.previousAnswers || sessionState.previousAnswers.length === 0) {
    return null
  }

  const answers = sessionState.previousAnswers
  const totalQuestions = answers.length
  const correctAnswers = answers.filter((a: any) => a.isCorrect).length
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0

  // Calculate topic-specific performance
  const topicStats: Record<string, { correct: number; total: number; accuracy: number }> = {}
  answers.forEach((answer: any) => {
    if (!topicStats[answer.topic]) {
      topicStats[answer.topic] = { correct: 0, total: 0, accuracy: 0 }
    }
    topicStats[answer.topic].total++
    if (answer.isCorrect) {
      topicStats[answer.topic].correct++
    }
  })

  // Calculate accuracy for each topic
  Object.keys(topicStats).forEach(topic => {
    const stats = topicStats[topic]
    stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0
  })

  // Identify strong and weak topics
  const strongTopics = Object.entries(topicStats)
    .filter(([_, stats]) => stats.accuracy >= 0.8 && stats.total >= 2)
    .map(([topic, _]) => topic)

  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => stats.accuracy < 0.6)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 3)
    .map(([topic, _]) => topic)

  // Generate recommendations
  let recommendations = []
  if (accuracy > 0.8) {
    recommendations.push("🌟 Excellent progress! Consider tackling more challenging questions.")
  } else if (accuracy > 0.6) {
    recommendations.push("💪 Good work! Focus on areas that need improvement.")
  } else {
    recommendations.push("🎯 Take your time and review concepts before answering.")
  }

  if (weakTopics.length > 0) {
    recommendations.push(`📚 Focus on: ${weakTopics.join(', ')}`)
  }

  return {
    overallAccuracy: Math.round(accuracy * 100),
    totalQuestionsAnswered: totalQuestions,
    correctAnswers: correctAnswers,
    strongTopics: strongTopics,
    weakTopics: weakTopics,
    recommendations: recommendations,
    readyForNextLevel: accuracy > 0.75 && totalQuestions >= 3
  }
}