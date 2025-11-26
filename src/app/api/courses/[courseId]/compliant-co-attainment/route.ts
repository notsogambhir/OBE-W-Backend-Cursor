import { NextRequest, NextResponse } from 'next/server';
import { CompliantCOAttainmentCalculator } from '@/lib/compliant-co-attainment-calculator';
import { getUserFromRequest } from '@/lib/server-auth';
import { canCreateCourse } from '@/lib/permissions';

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
    const sectionId = searchParams.get('sectionId') || undefined;

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

    if (!canCreateCourse(user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view CO attainment' },
        { status: 403 }
      );
    }

    let result;
    if (coId && sectionId) {
      // Calculate attainment for specific CO and section
      result = await CompliantCOAttainmentCalculator.calculateSectionCOAttainment(
        courseId,
        coId,
        sectionId
      );
    } else if (coId) {
      // Calculate attainment for specific CO (course-level)
      result = await CompliantCOAttainmentCalculator.calculateCourseCOAttainment(
        courseId,
        coId
      );
    } else {
      // Calculate attainment for all COs in course
      result = await CompliantCOAttainmentCalculator.calculateComprehensiveCOAttainment(
        courseId
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching compliant CO attainment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CO attainment data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    const body = await request.json();
    const { academicYear } = body;

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

    if (!canCreateCourse(user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to calculate CO attainment' },
        { status: 403 }
      );
    }

    // Batch save CO attainments for all students
    await CompliantCOAttainmentCalculator.batchSaveCOAttainments(
      courseId,
      academicYear
    );

    // Return updated attainment results
    const result = await CompliantCOAttainmentCalculator.calculateComprehensiveCOAttainment(
      courseId
    );

    return NextResponse.json({
      message: 'CO attainment calculated and saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error calculating CO attainment:', error);
    return NextResponse.json(
      { error: 'Failed to calculate CO attainment' },
      { status: 500 }
    );
  }
}