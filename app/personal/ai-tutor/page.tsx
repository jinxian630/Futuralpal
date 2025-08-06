'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, BookOpen, Target, Zap, Brain, Award, TrendingUp, CheckCircle, XCircle, Star, Settings, Activity, Trophy, Flame, Coffee, ThumbsUp, ThumbsDown, Heart, Lightbulb, Palette, Menu, X } from 'lucide-react'
import { aiAgent, Question } from '@/lib/ai-agent'
import { TeachingStyle, LearningStyle } from '@/lib/types/student'
import { InteractiveFlashcard, FlashcardData, parseFlashcards } from '@/components/InteractiveFlashcard'
import { SuggestionChips } from '@/components/SuggestionChip'
import { TypingIndicator } from '@/components/TypingIndicator'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { QuickActionBar, generateSmartQuickActions } from '@/components/QuickActionBar'

interface StudySession {
  currentQuestion: Question | null
  questionsAsked: Question[]
  studyContext: string
  xpPoints: number
  streak: number
  level: number
  achievements: string[]
  // Enhanced session data
  emotionalState?: string
  learningStyle?: LearningStyle
  teachingStyle?: TeachingStyle
  conversationHistory: Array<{ role: string; content: string; timestamp: string }>
  totalInteractions: number
  sessionStartTime: string
}

const AITutorPage = () => {
  const [userMessage, setUserMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [originalStudentPrompt, setOriginalStudentPrompt] = useState<string>('')
  const [lastStudentQuestion, setLastStudentQuestion] = useState<string>('')
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    type?: 'chat' | 'question' | 'feedback' | 'welcome' | 'achievement' | 'flashcard_set'
    metadata?: any
    flashcards?: any[]
  }>>([
    {
      role: 'assistant',
      content: "🌟 **Hey there! I'm FuturoPal - your AI learning companion!** 🌟\n\nI'm genuinely excited to embark on this learning adventure with you! Think of me as your enthusiastic study partner who's available anytime you need help, encouragement, or just want to explore something fascinating.\n\n**Here's how I make learning amazing:**\n🎯 **Personalized just for you** - I adapt my teaching style to match how you learn best\n🎮 **Gamified learning experience** - Earn XP points, unlock achievements, and level up as you progress!\n💬 **Natural conversations** - No textbook formality here! Just friendly chats about the topics you're curious about\n🧠 **Smart memory** - I remember your interests, progress, and goals to build on what matters to you\n\n**What would you like to explore together today?**\n\nYou can pick any subject below to get started, or simply tell me what's sparking your curiosity right now. I'm here to make learning feel exciting and rewarding! 🚀",
      type: 'welcome'
    }
  ])

  const [studySession, setStudySession] = useState<StudySession>({
    currentQuestion: null,
    questionsAsked: [],
    studyContext: '',
    xpPoints: 0,
    streak: 0,
    level: 1,
    achievements: [],
    conversationHistory: [],
    totalInteractions: 0,
    sessionStartTime: new Date().toISOString()
  })

  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [serviceError, setServiceError] = useState<string | null>(null)
  
  // Enhanced UI state
  const [selectedTeachingStyle, setSelectedTeachingStyle] = useState<TeachingStyle>('adaptive')
  const [showFeedbackButtons, setShowFeedbackButtons] = useState<string | null>(null)
  const [sessionInsights, setSessionInsights] = useState<any>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [sessionProgress, setSessionProgress] = useState({
    questionsAnswered: 0,
    topicsExplored: new Set<string>(),
    toolsUsed: new Set<string>(),
    timeSpent: 0,
    lastActivity: Date.now()
  })
  const [showSettings, setShowSettings] = useState(false)
  const [enableEnhancements, setEnableEnhancements] = useState({
    emotionalIntelligence: true,
    gamification: true,
    adaptiveTeaching: true
  })

  // Enhanced tool selection state
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [toolPromptMode, setToolPromptMode] = useState(false) 
  const [toolCustomPrompt, setToolCustomPrompt] = useState('')
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // 🎯 NEW: Student session tracking for answer validation and context
  const [studentSession, setStudentSession] = useState({
    currentQuestionId: null as string | null,
    currentQuestionAnswered: true, // Start as true so first question can be generated
    previousAnswers: [] as Array<{
      questionId: string
      isCorrect: boolean
      topic: string
      difficulty: 'easy' | 'medium' | 'hard'
      timestamp: string
      responseTime: number
      attempts: number
    }>,
    questionStartTime: null as number | null
  })

  // Progress tracking and validation state
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  
  // Context editing state
  const [editingContext, setEditingContext] = useState(false)
  const [newLearningGoal, setNewLearningGoal] = useState('')

  // Function to update learning goal
  const updateLearningGoal = (newGoal: string) => {
    if (newGoal.trim()) {
      setOriginalStudentPrompt(newGoal.trim())
      
      // Extract and update study context
      const extractTopicFromPrompt = (prompt: string) => {
        const patterns = [
          /(?:learn|study|understand|explain|teach me|help me with|about|tell me about)\s+(.+?)(?:\.|$|\?|,)/i,
          /(?:what is|what are|how to|how does|why)\s+(.+?)(?:\?|$|\.|,)/i,
          /(?:i want to|i need to)\s+(?:learn|study|understand)\s+(.+?)(?:\.|$|\?|,)/i
        ]
        
        for (const pattern of patterns) {
          const match = prompt.match(pattern)
          if (match && match[1]) {
            return match[1].trim()
          }
        }
        return null
      }
      
      const extractedTopic = extractTopicFromPrompt(newGoal)
      if (extractedTopic) {
        setStudySession(prev => ({ ...prev, studyContext: extractedTopic }))
      }
      
      // Add confirmation message
      const confirmationMessage = {
        role: 'assistant' as const,
        content: `🎯 **Learning Goal Updated!**\n\nI've updated your learning focus to: "${newGoal}"\n\n${extractedTopic ? `I'll now generate questions specifically about **${extractedTopic}** to help you achieve this goal!` : 'I\'ll tailor all questions to help you achieve this learning objective!'}`,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, confirmationMessage])
    }
    
    setEditingContext(false)
    setNewLearningGoal('')
  }

  // Helper function to get current learning context with smart reconstruction
  const getCurrentLearningContext = (): string => {
    // Priority 1: Original captured learning prompt
    if (originalStudentPrompt) {
      return originalStudentPrompt
    }
    
    // Priority 2: Most recent substantive question
    if (lastStudentQuestion && lastStudentQuestion.length > 15) {
      return lastStudentQuestion
    }
    
    // Priority 3: Extract from recent conversation history - look for learning indicators
    const learningMessages = conversation
      .filter(msg => msg.role === 'user')
      .filter(msg => {
        const content = msg.content.toLowerCase()
        return content.length > 15 && (
          content.includes('learn') || content.includes('understand') ||
          content.includes('explain') || content.includes('teach') ||
          content.includes('help') || content.includes('how') ||
          content.includes('what') || content.includes('why') ||
          content.includes('?')
        )
      })
      .slice(-2) // Last 2 learning-oriented messages
      .map(msg => msg.content)
    
    if (learningMessages.length > 0) {
      return learningMessages[learningMessages.length - 1]
    }
    
    // Priority 4: Study session context
    if (studySession.studyContext) {
      return `Learning about ${studySession.studyContext}`
    }
    
    // Priority 5: Any recent user messages as last resort
    const recentUserMessages = conversation
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content)
      .filter(content => content.length > 10)
    
    if (recentUserMessages.length > 0) {
      return recentUserMessages[recentUserMessages.length - 1]
    }
    
    // Final fallback
    return 'general learning topics'
  }
  
  // Enhanced interactive features state
  const [interactiveContent, setInteractiveContent] = useState<{
    examples?: string
    flashcards?: string
    practiceQuestions?: string
    stepByStepGuide?: string
  }>({})
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'chat' | 'examples' | 'flashcards' | 'questions' | 'stepbystep'>('chat')

  // Learning topics for discovery
  const learningTopics = [
    { emoji: '🔬', title: 'Science & Nature', desc: 'Explore the wonders of our world' },
    { emoji: '🔢', title: 'Mathematics', desc: 'Numbers, patterns, and problem solving' },
    { emoji: '🏛️', title: 'History', desc: 'Stories from the past that shape today' },
    { emoji: '📚', title: 'Literature', desc: 'Great books and writing techniques' },
    { emoji: '🎨', title: 'Arts & Culture', desc: 'Creative expression and human culture' },
    { emoji: '💻', title: 'Technology', desc: 'Modern innovations and digital literacy' },
    { emoji: '🌍', title: 'Geography', desc: 'Our planet and its diverse places' },
    { emoji: '🧠', title: 'Psychology', desc: 'Understanding the human mind' }
  ]

  // XP calculation
  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1
  }

  const getXPForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100
  }

  // Achievement system
  const checkAchievements = (session: StudySession): string[] => {
    const newAchievements: string[] = []
    
    if (session.questionsAsked.length === 1 && !session.achievements.includes('First Steps')) {
      newAchievements.push('First Steps')
    }
    if (session.questionsAsked.length === 10 && !session.achievements.includes('Question Master')) {
      newAchievements.push('Question Master')
    }
    if (session.streak >= 3 && !session.achievements.includes('On Fire')) {
      newAchievements.push('On Fire')
    }
    if (session.xpPoints >= 500 && !session.achievements.includes('Rising Star')) {
      newAchievements.push('Rising Star')
    }
    
    return newAchievements
  }

  // Add XP and check for achievements
  const addXP = (points: number, reason: string) => {
    setStudySession(prev => {
      const newXP = prev.xpPoints + points
      const newLevel = calculateLevel(newXP)
      const newSession = { ...prev, xpPoints: newXP, level: newLevel }
      
      const newAchievements = checkAchievements(newSession)
      if (newAchievements.length > 0) {
        newSession.achievements = [...prev.achievements, ...newAchievements]
        
        // Show celebratory achievement notification
        setTimeout(() => {
          const achievementMessage = {
            role: 'assistant' as const,
            content: `🎉 **Incredible Achievement Unlocked!** 🎉\n\n${newAchievements.map(a => `🌟 **${a}** - You've earned this!`).join('\n')}\n\n🚀 **+${points} XP** for ${reason}! Your learning journey is truly inspiring!\n\nKeep up this amazing momentum - I'm so proud of your progress! 💫`,
            type: 'achievement' as const,
            metadata: { achievements: newAchievements }
          }
          setConversation(prev => [...prev, achievementMessage])
        }, 1000)
      }
      
      return newSession
    })
  }

  useEffect(() => {
    // Initialize study session
    aiAgent.updateProgress('start_study_session', {})
  }, [])

  // Enhanced conversational suggestion chips for different topics
  const topicSuggestions = {
    'Science & Nature': [
      { text: "Let's start with a fun science quiz to warm up!", icon: "🎯", variant: "primary" as const },
      { text: "Tell me about an amazing science discovery", icon: "🔬", variant: "secondary" as const },
      { text: "I want to understand how nature works", icon: "🌿", variant: "accent" as const },
      { text: "Surprise me with cool science facts!", icon: "⚡", variant: "primary" as const }
    ],
    'History': [
      { text: "Let's explore history with some engaging questions!", icon: "🎯", variant: "primary" as const },
      { text: "Tell me a captivating story from the past", icon: "📜", variant: "secondary" as const },
      { text: "Help me understand why historical events matter", icon: "🏛️", variant: "accent" as const },
      { text: "Share some mind-blowing historical facts!", icon: "🌟", variant: "primary" as const }
    ],
    'Mathematics': [
      { text: "I'd love some math practice that's actually fun!", icon: "🎯", variant: "primary" as const },
      { text: "Show me how math applies to real life", icon: "🧮", variant: "secondary" as const },
      { text: "Help me tackle challenging math concepts", icon: "💫", variant: "accent" as const },
      { text: "Teach me mathematical patterns and beauty", icon: "🎨", variant: "primary" as const }
    ],
    'Literature': [
      { text: "Let's dive into great books and stories!", icon: "📚", variant: "primary" as const },
      { text: "Help me analyze literature like a pro", icon: "🎭", variant: "secondary" as const },
      { text: "Explore poetry and creative writing with me", icon: "✍️", variant: "accent" as const },
      { text: "Discover hidden meanings in famous works", icon: "🔍", variant: "primary" as const }
    ],
    'Arts & Culture': [
      { text: "Let's explore the amazing world of art!", icon: "🎨", variant: "primary" as const },
      { text: "Tell me about fascinating cultural traditions", icon: "🌍", variant: "secondary" as const },
      { text: "Help me understand different art movements", icon: "🖼️", variant: "accent" as const },
      { text: "Share stories behind famous artworks", icon: "✨", variant: "primary" as const }
    ],
    'Technology': [
      { text: "I want to understand how technology works!", icon: "💻", variant: "primary" as const },
      { text: "Explain AI and future tech in simple terms", icon: "🤖", variant: "secondary" as const },
      { text: "Help me stay updated with tech trends", icon: "📱", variant: "accent" as const },
      { text: "Show me the impact of technology on society", icon: "🌐", variant: "primary" as const }
    ],
    'Geography': [
      { text: "Let's explore our amazing planet together!", icon: "🌍", variant: "primary" as const },
      { text: "Explain fascinating natural phenomena", icon: "🌋", variant: "secondary" as const },
      { text: "Help me understand climate and weather", icon: "🌤️", variant: "accent" as const },
      { text: "Tell me about diverse cultures worldwide", icon: "🗺️", variant: "primary" as const }
    ],
    'Psychology': [
      { text: "Help me understand how minds work!", icon: "🧠", variant: "primary" as const },
      { text: "Explain fascinating psychological concepts", icon: "💭", variant: "secondary" as const },
      { text: "Show me what motivates human behavior", icon: "💝", variant: "accent" as const },
      { text: "Teach me about emotions and mental wellness", icon: "🌱", variant: "primary" as const }
    ]
  }

  const handleTopicSelect = (topic: any) => {
    const topicMessage = {
      role: 'user' as const,
      content: `I'd like to learn about ${topic.title}`,
      type: 'chat' as const
    }
    setConversation(prev => [...prev, topicMessage])
    
    // Set study context and generate encouraging response
    setStudySession(prev => ({ ...prev, studyContext: topic.title }))
    
    // Smart contextual suggestions based on user progress and topic
    const getSmartSuggestions = (topicTitle: string) => {
      const baseSuggestions = topicSuggestions[topicTitle as keyof typeof topicSuggestions] || [];
      const { questionsAnswered, topicsExplored } = sessionProgress;
      
      // Adapt suggestions based on user experience
      if (questionsAnswered === 0 && topicsExplored.size === 1) {
        // First-time user - encouraging and simple
        return [
          { text: "Let's start with something fun and easy!", icon: "🌟", variant: "primary" as const },
          ...baseSuggestions.slice(0, 3)
        ];
      } else if (questionsAnswered >= 5) {
        // Experienced user - more advanced options
        return [
          ...baseSuggestions,
          { text: "Challenge me with advanced concepts!", icon: "🚀", variant: "accent" as const },
          { text: "Connect this to other topics I've learned", icon: "🔗", variant: "secondary" as const }
        ];
      } else if (topicsExplored.size >= 2) {
        // Multi-topic explorer - cross-topic suggestions
        return [
          ...baseSuggestions.slice(0, 2),
          { text: "How does this connect to other subjects?", icon: "🌐", variant: "accent" as const },
          ...baseSuggestions.slice(2)
        ];
      }
      
      return baseSuggestions;
    };
    
    const suggestions = getSmartSuggestions(topic.title);
    
    const welcomeResponse = {
      role: 'assistant' as const,
      content: `${topic.emoji} **Fantastic choice!** I'm thrilled to explore ${topic.title} with you!\n\n${topic.desc} - and there's so much fascinating stuff to discover together!\n\nWhat sounds exciting to you? I've got some engaging ways to jump in, or you can always ask me anything that sparks your curiosity:`,
      type: 'chat' as const,
      metadata: { 
        topicTitle: topic.title,
        suggestionChips: suggestions,
        showProgress: true
      }
    }
    
    setTimeout(() => {
      setConversation(prev => [...prev, welcomeResponse])
      addXP(10, 'selecting a topic')
      updateSessionProgress('topic_explored', topic.title)
    }, 500)
  }

  // Handle clicking on suggestion chips
  const handleSuggestionChipClick = (text: string) => {
    setUserMessage(text)
    // Automatically send the message
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // Track session progress and provide motivational feedback
  const updateSessionProgress = (action: string, context?: string) => {
    setSessionProgress(prev => {
      const updated = { ...prev }
      
      switch (action) {
        case 'question_answered':
          updated.questionsAnswered++
          break
        case 'topic_explored':
          if (context) updated.topicsExplored.add(context)
          break
        case 'tool_used':
          if (context) updated.toolsUsed.add(context)
          break
      }
      
      updated.lastActivity = Date.now()
      return updated
    })
  }

  // Enhanced motivational progress messages with celebration
  const getProgressMessage = () => {
    const { questionsAnswered, topicsExplored, toolsUsed } = sessionProgress
    
    if (questionsAnswered >= 10) {
      return "🏆 Incredible! You're a learning champion with 10+ interactions! Your dedication is truly inspiring!"
    } else if (questionsAnswered >= 5) {
      return "🔥 Wow, you're absolutely crushing it! 5+ questions answered - your curiosity is contagious!"
    } else if (questionsAnswered >= 3) {
      return "⭐ Fantastic progress! You've completed 3 activities - I can see your confidence growing!"
    } else if (topicsExplored.size >= 3) {
      return "🌟 You're such a curious explorer! Multiple topics discovered - that's the spirit of lifelong learning!"
    } else if (topicsExplored.size >= 2) {
      return "🚀 Awesome exploration! You're branching out across different subjects - so impressive!"
    } else if (toolsUsed.size >= 2) {
      return "🛠️ Smart learner! Using different tools shows you know how to maximize your learning - well done!"
    }
    
    return null
  }

  const handleGenerateQuestion = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '🌟 **Let\'s get this learning adventure started!** \n\nI\'d love to create the perfect question for you, but first - what topic has caught your attention? You can pick any subject above that sparks your curiosity, or simply tell me what you\'re interested in exploring today! 🚀',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    // 🛑 BLOCKING LOGIC: Check if student needs to answer current question first
    if (studentSession.currentQuestionId && !studentSession.currentQuestionAnswered) {
      setShowSkipWarning(true)
      const warningMessage = {
        role: 'assistant' as const,
        content: "🛑 **Please answer the current question before requesting a new one!**\n\nI notice you haven't answered the current question yet. Let's complete that first to build on your learning progress!\n\n💡 *Answering questions helps me understand your strengths and areas for improvement, so I can provide better personalized questions for you.*",
        type: 'chat' as const
      }
      setConversation(prev => [...prev, warningMessage])
      
      // Auto-hide warning after 3 seconds
      setTimeout(() => setShowSkipWarning(false), 3000)
      return
    }

    setIsGenerating(true)
    setCurrentDifficulty(difficulty)

    try {
      // Create comprehensive content context that includes user's original learning goal
      const contentContext = originalStudentPrompt 
        ? `Student's original learning goal: "${originalStudentPrompt}". Current study context: ${studySession.studyContext}. The student specifically wants to learn: ${originalStudentPrompt}`
        : `Learning about ${studySession.studyContext}. Generate engaging questions that help students understand key concepts.`

      const result = await aiAgent.generateQuestion(
        studySession.studyContext, 
        difficulty, 
        contentContext,
        studySession.questionsAsked,
        studentSession // Pass student session for context-aware generation
      )
      
      if (result.success && result.question) {
        const question = result.question as Question
        const encouragement = result.encouragement || `Here's a ${difficulty} question for you!`
        
        const questionMessage = {
          role: 'assistant' as const,
          content: `${encouragement || `🎯 Here's an engaging ${difficulty} question tailored just for you!`}\n\n**${difficulty.toUpperCase()} Challenge:**\n\n${question.question}\n\n💡 *Take your time to think through this - I believe in your ability to tackle it!*`,
          type: 'question' as const,
          metadata: { question, encouragement }
        }
        
        setConversation(prev => [...prev, questionMessage])
        setStudySession(prev => ({
          ...prev,
          currentQuestion: question,
          questionsAsked: [...prev.questionsAsked, question]
        }))
        
        // 🎯 Update student session to track new question
        setStudentSession(prev => ({
          ...prev,
          currentQuestionId: question.id,
          currentQuestionAnswered: false,
          questionStartTime: Date.now()
        }))
        
        setShowAnswer(false)
        setUserAnswer('')
        
        addXP(5, 'generating a question')
      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: `Sorry, I couldn't generate a question: ${result.error}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage = {
        role: 'assistant' as const,
        content: `Error generating question: ${errorMsg}`,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!studySession.currentQuestion || !userAnswer.trim()) return

    setIsGenerating(true)

    try {
      const result = await aiAgent.checkAnswer(
        studySession.currentQuestion,
        userAnswer,
        { 
          difficulty: currentDifficulty,
          originalLearningGoal: originalStudentPrompt // Add context from our continuity system
        },
        studentSession, // Pass current session state
        studentSession.questionStartTime || undefined // Pass start time for response time calculation
      )
      
      if (result.success && result.feedback) {
        const feedback = result.feedback
        
        // Create comprehensive feedback message with enhanced display
        const ratingStars = '⭐'.repeat(feedback.rating || 3)
        const correctnessIcon = feedback.isCorrect ? '✅' : '❌'
        
        const feedbackContent = `${correctnessIcon} **${feedback.encouragement || 'Thank you for your answer!'}**

${ratingStars} **Rating: ${feedback.rating || 3}/5**

🧠 **Explanation:** ${feedback.explanation || 'Keep learning and improving!'}

💡 **Study Tip:** ${feedback.studyTip || 'Review the key concepts and try similar questions.'}

🚀 **${feedback.confidenceBoost || 'You are making progress in your learning journey!'}**

${result.performanceMessage ? `\n📈 **Performance:** ${result.performanceMessage}` : ''}
${result.nextSteps ? `\n🎯 **Next Steps:** ${result.nextSteps}` : ''}`

        const feedbackMessage = {
          role: 'assistant' as const,
          content: feedbackContent,
          type: 'feedback' as const,
          metadata: { 
            ...feedback, 
            performanceMessage: result.performanceMessage,
            nextSteps: result.nextSteps,
            showThumbsButtons: true,
            suggestedActions: feedback.isCorrect ? 
              [
                { label: '🎯 Try Harder Question', action: 'hard_quiz' },
                { label: '🃏 Create Flashcards', action: 'generate_flashcards' }
              ] : 
              [
                { label: '🧠 Get More Examples', action: 'explain_more' },
                { label: '📝 Try Similar Question', action: 'easy_quiz' }
              ]
          }
        }
        
        setConversation(prev => [...prev, feedbackMessage])
        setShowAnswer(true)

        // 🎯 Update student session with answer result
        if (result.updatedSessionState) {
          setStudentSession(result.updatedSessionState)
        }

        // Store session insights if provided
        if (result.sessionInsights) {
          setSessionInsights(result.sessionInsights)
        }

        // Award XP based on AI rating and performance
        let xpGain = 5 // Base participation points
        const rating = feedback.rating || 3
        
        // XP based on rating (1-5 stars) and difficulty
        if (rating >= 4) {
          xpGain = currentDifficulty === 'easy' ? 15 : currentDifficulty === 'medium' ? 25 : 40
          if (feedback.isCorrect) {
            setStudySession(prev => ({ ...prev, streak: prev.streak + 1 }))
          }
        } else if (rating >= 3) {
          xpGain = currentDifficulty === 'easy' ? 10 : currentDifficulty === 'medium' ? 15 : 20
        } else {
          xpGain = 5 // Effort points for trying
          setStudySession(prev => ({ ...prev, streak: 0 }))
        }
        
        // Bonus XP for perfect answers
        if (feedback.isCorrect && rating === 5) {
          xpGain += 5 // Bonus for excellence
        }
        
        addXP(xpGain, `answering a ${currentDifficulty} question ${feedback.isCorrect ? 'correctly' : ''}`)

        // Update progress
        await aiAgent.updateProgress('answer_question', {
          isCorrect: feedback.isCorrect,
          topic: studySession.currentQuestion?.topic,
          difficulty: currentDifficulty,
          timeSpent: 2
        })

        // Update difficulty based on performance
        if (feedback.rating >= 4 && currentDifficulty === 'easy') {
          setCurrentDifficulty('medium')
        } else if (feedback.rating >= 4 && currentDifficulty === 'medium') {
          setCurrentDifficulty('hard')
        } else if (feedback.rating < 3 && currentDifficulty === 'hard') {
          setCurrentDifficulty('medium')
        } else if (feedback.rating < 3 && currentDifficulty === 'medium') {
          setCurrentDifficulty('easy')
        }

      } else if (result.fallbackFeedback) {
        // Use fallback feedback when API has issues but provides backup
        const feedback = result.fallbackFeedback
        
        const fallbackContent = `⚠️ **I'm having trouble with detailed analysis right now, but here's some feedback:**

🧠 **${feedback.encouragement}**

📚 **Explanation:** ${feedback.explanation}

💡 **Study Tip:** ${feedback.studyTip}

🌟 **${feedback.confidenceBoost}**

${result.message ? `\n💬 ${result.message}` : ''}`

        const fallbackMessage = {
          role: 'assistant' as const,
          content: fallbackContent,
          type: 'feedback' as const,
          metadata: { 
            ...feedback,
            isFallback: true,
            suggestedActions: [
              { label: '🔄 Try Again Later', action: 'retry_check' },
              { label: '🧠 Get More Examples', action: 'explain_more' }
            ]
          }
        }
        
        setConversation(prev => [...prev, fallbackMessage])
        setShowAnswer(true)
        addXP(5, 'attempting to answer (system issues)')
      } else {
        throw new Error(result.error || 'Failed to check answer')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('Answer checking error:', error)
      
      const errorMessage = {
        role: 'assistant' as const,
        content: `🔧 **I'm having trouble checking your answer right now.**

Your response "${userAnswer}" has been noted! Here's what you can do:

• **Try submitting again** - sometimes it works on retry
• **Continue learning** - your effort counts regardless
• **Ask for examples** - I can provide more context on this topic

Technical details: ${errorMsg}`,
        type: 'chat' as const,
        metadata: {
          isError: true,
          suggestedActions: [
            { label: '🔄 Try Again', action: 'retry_submission' },
            { label: '🧠 Get Examples', action: 'explain_more' },
            { label: '📝 New Question', action: 'easy_quiz' }
          ]
        }
      }
      setConversation(prev => [...prev, errorMessage])
      
      // Still award some participation XP
      addXP(3, 'attempting to answer')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    // Check if we're in tool prompt mode
    if (toolPromptMode && selectedTool) {
      console.log(`🎯 Processing tool request: ${selectedTool} with prompt: "${userMessage}"`)
      
      // Execute the tool with custom prompt
      await handleToolWithCustomPrompt(selectedTool, userMessage)
      
      // Reset tool state
      setSelectedTool(null)
      setToolPromptMode(false)
      setToolCustomPrompt('')
      setUserMessage('')
      
      return // Exit early, tool execution is complete
    }

    // Regular chat message handling
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      type: 'chat' as const
    }

    setConversation(prev => [...prev, newUserMessage])
    
    // Show typing indicator
    setShowTypingIndicator(true)
    
    // Enhanced topic extraction and learning context capture
    const extractLearningContext = (message: string) => {
      const lowercaseMessage = message.toLowerCase()
      const learningKeywords = [
        'learn', 'understand', 'explain', 'teach', 'help', 'study', 'practice',
        'what is', 'how to', 'how does', 'why', 'can you explain', 'tell me about',
        'i want to', 'i need to', 'help me', 'show me', 'guide me'
      ]
      
      const hasLearningIntent = learningKeywords.some(keyword => 
        lowercaseMessage.includes(keyword)
      ) || message.includes('?')
      
      return hasLearningIntent && message.length > 15
    }

    // Capture original student prompt if this is the first substantive learning question
    if (!originalStudentPrompt && extractLearningContext(userMessage)) {
      setOriginalStudentPrompt(userMessage)
      console.log('📝 Captured original student prompt:', userMessage)
      
      // Auto-extract and set study context from the prompt
      const extractTopicFromPrompt = (prompt: string) => {
        const patterns = [
          /(?:learn|study|understand|explain|teach me|help me with|about|tell me about)\s+(.+?)(?:\.|$|\?|,)/i,
          /(?:what is|what are|how to|how does|why)\s+(.+?)(?:\?|$|\.|,)/i,
          /(?:i want to|i need to)\s+(?:learn|study|understand)\s+(.+?)(?:\.|$|\?|,)/i
        ]
        
        for (const pattern of patterns) {
          const match = prompt.match(pattern)
          if (match && match[1]) {
            return match[1].trim()
          }
        }
        return null
      }
      
      const extractedTopic = extractTopicFromPrompt(userMessage)
      if (extractedTopic && !studySession.studyContext) {
        setStudySession(prev => ({ ...prev, studyContext: extractedTopic }))
        console.log('🎯 Auto-extracted study context:', extractedTopic)
      }
    }

    // Track session progress
    updateSessionProgress('question_answered')
    
    // Always update the last student question for context
    setLastStudentQuestion(userMessage)
    
    setUserMessage('')
    setIsGenerating(true)

    try {
      // Enhanced context with original learning objective
      const currentContext = getCurrentLearningContext()
      const enhancedStudyContext = originalStudentPrompt ? 
        `Student's original learning goal: "${originalStudentPrompt}". Current session context: ${studySession.studyContext || 'General conversation'}` :
        studySession.studyContext || 'General conversation'
        
      const result = await aiAgent.askTutor(
        userMessage,
        enhancedStudyContext,
        { questionsAnswered: studySession.questionsAsked.length },
        {
          // Enhanced context
          userId: 'default',
          sessionId: `session_${studySession.sessionStartTime}`,
          teachingStyle: selectedTeachingStyle,
          conversationHistory: studySession.conversationHistory,
          userPreferences: {
            difficulty: currentDifficulty,
            sessionDuration: Math.floor((Date.now() - new Date(studySession.sessionStartTime).getTime()) / 60000),
            topicComplexity: 'medium',
            originalLearningGoal: originalStudentPrompt
          },
          enableGamification: enableEnhancements.gamification,
          enableEmotionalIntelligence: enableEnhancements.emotionalIntelligence
        }
      )

      if (result.success) {
        const tutorMessage = {
          role: 'assistant' as const,
          content: result.response || 'I\'m here to help!',
          type: 'chat' as const,
          metadata: {
            suggestedActions: result.suggestedActions,
            followUpEncouragement: result.followUpEncouragement,
            confidenceLevel: result.confidenceLevel,
            gamification: result.gamification,
            contentAdaptations: result.contentAdaptations
          }
        }
        
        // Update session with enhanced data
        if (result) {
          setStudySession(prev => ({
            ...prev,
            conversationHistory: [...prev.conversationHistory, {
              role: 'assistant',
              content: result.response || '',
              timestamp: new Date().toISOString()
            }],
            totalInteractions: prev.totalInteractions + 1,
            // Update with gamification results
            xpPoints: result.gamification?.xpGained ? prev.xpPoints + result.gamification.xpGained : prev.xpPoints,
            achievements: result.gamification?.newAchievements ? 
              [...prev.achievements, ...result.gamification.newAchievements.map((a: any) => a.name)] : prev.achievements
          }))
          
          // Update session insights
          if (result.metadata) {
            setSessionInsights(result.metadata)
          }
        }
        
        setConversation(prev => [...prev, tutorMessage])
        addXP(result.gamification?.xpGained || 3, 'engaging in conversation')
        
        // Show progress message if available
        const progressMsg = getProgressMessage()
        if (progressMsg) {
          setTimeout(() => {
            const progressMessage = {
              role: 'assistant' as const,
              content: `${progressMsg}\n\nKeep up the fantastic learning! 🚀`,
              type: 'chat' as const,
              metadata: { isProgressMessage: true }
            }
            setConversation(prev => [...prev, progressMessage])
          }, 1500)
        }
        
        // Show feedback buttons for the response
        setTimeout(() => {
          setShowFeedbackButtons(tutorMessage.content.substring(0, 50))
        }, 2000)
      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || `Sorry, I couldn't respond: ${result.error}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse = {
        role: 'assistant' as const,
        content: `Error: ${errorMsg}`,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorResponse])
    } finally {
      setIsGenerating(false)
      setShowTypingIndicator(false)
    }
  }

  // 🔁 Enhanced Interactive Functions
  const handleGetMoreExamples = async (inputText?: string) => {
    if (!inputText && !studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '🌟 **I\'d love to create amazing examples for you!** \n\nTo make them super relevant and helpful, could you first choose a topic that interests you? Pick any subject above or tell me what you\'d like to explore - then I can craft perfect examples just for your learning goals! 🎯',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)
    try {
      // Get the current learning context
      const currentContext = getCurrentLearningContext()
      const enhancedPrompt = inputText || `Please provide more detailed examples to help with this student's learning goal: "${currentContext}"`
      
      console.log('🔍 Calling getMoreExamples with enhanced context:', {
        inputText: enhancedPrompt,
        originalContext: currentContext,
        studyContext: studySession.studyContext,
        difficulty: currentDifficulty
      })

      const result = await aiAgent.getMoreExamples(
        enhancedPrompt,
        studySession.studyContext || 'General Learning',
        `Student's original learning goal: "${currentContext}". Provide examples at ${currentDifficulty} level that directly address this specific request.`
      )
      
      console.log('📥 getMoreExamples result:', result)
      
      if (result.success && result.response) {
        setInteractiveContent(prev => ({ ...prev, examples: result.response }))
        setActiveInteractiveTab('examples')
        
        const examplesMessage = {
          role: 'assistant' as const,
          content: `🧠 **Perfect! I've crafted these detailed examples just for you:**\n\n${result.response}\n\n✨ *These examples are designed to make complex concepts crystal clear and memorable!*`,
          type: 'chat' as const,
          metadata: { 
            contentType: 'examples',
            suggestedActions: [
              { label: '🃏 Create Flashcards from this', action: 'generate_flashcards' },
              { label: '📝 Test me with questions', action: 'generate_questions' }
            ]
          }
        }
        setConversation(prev => [...prev, examplesMessage])
        addXP(20, 'generating helpful examples')
      } else {
        console.warn('❌ getMoreExamples failed:', result)
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t generate examples. Please try again!',
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('💥 getMoreExamples error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Error generating examples. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateFlashcards = async (inputText?: string) => {
    if (!inputText && !studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '🃏 **Ready to create awesome flashcards for you!** \n\nTo make them perfectly tailored to your learning, I\'ll need to know what topic has captured your interest. Choose any subject above or simply tell me what you\'d like to study - then I\'ll create engaging flashcards that make memorizing fun and effective! ✨',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)
    try {
      // Get the current learning context
      const currentContext = getCurrentLearningContext()
      const enhancedPrompt = inputText || `Create flashcards to help with this student's learning goal: "${currentContext}"`
      
      console.log('🔍 Calling createFlashcards with enhanced context:', {
        inputText: enhancedPrompt,
        originalContext: currentContext,
        studyContext: studySession.studyContext,
        difficulty: currentDifficulty
      })

      const result = await aiAgent.createFlashcards(
        enhancedPrompt,
        studySession.studyContext || 'General Learning',
        `Student's original learning goal: "${currentContext}". Create flashcards at ${currentDifficulty} level that directly help with this specific request.`
      )
      
      console.log('📥 createFlashcards result:', result)
      
      if (result.success && (result.response || result.flashcards)) {
        // Use either result.response or result.flashcards
        const flashcardsContent = result.response || result.flashcards
        setInteractiveContent(prev => ({ ...prev, flashcards: flashcardsContent }))
        setActiveInteractiveTab('flashcards')
        
        // Parse the flashcard content into structured data
        const parsedFlashcards = parseFlashcards(flashcardsContent || '')
        
        const flashcardsMessage = {
          role: 'assistant' as const,
          content: `🃏 **I've created ${parsedFlashcards.length} interactive flashcards to help you memorize key concepts!** Click on each card to flip it and see the answer with memory techniques.`,
          type: 'flashcard_set' as const,
          flashcards: parsedFlashcards,
          metadata: { 
            contentType: 'flashcards',
            cardCount: parsedFlashcards.length,
            suggestedActions: [
              { label: '🧠 Get More Examples', action: 'explain_more' },
              { label: '📝 Practice Questions', action: 'generate_questions' }
            ]
          }
        }
        setConversation(prev => [...prev, flashcardsMessage])
        addXP(25, 'creating study flashcards')
      } else {
        console.warn('❌ createFlashcards failed:', result)
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t create flashcards. Please try again!',
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('💥 createFlashcards error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Error creating flashcards. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePracticeQuestions = async (inputText?: string, difficulty?: 'easy' | 'medium' | 'hard') => {
    if (!inputText && !studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '📝 **Excited to create challenging practice questions for you!** \n\nTo design questions that perfectly match your learning goals, let me know what topic you\'re passionate about. Pick any subject above or share what you want to master - then I\'ll craft engaging questions that boost your understanding and confidence! 🚀',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)
    try {
      // Get the current learning context
      const currentContext = getCurrentLearningContext()
      const enhancedPrompt = inputText || `Create practice questions to help with this student's learning goal: "${currentContext}"`
      
      console.log('🔍 Calling generatePracticeQuestions with enhanced context:', {
        inputText: enhancedPrompt,
        originalContext: currentContext,
        studyContext: studySession.studyContext,
        currentDifficulty: currentDifficulty,
        requestedDifficulty: difficulty || currentDifficulty
      })

      const result = await aiAgent.generatePracticeQuestions(
        enhancedPrompt,
        studySession.studyContext || 'General Learning',
        `Student's original learning goal: "${currentContext}". Create questions at ${difficulty || currentDifficulty} level that directly test understanding of this specific request.`,
        difficulty || currentDifficulty,
        5
      )
      
      console.log('📥 generatePracticeQuestions result:', result)
      
      if (result.success && result.response) {
        setInteractiveContent(prev => ({ ...prev, practiceQuestions: result.response }))
        setActiveInteractiveTab('questions')
        
        const questionsMessage = {
          role: 'assistant' as const,
          content: `📝 **Awesome! Here are thoughtfully designed practice questions for you:**\n\n${result.response}\n\n🎯 *These questions will help solidify your understanding and build confidence in the topic!*`,
          type: 'chat' as const,
          metadata: { 
            contentType: 'practice_questions',
            suggestedActions: [
              { label: '🧠 Need more examples?', action: 'explain_more' },
              { label: '🃏 Make flashcards too', action: 'generate_flashcards' }
            ]
          }
        }
        setConversation(prev => [...prev, questionsMessage])
        addXP(30, 'generating practice questions')
      } else {
        console.warn('❌ generatePracticeQuestions failed:', result)
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t generate practice questions. Please try again!',
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('💥 generatePracticeQuestions error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Error generating practice questions. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  // Enhanced tool selection workflow
  const handleToolSelection = (toolType: string) => {
    setSelectedTool(toolType)
    setToolPromptMode(true)
    setUserMessage('') // Clear any existing message
    console.log(`🔧 Selected tool: ${toolType}, entering prompt mode`)
  }

  const handleCancelToolSelection = () => {
    setSelectedTool(null)
    setToolPromptMode(false)
    setToolCustomPrompt('')
    setUserMessage('')
    console.log('❌ Cancelled tool selection')
  }

  // Enhanced tool execution with custom prompts
  const handleToolWithCustomPrompt = async (toolType: string, customPrompt: string) => {
    console.log(`🚀 Executing tool: ${toolType} with custom prompt: "${customPrompt}"`)
    
    const currentContext = getCurrentLearningContext()
    
    // Add tool usage message to conversation
    const toolMessage = {
      role: 'user' as const,
      content: `🔧 **${getToolDisplayName(toolType)}**: ${customPrompt}`,
      type: 'chat' as const,
      metadata: { toolType, customPrompt }
    }
    setConversation(prev => [...prev, toolMessage])
    
    try {
      setIsGenerating(true)
      
      switch (toolType) {
        case 'flashcards':
          await handleCreateFlashcardsWithPrompt(customPrompt, currentContext)
          break
        case 'examples':
          await handleGetMoreExamplesWithPrompt(customPrompt, currentContext)
          break
        case 'practice_questions':
          await handleGeneratePracticeQuestionsWithPrompt(customPrompt, currentContext)
          break
        case 'step_by_step':
          await handleGenerateStepByStepGuideWithPrompt(customPrompt, currentContext)
          break
        default:
          console.warn(`Unknown tool type: ${toolType}`)
      }
    } catch (error) {
      console.error(`Error executing ${toolType}:`, error)
      const errorMessage = {
        role: 'assistant' as const,
        content: `Sorry, I encountered an error while ${getToolDisplayName(toolType).toLowerCase()}. Please try again!`,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to get tool display names
  const getToolDisplayName = (toolType: string): string => {
    const toolNames = {
      'flashcards': 'Creating Flashcards',
      'examples': 'Getting More Examples', 
      'practice_questions': 'Generating Practice Questions',
      'step_by_step': 'Creating Step-by-Step Guide'
    }
    return toolNames[toolType as keyof typeof toolNames] || 'Using Tool'
  }

  // Helper function to get engaging tool placeholders
  const getToolPlaceholder = (toolType: string): string => {
    const placeholders = {
      'flashcards': '🃏 What topic should I turn into awesome flashcards? (e.g., "photosynthesis", "French vocabulary")',
      'examples': '🧠 What concept would you like clear examples of? (e.g., "machine learning", "poetry analysis")', 
      'practice_questions': '📝 What subject should I create engaging questions about? (e.g., "calculus", "world history")',
      'step_by_step': '📋 What process should I break down step-by-step? (e.g., "solving equations", "essay writing")'
    }
    return placeholders[toolType as keyof typeof placeholders] || '✨ What would you like me to help you with today?'
  }

  // Enhanced tool execution functions with custom prompts
  const handleCreateFlashcardsWithPrompt = async (customPrompt: string, currentContext: string) => {
    const enhancedPrompt = `Create comprehensive flashcards for: "${customPrompt}" within the learning context of "${currentContext}"`
    
    console.log('🃏 Creating flashcards with enhanced prompt:', enhancedPrompt)
    
    const result = await aiAgent.createFlashcards(
      enhancedPrompt,
      studySession.studyContext || 'General Learning',
      `Student's custom request: "${customPrompt}". Student's original learning goal: "${currentContext}". Create flashcards at ${currentDifficulty} level that directly address this specific request.`
    )
    
    if (result.success && (result.response || result.flashcards)) {
      const flashcardsContent = result.response || result.flashcards
      setInteractiveContent(prev => ({ ...prev, flashcards: flashcardsContent }))
      setActiveInteractiveTab('flashcards')
      
      const parsedFlashcards = parseFlashcards(flashcardsContent || '')
      
      const flashcardsMessage = {
        role: 'assistant' as const,
        content: `🃏 **I've created ${parsedFlashcards.length} interactive flashcards for "${customPrompt}"!** Click on each card to flip it and see the answer with memory techniques.`,
        type: 'flashcard_set' as const,
        flashcards: parsedFlashcards,
        metadata: { 
          contentType: 'flashcards',
          cardCount: parsedFlashcards.length,
          customPrompt,
          suggestedActions: [
            { label: '🧠 Get More Examples', action: 'select_tool_examples' },
            { label: '📝 Practice Questions', action: 'select_tool_practice_questions' }
          ]
        }
      }
      setConversation(prev => [...prev, flashcardsMessage])
      addXP(25, 'creating custom flashcards')
    } else {
      const errorMessage = {
        role: 'assistant' as const,
        content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t create flashcards for that topic. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    }
  }

  const handleGetMoreExamplesWithPrompt = async (customPrompt: string, currentContext: string) => {
    const enhancedPrompt = `Provide detailed examples and explanations for: "${customPrompt}" relating to "${currentContext}"`
    
    console.log('🧠 Getting examples with enhanced prompt:', enhancedPrompt)
    
    const result = await aiAgent.getMoreExamples(
      enhancedPrompt,
      studySession.studyContext || 'General Learning',
      `Student's custom request: "${customPrompt}". Student's original learning goal: "${currentContext}". Provide examples at ${currentDifficulty} level that directly address this specific request.`
    )
    
    if (result.success && result.response) {
      setInteractiveContent(prev => ({ ...prev, examples: result.response }))
      setActiveInteractiveTab('examples')
      
      const examplesMessage = {
        role: 'assistant' as const,
        content: `🧠 **Here are detailed examples for "${customPrompt}":**\n\n${result.response}`,
        type: 'chat' as const,
        metadata: { 
          contentType: 'examples',
          customPrompt,
          suggestedActions: [
            { label: '🃏 Create Flashcards', action: 'select_tool_flashcards' },
            { label: '📝 Practice Questions', action: 'select_tool_practice_questions' }
          ]
        }
      }
      setConversation(prev => [...prev, examplesMessage])
      addXP(20, 'generating custom examples')
    } else {
      const errorMessage = {
        role: 'assistant' as const,
        content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t generate examples for that topic. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    }
  }

  const handleGeneratePracticeQuestionsWithPrompt = async (customPrompt: string, currentContext: string, difficulty?: 'easy' | 'medium' | 'hard') => {
    const enhancedPrompt = `Generate practice questions about: "${customPrompt}" at ${difficulty || currentDifficulty} level for "${currentContext}"`
    
    console.log('📝 Generating practice questions with enhanced prompt:', enhancedPrompt)
    
    const result = await aiAgent.generatePracticeQuestions(
      enhancedPrompt,
      studySession.studyContext || 'General Learning',
      `Student's custom request: "${customPrompt}". Student's original learning goal: "${currentContext}". Create questions at ${difficulty || currentDifficulty} level that directly test understanding of this specific request.`,
      difficulty || currentDifficulty,
      5
    )
    
    if (result.success && result.response) {
      setInteractiveContent(prev => ({ ...prev, practiceQuestions: result.response }))
      setActiveInteractiveTab('questions')
      
      const questionsMessage = {
        role: 'assistant' as const,
        content: `📝 **I've created practice questions for "${customPrompt}":**\n\n${result.response}`,
        type: 'chat' as const,
        metadata: { 
          contentType: 'practice_questions',
          customPrompt,
          suggestedActions: [
            { label: '🧠 Get More Examples', action: 'select_tool_examples' },
            { label: '🃏 Create Flashcards', action: 'select_tool_flashcards' }
          ]
        }
      }
      setConversation(prev => [...prev, questionsMessage])
      addXP(30, 'generating custom practice questions')
    } else {
      const errorMessage = {
        role: 'assistant' as const,
        content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t generate practice questions for that topic. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    }
  }

  const handleGenerateStepByStepGuideWithPrompt = async (customPrompt: string, currentContext: string) => {
    const enhancedPrompt = `Create a comprehensive step-by-step guide for: "${customPrompt}" within the learning context of "${currentContext}"`
    
    console.log('📋 Creating step-by-step guide with enhanced prompt:', enhancedPrompt)
    
    const result = await aiAgent.generateStepByStepGuide(
      enhancedPrompt,
      studySession.studyContext || 'General Learning',
      `Student's custom request: "${customPrompt}". Student's original learning goal: "${currentContext}". Create a step-by-step guide at ${currentDifficulty} level that directly addresses this specific request.`,
      currentDifficulty
    )
    
    if (result.success && result.response) {
      setInteractiveContent(prev => ({ ...prev, stepByStepGuide: result.response }))
      setActiveInteractiveTab('stepbystep')
      
      const stepByStepMessage = {
        role: 'assistant' as const,
        content: `📋 **I've created a step-by-step guide for "${customPrompt}"!**\n\n${result.response}`,
        type: 'chat' as const,
        metadata: { 
          contentType: 'step_by_step_guide',
          customPrompt,
          suggestedActions: [
            { label: '🧠 Get More Examples', action: 'select_tool_examples' },
            { label: '🃏 Create Flashcards', action: 'select_tool_flashcards' },
            { label: '📝 Practice Questions', action: 'select_tool_practice_questions' }
          ]
        }
      }
      setConversation(prev => [...prev, stepByStepMessage])
      addXP(25, 'creating custom step-by-step guide')
    } else {
      const errorMessage = {
        role: 'assistant' as const,
        content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t create a step-by-step guide for that topic. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    }
  }

  // 📋 Handle Step-by-Step Guide Generation
  const handleGenerateStepByStepGuide = async (inputText?: string) => {
    if (!inputText && !studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '📚 Please provide some content or select a topic first so I can create a step-by-step guide!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)
    try {
      // Get the current learning context
      const currentContext = getCurrentLearningContext()
      const enhancedPrompt = inputText || `Create a step-by-step guide for this student's learning goal: "${currentContext}"`
      
      console.log('🔍 Calling generateStepByStepGuide with enhanced context:', {
        inputText: enhancedPrompt,
        originalContext: currentContext,
        studyContext: studySession.studyContext,
        difficulty: currentDifficulty
      })

      const result = await aiAgent.generateStepByStepGuide(
        enhancedPrompt,
        studySession.studyContext || 'General Learning',
        `Student's original learning goal: "${currentContext}". Create a step-by-step guide at ${currentDifficulty} level that directly addresses this specific request.`,
        currentDifficulty
      )
      
      console.log('📥 generateStepByStepGuide result:', result)
      
      if (result.success && result.response) {
        setInteractiveContent(prev => ({ ...prev, stepByStepGuide: result.response }))
        setActiveInteractiveTab('stepbystep')
        
        const stepByStepMessage = {
          role: 'assistant' as const,
          content: `📋 **Here's your step-by-step guide:**\n\n${result.response}`,
          type: 'chat' as const,
          metadata: { 
            contentType: 'step_by_step_guide',
            suggestedActions: [
              { label: '🧠 Get More Examples', action: 'select_tool_examples' },
              { label: '🃏 Create Flashcards', action: 'select_tool_flashcards' },
              { label: '📝 Practice Questions', action: 'select_tool_practice_questions' }
            ]
          }
        }
        setConversation(prev => [...prev, stepByStepMessage])
        addXP(25, 'generating step-by-step guide')
      } else {
        console.warn('❌ generateStepByStepGuide failed:', result)
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || result.error || 'Sorry, I couldn\'t generate a step-by-step guide. Please try again!',
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('💥 generateStepByStepGuide error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Error generating step-by-step guide. Please try again!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  // Enhanced feedback handler
  const handleFeedback = async (rating: 'thumbs_up' | 'thumbs_down', responseContent: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType: 'thumbs',
          thumbsRating: rating,
          context: {
            topic: studySession.studyContext,
            difficulty: currentDifficulty,
            emotionalState: sessionInsights?.emotionalAnalysis?.primaryEmotion,
            teachingStyle: selectedTeachingStyle
          },
          metadata: {
            timestamp: new Date().toISOString(),
            sessionId: `session_${studySession.sessionStartTime}`,
            interactionType: 'chat',
            responseContent: responseContent.substring(0, 100)
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Show thank you message
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: result.thankYouMessage || 'Thank you for your feedback! 🙏',
          type: 'chat'
        }])
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
    
    setShowFeedbackButtons(null)
  }

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user'
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`px-4 py-3 rounded-lg ${
          isUser 
            ? 'max-w-xs lg:max-w-md bg-primary-600 text-white' 
            : message.type === 'welcome'
              ? 'max-w-full lg:max-w-4xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 shadow-lg'
            : message.type === 'question' 
              ? 'max-w-full lg:max-w-4xl bg-blue-50 border border-blue-200' 
              : message.type === 'feedback' 
                ? 'max-w-full lg:max-w-4xl bg-green-50 border border-green-200' 
                : message.type === 'achievement'
                  ? 'max-w-full lg:max-w-4xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-lg'
                  : message.type === 'flashcard_set'
                    ? 'max-w-full lg:max-w-4xl bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 shadow-lg'
                    : 'max-w-full lg:max-w-4xl bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Render Interactive Flashcards */}
          {message.type === 'flashcard_set' && message.flashcards && (
            <div className="mt-4">
              <InteractiveFlashcard 
                cards={message.flashcards} 
                onComplete={() => {
                  // Optional: Add XP bonus when all cards are viewed
                  console.log('🎉 All flashcards completed!')
                }}
              />
            </div>
          )}
          
          {/* Topic selection for welcome message */}
          {message.type === 'welcome' && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {learningTopics.map((topic, topicIndex) => (
                <button
                  key={topicIndex}
                  onClick={() => handleTopicSelect(topic)}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{topic.emoji}</div>
                  <div className="font-medium text-sm text-gray-900">{topic.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{topic.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Modern suggestion chips for topic responses */}
          {message.metadata?.suggestionChips && (
            <SuggestionChips
              suggestions={message.metadata.suggestionChips}
              onChipClick={handleSuggestionChipClick}
              disabled={isGenerating}
              maxColumns={2}
            />
          )}
          
          {/* Render MCQ options for questions */}
          {message.type === 'question' && message.metadata?.question?.type === 'mcq' && (
            <div className="mt-3 space-y-2">
              {message.metadata.question.options?.map((option: string, optIndex: number) => (
                <button
                  key={optIndex}
                  onClick={() => setUserAnswer(String.fromCharCode(65 + optIndex))}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    userAnswer === String.fromCharCode(65 + optIndex) 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}) {option}
                </button>
              ))}
            </div>
          )}

          {/* Render suggested actions */}
          {message.metadata?.suggestedActions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.metadata.suggestedActions.map((action: any, actionIndex: number) => (
                <button
                  key={actionIndex}
                  onClick={() => {
                    if (action.action === 'generate_questions' || action.action === 'easy_quiz') {
                      handleGenerateQuestion('easy')
                    } else if (action.action === 'medium_quiz') {
                      handleGenerateQuestion('medium')
                    } else if (action.action === 'hard_quiz') {
                      handleGenerateQuestion('hard')
                    } else if (action.action === 'explain_more' || action.action === 'select_tool_examples') {
                      handleToolSelection('examples')
                    } else if (action.action === 'generate_flashcards' || action.action === 'select_tool_flashcards') {
                      handleToolSelection('flashcards')
                    } else if (action.action === 'generate_practice_questions' || action.action === 'select_tool_practice_questions') {
                      handleToolSelection('practice_questions')
                    } else if (action.action === 'step_by_step') {
                      handleGenerateStepByStepGuide()
                    } else if (action.action === 'select_tool_step_by_step') {
                      handleToolSelection('step_by_step')
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    toolPromptMode && selectedTool && (
                      (action.action === 'select_tool_examples' && selectedTool === 'examples') ||
                      (action.action === 'select_tool_flashcards' && selectedTool === 'flashcards') ||
                      (action.action === 'select_tool_practice_questions' && selectedTool === 'practice_questions') ||
                      (action.action === 'select_tool_step_by_step' && selectedTool === 'step_by_step') ||
                      (action.action === 'explain_more' && selectedTool === 'examples') ||
                      (action.action === 'generate_flashcards' && selectedTool === 'flashcards') ||
                      (action.action === 'generate_practice_questions' && selectedTool === 'practice_questions')
                    )
                      ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Enhanced Feedback Buttons */}
          {!isUser && showFeedbackButtons === message.content.substring(0, 50) && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-gray-600">Was this helpful?</span>
              <button
                onClick={() => handleFeedback('thumbs_up', message.content)}
                className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
              >
                <ThumbsUp size={12} />
                <span>Yes</span>
              </button>
              <button
                onClick={() => handleFeedback('thumbs_down', message.content)}
                className="flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
              >
                <ThumbsDown size={12} />
                <span>No</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header with Gamification */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 FuturoPal AI Tutor</h1>
          </div>
          
          {/* Gamification Stats */}
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{studySession.level}</span>
                </div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 text-purple-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{studySession.xpPoints}</span>
                </div>
                <div className="text-xs text-gray-600">XP Points</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="h-5 w-5 text-orange-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{studySession.streak}</span>
                </div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{studySession.achievements.length}</span>
                </div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
            </div>
            
            {/* Enhanced XP Progress Bar with animations */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">Level {studySession.level}</span>
                <span className="font-bold text-purple-600">{studySession.xpPoints % 100}/{getXPForNextLevel(studySession.level) % 100} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 h-3 rounded-full transition-all duration-700 ease-out relative"
                  style={{ 
                    width: `${((studySession.xpPoints % 100) / 100) * 100}%`,
                    minWidth: '2px' 
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-pulse" />
                </div>
              </div>
              <div className="text-xs text-center mt-1 text-gray-500 italic">
                {studySession.xpPoints < 50 ? "🌱 Growing strong!" : studySession.xpPoints < 80 ? "🚀 Making great progress!" : "⭐ Almost to next level!"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp size={16} className="text-green-500" />
            <span>Difficulty: <span className="font-semibold capitalize text-primary-600">{currentDifficulty}</span></span>
          </div>
          <div className="flex items-center space-x-1">
            <Target size={16} className="text-blue-500" />
            <span>Questions: <span className="font-semibold text-blue-600">{studySession.questionsAsked.length}</span></span>
          </div>
          {originalStudentPrompt && !editingContext && (
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200" title={`Learning Goal: ${originalStudentPrompt}`}>
              <BookOpen size={16} className="text-purple-500" />
              <span className="text-purple-700 font-medium text-sm">
                🎯 Goal: {originalStudentPrompt.length > 30 
                  ? `${originalStudentPrompt.substring(0, 30)}...` 
                  : originalStudentPrompt}
              </span>
              <button
                onClick={() => {
                  setEditingContext(true)
                  setNewLearningGoal(originalStudentPrompt)
                }}
                className="text-purple-500 hover:text-purple-700 text-xs ml-1"
                title="Edit learning goal"
              >
                ✏️
              </button>
            </div>
          )}
          {editingContext && (
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <BookOpen size={16} className="text-purple-500" />
              <input
                type="text"
                value={newLearningGoal}
                onChange={(e) => setNewLearningGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateLearningGoal(newLearningGoal)
                  } else if (e.key === 'Escape') {
                    setEditingContext(false)
                    setNewLearningGoal('')
                  }
                }}
                placeholder="What do you want to learn?"
                className="text-sm bg-transparent border-none outline-none text-purple-700 placeholder-purple-400 min-w-0 flex-1"
                autoFocus
              />
              <button
                onClick={() => updateLearningGoal(newLearningGoal)}
                className="text-green-500 hover:text-green-700 text-xs"
                title="Save changes"
              >
                ✅
              </button>
              <button
                onClick={() => {
                  setEditingContext(false)
                  setNewLearningGoal('')
                }}
                className="text-red-500 hover:text-red-700 text-xs"
                title="Cancel editing"
              >
                ❌
              </button>
            </div>
          )}
          {studySession.studyContext && studySession.studyContext !== originalStudentPrompt && (
            <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Target size={16} className="text-blue-500" />
              <span className="text-blue-700 font-medium text-sm">
                📚 Studying: {studySession.studyContext}
              </span>
            </div>
          )}
          {toolPromptMode && selectedTool && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium">🔧 {getToolDisplayName(selectedTool)} Active</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Brain size={16} className="text-purple-500" />
            <span>Model: <span className="font-semibold text-purple-600">Futoralpal</span></span>
          </div>
        </div>
      </div>

      {/* Session Insights Panel */}
      {sessionInsights && studentSession.previousAnswers.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              📊 Learning Progress
            </h3>
            {showSkipWarning && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg px-3 py-1 animate-pulse">
                <span className="text-orange-700 text-sm font-medium">⚠️ Answer current question first!</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-green-600">{sessionInsights.overallAccuracy}%</div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-blue-600">{sessionInsights.totalQuestionsAnswered}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-purple-600">{sessionInsights.strongTopics.length}</div>
              <div className="text-sm text-gray-600">Strong Topics</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-orange-600">{sessionInsights.weakTopics.length}</div>
              <div className="text-sm text-gray-600">Focus Areas</div>
            </div>
          </div>

          {sessionInsights.recommendations && sessionInsights.recommendations.length > 0 && (
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
                Smart Recommendations
              </h4>
              <div className="space-y-1">
                {sessionInsights.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
              {sessionInsights.readyForNextLevel && (
                <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-2">
                  <span className="text-green-700 text-sm font-medium">🎉 Ready for more challenging questions!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Optimized Controls Sidebar */}
        <div className={`lg:col-span-1 space-y-3 ${
          // Mobile: Fixed overlay sidebar - Remove overflow-y-auto to prevent double scroll
          'lg:relative lg:translate-x-0 lg:bg-transparent ' + 
          (isMobileSidebarOpen 
            ? 'fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform translate-x-0' 
            : 'fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform -translate-x-full'
          ) + ' transition-transform duration-300 ease-in-out lg:transition-none'
        }`}>
          {/* Quick Action Bar - Always Visible */}
          <QuickActionBar 
            actions={generateSmartQuickActions(
              studySession.studyContext,
              sessionProgress.questionsAnswered,
              isGenerating,
              {
                onStartQuiz: () => {
                  handleGenerateQuestion(sessionProgress.questionsAnswered >= 5 ? 'medium' : 'easy')
                  setIsMobileSidebarOpen(false)
                },
                onCreateFlashcards: () => {
                  handleToolSelection('flashcards')
                  setIsMobileSidebarOpen(false)
                },
                onGetHelp: () => {
                  handleToolSelection('examples')
                  setIsMobileSidebarOpen(false)
                },
                onGetExamples: () => {
                  handleToolSelection('examples')
                  setIsMobileSidebarOpen(false)
                }
              }
            )}
          />

          {/* Compact Progress Display - Always Visible */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Trophy size={12} className="text-yellow-500" />
                <span>Level {studySession.level}</span>
              </div>
            </div>
            
            {/* Compact Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{studySession.xpPoints}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{studySession.streak}</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{studySession.achievements.length}</div>
                <div className="text-xs text-gray-500">Badges</div>
              </div>
            </div>
            
            {/* Compact Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((studySession.xpPoints % 100) / 100) * 100}%`,
                  minWidth: '2px'
                }}
              ></div>
            </div>
            <div className="text-xs text-center mt-1 text-gray-500">
              {studySession.xpPoints % 100}/100 to Level {studySession.level + 1}
            </div>
          </div>

          {/* Collapsible Accordion Sections */}
          <Accordion allowMultiple={false}>
            {/* Learning Tools Section */}
            <AccordionItem
              id="learning-tools"
              title="Learning Tools"
              icon={<Target size={16} className="text-blue-500" />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                {/* Compact Quiz Buttons */}
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    onClick={() => handleGenerateQuestion('easy')}
                    disabled={!studySession.studyContext || isGenerating}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Easy
                  </button>
                  <button 
                    onClick={() => handleGenerateQuestion('medium')}
                    disabled={!studySession.studyContext || isGenerating}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Medium
                  </button>
                  <button 
                    onClick={() => handleGenerateQuestion('hard')}
                    disabled={!studySession.studyContext || isGenerating}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Hard
                  </button>
                </div>
                
                {/* AI Tools Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button 
                    onClick={() => handleToolSelection('flashcards')}
                    disabled={isGenerating}
                    className={`p-2 text-xs rounded transition-all ${
                      selectedTool === 'flashcards' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    🃏 Cards
                  </button>
                  <button 
                    onClick={() => handleToolSelection('examples')}
                    disabled={isGenerating}
                    className={`p-2 text-xs rounded transition-all ${
                      selectedTool === 'examples' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    🧠 Examples
                  </button>
                  <button 
                    onClick={() => handleToolSelection('practice_questions')}
                    disabled={isGenerating}
                    className={`p-2 text-xs rounded transition-all ${
                      selectedTool === 'practice_questions' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    📝 Practice
                  </button>
                  <button 
                    onClick={() => handleToolSelection('step_by_step')}
                    disabled={isGenerating}
                    className={`p-2 text-xs rounded transition-all ${
                      selectedTool === 'step_by_step' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    📋 Guide
                  </button>
                </div>
                
                {selectedTool && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium">
                      ✨ {getToolDisplayName(selectedTool)}
                    </div>
                    <div className="text-xs text-blue-600">
                      Type your prompt in chat below!
                    </div>
                    <button
                      onClick={handleCancelToolSelection}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </AccordionItem>

            {/* Settings Section */}
            <AccordionItem
              id="settings"
              title="Settings"
              icon={<Settings size={16} className="text-gray-500" />}
              defaultOpen={false}
            >
              <div className="space-y-3">
                {/* Teaching Style */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teaching Style</label>
                  <select
                    id="teaching-style-compact"
                    value={selectedTeachingStyle}
                    onChange={(e) => setSelectedTeachingStyle(e.target.value as TeachingStyle)}
                    className="w-full p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Select teaching style for AI tutor"
                    title="Choose your preferred teaching style"
                  >
                    <option value="adaptive">🔄 Adaptive</option>
                    <option value="playful">🎮 Playful</option>
                    <option value="logical">🧠 Logical</option>
                    <option value="encouraging">💖 Encouraging</option>
                    <option value="professional">📚 Professional</option>
                    <option value="socratic">❓ Socratic</option>
                  </select>
                </div>
                
                {/* AI Features */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">AI Features</label>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableEnhancements.emotionalIntelligence}
                        onChange={(e) => setEnableEnhancements(prev => ({
                          ...prev,
                          emotionalIntelligence: e.target.checked
                        }))}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">🧠 Emotional Intelligence</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableEnhancements.gamification}
                        onChange={(e) => setEnableEnhancements(prev => ({
                          ...prev,
                          gamification: e.target.checked
                        }))}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">🎮 Gamification</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableEnhancements.adaptiveTeaching}
                        onChange={(e) => setEnableEnhancements(prev => ({
                          ...prev,
                          adaptiveTeaching: e.target.checked
                        }))}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">🎨 Adaptive Teaching</span>
                    </label>
                  </div>
                </div>
              </div>
            </AccordionItem>

            {/* AI Insights Section */}
            {(sessionInsights || studySession.achievements.length > 0) && (
              <AccordionItem
                id="insights"
                title="Insights & Achievements"
                icon={<Lightbulb size={16} className="text-yellow-500" />}
                defaultOpen={false}
              >
                <div className="space-y-3">
                  {/* Session Insights */}
                  {sessionInsights && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">AI Insights</div>
                      <div className="space-y-1">
                        {sessionInsights.emotionalAnalysis && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Heart className="h-3 w-3 text-pink-500" />
                            <span className="text-gray-600">
                              <span className="font-medium capitalize">{sessionInsights.emotionalAnalysis.primaryEmotion}</span>
                            </span>
                          </div>
                        )}
                        {sessionInsights.learningStyleAnalysis && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Brain className="h-3 w-3 text-blue-500" />
                            <span className="text-gray-600">
                              <span className="font-medium capitalize">{sessionInsights.learningStyleAnalysis.detectedStyle}</span> learner
                            </span>
                          </div>
                        )}
                        {sessionInsights.questionAnalysis && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Target className="h-3 w-3 text-green-500" />
                            <span className="text-gray-600">
                              {sessionInsights.questionAnalysis.confidenceLevel}% confidence
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Achievements */}
                  {studySession.achievements.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Recent Achievements</div>
                      <div className="space-y-1">
                        {studySession.achievements.slice(-3).map((achievement, idx) => (
                          <div key={idx} className="flex items-center space-x-2 p-1 bg-yellow-50 rounded text-xs">
                            <Trophy className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            <span className="text-yellow-800 truncate">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionItem>
            )}
          </Accordion>
          {/* Mobile padding for menu button */}
          <div className="lg:hidden h-16 flex-shrink-0" />
        </div>

        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Chat Section */}
        <div className="lg:col-span-3 lg:ml-0 ml-0">
          <div className="bg-white rounded-lg shadow-lg h-[700px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">FuturoPal AI</h3>
                  <p className="text-sm text-green-600">
                    🧠 Enhanced AI • {selectedTeachingStyle} Style • 
                    {enableEnhancements.emotionalIntelligence && '💖 '}
                    {enableEnhancements.gamification && '🎮 '}
                    {enableEnhancements.adaptiveTeaching && '🎨 '}
                    Ready to help!
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversation.map((message, index) => renderMessage(message, index))}
              
           
              
              {/* Current Question Answer Input */}
              {studySession.currentQuestion && studySession.currentQuestion.type === 'open-ended' && !showAnswer && (
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Answer:</h4>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your detailed answer here..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isGenerating}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}

              {/* MCQ Submit Button */}
              {studySession.currentQuestion && studySession.currentQuestion.type === 'mcq' && userAnswer && !showAnswer && (
                <div className="mb-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Submit Answer ({userAnswer})
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-6 py-4 rounded-lg shadow-lg max-w-md relative overflow-hidden">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span className="text-purple-700 font-medium">🧠 FuturoPal is crafting something amazing...</span>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-40" />
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Tool Selection UI */}
            {toolPromptMode && selectedTool && (
              <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">
                      🔧 {getToolDisplayName(selectedTool)} Mode
                    </span>
                  </div>
                  <button
                    onClick={handleCancelToolSelection}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  💡 <strong>Context:</strong> {originalStudentPrompt || getCurrentLearningContext()}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={toolPromptMode && selectedTool ? getToolPlaceholder(selectedTool) : "What would you like to explore today? I'm excited to help you learn! ✨"}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    toolPromptMode && selectedTool 
                      ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || isGenerating}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                    toolPromptMode && selectedTool
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={20} />
                  {toolPromptMode && selectedTool && (
                    <span className="text-xs">
                      {selectedTool === 'flashcards' ? '🃏' : 
                       selectedTool === 'examples' ? '🧠' : 
                       selectedTool === 'step_by_step' ? '📋' : '📝'}
                    </span>
                  )}
                  <span className="sr-only">Send</span>
                </button>
              </div>
              {toolPromptMode && selectedTool && (
                <div className="mt-2 text-xs text-blue-600">
                  💭 <strong>Tip:</strong> Be specific! The more details you provide, the better I can help you.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AITutorPage
