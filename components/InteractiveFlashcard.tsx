'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, Trophy, Star, Zap } from 'lucide-react'

export interface FlashcardData {
  id: number
  title: string
  front: string
  back: {
    core: string
    hook: string
    connection: string
    tip: string
  }
}

interface InteractiveFlashcardProps {
  cards: FlashcardData[]
  onComplete?: () => void
}

export function InteractiveFlashcard({ cards, onComplete }: InteractiveFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [viewedCards, setViewedCards] = useState(new Set<number>())
  const [shuffled, setShuffled] = useState(false)
  const [cardOrder, setCardOrder] = useState(() => cards.map((_, index) => index))
  const [isAnimating, setIsAnimating] = useState(false)
  const [confidenceScores, setConfidenceScores] = useState<Map<number, number>>(new Map())
  const [showCelebration, setShowCelebration] = useState(false)

  const currentCard = cards[cardOrder[currentIndex]]

  const handleFlip = () => {
    if (!flipped) {
      setViewedCards(prev => new Set([...Array.from(prev), currentIndex]))
    }
    setFlipped(!flipped)
  }

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length)
      setFlipped(false)
      setIsAnimating(false)
    }, 150)
  }

  const handlePrevious = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length)
      setFlipped(false)
      setIsAnimating(false)
    }, 150)
  }

  const handleShuffle = () => {
    const shuffledOrder = [...cardOrder].sort(() => Math.random() - 0.5)
    setCardOrder(shuffledOrder)
    setCurrentIndex(0)
    setFlipped(false)
    setShuffled(true)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setViewedCards(new Set())
    setShuffled(false)
    setCardOrder(cards.map((_, index) => index))
  }

  const progress = (viewedCards.size / cards.length) * 100
  
  // Add confidence scoring functionality
  const markConfidence = (cardId: number, confident: boolean) => {
    setConfidenceScores(prev => new Map(prev.set(cardId, confident ? 1 : 0)))
  }
  
  // Trigger celebration when all cards viewed
  useEffect(() => {
    if (viewedCards.size === cards.length && cards.length > 0) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
      if (onComplete) onComplete()
    }
  }, [viewedCards.size, cards.length, onComplete])

  // Keyboard navigation
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isAnimating) return
    
    switch (event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault()
        handleFlip()
        break
      case 'ArrowLeft':
        event.preventDefault()
        if (cards.length > 1) handlePrevious()
        break
      case 'ArrowRight':
        event.preventDefault()
        if (cards.length > 1) handleNext()
        break
      case 'KeyS':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleShuffle()
        }
        break
      case 'KeyR':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleReset()
        }
        break
    }
  }, [isAnimating, cards.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">No flashcards available</p>
      </div>
    )
  }

  return (
    <div 
      className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4 relative overflow-hidden"
      role="application"
      aria-label="Interactive Flashcard Application"
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-full p-6 shadow-2xl animate-bounce">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <div className="text-center font-bold text-gray-800">All Done!</div>
            </div>
          </div>
          {/* Floating stars */}
          <div className="absolute top-1/4 left-1/4 animate-ping">⭐</div>
          <div className="absolute top-1/3 right-1/4 animate-ping animation-delay-200">✨</div>
          <div className="absolute bottom-1/4 left-1/3 animate-ping animation-delay-400">🌟</div>
        </div>
      )}
      
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Interactive Flashcards
        </h3>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Card {currentIndex + 1} of {cards.length}</span>
          </div>
          {shuffled && (
            <div className="flex items-center gap-1 text-purple-600 font-medium">
              <Shuffle className="w-3 h-3" />
              Shuffled
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">
          Progress: {viewedCards.size} of {cards.length} cards viewed
        </span>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(cards.length, 10) }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                viewedCards.has(i) ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-80 perspective-1000" role="region" aria-label="Flashcard Content">
        <div
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
              e.preventDefault()
              handleFlip()
            }
          }}
          className={`relative w-full h-full cursor-pointer transition-all duration-600 preserve-3d ${
            flipped ? 'rotate-y-180' : ''
          } ${isAnimating ? 'scale-95 opacity-75' : 'scale-100 opacity-100'}`}
          style={{ transformStyle: 'preserve-3d' }}
          role="button"
          tabIndex={0}
          aria-label={`${flipped ? 'Hide answer' : 'Show answer'}. Current card: ${currentCard.title}`}
          aria-expanded={flipped}
        >
          {/* Front of Card */}
          <div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 flex flex-col justify-center items-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h4 className="text-xl font-bold text-blue-900 mb-4">{currentCard.title}</h4>
            <p className="text-lg text-gray-800 mb-6 leading-relaxed">{currentCard.front}</p>
            <div className="text-sm text-blue-600 font-medium">Click to flip 👆</div>
          </div>

          {/* Back of Card */}
          <div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6 rotate-y-180 overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-green-900 mb-4">{currentCard.title}</h4>
              
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <strong className="text-green-800">💡 Core Answer:</strong>
                  <p className="text-gray-700 mt-1">{currentCard.back.core}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <strong className="text-purple-800">🧠 Memory Hook:</strong>
                  <p className="text-gray-700 mt-1">{currentCard.back.hook}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-800">🔗 Connection:</strong>
                  <p className="text-gray-700 mt-1">{currentCard.back.connection}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-orange-200">
                  <strong className="text-orange-800">📚 Study Tip:</strong>
                  <p className="text-gray-700 mt-1">{currentCard.back.tip}</p>
                </div>
              </div>
              
              {/* Confidence Scoring */}
              <div className="mt-4 space-y-2">
                <div className="text-center text-sm text-green-600 font-medium">
                  How confident do you feel? 🤔
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markConfidence(currentCard.id, false)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200 transition-colors"
                  >
                    😅 Need Review
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markConfidence(currentCard.id, true)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
                  >
                    😎 Got It!
                  </button>
                </div>
              </div>
              
              <div className="text-center text-xs text-green-500 font-medium mt-3">
                Click anywhere to flip back 👆
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div 
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200"
        role="group"
        aria-label="Flashcard Navigation Controls"
      >
        <div className="flex items-center gap-2" role="group" aria-label="Card Navigation">
          <button
            onClick={handlePrevious}
            disabled={cards.length <= 1 || isAnimating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Go to previous card. Currently on card ${currentIndex + 1} of ${cards.length}. Use left arrow key as shortcut.`}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={cards.length <= 1 || isAnimating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Go to next card. Currently on card ${currentIndex + 1} of ${cards.length}. Use right arrow key as shortcut.`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Card Management">
          <button
            onClick={handleShuffle}
            disabled={isAnimating}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Shuffle cards for random practice. Use Ctrl+S as shortcut."
          >
            <Shuffle size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isAnimating}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-lg hover:from-orange-200 hover:to-orange-300 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Reset all progress and start over. Use Ctrl+R as shortcut."
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Enhanced Completion Status */}
      {viewedCards.size === cards.length && !showCelebration && (
        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-lg p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse" />
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <Star className="w-5 h-5 text-yellow-400" />
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          
          <p className="text-green-800 font-bold text-lg mb-2">
            🎉 Outstanding! You've mastered all {cards.length} flashcards!
          </p>
          <p className="text-green-700 text-sm mb-4">
            You're on fire! 🔥 Ready for the next challenge or want to review these concepts again?
          </p>
          
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={handleShuffle}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              🔀 Practice Again
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              🔄 Fresh Start
            </button>
          </div>
        </div>
      )}

      {/* Accessibility Help */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2 hover:text-blue-600 transition-colors">
            <span>⌨️ Keyboard Shortcuts</span>
            <span className="text-xs text-gray-500 group-open:hidden">(Click to expand)</span>
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><kbd className="bg-white px-1 py-0.5 rounded border">Space</kbd> or <kbd className="bg-white px-1 py-0.5 rounded border">Enter</kbd> - Flip card</div>
              <div><kbd className="bg-white px-1 py-0.5 rounded border">←</kbd> - Previous card</div>
              <div><kbd className="bg-white px-1 py-0.5 rounded border">→</kbd> - Next card</div>
              <div><kbd className="bg-white px-1 py-0.5 rounded border">Ctrl+S</kbd> - Shuffle</div>
              <div><kbd className="bg-white px-1 py-0.5 rounded border">Ctrl+R</kbd> - Reset</div>
              <div className="col-span-2 mt-2 text-blue-600 font-medium">💡 Use Tab to navigate between elements</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

// Utility function to parse flashcard text into structured data
export function parseFlashcards(flashcardText: string): FlashcardData[] {
  const cards: FlashcardData[] = []
  
  // Split by card markers
  const cardSections = flashcardText.split(/\*\*🎯 CARD \d+:|\*\*🧠 CARD \d+:|\*\*📊 CARD \d+:/)
  
  cardSections.forEach((section, index) => {
    if (index === 0 || !section.trim()) return // Skip empty first section
    
    const lines = section.trim().split('\n')
    let title = ''
    let front = ''
    let core = ''
    let hook = ''
    let connection = ''
    let tip = ''
    
    let currentSection = 'title'
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.includes('**FRONT:**')) {
        currentSection = 'front'
        front = trimmed.replace('**FRONT:**', '').trim()
      } else if (trimmed.includes('**BACK:**')) {
        currentSection = 'back'
      } else if (trimmed.includes('*Core Answer*:')) {
        core = trimmed.replace(/- \*Core Answer\*:/, '').trim()
      } else if (trimmed.includes('*Memory Hook*:')) {
        hook = trimmed.replace(/- \*Memory Hook\*:/, '').trim()
      } else if (trimmed.includes('*Connection*:')) {
        connection = trimmed.replace(/- \*Connection\*:/, '').trim()
      } else if (trimmed.includes('*Study Tip*:')) {
        tip = trimmed.replace(/- \*Study Tip\*:/, '').trim()
      } else if (currentSection === 'title' && trimmed && !trimmed.startsWith('**')) {
        title = trimmed.replace(/\*\*/g, '')
      } else if (currentSection === 'front' && trimmed && !trimmed.includes('**')) {
        front += (front ? ' ' : '') + trimmed
      }
    }
    
    if (title && front) {
      cards.push({
        id: index,
        title: title || `Card ${index}`,
        front: front || 'No question provided',
        back: {
          core: core || 'No core answer provided',
          hook: hook || 'No memory hook provided',
          connection: connection || 'No connection provided',
          tip: tip || 'No study tip provided'
        }
      })
    }
  })
  
  return cards
}