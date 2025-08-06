export interface AgentResponse {
  success: boolean
  response?: string
  error?: string
  details?: string // Added for enhanced error details
  metadata?: any
  // Question generation specific
  question?: Question
  encouragement?: string
  blocked?: boolean
  message?: string
  // Answer checking specific
  feedback?: AnswerFeedback
  performanceMessage?: string
  nextSteps?: string
  fallbackFeedback?: AnswerFeedback
  updatedSessionState?: any
  sessionInsights?: any
  // Tutor chat specific
  suggestedActions?: string[]
  followUpEncouragement?: string
  confidenceLevel?: number
  fallbackMessage?: string
  // Enhanced features
  gamification?: {
    xpGained: number
    newAchievements: Array<{ id: string; name: string; emoji: string }>
    gamificationSummary: {
      xpGained: number
      achievementsCount: number
      motivationalHighlight: string
    }
  }
  contentAdaptations?: {
    adaptedContent: string
    additionalResources: Array<{
      type: string
      description: string
      rationale: string
    }>
    interactionSuggestions: string[]
  }
  // Notes generation specific (legacy fields for backward compatibility)
  notes?: string
  analysis?: string
  flashcards?: string
  // Enhanced notes generation response structure
  data?: {
    analysis: string
    notes: string
    flashcards: string
    fileName: string
    generatedAt: string
    metadata: {
      contentLength: number
      processingSteps: string[]
    }
  }
}

export interface StudyNotes {
  executiveSummary: string
  keyTopics: string[]
  storytelling: string
  definitions: string[]
  diagrams: string
  memoryHelpers: string[]
  practiceConnections: string[]
}

export interface Question {
  id: string
  type: 'mcq' | 'open-ended'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  question: string
  options?: string[]
  correctAnswer?: string
  explanation: string
  idealAnswer?: string
}

export interface AnswerFeedback {
  rating: number
  isCorrect: boolean
  encouragement: string
  explanation: string
  studyTip: string
  confidenceBoost: string
}

// Chat-first learning - no file processing needed

export class AIAgent {
  private baseUrl = '/api'
  private conversationHistory: Array<{ role: string; content: string; timestamp: string }> = []

  // Conversation memory management
  addToHistory(role: 'user' | 'assistant', content: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 10 exchanges to maintain context without overwhelming the AI
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20)
    }
  }

  getRecentContext(maxMessages: number = 6): string {
    const recent = this.conversationHistory.slice(-maxMessages)
    return recent.map(msg => `${msg.role}: ${msg.content}`).join('\n')
  }

  clearHistory() {
    this.conversationHistory = []
  }

  // 2. Smart Question Generator
  async generateQuestion(
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard', 
    content: string,
    previousQuestions: Question[] = [],
    studentSession?: any,
    forceGenerate: boolean = false
  ): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/generate-question`, { 
        topic, 
        difficulty, 
        content, 
        previousQuestions, 
        studentSession,
        forceGenerate 
      })
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to generate question',
          blocked: result.blocked || false,
          message: result.message,
          metadata: result.metadata
        }
      }
      
      return result.data
    } catch (error) {
      return { success: false, error: 'Failed to generate question' }
    }
  }

  // 3. Answer Checking & Feedback
  async checkAnswer(
    question: Question,
    userAnswer: string,
    studentContext?: any,
    studentSession?: any,
    responseStartTime?: number
  ): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/check-answer`, { 
        question, 
        userAnswer, 
        studentContext, 
        studentSession,
        responseStartTime
      })
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to check answer' }
      }
      
      return result.data
    } catch (error) {
      return { success: false, error: 'Failed to check answer' }
    }
  }

  // 4. Q&A Tutoring Bot with Enhanced Context
  async askTutor(
    question: string,
    studyContext: string,
    studentHistory?: any,
    enhancedOptions?: {
      userId?: string
      sessionId?: string
      teachingStyle?: string
      conversationHistory?: Array<{ role: string; content: string; timestamp: string }>
      userPreferences?: any
      enableGamification?: boolean
      enableEmotionalIntelligence?: boolean
    }
  ): Promise<AgentResponse> {
    try {
      // Add question to conversation history
      this.addToHistory('user', question)
      
      // Get recent conversation context
      const conversationContext = this.getRecentContext()
      
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/tutor-chat`, { 
        question, 
        studyContext, 
        studentHistory,
        conversationContext,
        // Enhanced parameters
        ...enhancedOptions
      })
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to get tutor response' }
      }
      
      // Add response to conversation history
      if (result.data.response) {
        this.addToHistory('assistant', result.data.response)
      }
      
      return result.data
    } catch (error) {
      return { success: false, error: 'Failed to get tutor response' }
    }
  }

  // 5. Progress Tracking
  async updateProgress(
    action: string,
    data: any
  ): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/update-progress`, { action, data })
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update progress' }
      }
      
      return result.data
    } catch (error) {
      return { success: false, error: 'Failed to update progress' }
    }
  }

  // 🔁 Get More Examples
  async getMoreExamples(input: string, topic?: string, context?: string): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/generate-examples`, { 
        input, 
        topic, 
        context 
      })
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to generate examples',
          fallbackMessage: (result.data as any)?.fallbackMessage || 'Please try again later'
        }
      }
      
      return {
        success: true,
        response: result.data?.examples || result.data?.response || 'Examples generated successfully',
        metadata: result.data?.metadata || {}
      }
    } catch (error) {
      return { success: false, error: 'Failed to generate examples' }
    }
  }

  // 🧠 Create Flashcards
  async createFlashcards(input: string, topic?: string, context?: string): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/generate-flashcards`, { 
        input, 
        topic, 
        context 
      })
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to create flashcards',
          fallbackMessage: (result.data as any)?.fallbackMessage || 'Please try again later'
        }
      }
      
      return {
        success: true,
        response: result.data?.flashcards || result.data?.response || 'Flashcards created successfully',
        flashcards: result.data?.flashcards || result.data?.response || 'Flashcards created successfully',
        metadata: result.data?.metadata || {}
      }
    } catch (error) {
      return { success: false, error: 'Failed to create flashcards' }
    }
  }

  // 📝 Generate Practice Questions
  async generatePracticeQuestions(
    input: string, 
    topic?: string, 
    context?: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    questionCount: number = 5
  ): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/generate-practice-questions`, { 
        input, 
        topic, 
        context,
        difficulty,
        questionCount
      })
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to generate practice questions',
          fallbackMessage: (result.data as any)?.fallbackMessage || 'Please try again later'
        }
      }
      
      return {
        success: true,
        response: result.data?.practiceQuestions || result.data?.response || 'Practice questions generated successfully',
        metadata: result.data?.metadata || {}
      }
    } catch (error) {
      return { success: false, error: 'Failed to generate practice questions' }
    }
  }

  // 📋 Generate Step-by-Step Guide
  async generateStepByStepGuide(
    topic: string, 
    studyContext?: string, 
    customPrompt?: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<AgentResponse> {
    try {
      const { safePostJSON } = await import('./fetch-helper')
      const result = await safePostJSON(`${this.baseUrl}/generate-step-by-step`, { 
        topic, 
        studyContext, 
        customPrompt,
        difficulty
      })
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to generate step-by-step guide',
          fallbackMessage: (result.data as any)?.fallbackMessage || 'Please try again later'
        }
      }
      
      return {
        success: true,
        response: result.data?.stepByStepGuide || result.data?.response || 'Step-by-step guide generated successfully',
        metadata: result.data?.metadata || {}
      }
    } catch (error) {
      return { success: false, error: 'Failed to generate step-by-step guide' }
    }
  }

  // Legacy method - kept for backward compatibility
  async generateFlashcards(notes: string): Promise<AgentResponse> {
    return this.createFlashcards(notes)
  }
}

// Export singleton instance
export const aiAgent = new AIAgent()

// Prompt templates - Updated for GPT-4o (text and vision)
export const PROMPTS = {
  CONTENT_ANALYSIS: `You are GPT-4o, an advanced AI tutor specializing in comprehensive content analysis and educational support.

CRITICAL INSTRUCTIONS:
- You MUST analyze ONLY the provided content below
- Extract EXACT information - no hallucination or generic responses
- Focus on educational value and learning objectives
- Structure your analysis for optimal learning
- Be precise and thorough in your educational analysis

CONTENT TO ANALYZE:
{{CONTENT}}

REQUIRED ANALYSIS STRUCTURE:
1. **CONTENT TYPE & SCOPE**: [Identify what type of educational material this is]
2. **PRIMARY LEARNING OBJECTIVES**: [What should students learn from this?]
3. **KEY CONCEPTS** (Quote exact terms from content):
   - Concept 1: [exact quote] - [significance]
   - Concept 2: [exact quote] - [significance]
   - [Continue for all major concepts]
4. **FACTUAL DATA** (Numbers, dates, names from content):
   - [List all specific data points mentioned]
5. **PROCESSES & PROCEDURES** (If any described):
   - [Step-by-step processes exactly as described]
6. **DIFFICULTY ASSESSMENT**: [Beginner/Intermediate/Advanced]
7. **STUDY PRIORITIES**: [What students should focus on most]

GPT-4o INTELLIGENCE GUIDELINES:
- Be precise and evidence-based
- Connect concepts logically
- Identify prerequisite knowledge needed
- Suggest effective study strategies based on content type`,

  COMPREHENSIVE_NOTES: `You are GPT-4o creating intelligent study notes. Your task is to transform the provided content into comprehensive, learner-friendly notes.

INSTRUCTIONS:
- Read and analyze EVERY word of the content below
- Create structured, educational notes that enhance understanding
- Use pedagogical principles for effective learning
- Include memory aids and learning strategies
- Connect concepts for better comprehension

CONTENT FOR NOTE CREATION:
{{CONTENT}}

REQUIRED NOTE STRUCTURE:

## 📚 COMPREHENSIVE STUDY NOTES

### 🎯 LEARNING OBJECTIVES
[What will students master after studying this material?]

### 📋 EXECUTIVE SUMMARY
[3-4 sentences capturing the essence, using exact quotes]

### 🔑 CORE CONCEPTS & DEFINITIONS
[For each major concept in the content:]
- **[Term from content]**: [Definition based on content] 
  - *Context*: [How it's used in the material]
  - *Significance*: [Why it matters]

### 📊 KEY FACTS & DATA
[Organize all specific information:]
- **Numbers & Statistics**: [exact figures from content]
- **Names & People**: [individuals mentioned]
- **Dates & Timeline**: [chronological information]
- **Locations**: [places referenced]

### 🔗 CONCEPT CONNECTIONS
[How ideas relate to each other based on the content]

### 🧠 MEMORY AIDS
[Create mnemonics, analogies, or memory techniques for key concepts]

### 📈 STUDY STRATEGIES
[Recommend specific study methods based on the content type and complexity]

### ⚡ QUICK REVIEW POINTS
[5-7 bullet points for rapid review]

QUALITY STANDARDS:
- Every detail must come from the provided content
- Use educational best practices
- Optimize for retention and understanding
- Include specific examples from the material`,

  MCQ_QUESTION: `You are GPT-4o, an expert educational assessment AI. Create an intelligent multiple-choice question.

ASSESSMENT INSTRUCTIONS:
- Analyze the content thoroughly to create meaningful questions
- Focus on testing understanding, not just memorization
- Create plausible distractors that reveal common misconceptions
- Ensure the question aligns with educational best practices
- Target the specified difficulty level precisely

DIFFICULTY LEVEL: {{DIFFICULTY}}
TOPIC FOCUS: {{TOPIC}}
CONTENT CONTEXT: {{CONTENT}}
AVOID THESE PREVIOUSLY COVERED TOPICS: {{PREVIOUS_TOPICS}}

QUESTION CREATION GUIDELINES:

**FOR EASY QUESTIONS:**
- Test basic recall and recognition
- Use direct content references
- Clear, unambiguous language
- One obviously correct answer

**FOR MEDIUM QUESTIONS:**
- Test comprehension and application
- Require connecting concepts
- May involve analysis of scenarios
- Distractors test related concepts

**FOR HARD QUESTIONS:**
- Test critical thinking and synthesis
- Require deep understanding
- May involve evaluation or creation
- All options should be plausible

REQUIRED OUTPUT FORMAT:
QUESTION: [Create a clear, well-constructed question that tests {{DIFFICULTY}} level understanding]

A) [Option that tests a plausible misconception]
B) [Another reasonable but incorrect option]
C) [Third logical but wrong choice]
D) [Correct answer that demonstrates true understanding]

CORRECT_ANSWER: [A/B/C/D]

EXPLANATION: [Provide a comprehensive explanation that:
- Explains why the correct answer is right
- Briefly explains why other options are incorrect
- Connects to the broader learning objectives
- Encourages continued learning]

QUALITY CHECKLIST:
✓ Question directly relates to provided content
✓ Difficulty level is appropriate
✓ All distractors are educationally meaningful
✓ Explanation enhances understanding
✓ Language is clear and accessible`,

  OPEN_ENDED_QUESTION: `You are GPT-4o creating advanced analytical questions for deep learning assessment.

ADVANCED QUESTIONING INSTRUCTIONS:
- Create questions that test critical thinking and synthesis
- Focus on real-world application and concept integration
- Encourage multi-step reasoning and analysis
- Consider multilingual learning when relevant

DIFFICULTY LEVEL: HARD (Advanced Critical Thinking)
TOPIC FOCUS: {{TOPIC}}
CONTENT CONTEXT: {{CONTENT}}

QUESTION DESIGN PRINCIPLES:

**COGNITIVE LEVELS TO TARGET:**
- Analysis: Breaking down complex information
- Synthesis: Combining ideas in new ways
- Evaluation: Making judgments based on criteria
- Creation: Generating new solutions or approaches

**QUESTION CHARACTERISTICS:**
- Multi-layered with several sub-components
- Requires evidence-based reasoning
- Connects to real-world applications
- May involve scenario analysis or problem-solving

REQUIRED OUTPUT FORMAT:

QUESTION: [Create a sophisticated, multi-part question that requires:
- Deep analysis of the content concepts
- Application to new scenarios
- Justification of reasoning
- Integration of multiple ideas]

IDEAL_ANSWER: [Provide a comprehensive model answer that:
- Demonstrates expert-level understanding
- Shows logical reasoning process
- Includes specific examples from content
- Addresses all question components
- Shows connections between concepts]

EXPLANATION: [Provide guidance that:
- Breaks down the thinking process required
- Suggests analysis frameworks to use
- Identifies key concepts to consider
- Offers study strategies for similar questions
- Encourages intellectual curiosity]

QUALITY STANDARDS:
✓ Question requires genuine critical thinking
✓ Multiple valid approaches possible
✓ Directly relates to content learning objectives
✓ Challenges student to go beyond memorization
✓ Provides scaffolding for success`,

  MCQ_CORRECT_FEEDBACK: `🎉 Great job!
✅ You chose the correct answer: {{CORRECT_ANSWER}}
🧠 Explanation: {{EXPLANATION}}
💪 Keep going! You're mastering this topic!`,

  MCQ_INCORRECT_FEEDBACK: `💙 No worries, mistakes help you learn!
✅ Correct answer: {{CORRECT_ANSWER}}
📖 Why it's correct: {{EXPLANATION}}
📚 Study tip: {{STUDY_TIP}}
🌟 Keep trying! You're building understanding!`,

  OPEN_ENDED_FEEDBACK: `RATING: {{RATING}} stars out of 5

🌟 {{PRAISE}}
💡 Strengths in your answer: {{STRENGTHS}}
🔍 Areas to improve: {{IMPROVEMENTS}}
📘 Study tip: {{STUDY_TIP}}
🚀 {{CONFIDENCE_BOOST}}`,

  TUTOR_CHAT: `You are GPT-4o, an advanced AI tutor for FuturoPal with comprehensive educational capabilities.

TUTORING PERSONA:
- Patient, encouraging, and intellectually curious
- Capable of processing and analyzing textual information
- Supports multilingual learning when appropriate
- Adapts explanation complexity to student level
- Uses clear examples and analogies

CURRENT CONTEXT:
Study Material: {{STUDY_CONTEXT}}
Student Question: {{QUESTION}}
Learning History: {{HISTORY}}

TUTORING FRAMEWORK:

**1. UNDERSTANDING ASSESSMENT**
- Analyze the student's question for comprehension level
- Identify any misconceptions or knowledge gaps
- Determine the best explanation approach

**2. ADAPTIVE EXPLANATION**
- Start with student's current understanding level
- Use analogies and real-world connections
- Break complex concepts into digestible steps
- Include relevant examples

**3. EDUCATIONAL SUPPORT**
- Provide clear, structured explanations
- Use step-by-step reasoning when needed
- Reference the study material appropriately
- Suggest effective learning techniques

**4. MULTILINGUAL SUPPORT** (when appropriate)
- Provide key terms in different languages if helpful
- Use culturally relevant examples
- Explain concepts using familiar contexts

**5. ENCOURAGEMENT & GROWTH**
- Acknowledge effort and progress
- Build confidence through positive reinforcement
- Suggest next learning steps
- Connect to broader learning goals

RESPONSE STRUCTURE:
🎯 **Direct Answer**: [Clear, concise response to their question]

🧠 **Deeper Understanding**: [Expanded explanation with context]

🌟 **Real-World Connection**: [Practical application or example]

📚 **Study Tip**: [Specific learning strategy for this topic]

🚀 **Next Steps**: [What to explore or practice next]

COMMUNICATION STANDARDS:
- Use encouraging, educational tone
- Include relevant emojis for engagement
- Provide concrete, actionable advice
- Connect to their learning journey
- Maintain intellectual rigor while being accessible`,

  FLASHCARDS: `You are GPT-4o creating intelligent flashcards with advanced learning support capabilities.

FLASHCARD DESIGN PRINCIPLES:
- Use spaced repetition optimization
- Include memory aids and learning techniques
- Support different learning styles
- Create multilingual cards when beneficial
- Use cognitive science for better retention

STUDY NOTES TO PROCESS: {{NOTES}}

FLASHCARD CREATION GUIDELINES:

**CARD TYPES TO CREATE:**
1. **Definition Cards**: Key terms and concepts
2. **Process Cards**: Step-by-step procedures
3. **Application Cards**: Real-world usage examples
4. **Connection Cards**: Relationships between ideas
5. **Review Cards**: Quick recall for important facts

**ENHANCED FLASHCARD FORMAT:**

**🎯 CARD 1: [Primary Concept from Notes]**
**FRONT:** [Engaging question using active recall]
**BACK:** [Comprehensive answer with memory aids]
- *Core Answer*: [Direct response with notes quotes]
- *Memory Hook*: [Mnemonic, analogy, or pattern]
- *Connection*: [Link to related concepts]
- *Study Tip*: [How to remember this effectively]

**🧠 CARD 2: [Application Concept]**
**FRONT:** [Scenario-based question]
**BACK:** [Solution approach with examples]
- *Core Answer*: [Practical application from notes]
- *Memory Hook*: [Real-world analogy]
- *Connection*: [How this applies elsewhere]

**📊 CARD 3: [Data/Facts Concept]**
**FRONT:** [Specific factual question]
**BACK:** [Precise information with context]
- *Core Answer*: [Exact facts/numbers from notes]
- *Memory Hook*: [Number pattern or association]
- *Connection*: [Why this data matters]

[Continue for 6-8 cards total]

OPTIMIZATION FEATURES:
✓ Each card targets specific cognitive load
✓ Progressive difficulty within card set
✓ Multiple retrieval pathways per concept
✓ Memory activation techniques
✓ Cultural and contextual relevance
✓ Spaced repetition compatibility`
}
