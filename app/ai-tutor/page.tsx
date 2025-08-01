'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, MessageSquare, Send, BookOpen, Target, Zap, Brain, Award, TrendingUp, CheckCircle, XCircle, Star } from 'lucide-react'
import { aiAgent, readFileContent, Question } from '@/lib/ai-agent'

interface StudySession {
  notes: string
  flashcards: string
  currentQuestion: Question | null
  questionsAsked: Question[]
  studyContext: string
}

const AITutorPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{
    step: number
    stepName: string
    total: number
  }>({ step: 0, stepName: '', total: 4 })
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    type?: 'chat' | 'question' | 'feedback' | 'notes'
    metadata?: any
  }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your intelligent AI tutor powered by DeepSeek V3. I can help you with:\n\n📚 **Study Notes** - Generate comprehensive notes from your documents\n🎯 **Smart Questions** - Practice with adaptive difficulty levels\n🧠 **Intelligent Feedback** - Get detailed explanations and tips\n📈 **Progress Tracking** - Monitor your learning journey\n\nUpload a text document (PDF, DOCX, TXT, MD) or ask me anything to get started!",
      type: 'chat'
    }
  ])

  const [studySession, setStudySession] = useState<StudySession>({
    notes: '',
    flashcards: '',
    currentQuestion: null,
    questionsAsked: [],
    studyContext: ''
  })

  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [achievements, setAchievements] = useState<string[]>([])
  const [serviceError, setServiceError] = useState<string | null>(null)

  // Helper functions for note persistence
  const saveNotesToStorage = (notesData: any) => {
    try {
      const savedNotes = {
        fileName: notesData.fileName,
        notes: notesData.notes,
        analysis: notesData.analysis,
        flashcards: notesData.flashcards,
        generatedAt: notesData.generatedAt,
        fileContent: notesData.fileContent || ''
      }
      localStorage.setItem(`futupal_notes_${notesData.fileName}`, JSON.stringify(savedNotes))
      
      // Also maintain a list of saved notes
      const existingNotes = getSavedNotesList()
      const notesList = existingNotes.filter((note: any) => note.fileName !== notesData.fileName)
      notesList.unshift({ fileName: notesData.fileName, generatedAt: notesData.generatedAt })
      localStorage.setItem('futupal_notes_list', JSON.stringify(notesList))
      
      console.log('Notes saved to localStorage')
      return true
    } catch (error) {
      console.warn('Failed to save notes to localStorage:', error)
      return false
    }
  }

  const getSavedNotesList = () => {
    try {
      const notesList = localStorage.getItem('futupal_notes_list')
      return notesList ? JSON.parse(notesList) : []
    } catch (error) {
      console.warn('Failed to load notes list from localStorage:', error)
      return []
    }
  }

  const loadNotesFromStorage = (fileName: string) => {
    try {
      const savedNotes = localStorage.getItem(`futupal_notes_${fileName}`)
      return savedNotes ? JSON.parse(savedNotes) : null
    } catch (error) {
      console.warn('Failed to load notes from localStorage:', error)
      return null
    }
  }

  const loadSavedNotesToChat = (fileName: string) => {
    const savedNotes = loadNotesFromStorage(fileName)
    if (savedNotes) {
      const formattedNotes = `## 📚 Study Notes for ${savedNotes.fileName} (Loaded from Storage)
        
### 🔍 Content Analysis
${savedNotes.analysis}

### 📝 Comprehensive Notes
${savedNotes.notes}

### 🎯 Quick Reference Cards
${savedNotes.flashcards}

---
*Originally generated on: ${new Date(savedNotes.generatedAt).toLocaleString()}*
*Loaded from local storage*`

      const loadedMessage = {
        role: 'assistant' as const,
        content: formattedNotes,
        type: 'notes' as const,
        metadata: {
          ...savedNotes,
          isLoaded: true
        }
      }
      setConversation(prev => [...prev, loadedMessage])

      setStudySession(prev => ({
        ...prev,
        notes: savedNotes.notes,
        flashcards: savedNotes.flashcards,
        studyContext: savedNotes.fileContent
      }))

      return true
    }
    return false
  }

  useEffect(() => {
    // Initialize study session and check service connection
    checkServiceConnection()
    aiAgent.updateProgress('start_study_session', {})

    // Show saved notes on startup
    const savedNotesList = getSavedNotesList()
    if (savedNotesList.length > 0) {
      const welcomeMessage = {
        role: 'assistant' as const,
        content: `💾 **Previous Study Sessions Found!**\n\nI found ${savedNotesList.length} saved study session(s):\n${savedNotesList.map((note: any, index: number) => `${index + 1}. ${note.fileName} (${new Date(note.generatedAt).toLocaleDateString()})`).join('\n')}\n\nYou can upload the same files again to reload your notes, or upload new materials to continue learning!`,
        type: 'chat' as const,
        metadata: { savedNotesList }
      }
      setConversation(prev => [...prev, welcomeMessage])
    }
  }, [])

  const checkServiceConnection = async () => {
    try {
      // Import safe fetch helper
      const { safeFetch } = await import('@/lib/fetch-helper')
      
      const result = await safeFetch('/api/ollama-health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!result.success) {
        throw new Error(result.error || 'AI service not responding')
      }
      
      const data = result.data
      if (!data.success) {
        throw new Error(data.error || 'AI service not responding')
      }
      
      setServiceError(null)
    } catch (error) {
      console.error('Service connection error:', error)
      setServiceError('AI service connection issue. Some features may be limited.')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if it's an unsupported image file
      if (file.type.startsWith('image/')) {
        const errorMessage = {
          role: 'assistant' as const,
          content: `❌ **Image files are not supported**\n\nDeepSeek V3 is a text-only model and cannot process images. Please upload text-based documents instead:\n\n📄 **Supported formats:**\n• PDF documents\n• Word documents (.docx)\n• Text files (.txt)\n• Markdown files (.md)\n\n💡 **Tip:** If you have an image with text, try using OCR software to extract the text first, then upload the text document.`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleGenerateNotes = async () => {
    if (!selectedFile) return

    // Check if notes for this file already exist
    const existingNotes = loadNotesFromStorage(selectedFile.name)
    if (existingNotes) {
      const confirmRegenerate = window.confirm(
        `📚 I found existing study notes for "${selectedFile.name}" from ${new Date(existingNotes.generatedAt).toLocaleDateString()}.\n\nWould you like to:\n✅ Load existing notes (Cancel)\n🔄 Generate new notes (OK)`
      )
      
      if (!confirmRegenerate) {
        // Load existing notes
        const loaded = loadSavedNotesToChat(selectedFile.name)
        if (loaded) {
          const loadMessage = {
            role: 'assistant' as const,
            content: `✅ **Loaded existing notes for "${selectedFile.name}"**\n\nYour previous study session is now ready! You can continue with questions or generate new content.`,
            type: 'chat' as const
          }
          setConversation(prev => [...prev, loadMessage])
        }
        return
      }
    }
    
    setIsGenerating(true)
    setServiceError(null) // Clear any previous errors
    setGenerationProgress({ step: 1, stepName: 'Reading file content...', total: 3 })
    
    try {
      // Step 1: Extract text from file automatically
      setGenerationProgress({ step: 1, stepName: 'Extracting text from file...', total: 4 })
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // Import safe fetch helper
      const { safePostFormData } = await import('@/lib/fetch-helper')
      
      const extractResult = await safePostFormData('/api/upload', formData)
      
      if (!extractResult.success) {
        throw new Error(extractResult.error || 'Failed to extract text from file')
      }
      
      const extractData = extractResult.data
      console.log('🔍 DEBUGGING: Text extraction result:', extractData) // Debug log
      
      // Handle both old and new API response formats
      const extractedText = extractData?.extractedText || extractData?.data?.extractedText || extractData?.text
      
      if (!extractedText) {
        throw new Error('No text could be extracted from the file. Please ensure your file contains readable text and is not corrupted.')
      }
      
      const fileContent = extractedText
      console.log('🔍 DEBUGGING: Extracted text length:', fileContent.length) // Debug log
      console.log('🔍 DEBUGGING: First 300 chars of extracted content:', fileContent.substring(0, 300))
      
      // Verify this is the enhanced format that contains actual PDF content
      const isEnhancedFormat = fileContent.includes('EXTRACTED CONTENT FOR DEEPSEEK V3 ANALYSIS')
      console.log('🔍 DEBUGGING: Is enhanced format?', isEnhancedFormat)
      
      if (isEnhancedFormat) {
        // Extract just the PDF portion to verify it's real content
        const pdfStart = fileContent.indexOf('EXTRACTED CONTENT FOR DEEPSEEK V3 ANALYSIS:')
        const pdfEnd = fileContent.indexOf('PROCESSING INSTRUCTIONS FOR DEEPSEEK V3:')
        if (pdfStart !== -1 && pdfEnd !== -1) {
          const pdfContent = fileContent.substring(pdfStart + 43, pdfEnd).trim()
          console.log('🔍 DEBUGGING: Actual PDF content preview:', pdfContent.substring(0, 200))
          console.log('🔍 DEBUGGING: PDF content length:', pdfContent.length)
        }
      }
      
      setGenerationProgress({ step: 2, stepName: 'Analyzing content with DeepSeek V3...', total: 4 })
      setGenerationProgress({ step: 3, stepName: 'Generating intelligent study notes...', total: 4 })
      
      const result = await aiAgent.generateStudyNotes(fileContent, selectedFile.name)
      console.log('Notes generation result:', result) // Debug log
      
      setGenerationProgress({ step: 4, stepName: 'Finalizing and saving notes...', total: 4 })
      
      if (result.success && result.data) {
        // Extract the comprehensive notes data
        const { notes, analysis, flashcards, fileName, generatedAt } = result.data
        
        // Create a formatted notes display
        const formattedNotes = `## 📚 Study Notes for ${fileName}
        
### 🔍 Content Analysis
${analysis}

### 📝 Comprehensive Notes
${notes}

### 🎯 Quick Reference Cards
${flashcards}

---
*Generated on: ${new Date(generatedAt).toLocaleString()}*
*Powered by DeepSeek V3*`
        
        const newMessage = {
          role: 'assistant' as const,
          content: formattedNotes,
          type: 'notes' as const,
          metadata: {
            ...result.data,
            originalResult: result
          }
        }
        setConversation(prev => [...prev, newMessage])
        
        // Update study session with proper data
        setStudySession(prev => ({
          ...prev,
          notes: notes,
          flashcards: flashcards,
          studyContext: fileContent
        }))

        // Store notes in localStorage for persistence
        const savedSuccessfully = saveNotesToStorage({
          fileName: fileName,
          notes: notes,
          analysis: analysis,
          flashcards: flashcards,
          generatedAt: generatedAt,
          fileContent: fileContent
        })

        // Update progress
        await aiAgent.updateProgress('generate_notes', { fileName: selectedFile.name })
        
        // Show success feedback
        const successMessage = {
          role: 'assistant' as const,
          content: `✅ ${result.message}\n\n💾 Your notes have been saved and are ready for study!\n\n🧠 **Powered by DeepSeek V3** - Advanced text analysis and educational content generation`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, successMessage])
        
      } else {
        // Handle API errors with better user feedback
        const errorDetails = result.details ? `\n\nDetails: ${result.details}` : ''
        const errorMessage = {
          role: 'assistant' as const,
          content: `❌ **Note Generation Failed**\n\n${result.error || 'Unknown error occurred'}${errorDetails}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
        
        // Set specific error states
        if (result.error?.includes('service')) {
          setServiceError('AI service is experiencing issues')
        }
      }
    } catch (error) {
      console.error('Error in handleGenerateNotes:', error) // Enhanced debug log
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      let displayMessage = `❌ **Error Processing File**\n\n${errorMsg}`
      
      // Provide specific error guidance
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Network error')) {
        displayMessage = '🌐 **Network Connection Issue**\n\nThere seems to be a network problem. Please check your internet connection and try again.\n\n**Troubleshooting:**\n1. Check your internet connection\n2. Refresh the page\n3. Try again in a moment\n4. Contact support if the issue persists'
        setServiceError('Network connection issue')
      } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('401')) {
        displayMessage = '🔐 **Authentication Issue**\n\nThere\'s an API authentication problem. Please contact support.\n\n**This might be due to:**\n• API key configuration issue\n• Service authentication problem\n• Temporary service outage'
        setServiceError('Authentication issue with AI service')
      } else if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        displayMessage = '⏰ **Rate Limit Reached**\n\nThe AI service is temporarily rate-limited. Please wait a moment and try again.\n\n**What to do:**\n• Wait 1-2 minutes\n• Try with a smaller document\n• Contact support if this persists'
        setServiceError('Rate limit reached')
      } else if (errorMsg.includes('No text could be extracted')) {
        displayMessage = '📄 **File Processing Issue**\n\nI couldn\'t extract text from your file. Please try:\n\n• **PDF files**: Ensure they contain selectable text (not scanned images)\n• **Word documents**: Make sure the file isn\'t corrupted\n• **Text files**: Check the file encoding and content\n• **Alternative**: Try converting to a different format\n\n💡 **Tip**: For scanned documents, try using OCR software first!'
      } else if (errorMsg.includes('File too large') || errorMsg.includes('size')) {
        displayMessage = '📊 **File Size Issue**\n\nYour file might be too large or complex. Try:\n\n• Breaking large documents into smaller sections\n• Removing unnecessary images or formatting\n• Using text extraction tools first\n• Uploading key pages only\n\n**Current limits**: Best results with files under 5MB'
      }
      
      const errorMessage = {
        role: 'assistant' as const,
        content: displayMessage,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      setGenerationProgress({ step: 0, stepName: '', total: 4 })
    }
  }

  const handleGenerateQuestion = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!studySession.studyContext) {
      const errorMessage = {
        role: 'assistant' as const,
        content: '📝 Please upload and generate study notes first, so I can create relevant questions for you!',
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
      return
    }

    setIsGenerating(true)
    setCurrentDifficulty(difficulty)

    try {
      const topic = selectedFile?.name || 'General Topic'
      const result = await aiAgent.generateQuestion(
        topic, 
        difficulty, 
        studySession.studyContext, 
        studySession.questionsAsked
      )
      
      console.log('Question generation result:', result) // Debug log
      
      if (result.success && result.question) {
        const question = result.question as Question
        const encouragement = result.encouragement || `Here's a ${difficulty} question for you!`
        
        const questionMessage = {
          role: 'assistant' as const,
          content: `${encouragement}\n\n**${difficulty.toUpperCase()} Question:**\n\n${question.question}`,
          type: 'question' as const,
          metadata: { question, encouragement }
        }
        
        setConversation(prev => [...prev, questionMessage])
        setStudySession(prev => ({
          ...prev,
          currentQuestion: question,
          questionsAsked: [...prev.questionsAsked, question]
        }))
        setShowAnswer(false)
        setUserAnswer('')
      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: `Sorry, I couldn't generate a question: ${result.error}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      let displayMessage = `Error generating question: ${errorMsg}`
      
      // Check if it's a service connection error
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Network error')) {
        displayMessage = '🌐 **Network Connection Issue**\n\nPlease check your internet connection and try again.'
        setServiceError('Network connection issue')
      } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('401')) {
        displayMessage = '🔐 **Service Authentication Issue**\n\nThere\'s an API authentication problem. Please contact support.'
        setServiceError('Authentication issue with AI service')
      }
      
      const errorMessage = {
        role: 'assistant' as const,
        content: displayMessage,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!studySession.currentQuestion || !userAnswer.trim()) return

    setIsGenerating(true)

    try {
      const result = await aiAgent.checkAnswer(
        studySession.currentQuestion,
        userAnswer,
        { difficulty: currentDifficulty }
      )
      
      if (result.success && result.feedback) {
        const feedback = result.feedback
        
        const feedbackMessage = {
          role: 'assistant' as const,
          content: feedback.encouragement || 'Good job!',
          type: 'feedback' as const,
          metadata: { 
            ...feedback, 
            performanceMessage: result.performanceMessage,
            nextSteps: result.nextSteps 
          }
        }
        
        setConversation(prev => [...prev, feedbackMessage])
        setShowAnswer(true)

        // Update progress
        await aiAgent.updateProgress('answer_question', {
          isCorrect: feedback.isCorrect,
          topic: studySession.currentQuestion?.topic,
          difficulty: currentDifficulty,
          timeSpent: 2
        })

        // Update difficulty based on performance if needed
        if (feedback.rating >= 4 && currentDifficulty === 'easy') {
          setCurrentDifficulty('medium')
        } else if (feedback.rating >= 4 && currentDifficulty === 'medium') {
          setCurrentDifficulty('hard')
        } else if (feedback.rating < 3 && currentDifficulty === 'hard') {
          setCurrentDifficulty('medium')
        } else if (feedback.rating < 3 && currentDifficulty === 'medium') {
          setCurrentDifficulty('easy')
        }

      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: `Sorry, I couldn't check your answer: ${result.error}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      let displayMessage = `Error checking answer: ${errorMsg}`
      
      // Check if it's a service connection error
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Network error')) {
        displayMessage = '🌐 **Network Connection Issue**\n\nPlease check your internet connection and try again.'
        setServiceError('Network connection issue')
      } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('401')) {
        displayMessage = '🔐 **Service Authentication Issue**\n\nThere\'s an API authentication problem. Please contact support.'
        setServiceError('Authentication issue with AI service')
      }
      
      const errorMessage = {
        role: 'assistant' as const,
        content: displayMessage,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      type: 'chat' as const
    }

    setConversation(prev => [...prev, newUserMessage])
    setUserMessage('')
    setIsGenerating(true)

    try {
      const result = await aiAgent.askTutor(
        userMessage,
        studySession.studyContext,
        { questionsAnswered: studySession.questionsAsked.length }
      )

      if (result.success) {
        const tutorMessage = {
          role: 'assistant' as const,
          content: result.response || 'I\'m here to help!',
          type: 'chat' as const,
          metadata: {
            suggestedActions: result.suggestedActions,
            followUpEncouragement: result.followUpEncouragement,
            confidenceLevel: result.confidenceLevel
          }
        }
        
        setConversation(prev => [...prev, tutorMessage])
      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: result.fallbackMessage || `Sorry, I couldn't respond: ${result.error}`,
          type: 'chat' as const
        }
        setConversation(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      let displayMessage = `Error: ${errorMsg}`
      
      // Check if it's a service connection error
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Network error')) {
        displayMessage = '🌐 **Network Connection Issue**\n\nPlease check your internet connection and try again.'
        setServiceError('Network connection issue')
      } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('401')) {
        displayMessage = '🔐 **Service Authentication Issue**\n\nThere\'s an API authentication problem. Please contact support.'
        setServiceError('Authentication issue with AI service')
      }
      
      const errorResponse = {
        role: 'assistant' as const,
        content: displayMessage,
        type: 'chat' as const
      }
      setConversation(prev => [...prev, errorResponse])
    } finally {
      setIsGenerating(false)
    }
  }

  // Export notes function
  const exportNotes = (notesData: any, format: 'txt' | 'md' = 'md') => {
    try {
      const { fileName, notes, analysis, flashcards, generatedAt } = notesData
      
      let content = ''
      if (format === 'md') {
        content = `# 📚 Study Notes for ${fileName}

## 🔍 Content Analysis
${analysis}

## 📝 Comprehensive Notes
${notes}

## 🎯 Quick Reference Cards
${flashcards}

---
*Generated on: ${new Date(generatedAt).toLocaleString()}*
*Powered by DeepSeek V3 via FuturoPal AI Tutor*`
      } else {
        content = `Study Notes for ${fileName}

Content Analysis:
${analysis}

Comprehensive Notes:
${notes}

Quick Reference Cards:
${flashcards}

Generated on: ${new Date(generatedAt).toLocaleString()}
Powered by DeepSeek V3 via FuturoPal AI Tutor`
      }

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}_notes.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Failed to export notes:', error)
      return false
    }
  }

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user'
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`px-4 py-3 rounded-lg ${
          isUser 
            ? 'max-w-xs lg:max-w-md bg-primary-600 text-white' 
            : message.type === 'question' 
              ? 'max-w-full lg:max-w-4xl bg-blue-50 border border-blue-200' 
              : message.type === 'feedback' 
                ? 'max-w-full lg:max-w-4xl bg-green-50 border border-green-200' 
                : message.type === 'notes' 
                  ? 'max-w-full lg:max-w-4xl bg-purple-50 border border-purple-200 shadow-lg' 
                  : 'max-w-full lg:max-w-4xl bg-gray-100 text-gray-900'
        }`}>
          {/* Enhanced notes display */}
          {message.type === 'notes' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                <h3 className="text-lg font-bold text-purple-800 flex items-center">
                  📚 Study Notes
                  {message.metadata?.isLoaded && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                      Loaded from Storage
                    </span>
                  )}
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    DeepSeek V3
                  </span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportNotes(message.metadata, 'md')}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors flex items-center space-x-1"
                    title="Export as Markdown"
                  >
                    <span>📄</span>
                    <span>Export MD</span>
                  </button>
                  <button
                    onClick={() => exportNotes(message.metadata, 'txt')}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors flex items-center space-x-1"
                    title="Export as Text"
                  >
                    <span>📝</span>
                    <span>Export TXT</span>
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.content}</div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
          
          {/* Render MCQ options for questions */}
          {message.type === 'question' && message.metadata?.question?.type === 'mcq' && (
            <div className="mt-3 space-y-2">
              {message.metadata.question.options?.map((option: string, optIndex: number) => (
                <button
                  key={optIndex}
                  onClick={() => setUserAnswer(String.fromCharCode(65 + optIndex))}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    userAnswer === String.fromCharCode(65 + optIndex) 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}) {option}
                </button>
              ))}
            </div>
          )}

          {/* Render suggested actions for tutor responses */}
          {message.metadata?.suggestedActions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.metadata.suggestedActions.map((action: any, actionIndex: number) => (
                <button
                  key={actionIndex}
                  onClick={() => {
                    if (action.action === 'generate_questions') {
                      handleGenerateQuestion(currentDifficulty)
                    } else if (action.action === 'easy_quiz') {
                      handleGenerateQuestion('easy')
                    } else if (action.action === 'hard_quiz') {
                      handleGenerateQuestion('hard')
                    }
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Intelligent AI Tutor</h1>
        <p className="text-gray-600">Powered by DeepSeek V3 - Advanced AI learning with adaptive difficulty and personalized feedback</p>
        
        {/* Service Error Banner */}
        {serviceError && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Service Notice</h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>{serviceError}</p>
                  <div className="mt-2">
                    <button 
                      onClick={checkServiceConnection}
                      className="text-orange-600 hover:text-orange-800 underline font-medium"
                    >
                      Test connection again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Banner */}
        {!serviceError && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm text-green-700">✅ DeepSeek V3 AI service connected and ready</span>
            </div>
          </div>
        )}
        
        {/* Progress indicators */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp size={16} className="text-green-500" />
            <span>Difficulty: <span className="font-semibold capitalize text-primary-600">{currentDifficulty}</span></span>
          </div>
          <div className="flex items-center space-x-1">
            <Target size={16} className="text-blue-500" />
            <span>Questions: <span className="font-semibold text-blue-600">{studySession.questionsAsked.length}</span></span>
          </div>
          <div className="flex items-center space-x-1">
            <Brain size={16} className="text-purple-500" />
            <span>Model: <span className="font-semibold text-purple-600">DeepSeek V3</span></span>
          </div>
          {achievements.length > 0 && (
            <div className="flex items-center space-x-1">
              <Award size={16} className="text-yellow-500" />
              <span>Achievements: <span className="font-semibold text-yellow-600">{achievements.length}</span></span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced File Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Study Material</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Upload text documents - powered by DeepSeek V3!</p>
              <div className="text-sm text-gray-500 mb-4 space-y-1">
                <div>📄 <strong>Documents:</strong> PDF, DOCX, TXT, MD</div>
                <div>❌ <strong>Not supported:</strong> Images (text-only model)</div>
              </div>

              
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium cursor-pointer hover:bg-primary-700 transition-colors"
              >
                Choose File
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {selectedFile.name.endsWith('.pdf') ? (
                    <div className="h-8 w-8 text-red-500">📄</div>
                  ) : selectedFile.name.endsWith('.docx') ? (
                    <div className="h-8 w-8 text-blue-500">📘</div>
                  ) : (
                    <FileText className="h-8 w-8 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateNotes}
                  disabled={isGenerating || !!serviceError}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span>🧠 {generationProgress.stepName || 'Processing with DeepSeek V3...'}</span>
                    </>
                  ) : serviceError ? (
                    <span>⚠️ Service Issue</span>
                  ) : selectedFile?.name.endsWith('.pdf') ? (
                    <span>📄 Extract & Analyze PDF</span>
                  ) : selectedFile?.name.endsWith('.docx') ? (
                    <span>📘 Process Word Document</span>
                  ) : (
                    <span>📚 Generate Smart Notes</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Intelligent Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Smart Practice</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleGenerateQuestion('easy')}
                disabled={!studySession.studyContext || isGenerating || !!serviceError}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Target size={20} />
                <span>{serviceError ? 'Service Issue' : 'Easy Questions'}</span>
              </button>
              <button 
                onClick={() => handleGenerateQuestion('medium')}
                disabled={!studySession.studyContext || isGenerating || !!serviceError}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Brain size={20} />
                <span>{serviceError ? 'Service Issue' : 'Medium Questions'}</span>
              </button>
              <button 
                onClick={() => handleGenerateQuestion('hard')}
                disabled={!studySession.studyContext || isGenerating || !!serviceError}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap size={20} />
                <span>{serviceError ? 'Service Issue' : 'Hard Questions'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg h-[700px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">FuturoPal AI Tutor</h3>
                  <p className="text-sm text-green-600">🧠 DeepSeek V3 • Text-Only • Advanced</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversation.map((message, index) => renderMessage(message, index))}
              
              {/* Current Question Answer Input */}
              {studySession.currentQuestion && studySession.currentQuestion.type === 'open-ended' && !showAnswer && (
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Answer:</h4>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your detailed answer here..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isGenerating || !!serviceError}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {serviceError ? 'Service Issue' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              )}

              {/* MCQ Submit Button */}
              {studySession.currentQuestion && studySession.currentQuestion.type === 'mcq' && userAnswer && !showAnswer && (
                <div className="mb-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isGenerating || !!serviceError}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {serviceError ? 'Service Issue' : `Submit Answer (${userAnswer})`}
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-6 py-4 rounded-lg shadow-lg max-w-md">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span className="text-purple-700 font-medium">🧠 DeepSeek V3 Processing...</span>
                    </div>
                    
                    {generationProgress.stepName && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-purple-600">
                          <span>{generationProgress.stepName}</span>
                          <span>{generationProgress.step}/{generationProgress.total}</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out progress-bar"
                            style={{ '--progress-width': `${(generationProgress.step / generationProgress.total) * 100}%` } as React.CSSProperties}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || isGenerating || !!serviceError}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  aria-label={serviceError ? "Service issue" : "Send message"}
                  title={serviceError ? "Service issue" : "Send message"}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AITutorPage 