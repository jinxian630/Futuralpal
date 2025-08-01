import { NextResponse } from 'next/server'

export interface SafeResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
}

// Enhanced fetch helper with better error handling
export async function safeFetch(url: string, options: RequestInit = {}): Promise<SafeResponse> {
  try {
    const response = await fetch(url, options)
    
    // Get response text first to handle HTML error pages
    const responseText = await response.text()
    
    // Check if the response is HTML (common error case)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      return {
        success: false,
        error: `Server returned HTML error page (status: ${response.status}). This usually means the API route crashed or the service is not running.`,
        status: response.status
      }
    }
    
    // Check if response is empty
    if (!responseText.trim()) {
      return {
        success: false,
        error: 'Empty response from server',
        status: response.status
      }
    }
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return {
        success: false,
        error: `Invalid JSON response from server: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        status: response.status
      }
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data
      }
    }
    
    return {
      success: true,
      data,
      status: response.status
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0
    }
  }
}

// Helper for POST requests with JSON body
export async function safePostJSON(url: string, body: any): Promise<SafeResponse> {
  return safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

// Helper for POST requests with FormData body
export async function safePostFormData(url: string, formData: FormData): Promise<SafeResponse> {
  return safeFetch(url, {
    method: 'POST',
    body: formData
  })
} 