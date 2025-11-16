import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // Fetch assessments for the course
    const assessments = await db.assessment.findMany({
      where: {
        courseId: courseId,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only admin, university, department, and program coordinator roles can manage assessments.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, maxMarks, weightage } = body;

    if (!name || !type || !maxMarks || !weightage) {
      return NextResponse.json({ error: 'All assessment fields are required' }, { status: 400 });
    }

    if (!['exam', 'quiz', 'assignment', 'project'].includes(type)) {
      return NextResponse.json({ error: 'Invalid assessment type' }, { status: 400 });
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

    // Check permissions for program coordinators
    if (user.role === 'PROGRAM_COORDINATOR' && course.batch.programId !== user.programId) {
      return NextResponse.json({ 
        error: 'You can only manage assessments for courses in your assigned program' 
      }, { status: 403 });
    }

    // Create new assessment
    const newAssessment = await db.assessment.create({
      data: {
        courseId: courseId,
        name: name.trim(),
        type,
        maxMarks: parseInt(maxMarks),
        weightage: parseFloat(weightage),
        isActive: true
      }
    });

    console.log(`Created assessment ${name} for course ${courseId}`);

    return NextResponse.json(newAssessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}