'use client'

import { useState } from 'react'
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'

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

  const currentCard = cards[cardOrder[currentIndex]]

  const handleFlip = () => {
    if (!flipped) {
      setViewedCards(prev => new Set([...prev, currentIndex]))
    }
    setFlipped(!flipped)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % cards.length)
    setFlipped(false)
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length)
    setFlipped(false)
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

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">No flashcards available</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">🃏 Interactive Flashcards</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          {shuffled && <span className="text-purple-600">🔀 Shuffled</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 text-center">
        Progress: {viewedCards.size} of {cards.length} cards viewed
      </p>

      {/* Flashcard */}
      <div className="relative h-80 perspective-1000">
        <div
          onClick={handleFlip}
          className={`relative w-full h-full cursor-pointer transition-transform duration-600 preserve-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
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
              
              <div className="text-center text-sm text-green-600 font-medium mt-4">
                Click to flip back 👆
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={cards.length <= 1}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            title="Shuffle cards"
          >
            <Shuffle size={16} />
            <span>Shuffle</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            title="Reset progress"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Completion Status */}
      {viewedCards.size === cards.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-semibold">🎉 Congratulations! You've viewed all {cards.length} flashcards!</p>
          <p className="text-green-700 text-sm mt-1">Great job studying! Review them again or shuffle for more practice.</p>
        </div>
      )}
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