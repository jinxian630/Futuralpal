// Advanced Teaching Style Personalization for FuturoPal AI Tutor
// Dynamic adaptation of teaching approaches based on student preferences and context

import { TeachingStyle, EmotionalState, LearningStyle } from './types/student'

// 🎨 Teaching Style Profiles
export const TEACHING_STYLE_PROFILES = {
  playful: {
    name: 'Playful & Gamified',
    description: 'Fun, engaging, with lots of interaction and game-like elements',
    characteristics: [
      'Uses emojis and fun language',
      'Incorporates game mechanics',
      'Makes learning feel like play',
      'Uses creative analogies',
      'Celebrates achievements enthusiastically'
    ],
    toneKeywords: ['fun', 'exciting', 'amazing', 'awesome', 'fantastic'],
    promptModifiers: {
      systemPrompt: 'You are an enthusiastic, playful AI tutor who makes learning fun and engaging. Use emojis, creative analogies, and game-like language to make every concept feel like an adventure!',
      responseStyle: 'Use upbeat language, include relevant emojis, and frame learning as exciting challenges and adventures.',
      interactionStyle: 'Celebrate wins enthusiastically, turn mistakes into learning adventures, and use playful metaphors.'
    }
  },
  
  logical: {
    name: 'Logical & Systematic',
    description: 'Structured, analytical approach with clear reasoning',
    characteristics: [
      'Uses systematic progression',
      'Emphasizes cause and effect',
      'Provides logical frameworks',
      'Uses step-by-step methods',
      'Focuses on reasoning patterns'
    ],
    toneKeywords: ['therefore', 'because', 'consequently', 'logical', 'systematic'],
    promptModifiers: {
      systemPrompt: 'You are a logical, systematic AI tutor who provides clear, structured explanations. Use logical frameworks, step-by-step reasoning, and analytical approaches to help students understand concepts thoroughly.',
      responseStyle: 'Structure responses with clear logical flow, use numbered steps, and explain the reasoning behind each concept.',
      interactionStyle: 'Guide students through logical thinking processes, ask probing questions, and build understanding systematically.'
    }
  },
  
  encouraging: {
    name: 'Encouraging & Supportive',
    description: 'Warm, supportive, with focus on building confidence',
    characteristics: [
      'Provides frequent positive reinforcement',
      'Focuses on progress and growth',
      'Uses gentle, supportive language',
      'Celebrates small wins',
      'Builds confidence consistently'
    ],
    toneKeywords: ['excellent', 'wonderful', 'great job', 'you can do it', 'proud'],
    promptModifiers: {
      systemPrompt: 'You are a warm, encouraging AI tutor who builds student confidence through positive reinforcement. Focus on progress, celebrate achievements, and provide gentle guidance with constant support.',
      responseStyle: 'Use encouraging language, acknowledge effort, highlight progress, and maintain a supportive tone throughout.',
      interactionStyle: 'Celebrate every step forward, reframe challenges as growth opportunities, and provide emotional support.'
    }
  },
  
  professional: {
    name: 'Professional & Academic',
    description: 'Formal, comprehensive, with academic rigor',
    characteristics: [
      'Uses formal academic language',
      'Provides comprehensive coverage',
      'Maintains scholarly tone',
      'References authoritative sources',
      'Emphasizes precision and accuracy'
    ],
    toneKeywords: ['furthermore', 'accordingly', 'comprehensive', 'analysis', 'scholarly'],
    promptModifiers: {
      systemPrompt: 'You are a professional, academically rigorous AI tutor who provides comprehensive, scholarly explanations. Use formal language, cite relevant principles, and maintain academic standards while ensuring thorough understanding.',
      responseStyle: 'Use professional terminology, provide detailed explanations, and maintain formal academic tone.',
      interactionStyle: 'Focus on thoroughness and accuracy, encourage critical thinking, and provide scholarly perspective.'
    }
  },
  
  socratic: {
    name: 'Socratic & Discovery-Based',
    description: 'Question-driven approach that guides students to insights',
    characteristics: [
      'Asks guiding questions',
      'Encourages self-discovery',
      'Uses inquiry-based learning',
      'Promotes critical thinking',
      'Guides rather than tells'
    ],
    toneKeywords: ['what if', 'consider', 'why do you think', 'how might', 'what happens when'],
    promptModifiers: {
      systemPrompt: 'You are a Socratic AI tutor who guides students to understanding through thoughtful questions. Instead of giving direct answers, ask probing questions that lead students to discover insights themselves.',
      responseStyle: 'Respond with guiding questions, encourage exploration, and help students think through problems.',
      interactionStyle: 'Guide discovery through questions, encourage hypothesis formation, and celebrate student insights.'
    }
  },
  
  adaptive: {
    name: 'Adaptive & Responsive',
    description: 'Dynamically adjusts based on student needs and responses',
    characteristics: [
      'Changes approach based on feedback',
      'Responds to student cues',
      'Combines multiple methods',
      'Adjusts complexity dynamically',
      'Personalizes in real-time'
    ],
    toneKeywords: ['let me adjust', 'based on your response', 'I notice', 'adapting to'],
    promptModifiers: {
      systemPrompt: 'You are an adaptive AI tutor who continuously adjusts your teaching style based on student responses, emotional state, and learning preferences. Be flexible and responsive to student needs.',
      responseStyle: 'Monitor student responses and adjust your approach accordingly, combining different teaching methods as needed.',
      interactionStyle: 'Stay alert to student cues, adapt your teaching style mid-conversation, and optimize for student engagement.'
    }
  }
} as const

// 🎯 Dynamic Teaching Style Selection
export function selectOptimalTeachingStyle(
  context: {
    studentPreference?: TeachingStyle
    emotionalState?: EmotionalState
    learningStyle?: LearningStyle
    confidenceLevel?: number
    topicComplexity?: 'low' | 'medium' | 'high'
    sessionHistory?: {
      previousStyles: TeachingStyle[]
      effectiveness: number[]
      studentFeedback: string[]
    }
  }
): {
  recommendedStyle: TeachingStyle
  confidence: number
  reasoning: string[]
  alternativeStyles: TeachingStyle[]
} {
  const reasoning: string[] = []
  let scores: Record<TeachingStyle, number> = {
    playful: 0,
    logical: 0,
    encouraging: 0,
    professional: 0,
    socratic: 0,
    adaptive: 2 // Default bonus for adaptive
  }
  
  // Factor in student preference (highest weight)
  if (context.studentPreference && context.studentPreference !== 'adaptive') {
    scores[context.studentPreference] += 5
    reasoning.push(`Student explicitly prefers ${context.studentPreference} style`)
  }
  
  // Factor in emotional state
  if (context.emotionalState) {
    const emotionalStyleMapping: Record<EmotionalState, Partial<Record<TeachingStyle, number>>> = {
      frustrated: { encouraging: 4, adaptive: 3, socratic: -1 },
      anxious: { encouraging: 4, playful: 2, professional: -1 },
      confused: { logical: 3, encouraging: 3, socratic: 2 },
      excited: { playful: 4, socratic: 2, professional: -1 },
      tired: { encouraging: 3, playful: 2, logical: -1 },
      confident: { socratic: 3, professional: 2, playful: 1 },
      curious: { socratic: 4, playful: 2, logical: 1 },
      overwhelmed: { encouraging: 4, logical: 2, professional: -2 },
      neutral: { adaptive: 2 }
    }
    
    const emotionalScores = emotionalStyleMapping[context.emotionalState] || {}
    Object.entries(emotionalScores).forEach(([style, score]) => {
      scores[style as TeachingStyle] += score
    })
    reasoning.push(`Emotional state (${context.emotionalState}) influences style selection`)
  }
  
  // Factor in learning style
  if (context.learningStyle) {
    const learningStyleMapping: Record<LearningStyle, Partial<Record<TeachingStyle, number>>> = {
      visual: { logical: 2, professional: 1 },
      auditory: { socratic: 2, encouraging: 1 },
      kinesthetic: { playful: 3, adaptive: 1 },
      reading: { professional: 2, logical: 1 },
      mixed: { adaptive: 3, playful: 1 },
      unknown: { adaptive: 2 }
    }
    
    const learningScores = learningStyleMapping[context.learningStyle] || {}
    Object.entries(learningScores).forEach(([style, score]) => {
      scores[style as TeachingStyle] += score
    })
    reasoning.push(`Learning style (${context.learningStyle}) considered`)
  }
  
  // Factor in confidence level
  if (context.confidenceLevel !== undefined) {
    if (context.confidenceLevel < 40) {
      scores.encouraging += 3
      scores.playful += 1
      scores.professional -= 1
      reasoning.push('Low confidence favors encouraging style')
    } else if (context.confidenceLevel > 80) {
      scores.socratic += 2
      scores.professional += 1
      scores.encouraging -= 1
      reasoning.push('High confidence allows for more challenging styles')
    }
  }
  
  // Factor in topic complexity
  if (context.topicComplexity) {
    const complexityMapping = {
      low: { playful: 2, encouraging: 1 },
      medium: { logical: 1, adaptive: 1 },
      high: { professional: 2, logical: 2, socratic: 1, playful: -1 }
    }
    
    const complexityScores = complexityMapping[context.topicComplexity] || {}
    Object.entries(complexityScores).forEach(([style, score]) => {
      scores[style as TeachingStyle] += score
    })
    reasoning.push(`Topic complexity (${context.topicComplexity}) influences approach`)
  }
  
  // Factor in session history
  if (context.sessionHistory && context.sessionHistory.effectiveness.length > 0) {
    context.sessionHistory.previousStyles.forEach((style, index) => {
      const effectiveness = context.sessionHistory!.effectiveness[index] || 0
      scores[style] += (effectiveness - 50) / 25 // Convert 0-100 to -2 to 2 range
    })
    reasoning.push('Previous session effectiveness considered')
  }
  
  // Find the top styles
  const sortedStyles = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .map(([style]) => style as TeachingStyle)
  
  const topStyle = sortedStyles[0]
  const topScore = scores[topStyle]
  const secondScore = scores[sortedStyles[1]]
  
  // Calculate confidence based on score difference
  const confidence = Math.min(100, Math.max(0, (topScore - secondScore) * 20 + 60))
  
  return {
    recommendedStyle: topStyle,
    confidence: Math.round(confidence),
    reasoning,
    alternativeStyles: sortedStyles.slice(1, 4)
  }
}

// 🔧 Prompt Enhancement with Teaching Style
export function enhancePromptWithTeachingStyle(
  basePrompt: string,
  teachingStyle: TeachingStyle,
  context?: {
    emotionalState?: EmotionalState
    learningStyle?: LearningStyle
    topicComplexity?: 'low' | 'medium' | 'high'
  }
): {
  enhancedPrompt: string
  styleInstructions: string[]
  responseGuidelines: string[]
} {
  const profile = TEACHING_STYLE_PROFILES[teachingStyle]
  
  // Build enhanced system prompt
  let enhancedPrompt = basePrompt + '\n\n'
  enhancedPrompt += `TEACHING STYLE: ${profile.name}\n`
  enhancedPrompt += `${profile.promptModifiers.systemPrompt}\n\n`
  enhancedPrompt += `RESPONSE STYLE: ${profile.promptModifiers.responseStyle}\n`
  enhancedPrompt += `INTERACTION APPROACH: ${profile.promptModifiers.interactionStyle}\n`
  
  // Add contextual adaptations
  const styleInstructions: string[] = []
  const responseGuidelines: string[] = []
  
  // Emotional state adaptations
  if (context?.emotionalState) {
    const emotionalAdaptations = getEmotionalAdaptationsForStyle(teachingStyle, context.emotionalState)
    enhancedPrompt += `\nEMOTIONAL ADAPTATION: ${emotionalAdaptations.instruction}\n`
    styleInstructions.push(emotionalAdaptations.instruction)
    responseGuidelines.push(...emotionalAdaptations.guidelines)
  }
  
  // Learning style adaptations
  if (context?.learningStyle) {
    const learningAdaptations = getLearningStyleAdaptationsForTeachingStyle(teachingStyle, context.learningStyle)
    enhancedPrompt += `\nLEARNING STYLE INTEGRATION: ${learningAdaptations.instruction}\n`
    styleInstructions.push(learningAdaptations.instruction)
    responseGuidelines.push(...learningAdaptations.guidelines)
  }
  
  // Topic complexity adaptations
  if (context?.topicComplexity) {
    const complexityAdaptations = getComplexityAdaptationsForStyle(teachingStyle, context.topicComplexity)
    enhancedPrompt += `\nCOMPLEXITY ADAPTATION: ${complexityAdaptations.instruction}\n`
    styleInstructions.push(complexityAdaptations.instruction)
    responseGuidelines.push(...complexityAdaptations.guidelines)
  }
  
  return {
    enhancedPrompt,
    styleInstructions,
    responseGuidelines
  }
}

// 📊 Teaching Style Effectiveness Tracking
export function trackTeachingStyleEffectiveness(
  style: TeachingStyle,
  studentResponse: {
    engagementLevel: number // 1-10
    comprehensionLevel: number // 1-10
    emotionalResponse: EmotionalState
    followUpQuestions: number
    sessionDuration: number
  }
): {
  effectivenessScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
} {
  let effectivenessScore = 0
  const strengths: string[] = []
  const improvements: string[] = []
  const recommendations: string[] = []
  
  // Base score from engagement and comprehension
  effectivenessScore = (studentResponse.engagementLevel * 0.4) + (studentResponse.comprehensionLevel * 0.6)
  
  // Adjust based on emotional response
  const positiveEmotions = ['excited', 'curious', 'confident']
  const neutralEmotions = ['neutral']
  const negativeEmotions = ['frustrated', 'confused', 'anxious', 'overwhelmed', 'tired']
  
  if (positiveEmotions.includes(studentResponse.emotionalResponse)) {
    effectivenessScore += 1
    strengths.push(`Generated positive emotional response (${studentResponse.emotionalResponse})`)
  } else if (negativeEmotions.includes(studentResponse.emotionalResponse)) {
    effectivenessScore -= 1
    improvements.push(`Student showed ${studentResponse.emotionalResponse} - may need style adjustment`)
  }
  
  // Adjust based on follow-up questions (indicates engagement)
  if (studentResponse.followUpQuestions >= 3) {
    effectivenessScore += 0.5
    strengths.push('High number of follow-up questions indicates strong engagement')
  } else if (studentResponse.followUpQuestions === 0) {
    effectivenessScore -= 0.5
    improvements.push('No follow-up questions - may need more engaging approach')
  }
  
  // Style-specific effectiveness analysis
  const styleSpecificAnalysis = analyzeStyleSpecificEffectiveness(style, studentResponse)
  effectivenessScore += styleSpecificAnalysis.scoreAdjustment
  strengths.push(...styleSpecificAnalysis.strengths)
  improvements.push(...styleSpecificAnalysis.improvements)
  recommendations.push(...styleSpecificAnalysis.recommendations)
  
  // Cap score between 0 and 10
  effectivenessScore = Math.max(0, Math.min(10, effectivenessScore))
  
  return {
    effectivenessScore: Math.round(effectivenessScore * 10) / 10, // Round to 1 decimal
    strengths,
    improvements,
    recommendations
  }
}

// Helper Functions

function getEmotionalAdaptationsForStyle(style: TeachingStyle, emotion: EmotionalState) {
  const adaptationMatrix: Record<TeachingStyle, Record<EmotionalState, { instruction: string; guidelines: string[] }>> = {
    playful: {
      frustrated: {
        instruction: 'Tone down playfulness slightly, focus on gentle encouragement while maintaining fun elements',
        guidelines: ['Use supportive emojis', 'Frame challenges as winnable games', 'Celebrate small progress']
      },
      excited: {
        instruction: 'Match and channel the excitement into learning adventures',
        guidelines: ['Use high-energy language', 'Create exciting challenges', 'Build on enthusiasm']
      },
      // Add more combinations as needed
      neutral: {
        instruction: 'Use moderate playfulness to generate engagement',
        guidelines: ['Include fun analogies', 'Use engaging examples', 'Add interactive elements']
      }
    },
    encouraging: {
      frustrated: {
        instruction: 'Provide maximum emotional support and gentle guidance',
        guidelines: ['Acknowledge frustration', 'Emphasize progress made', 'Break down challenges']
      },
      confident: {
        instruction: 'Celebrate confidence while maintaining supportive tone',
        guidelines: ['Acknowledge achievements', 'Encourage next steps', 'Build on success']
      },
      neutral: {
        instruction: 'Provide steady encouragement and positive reinforcement',
        guidelines: ['Highlight effort', 'Celebrate understanding', 'Maintain supportive tone']
      }
    }
    // Add other styles as needed
  }
  
  return adaptationMatrix[style]?.[emotion] || {
    instruction: `Adapt ${style} style to accommodate ${emotion} emotional state`,
    guidelines: ['Monitor emotional response', 'Adjust approach as needed']
  }
}

function getLearningStyleAdaptationsForTeachingStyle(teachingStyle: TeachingStyle, learningStyle: LearningStyle) {
  // This would contain comprehensive mappings between teaching and learning styles
  return {
    instruction: `Integrate ${learningStyle} learning preferences with ${teachingStyle} teaching approach`,
    guidelines: [
      'Use appropriate content formats',
      'Align interaction methods',
      'Optimize presentation style'
    ]
  }
}

function getComplexityAdaptationsForStyle(teachingStyle: TeachingStyle, complexity: 'low' | 'medium' | 'high') {
  const adaptations = {
    playful: {
      low: { instruction: 'Use simple, fun analogies and basic game mechanics', guidelines: ['Keep language simple', 'Use familiar examples'] },
      medium: { instruction: 'Balance fun with moderate complexity', guidelines: ['Use engaging challenges', 'Maintain clarity'] },
      high: { instruction: 'Use sophisticated games and complex analogies', guidelines: ['Challenge appropriately', 'Maintain engagement'] }
    },
    logical: {
      low: { instruction: 'Use simple logical structures and basic reasoning', guidelines: ['Clear cause and effect', 'Simple frameworks'] },
      medium: { instruction: 'Apply systematic reasoning with moderate complexity', guidelines: ['Structured approach', 'Logical progression'] },
      high: { instruction: 'Use advanced logical frameworks and complex reasoning', guidelines: ['Sophisticated analysis', 'Detailed reasoning'] }
    }
    // Add other styles
  }
  
  return adaptations[teachingStyle]?.[complexity] || {
    instruction: `Adapt for ${complexity} complexity`,
    guidelines: ['Adjust detail level', 'Match student capacity']
  }
}

function analyzeStyleSpecificEffectiveness(style: TeachingStyle, response: any) {
  // Style-specific effectiveness analysis
  const analysis = {
    scoreAdjustment: 0,
    strengths: [] as string[],
    improvements: [] as string[],
    recommendations: [] as string[]
  }
  
  switch (style) {
    case 'playful':
      if (response.engagementLevel >= 8) {
        analysis.scoreAdjustment += 0.5
        analysis.strengths.push('Playful approach generated high engagement')
      }
      if (response.emotionalResponse === 'excited') {
        analysis.strengths.push('Successfully created excitement through playful teaching')
      }
      break
      
    case 'logical':
      if (response.comprehensionLevel >= 8) {
        analysis.scoreAdjustment += 0.5
        analysis.strengths.push('Logical approach facilitated strong understanding')
      }
      break
      
    case 'encouraging':
      if (['confident', 'curious'].includes(response.emotionalResponse)) {
        analysis.scoreAdjustment += 0.5
        analysis.strengths.push('Encouraging approach built positive confidence')
      }
      break
      
    // Add other style analyses
  }
  
  return analysis
}