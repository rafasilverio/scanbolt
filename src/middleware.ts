import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to auth pages when not authenticated
    if (path.startsWith('/auth/')) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow auth pages without token
        if (path.startsWith('/auth/')) {
          return true;
        }
        // Require token for other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/contracts/:path*',
    '/api/protected/:path*',
  ],
};
