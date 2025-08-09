// API Response Types for FuturoPal

export interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: Date | null
  maxScore: number
  createdAt: Date
  courseId: string
  course: Course
  homework?: Homework[]
}

export interface Course {
  id: string
  title: string
  description: string
  pricePoints: number
  tutorId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Homework {
  id: string
  assignmentId: string
  userId: string
  completed: boolean
  score: number | null
  submittedAt: Date | null
  content: string | null
  createdAt: Date
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  enrolledAt: Date
  user: User
  course: Course
}

export interface User {
  id: string
  oidcSub: string
  email: string | null
  displayName: string | null
  picture: string | null
  primaryWalletAddress: string | null
  loginType: string
  nftPoints: number
  admin: boolean
  isFirstTime: boolean
  role: string
  createdAt: Date
  lastLogin: Date | null
}

export interface BotState {
  id: string
  userId: string
  module: string
  stateJson: string
  updatedAt: Date
  createdAt: Date
}

export interface AssignmentWithStatus extends Assignment {
  homeworkStatus: {
    completed: boolean
    score: number | null
    submittedAt: Date | null
  } | null
}

export interface EffortScoreData {
  effort: number
  emoji: string
  status: string
  needsReminder: boolean
  lastCalculated?: string
  details?: {
    completionRate: number
    averageQuizScore: number
    streakScore: number
  }
}

export interface StudentAtRisk {
  userId: string
  userName: string
  courseId: string
  courseName: string
  effortScore: number
  status: string
  emoji: string
}

// API Request/Response interfaces
export interface CreateAssignmentRequest {
  courseId: string
  title: string
  description?: string
  dueDate?: string
  maxScore?: number
}

export interface CreateHomeworkRequest {
  assignmentId: string
  userId: string
  content?: string
  completed?: boolean
}

export interface UpdateHomeworkRequest {
  assignmentId: string
  userId: string
  score: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DemoDataResponse {
  success: boolean
  message: string
  data: {
    course: string
    assignments: number
    enrollments: number
  }
}