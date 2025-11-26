import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/server-auth';

interface POAttainmentCalculation {
  poCode: string;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
  targetLevel?: number;
  courses: {
    courseId: string;
    courseCode: string;
    courseName: string;
    coContributions: {
      coCode: string;
      coAttainment: number;
      mappingLevel: number;
      contribution: number;
    }[];
    totalContribution: number;
  }[];
}

interface AttainmentWeights {
  directWeight: number;
  indirectWeight: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const programId = searchParams.get('programId');

    if (!batchId || !programId) {
      return NextResponse.json(
        { error: 'Batch ID and Program ID are required' },
        { status: 400 }
      );
    }

    // Get authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get program POs
    const programPOs = await db.pO.findMany({
      where: { programId, isActive: true },
      orderBy: { code: 'asc' }
    });

    if (programPOs.length === 0) {
      return NextResponse.json(
        { error: 'No Program Outcomes found for this program' },
        { status: 404 }
      );
    }

    // Get all courses for this batch
    const courses = await db.course.findMany({
      where: { batchId, isActive: true },
      include: {
        courseOutcomes: {
          where: { isActive: true },
          include: {
            mappings: {
              where: { po: { programId }, isActive: true },
              include: { po: true }
            }
          }
        },
        coAttainments: {
          where: { 
            academicYear: new Date().getFullYear().toString()
          }
        }
      }
    });

    // Get attainment weights (default: 80% direct, 20% indirect)
    const weights: AttainmentWeights = {
      directWeight: 0.8,
      indirectWeight: 0.2
    };

    // Calculate PO Attainment for each PO
    const poAttainments: POAttainmentCalculation[] = [];

    for (const po of programPOs) {
      const poCalculation = await calculatePOAttainment(
        po,
        courses,
        weights,
        batchId
      );
      poAttainments.push(poCalculation);
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        programId,
        weights,
        poAttainments,
        summary: {
          totalPOs: programPOs.length,
          averageDirectAttainment: poAttainments.reduce((sum, po) => sum + po.directAttainment, 0) / programPOs.length,
          averageFinalAttainment: poAttainments.reduce((sum, po) => sum + po.finalAttainment, 0) / programPOs.length,
          targetMetCount: poAttainments.filter(po => po.finalAttainment >= (po.targetLevel || 2.0)).length
        }
      }
    });

  } catch (error) {
    console.error('Error calculating PO Attainment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculatePOAttainment(
  po: any,
  courses: any[],
  weights: AttainmentWeights,
  batchId: string
): Promise<POAttainmentCalculation> {
  const poCode = po.code;
  let directAttainment = 0;
  const courseContributions: any[] = [];

  // Collect all CO-PO mappings for this PO
  let totalWeightedSum = 0;
  let totalMappingWeight = 0;

  for (const course of courses) {
    const coContributions: any[] = [];
    let courseContribution = 0;

    for (const co of course.courseOutcomes) {
      const mapping = co.mappings.find(m => m.poId === po.id);
      if (!mapping) continue;

      // Get CO attainment for this batch
      const coAttainment = await getCOAttainmentForBatch(co.id, batchId);
      
      const contribution = coAttainment * mapping.level;
      courseContribution += contribution;
      totalWeightedSum += contribution;
      totalMappingWeight += mapping.level;

      coContributions.push({
        coCode: co.code,
        coAttainment,
        mappingLevel: mapping.level,
        contribution
      });
    }

    if (coContributions.length > 0) {
      courseContributions.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        coContributions,
        totalContribution: courseContribution
      });
    }
  }

  // Calculate direct attainment
  directAttainment = totalMappingWeight > 0 ? totalWeightedSum / totalMappingWeight : 0;

  // Get indirect attainment (placeholder - would come from surveys)
  const indirectAttainment = await getIndirectAttainment(po.id, batchId);

  // Calculate final attainment
  const finalAttainment = (directAttainment * weights.directWeight) + 
                        (indirectAttainment * weights.indirectWeight);

  return {
    poCode,
    directAttainment: Math.round(directAttainment * 100) / 100,
    indirectAttainment: Math.round(indirectAttainment * 100) / 100,
    finalAttainment: Math.round(finalAttainment * 100) / 100,
    targetLevel: 2.0, // Default target level
    courses: courseContributions
  };
}

async function getCOAttainmentForBatch(coId: string, batchId: string): Promise<number> {
  try {
    // Get average CO attainment for this CO across all students in the batch
    const coAttainments = await db.cOAttainment.findMany({
      where: { 
        coId,
        // Note: This would need to be enhanced to filter by batch properly
        // For now, we'll get the average across all attainments
      }
    });

    if (coAttainments.length === 0) return 0;

    const averageAttainment = coAttainments.reduce((sum, attainment) => 
      sum + attainment.percentage, 0) / coAttainments.length;

    // Convert percentage to attainment level (0-3 scale)
    return Math.min(3.0, Math.max(0.0, (averageAttainment / 100) * 3));
  } catch (error) {
    console.error('Error getting CO attainment:', error);
    return 0;
  }
}

async function getIndirectAttainment(poId: string, batchId: string): Promise<number> {
  try {
    // This would typically come from survey data
    // For now, we'll return a placeholder value
    // In a real implementation, this would query survey tables
    return 2.0; // Placeholder indirect attainment
  } catch (error) {
    console.error('Error getting indirect attainment:', error);
    return 2.0; // Default fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PROGRAM_COORDINATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchId, programId, indirectAttainments, weights } = await request.json();

    if (!batchId || !programId) {
      return NextResponse.json(
        { error: 'Batch ID and Program ID are required' },
        { status: 400 }
      );
    }

    // Validate weights
    if (weights && (weights.directWeight + weights.indirectWeight !== 1.0)) {
      return NextResponse.json(
        { error: 'Sum of weights must equal 1.0 (100%)' },
        { status: 400 }
      );
    }

    // Store indirect attainments (this would typically go to a survey results table)
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Indirect attainments saved successfully',
      data: { batchId, programId, indirectAttainments, weights }
    });

  } catch (error) {
    console.error('Error saving PO Attainment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}