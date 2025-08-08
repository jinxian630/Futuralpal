import { Storage } from './storage'
import { LocalStorageAdapter } from './adapters/local-storage-adapter'
import { InMemoryStorageAdapter, serverStorageInstance } from './adapters/in-memory-storage-adapter'

/**
 * Environment detection utilities
 */
export const Environment = {
  /**
   * Check if we're running in a browser environment
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  },

  /**
   * Check if we're running in a Node.js server environment
   */
  isServer(): boolean {
    return typeof window === 'undefined'
  },

  /**
   * Check if localStorage is available and functional
   */
  hasLocalStorage(): boolean {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false
      }
      // Test localStorage functionality
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Storage factory to create appropriate storage adapter based on environment
 */
export class StorageFactory {
  /**
   * Create storage adapter automatically based on environment
   * @param forceType Optional: force a specific storage type
   * @returns Appropriate Storage implementation
   */
  static create(forceType?: 'localStorage' | 'memory'): Storage {
    if (forceType === 'localStorage') {
      return new LocalStorageAdapter()
    }
    
    if (forceType === 'memory') {
      return serverStorageInstance // Use singleton for server
    }

    // Auto-detect environment
    if (Environment.isBrowser() && Environment.hasLocalStorage()) {
      return new LocalStorageAdapter()
    } else {
      // Server-side or localStorage not available
      return serverStorageInstance // Use singleton for server
    }
  }

  /**
   * Create a client-side storage adapter
   * Safe to use in browser environments
   */
  static createClientStorage(): Storage {
    return new LocalStorageAdapter()
  }

  /**
   * Create a server-side storage adapter
   * Safe to use in Node.js/server environments
   */
  static createServerStorage(): Storage {
    return serverStorageInstance // Use singleton
  }

  /**
   * Get environment information for debugging
   */
  static getEnvironmentInfo(): {
    isBrowser: boolean
    isServer: boolean
    hasLocalStorage: boolean
    recommendedStorage: string
  } {
    const isBrowser = Environment.isBrowser()
    const isServer = Environment.isServer()
    const hasLocalStorage = Environment.hasLocalStorage()
    
    let recommendedStorage = 'memory'
    if (isBrowser && hasLocalStorage) {
      recommendedStorage = 'localStorage'
    }

    return {
      isBrowser,
      isServer,
      hasLocalStorage,
      recommendedStorage
    }
  }
}

/**
 * Convenience function to create storage with automatic environment detection
 */
export function createStorage(forceType?: 'localStorage' | 'memory'): Storage {
  return StorageFactory.create(forceType)
}