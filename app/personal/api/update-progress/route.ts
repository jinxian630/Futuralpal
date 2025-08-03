import { NextRequest, NextResponse } from 'next/server'

interface StudentProgress {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  streakDays: number
  studyTimeMinutes: number
  topicMastery: { [topic: string]: number }
  difficultyPreference: 'easy' | 'medium' | 'hard'
  lastStudyDate: string
  achievements: string[]
  weeklyStats: { [week: string]: { questions: number, accuracy: number } }
}

// In a real app, this would be stored in a database
let studentProgress: StudentProgress = {
  totalQuestions: 0,
  correctAnswers: 0,
  accuracy: 0,
  streakDays: 7, // Current streak from dashboard
  studyTimeMinutes: 0,
  topicMastery: {},
  difficultyPreference: 'easy',
  lastStudyDate: new Date().toISOString().split('T')[0],
  achievements: [],
  weeklyStats: {}
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    let updatedProgress = { ...studentProgress }
    let progressMessage = ''
    let recommendations = []
    let newAchievements = []

    switch (action) {
      case 'answer_question':
        const { isCorrect, topic, difficulty, timeSpent } = data
        
        // Update basic stats
        updatedProgress.totalQuestions += 1
        if (isCorrect) {
          updatedProgress.correctAnswers += 1
        }
        updatedProgress.accuracy = (updatedProgress.correctAnswers / updatedProgress.totalQuestions) * 100
        updatedProgress.studyTimeMinutes += timeSpent || 2

        // Update topic mastery
        if (!updatedProgress.topicMastery[topic]) {
          updatedProgress.topicMastery[topic] = 0
        }
        const currentMastery = updatedProgress.topicMastery[topic]
        if (isCorrect) {
          updatedProgress.topicMastery[topic] = Math.min(100, currentMastery + 10)
        } else {
          updatedProgress.topicMastery[topic] = Math.max(0, currentMastery - 5)
        }

        // Auto-progression logic
        if (updatedProgress.accuracy >= 80 && updatedProgress.totalQuestions >= 5) {
          if (difficulty === 'easy' && updatedProgress.difficultyPreference === 'easy') {
            updatedProgress.difficultyPreference = 'medium'
            recommendations.push('🎉 You\'re ready for medium difficulty questions!')
          } else if (difficulty === 'medium' && updatedProgress.difficultyPreference === 'medium') {
            updatedProgress.difficultyPreference = 'hard'
            recommendations.push('🚀 Time for advanced questions! You\'re mastering this!')
          }
        } else if (updatedProgress.accuracy < 60 && updatedProgress.totalQuestions >= 3) {
          if (difficulty === 'hard' && updatedProgress.difficultyPreference === 'hard') {
            updatedProgress.difficultyPreference = 'medium'
            recommendations.push('💪 Let\'s build confidence with medium questions first.')
          } else if (difficulty === 'medium' && updatedProgress.difficultyPreference === 'medium') {
            updatedProgress.difficultyPreference = 'easy'
            recommendations.push('🌟 Back to basics! Master the fundamentals first.')
          }
        }

        // Check for achievements
        if (updatedProgress.totalQuestions === 1) {
          newAchievements.push('🎯 First Question Answered!')
        }
        if (updatedProgress.totalQuestions === 10) {
          newAchievements.push('🏆 Question Master - 10 Questions!')
        }
        if (updatedProgress.totalQuestions === 50) {
          newAchievements.push('🌟 Half Century - 50 Questions!')
        }
        if (updatedProgress.accuracy >= 90 && updatedProgress.totalQuestions >= 10) {
          newAchievements.push('🎯 Sharpshooter - 90% Accuracy!')
        }
        if (updatedProgress.correctAnswers >= 25) {
          newAchievements.push('💯 Quarter Century Correct!')
        }

        progressMessage = isCorrect ? 
          `Great job! Your accuracy is now ${updatedProgress.accuracy.toFixed(1)}%` :
          `Keep learning! Your accuracy is ${updatedProgress.accuracy.toFixed(1)}%`
        break

      case 'start_study_session':
        const today = new Date().toISOString().split('T')[0]
        const lastStudy = new Date(updatedProgress.lastStudyDate)
        const todayDate = new Date(today)
        const daysDiff = Math.floor((todayDate.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 1) {
          updatedProgress.streakDays += 1
        } else if (daysDiff > 1) {
          updatedProgress.streakDays = 1
        }

        updatedProgress.lastStudyDate = today

        // Streak achievements
        if (updatedProgress.streakDays === 3) {
          newAchievements.push('🔥 3-Day Streak!')
        } else if (updatedProgress.streakDays === 7) {
          newAchievements.push('🔥 Week Warrior!')
        } else if (updatedProgress.streakDays === 30) {
          newAchievements.push('🔥 Month Master!')
        }

        progressMessage = `Welcome back! Your study streak is ${updatedProgress.streakDays} days!`
        break

      case 'generate_notes':
        updatedProgress.studyTimeMinutes += 5
        if (!updatedProgress.achievements.includes('📚 Note Taker')) {
          newAchievements.push('📚 Note Taker!')
        }
        progressMessage = 'Study notes generated! +5 minutes study time.'
        break

      case 'generate_flashcards':
        updatedProgress.studyTimeMinutes += 3
        if (!updatedProgress.achievements.includes('🗃️ Flashcard Creator')) {
          newAchievements.push('🗃️ Flashcard Creator!')
        }
        progressMessage = 'Flashcards created! +3 minutes study time.'
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        })
    }

    // Add new achievements to the list
    updatedProgress.achievements = [...updatedProgress.achievements, ...newAchievements]

    // Generate personalized recommendations
    const weakestTopic = Object.entries(updatedProgress.topicMastery)
      .sort(([,a], [,b]) => a - b)[0]

    if (weakestTopic && weakestTopic[1] < 70) {
      recommendations.push(`📚 Focus on ${weakestTopic[0]} (${Math.round(weakestTopic[1])}% mastery)`)
    }

    if (updatedProgress.studyTimeMinutes >= 60 && !updatedProgress.achievements.includes('⏰ Hour Scholar')) {
      newAchievements.push('⏰ Hour Scholar - 1 Hour Studied!')
      updatedProgress.achievements.push('⏰ Hour Scholar')
    }

    // Update the stored progress (in a real app, save to database)
    studentProgress = updatedProgress

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      progressMessage: progressMessage,
      recommendations: recommendations,
      newAchievements: newAchievements,
      nextDifficultyLevel: updatedProgress.difficultyPreference,
      studyStats: {
        totalTime: `${Math.floor(updatedProgress.studyTimeMinutes / 60)}h ${updatedProgress.studyTimeMinutes % 60}m`,
        averageAccuracy: `${updatedProgress.accuracy.toFixed(1)}%`,
        questionsAnswered: updatedProgress.totalQuestions,
        currentStreak: `${updatedProgress.streakDays} days`
      }
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update progress' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      progress: studentProgress
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get progress' 
      },
      { status: 500 }
    )
  }
} 