import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    console.log('=== CLEANUP: Removing incorrect enrollments from FUTURE courses ===');
    
    // Find all future courses with enrollments
    const futureCoursesWithEnrollments = await db.course.findMany({
      where: { 
        status: 'FUTURE',
        enrollments: {
          some: {}
        }
      },
      include: {
        enrollments: true,
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    console.log(`Found ${futureCoursesWithEnrollments.length} future courses with enrollments`);

    let totalDeleted = 0;
    const deletionDetails: any[] = [];

    // Delete enrollments for each future course
    for (const course of futureCoursesWithEnrollments) {
      const enrollmentCount = course.enrollments.length;
      
      // Delete all enrollments for this course
      const deleteResult = await db.enrollment.deleteMany({
        where: {
          courseId: course.id,
        },
      });

      totalDeleted += deleteResult.count;
      
      deletionDetails.push({
        courseCode: course.code,
        courseName: course.name,
        program: course.batch.program.name,
        batch: course.batch.name,
        enrollmentsDeleted: deleteResult.count,
      });

      console.log(`Deleted ${deleteResult.count} enrollments from course ${course.code} (${course.name})`);
    }

    console.log(`=== CLEANUP COMPLETE: Total enrollments deleted: ${totalDeleted} ===`);

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      totalCoursesCleaned: futureCoursesWithEnrollments.length,
      totalEnrollmentsDeleted: totalDeleted,
      details: deletionDetails,
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup enrollments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}