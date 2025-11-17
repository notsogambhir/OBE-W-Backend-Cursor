import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, canCreateCourse } from '@/lib/server-auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const batchId = searchParams.get('batchId');
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    let courses = [];
    
    if (batchId) {
      // If batchId is provided, get courses from that batch
      if (user.role === 'PROGRAM_COORDINATOR') {
        const batch = await db.batch.findUnique({
          where: { id: batchId },
          select: { programId: true }
        });
        
        if (!batch || batch.programId !== user.programId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
      
      courses = await db.course.findMany({
        where: { batchId: batchId },
        include: {
          batch: {
            select: { name: true, startYear: true, endYear: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      
      console.log(`Found ${courses.length} courses for batchId ${batchId}`);
      
    } else if (collegeId) {
      // If collegeId is provided, get courses from that college
      courses = await db.course.findMany({
        where: {
          batch: {
            program: {
              collegeId: collegeId
            }
          }
        },
        include: {
          batch: {
            select: { name: true, startYear: true, endYear: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      
      console.log(`Found ${courses.length} courses for collegeId ${collegeId}`);
      
    } else {
      // If no batchId, return courses based on user role
      switch (user.role) {
        case 'ADMIN':
        case 'UNIVERSITY':
          // Admin and University users can see all courses
          courses = await db.course.findMany({
            include: {
              batch: {
                select: { name: true, startYear: true, endYear: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          break;
          
        case 'DEPARTMENT':
          // Department users can see courses from their college
          courses = await db.course.findMany({
            where: {
              batch: {
                program: {
                  collegeId: user.collegeId || ''
                }
              }
            },
            include: {
              batch: {
                select: { name: true, startYear: true, endYear: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          break;
          
        case 'PROGRAM_COORDINATOR':
          // Program coordinators can see courses from their assigned programs
          courses = await db.course.findMany({
            where: {
              batch: {
                program: {
                  id: user.programId || ''
                }
              }
            },
            include: {
              batch: {
                select: { name: true, startYear: true, endYear: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          break;
          
        case 'TEACHER':
          // Teachers can see courses from their batches
          courses = await db.course.findMany({
            where: {
              batchId: user.batchId || ''
            },
            include: {
              batch: {
                select: { name: true, startYear: true, endYear: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          break;
          
        default:
          // For other roles, return limited courses
          courses = await db.course.findMany({
            where: {
              batchId: user.batchId || ''
            },
            include: {
              batch: {
                select: { name: true, startYear: true, endYear: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
          });
          break;
      }
      
      console.log(`Returning ${courses.length} courses`);
    }
    
    return NextResponse.json(courses);
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/courses called');
    
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    if (!canCreateCourse(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const body = await request.json();
    const { courses, programId, batchId } = body;
    
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: 'No courses provided' }, { status: 400 });
    }
    
    const results = [];
    
    for (const courseData of courses) {
      try {
        const course = await db.course.create({
          data: {
            code: courseData.code.toUpperCase(),
            name: courseData.name.trim(),
            batchId: batchId,
            description: courseData.description || null,
            status: 'FUTURE'
          }
        });
        
        results.push({ success: true, course });
      } catch (error: any) {
        console.error('Error creating course:', error);
        results.push({ success: false, course: courseData, error: error.message });
      }
    }
    
    return NextResponse.json({
      message: `Created ${results.filter(r => r.success).length} courses, ${results.filter(r => !r.success).length} failed`,
      results
    });
    
  } catch (error) {
    console.error('Error in POST /api/courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}