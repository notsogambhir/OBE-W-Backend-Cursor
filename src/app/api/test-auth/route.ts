import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Simple test endpoint to verify auth is working
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Test simple database query
    const userCount = await db.user.count();
    
    return NextResponse.json({ 
      message: 'Auth working',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      totalUsers: userCount
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}