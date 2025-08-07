'use client'

import { useState, useEffect } from 'react'
import { X, Check, Wallet, ExternalLink, Copy, Star, BookOpen, Trophy } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { formatSuiAddress, getSuiExplorerUrl, copyToClipboard } from '@/lib/utils/wallet'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showCopied, setShowCopied] = useState(false)
  const { user } = useUser()

  const steps = [
    {
      id: 0,
      title: 'Welcome to FuturoPal!',
      description: 'Your Web3 learning journey starts here with zkLogin technology',
      icon: Star,
      content: (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Welcome to FuturoPal!</h3>
          <p className="text-gray-600 mb-4">
            You've successfully created your Web3 learning identity using Google and zkLogin. 
            Let's take a quick tour to get you started!
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What is zkLogin?</strong><br />
              zkLogin allows you to use your Google account to access Web3 services without managing private keys or seed phrases!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: 'Your Sui Wallet',
      description: 'Explore your blockchain identity and wallet features',
      icon: Wallet,
      content: (
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="text-primary-500" size={24} />
            <h3 className="text-xl font-bold">Your Sui Wallet Address</h3>
          </div>
          
          {user?.address && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your Wallet Address:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-2 rounded font-mono text-sm border flex-1">
                    {formatSuiAddress(user.address)}
                  </code>
                  <button
                    onClick={async () => {
                      await copyToClipboard(user.address)
                      setShowCopied(true)
                      setTimeout(() => setShowCopied(false), 2000)
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => window.open(getSuiExplorerUrl(user.address), '_blank')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="View on Sui Explorer"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
                {showCopied && (
                  <p className="text-green-600 text-xs mt-2">Address copied to clipboard!</p>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your wallet is ready to use on the Sui blockchain</li>
                  <li>• You can receive NFT rewards and certificates</li>
                  <li>• Track your learning progress on-chain</li>
                  <li>• Access exclusive Web3 educational content</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 2,
      title: 'Start Learning',
      description: 'Discover the features that make FuturoPal special',
      icon: BookOpen,
      content: (
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="text-primary-500" size={24} />
            <h3 className="text-xl font-bold">Ready to Learn?</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Trophy className="text-white" size={16} />
                  </div>
                  <h4 className="font-semibold text-purple-800">AI-Powered Tutoring</h4>
                </div>
                <p className="text-sm text-purple-700">
                  Get personalized help from our AI tutor that adapts to your learning style.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="text-white" size={16} />
                  </div>
                  <h4 className="font-semibold text-blue-800">NFT Rewards</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Earn NFT certificates and badges for completing courses and achieving milestones.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <BookOpen className="text-white" size={16} />
                  </div>
                  <h4 className="font-semibold text-green-800">Interactive Courses</h4>
                </div>
                <p className="text-sm text-green-700">
                  Access a wide range of courses with interactive content and real-time feedback.
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🚀 Quick Start Checklist</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• ✅ Created your zkLogin wallet</li>
                <li>• ✅ Accessed your dashboard</li>
                <li>• 📚 Browse available courses</li>
                <li>• 🤖 Try the AI tutor feature</li>
                <li>• 🏆 Complete your first lesson to earn NFT points</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep])
    localStorage.setItem('futuropal_onboarding_completed', 'true')
    onClose()
  }

  const isLastStep = currentStep === steps.length - 1

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    completedSteps.includes(index)
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-primary-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close onboarding modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {steps[currentStep].title}
          </div>
          
          {isLastStep ? (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Check size={16} />
              <span>Get Started</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal