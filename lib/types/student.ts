// Enhanced Student Types for FuturoPal AI Tutor
// Comprehensive type definitions for intelligent learning system

// 🎓 Core Student Profile Types
export interface StudentHistory {
  userId: string
  totalSessions: number
  averageConfidence: number
  preferredLearningStyle?: LearningStyle
  recentPerformance: number[] // Last 10 confidence scores
  topicHistory: string[]
  strengthAreas: string[]
  improvementAreas: string[]
  lastActiveDate: string
  streakDays: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  // Enhanced fields
  emotionalPattern?: EmotionalPattern
  attentionSpan?: number // Minutes
  preferredDifficulty?: DifficultyPreference
  motivationalTriggers?: string[]
  learningGoals?: string[]
}

// 🎯 Student Analysis Result
export interface StudentAnalysis {
  intent: 'explanation' | 'practice' | 'support' | 'memorization' | 'examples' | 'summary' | 'general'
  patienceLevel: EncouragementLevel
  patterns: string
  learningVelocity: number // 0-1 scale, affects pacing
  requiresEncouragement: boolean
  suggestedApproach: string
  emotionalState?: EmotionalState
  confidenceLevel?: number
  focusArea?: string[]
}

// 🧠 Learning Style Classification
export type LearningStyle = 
  | 'visual'        // Prefers diagrams, charts, images
  | 'auditory'      // Prefers explanations, discussions
  | 'kinesthetic'   // Prefers hands-on, practice
  | 'reading'       // Prefers text-based learning
  | 'mixed'         // Combination of styles
  | 'unknown'       // Not yet determined

// 💭 Emotional Intelligence Types
export type EmotionalState = 
  | 'excited'       // High engagement, ready to learn
  | 'curious'       // Naturally inquisitive
  | 'confused'      // Needs clarification
  | 'frustrated'    // Struggling, needs patience
  | 'overwhelmed'   // Too much information
  | 'confident'     // Self-assured, ready for challenges
  | 'anxious'       // Worried about performance
  | 'tired'         // Low energy, needs motivation
  | 'neutral'       // Baseline emotional state

export interface EmotionalPattern {
  dominantEmotion: EmotionalState
  emotionHistory: Array<{
    emotion: EmotionalState
    timestamp: string
    trigger?: string
  }>
  stressIndicators: string[]
  motivationalResponses: string[]
}

// 🎚️ Encouragement and Support Levels
export type EncouragementLevel = 
  | 'maximum'       // Extremely patient, lots of support
  | 'high'          // Extra patience and encouragement
  | 'elevated'      // Above normal support
  | 'supportive'    // Helpful and encouraging
  | 'standard'      // Normal teaching approach

// 📊 Topic Analysis
export interface TopicTags {
  primaryTopic: string
  tags: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
  relatedConcepts: string[]
  confidence: number // How well the topic was identified
}

// 🎯 Difficulty Preferences
export type DifficultyPreference = 
  | 'prefers_easy'     // Likes to build confidence
  | 'prefers_medium'   // Balanced challenge
  | 'prefers_hard'     // Seeks challenges
  | 'adaptive'         // Adjusts based on performance

// 🎨 Teaching Style Preferences
export type TeachingStyle = 
  | 'playful'          // Fun, gamified, lots of emojis
  | 'logical'          // Structured, analytical approach
  | 'encouraging'      // Motivational, supportive
  | 'professional'     // Formal, detailed explanations
  | 'socratic'         // Question-based, discovery learning
  | 'adaptive'         // Changes based on student needs

// 📝 Enhanced Question Context
export interface QuestionContext {
  questionId: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  studentConfidence: number
  expectedDuration: number // minutes
  learningObjectives: string[]
  prerequisites?: string[]
}

// 🎮 Gamification Integration
export interface GamificationContext {
  currentXP: number
  currentLevel: number
  currentStreak: number
  achievements: string[]
  nextMilestone: {
    type: 'xp' | 'level' | 'achievement'
    target: number | string
    progress: number
  }
}

// 💡 AI Response Enhancement
export interface ResponsePersonalization {
  teachingStyle: TeachingStyle
  emotionalTone: 'encouraging' | 'neutral' | 'enthusiastic' | 'calming'
  complexityLevel: 'simplified' | 'standard' | 'detailed' | 'comprehensive'
  exampleType: 'real-world' | 'abstract' | 'step-by-step' | 'visual'
  includedFeatures: {
    analogies: boolean
    mnemonics: boolean
    progressReminders: boolean
    nextSteps: boolean
    relatedTopics: boolean
  }
}

// 📈 Learning Progress Tracking
export interface LearningProgress {
  sessionId: string
  startTime: string
  endTime?: string
  topicsExplored: string[]
  questionsAsked: number
  questionsAnswered: number
  correctAnswers: number
  avgResponseTime: number
  engagementLevel: number // 1-10 scale
  frustrationEvents: number
  breakthroughMoments: number
  xpEarned: number
  achievementsUnlocked: string[]
}

// 🎯 Student Session with Answer Tracking
export interface StudentSession {
  currentQuestionId: string | null
  currentQuestionAnswered: boolean
  previousAnswers: Array<{
    questionId: string
    isCorrect: boolean
    topic: string
    difficulty: 'easy' | 'medium' | 'hard'
    timestamp: string
    responseTime: number // milliseconds
    attempts: number
  }>
  topicPerformance: Map<string, {
    totalQuestions: number
    correctAnswers: number
    averageResponseTime: number
    difficultyProgression: Array<{
      difficulty: 'easy' | 'medium' | 'hard'
      success: boolean
      timestamp: string
    }>
  }>
  contextualInsights: {
    strongTopics: string[]
    weakTopics: string[]
    recommendedFocus: string[]
    learningPattern: 'visual' | 'analytical' | 'practical' | 'mixed'
  }
}

// 🔄 Multi-Turn Conversation Context
export interface ConversationContext {
  conversationId: string
  turnCount: number
  mainTopic: string
  subTopics: string[]
  studentGoal: string
  progressTowardsGoal: number // 0-100%
  keyConceptsCovered: string[]
  pendingQuestions: string[]
  conversationHistory: ConversationTurn[]
}

export interface ConversationTurn {
  turnNumber: number
  userMessage: string
  aiResponse: string
  timestamp: string
  topicsCovered: string[]
  emotionalState: EmotionalState
  confidenceLevel: number
  learningPoints: string[]
}

// 🎯 Smart Recommendations
export interface SmartRecommendations {
  nextTopics: Array<{
    topic: string
    reason: string
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedTime: number // minutes
  }>
  studyStrategies: Array<{
    strategy: string
    description: string
    suitability: number // 0-100% match for this student
  }>
  motivationalMessages: string[]
  warningFlags: Array<{
    type: 'frustration' | 'boredom' | 'overconfidence' | 'fatigue'
    severity: number // 1-10
    recommendation: string
  }>
}

// 📊 Analytics and Insights
export interface StudentInsights {
  learningVelocity: number // Concepts per hour
  retentionRate: number // Percentage
  optimimalSessionLength: number // Minutes
  bestLearningTimes: string[] // Time periods
  strongSubjects: string[]
  challengingSubjects: string[]
  recommendedBreakInterval: number // Minutes
  motivationalFactors: string[]
  distractionPatterns: string[]
}

// 🔧 System Configuration
export interface TutorSystemConfig {
  maxPatienceLevel: EncouragementLevel
  adaptiveResponseEnabled: boolean
  gamificationEnabled: boolean
  emotionalIntelligenceEnabled: boolean
  advancedAnalyticsEnabled: boolean
  multiModalLearningEnabled: boolean
  personalizedPromptsEnabled: boolean
  contextMemoryDepth: number // Number of previous interactions to remember
}

// 📱 Frontend Integration Types
export interface TutorSessionState {
  isActive: boolean
  sessionId: string
  currentTopic?: string
  studentProfile: Partial<StudentHistory>
  conversationContext: Partial<ConversationContext>
  gamificationState: Partial<GamificationContext>
  uiPreferences: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    animationsEnabled: boolean
    soundEnabled: boolean
  }
}

// 🚀 Advanced Features
export interface AdaptiveFeatures {
  dynamicDifficultyAdjustment: boolean
  emotionalResponseAdaptation: boolean
  learningStyleDetection: boolean
  contextualRecommendations: boolean
  progressiveLearningPath: boolean
  intelligentInterruption: boolean // Suggests breaks when needed
  crossTopicConnections: boolean
  realWorldApplications: boolean
}

// 🔍 Search and Discovery
export interface LearningPathDiscovery {
  currentPath: string[]
  alternativePaths: string[][]
  suggestedExplorations: string[]
  prerequisiteGaps: string[]
  advancedExtensions: string[]
  crossCurricularConnections: string[]
}

// Export commonly used union types
export type StudentMetrics = StudentHistory & StudentInsights & LearningProgress
export type FullStudentProfile = StudentHistory & EmotionalPattern & LearningProgress & SmartRecommendations
export type CompleteAnalysis = StudentAnalysis & TopicTags & ResponsePersonalization & ConversationContext