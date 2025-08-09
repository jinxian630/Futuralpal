import { NextRequest, NextResponse } from 'next/server'
import { getStudentsAtRisk } from '@/lib/effort-calculator'

// GET /api/tutor/students-at-risk - Get list of students who need attention
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId') // Optional: filter by tutor's courses

    const studentsAtRisk = await getStudentsAtRisk(tutorId || undefined)

    return NextResponse.json(studentsAtRisk)
  } catch (error) {
    console.error('Error fetching students at risk:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}