/**
 * Storage interface for gamification system
 * Allows different storage backends (localStorage, memory, database, etc.)
 */
export interface Storage {
  /**
   * Retrieves a value from storage
   * @param key The storage key
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null

  /**
   * Stores a value in storage
   * @param key The storage key
   * @param value The value to store
   */
  setItem(key: string, value: string): void

  /**
   * Removes a value from storage
   * @param key The storage key
   */
  removeItem?(key: string): void

  /**
   * Clears all storage (optional)
   */
  clear?(): void
}