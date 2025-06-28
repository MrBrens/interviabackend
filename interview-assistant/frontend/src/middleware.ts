import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const pathname = request.nextUrl.pathname
    
    // Define auth pages
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
    
    // Define public routes that don't require authentication
    const isPublicRoute = pathname === '/' || 
                         pathname.startsWith('/_next') ||
                         pathname.startsWith('/api') ||
                         pathname.startsWith('/favicon.ico') ||
                         pathname.startsWith('/public') ||
                         pathname.includes('.')

    // If user is not logged in and trying to access protected route
    if (!token && !isAuthPage && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is logged in and trying to access auth pages
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 