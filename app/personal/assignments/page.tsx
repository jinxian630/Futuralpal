'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, FileText, Send, Calendar, Trophy } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import ModularBot, { BOT_PERSONALITIES } from '@/components/ModularBot'
import { User } from '@/types/api'

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  maxScore: number
  course: {
    id: string
    title: string
  }
  homeworkStatus: {
    completed: boolean
    score: number | null
    submittedAt: string | null
  } | null
}

const AssignmentsPage = () => {
  const { user, isAuthenticated, isLoading } = useUser()
  const apiUser = user as unknown as User
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAssignments()
    }
  }, [isAuthenticated, user])

  const fetchAssignments = async () => {
    try {
      // Get assignments for the demo course
      const response = await fetch(`/api/assignments?courseId=demo-course-1&userId=${apiUser?.id || apiUser?.oidcSub}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitHomework = async (assignmentId: string) => {
    if (!submissionText.trim()) {
      alert('Please enter your submission before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          userId: apiUser?.id || apiUser?.oidcSub,
          content: submissionText,
          completed: true
        })
      })

      if (response.ok) {
        alert('Homework submitted successfully! 🎉')
        setSelectedAssignment(null)
        setSubmissionText('')
        fetchAssignments() // Refresh the list
      } else {
        alert('Failed to submit homework. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Error submitting homework. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (assignment: Assignment) => {
    if (!assignment.homeworkStatus) return 'text-gray-500'
    if (assignment.homeworkStatus.completed) return 'text-green-600'
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStatusIcon = (assignment: Assignment) => {
    if (!assignment.homeworkStatus) return <Clock size={16} />
    if (assignment.homeworkStatus.completed) return <CheckCircle size={16} />
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return <AlertCircle size={16} />
    return <Clock size={16} />
  }

  const getStatusText = (assignment: Assignment) => {
    if (!assignment.homeworkStatus) return 'Not Started'
    if (assignment.homeworkStatus.completed) return 'Completed'
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return 'Overdue'
    return 'In Progress'
  }

  if (isLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please log in to view your assignments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
        <p className="text-gray-600">Track and submit your homework assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
          <p className="text-gray-600 mb-6">
            You don't have any assignments yet. Ask your tutor to create the demo course and assignments!
          </p>
          <button
            onClick={() => window.location.href = '/personal/tutor'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Go to Tutor Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment List */}
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600">{assignment.course.title}</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(assignment)}`}>
                      {getStatusIcon(assignment)}
                      <span className="text-sm font-medium">{getStatusText(assignment)}</span>
                    </div>
                  </div>

                  {assignment.description && (
                    <p className="text-gray-700 mb-4">{assignment.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {assignment.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Trophy size={14} />
                        <span>Max Score: {assignment.maxScore}</span>
                      </div>
                    </div>

                    {assignment.homeworkStatus?.completed && assignment.homeworkStatus.score && (
                      <div className="text-sm font-medium text-green-600">
                        Score: {assignment.homeworkStatus.score}/{assignment.maxScore}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedAssignment ? 'Submit Assignment' : 'Select Assignment'}
              </h2>
            </div>

            <div className="p-6">
              {selectedAssignment ? (
                <div>
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">{selectedAssignment.title}</h3>
                    {selectedAssignment.description && (
                      <p className="text-gray-700 mb-4">{selectedAssignment.description}</p>
                    )}
                    
                    {selectedAssignment.homeworkStatus?.completed ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="font-medium text-green-800">Assignment Completed</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          Submitted on: {new Date(selectedAssignment.homeworkStatus.submittedAt!).toLocaleString()}
                        </p>
                        {selectedAssignment.homeworkStatus.score && (
                          <p className="text-green-700 text-sm mt-1">
                            Score: {selectedAssignment.homeworkStatus.score}/{selectedAssignment.maxScore}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Submission
                        </label>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Enter your homework submission here..."
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() => {
                              setSelectedAssignment(null)
                              setSubmissionText('')
                            }}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitHomework(selectedAssignment.id)}
                            disabled={!submissionText.trim() || submitting}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={16} />
                            <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Assignment</h3>
                  <p className="text-gray-600">
                    Choose an assignment from the list to view details and submit your work.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Bot */}
      {isAuthenticated && user && (
        <ModularBot
          module="assignments"
          userId={apiUser?.oidcSub || apiUser?.id || 'anonymous'}
          personality={{
            name: 'AssignmentBot',
            avatar: '📚',
            systemPrompt: 'You are an assignment helper. Help students understand their homework, provide study tips, and encourage them to complete assignments on time. Be supportive and motivating.',
            welcomeMessage: '📚 Hi there! I\'m here to help you with your assignments. I can provide study tips, help you understand requirements, and keep you motivated. What do you need help with?',
            reminderMessages: [
              '📝 You have assignments due soon!',
              '⏰ Don\'t forget to submit your homework!',
              '🎯 Stay on track with your studies!'
            ],
            encouragementMessages: [
              '🌟 Great job on completing that assignment!',
              '🚀 You\'re making excellent progress!',
              '💯 Keep up the fantastic work!'
            ]
          }}
          quickActions={[
            {
              id: 'study-tips',
              label: '💡 Study Tips',
              action: () => alert('Study tip: Break large assignments into smaller tasks and tackle them one at a time. Don\'t forget to take regular breaks!')
            },
            {
              id: 'time-management',
              label: '⏰ Time Management',
              action: () => alert('Time management tip: Use the Pomodoro Technique - study for 25 minutes, then take a 5-minute break. Repeat!')
            },
            {
              id: 'assignment-help',
              label: '📖 Assignment Help',
              action: () => alert('Need help with an assignment? Try breaking down the requirements into smaller questions and tackle each one step by step.')
            }
          ]}
          variant="floating"
          position="bottom-right"
        />
      )}
    </div>
  )
}

export default AssignmentsPage