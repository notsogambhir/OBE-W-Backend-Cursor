import { db } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function simpleSeed() {
  try {
    console.log('🌱 Starting simple database seeding...');
    
    // Clean existing users only
    await db.user.deleteMany();
    
    // Try to find existing college or create new one
    let college = await db.college.findFirst({
      where: { code: 'CUIET' }
    });
    
    if (!college) {
      college = await db.college.create({
        data: {
          name: 'CUIET',
          code: 'CUIET',
          description: 'College of Engineering and Technology',
        },
      });
    }

    // Try to find existing program or create new one
    let program = await db.program.findFirst({
      where: { code: 'BCSE' }
    });
    
    if (!program) {
      program = await db.program.create({
        data: {
          name: 'Bachelor of Computer Science',
          code: 'BCSE',
          collegeId: college.id,
          duration: 4,
          description: '4-year undergraduate computer science program',
        },
      });
    }

    // Try to find existing batch or create new one
    let batch = await db.batch.findFirst({
      where: { name: '2020-2024' }
    });
    
    if (!batch) {
      batch = await db.batch.create({
        data: {
          name: '2020-2024',
          programId: program.id,
          startYear: 2020,
          endYear: 2024,
        },
      });
    }

    console.log('✅ Created college, program, and batch');

    // Create Users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = await db.user.create({
      data: {
        email: 'admin@obeportal.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        collegeId: college.id,
      },
    });

    const teacherUser = await db.user.create({
      data: {
        email: 'teacher@obeportal.com',
        password: hashedPassword,
        name: 'Teacher User',
        role: 'TEACHER',
        collegeId: college.id,
        programId: program.id,
      },
    });

    const studentUser = await db.user.create({
      data: {
        email: 'student@obeportal.com',
        studentId: 'STU0001',
        password: hashedPassword,
        name: 'Student User',
        role: 'STUDENT',
        collegeId: college.id,
        programId: program.id,
        batchId: batch.id,
      },
    });

    console.log('✅ Created users:');
    console.log('  Admin: admin@obeportal.com / password123');
    console.log('  Teacher: teacher@obeportal.com / password123');
    console.log('  Student: student@obeportal.com / password123');

    console.log('🎉 Simple seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the seed function
simpleSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});