import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma/db'; // Adjust the path if needed
import bcrypt from 'bcrypt';
import { setCookie } from 'cookies-next'; // Install `cookies-next`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate a token (e.g., JWT or custom token)
    const token = user.id; // Replace with your token generation logic

    // Set the token in a cookie
    setCookie('auth_token', token, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
