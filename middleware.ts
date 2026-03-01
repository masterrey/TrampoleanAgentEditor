import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

/**
 * Middleware to protect app routes
 * Redirects unauthenticated users to /login
 */
export const middleware = withAuth(
  function middleware(request: NextRequest) {
    // This function won't be executed if token is invalid
    // withAuth handles the redirect to login automatically
    return undefined
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access only if token exists
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

/**
 * Apply middleware to these routes
 */
export const config = {
  matcher: [
    // Protect app routes
    '/app/:path*',
    '/dashboard/:path*',
    '/editor/:path*',
    // Protect API routes
    '/api/projects/:path*',
    '/api/documents/:path*',
  ],
}
