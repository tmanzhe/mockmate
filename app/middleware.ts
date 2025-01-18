import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname);
  
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/auth');
  const isPublicRoute = path === '/' || isAuthRoute;
  
  const token = request.cookies.get('token')?.value;
  console.log('Token present:', !!token);

  // Validate token if it exists
  const isValidToken = token ? validateToken(token) : false;
  console.log('Token valid:', isValidToken);

  if (isPublicRoute && isValidToken) {
    console.log('Redirecting authenticated user to landing page');
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  if (!isPublicRoute && !isValidToken) {
    console.log('Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  console.log('Proceeding with request');
  return NextResponse.next();
}

function validateToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

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