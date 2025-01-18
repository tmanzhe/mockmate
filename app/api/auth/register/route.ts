import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../prisma/db';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'User registered successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'User already exists or invalid data.' },
      { status: 400 }
    );
  }
}