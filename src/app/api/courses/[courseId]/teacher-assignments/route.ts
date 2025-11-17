import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/courses/[courseId]/teacher-assignments - Get teacher assignments for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check permissions - Admin, University, and Program Coordinator can view teacher assignments
    if (!['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the course to verify permissions
    const course = await db.course.findUnique({
      where: { id: courseId },
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

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // For Program Coordinator role, check if they have access to this course
    if (user.role === 'PROGRAM_COORDINATOR') {
      if (course.batch.programId !== user.programId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get all teacher assignments for this course
    const assignments = await db.teacherAssignment.findMany({
      where: {
        courseId,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        section: {
          include: {
            batch: {
              include: {
                program: true
              }
            }
          }
        }
      },
      orderBy: [
        { section: { name: 'asc' } },
        { teacher: { name: 'asc' } }
      ]
    });

    // Get available teachers for assignment
    const availableTeachers = await db.user.findMany({
      where: {
        role: 'TEACHER',
        isActive: true,
        ...(user.collegeId && { collegeId: user.collegeId }) // Filter by college for Department role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get all sections for this course
    const sections = await db.section.findMany({
      where: {
        batchId: course.batchId,
        isActive: true
      },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Find course-level default teacher
    const courseLevelAssignment = assignments.find(a => a.sectionId === null);

    return NextResponse.json({
      course,
      assignments,
      courseLevelAssignment,
      availableTeachers,
      sections
    });
  } catch (error) {
    console.error('Teacher assignments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/teacher-assignments - Save teacher assignments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { mode, courseLevelTeacherId, sectionAssignments } = await request.json();

    if (!mode || !['single', 'section'].includes(mode)) {
      return NextResponse.json({ error: 'Valid mode is required (single or section)' }, { status: 400 });
    }

    const { courseId } = await params;

    // Check permissions - Admin, University, and Program Coordinator can assign teachers
    if (!['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the course to verify permissions
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

    // For Program Coordinator role, check if they have access to this course
    if (user.role === 'PROGRAM_COORDINATOR') {
      if (course.batch.programId !== user.programId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Use a transaction to ensure atomic updates
    await db.$transaction(async (tx) => {
      // Delete all existing assignments for this course
      await tx.teacherAssignment.deleteMany({
        where: { courseId }
      });

      if (mode === 'single' && courseLevelTeacherId) {
        // Create course-level assignment
        await tx.teacherAssignment.create({
          data: {
            courseId,
            teacherId: courseLevelTeacherId,
            sectionId: null // Course-level assignment
          }
        });
      } else if (mode === 'section' && sectionAssignments) {
        // Create section-level assignments
        for (const assignment of sectionAssignments) {
          if (assignment.teacherId) { // Only create if teacher is selected (not "Use Course Default")
            await tx.teacherAssignment.create({
              data: {
                courseId,
                sectionId: assignment.sectionId,
                teacherId: assignment.teacherId
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Teacher assignments saved successfully',
      mode
    });
  } catch (error) {
    console.error('Teacher assignments POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}