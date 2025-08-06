// Advanced Learning Style Detection and Adaptation for FuturoPal
// Intelligent identification and customization of learning approaches

import { LearningStyle, TeachingStyle } from './types/student'

// 🎯 Learning Style Detection
export function detectLearningStyle(
  question: string,
  conversationHistory?: Array<{ content: string; timestamp: string }>,
  behaviorPatterns?: {
    preferredMediaTypes: string[]
    responseToVisuals: number // 1-10 scale
    responseToAudio: number
    responseToInteraction: number
    attentionSpanByType: Record<string, number>
  }
): {
  detectedStyle: LearningStyle
  confidence: number
  indicators: string[]
  recommendations: string[]
} {
  const textLower = question.toLowerCase()
  const indicators: Array<{ style: LearningStyle; score: number; evidence: string[] }> = []
  
  // Visual Learning Indicators
  const visualKeywords = [
    'see', 'show', 'picture', 'image', 'diagram', 'chart', 'graph', 'visual', 
    'map', 'color', 'highlight', 'draw', 'sketch', 'illustrate', 'display'
  ]
  const visualPhrases = [
    'show me', 'can you draw', 'what does it look like', 'picture this',
    'visualize', 'i need to see', 'draw a diagram', 'make a chart'
  ]
  
  const visualScore = calculateStyleScore(textLower, visualKeywords, visualPhrases, 1.2)
  if (visualScore.score > 0) {
    indicators.push({ style: 'visual', score: visualScore.score, evidence: visualScore.evidence })
  }
  
  // Auditory Learning Indicators
  const auditoryKeywords = [
    'hear', 'listen', 'sound', 'say', 'tell', 'explain', 'discuss', 'talk',
    'voice', 'audio', 'speak', 'pronunciation', 'rhythm', 'tone'
  ]
  const auditoryPhrases = [
    'tell me about', 'can you explain', 'i want to hear', 'say it again',
    'how do you pronounce', 'read it aloud', 'talk me through', 'discuss'
  ]
  
  const auditoryScore = calculateStyleScore(textLower, auditoryKeywords, auditoryPhrases, 1.1)
  if (auditoryScore.score > 0) {
    indicators.push({ style: 'auditory', score: auditoryScore.score, evidence: auditoryScore.evidence })
  }
  
  // Kinesthetic Learning Indicators
  const kinestheticKeywords = [
    'do', 'try', 'practice', 'hands-on', 'experience', 'feel', 'touch',
    'build', 'make', 'create', 'experiment', 'simulate', 'interactive'
  ]
  const kinestheticPhrases = [
    'let me try', 'hands-on', 'can i practice', 'show me how to do',
    'i want to try', 'let me experiment', 'i learn by doing', 'practice makes perfect'
  ]
  
  const kinestheticScore = calculateStyleScore(textLower, kinestheticKeywords, kinestheticPhrases, 1.3)
  if (kinestheticScore.score > 0) {
    indicators.push({ style: 'kinesthetic', score: kinestheticScore.score, evidence: kinestheticScore.evidence })
  }
  
  // Reading/Writing Learning Indicators
  const readingKeywords = [
    'read', 'write', 'text', 'article', 'book', 'notes', 'list', 'outline',
    'summary', 'definition', 'research', 'study', 'document', 'paper'
  ]
  const readingPhrases = [
    'can you write', 'give me notes', 'make a list', 'summary please',
    'definitions of', 'i need to read', 'text-based', 'written explanation'
  ]
  
  const readingScore = calculateStyleScore(textLower, readingKeywords, readingPhrases, 1.0)
  if (readingScore.score > 0) {
    indicators.push({ style: 'reading', score: readingScore.score, evidence: readingScore.evidence })
  }
  
  // Analyze conversation history for patterns
  if (conversationHistory && conversationHistory.length > 5) {
    const historyAnalysis = analyzeConversationHistory(conversationHistory)
    indicators.forEach(indicator => {
      const historyBonus = historyAnalysis[indicator.style] || 0
      indicator.score += historyBonus
      if (historyBonus > 0) {
        indicator.evidence.push(`Historical preference for ${indicator.style} content`)
      }
    })
  }
  
  // Factor in behavior patterns
  if (behaviorPatterns) {
    const behaviorAnalysis = analyzeBehaviorPatterns(behaviorPatterns)
    indicators.forEach(indicator => {
      const behaviorBonus = behaviorAnalysis[indicator.style] || 0
      indicator.score += behaviorBonus
      if (behaviorBonus > 0) {
        indicator.evidence.push(`Behavioral preference for ${indicator.style} interactions`)
      }
    })
  }
  
  // Determine primary learning style
  if (indicators.length === 0) {
    return {
      detectedStyle: 'unknown',
      confidence: 0,
      indicators: ['No clear learning style indicators found'],
      recommendations: ['Observe student preferences over multiple interactions']
    }
  }
  
  indicators.sort((a, b) => b.score - a.score)
  const topStyle = indicators[0]
  const secondStyle = indicators[1]
  
  // Check if it's mixed learning style
  const isMixed = secondStyle && (topStyle.score - secondStyle.score) < 2
  const detectedStyle: LearningStyle = isMixed ? 'mixed' : topStyle.style
  
  // Calculate confidence
  const totalScore = indicators.reduce((sum, ind) => sum + ind.score, 0)
  const confidence = Math.min(100, Math.round((topStyle.score / totalScore) * 100))
  
  // Generate recommendations
  const recommendations = generateLearningStyleRecommendations(detectedStyle, topStyle.score, isMixed ? [topStyle, secondStyle] : [topStyle])
  
  return {
    detectedStyle,
    confidence,
    indicators: topStyle.evidence,
    recommendations
  }
}

// 🎨 Teaching Style Adaptation
export function adaptTeachingStyle(
  learningStyle: LearningStyle,
  teachingStyle: TeachingStyle,
  emotionalState?: string,
  topicComplexity?: 'low' | 'medium' | 'high'
): {
  adaptedPrompt: string
  instructionalTechniques: string[]
  mediaRecommendations: string[]
  pacingAdjustments: string[]
} {
  const baseAdaptations = getBaseAdaptations(learningStyle)
  const styleEnhancements = getTeachingStyleEnhancements(teachingStyle)
  const emotionalAdjustments = getEmotionalAdjustments(emotionalState)
  const complexityAdjustments = getComplexityAdjustments(topicComplexity)
  
  // Combine all adaptations
  const adaptedPrompt = buildAdaptedPrompt(
    baseAdaptations.prompt,
    styleEnhancements.prompt,
    emotionalAdjustments.prompt,
    complexityAdjustments.prompt
  )
  
  const instructionalTechniques = [
    ...baseAdaptations.techniques,
    ...styleEnhancements.techniques,
    ...emotionalAdjustments.techniques,
    ...complexityAdjustments.techniques
  ].filter((technique, index, array) => array.indexOf(technique) === index) // Remove duplicates
  
  const mediaRecommendations = [
    ...baseAdaptations.media,
    ...styleEnhancements.media,
    ...emotionalAdjustments.media
  ].filter((media, index, array) => array.indexOf(media) === index)
  
  const pacingAdjustments = [
    ...baseAdaptations.pacing,
    ...styleEnhancements.pacing,
    ...complexityAdjustments.pacing
  ].filter((pacing, index, array) => array.indexOf(pacing) === index)
  
  return {
    adaptedPrompt,
    instructionalTechniques,
    mediaRecommendations,
    pacingAdjustments
  }
}

// 🔄 Dynamic Content Adaptation
export function adaptContentForLearningStyle(
  content: string,
  learningStyle: LearningStyle,
  topic: string
): {
  adaptedContent: string
  additionalResources: Array<{
    type: string
    description: string
    rationale: string
  }>
  interactionSuggestions: string[]
} {
  let adaptedContent = content
  const additionalResources: Array<{ type: string; description: string; rationale: string }> = []
  const interactionSuggestions: string[] = []
  
  switch (learningStyle) {
    case 'visual':
      adaptedContent = enhanceWithVisualElements(content, topic)
      additionalResources.push(
        { type: 'diagram', description: `Visual diagram of ${topic} concepts`, rationale: 'Visual learners process information better with diagrams' },
        { type: 'infographic', description: `Colorful infographic summarizing key points`, rationale: 'Infographics help visual learners see relationships' },
        { type: 'mindmap', description: `Mind map showing connections between ideas`, rationale: 'Mind maps appeal to visual spatial intelligence' }
      )
      interactionSuggestions.push(
        'Ask student to draw or sketch concepts',
        'Use color coding for different ideas',
        'Create visual mnemonics together'
      )
      break
      
    case 'auditory':
      adaptedContent = enhanceWithAuditoryElements(content, topic)
      additionalResources.push(
        { type: 'audio', description: `Audio explanation of ${topic}`, rationale: 'Auditory learners retain information better through listening' },
        { type: 'discussion', description: `Discussion questions about ${topic}`, rationale: 'Auditory learners learn through verbal interaction' },
        { type: 'mnemonic', description: `Musical or rhythmic mnemonics`, rationale: 'Auditory patterns enhance memory' }
      )
      interactionSuggestions.push(
        'Encourage student to read aloud',
        'Use verbal repetition and rhythm',
        'Engage in question-and-answer dialogue'
      )
      break
      
    case 'kinesthetic':
      adaptedContent = enhanceWithKinestheticElements(content, topic)
      additionalResources.push(
        { type: 'simulation', description: `Interactive simulation of ${topic}`, rationale: 'Kinesthetic learners need hands-on experience' },
        { type: 'experiment', description: `Hands-on experiment or activity`, rationale: 'Physical interaction reinforces learning' },
        { type: 'game', description: `Educational game related to ${topic}`, rationale: 'Games provide active engagement' }
      )
      interactionSuggestions.push(
        'Suggest physical movement or gestures',
        'Provide hands-on practice opportunities',
        'Use trial-and-error learning approaches'
      )
      break
      
    case 'reading':
      adaptedContent = enhanceWithTextualElements(content, topic)
      additionalResources.push(
        { type: 'article', description: `Detailed article about ${topic}`, rationale: 'Reading/writing learners prefer comprehensive text' },
        { type: 'outline', description: `Structured outline of key concepts`, rationale: 'Written organization helps processing' },
        { type: 'notes', description: `Detailed notes and summaries`, rationale: 'Written materials support comprehension' }
      )
      interactionSuggestions.push(
        'Encourage note-taking',
        'Ask for written summaries',
        'Provide reading assignments'
      )
      break
      
    case 'mixed':
      adaptedContent = enhanceWithMultimodalElements(content, topic)
      additionalResources.push(
        { type: 'multimedia', description: `Multi-sensory presentation of ${topic}`, rationale: 'Mixed learners benefit from diverse approaches' },
        { type: 'interactive', description: `Interactive multimedia resources`, rationale: 'Combination engages multiple learning channels' }
      )
      interactionSuggestions.push(
        'Offer multiple format options',
        'Vary presentation methods',
        'Allow student to choose preferred approach'
      )
      break
      
    default:
      // Keep original content for unknown style
      interactionSuggestions.push(
        'Observe student preferences',
        'Ask about preferred learning methods',
        'Experiment with different approaches'
      )
  }
  
  return {
    adaptedContent,
    additionalResources,
    interactionSuggestions
  }
}

// Helper Functions

function calculateStyleScore(
  text: string,
  keywords: string[],
  phrases: string[],
  weight: number
): { score: number; evidence: string[] } {
  let score = 0
  const evidence: string[] = []
  
  // Check keywords
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += weight
      evidence.push(`Uses "${keyword}"`)
    }
  })
  
  // Check phrases (higher weight)
  phrases.forEach(phrase => {
    if (text.includes(phrase)) {
      score += weight * 2
      evidence.push(`Uses phrase "${phrase}"`)
    }
  })
  
  return { score, evidence }
}

function analyzeConversationHistory(history: Array<{ content: string; timestamp: string }>): Record<LearningStyle, number> {
  const scores: Record<LearningStyle, number> = {
    visual: 0, auditory: 0, kinesthetic: 0, reading: 0, mixed: 0, unknown: 0
  }
  
  history.forEach(msg => {
    const detection = detectLearningStyle(msg.content)
    if (detection.confidence > 50) {
      scores[detection.detectedStyle] += detection.confidence / 100
    }
  })
  
  return scores
}

function analyzeBehaviorPatterns(patterns: {
  preferredMediaTypes: string[]
  responseToVisuals: number
  responseToAudio: number
  responseToInteraction: number
  attentionSpanByType: Record<string, number>
}): Record<LearningStyle, number> {
  const scores: Record<LearningStyle, number> = {
    visual: 0, auditory: 0, kinesthetic: 0, reading: 0, mixed: 0, unknown: 0
  }
  
  // Analyze media preferences
  patterns.preferredMediaTypes.forEach(mediaType => {
    if (['image', 'video', 'diagram'].includes(mediaType)) scores.visual += 1
    if (['audio', 'podcast', 'narration'].includes(mediaType)) scores.auditory += 1
    if (['interactive', 'simulation', 'game'].includes(mediaType)) scores.kinesthetic += 1
    if (['text', 'article', 'document'].includes(mediaType)) scores.reading += 1
  })
  
  // Analyze response rates
  scores.visual += patterns.responseToVisuals / 10 * 2
  scores.auditory += patterns.responseToAudio / 10 * 2
  scores.kinesthetic += patterns.responseToInteraction / 10 * 2
  
  // Analyze attention spans
  Object.entries(patterns.attentionSpanByType).forEach(([type, span]) => {
    const normalizedSpan = span / 30 // Normalize to 30 minutes
    if (type === 'visual') scores.visual += normalizedSpan
    if (type === 'audio') scores.auditory += normalizedSpan
    if (type === 'interactive') scores.kinesthetic += normalizedSpan
    if (type === 'text') scores.reading += normalizedSpan
  })
  
  return scores
}

function generateLearningStyleRecommendations(
  style: LearningStyle,
  score: number,
  topStyles: Array<{ style: LearningStyle; score: number }>
): string[] {
  const recommendations: string[] = []
  
  if (style === 'mixed') {
    recommendations.push(
      'Use a combination of visual, auditory, and kinesthetic elements',
      'Vary presentation methods within single sessions',
      'Allow student to choose their preferred format for different topics'
    )
  } else {
    const styleRecommendations = {
      visual: [
        'Include diagrams, charts, and visual aids',
        'Use color coding and visual organization',
        'Encourage mind mapping and visual note-taking'
      ],
      auditory: [
        'Use verbal explanations and discussions',
        'Include audio content and verbal repetition',
        'Encourage reading aloud and verbal summarization'
      ],
      kinesthetic: [
        'Provide hands-on activities and experiments',
        'Use interactive simulations and games',
        'Encourage physical movement and tactile learning'
      ],
      reading: [
        'Provide comprehensive written materials',
        'Encourage detailed note-taking and written summaries',
        'Use text-based explanations and documentation'
      ]
    }
    
    recommendations.push(...(styleRecommendations[style as keyof typeof styleRecommendations] || []))
  }
  
  // Add confidence-based recommendations
  if (score < 3) {
    recommendations.push('Continue observing student preferences to refine learning style detection')
  } else if (score > 8) {
    recommendations.push(`Strong ${style} learning preference detected - optimize content accordingly`)
  }
  
  return recommendations
}

function getBaseAdaptations(learningStyle: LearningStyle) {
  const adaptations = {
    visual: {
      prompt: 'Present information with visual structure, use descriptive language that helps create mental images, and suggest visual aids.',
      techniques: ['Visual organization', 'Descriptive imagery', 'Spatial relationships'],
      media: ['diagrams', 'charts', 'infographics'],
      pacing: ['Allow time for visual processing', 'Use visual breaks between concepts']
    },
    auditory: {
      prompt: 'Use conversational tone, include verbal emphasis, and encourage discussion and verbal repetition.',
      techniques: ['Verbal repetition', 'Rhythmic patterns', 'Discussion-based learning'],
      media: ['audio explanations', 'verbal discussions', 'sound patterns'],
      pacing: ['Use natural speaking rhythm', 'Include verbal pauses for processing']
    },
    kinesthetic: {
      prompt: 'Encourage active participation, suggest hands-on activities, and use action-oriented language.',
      techniques: ['Interactive activities', 'Physical demonstrations', 'Trial and error'],
      media: ['simulations', 'interactive tools', 'hands-on activities'],
      pacing: ['Include movement breaks', 'Alternate between theory and practice']
    },
    reading: {
      prompt: 'Provide structured, comprehensive explanations with clear organization and detailed information.',
      techniques: ['Written organization', 'Detailed explanations', 'Structured notes'],
      media: ['text documents', 'written summaries', 'detailed notes'],
      pacing: ['Allow reading time', 'Provide written follow-ups']
    },
    mixed: {
      prompt: 'Use varied presentation methods, offer multiple format options, and adapt based on topic and student response.',
      techniques: ['Multi-modal presentation', 'Flexible approaches', 'Student choice'],
      media: ['combination of formats', 'adaptive content', 'multiple options'],
      pacing: ['Flexible timing', 'Student-directed pacing']
    },
    unknown: {
      prompt: 'Use balanced approach while observing student preferences and responses to different methods.',
      techniques: ['Observation-based adaptation', 'Varied approaches', 'Preference discovery'],
      media: ['mixed media trial', 'experimental formats'],
      pacing: ['Standard pacing with flexibility']
    }
  }
  
  return adaptations[learningStyle] || adaptations.unknown
}

function getTeachingStyleEnhancements(teachingStyle: TeachingStyle) {
  const enhancements = {
    playful: {
      prompt: 'Use enthusiastic tone, include emojis and fun examples, make learning feel like a game.',
      techniques: ['Gamification', 'Fun analogies', 'Playful challenges'],
      media: ['interactive games', 'animated content', 'colorful visuals'],
      pacing: ['Energetic pace', 'Frequent engagement breaks']
    },
    logical: {
      prompt: 'Use systematic approach, provide logical structure, emphasize cause and effect relationships.',
      techniques: ['Systematic progression', 'Logical reasoning', 'Structured analysis'],
      media: ['flowcharts', 'logical diagrams', 'step-by-step guides'],
      pacing: ['Methodical progression', 'Logical sequence']
    },
    encouraging: {
      prompt: 'Provide frequent positive reinforcement, celebrate progress, maintain supportive tone.',
      techniques: ['Positive reinforcement', 'Progress celebration', 'Confidence building'],
      media: ['motivational content', 'success stories', 'progress tracking'],
      pacing: ['Encouraging milestones', 'Supportive checkpoints']
    },
    professional: {
      prompt: 'Use formal tone, provide comprehensive information, maintain academic rigor.',
      techniques: ['Comprehensive coverage', 'Academic rigor', 'Professional terminology'],
      media: ['formal presentations', 'academic resources', 'detailed documentation'],
      pacing: ['Professional standards', 'Thorough coverage']
    },
    socratic: {
      prompt: 'Ask guiding questions, encourage discovery, lead students to insights through questioning.',
      techniques: ['Guiding questions', 'Discovery learning', 'Critical thinking'],
      media: ['question frameworks', 'discussion guides', 'thinking tools'],
      pacing: ['Question-driven pace', 'Discovery timing']
    },
    adaptive: {
      prompt: 'Continuously adjust approach based on student response, remain flexible and responsive.',
      techniques: ['Responsive adjustment', 'Flexible methods', 'Real-time adaptation'],
      media: ['adaptive content', 'responsive tools', 'flexible formats'],
      pacing: ['Responsive timing', 'Student-driven pace']
    }
  }
  
  return enhancements[teachingStyle] || enhancements.adaptive
}

function getEmotionalAdjustments(emotionalState?: string) {
  if (!emotionalState) {
    return { prompt: '', techniques: [], media: [] }
  }
  
  const adjustments: Record<string, any> = {
    frustrated: {
      prompt: 'Use extra patience, break down concepts into smaller steps, provide frequent encouragement.',
      techniques: ['Gentle pacing', 'Small steps', 'Frequent encouragement'],
      media: ['calming visuals', 'step-by-step guides', 'progress indicators']
    },
    excited: {
      prompt: 'Match enthusiasm, provide challenging content, maintain high energy.',
      techniques: ['High energy', 'Challenging content', 'Dynamic interaction'],
      media: ['exciting visuals', 'dynamic content', 'interactive challenges']
    },
    confused: {
      prompt: 'Provide clear explanations, use multiple approaches, check understanding frequently.',
      techniques: ['Clear explanations', 'Multiple approaches', 'Understanding checks'],
      media: ['clear diagrams', 'simple explanations', 'clarifying examples']
    }
  }
  
  return adjustments[emotionalState] || { prompt: '', techniques: [], media: [] }
}

function getComplexityAdjustments(complexity?: 'low' | 'medium' | 'high') {
  if (!complexity) {
    return { prompt: '', techniques: [], pacing: [] }
  }
  
  const adjustments = {
    low: {
      prompt: 'Use simple language, provide basic explanations, focus on fundamental concepts.',
      techniques: ['Simple explanations', 'Basic concepts', 'Fundamental focus'],
      pacing: ['Relaxed pace', 'Simple progression']
    },
    medium: {
      prompt: 'Balance simplicity with depth, provide moderate detail, include relevant examples.',
      techniques: ['Balanced depth', 'Moderate detail', 'Relevant examples'],
      pacing: ['Moderate pace', 'Balanced progression']
    },
    high: {
      prompt: 'Provide comprehensive coverage, include advanced concepts, encourage deep thinking.',
      techniques: ['Comprehensive coverage', 'Advanced concepts', 'Deep analysis'],
      pacing: ['Intensive pace', 'Advanced progression']
    }
  }
  
  return adjustments[complexity]
}

function buildAdaptedPrompt(...prompts: string[]): string {
  return prompts.filter(p => p).join(' ')
}

// Content enhancement functions
function enhanceWithVisualElements(content: string, topic: string): string {
  return `${content}\n\n[Visual Enhancement: Consider creating a diagram or visual representation of ${topic} to better illustrate these concepts.]`
}

function enhanceWithAuditoryElements(content: string, topic: string): string {
  return `${content}\n\n[Audio Enhancement: This explanation would benefit from verbal discussion. Consider reading key points aloud or discussing ${topic} conversationally.]`
}

function enhanceWithKinestheticElements(content: string, topic: string): string {
  return `${content}\n\n[Interactive Enhancement: Try hands-on exploration of ${topic}. Look for ways to practice, experiment, or physically engage with these concepts.]`
}

function enhanceWithTextualElements(content: string, topic: string): string {
  return `${content}\n\n[Reading Enhancement: Create detailed notes or outlines about ${topic}. Written summaries and structured documentation will reinforce understanding.]`
}

function enhanceWithMultimodalElements(content: string, topic: string): string {
  return `${content}\n\n[Multimodal Enhancement: Explore ${topic} through multiple approaches - visual, auditory, hands-on, and written. Choose the methods that work best for you.]`
}