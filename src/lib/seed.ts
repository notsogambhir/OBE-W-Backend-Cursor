import { db } from './db';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clean existing data in correct order (respecting foreign key constraints)
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
    await db.user.deleteMany();
    await db.program.deleteMany();
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
          programId: programs[2].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // BPHARM Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[3].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
    ]);

    console.log(`✅ Created ${batches.length} batches`);

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await Promise.all([
      // Admin
      db.user.create({
        data: {
          email: 'admin@obeportal.com',
          password: hashedPassword,
          name: 'System Administrator',
          role: 'ADMIN',
          collegeId: colleges[0].id,
        },
      }),
      // University Admin
      db.user.create({
        data: {
          email: 'university@obeportal.com',
          password: hashedPassword,
          name: 'University Administrator',
          role: 'UNIVERSITY',
          collegeId: colleges[0].id,
        },
      }),
      // Department Heads
      db.user.create({
        data: {
          email: 'cse@obeportal.com',
          password: hashedPassword,
          name: 'CSE Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'business@obeportal.com',
          password: hashedPassword,
          name: 'Business Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[1].id,
        },
      }),
      // Program Coordinators
      db.user.create({
        data: {
          email: 'pc.beme@obeportal.com',
          password: hashedPassword,
          name: 'BE ME Program Coordinator',
          role: 'PROGRAM_COORDINATOR',
          collegeId: colleges[0].id,
          programId: programs[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'pc.bba@obeportal.com',
          password: hashedPassword,
          name: 'BBA Program Coordinator',
          role: 'PROGRAM_COORDINATOR',
          collegeId: colleges[1].id,
          programId: programs[2].id,
        },
      }),
      // Teachers
      db.user.create({
        data: {
          email: 'teacher1@obeportal.com',
          password: hashedPassword,
          name: 'Teacher One',
          role: 'TEACHER',
          collegeId: colleges[0].id,
          programId: programs[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'teacher2@obeportal.com',
          password: hashedPassword,
          name: 'Teacher Two',
          role: 'TEACHER',
          collegeId: colleges[0].id,
          programId: programs[1].id,
        },
      }),
      // Students
      db.user.create({
        data: {
          email: 'student1@obeportal.com',
          studentId: 'STU001',
          password: hashedPassword,
          name: 'Student One',
          role: 'STUDENT',
          collegeId: colleges[0].id,
          programId: programs[0].id,
          batchId: batches[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'student2@obeportal.com',
          studentId: 'STU002',
          password: hashedPassword,
          name: 'Student Two',
          role: 'STUDENT',
          collegeId: colleges[0].id,
          programId: programs[1].id,
          batchId: batches[2].id,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Courses
    console.log('📚 Creating courses...');
    const courses = await Promise.all([
      db.course.create({
        data: {
          code: 'ME101',
          name: 'Engineering Mathematics I',
          batchId: batches[0].id,
          description: 'Fundamental concepts in calculus, linear algebra, and differential equations for engineering students.',
          status: 'COMPLETED',
          targetPercentage: 60.0,
          level1Threshold: 60.0,
          level2Threshold: 75.0,
          level3Threshold: 85.0,
        },
      }),
      db.course.create({
        data: {
          code: 'CS101',
          name: 'Programming Fundamentals',
          batchId: batches[2].id,
          description: 'Introduction to programming concepts, algorithms, and problem-solving techniques.',
          status: 'ACTIVE',
          targetPercentage: 70.0,
          level1Threshold: 70.0,
          level2Threshold: 85.0,
          level3Threshold: 95.0,
        },
      }),
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    // Create Program Outcomes
    console.log('🎯 Creating Program Outcomes...');
    const pos = await Promise.all([
      // BEME POs
      ...['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'].map((code, index) => 
        db.pO.create({
          data: {
            programId: programs[0].id,
            code,
            description: [
              'Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.',
              'Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.',
              'Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.',
              'Conduct investigations of complex problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.',
              'Modern tool usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.',
              'The engineer and society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.',
            ][index],
          },
        })
      ),
      // BBA POs
      ...['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'].map((code, index) => 
        db.pO.create({
          data: {
            programId: programs[2].id,
            code,
            description: [
              'Business Knowledge: Apply fundamental knowledge of business administration, management principles, and economic theories to solve business problems.',
              'Critical Thinking: Analyze complex business situations, evaluate alternatives, and make informed decisions using appropriate analytical tools.',
              'Communication Skills: Communicate effectively in various business contexts using oral, written, and digital communication methods.',
              'Leadership and Teamwork: Demonstrate leadership qualities and work effectively in teams to achieve organizational goals.',
              'Ethical Responsibility: Apply ethical principles and social responsibility in business decision-making and professional conduct.',
              'Global Perspective: Understand and analyze business issues in a global context with awareness of cultural diversity and international business practices.',
            ][index],
          },
        })
      ),
    ]);

    console.log(`✅ Created ${pos.length} Program Outcomes`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- ${colleges.length} Colleges`);
    console.log(`- ${programs.length} Programs`);
    console.log(`- ${batches.length} Batches`);
    console.log(`- ${courses.length} Courses`);
    console.log(`- ${pos.length} Program Outcomes`);
    console.log(`- ${users.length} Users`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('Admin Users:');
    console.log('  admin@obeportal.com / password123');
    console.log('  university@obeportal.com / password123');
    console.log('Department Users:');
    console.log('  cse@obeportal.com / password123 (CSE Dept Head)');
    console.log('  business@obeportal.com / password123 (Business Dept Head)');
    console.log('Program Coordinators:');
    console.log('  pc.beme@obeportal.com / password123 (BE ME)');
    console.log('  pc.bba@obeportal.com / password123 (BBA)');
    console.log('Teachers:');
    console.log('  teacher1@obeportal.com / password123');
    console.log('  teacher2@obeportal.com / password123');
    console.log('Students:');
    console.log('  student1@obeportal.com / password123');
    console.log('  student2@obeportal.com / password123');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await db.$disconnect();
  }
}

seed();