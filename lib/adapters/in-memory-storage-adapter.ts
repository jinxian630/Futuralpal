import { Storage } from '../storage'

/**
 * In-memory storage adapter for server-side use
 * Uses a Map to store data in memory (session-scoped)
 * 
 * Note: Data will be lost when the server restarts
 * For persistent server-side storage, consider implementing:
 * - DatabaseStorageAdapter (MongoDB, PostgreSQL, etc.)
 * - FileStorageAdapter (JSON files)
 * - RedisStorageAdapter (Redis cache)
 */
export class InMemoryStorageAdapter implements Storage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    const value = this.store.get(key)
    return value ?? null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  /**
   * Get all stored keys (utility method)
   * @returns Array of all keys in storage
   */
  keys(): string[] {
    return Array.from(this.store.keys())
  }

  /**
   * Get the number of items in storage
   * @returns Number of stored items
   */
  size(): number {
    return this.store.size
  }

  /**
   * Check if storage has a specific key
   * @param key The key to check
   * @returns true if key exists, false otherwise
   */
  has(key: string): boolean {
    return this.store.has(key)
  }
}

// Create a singleton instance for server-side use
// This ensures data persistence across API calls during the same server session
export const serverStorageInstance = new InMemoryStorageAdapter()