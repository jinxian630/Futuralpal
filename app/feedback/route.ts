// Enhanced Feedback Collection System for FuturoPal AI Tutor
// Comprehensive feedback gathering for continuous improvement

import { NextRequest, NextResponse } from 'next/server'

// Feedback Types
interface FeedbackSubmission {
  questionId?: string
  sessionId?: string
  userId?: string
  feedbackType: 'rating' | 'thumbs' | 'detailed' | 'bug_report' | 'feature_request'
  rating?: number // 1-5 stars
  thumbsRating?: 'thumbs_up' | 'thumbs_down'
  comment?: string
  categories?: string[] // e.g., ['helpfulness', 'accuracy', 'clarity']
  context?: {
    topic?: string
    difficulty?: string
    emotionalState?: string
    teachingStyle?: string
    userAgent?: string
    sessionDuration?: number
  }
  metadata?: {
    timestamp: string
    responseTime?: number
    interactionType?: string
    aiModel?: string
  }
}

interface FeedbackAnalytics {
  totalFeedback: number
  averageRating: number
  thumbsUpPercentage: number
  commonIssues: string[]
  improvementSuggestions: string[]
  categoryBreakdown: Record<string, number>
  recentTrends: {
    lastWeek: number
    lastMonth: number
    improvement: boolean
  }
}

// In-memory storage for feedback (in production, use a database)
let feedbackStorage: FeedbackSubmission[] = []
let feedbackAnalytics: FeedbackAnalytics = {
  totalFeedback: 0,
  averageRating: 0,
  thumbsUpPercentage: 0,
  commonIssues: [],
  improvementSuggestions: [],
  categoryBreakdown: {},
  recentTrends: {
    lastWeek: 0,
    lastMonth: 0,
    improvement: false
  }
}

// POST - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.feedbackType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: feedbackType'
      }, { status: 400 })
    }
    
    // Create feedback submission
    const feedback: FeedbackSubmission = {
      ...body,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: body.metadata?.responseTime,
        interactionType: body.metadata?.interactionType || 'chat',
        aiModel: body.metadata?.aiModel || 'gpt-3.5-turbo',
        ...body.metadata
      }
    }
    
    // Validate feedback based on type
    const validationResult = validateFeedback(feedback)
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: validationResult.error
      }, { status: 400 })
    }
    
    // Store feedback
    feedbackStorage.push(feedback)
    
    // Update analytics
    updateFeedbackAnalytics(feedback)
    
    // Process feedback for insights
    const insights = await processFeedbackInsights(feedback)
    
    console.log('📝 Feedback received:', {
      type: feedback.feedbackType,
      rating: feedback.rating || feedback.thumbsRating,
      categories: feedback.categories,
      hasComment: !!feedback.comment
    })
    
    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully',
      feedbackId: generateFeedbackId(feedback),
      insights: insights,
      thankYouMessage: generateThankYouMessage(feedback),
      metadata: {
        totalFeedbackCount: feedbackStorage.length,
        processedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Feedback submission error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Retrieve feedback analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const userId = url.searchParams.get('userId')
    const sessionId = url.searchParams.get('sessionId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    let filteredFeedback = feedbackStorage
    
    // Apply filters
    if (type) {
      filteredFeedback = filteredFeedback.filter(f => f.feedbackType === type)
    }
    if (userId) {
      filteredFeedback = filteredFeedback.filter(f => f.userId === userId)
    }
    if (sessionId) {
      filteredFeedback = filteredFeedback.filter(f => f.sessionId === sessionId)
    }
    
    // Limit results
    filteredFeedback = filteredFeedback.slice(-limit)
    
    // Generate enhanced analytics
    const enhancedAnalytics = generateEnhancedAnalytics(filteredFeedback)
    
    return NextResponse.json({
      success: true,
      feedback: filteredFeedback.map(f => ({
        ...f,
        // Remove sensitive information for GET requests
        comment: f.comment ? '[Comment provided]' : undefined
      })),
      analytics: enhancedAnalytics,
      insights: generateAnalyticsInsights(enhancedAnalytics),
      metadata: {
        totalCount: feedbackStorage.length,
        filteredCount: filteredFeedback.length,
        retrievedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Feedback retrieval error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper Functions

function validateFeedback(feedback: FeedbackSubmission): { isValid: boolean; error?: string } {
  switch (feedback.feedbackType) {
    case 'rating':
      if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
        return { isValid: false, error: 'Rating must be between 1 and 5' }
      }
      break
    case 'thumbs':
      if (!feedback.thumbsRating || !['thumbs_up', 'thumbs_down'].includes(feedback.thumbsRating)) {
        return { isValid: false, error: 'Invalid thumbs rating' }
      }
      break
    case 'detailed':
      if (!feedback.comment || feedback.comment.trim().length < 10) {
        return { isValid: false, error: 'Detailed feedback must include a comment of at least 10 characters' }
      }
      break
    case 'bug_report':
      if (!feedback.comment) {
        return { isValid: false, error: 'Bug reports must include a description' }
      }
      break
    case 'feature_request':
      if (!feedback.comment) {
        return { isValid: false, error: 'Feature requests must include a description' }
      }
      break
  }
  
  return { isValid: true }
}

function updateFeedbackAnalytics(feedback: FeedbackSubmission) {
  feedbackAnalytics.totalFeedback = feedbackStorage.length
  
  // Update average rating
  const ratings = feedbackStorage.filter(f => f.rating).map(f => f.rating!)
  if (ratings.length > 0) {
    feedbackAnalytics.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  }
  
  // Update thumbs up percentage
  const thumbsRatings = feedbackStorage.filter(f => f.thumbsRating)
  if (thumbsRatings.length > 0) {
    const thumbsUp = thumbsRatings.filter(f => f.thumbsRating === 'thumbs_up').length
    feedbackAnalytics.thumbsUpPercentage = (thumbsUp / thumbsRatings.length) * 100
  }
  
  // Update category breakdown
  feedbackAnalytics.categoryBreakdown = {}
  feedbackStorage.forEach(f => {
    if (f.categories) {
      f.categories.forEach(category => {
        feedbackAnalytics.categoryBreakdown[category] = (feedbackAnalytics.categoryBreakdown[category] || 0) + 1
      })
    }
  })
  
  // Update trends (simplified calculation)
  const lastWeek = feedbackStorage.filter(f => {
    const feedbackDate = new Date(f.metadata?.timestamp || Date.now())
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return feedbackDate >= weekAgo
  }).length
  
  feedbackAnalytics.recentTrends.lastWeek = lastWeek
  feedbackAnalytics.recentTrends.improvement = lastWeek > feedbackAnalytics.recentTrends.lastMonth / 4
}

async function processFeedbackInsights(feedback: FeedbackSubmission): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  actionItems: string[]
  patterns: string[]
}> {
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  const actionItems: string[] = []
  const patterns: string[] = []
  
  // Determine sentiment
  if (feedback.rating && feedback.rating >= 4) {
    sentiment = 'positive'
  } else if (feedback.rating && feedback.rating <= 2) {
    sentiment = 'negative'
  } else if (feedback.thumbsRating === 'thumbs_up') {
    sentiment = 'positive'
  } else if (feedback.thumbsRating === 'thumbs_down') {
    sentiment = 'negative'
  }
  
  // Generate action items based on feedback type and content
  if (feedback.feedbackType === 'bug_report') {
    actionItems.push('Investigate reported bug')
    actionItems.push('Test affected functionality')
  } else if (feedback.feedbackType === 'feature_request') {
    actionItems.push('Evaluate feature feasibility')
    actionItems.push('Add to product roadmap consideration')
  } else if (sentiment === 'negative') {
    actionItems.push('Review interaction for improvement opportunities')
    actionItems.push('Analyze teaching style effectiveness')
  }
  
  // Identify patterns
  if (feedback.context?.difficulty === 'hard' && sentiment === 'negative') {
    patterns.push('Difficulty level may be too challenging')
  }
  if (feedback.context?.emotionalState === 'frustrated' && sentiment === 'negative') {
    patterns.push('Emotional support may need enhancement')
  }
  
  return { sentiment, actionItems, patterns }
}

function generateThankYouMessage(feedback: FeedbackSubmission): string {
  const messages = {
    positive: [
      "🌟 Thank you for the positive feedback! It motivates us to keep improving!",
      "💫 We're thrilled you had a great experience! Your feedback helps us grow!",
      "🚀 Amazing! Thanks for taking the time to share your positive experience!"
    ],
    neutral: [
      "🙏 Thank you for your feedback! Every input helps us improve the learning experience!",
      "💙 We appreciate you taking the time to share your thoughts with us!",
      "📝 Thanks for the feedback! We're always working to make learning better!"
    ],
    negative: [
      "💙 Thank you for the honest feedback. We take all input seriously and will work to improve!",
      "🔧 We appreciate you pointing this out! Your feedback helps us identify areas for improvement!",
      "🌱 Thanks for helping us grow! We'll use your feedback to make the experience better!"
    ]
  }
  
  const sentiment = feedback.rating ? 
    (feedback.rating >= 4 ? 'positive' : feedback.rating <= 2 ? 'negative' : 'neutral') :
    feedback.thumbsRating === 'thumbs_up' ? 'positive' : 
    feedback.thumbsRating === 'thumbs_down' ? 'negative' : 'neutral'
  
  const messageArray = messages[sentiment]
  return messageArray[Math.floor(Math.random() * messageArray.length)]
}

function generateFeedbackId(feedback: FeedbackSubmission): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `fb_${timestamp}_${randomSuffix}`
}

function generateEnhancedAnalytics(feedbackList: FeedbackSubmission[]): FeedbackAnalytics & {
  recentFeedback: FeedbackSubmission[]
  topIssues: Array<{ issue: string; count: number }>
  improvementAreas: Array<{ area: string; urgency: 'high' | 'medium' | 'low' }>
  positiveHighlights: string[]
} {
  const baseAnalytics = { ...feedbackAnalytics }
  
  // Recent feedback (last 10)
  const recentFeedback = feedbackList.slice(-10)
  
  // Analyze top issues
  const issueCount: Record<string, number> = {}
  feedbackList.forEach(f => {
    if (f.comment && (f.rating && f.rating <= 2 || f.thumbsRating === 'thumbs_down')) {
      // Simple keyword extraction for issues
      const keywords = extractIssueKeywords(f.comment)
      keywords.forEach(keyword => {
        issueCount[keyword] = (issueCount[keyword] || 0) + 1
      })
    }
  })
  
  const topIssues = Object.entries(issueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }))
  
  // Improvement areas
  const improvementAreas = [
    { area: 'Response accuracy', urgency: topIssues.some(i => i.issue.includes('wrong')) ? 'high' : 'low' },
    { area: 'Emotional intelligence', urgency: topIssues.some(i => i.issue.includes('understand')) ? 'medium' : 'low' },
    { area: 'Teaching clarity', urgency: topIssues.some(i => i.issue.includes('confusing')) ? 'high' : 'low' }
  ].filter(area => area.urgency !== 'low') as Array<{ area: string; urgency: 'high' | 'medium' | 'low' }>
  
  // Positive highlights
  const positiveComments = feedbackList.filter(f => 
    f.comment && (f.rating && f.rating >= 4 || f.thumbsRating === 'thumbs_up')
  )
  const positiveHighlights = positiveComments
    .slice(-5)
    .map(f => extractPositiveHighlight(f.comment!))
    .filter(Boolean)
  
  return {
    ...baseAnalytics,
    recentFeedback,
    topIssues,
    improvementAreas,
    positiveHighlights
  }
}

function generateAnalyticsInsights(analytics: any): {
  overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical'
  keyFindings: string[]
  recommendations: string[]
  trends: string[]
} {
  let overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical' = 'good'
  const keyFindings: string[] = []
  const recommendations: string[] = []
  const trends: string[] = []
  
  // Determine overall health
  if (analytics.averageRating >= 4.5 && analytics.thumbsUpPercentage >= 85) {
    overallHealth = 'excellent'
  } else if (analytics.averageRating >= 3.5 && analytics.thumbsUpPercentage >= 70) {
    overallHealth = 'good'
  } else if (analytics.averageRating >= 2.5 && analytics.thumbsUpPercentage >= 50) {
    overallHealth = 'needs_attention'
  } else {
    overallHealth = 'critical'
  }
  
  // Key findings
  keyFindings.push(`Average rating: ${analytics.averageRating.toFixed(1)}/5.0`)
  keyFindings.push(`${analytics.thumbsUpPercentage.toFixed(0)}% positive feedback`)
  keyFindings.push(`${analytics.totalFeedback} total feedback submissions`)
  
  // Recommendations
  if (overallHealth === 'needs_attention' || overallHealth === 'critical') {
    recommendations.push('Focus on addressing top user issues')
    recommendations.push('Implement additional quality checks')
    recommendations.push('Consider user experience improvements')
  } else {
    recommendations.push('Continue current quality standards')
    recommendations.push('Look for opportunities to scale positive aspects')
  }
  
  // Trends
  if (analytics.recentTrends.improvement) {
    trends.push('Recent feedback shows improvement trend')
  } else {
    trends.push('Feedback levels remain stable')
  }
  
  return {
    overallHealth,
    keyFindings,
    recommendations,
    trends
  }
}

function extractIssueKeywords(comment: string): string[] {
  const lowerComment = comment.toLowerCase()
  const issueKeywords = ['wrong', 'incorrect', 'confusing', 'unhelpful', 'slow', 'bug', 'error', 'problem']
  
  return issueKeywords.filter(keyword => lowerComment.includes(keyword))
}

function extractPositiveHighlight(comment: string): string {
  if (comment.length > 50) {
    return comment.substring(0, 47) + '...'
  }
  return comment
}