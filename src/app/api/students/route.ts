import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { studentSchema } from '@/lib/validations/student';

// GET /api/students - Get all students for the current program/batch
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const batchId = searchParams.get('batchId');
    const collegeId = searchParams.get('collegeId');

    // Build where clause based on user role and provided parameters
    let whereClause: any = { 
      role: 'STUDENT',
      isActive: true  // Only show active students
    };
    
    if (user.role === 'DEPARTMENT' || user.role === 'PROGRAM_COORDINATOR') {
      // Department users can only see students from their programs
      if (programId) {
        whereClause.programId = programId;
      } else if (user.programId) {
        whereClause.programId = user.programId;
      }
      
      if (batchId) {
        whereClause.batchId = batchId;
      } else if (user.batchId) {
        whereClause.batchId = user.batchId;
      }

      // If collegeId is provided, filter by programs under that college
      if (collegeId && !programId) {
        // Find all programs under this college
        const programs = await db.program.findMany({
          where: { collegeId },
          select: { id: true }
        });
        const programIds = programs.map(p => p.id);
        if (programIds.length > 0) {
          whereClause.programId = { in: programIds };
        }
      }
    }

    // Handle other roles (ADMIN, SUPER_ADMIN, etc.)
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      if (collegeId && !programId) {
        // Find all programs under this college
        const programs = await db.program.findMany({
          where: { collegeId },
          select: { id: true }
        });
        const programIds = programs.map(p => p.id);
        if (programIds.length > 0) {
          whereClause.programId = { in: programIds };
        }
      }

      // If specific program or batch is requested, use it
      if (programId) {
        whereClause.programId = programId;
      }
      if (batchId) {
        whereClause.batchId = batchId;
      }
    }

    const students = await db.user.findMany({
      where: whereClause,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            startYear: true,
            endYear: true,
            program: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Only department, program coordinator, and admin roles can create students
    if (!['DEPARTMENT', 'PROGRAM_COORDINATOR', 'ADMIN', 'UNIVERSITY'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = studentSchema.parse(body);

    // Check if student ID already exists
    const existingStudent = await db.user.findUnique({
      where: { studentId: validatedData.studentId },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 409 }
      );
    }

    // Set college, program, and batch based on user context if not provided
    if (!validatedData.collegeId && user.collegeId) {
      validatedData.collegeId = user.collegeId;
    }
    if (!validatedData.programId && user.programId) {
      validatedData.programId = user.programId;
    }
    if (!validatedData.batchId && user.batchId) {
      validatedData.batchId = user.batchId;
    }

    // Validate that collegeId, programId, and batchId are provided and valid
    if (!validatedData.collegeId || validatedData.collegeId.trim() === '') {
      return NextResponse.json(
        { error: 'College ID is required. Please select a college.' },
        { status: 400 }
      );
    }

    if (!validatedData.programId || validatedData.programId.trim() === '') {
      return NextResponse.json(
        { error: 'Program ID is required. Please ensure you are assigned to a program.' },
        { status: 400 }
      );
    }

    if (!validatedData.batchId || validatedData.batchId.trim() === '') {
      return NextResponse.json(
        { error: 'Batch ID is required. Please ensure you are assigned to a batch.' },
        { status: 400 }
      );
    }

    // Verify that the program exists
    const program = await db.program.findUnique({
      where: { id: validatedData.programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }

    // Verify that the batch exists
    const batch = await db.batch.findUnique({
      where: { id: validatedData.batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    const student = await db.user.create({
      data: {
        ...validatedData,
        role: 'STUDENT'
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            startYear: true,
            endYear: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}