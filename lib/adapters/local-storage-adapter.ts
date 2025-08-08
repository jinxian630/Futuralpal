import { Storage } from '../storage'

/**
 * LocalStorage adapter for client-side storage
 * Uses browser localStorage API
 */
export class LocalStorageAdapter implements Storage {
  /**
   * Check if localStorage is available
   * @returns true if localStorage is available, false otherwise
   */
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
    } catch {
      return false
    }
  }

  getItem(key: string): string | null {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available, returning null for key:', key)
      return null
    }

    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available, cannot store key:', key)
      return
    }

    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      // Handle quota exceeded or other localStorage errors gracefully
    }
  }

  removeItem(key: string): void {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available, cannot remove key:', key)
      return
    }

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  clear(): void {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available, cannot clear')
      return
    }

    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}