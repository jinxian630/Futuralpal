import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // The pages router dashboard will automatically take precedence over app router
  // No redirect needed - just let Next.js handle routing
  console.log('🛡️ Middleware checking route:', request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/personal/dashboard',
  ]
}