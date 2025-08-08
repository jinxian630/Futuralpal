/**
 * Client-side gamification utilities
 * Uses localStorage for persistence
 */

import { GamificationEngine } from './gamification'
import { StorageFactory } from './storage-factory'

/**
 * Create a client-side gamification engine instance
 * This should be used in browser/React components
 */
export function createClientGamificationEngine(): GamificationEngine {
  return new GamificationEngine(StorageFactory.createClientStorage())
}

/**
 * Singleton client-side gamification engine
 * Use this for consistent state across components
 */
let clientGamificationEngine: GamificationEngine | null = null

export function getClientGamificationEngine(): GamificationEngine {
  if (!clientGamificationEngine) {
    clientGamificationEngine = createClientGamificationEngine()
  }
  return clientGamificationEngine
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetClientGamificationEngine(): void {
  clientGamificationEngine = null
}