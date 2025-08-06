// Advanced Emotion Detection and Sentiment Analysis for FuturoPal
// AI-powered emotional intelligence for personalized learning

import { EmotionalState, EmotionalPattern, EncouragementLevel } from './types/student'

// 🧠 Core Emotion Detection
export function analyzeSentimentAndTone(text: string, context?: {
  previousEmotions?: EmotionalState[]
  sessionDuration?: number
  recentPerformance?: number[]
}): {
  primaryEmotion: EmotionalState
  confidence: number
  intensity: number // 1-10 scale
  triggers: string[]
  recommendedResponse: EncouragementLevel
} {
  const textLower = text.toLowerCase()
  const emotions: Array<{
    emotion: EmotionalState
    score: number
    triggers: string[]
  }> = []
  
  // Define emotional indicators with weights
  const emotionalIndicators = {
    excited: {
      keywords: ['amazing', 'awesome', 'fantastic', 'love this', 'so cool', 'incredible', 'brilliant'],
      phrases: ['this is great', 'i love', 'so exciting', 'can\'t wait'],
      punctuation: ['!', '!!', '!!!'],
      weight: 1.0
    },
    curious: {
      keywords: ['interesting', 'wonder', 'curious', 'why', 'how does', 'what if', 'explore'],
      phrases: ['tell me more', 'i want to know', 'can you explain', 'what about'],
      punctuation: ['?'],
      weight: 0.8
    },
    frustrated: {
      keywords: ['frustrated', 'annoying', 'stupid', 'hate', 'give up', 'quit', 'impossible'],
      phrases: ['i give up', 'this sucks', 'too hard', 'makes no sense', 'i hate this'],
      punctuation: [],
      weight: 1.2
    },
    confused: {
      keywords: ['confused', 'lost', 'unclear', 'don\'t get', 'don\'t understand', 'what'],
      phrases: ['i don\'t understand', 'makes no sense', 'i\'m lost', 'can you help'],
      punctuation: ['?', '??'],
      weight: 1.0
    },
    overwhelmed: {
      keywords: ['overwhelmed', 'too much', 'too many', 'complicated', 'complex'],
      phrases: ['too much information', 'so much to learn', 'can\'t keep up', 'slow down'],
      punctuation: [],
      weight: 1.1
    },
    confident: {
      keywords: ['confident', 'sure', 'know', 'understand', 'got it', 'easy', 'simple'],
      phrases: ['i understand', 'got it', 'makes sense', 'i know', 'piece of cake'],
      punctuation: [],
      weight: 0.9
    },
    anxious: {
      keywords: ['worried', 'nervous', 'scared', 'afraid', 'anxious', 'stress'],
      phrases: ['i\'m worried', 'what if i fail', 'am i doing this right', 'is this correct'],
      punctuation: [],
      weight: 1.1
    },
    tired: {
      keywords: ['tired', 'exhausted', 'drained', 'worn out', 'sleepy', 'fatigue'],
      phrases: ['i\'m tired', 'need a break', 'too tired', 'can\'t focus'],
      punctuation: [],
      weight: 0.8
    }
  }
  
  // Analyze each emotion
  for (const [emotionName, indicators] of Object.entries(emotionalIndicators)) {
    let score = 0
    const foundTriggers: string[] = []
    
    // Check keywords
    for (const keyword of indicators.keywords) {
      if (textLower.includes(keyword)) {
        score += indicators.weight * 2
        foundTriggers.push(keyword)
      }
    }
    
    // Check phrases (higher weight)
    for (const phrase of indicators.phrases) {
      if (textLower.includes(phrase)) {
        score += indicators.weight * 3
        foundTriggers.push(phrase)
      }
    }
    
    // Check punctuation patterns
    for (const punct of indicators.punctuation) {
      const count = (text.match(new RegExp(`\\${punct}`, 'g')) || []).length
      if (count > 0) {
        score += count * indicators.weight * 0.5
      }
    }
    
    if (score > 0) {
      emotions.push({
        emotion: emotionName as EmotionalState,
        score,
        triggers: foundTriggers
      })
    }
  }
  
  // Handle neutral case
  if (emotions.length === 0) {
    emotions.push({
      emotion: 'neutral',
      score: 1,
      triggers: ['no strong emotional indicators']
    })
  }
  
  // Sort by score and get primary emotion
  emotions.sort((a, b) => b.score - a.score)
  const primaryEmotion = emotions[0]
  
  // Calculate confidence based on score difference
  const confidence = Math.min(100, (primaryEmotion.score / (primaryEmotion.score + (emotions[1]?.score || 0))) * 100)
  
  // Calculate intensity
  const intensity = Math.min(10, Math.ceil(primaryEmotion.score))
  
  // Factor in context
  let adjustedEmotion = primaryEmotion.emotion
  let adjustedIntensity = intensity
  
  if (context?.previousEmotions?.length) {
    adjustedEmotion = adjustForEmotionalHistory(primaryEmotion.emotion, context.previousEmotions)
  }
  
  if (context?.recentPerformance?.length) {
    adjustedIntensity = adjustForPerformanceHistory(intensity, context.recentPerformance)
  }
  
  // Determine recommended response level
  const recommendedResponse = determineResponseLevel(adjustedEmotion, adjustedIntensity)
  
  return {
    primaryEmotion: adjustedEmotion,
    confidence: Math.round(confidence),
    intensity: adjustedIntensity,
    triggers: primaryEmotion.triggers,
    recommendedResponse
  }
}

// 📊 Emotional Pattern Analysis
export function analyzeEmotionalPattern(emotionHistory: Array<{
  emotion: EmotionalState
  timestamp: string
  trigger?: string
}>): EmotionalPattern {
  if (emotionHistory.length === 0) {
    return {
      dominantEmotion: 'neutral',
      emotionHistory: [],
      stressIndicators: [],
      motivationalResponses: []
    }
  }
  
  // Find dominant emotion
  const emotionCounts = emotionHistory.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1
    return acc
  }, {} as Record<EmotionalState, number>)
  
  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0][0] as EmotionalState
  
  // Identify stress indicators
  const stressIndicators = identifyStressPatterns(emotionHistory)
  
  // Identify motivational responses
  const motivationalResponses = identifyMotivationalPatterns(emotionHistory)
  
  return {
    dominantEmotion,
    emotionHistory: emotionHistory.slice(-20), // Keep last 20 entries
    stressIndicators,
    motivationalResponses
  }
}

// 🎯 Personalized Response Generation
export function generateEmotionalResponse(
  emotion: EmotionalState,
  intensity: number,
  context?: {
    topic?: string
    difficulty?: string
    attempts?: number
  }
): {
  tone: string
  encouragement: string
  adaptations: string[]
} {
  const responses = {
    excited: {
      tone: 'enthusiastic',
      encouragement: [
        "I love your enthusiasm! 🌟 Let's channel that energy into learning!",
        "Your excitement is contagious! 🚀 Ready to dive deeper?",
        "Amazing energy! 💪 Let's keep this momentum going!"
      ],
      adaptations: [
        'Use more interactive examples',
        'Provide challenging extensions',
        'Include exciting real-world applications'
      ]
    },
    curious: {
      tone: 'engaging',
      encouragement: [
        "Great question! 🤔 Your curiosity will take you far!",
        "I love how you're thinking about this! 💡 Let's explore together!",
        "Curiosity is the engine of learning! 🔍 What else would you like to discover?"
      ],
      adaptations: [
        'Provide deep explanations',
        'Suggest related topics to explore',
        'Use discovery-based learning'
      ]
    },
    frustrated: {
      tone: 'calming',
      encouragement: [
        "I understand this feels challenging right now. 💙 Let's take it step by step.",
        "Frustration is normal when learning something new. 🌱 You're growing!",
        "Take a deep breath. 🧘‍♀️ Every expert started exactly where you are now."
      ],
      adaptations: [
        'Break down into smaller steps',
        'Use simpler language',
        'Provide more encouragement',
        'Suggest a short break if needed'
      ]
    },
    confused: {
      tone: 'patient',
      encouragement: [
        "No worries! 🤝 Confusion means you're on the edge of understanding.",
        "Let's clear this up together! 💡 I'm here to help you understand.",
        "Great questions lead to great understanding! 🎯 Let's work through this."
      ],
      adaptations: [
        'Provide clearer explanations',
        'Use multiple analogies',
        'Check understanding frequently',
        'Offer alternative approaches'
      ]
    },
    overwhelmed: {
      tone: 'supportive',
      encouragement: [
        "Let's slow down and focus on one thing at a time. 🌊 You've got this!",
        "I hear you! 🙏 Let's break this into manageable pieces.",
        "No rush at all! ⏰ Learning is a journey, not a race."
      ],
      adaptations: [
        'Reduce information density',
        'Focus on core concepts only',
        'Suggest breaks between topics',
        'Use progressive disclosure'
      ]
    },
    confident: {
      tone: 'encouraging',
      encouragement: [
        "I can see your confidence! 💪 Ready for the next challenge?",
        "You're really getting the hang of this! 🌟 Let's push a bit further!",
        "Excellent understanding! 🎯 Want to explore something more advanced?"
      ],
      adaptations: [
        'Increase difficulty slightly',
        'Provide extension activities',
        'Connect to advanced concepts',
        'Encourage peer teaching'
      ]
    },
    anxious: {
      tone: 'reassuring',
      encouragement: [
        "It's okay to feel nervous! 💙 Learning new things can feel overwhelming.",
        "You're doing better than you think! 🌟 Trust the process.",
        "Remember, mistakes are just learning opportunities! 🌱 You're safe here."
      ],
      adaptations: [
        'Provide extra reassurance',
        'Emphasize progress made',
        'Use gentle questioning',
        'Celebrate small wins'
      ]
    },
    tired: {
      tone: 'energizing',
      encouragement: [
        "Feeling a bit drained? ☕ Let's try a different approach to re-energize!",
        "Sometimes our brains need a different kind of stimulation! 🧠 Let's mix it up!",
        "How about we try something interactive? 🎮 Movement can help with focus!"
      ],
      adaptations: [
        'Use more interactive elements',
        'Suggest shorter sessions',
        'Include energizing activities',
        'Recommend breaks'
      ]
    },
    neutral: {
      tone: 'balanced',
      encouragement: [
        "Great! Let's continue our learning journey together! 🚀",
        "I'm here to help you explore and understand! 💡",
        "Ready to dive into this topic? 📚 Let's make it interesting!"
      ],
      adaptations: [
        'Use standard teaching approach',
        'Gauge interest through questions',
        'Adapt based on response'
      ]
    }
  }
  
  const emotionResponse = responses[emotion]
  const selectedEncouragement = emotionResponse.encouragement[
    Math.floor(Math.random() * emotionResponse.encouragement.length)
  ]
  
  // Adjust for intensity
  let adjustedEncouragement = selectedEncouragement
  if (intensity >= 8) {
    adjustedEncouragement = addIntensityModifiers(selectedEncouragement, 'high')
  } else if (intensity <= 3) {
    adjustedEncouragement = addIntensityModifiers(selectedEncouragement, 'low')
  }
  
  // Add context-specific adaptations
  let contextualAdaptations = [...emotionResponse.adaptations]
  if (context?.topic) {
    contextualAdaptations.push(`Relate to ${context.topic} specifically`)
  }
  if (context?.attempts && context.attempts > 3) {
    contextualAdaptations.push('Acknowledge persistence and effort')
  }
  
  return {
    tone: emotionResponse.tone,
    encouragement: adjustedEncouragement,
    adaptations: contextualAdaptations
  }
}

// 🔄 Learning Style Integration
export function integrateEmotionWithLearningStyle(
  emotion: EmotionalState,
  intensity: number,
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed'
): {
  recommendedApproach: string
  specificTechniques: string[]
  mediaTypes: string[]
} {
  const integrationMatrix = {
    excited: {
      visual: {
        approach: 'High-energy visual learning',
        techniques: ['Animated diagrams', 'Colorful infographics', 'Interactive visualizations'],
        media: ['videos', 'animations', 'interactive charts']
      },
      auditory: {
        approach: 'Enthusiastic audio learning',
        techniques: ['Upbeat explanations', 'Musical mnemonics', 'Discussion-based learning'],
        media: ['audio clips', 'podcasts', 'voice interactions']
      },
      kinesthetic: {
        approach: 'Active hands-on learning',
        techniques: ['Interactive simulations', 'Physical demonstrations', 'Gaming elements'],
        media: ['interactive tools', 'virtual labs', 'games']
      }
    },
    frustrated: {
      visual: {
        approach: 'Calming visual progression',
        techniques: ['Step-by-step diagrams', 'Soothing color schemes', 'Clear visual hierarchy'],
        media: ['flowcharts', 'progress indicators', 'simple graphics']
      },
      auditory: {
        approach: 'Gentle audio guidance',
        techniques: ['Soft-spoken explanations', 'Breathing exercises', 'Positive affirmations'],
        media: ['calm narration', 'guided meditation', 'encouraging voice messages']
      },
      kinesthetic: {
        approach: 'Stress-relief through activity',
        techniques: ['Physical movement breaks', 'Tactile learning tools', 'Relaxation exercises'],
        media: ['movement videos', 'fidget tools', 'stress balls']
      }
    }
    // Add more combinations as needed
  }
  
  const combo = integrationMatrix[emotion]?.[learningStyle]
  
  if (combo) {
    return {
      recommendedApproach: combo.approach,
      specificTechniques: combo.techniques,
      mediaTypes: combo.media
    }
  }
  
  // Default fallback
  return {
    recommendedApproach: `${learningStyle} learning adapted for ${emotion} state`,
    specificTechniques: ['Adaptive content delivery', 'Personalized pacing'],
    mediaTypes: ['mixed media', 'adaptive content']
  }
}

// Helper Functions

function adjustForEmotionalHistory(currentEmotion: EmotionalState, history: EmotionalState[]): EmotionalState {
  const recentEmotions = history.slice(-5)
  const dominantRecent = recentEmotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1
    return acc
  }, {} as Record<EmotionalState, number>)
  
  const mostCommon = Object.entries(dominantRecent)
    .sort(([,a], [,b]) => b - a)[0]?.[0] as EmotionalState
  
  // If there's a strong pattern, slightly weight towards it
  if (mostCommon && dominantRecent[mostCommon] >= 3) {
    if (mostCommon === 'frustrated' && currentEmotion === 'neutral') {
      return 'anxious' // Might still be recovering from frustration
    }
  }
  
  return currentEmotion
}

function adjustForPerformanceHistory(intensity: number, performance: number[]): number {
  const recentAvg = performance.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(3, performance.length)
  
  if (recentAvg < 40) {
    return Math.min(10, intensity + 2) // Increase intensity if struggling
  } else if (recentAvg > 80) {
    return Math.max(1, intensity - 1) // Decrease intensity if doing well
  }
  
  return intensity
}

function determineResponseLevel(emotion: EmotionalState, intensity: number): EncouragementLevel {
  const emotionLevels: Record<EmotionalState, EncouragementLevel> = {
    frustrated: 'maximum',
    overwhelmed: 'maximum',
    anxious: 'high',
    confused: 'high',
    tired: 'elevated',
    neutral: 'standard',
    curious: 'standard',
    confident: 'standard',
    excited: 'supportive'
  }
  
  let baseLevel = emotionLevels[emotion] || 'standard'
  
  // Adjust for intensity
  if (intensity >= 8 && ['frustrated', 'overwhelmed', 'anxious'].includes(emotion)) {
    baseLevel = 'maximum'
  } else if (intensity <= 3 && baseLevel === 'maximum') {
    baseLevel = 'high'
  }
  
  return baseLevel
}

function identifyStressPatterns(history: Array<{ emotion: EmotionalState; timestamp: string }>): string[] {
  const indicators: string[] = []
  
  // Check for repeated frustration
  const recentFrustration = history.slice(-10).filter(e => e.emotion === 'frustrated').length
  if (recentFrustration >= 3) {
    indicators.push('Repeated frustration episodes')
  }
  
  // Check for emotional volatility
  const recentEmotions = history.slice(-5).map(e => e.emotion)
  const uniqueEmotions = new Set(recentEmotions).size
  if (uniqueEmotions >= 4) {
    indicators.push('High emotional volatility')
  }
  
  // Check for anxiety patterns
  const anxietyCount = history.slice(-10).filter(e => e.emotion === 'anxious').length
  if (anxietyCount >= 2) {
    indicators.push('Recurring anxiety')
  }
  
  return indicators
}

function identifyMotivationalPatterns(history: Array<{ emotion: EmotionalState; timestamp: string }>): string[] {
  const responses: string[] = []
  
  // Check for excitement patterns
  const excitementCount = history.slice(-10).filter(e => e.emotion === 'excited').length
  if (excitementCount >= 2) {
    responses.push('Responds well to enthusiastic teaching')
  }
  
  // Check for curiosity patterns
  const curiosityCount = history.slice(-10).filter(e => e.emotion === 'curious').length
  if (curiosityCount >= 3) {
    responses.push('Thrives on discovery-based learning')
  }
  
  // Check for confidence building
  const confidentCount = history.slice(-10).filter(e => e.emotion === 'confident').length
  if (confidentCount >= 2) {
    responses.push('Benefits from challenge progression')
  }
  
  return responses
}

function addIntensityModifiers(message: string, level: 'high' | 'low'): string {
  if (level === 'high') {
    return message.replace(/!/g, '!!').replace(/\./g, '!')
  } else {
    return message.replace(/!/g, '.').replace(/!!!/g, '.')
  }
}