// 2. Update your /api/auth/me/route.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/prisma/db';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }

      return NextResponse.json({ userId: user.id }, { status: 200 });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}