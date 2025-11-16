import { db } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await db.studentMark.deleteMany();
    await db.cOAttainment.deleteMany();
    await db.enrollment.deleteMany();
    await db.questionCOMapping.deleteMany();
    await db.question.deleteMany();
    await db.assessment.deleteMany();
    await db.cOPOMapping.deleteMany();
    await db.cO.deleteMany();
    await db.course.deleteMany();
    await db.batch.deleteMany();
    await db.program.deleteMany();
    await db.user.deleteMany();
    await db.college.deleteMany();
    await db.pO.deleteMany();
    
    console.log('✅ Existing data cleaned');

    // Create Colleges
    console.log('🏫 Creating colleges...');
    const colleges = await Promise.all([
      db.college.create({
        data: {
          name: 'CUIET',
          code: 'CUIET',
          description: 'College of Engineering and Technology',
        },
      }),
      db.college.create({
        data: {
          name: 'CBS',
          code: 'CBS',
          description: 'College of Business Studies',
        },
      }),
      db.college.create({
        data: {
          name: 'CCP',
          code: 'CCP',
          description: 'College of Pharmacy',
        },
      }),
    ]);

    console.log(`✅ Created ${colleges.length} colleges`);

    // Create Programs
    console.log('📚 Creating programs...');
    const programs = await Promise.all([
      // CUIET Programs
      db.program.create({
        data: {
          name: 'Bachelor of Mechanical Engineering',
          code: 'BEME',
          collegeId: colleges[0].id,
          duration: 4,
          description: '4-year undergraduate mechanical engineering program',
        },
      }),
      db.program.create({
        data: {
          name: 'Bachelor of Computer Science',
          code: 'BCSE',
          collegeId: colleges[0].id,
          duration: 4,
          description: '4-year undergraduate computer science program',
        },
      }),
      db.program.create({
        data: {
          name: 'Master of Technology CSE',
          code: 'MTCSE',
          collegeId: colleges[0].id,
          duration: 2,
          description: '2-year postgraduate computer science program',
        },
      }),
      // CBS Programs
      db.program.create({
        data: {
          name: 'Bachelor of Business Administration',
          code: 'BBA',
          collegeId: colleges[1].id,
          duration: 3,
          description: '3-year undergraduate business administration program',
        },
      }),
      // CCP Programs
      db.program.create({
        data: {
          name: 'Bachelor of Pharmacy',
          code: 'BPHARM',
          collegeId: colleges[2].id,
          duration: 4,
          description: '4-year undergraduate pharmacy program',
        },
      }),
      db.program.create({
        data: {
          name: 'Master of Pharmacy',
          code: 'MPHARM',
          collegeId: colleges[2].id,
          duration: 2,
          description: '2-year postgraduate pharmacy program',
        },
      }),
    ]);

    console.log(`✅ Created ${programs.length} programs`);

    // Create Batches
    console.log('📅 Creating batches...');
    const batches = await Promise.all([
      // BEME Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[0].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
      db.batch.create({
        data: {
          name: '2021-2025',
          programId: programs[0].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // BCSE Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[1].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
      // BBA Batches
      db.batch.create({
        data: {
          name: '2021-2025',
          programId: programs[0].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // BBA Batches
      db.batch.create({
        data: {
          name: '2021-2025',
          programId: programs[3].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // CBS Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[3].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
      // CCP Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[4].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
    ]);

    console.log(`✅ Created ${batches.length} batches`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- ${colleges.length} Colleges`);
    console.log(`- ${programs.length} Programs`);
    console.log(`- ${batches.length} Batches`);
    console.log(`- ${courses.length} Courses`);
    console.log(`- ${cos.length} Course Outcomes`);
    console.log(`- ${pos.length} Program Outcomes`);
    console.log(`- ${assessments.length} Assessments`);
    console.log(`- ${questions.length} Questions`);
    console.log(`- ${questionCOMappings.length} Question-CO mappings`);
    console.log(`- ${coPOMappings.length} CO-PO Mappings`);
    console.log(`- ${users.length} Users`);
    console.log(`- ${enrollments.length} Enrollments`);
    console.log(`- ${studentMarks.length} Student Marks`);
    console.log(`- ${coAttainments.length} CO Attainments`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('Admin Users:');
    console.log('  admin@obeportal.com / admin123');
    console.log('  university@obeportal.com / university123');
    console.log('Department Users:');
    console.log('  cse@obeportal.com / department123 (CSE Dept Head)');
    console.log('  me@obeportal.com / department123 (ME Dept Head)');
    console.log('  business@obeportal.com / department123 (Business Dept Head)');
    console.log('  pharmacy@obeportal.com / department123 (Pharmacy Dept Head)');
    console.log(' Program Coordinators:');
    console.log('  pc.beme@obeportal.com / coordinator123 (BE ME)');
    console.log('  pc.ba@obeportal.com / coordinator123 (BA)');
    console.log('  Teachers:');
    console.log('  teacher1@obeportal.com / teacher123 (CSE)');
    console.log('  teacher2@obeportal.com / teacher123 (CSE)');
    console.log('  teacher3@obeportal.com / teacher123 (SE)');
    console.log('  teacher4@obeportal.com / teacher123 (CSE)');
    console.log('  teacher5@obeportal.com / teacher123 (CSE)');
    console.log(' Students (Password: student123):');
    users.slice(13).forEach((student, index) => {
      console.log(`  ${student.email} (${student.studentId})`);
    });
  } catch (error) {
      console.error('❌ Error during seeding:', error);
    } finally {
      await db.$disconnect();
    }
}

seed();