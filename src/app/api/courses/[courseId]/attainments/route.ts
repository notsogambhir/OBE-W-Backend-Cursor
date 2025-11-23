import { NextRequest, NextResponse } from 'next/server';
import { COAttainmentCalculator } from '@/lib/co-attainment-calculator';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    const body = await request.json();
    const { 
      academicYear,
      force = false 
    } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user and check permissions
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // Only users with course creation permissions can calculate attainments
    if (!canCreateCourse(user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to calculate CO attainments' },
        { status: 403 }
      );
    }

    console.log(`🚀 Starting CO attainment calculation for course ${courseId} by user ${user.name}`);

    // Calculate course attainment using the calculator
    const attainmentResult = await COAttainmentCalculator.calculateCourseAttainment(
      courseId,
      {
        academicYear
      }
    );

    if (!attainmentResult) {
      return NextResponse.json(
        { error: 'Failed to calculate CO attainments - no data found' },
        { status: 404 }
      );
    }

    // Save attainments to database if requested
    if (force) {
      try {
        await COAttainmentCalculator.saveAttainments(
          courseId,
          attainmentResult.studentAttainments,
          academicYear
        );
        console.log(`💾 Saved ${attainmentResult.studentAttainments.length} attainments to database`);
      } catch (saveError) {
        console.error('❌ Error saving attainments:', saveError);
        // Continue even if save fails
      }
    }

    // Format response for frontend
    const response = {
      courseId: attainmentResult.courseId,
      courseName: attainmentResult.courseName,
      courseCode: attainmentResult.courseCode,
      calculatedAt: attainmentResult.calculatedAt,
      settings: {
        coTarget: attainmentResult.targetPercentage,
        level1Threshold: attainmentResult.level1Threshold,
        level2Threshold: attainmentResult.level2Threshold,
        level3Threshold: attainmentResult.level3Threshold,
      },
      summary: {
        totalCOs: attainmentResult.coAttainments.length,
        totalStudents: attainmentResult.totalStudents,
        averageAttainment: attainmentResult.coAttainments.length > 0 
          ? attainmentResult.coAttainments.reduce((sum, co) => sum + co.percentageMeetingTarget, 0) / attainmentResult.coAttainments.length
          : 0,
        levelDistribution: {
          level0: attainmentResult.coAttainments.filter(co => co.attainmentLevel === 0).length,
          level1: attainmentResult.coAttainments.filter(co => co.attainmentLevel === 1).length,
          level2: attainmentResult.coAttainments.filter(co => co.attainmentLevel === 2).length,
          level3: attainmentResult.coAttainments.filter(co => co.attainmentLevel === 3).length,
        }
      },
      coAttainments: attainmentResult.coAttainments.map(co => ({
        coId: co.coId,
        coCode: co.coCode,
        coDescription: co.coDescription,
        targetPercentage: co.targetPercentage,
        attainedPercentage: co.percentageMeetingTarget,
        studentsAttained: co.studentsMeetingTarget,
        totalStudents: co.totalStudents,
        attainmentLevel: co.attainmentLevel,
        thresholds: {
          level1: co.level1Threshold,
          level2: co.level2Threshold,
          level3: co.level3Threshold,
        }
      })),
      studentAttainments: attainmentResult.studentAttainments.map(student => ({
        studentId: student.studentId,
        studentName: student.studentName,
        coId: student.coId,
        coCode: student.coCode,
        percentage: student.percentage,
        metTarget: student.metTarget,
        totalObtainedMarks: student.totalObtainedMarks,
        totalMaxMarks: student.totalMaxMarks,
        attemptedQuestions: student.attemptedQuestions,
        totalQuestions: student.totalQuestions
      }))
    };

    console.log(`✅ CO attainment calculation completed for course ${courseId}`);
    console.log(`📊 Summary: ${response.summary.totalCOs} COs, ${response.summary.totalStudents} students, avg attainment: ${response.summary.averageAttainment.toFixed(1)}%`);

    return NextResponse.json({
      message: 'CO attainments calculated successfully',
      data: response
    });

  } catch (error) {
    console.error('❌ Error calculating CO attainments:', error);
    return NextResponse.json(
      { error: 'Failed to calculate CO attainments' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    const { searchParams } = new URL(request.url);
    
    const academicYear = searchParams.get('academicYear') || undefined;
    const coId = searchParams.get('coId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    let result;

    if (coId && studentId) {
      // Get specific student CO attainment
      result = await COAttainmentCalculator.calculateStudentCOAttainment(
        courseId,
        coId,
        studentId
      );
    } else if (coId) {
      // Get class CO attainment for specific CO
      result = await COAttainmentCalculator.calculateClassCOAttainment(
        courseId,
        coId,
        { academicYear }
      );
    } else {
      // Get full course attainment
      result = await COAttainmentCalculator.calculateCourseAttainment(
        courseId,
        { academicYear }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'No attainment data found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching CO attainments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CO attainment data' },
      { status: 500 }
    );
  }
}