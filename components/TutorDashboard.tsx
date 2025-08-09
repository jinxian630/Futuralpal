'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Users, 
  BookOpen, 
  TrendingDown, 
  MessageSquare, 
  FileQuestion,
  Clock,
  Target,
  Mail,
  Brain,
  Zap
} from 'lucide-react'

interface StudentAtRisk {
  userId: string
  userName: string
  courseId: string
  courseName: string
  effortScore: number
  status: string
  emoji: string
}

interface TutorDashboardProps {
  tutorId: string
}

export default function TutorDashboard({ tutorId }: TutorDashboardProps) {
  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentAtRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentAtRisk | null>(null)
  const [generatedPlan, setGeneratedPlan] = useState<string>('')
  const [generatingPlan, setGeneratingPlan] = useState(false)

  useEffect(() => {
    fetchStudentsAtRisk()
  }, [tutorId])

  const fetchStudentsAtRisk = async () => {
    try {
      const response = await fetch(`/api/tutor/students-at-risk?tutorId=${tutorId}`)
      if (response.ok) {
        const data = await response.json()
        setStudentsAtRisk(data)
      }
    } catch (error) {
      console.error('Failed to fetch students at risk:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRemediationPlan = async (student: StudentAtRisk) => {
    setGeneratingPlan(true)
    setGeneratedPlan('')
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a tutor assistant. The student ${student.userName} in course "${student.courseName}" has an effort score of ${student.effortScore}% and status "${student.status}". Generate a specific 3-step action plan to help improve their performance. Include 2 recommended micro-activities with estimated time. Be supportive and constructive.`
            },
            {
              role: 'user',
              content: `Create a remediation plan for ${student.userName} who is struggling in ${student.courseName}.`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedPlan(data.choices[0]?.message?.content || 'Failed to generate plan')
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
      setGeneratedPlan('Error generating plan. Please try again.')
    } finally {
      setGeneratingPlan(false)
    }
  }

  const createPracticeQuiz = async (student: StudentAtRisk) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Generate a short 3-question practice quiz for the course "${student.courseName}" suitable for a struggling student. Include questions, multiple choice answers, and correct answers with explanations.`
            },
            {
              role: 'user',
              content: `Create a practice quiz for ${student.courseName}`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const quizContent = data.choices[0]?.message?.content
        
        // In a real app, you'd save this quiz to the database
        alert(`Quiz generated! Content:\n\n${quizContent}`)
      }
    } catch (error) {
      console.error('Failed to create quiz:', error)
      alert('Failed to create quiz. Please try again.')
    }
  }

  const sendEncouragement = async (student: StudentAtRisk) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Write a brief, encouraging message (2-3 sentences) for a student who is struggling. Be supportive, specific to their situation, and offer help. The student is ${student.userName} in ${student.courseName} with ${student.effortScore}% effort score.`
            },
            {
              role: 'user',
              content: `Write an encouraging message for ${student.userName}`
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const message = data.choices[0]?.message?.content
        
        // In a real app, you'd send this through the messaging system
        alert(`Message ready to send:\n\n${message}`)
      }
    } catch (error) {
      console.error('Failed to generate message:', error)
      alert('Failed to generate message. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
        <p className="text-gray-600">Monitor student progress and provide targeted support</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Students at Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentsAtRisk.filter(s => s.status === 'at-risk').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentsAtRisk.filter(s => s.status === 'concerned').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Monitored</p>
              <p className="text-2xl font-bold text-gray-900">{studentsAtRisk.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Effort Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentsAtRisk.length > 0 
                  ? Math.round(studentsAtRisk.reduce((sum, s) => sum + s.effortScore, 0) / studentsAtRisk.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Students Needing Support</h2>
              <p className="text-sm text-gray-600">Click on a student to see details and generate action plans</p>
            </div>
            
            <div className="p-6">
              {studentsAtRisk.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students at risk</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All your students are performing well! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentsAtRisk.map((student) => (
                    <div
                      key={`${student.userId}-${student.courseId}`}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedStudent && 
                        selectedStudent.userId === student.userId && 
                        selectedStudent.courseId === student.courseId
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{student.emoji}</div>
                          <div>
                            <h3 className="font-medium text-gray-900">{student.userName}</h3>
                            <p className="text-sm text-gray-600">{student.courseName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                student.status === 'at-risk' 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {student.status.replace('-', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                Effort: {student.effortScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              generateRemediationPlan(student)
                              setSelectedStudent(student)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Generate Action Plan"
                          >
                            <Brain size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              createPracticeQuiz(student)
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Create Practice Quiz"
                          >
                            <FileQuestion size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              sendEncouragement(student)
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Send Encouragement"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6">
              {selectedStudent ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedStudent.emoji}</div>
                    <h3 className="font-medium text-gray-900">{selectedStudent.userName}</h3>
                    <p className="text-sm text-gray-600">{selectedStudent.courseName}</p>
                    <p className="text-sm font-medium mt-1">
                      Effort Score: <span className={selectedStudent.effortScore < 40 ? 'text-red-600' : 'text-yellow-600'}>
                        {selectedStudent.effortScore}%
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => generateRemediationPlan(selectedStudent)}
                      disabled={generatingPlan}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Brain size={16} />
                      <span>{generatingPlan ? 'Generating...' : 'Generate Action Plan'}</span>
                    </button>

                    <button
                      onClick={() => createPracticeQuiz(selectedStudent)}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <FileQuestion size={16} />
                      <span>Create Practice Quiz</span>
                    </button>

                    <button
                      onClick={() => sendEncouragement(selectedStudent)}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      <MessageSquare size={16} />
                      <span>Send Message</span>
                    </button>
                  </div>

                  {generatedPlan && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Generated Action Plan:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{generatedPlan}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Student</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a student from the list to see action options
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}