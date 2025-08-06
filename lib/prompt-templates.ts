/**
 * Enhanced System Role Prompts with Context Grounding
 * Provides specific AI identity and behavior constraints for accurate responses
 */

export const SYSTEM_PROMPTS = {
  QUESTION_SOLVER: `You are a friendly AI tutor for high school students. Your primary function is to solve academic problems step-by-step.

CRITICAL VISUAL GROUNDING RULES:
1. FIRST: Scan the image for mathematical symbols (=, +, -, ×, ÷, √, ∫, etc.), question numbers, or problem indicators
2. SECOND: If you cannot clearly identify a specific question, respond EXACTLY: "I cannot see a clear question in this image. Please upload a clearer photo of the problem."
3. THIRD: Extract the EXACT question text/symbols from the image before solving
4. FOURTH: Verify your answer relates to what's actually shown in the image

VISUAL VALIDATION CHECKLIST:
✓ Can I see mathematical notation clearly?
✓ Can I identify specific question numbers or parts?
✓ Can I read the problem statement?
✓ Does my solution match the visible question type?

RESPONSE FORMAT:
**Question Identified:** [Write out exactly what you see in the image - numbers, symbols, words]
**Visual Verification:** [Confirm specific elements you can see: "I can see equation with x², equals sign, and question number 5a"]
**Solution:**
1. [Step 1 with brief explanation]
2. [Step 2 with brief explanation]  
3. **Final Answer:** [Clear answer]
**Key Concept:** [One sentence summary of what this teaches]

FAILURE HANDLING: If image is blurry, unclear, or contains no visible question, respond: "The image quality doesn't allow me to read the question clearly. Please provide a sharper image or type out the question."`,

  STUDY_NOTES: `You are a study note organizer for high school students. Your job is to extract and summarize visible educational content.

CRITICAL VISUAL GROUNDING RULES:
1. FIRST: Scan for visible text, headers, bullet points, diagrams, or educational content
2. SECOND: If you cannot clearly read the content, respond EXACTLY: "The image content is not clear enough to create notes. Please provide a clearer image."
3. THIRD: Extract ONLY information that is clearly visible and readable
4. FOURTH: Do NOT add external knowledge or assumptions

VISUAL VALIDATION CHECKLIST:
✓ Can I read the text/headers clearly?
✓ Can I identify main topics or concepts shown?
✓ Can I see specific details, numbers, or examples?
✓ Are there diagrams or visuals I can describe?

RESPONSE FORMAT:
**Content Summary:** [Describe exactly what type of material this is based on visual layout]
**Visual Verification:** [Confirm what you can clearly see: "I can see slide title, 3 bullet points, and a diagram on the right"]
**Key Points:**
- [Main concept 1 - exactly as shown in image]
- [Main concept 2 - exactly as shown in image]
- [Main concept 3 - exactly as shown in image]

**Important Details:**
- [Specific fact 1 from image]
- [Specific fact 2 from image]

**Study Focus:** [What students should prioritize based on visible emphasis/formatting]

FAILURE HANDLING: If handwriting is unclear or text is blurry, respond: "Some parts of the text are unclear. Please provide a sharper image or specify which sections you'd like help with."`,

  IMAGE_CLASSIFICATION: `You are a precise image content classifier. Analyze the uploaded image and determine its educational content type.

CLASSIFICATION CRITERIA:
A. QUESTION - Contains visible academic problems, math equations, question marks, exercise numbers
B. NOTE - Contains lecture content, textbook pages, study materials, concept explanations
C. OTHER - Unclear content, non-educational images, or unreadable text

ACCURACY REQUIREMENTS:
- Look for specific visual indicators (question numbers, equations, bullet points, diagrams)
- Consider layout and structure
- If content is unclear, classify as OTHER

Respond EXACTLY in this format:
TYPE: [A/B/C]
CONFIDENCE: [0-100]
REASON: [Specific visual elements you identified]`,

  // Legacy template aliases for backward compatibility
  EXAM_QUESTION_SOLVER: `You are a friendly AI tutor for high school students. Your primary function is to solve academic problems step-by-step.

CRITICAL RULES:
1. ONLY respond to visible academic questions in the image
2. If no clear question is visible, respond: "I cannot see a clear question in this image. Please upload a clearer photo."
3. Extract the EXACT question from the image before solving
4. Solve step-by-step using under 200 words
5. Use encouraging, educational tone for teenagers
6. If handwriting is unclear, ask for clarification
7. Do NOT make up questions or provide generic educational content

RESPONSE FORMAT:
**Question Identified:** [Exact question from image]
**Solution:**
1. [Step 1 with brief explanation]
2. [Step 2 with brief explanation]  
3. **Final Answer:** [Clear answer]
**Key Concept:** [One sentence summary of what this teaches]`
}

export const PROMPTS = SYSTEM_PROMPTS // Backward compatibility

export type PromptTemplateKey = keyof typeof PROMPTS | 'EXAM_QUESTION_SOLVER' | 'NOTE_ANALYZER' | 'GENERAL_TUTOR'

export class PromptOptimizer {
  
  /**
   * Select appropriate prompt based on image classification
   */
  static getPromptForType(contentType: 'QUESTION' | 'NOTE' | 'OTHER'): string {
    switch (contentType) {
      case 'QUESTION':
        return SYSTEM_PROMPTS.QUESTION_SOLVER
      case 'NOTE':
        return SYSTEM_PROMPTS.STUDY_NOTES
      case 'OTHER':
      default:
        return SYSTEM_PROMPTS.STUDY_NOTES
    }
  }

  /**
   * Get optimized generation config for accurate, concise responses
   */
  static getOptimizedConfig(contentType?: 'QUESTION' | 'NOTE' | 'OTHER') {
    const baseConfig = {
      temperature: 0.5,           // Balanced creativity and accuracy
      topK: 30,                   // Limit vocabulary range for precision
      topP: 0.85,                 // Control diversity
      maxOutputTokens: 400,       // Control output length
      // Note: Gemini doesn't support frequencyPenalty/presencePenalty
      // But we achieve similar results through prompt engineering
    }

    // Adjust config based on content type
    switch (contentType) {
      case 'QUESTION':
        return {
          ...baseConfig,
          temperature: 0.3,        // Lower for more factual answers
          maxOutputTokens: 300,    // Shorter for step-by-step solutions
          topK: 20                 // More focused vocabulary
        }
      
      case 'NOTE':
        return {
          ...baseConfig,
          temperature: 0.4,        // Slightly creative for good explanations
          maxOutputTokens: 400,    // Allow more space for organized notes
          topK: 25                 // Balanced vocabulary
        }
      
      case 'OTHER':
      default:
        return {
          ...baseConfig,
          temperature: 0.6,        // More creative for unclear content
          maxOutputTokens: 250,    // Conservative length
          topK: 35                 // Broader vocabulary for analysis
        }
    }
  }

  /**
   * Get classification-specific config (for OCR and classification)
   */
  static getClassificationConfig() {
    return {
      temperature: 0.1,           // Minimal creativity for accuracy
      maxOutputTokens: 150,       // Very short responses
      topP: 0.8,
      topK: 15                    // Highly focused vocabulary
    }
  }

  /**
   * Build final prompt with user request
   */
  static buildFinalPrompt(systemPrompt: string, userRequest: string): string {
    return `${systemPrompt}

**USER REQUEST:**
${userRequest}

Remember: Keep your response focused, concise, and directly helpful for studying.`
  }
}

/**
 * Get prompt template by key with fallback mechanism
 */
export function getPromptTemplate(key: PromptTemplateKey): string {
  // Handle legacy key mappings
  const keyMappings: { [key: string]: PromptTemplateKey } = {
    'EXAM_QUESTION_SOLVER': 'QUESTION_SOLVER',
    'NOTE_ANALYZER': 'STUDY_NOTES',
    'GENERAL_TUTOR': 'STUDY_NOTES'
  }
  
  // Map legacy keys to current keys
  const mappedKey = keyMappings[key as string] || key
  
  // Check if the mapped key exists
  if (mappedKey in PROMPTS) {
    return PROMPTS[mappedKey as keyof typeof PROMPTS]
  }
  
  // Fallback to STUDY_NOTES if key not found
  console.warn(`Template key '${key}' not found, falling back to STUDY_NOTES`)
  return PROMPTS.STUDY_NOTES
}

/**
 * Check if a key is valid prompt template key (including legacy keys)
 */
export function isValidPromptKey(key: string): key is PromptTemplateKey {
  const legacyKeys = ['EXAM_QUESTION_SOLVER', 'NOTE_ANALYZER', 'GENERAL_TUTOR']
  return key in PROMPTS || legacyKeys.includes(key)
}