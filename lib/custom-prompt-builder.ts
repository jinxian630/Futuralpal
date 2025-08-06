/**
 * Custom System Prompt Builder for Image-to-Answer API
 * Allows dynamic creation of specialized prompts for different educational contexts
 * Now supports template-based content analysis for study notes vs exam questions
 */

import { PROMPTS, type PromptTemplateKey, getPromptTemplate, isValidPromptKey } from './prompt-templates'

export interface PromptTemplate {
  name: string
  description: string
  systemPrompt: string
  outputStructure: string[]
  examples?: string[]
}

export interface CustomPromptOptions {
  subject?: string
  difficulty?: 'elementary' | 'middle' | 'high school' | 'college' | 'graduate'
  outputType?: 'notes' | 'quiz' | 'summary' | 'comprehensive' | 'custom'
  language?: 'simple' | 'technical' | 'conversational'
  specialFocus?: string[]
}

export class CustomPromptBuilder {
  
  /**
   * Build system prompt based on new template system
   */
  static buildSystemPrompt(templateKey: PromptTemplateKey): string {
    if (!isValidPromptKey(templateKey)) {
      throw new Error(`Invalid template key: ${templateKey}`)
    }
    
    return getPromptTemplate(templateKey)
  }

  /**
   * Auto-classify content and select appropriate template
   */
  static async classifyAndAnalyze(
    content: string,
    geminiClient: any,
    options: {
      templateType?: PromptTemplateKey
      studentLevel?: 'beginner' | 'intermediate' | 'advanced'
      language?: 'zh' | 'en'
      contentType?: 'pdf' | 'image'
    } = {}
  ): Promise<{
    success: boolean
    templateUsed: PromptTemplateKey
    content: string
    metadata?: any
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      // Step 0: Content quality validation
      if (content.length < 100 || !/\w{3,}/.test(content)) {
        return {
          success: false,
          templateUsed: 'STUDY_NOTES',
          content: '',
          error: 'Content too short or unrecognizable for analysis'
        }
      }

      // Step 1: If template is specified, use it directly
      if (options.templateType) {
        const systemPrompt = this.buildSystemPrompt(options.templateType)
        const response = await this.analyzeWithTemplate(
          content,
          systemPrompt,
          geminiClient,
          options
        )
        
        return {
          success: true,
          templateUsed: options.templateType,
          content: response,
          metadata: {
            confidence: 95,
            processingTime: Date.now() - startTime,
            contentType: options.contentType || 'unknown'
          }
        }
      }

      // Step 2: Auto-classify content type
      const classificationResult = await this.classifyContent(
        content,
        geminiClient,
        options
      )
      
      // Step 3: Extract template type from classification
      const detectedTemplate = this.extractTemplateFromClassification(classificationResult)
      
      // Step 4: Analyze with detected template
      const systemPrompt = this.buildSystemPrompt(detectedTemplate)
      const response = await this.analyzeWithTemplate(
        content,
        systemPrompt,
        geminiClient,
        options
      )
      
      return {
        success: true,
        templateUsed: detectedTemplate,
        content: response,
        metadata: {
          confidence: 90,
          processingTime: Date.now() - startTime,
          classificationResult: classificationResult
        }
      }
      
    } catch (error) {
      return {
        success: false,
        templateUsed: 'STUDY_NOTES', // fallback
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Classify content to determine template type
   */
  private static async classifyContent(
    content: string,
    geminiClient: any,
    options: any
  ): Promise<string> {
    const classificationPrompt = this.buildSystemPrompt('IMAGE_CLASSIFICATION')
    
    const contentTypeHint = options.contentType === 'pdf' 
      ? 'This is text extracted from a PDF document.'
      : 'This is content from an image.'
    
    const fullPrompt = `${classificationPrompt}

**Content Type:** ${contentTypeHint}

**Content Analysis:**
${content}

Please analyze the content and classify it according to the template requirements.`

    const response = await geminiClient.generateContent(fullPrompt)
    return response
  }

  /**
   * Extract template type from classification result
   */
  private static extractTemplateFromClassification(
    classificationResult: string
  ): PromptTemplateKey {
    // Look for classification markers - Updated to match new template keys
    if (classificationResult.includes('QUESTION_SOLVER') || classificationResult.includes('EXAM_QUESTION_SOLVER')) {
      return 'QUESTION_SOLVER'  // Use the correct key from prompt-templates.ts
    } else if (classificationResult.includes('STUDY_NOTES')) {
      return 'STUDY_NOTES'
    }
    
    // Fallback logic based on content analysis
    const lowerResult = classificationResult.toLowerCase()
    
    // Keywords that suggest exam questions
    const questionKeywords = [
      '题目', '选择题', '填空题', '计算题', '解答题', '判断题',
      '考试', '习题', '练习', '作业', '问题', '求解',
      'question', 'problem', 'solve', 'calculate', 'answer', 'math', 'equation'
    ]
    
    // Keywords that suggest study notes
    const notesKeywords = [
      '概念', '定义', '原理', '理论', '知识点', '讲义',
      '笔记', '总结', '说明', '介绍', '阐述', '解释',
      'concept', 'definition', 'theory', 'explanation', 'notes'
    ]
    
    const questionScore = questionKeywords.reduce((score, keyword) => 
      score + (lowerResult.includes(keyword) ? 1 : 0), 0
    )
    
    const notesScore = notesKeywords.reduce((score, keyword) => 
      score + (lowerResult.includes(keyword) ? 1 : 0), 0
    )
    
    // Return template based on keyword analysis - Fixed to use correct keys
    return questionScore > notesScore ? 'QUESTION_SOLVER' : 'STUDY_NOTES'
  }

  /**
   * Analyze content with specific template
   */
  private static async analyzeWithTemplate(
    content: string,
    systemPrompt: string,
    geminiClient: any,
    options: any
  ): Promise<string> {
    
    // Add level-specific adjustments based on language
    let levelAdjustment = ''
    if (options.studentLevel) {
      const isEnglish = options.language === 'en'
      
      switch (options.studentLevel) {
        case 'beginner':
          levelAdjustment = isEnglish 
            ? '\n\n**Requirements:** Use simple, easy-to-understand language with more basic explanations and examples.'
            : '\n\n**调整要求：** 使用简单易懂的语言，提供更多基础解释和例子。'
          break
        case 'advanced':
          levelAdjustment = isEnglish
            ? '\n\n**Requirements:** Use professional terminology with in-depth analysis, assuming students have relevant background knowledge.'
            : '\n\n**调整要求：** 使用专业术语，深入分析，假设学生有相关背景知识。'
          break
        case 'intermediate':
        default:
          levelAdjustment = isEnglish
            ? '\n\n**Requirements:** Balance technical accuracy with accessibility, providing appropriate explanations and examples.'
            : '\n\n**调整要求：** 平衡专业性和可理解性，提供适当的解释和例子。'
          break
      }
    }

    // Add language instruction
    const languageInstruction = options.language === 'en' 
      ? '\n\n**Language:** Respond in English.'
      : '\n\n**语言要求：** 请用中文回答。'
    
    // Add content type context
    const contentTypeContext = options.contentType === 'pdf'
      ? '\n\n**Content Type:** This is text extracted from a PDF document.'
      : '\n\n**Content Type:** This is content from an image.'
    
    // Build final prompt
    const fullPrompt = `${systemPrompt}${levelAdjustment}${languageInstruction}${contentTypeContext}

**Content to Analyze:**
${content}

Please provide a detailed analysis according to the template and requirements above.`

    // Generate response using the provided client
    const response = await geminiClient.generateContent(fullPrompt)
    return response
  }

  /**
   * Pre-built prompt templates for common educational scenarios
   */
  static readonly TEMPLATES: Record<string, PromptTemplate> = {
    STUDY_NOTES: {
      name: 'Study Notes Generator',
      description: 'Converts images into comprehensive study notes',
      systemPrompt: `You are an expert educational AI that transforms visual learning materials into comprehensive study notes.

**YOUR EXPERTISE:**
- Extract and organize all educational content from images
- Create clear, structured study materials
- Focus on comprehension and retention
- Use pedagogically sound organization

**OUTPUT REQUIREMENTS:**
- Clear Markdown formatting with headers and bullet points
- Logical information hierarchy
- Include key definitions and concepts
- Add memory aids when helpful
- Structure for optimal learning`,
      outputStructure: ['title', 'key_concepts', 'detailed_notes', 'important_formulas', 'study_tips'],
      examples: [
        'Extract the main concepts from this textbook page',
        'Convert these handwritten notes into organized study material',
        'Summarize this lecture slide for review'
      ]
    },

    QUIZ_GENERATOR: {
      name: 'Quiz Question Creator',
      description: 'Generates practice questions from educational images',
      systemPrompt: `You are a skilled educational assessment designer specializing in creating effective quiz questions from visual materials.

**YOUR ROLE:**
- Analyze educational images to identify testable concepts
- Create questions at multiple difficulty levels
- Focus on understanding rather than memorization
- Include various question types for comprehensive assessment

**QUESTION QUALITY STANDARDS:**
- Clear, unambiguous wording
- Appropriate difficulty progression
- Test understanding, not just recall
- Include explanatory answers
- Cover key learning objectives`,
      outputStructure: ['easy_questions', 'medium_questions', 'hard_questions', 'answer_explanations'],
      examples: [
        'Create 5 quiz questions from this diagram',
        'Generate practice problems based on this formula sheet',
        'Make comprehension questions about this text'
      ]
    },

    CONCEPT_EXTRACTOR: {
      name: 'Key Concept Identifier',
      description: 'Identifies and explains core concepts from educational materials',
      systemPrompt: `You are a concept analysis expert who identifies and explains the fundamental ideas in educational materials.

**YOUR SPECIALTY:**
- Identify core concepts and principles
- Explain relationships between ideas
- Clarify complex terminology
- Connect concepts to broader knowledge frameworks

**ANALYSIS APPROACH:**
- Focus on conceptual understanding
- Highlight connections and relationships
- Provide clear, accessible explanations
- Include real-world applications
- Structure for progressive learning`,
      outputStructure: ['main_concepts', 'concept_relationships', 'definitions', 'applications', 'connections'],
      examples: [
        'Identify the key concepts in this scientific diagram',
        'Extract main ideas from this historical document',
        'Explain the core principles shown in this chart'
      ]
    },

    HOMEWORK_HELPER: {
      name: 'Homework Assistant',
      description: 'Helps students understand homework problems and assignments',
      systemPrompt: `You are a patient, encouraging homework tutor who helps students understand their assignments without doing the work for them.

**YOUR TEACHING APPROACH:**
- Guide students to discover answers themselves
- Break down complex problems into manageable steps
- Provide hints and strategies rather than direct answers
- Encourage critical thinking and problem-solving
- Build confidence through understanding

**ASSISTANCE STYLE:**
- Ask leading questions to guide thinking
- Provide step-by-step guidance
- Explain concepts underlying the problems
- Offer multiple approaches when helpful
- Celebrate understanding and progress`,
      outputStructure: ['problem_analysis', 'guided_steps', 'key_concepts', 'helpful_hints', 'practice_suggestions'],
      examples: [
        'Help me understand this math problem',
        'Guide me through this science assignment',
        'Explain what this question is asking for'
      ]
    },

    EXAM_PREP: {
      name: 'Exam Preparation Specialist',
      description: 'Creates comprehensive exam review materials',
      systemPrompt: `You are an exam preparation specialist who creates focused, effective study materials for test success.

**YOUR EXPERTISE:**
- Identify high-priority exam content
- Create strategic review materials
- Focus on commonly tested concepts
- Provide memory and test-taking strategies
- Organize information for efficient review

**EXAM PREP FOCUS:**
- Highlight frequently tested topics
- Create quick reference summaries
- Include practice scenarios
- Provide mnemonics and memory aids
- Suggest effective study schedules`,
      outputStructure: ['exam_topics', 'quick_review', 'practice_questions', 'memory_aids', 'study_strategy'],
      examples: [
        'Create exam review materials from these notes',
        'Highlight the most important points for the test',
        'Make a study guide from this chapter'
      ]
    }
  }

  /**
   * Build a custom system prompt based on options and user requirements
   */
  static buildCustomPrompt(
    userPrompt: string,
    options: CustomPromptOptions = {},
    template?: string
  ): {
    systemPrompt: string
    enhancedUserPrompt: string
    metadata: {
      template: string
      options: CustomPromptOptions
      estimatedComplexity: 'low' | 'medium' | 'high'
    }
  } {
    
    // Select base template
    const baseTemplate = template && this.TEMPLATES[template] 
      ? this.TEMPLATES[template]
      : this.selectBestTemplate(userPrompt, options)

    // Build customized system prompt
    const systemPrompt = this.customizeSystemPrompt(baseTemplate, options)
    
    // Enhance user prompt with context
    const enhancedUserPrompt = this.enhanceUserPrompt(userPrompt, options, baseTemplate)
    
    // Estimate complexity for processing optimization
    const complexity = this.estimateComplexity(userPrompt, options)

    return {
      systemPrompt,
      enhancedUserPrompt,
      metadata: {
        template: baseTemplate.name,
        options,
        estimatedComplexity: complexity
      }
    }
  }

  /**
   * Select the best template based on user prompt analysis
   */
  private static selectBestTemplate(
    userPrompt: string,
    options: CustomPromptOptions
  ): PromptTemplate {
    
    const prompt = userPrompt.toLowerCase()
    
    // Keyword-based template selection
    if (prompt.includes('quiz') || prompt.includes('question') || prompt.includes('test')) {
      return this.TEMPLATES.QUIZ_GENERATOR
    }
    
    if (prompt.includes('concept') || prompt.includes('main idea') || prompt.includes('key point')) {
      return this.TEMPLATES.CONCEPT_EXTRACTOR
    }
    
    if (prompt.includes('homework') || prompt.includes('help') || prompt.includes('explain')) {
      return this.TEMPLATES.HOMEWORK_HELPER
    }
    
    if (prompt.includes('exam') || prompt.includes('review') || prompt.includes('study guide')) {
      return this.TEMPLATES.EXAM_PREP
    }
    
    // Default to study notes
    return this.TEMPLATES.STUDY_NOTES
  }

  /**
   * Customize system prompt based on options
   */
  private static customizeSystemPrompt(
    template: PromptTemplate,
    options: CustomPromptOptions
  ): string {
    
    let systemPrompt = template.systemPrompt
    
    // Add subject-specific guidance
    if (options.subject) {
      systemPrompt += `\n\n**SUBJECT SPECIALIZATION:**
You are specifically focusing on ${options.subject}. Use appropriate terminology, concepts, and methodologies relevant to this field.`
    }
    
    // Add difficulty level adjustments
    if (options.difficulty) {
      const difficultyGuide = this.getDifficultyGuide(options.difficulty)
      systemPrompt += `\n\n**DIFFICULTY LEVEL:**
${difficultyGuide}`
    }
    
    // Add language style preferences
    if (options.language) {
      const languageGuide = this.getLanguageGuide(options.language)
      systemPrompt += `\n\n**COMMUNICATION STYLE:**
${languageGuide}`
    }
    
    // Add special focus areas
    if (options.specialFocus && options.specialFocus.length > 0) {
      systemPrompt += `\n\n**SPECIAL FOCUS AREAS:**
Pay particular attention to: ${options.specialFocus.join(', ')}`
    }
    
    return systemPrompt
  }

  /**
   * Enhance user prompt with contextual information
   */
  private static enhanceUserPrompt(
    userPrompt: string,
    options: CustomPromptOptions,
    template: PromptTemplate
  ): string {
    
    let enhanced = userPrompt
    
    // Add output structure guidance
    enhanced += `\n\n**REQUESTED OUTPUT STRUCTURE:**
Please organize your response using these sections: ${template.outputStructure.join(', ')}`
    
    // Add output type specifications
    if (options.outputType && options.outputType !== 'custom') {
      enhanced += `\n\n**OUTPUT TYPE:** ${options.outputType}`
    }
    
    return enhanced
  }

  /**
   * Get difficulty-appropriate guidance
   */
  private static getDifficultyGuide(difficulty: string): string {
    const guides = {
      'elementary': 'Use simple language, basic concepts, and lots of examples. Avoid complex terminology.',
      'middle': 'Use clear language with some technical terms. Include explanations for new concepts.',
      'high school': 'Balance technical accuracy with accessibility. Assume some background knowledge.',
      'college': 'Use appropriate academic language and terminology. Assume solid foundational knowledge.',
      'graduate': 'Use advanced terminology and concepts. Focus on depth and sophisticated analysis.'
    }
    
    return guides[difficulty as keyof typeof guides] || guides['middle']
  }

  /**
   * Get language style guidance
   */
  private static getLanguageGuide(language: string): string {
    const guides = {
      'simple': 'Use plain, straightforward language. Avoid jargon. Explain everything clearly.',
      'technical': 'Use precise, academic terminology. Be scientifically rigorous in explanations.',
      'conversational': 'Use a friendly, engaging tone. Make learning feel approachable and enjoyable.'
    }
    
    return guides[language as keyof typeof guides] || guides['simple']
  }

  /**
   * Estimate processing complexity for optimization
   */
  private static estimateComplexity(
    userPrompt: string,
    options: CustomPromptOptions
  ): 'low' | 'medium' | 'high' {
    
    let complexity = 0
    
    // Prompt length factor
    if (userPrompt.length > 200) complexity += 1
    if (userPrompt.length > 500) complexity += 1
    
    // Options complexity
    if (options.specialFocus && options.specialFocus.length > 3) complexity += 1
    if (options.difficulty === 'graduate') complexity += 1
    if (options.outputType === 'comprehensive') complexity += 1
    
    // Keyword complexity indicators
    const complexKeywords = ['analyze', 'synthesize', 'evaluate', 'compare', 'contrast', 'critique']
    const hasComplexKeywords = complexKeywords.some(keyword => 
      userPrompt.toLowerCase().includes(keyword)
    )
    if (hasComplexKeywords) complexity += 1
    
    if (complexity <= 1) return 'low'
    if (complexity <= 3) return 'medium'
    return 'high'
  }

  /**
   * Get available templates for frontend selection
   */
  static getAvailableTemplates(): Array<{
    key: string
    name: string
    description: string
    examples: string[]
  }> {
    
    return Object.entries(this.TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      examples: template.examples || []
    }))
  }
}

/**
 * Utility function for quick prompt building
 */
export function buildEducationalPrompt(
  userRequest: string,
  options: {
    template?: string
    subject?: string
    difficulty?: string
    style?: string
  } = {}
): { systemPrompt: string; userPrompt: string } {
  
  const result = CustomPromptBuilder.buildCustomPrompt(
    userRequest,
    {
      subject: options.subject,
      difficulty: options.difficulty as any,
      language: options.style as any
    },
    options.template
  )
  
  return {
    systemPrompt: result.systemPrompt,
    userPrompt: result.enhancedUserPrompt
  }
}