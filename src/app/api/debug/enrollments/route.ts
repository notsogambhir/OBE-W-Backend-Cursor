import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check future courses and their enrollment counts
    const futureCourses = await db.course.findMany({
      where: { status: 'FUTURE' },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Check active courses and their enrollment counts
    const activeCourses = await db.course.findMany({
      where: { status: 'ACTIVE' },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      futureCourses: futureCourses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        status: course.status,
        enrollmentCount: course._count.enrollments,
        program: course.batch.program.name,
        batch: course.batch.name,
      })),
      activeCourses: activeCourses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        status: course.status,
        enrollmentCount: course._count.enrollments,
        program: course.batch.program.name,
        batch: course.batch.name,
      })),
    });
  } catch (error) {
    console.error('Error checking enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}