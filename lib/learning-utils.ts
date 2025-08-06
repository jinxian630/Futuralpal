// Enhanced Learning Utilities for FuturoPal AI Tutor
// Extracted and enhanced from tutor-chat route for better modularity

import { StudentHistory, StudentAnalysis, TopicTags, EncouragementLevel } from './types/student'

// 🧠 Enhanced Student Learning Analysis
export function analyzeStudentNeeds(question: string, studentHistory?: StudentHistory): StudentAnalysis {
  const questionLower = question.toLowerCase()
  
  // Advanced intent detection with more categories
  let intent: StudentAnalysis['intent'] = 'general'
  if (questionLower.includes('explain') || questionLower.includes('understand') || questionLower.includes('what is')) intent = 'explanation'
  else if (questionLower.includes('practice') || questionLower.includes('quiz') || questionLower.includes('test me')) intent = 'practice'
  else if (questionLower.includes('help') || questionLower.includes('confused') || questionLower.includes('stuck')) intent = 'support'
  else if (questionLower.includes('memorize') || questionLower.includes('remember') || questionLower.includes('flashcard')) intent = 'memorization'
  else if (questionLower.includes('example') || questionLower.includes('show me') || questionLower.includes('demonstrate')) intent = 'examples'
  else if (questionLower.includes('summary') || questionLower.includes('overview') || questionLower.includes('recap')) intent = 'summary'
  
  // Enhanced patience detection with severity levels
  const frustrationKeywords = ['frustrated', 'angry', 'hate this', 'give up', 'impossible']
  const confusionKeywords = ['confused', "don't understand", 'lost', 'unclear', 'makes no sense']
  const strugglingKeywords = ['struggling', 'difficult', 'hard', 'challenging', 'trouble']
  const helpKeywords = ['help me', 'need help', 'assistance', 'support']
  
  let patienceLevel: EncouragementLevel = 'standard'
  if (frustrationKeywords.some(keyword => questionLower.includes(keyword))) {
    patienceLevel = 'maximum'
  } else if (confusionKeywords.some(keyword => questionLower.includes(keyword))) {
    patienceLevel = 'high'
  } else if (strugglingKeywords.some(keyword => questionLower.includes(keyword))) {
    patienceLevel = 'elevated'
  } else if (helpKeywords.some(keyword => questionLower.includes(keyword))) {
    patienceLevel = 'supportive'
  }
  
  // Enhanced pattern analysis from history
  let patterns = 'First interaction - establishing baseline'
  let learningVelocity = 0.5 // Default moderate pace
  
  if (studentHistory) {
    const recentPerformance = studentHistory.recentPerformance || []
    const avgConfidence = studentHistory.averageConfidence || 50
    const sessionCount = studentHistory.totalSessions || 0
    
    if (sessionCount > 10) {
      patterns = 'Experienced learner with established patterns'
      learningVelocity = avgConfidence > 75 ? 0.8 : avgConfidence > 50 ? 0.6 : 0.4
    } else if (sessionCount > 3) {
      patterns = 'Developing learning patterns'
      learningVelocity = avgConfidence > 70 ? 0.7 : 0.5
    } else {
      patterns = 'New learner building confidence'
      learningVelocity = 0.4
    }
  }
  
  return {
    intent,
    patienceLevel,
    patterns,
    learningVelocity,
    requiresEncouragement: patienceLevel !== 'standard',
    suggestedApproach: getSuggestedApproach(intent, patienceLevel)
  }
}

// 🌡️ Enhanced Dynamic Temperature Control
export function getDynamicTemperature(question: string, studentAnalysis: StudentAnalysis): number {
  const questionLower = question.toLowerCase()
  let baseTemperature = 0.3
  
  // Adjust based on intent
  if (questionLower.includes('brainstorm') || questionLower.includes('creative') || questionLower.includes('ideas')) {
    baseTemperature = 0.7 // Higher creativity
  } else if (questionLower.includes('explain') || questionLower.includes('define') || questionLower.includes('formula')) {
    baseTemperature = 0.2 // Lower for precision
  } else if (questionLower.includes('example') || questionLower.includes('practice')) {
    baseTemperature = 0.4 // Moderate for variety
  }
  
  // Adjust based on student confidence level
  if (studentAnalysis.patienceLevel === 'maximum') {
    baseTemperature = Math.max(0.1, baseTemperature - 0.2) // More focused responses
  } else if (studentAnalysis.patienceLevel === 'standard') {
    baseTemperature += 0.1 // Slightly more creative
  }
  
  // Adjust based on learning velocity
  baseTemperature += (studentAnalysis.learningVelocity - 0.5) * 0.2
  
  return Math.max(0.1, Math.min(0.9, baseTemperature))
}

// 🏷️ Enhanced Topic Tagging with Context Awareness
export function extractTopicTags(question: string, studyContext?: string): TopicTags {
  const questionLower = question.toLowerCase()
  const tags: string[] = []
  
  // Enhanced subject detection with more granular categories
  const subjects = {
    'Mathematics': {
      keywords: ['math', 'algebra', 'calculus', 'geometry', 'arithmetic', 'equation', 'formula', 'statistics', 'probability'],
      subcategories: ['Basic Math', 'Algebra', 'Calculus', 'Geometry', 'Statistics']
    },
    'Science': {
      keywords: ['science', 'biology', 'chemistry', 'physics', 'experiment', 'hypothesis', 'molecule', 'atom'],
      subcategories: ['Biology', 'Chemistry', 'Physics', 'Earth Science']
    },
    'History': {
      keywords: ['history', 'historical', 'century', 'war', 'ancient', 'civilization', 'timeline', 'era'],
      subcategories: ['World History', 'Ancient History', 'Modern History', 'Cultural History']
    },
    'Language Arts': {
      keywords: ['grammar', 'writing', 'literature', 'essay', 'vocabulary', 'language', 'reading', 'poetry'],
      subcategories: ['Grammar', 'Writing', 'Literature', 'Vocabulary']
    },
    'Programming': {
      keywords: ['code', 'programming', 'algorithm', 'function', 'variable', 'syntax', 'debug', 'software'],
      subcategories: ['Web Development', 'Algorithms', 'Data Structures', 'Software Engineering']
    },
    'Arts': {
      keywords: ['art', 'music', 'painting', 'drawing', 'creative', 'design', 'aesthetic'],
      subcategories: ['Visual Arts', 'Music', 'Design', 'Creative Writing']
    }
  }
  
  let primaryTopic = 'General'
  let difficulty = 'intermediate'
  const relatedConcepts: string[] = []
  
  // Detect primary topic and subcategories
  for (const [subject, data] of Object.entries(subjects)) {
    const matchedKeywords = data.keywords.filter(keyword => questionLower.includes(keyword))
    if (matchedKeywords.length > 0) {
      tags.push(subject)
      primaryTopic = subject
      relatedConcepts.push(...matchedKeywords)
      
      // Try to identify subcategory
      for (const subcategory of data.subcategories) {
        if (questionLower.includes(subcategory.toLowerCase())) {
          tags.push(subcategory)
          break
        }
      }
    }
  }
  
  // Detect difficulty level
  if (questionLower.includes('basic') || questionLower.includes('simple') || questionLower.includes('beginner')) {
    difficulty = 'basic'
  } else if (questionLower.includes('advanced') || questionLower.includes('complex') || questionLower.includes('expert')) {
    difficulty = 'advanced'
  }
  
  // Include study context if provided
  if (studyContext && !tags.includes(studyContext)) {
    tags.push(studyContext)
  }
  
  return {
    primaryTopic,
    tags: tags.length > 0 ? tags : ['General'],
    difficulty,
    relatedConcepts,
    confidence: matchConfidenceLevel(relatedConcepts.length, questionLower)
  }
}

// 💖 Enhanced Adaptive Encouragement System
export function getAdaptiveEncouragement(
  studentAnalysis: StudentAnalysis, 
  topicTags: TopicTags,
  sessionHistory?: { consecutiveCorrect: number; recentMistakes: number }
): string[] {
  const { patienceLevel, intent, learningVelocity } = studentAnalysis
  
  // Base encouragement messages by patience level
  const encouragementSets = {
    maximum: [
      "Take all the time you need - learning is a journey, not a race! I'm here to support you every step of the way! 🌱",
      "You're showing incredible persistence! Remember, every expert was once exactly where you are now. Keep going! 💙",
      "It's completely normal to find this challenging. Let's break it down together - you've definitely got this! 🤝",
      "Your questions show you're thinking deeply about this topic. That's exactly what great learners do! ⭐"
    ],
    high: [
      "Great question! I can see you're really thinking about this - that's the mark of a strong learner! 🧠",
      "Let's work through this together step by step. You're asking all the right questions! 💫",
      "I love how you're approaching this topic! Curiosity like yours leads to real understanding! 🔍",
      "You're doing fantastic! Sometimes the best learning happens when we slow down and really explore! 🌟"
    ],
    elevated: [
      "Excellent question! You're tackling some really interesting concepts here! 🚀",
      "I can see you're putting in great effort! Let's build on what you already know! 💪",
      "You're making wonderful progress! Each question brings you closer to mastery! 📈",
      "Keep up that fantastic curiosity! You're developing real expertise in this area! ✨"
    ],
    supportive: [
      "I'm here to help you succeed! Let's explore this together! 🤝",
      "Great to see you engaging with this material! You're on the right track! 🎯",
      "You're asking smart questions! That shows you're really thinking about the concepts! 💡",
      "I love your enthusiasm for learning! Let's dive deeper into this topic! 🌊"
    ],
    standard: [
      "Excellent question! You're showing great engagement with the material! 🌟",
      "I love your curiosity! What would you like to explore next? 🚀",
      "You're doing wonderfully! Keep up that fantastic learning momentum! 💪",
      "Great thinking! You're really grasping these concepts well! 🧠"
    ]
  }
  
  let selectedMessages = encouragementSets[patienceLevel]
  
  // Adjust based on recent performance
  if (sessionHistory) {
    if (sessionHistory.consecutiveCorrect >= 3) {
      selectedMessages = [
        "You're on fire! 🔥 " + selectedMessages[0],
        "Amazing streak! " + selectedMessages[1],
        ...selectedMessages.slice(2)
      ]
    } else if (sessionHistory.recentMistakes >= 2) {
      selectedMessages = encouragementSets.maximum // Extra support
    }
  }
  
  // Add topic-specific encouragement
  if (topicTags.primaryTopic !== 'General') {
    const topicSpecific = `I see you're exploring ${topicTags.primaryTopic} - such a fascinating subject! `
    selectedMessages = selectedMessages.map(msg => topicSpecific + msg)
  }
  
  return selectedMessages
}

// 📊 Enhanced Confidence Assessment with Multi-factor Analysis
export function assessStudentConfidence(
  question: string, 
  studentHistory?: StudentHistory, 
  studentAnalysis?: StudentAnalysis
): number {
  const questionLower = question.toLowerCase()
  let confidenceLevel = 75 // Default baseline
  
  // Primary confidence indicators from question text
  const strongNegativeIndicators = ['give up', 'impossible', 'hate this', 'too hard', 'makes no sense']
  const negativeIndicators = ['confused', "don't understand", 'lost', 'struggling', 'difficult', "can't figure"]
  const neutralIndicators = ['help', 'explain', 'how', 'what', 'when', 'where', 'why']
  const positiveIndicators = ['sure', 'confident', 'ready', 'understand', 'got it', 'makes sense']
  const strongPositiveIndicators = ['easy', 'simple', 'clear', 'obvious', 'definitely', 'master']
  
  // Calculate confidence based on indicators
  if (strongNegativeIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel = 25
  } else if (negativeIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel = 45
  } else if (positiveIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel = 85
  } else if (strongPositiveIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel = 95
  }
  
  // Adjust based on question complexity
  const complexityIndicators = ['advanced', 'complex', 'detailed', 'comprehensive']
  const simplicityIndicators = ['basic', 'simple', 'easy', 'beginner']
  
  if (complexityIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel += 10 // Confident enough to tackle complex topics
  } else if (simplicityIndicators.some(indicator => questionLower.includes(indicator))) {
    confidenceLevel -= 5 // Seeking simpler explanations
  }
  
  // Factor in historical performance
  if (studentHistory) {
    const historyWeight = 0.3
    const currentWeight = 0.7
    
    const historicalConfidence = studentHistory.averageConfidence || 50
    confidenceLevel = (confidenceLevel * currentWeight) + (historicalConfidence * historyWeight)
    
    // Adjust based on recent trend
    if (studentHistory.recentPerformance && studentHistory.recentPerformance.length >= 3) {
      const recentTrend = calculateTrend(studentHistory.recentPerformance)
      confidenceLevel += recentTrend * 5 // Trend influence
    }
  }
  
  // Factor in learning velocity from student analysis
  if (studentAnalysis) {
    const velocityInfluence = (studentAnalysis.learningVelocity - 0.5) * 20
    confidenceLevel += velocityInfluence
  }
  
  return Math.max(10, Math.min(100, Math.round(confidenceLevel)))
}

// 🎯 Enhanced Patience Level Calculator
export function calculatePatienceNeeded(
  confidenceLevel: number, 
  studentAnalysis: StudentAnalysis,
  topicComplexity: 'low' | 'medium' | 'high' = 'medium'
): {
  level: string
  description: string
  recommendations: string[]
} {
  let patienceScore = 0
  
  // Base score from confidence
  if (confidenceLevel < 30) patienceScore += 4
  else if (confidenceLevel < 50) patienceScore += 3
  else if (confidenceLevel < 70) patienceScore += 2
  else if (confidenceLevel < 85) patienceScore += 1
  
  // Add complexity factor
  const complexityBonus = { low: 0, medium: 1, high: 2 }
  patienceScore += complexityBonus[topicComplexity]
  
  // Add student analysis factors
  if (studentAnalysis.patienceLevel === 'maximum') patienceScore += 3
  else if (studentAnalysis.patienceLevel === 'high') patienceScore += 2
  else if (studentAnalysis.patienceLevel === 'elevated') patienceScore += 1
  
  // Generate result based on total score
  if (patienceScore >= 6) {
    return {
      level: 'Maximum Patience Required',
      description: 'Student needs exceptional support and encouragement',
      recommendations: [
        'Break concepts into very small steps',
        'Use multiple analogies and examples',
        'Provide frequent positive reinforcement',
        'Check understanding at each step',
        'Offer alternative explanations'
      ]
    }
  } else if (patienceScore >= 4) {
    return {
      level: 'High Patience Needed',
      description: 'Student requires extra care and detailed explanations',
      recommendations: [
        'Use clear, simple language',
        'Provide step-by-step guidance',
        'Include encouraging feedback',
        'Offer multiple examples'
      ]
    }
  } else if (patienceScore >= 2) {
    return {
      level: 'Moderate Support',
      description: 'Standard supportive teaching approach',
      recommendations: [
        'Maintain encouraging tone',
        'Provide clear explanations',
        'Include relevant examples'
      ]
    }
  } else {
    return {
      level: 'Standard Approach',
      description: 'Student is confident and ready for normal pace',
      recommendations: [
        'Can provide more challenging content',
        'Focus on depth and complexity',
        'Encourage advanced thinking'
      ]
    }
  }
}

// Helper Functions

function getSuggestedApproach(intent: StudentAnalysis['intent'], patienceLevel: EncouragementLevel): string {
  const approaches: Record<string, Record<string, string>> = {
    explanation: {
      maximum: 'Ultra-gentle step-by-step breakdown with multiple analogies',
      high: 'Patient detailed explanation with examples',
      elevated: 'Clear structured explanation with support',
      supportive: 'Helpful explanation with encouragement',
      standard: 'Comprehensive explanation with examples'
    },
    practice: {
      maximum: 'Very easy practice with lots of guidance',
      high: 'Gentle practice with step-by-step help',
      elevated: 'Supportive practice with hints',
      supportive: 'Guided practice with encouragement',
      standard: 'Engaging practice opportunities'
    },
    support: {
      maximum: 'Maximum emotional support with gentle guidance',
      high: 'High support with patient assistance',
      elevated: 'Encouraging help with clear direction',
      supportive: 'Helpful guidance with reassurance',
      standard: 'Supportive assistance'
    }
  }
  
  return approaches[intent]?.[patienceLevel] || 'Adaptive teaching approach'
}

function matchConfidenceLevel(conceptCount: number, questionText: string): number {
  let confidence = 50 // Base confidence
  
  // Adjust based on concept matches
  confidence += conceptCount * 15
  
  // Adjust based on question characteristics
  if (questionText.includes('specifically') || questionText.includes('exactly')) confidence += 10
  if (questionText.includes('roughly') || questionText.includes('about')) confidence -= 5
  
  return Math.max(10, Math.min(100, confidence))
}

function calculateTrend(performance: number[]): number {
  if (performance.length < 2) return 0
  
  const recent = performance.slice(-3)
  const older = performance.slice(0, -3)
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
  const olderAvg = older.length > 0 ? older.reduce((sum, val) => sum + val, 0) / older.length : recentAvg
  
  return (recentAvg - olderAvg) / 100 // Normalize to -1 to 1 range
}