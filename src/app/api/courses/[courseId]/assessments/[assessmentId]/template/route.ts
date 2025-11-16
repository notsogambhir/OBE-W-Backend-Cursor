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
        { error: 'Insufficient permissions to download template' },
        { status: 403 }
      );
    }

    // Validate assessment exists and belongs to course
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        courseId,
        isActive: true
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
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
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get enrolled students
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true
          }
        }
      },
      orderBy: {
        student: {
          name: 'asc'
        }
      }
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: 'No students enrolled in this course' },
        { status: 404 }
      );
    }

    // Generate template data
    const templateData = {
      assessment: {
        id: assessment.id,
        name: assessment.name,
        type: assessment.type,
        maxMarks: assessment.maxMarks,
        weightage: assessment.weightage
      },
      questions: assessment.questions.map(q => ({
        id: q.id,
        question: q.question,
        maxMarks: q.maxMarks,
        coMappings: q.coMappings
      })),
      students: enrollments.map(e => ({
        id: e.student.id,
        name: e.student.name,
        studentId: e.student.studentId,
        email: e.student.email
      })),
      template: {
        headers: ['Student ID', 'Student Name', 'Email', ...assessment.questions.map((q, index) => `Q${index + 1} (${q.maxMarks} marks)`)],
        sampleRow: [
          'STU0001',
          'John Doe',
          'john.doe@example.com',
          ...assessment.questions.map(() => '0') // Default 0 marks
        ]
      }
    };

    return NextResponse.json(templateData);
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}