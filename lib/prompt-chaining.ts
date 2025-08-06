/**
 * Advanced Prompt Chaining for Educational Content Generation
 * Transforms raw vision output into comprehensive study materials
 */

export interface ChainedResult {
  stage: string
  content: string
  metadata: {
    confidence: number
    processingTime: number
    tokens?: number
  }
}

export interface EducationalOutput {
  summary: string
  notes: string
  concepts: string[]
  questions: Array<{
    question: string
    difficulty: 'easy' | 'medium' | 'hard'
    type: 'multiple-choice' | 'short-answer' | 'essay'
  }>
  studyTips: string[]
  connections: string[]
  metadata: {
    subject: string
    level: string
    totalTokens: number
    processingTime: number
  }
}

export class EducationalPromptChain {
  
  /**
   * Main chaining pipeline for educational content
   */
  static async processEducationalContent(
    rawVisionOutput: string,
    geminiClient: any,
    options: {
      studentLevel?: 'beginner' | 'intermediate' | 'advanced'
      focusAreas?: string[]
      outputFormat?: 'comprehensive' | 'summary' | 'quick'
    } = {}
  ): Promise<EducationalOutput> {
    
    const startTime = Date.now()
    const results: ChainedResult[] = []
    
    try {
      // Stage 1: Content Analysis & Classification
      const analysis = await this.analyzeContent(rawVisionOutput, geminiClient)
      results.push(analysis)
      
      // Stage 2: Content Enhancement & Structuring
      const enhanced = await this.enhanceContent(analysis.content, geminiClient, options)
      results.push(enhanced)
      
      // Stage 3: Question Generation
      const questions = await this.generateQuestions(enhanced.content, geminiClient, options)
      results.push(questions)
      
      // Stage 4: Study Strategy Creation
      const studyStrategy = await this.createStudyStrategy(enhanced.content, geminiClient, options)
      results.push(studyStrategy)
      
      // Stage 5: Final Synthesis
      const final = await this.synthesizeOutput(results, geminiClient, options)
      
      return {
        ...final,
        metadata: {
          ...final.metadata,
          totalTokens: results.reduce((sum, r) => sum + (r.metadata.tokens || 0), 0),
          processingTime: Date.now() - startTime
        }
      }
      
    } catch (error) {
      console.error('Prompt chaining failed:', error)
      // Fallback to simple processing
      return this.simpleFallback(rawVisionOutput, options)
    }
  }
  
  /**
   * Stage 1: Analyze and classify content
   */
  private static async analyzeContent(
    rawContent: string, 
    geminiClient: any
  ): Promise<ChainedResult> {
    
    const prompt = `EDUCATIONAL CONTENT ANALYSIS

Analyze this extracted content and provide a structured classification:

CONTENT TO ANALYZE:
"""
${rawContent}
"""

PROVIDE ANALYSIS IN THIS EXACT FORMAT:

**SUBJECT CLASSIFICATION:**
- Primary Subject: [main academic field]
- Secondary Topics: [related areas]
- Academic Level: [elementary/middle/high school/college/graduate]

**CONTENT TYPE:**
- Format: [textbook page/notes/diagram/formula sheet/etc.]
- Structure: [how information is organized]
- Key Features: [important visual or textual elements]

**LEARNING OBJECTIVES:**
- Main Concepts: [3-5 key concepts]
- Skills Required: [what students need to understand this]
- Prerequisites: [background knowledge needed]

**QUALITY ASSESSMENT:**
- Clarity: [1-10 rating]
- Completeness: [what might be missing]
- Educational Value: [1-10 rating]

Keep analysis concise but thorough.`

    const startTime = Date.now()
    const response = await geminiClient.generateContent(prompt)
    
    return {
      stage: 'content_analysis',
      content: response,
      metadata: {
        confidence: 0.8,
        processingTime: Date.now() - startTime,
        tokens: prompt.length + response.length
      }
    }
  }
  
  /**
   * Stage 2: Enhance and structure content
   */
  private static async enhanceContent(
    analysisResult: string,
    geminiClient: any,
    options: any
  ): Promise<ChainedResult> {
    
    const levelAdjustment = options.studentLevel === 'beginner' ? 
      'Use simple language and provide more explanations.' :
      options.studentLevel === 'advanced' ?
      'Use technical terminology and assume prior knowledge.' :
      'Balance technical accuracy with clear explanations.'
    
    const prompt = `EDUCATIONAL CONTENT ENHANCEMENT

Based on this analysis, create comprehensive study notes:

ANALYSIS:
"""
${analysisResult}
"""

CREATE ENHANCED STUDY MATERIALS:

# 📚 STUDY NOTES

## 🎯 Learning Objectives
[Clear, specific objectives students should achieve]

## 📖 Key Concepts
[Detailed explanations of main concepts with examples]

## 🔍 Important Details
[Supporting information, definitions, formulas]

## 🌟 Real-World Applications
[How these concepts apply in practice]

## 🔗 Connections
[How this relates to other topics/subjects]

ADAPTATION NOTES:
${levelAdjustment}

Focus on clarity, educational value, and student engagement.`

    const startTime = Date.now()
    const response = await geminiClient.generateContent(prompt)
    
    return {
      stage: 'content_enhancement',
      content: response,
      metadata: {
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        tokens: prompt.length + response.length
      }
    }
  }
  
  /**
   * Stage 3: Generate practice questions
   */
  private static async generateQuestions(
    enhancedContent: string,
    geminiClient: any,
    options: any
  ): Promise<ChainedResult> {
    
    const prompt = `EDUCATIONAL QUESTION GENERATION

Create diverse practice questions based on this content:

CONTENT:
"""
${enhancedContent}
"""

GENERATE QUESTIONS IN THIS FORMAT:

## 🎯 PRACTICE QUESTIONS

### Easy Level (Knowledge & Comprehension)
1. **Question:** [factual recall question]
   **Type:** multiple-choice
   **Answer:** [brief answer/explanation]

2. **Question:** [definition question]
   **Type:** short-answer
   **Answer:** [brief answer]

### Medium Level (Application & Analysis)
3. **Question:** [application problem]
   **Type:** short-answer
   **Answer:** [step-by-step solution]

4. **Question:** [comparison/analysis question]
   **Type:** short-answer
   **Answer:** [analytical answer]

### Hard Level (Synthesis & Evaluation)
5. **Question:** [complex problem/essay question]
   **Type:** essay
   **Answer:** [detailed solution approach]

REQUIREMENTS:
- Questions should test different cognitive levels
- Include variety in question types
- Provide clear, helpful answers
- Questions should be specific to the content`

    const startTime = Date.now()
    const response = await geminiClient.generateContent(prompt)
    
    return {
      stage: 'question_generation',
      content: response,
      metadata: {
        confidence: 0.9,
        processingTime: Date.now() - startTime,
        tokens: prompt.length + response.length
      }
    }
  }
  
  /**
   * Stage 4: Create study strategies
   */
  private static async createStudyStrategy(
    enhancedContent: string,
    geminiClient: any,
    options: any
  ): Promise<ChainedResult> {
    
    const prompt = `STUDY STRATEGY DEVELOPMENT

Create personalized study strategies for this content:

CONTENT:
"""
${enhancedContent}
"""

PROVIDE STUDY STRATEGIES:

## 💡 STUDY TIPS & STRATEGIES

### Memory Techniques
- [Specific mnemonics for key concepts]
- [Visualization strategies]
- [Association techniques]

### Practice Methods  
- [How to practice/apply concepts]
- [Study schedule recommendations]
- [Self-assessment strategies]

### Common Mistakes
- [Typical errors students make]
- [How to avoid these mistakes]
- [Warning signs to watch for]

### Next Steps
- [What to study next]
- [Related topics to explore]
- [Advanced applications]

### Quick Review
- [5-minute review checklist]
- [Key formulas/facts to memorize]
- [Essential concept summary]

Make strategies specific and actionable.`

    const startTime = Date.now()
    const response = await geminiClient.generateContent(prompt)
    
    return {
      stage: 'study_strategy',
      content: response,
      metadata: {
        confidence: 0.8,
        processingTime: Date.now() - startTime,
        tokens: prompt.length + response.length
      }
    }
  }
  
  /**
   * Stage 5: Synthesize all outputs
   */
  private static async synthesizeOutput(
    results: ChainedResult[],
    geminiClient: any,
    options: any
  ): Promise<EducationalOutput> {
    
    // Extract structured data from the chained results
    const analysis = results.find(r => r.stage === 'content_analysis')?.content || ''
    const enhanced = results.find(r => r.stage === 'content_enhancement')?.content || ''
    const questions = results.find(r => r.stage === 'question_generation')?.content || ''
    const strategy = results.find(r => r.stage === 'study_strategy')?.content || ''
    
    // Parse and structure the outputs
    return {
      summary: this.extractSummary(enhanced),
      notes: enhanced,
      concepts: this.extractConcepts(enhanced),
      questions: this.parseQuestions(questions),
      studyTips: this.extractStudyTips(strategy),
      connections: this.extractConnections(enhanced),
      metadata: {
        subject: this.extractSubject(analysis),
        level: this.extractLevel(analysis),
        totalTokens: 0, // Will be filled by caller
        processingTime: 0 // Will be filled by caller
      }
    }
  }
  
  /**
   * Simple fallback for when chaining fails
   */
  private static simpleFallback(
    rawContent: string,
    options: any
  ): EducationalOutput {
    
    return {
      summary: 'Content extracted from image. Please review for accuracy.',
      notes: rawContent,
      concepts: [],
      questions: [],
      studyTips: [
        'Review the extracted content carefully',
        'Verify accuracy of text recognition', 
        'Add your own notes and examples'
      ],
      connections: [],
      metadata: {
        subject: 'Unknown',
        level: 'Unknown',
        totalTokens: 0,
        processingTime: 0
      }
    }
  }
  
  // Helper methods for parsing structured output
  private static extractSummary(content: string): string {
    const match = content.match(/## 🎯 Learning Objectives\s*(.*?)(?=##|$)/)
    return match ? match[1].trim() : 'Summary not available'
  }
  
  private static extractConcepts(content: string): string[] {
    const match = content.match(/## 📖 Key Concepts\s*(.*?)(?=##|$)/)
    if (!match) return []
    
    return match[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(concept => concept.length > 0)
  }
  
  private static parseQuestions(content: string): any[] {
    // Simple parsing - in production, you'd want more sophisticated parsing
    const questions = []
    const questionMatches = content.match(/\*\*Question:\*\*(.*?)(?=\*\*Question:|\*\*Type:|$)/g)
    
    if (questionMatches) {
      for (const match of questionMatches) {
        const question = match.replace(/\*\*Question:\*\*/, '').trim()
        if (question) {
          questions.push({
            question,
            difficulty: 'medium' as const,
            type: 'short-answer' as const
          })
        }
      }
    }
    
    return questions
  }
  
  private static extractStudyTips(content: string): string[] {
    const match = content.match(/### Memory Techniques\s*(.*?)(?=###|$)/)
    if (!match) return []
    
    return match[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(tip => tip.length > 0)
  }
  
  private static extractConnections(content: string): string[] {
    const match = content.match(/## 🔗 Connections\s*(.*?)(?=##|$)/)
    if (!match) return []
    
    return match[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(connection => connection.length > 0)
  }
  
  private static extractSubject(analysis: string): string {
    const match = analysis.match(/Primary Subject:\s*\[(.*?)\]/i)
    return match ? match[1] : 'Unknown'
  }
  
  private static extractLevel(analysis: string): string {
    const match = analysis.match(/Academic Level:\s*\[(.*?)\]/i)
    return match ? match[1] : 'Unknown'
  }
}

/**
 * Quick utility for simple prompt chaining
 */
export async function enhanceVisionOutput(
  rawOutput: string,
  geminiClient: any,
  studentLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<EducationalOutput> {
  
  return EducationalPromptChain.processEducationalContent(
    rawOutput,
    geminiClient,
    { studentLevel, outputFormat: 'comprehensive' }
  )
}