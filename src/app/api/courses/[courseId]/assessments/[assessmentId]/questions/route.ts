import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string, assessmentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { courseId, assessmentId } = resolvedParams;

    if (!courseId || !assessmentId) {
      return NextResponse.json(
        { error: 'Course ID and Assessment ID are required' },
        { status: 400 }
      );
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view questions' },
        { status: 403 }
      );
    }

    // Fetch questions with CO details
    const questions = await db.question.findMany({
      where: {
        assessmentId,
        isActive: true
      },
      include: {
        coMappings: {
          include: {
            co: {
              select: {
                id: true,
                code: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string, assessmentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { courseId, assessmentId } = resolvedParams;
    const body = await request.json();
    const { question, maxMarks, coIds } = body;

    if (!courseId || !assessmentId || !question || !maxMarks || !coIds || !Array.isArray(coIds) || coIds.length === 0) {
      return NextResponse.json(
        { error: 'All fields are required: question, maxMarks, coIds (array)' },
        { status: 400 }
      );
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!canCreateCourse(user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create questions' },
        { status: 403 }
      );
    }

    // Validate assessment exists and belongs to course
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        courseId,
        isActive: true
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Validate COs exist and belong to course
    const cos = await db.cO.findMany({
      where: {
        id: { in: coIds },
        courseId,
        isActive: true
      }
    });

    if (cos.length !== coIds.length) {
      return NextResponse.json(
        { error: 'One or more Course Outcomes not found' },
        { status: 404 }
      );
    }

    // Create question with CO mappings
    const newQuestion = await db.question.create({
      data: {
        assessmentId,
        question: question.trim(),
        maxMarks: parseInt(maxMarks),
        isActive: true,
        coMappings: {
          create: coIds.map((coId: string) => ({
            coId,
            isActive: true
          }))
        }
      },
      include: {
        coMappings: {
          include: {
            co: {
              select: {
                id: true,
                code: true,
                description: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}