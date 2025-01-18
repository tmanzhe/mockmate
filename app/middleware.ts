import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /landing)
  const path = request.nextUrl.pathname;
  
  // Define authentication routes
  const isAuthRoute = path.startsWith('/auth');
  const isPublicRoute = path === '/' || isAuthRoute;
  
  const token = request.cookies.get('token')?.value;

  // Validate token if it exists
  const isValidToken = token ? validateToken(token) : false;

  // Redirect authenticated users from public routes to landing
  if (isPublicRoute && isValidToken) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !isValidToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

function validateToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// Updated matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};