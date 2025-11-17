import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PUT /api/students/[studentId]/section - Assign student to a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.studentId;

    // Try to get token from Authorization header first, then fallback to cookie
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }
  
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { sectionId } = await request.json();

    if (sectionId === undefined) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    // Check permissions - Admin, University, and Department can assign students to sections
    if (!['ADMIN', 'UNIVERSITY', 'DEPARTMENT'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the student to verify they exist and get their batch info
    const student = await db.user.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            program: {
              include: {
                college: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can be assigned to sections' }, { status: 400 });
    }

    // For Department role, check if they have access to this batch
    if (user.role === 'DEPARTMENT') {
      if (student.batch.program.collegeId !== user.collegeId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // If sectionId is not null, verify the section exists and is in the same batch
    if (sectionId !== null) {
      const section = await db.section.findUnique({
        where: { id: sectionId },
        include: {
          batch: true
        }
      });

      if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      if (section.batchId !== student.batchId) {
        return NextResponse.json({ 
          error: 'Section must be in the same batch as the student' 
        }, { status: 400 });
      }
    }

    // Update the student's section assignment
    const updatedStudent = await db.user.update({
      where: { id: studentId },
      data: { sectionId },
      include: {
        section: true,
        batch: {
          include: {
            program: true
          }
        }
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Student section assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}