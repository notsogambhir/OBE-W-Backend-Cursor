import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PUT /api/students/[studentId]/section - Assign student to a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  return handleSectionUpdate(request, await params);
}

// PATCH /api/students/[studentId]/section - Update student section assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  return handleSectionUpdate(request, await params);
}

// Common handler for both PUT and PATCH
async function handleSectionUpdate(
  request: NextRequest,
  params: { studentId: string }
) {
  const { studentId } = params;
  console.log('=== STUDENT SECTION UPDATE REQUEST START ===');
  console.log('Student ID:', studentId);

  try {
    // Try to get token from Authorization header first, then fallback to cookie
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }

    console.log('Token present:', !!token);

    if (!token) {
      console.log('No token found - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    console.log('User from token:', { id: user?.id, role: user?.role, collegeId: user?.collegeId });

    if (!user) {
      console.log('Invalid token - returning 401');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { sectionId } = await request.json();
    console.log('Requested sectionId:', sectionId);

    if (sectionId === undefined) {
      console.log('Section ID undefined - returning 400');
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    // Fetch student details to verify existence and permissions
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

    // Check permissions - Admin, University, and Department can assign students to sections
    console.log('=== PERMISSION CHECK ===');
    console.log('User role:', user?.role);
    console.log('User college ID:', user?.collegeId);

    // Allow ADMIN and UNIVERSITY users directly
    if (['ADMIN', 'UNIVERSITY'].includes(user?.role)) {
      console.log('✅ Admin/University access granted');
    } else if (user?.role === 'DEPARTMENT') {
      console.log('🔍 Department access - checking college permissions');

      console.log('Student batch program college ID:', student?.batch?.program?.collegeId);
      console.log('User college ID:', user?.collegeId);

      // Check if department user has access to this student's college
      if (student?.batch?.program?.collegeId !== user?.collegeId) {
        console.log('❌ Department access denied - college mismatch');
        return NextResponse.json({ error: 'Access denied - insufficient college permissions' }, { status: 403 });
      }

      console.log('✅ Department access granted - college matches');
    } else {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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

    console.log('Student updated successfully:', updatedStudent);
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('=== STUDENT SECTION UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'No message available');

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}