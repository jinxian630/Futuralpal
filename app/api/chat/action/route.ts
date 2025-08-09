import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { 
  createRoomInDb, 
  findStudyGroups, 
  callAiForTips, 
  getCoursesUnderPoints, 
  getPopularCourses, 
  getAssignmentsForUser, 
  getProgressForUser, 
  getAtRiskStudents, 
  createAssignment 
} from '@/lib/actions'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, payload } = body

  // Basic authentication - in production, implement proper auth
  // const user = await getUserFromReq(req)
  // For now, using a mock user ID
  const mockUserId = 'user_123'
  const mockUserPoints = 100

  try {
    switch (action) {
      case 'create_room': {
        const room = await createRoomInDb(mockUserId, payload)
        return NextResponse.json({ 
          ok: true, 
          type: 'redirect', 
          url: `/personal/digital-room?roomId=${room.id}` 
        })
      }
      
      case 'find_study_group': {
        const groups = await findStudyGroups(mockUserId, payload)
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: groups 
        })
      }
      
      case 'collab_tips': {
        const text = await callAiForTips('collab_tips', {})
        return NextResponse.json({ 
          ok: true, 
          type: 'message', 
          text 
        })
      }
      
      case 'market_courses_under_points': {
        const courses = await getCoursesUnderPoints(mockUserId, mockUserPoints)
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: courses 
        })
      }
      
      case 'market_popular': {
        const courses = await getPopularCourses()
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: courses 
        })
      }
      
      case 'earn_points': {
        const tips = await callAiForTips('earn_points', {})
        return NextResponse.json({ 
          ok: true, 
          type: 'message', 
          text: tips 
        })
      }
      
      case 'view_assignments': {
        const assignments = await getAssignmentsForUser(mockUserId)
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: assignments 
        })
      }
      
      case 'check_progress': {
        const progress = await getProgressForUser(mockUserId)
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: progress 
        })
      }
      
      case 'study_tips': {
        const msg = await callAiForTips('study_tips', {})
        const messageWithReminder = `${msg}\n\n<system-reminder>Remember to take breaks every 25 minutes using the Pomodoro technique for optimal learning retention!</system-reminder>`
        return NextResponse.json({ 
          ok: true, 
          type: 'message', 
          text: messageWithReminder 
        })
      }
      
      case 'view_at_risk': {
        const list = await getAtRiskStudents(mockUserId)
        return NextResponse.json({ 
          ok: true, 
          type: 'object', 
          data: list 
        })
      }
      
      case 'create_assignment': {
        const assignment = await createAssignment({
          courseId: payload?.courseId || 'default_course',
          title: payload?.title || 'Quick Assignment',
          description: payload?.description || 'Created via chat widget'
        })
        return NextResponse.json({ 
          ok: true, 
          type: 'message', 
          text: `Assignment created: ${assignment.title}` 
        })
      }
      
      case 'teaching_tips': {
        const tips = await callAiForTips('teaching_tips', {})
        return NextResponse.json({ 
          ok: true, 
          type: 'message', 
          text: tips 
        })
      }
      
      default:
        return NextResponse.json({ 
          ok: false, 
          error: 'Unknown action' 
        }, { status: 400 })
    }
  } catch (err) {
    console.error('Chat action error:', err)
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}