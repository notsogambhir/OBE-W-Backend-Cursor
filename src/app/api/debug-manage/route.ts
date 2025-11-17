import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Test endpoint to debug manage page issues
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

    // Test course access with user context
    const courseId = 'cmi2o274l000xpp8xy5t6f2np'; // The course from error
    
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        batch: {
          include: {
            program: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check user permissions
    let hasAccess = false;
    let accessReason = '';

    if (user.role === 'ADMIN' || user.role === 'UNIVERSITY') {
      hasAccess = true;
      accessReason = 'Admin/University access';
    } else if (user.role === 'PROGRAM_COORDINATOR' && course.batch.programId === user.programId) {
      hasAccess = true;
      accessReason = 'Program Coordinator access';
    } else if (user.role === 'DEPARTMENT' && course.batch.program.collegeId === user.collegeId) {
      hasAccess = true;
      accessReason = 'Department access';
    } else if (user.role === 'TEACHER') {
      hasAccess = true;
      accessReason = 'Teacher access';
    }

    return NextResponse.json({
      message: 'Debug info for manage page',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        programId: user.programId,
        batchId: user.batchId
      },
      course: {
        id: course.id,
        name: course.name,
        code: course.code,
        status: course.status
      },
      hasAccess,
      accessReason,
      debug: {
        userBatchId: user.batchId,
        courseBatchId: course.batch.id,
        courseProgramId: course.batch.programId,
        userProgramId: user.programId
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}