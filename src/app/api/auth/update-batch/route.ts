import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { batchId } = await request.json();

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating batch for user:', {
      userId: user.id,
      currentBatchId: user.batchId,
      newBatchId: batchId
    });

    // Validate that the batch exists
    const batch = await db.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      console.error('Batch not found:', batchId);
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Update user's batch and clear related fields
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { 
        batchId,
        // Clear section when changing batch to maintain data integrity
        sectionId: null,
        // Update programId to match the new batch's program
        programId: batch.programId
      }
    });

    console.log('Successfully updated user batch:', {
      userId: user.id,
      oldBatchId: user.batchId,
      newBatchId: batchId,
      updatedProgramId: batch.programId
    });
    
    return NextResponse.json({ 
      success: true, 
      batchId,
      programId: batch.programId,
      message: 'Batch updated successfully'
    });
  } catch (error) {
    console.error('Error updating batch:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}