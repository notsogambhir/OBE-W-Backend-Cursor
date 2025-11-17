import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Test endpoint to verify course access
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Test course access
    const courseId = 'cmi2o274l000xpp8xy5t6f2np'; // The course from the error
    
    // Test course access with simpler query
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: true
          }
        },
        courseOutcomes: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        },
        assessments: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        },
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: { id: true, name: true, email: true, studentId: true }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Course access test successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      course: {
        id: course.id,
        name: course.name,
        code: course.code,
        status: course.status,
        hasData: {
          courseOutcomes: course.courseOutcomes.length,
          assessments: course.assessments.length,
          enrollments: course.enrollments.length
        }
      }
    });
    
  } catch (error) {
    console.error('Course access test error:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}