import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['ADMIN', 'UNIVERSITY'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin or University access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { name, code, description, isActive } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if another department with same name or code exists
    const duplicateDepartment = await db.department.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: name },
              { code: code }
            ]
          }
        ]
      }
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        { error: 'Department with this name or code already exists' },
        { status: 409 }
      );
    }

    const department = await db.department.update({
      where: { id },
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingDepartment.isActive
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            programs: true,
            users: true
          }
        }
      }
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['ADMIN', 'UNIVERSITY'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin or University access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            programs: true,
            users: true
          }
        }
      }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if department has associated data
    if (
      existingDepartment._count.programs > 0 ||
      existingDepartment._count.users > 0
    ) {
      return NextResponse.json(
        { error: 'Cannot delete department with associated programs or users' },
        { status: 400 }
      );
    }

    await db.department.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Department deleted successfully',
      deletedDepartment: {
        name: existingDepartment.name,
        code: existingDepartment.code
      }
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}