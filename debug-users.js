const { PrismaClient } = require('@prisma/client');

async function debugUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking PROGRAM_COORDINATOR users ===');
    
    // Find program coordinators
    const programCoordinators = await prisma.user.findMany({
      where: { role: 'PROGRAM_COORDINATOR' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        batchId: true,
        programId: true,
        departmentId: true,
        collegeId: true,
      }
    });
    
    console.log(`Found ${programCoordinators.length} program coordinators:`);
    programCoordinators.forEach(pc => {
      console.log(`- ${pc.email}: batchId=${pc.batchId}, programId=${pc.programId}`);
    });
    
    // Check all batches
    const batches = await prisma.batch.findMany({
      select: {
        id: true,
        name: true,
        programId: true,
      }
    });
    
    console.log(`\nFound ${batches.length} batches:`);
    batches.forEach(batch => {
      console.log(`- ${batch.id}: ${batch.name} (program: ${batch.programId})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUsers();