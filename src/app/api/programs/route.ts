import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    const whereClause = collegeId ? { collegeId } : {};

    const programs = await db.program.findMany({
      where: { 
        ...whereClause,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        code: true,
        duration: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}