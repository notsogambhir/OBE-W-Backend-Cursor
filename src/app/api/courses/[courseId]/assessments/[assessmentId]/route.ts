import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; assessmentId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR', 'TEACHER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin, University, Program Coordinator, or Teacher access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { courseId, assessmentId } = resolvedParams;
    const { name, type, maxMarks, weightage, isActive } = await request.json();

    if (!name || !type || !maxMarks || !weightage) {
      return NextResponse.json(
        { error: 'Name, type, max marks, and weightage are required' },
        { status: 400 }
      );
    }

    // Check if assessment exists and get course info
    const existingAssessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        course: {
          include: {
            batch: {
              include: {
                program: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    if (!existingAssessment || existingAssessment.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Assessment not found in this course' },
        { status: 404 }
      );
    }

    // Check if user has permission for this course
    if (user.role === 'PROGRAM_COORDINATOR' && existingAssessment.course.batch.programId !== user.programId) {
      return NextResponse.json(
        { error: 'You can only update assessments from courses in your assigned program' },
        { status: 403 }
      );
    }

    // Validate assessment type
    const validTypes = ['exam', 'quiz', 'assignment', 'project'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid assessment type. Must be: exam, quiz, assignment, or project' },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (maxMarks <= 0 || weightage <= 0 || weightage > 100) {
      return NextResponse.json(
        { error: 'Max marks must be positive and weightage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const assessment = await db.assessment.update({
      where: { id: assessmentId },
      data: {
        name: name.trim(),
        type: type,
        maxMarks: parseInt(maxMarks),
        weightage: parseFloat(weightage),
        isActive: isActive !== undefined ? isActive : existingAssessment.isActive
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; assessmentId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR', 'TEACHER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin, University, Program Coordinator, or Teacher access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { courseId, assessmentId } = resolvedParams;

    // Check if assessment exists and get course info
    const existingAssessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        course: {
          include: {
            batch: {
              include: {
                program: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    if (!existingAssessment || existingAssessment.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Assessment not found in this course' },
        { status: 404 }
      );
    }

    // Check if user has permission for this course
    if (user.role === 'PROGRAM_COORDINATOR' && existingAssessment.course.batch.programId !== user.programId) {
      return NextResponse.json(
        { error: 'You can only delete assessments from courses in your assigned program' },
        { status: 403 }
      );
    }

    // Check if assessment has questions
    if (existingAssessment._count.questions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete assessment with associated questions. Delete questions first.' },
        { status: 400 }
      );
    }

    await db.assessment.delete({
      where: { id: assessmentId }
    });

    return NextResponse.json({ 
      message: 'Assessment deleted successfully',
      deletedAssessment: {
        name: existingAssessment.name,
        type: existingAssessment.type,
        maxMarks: existingAssessment.maxMarks,
        weightage: existingAssessment.weightage
      }
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}