export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterResponse {
  success: boolean
  data?: {
    response: string
    model: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  error?: string
}

export class OpenRouterClient {
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  private apiKey = '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'
  private model = 'deepseek/deepseek-chat-v3-0324:free'

  async generateResponse(params: {
    prompt: string
    systemPrompt?: string
    options?: {
      temperature?: number
      top_p?: number
      max_tokens?: number
    }
  }): Promise<OpenRouterResponse> {
    try {
      const messages: OpenRouterMessage[] = []
      
      // Add system message if provided
      if (params.systemPrompt) {
        messages.push({
          role: 'system',
          content: params.systemPrompt
        })
      }
      
      // Add user prompt
      messages.push({
        role: 'user',
        content: params.prompt
      })

      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: params.options?.temperature ?? 0.1,
        top_p: params.options?.top_p ?? 0.7,
        max_tokens: params.options?.max_tokens ?? 2000,
        stream: false
      }

      console.log('OpenRouter request:', { model: this.model, messageCount: messages.length })

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FuturoPal AI Tutor'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API Error:', errorText)
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('OpenRouter response received:', { model: data.model, usage: data.usage })
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter API')
      }

      const content = data.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenRouter response')
      }

      return {
        success: true,
        data: {
          response: content,
          model: data.model || this.model,
          usage: data.usage
        }
      }

    } catch (error) {
      console.error('OpenRouter client error:', error)
      
      let errorMessage = 'Failed to connect to AI service'
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error connecting to AI service. Please check your internet connection.'
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please check API key configuration.'
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid request format or model configuration. Please check the model ID.'
        } else if (error.message.includes('not a valid model ID')) {
          errorMessage = `Model ID '${this.model}' is not valid. Please check OpenRouter model availability.`
        } else {
          errorMessage = `AI service error: ${error.message}`
        }
      }

      return { 
        success: false, 
        error: errorMessage 
      }
    }
  }

  async healthCheck(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      console.log('Testing OpenRouter health with model:', this.model)
      
      const testResponse = await this.generateResponse({
        prompt: 'Hello, are you working correctly? Please respond briefly.',
        systemPrompt: 'You are DeepSeek V3, a helpful AI assistant. Respond briefly to confirm you are working.',
        options: { max_tokens: 50 }
      })
      
      if (testResponse.success) {
        console.log('OpenRouter health check successful')
        return { 
          success: true, 
          model: this.model 
        }
      } else {
        console.error('OpenRouter health check failed:', testResponse.error)
        return { 
          success: false, 
          error: testResponse.error || 'Health check failed' 
        }
      }

    } catch (error) {
      console.error('Health check error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown health check error'
      }
    }
  }
}

export const openRouterClient = new OpenRouterClient() 