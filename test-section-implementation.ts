import { db } from './src/lib/db';

async function createTestData() {
  try {
    console.log('Creating test data for Section implementation...');

    // 1. Create a college
    const college = await db.college.upsert({
      where: { code: 'TEST_COLLEGE' },
      update: {},
      create: {
        name: 'Test College',
        code: 'TEST_COLLEGE',
        description: 'Test college for section implementation'
      }
    });
    console.log('College created:', college.name);

    // 2. Create a program
    const program = await db.program.upsert({
      where: { 
        collegeId_code: {
          collegeId: college.id,
          code: 'BE_ECE'
        }
      },
      update: {},
      create: {
        name: 'Bachelor of Engineering in Electronics and Communication',
        code: 'BE_ECE',
        collegeId: college.id,
        duration: 4
      }
    });
    console.log('Program created:', program.name);

    // 3. Create a batch
    const batch = await db.batch.upsert({
      where: {
        programId_name: {
          programId: program.id,
          name: '2025-2029'
        }
      },
      update: {},
      create: {
        name: '2025-2029',
        programId: program.id,
        startYear: 2025,
        endYear: 2029
      }
    });
    console.log('Batch created:', batch.name);

    // 4. Create sections
    const sectionA = await db.section.upsert({
      where: {
        batchId_name: {
          batchId: batch.id,
          name: 'A'
        }
      },
      update: {},
      create: {
        name: 'A',
        batchId: batch.id
      }
    });
    console.log('Section A created');

    const sectionB = await db.section.upsert({
      where: {
        batchId_name: {
          batchId: batch.id,
          name: 'B'
        }
      },
      update: {},
      create: {
        name: 'B',
        batchId: batch.id
      }
    });
    console.log('Section B created');

    // 5. Create users
    const departmentHead = await db.user.upsert({
      where: { email: 'dept.head@test.com' },
      update: {},
      create: {
        name: 'Department Head',
        email: 'dept.head@test.com',
        password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6', // password: password
        role: 'DEPARTMENT',
        collegeId: college.id,
        employeeId: 'EMP001'
      }
    });
    console.log('Department Head created:', departmentHead.name);

    const programCoordinator = await db.user.upsert({
      where: { email: 'pc@test.com' },
      update: {},
      create: {
        name: 'Program Coordinator',
        email: 'pc@test.com',
        password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6', // password: password
        role: 'PROGRAM_COORDINATOR',
        collegeId: college.id,
        programId: program.id,
        employeeId: 'EMP002'
      }
    });
    console.log('Program Coordinator created:', programCoordinator.name);

    const teacher = await db.user.upsert({
      where: { email: 'teacher@test.com' },
      update: {},
      create: {
        name: 'Teacher',
        email: 'teacher@test.com',
        password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6', // password: password
        role: 'TEACHER',
        collegeId: college.id,
        employeeId: 'EMP003'
      }
    });
    console.log('Teacher created:', teacher.name);

    // 6. Create students and assign to sections
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const section = i <= 5 ? sectionA.id : sectionB.id;
      const student = await db.user.upsert({
        where: { studentId: `STU${i.toString().padStart(3, '0')}` },
        update: { sectionId: section },
        create: {
          name: `Student ${i}`,
          email: `student${i}@test.com`,
          password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6', // password: password
          role: 'STUDENT',
          collegeId: college.id,
          programId: program.id,
          batchId: batch.id,
          sectionId: section,
          studentId: `STU${i.toString().padStart(3, '0')}`
        }
      });
      students.push(student);
    }
    console.log(`${students.length} students created and assigned to sections`);

    // 7. Create a course
    const course = await db.course.upsert({
      where: {
        batchId_code: {
          batchId: batch.id,
          code: 'ECE101'
        }
      },
      update: {},
      create: {
        name: 'Basic Electronics',
        code: 'ECE101',
        batchId: batch.id,
        description: 'Basic electronics course',
        status: 'ACTIVE'
      }
    });
    console.log('Course created:', course.name);

    // 8. Create teacher assignments (section-based)
    await db.teacherAssignment.upsert({
      where: {
        courseId_sectionId_teacherId: {
          courseId: course.id,
          sectionId: sectionA.id,
          teacherId: teacher.id
        }
      },
      update: {},
      create: {
        courseId: course.id,
        sectionId: sectionA.id,
        teacherId: teacher.id
      }
    });
    console.log('Teacher assigned to Section A');

    console.log('\n✅ Test data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Department Head: dept.head@test.com / password');
    console.log('Program Coordinator: pc@test.com / password');
    console.log('Teacher: teacher@test.com / password');
    console.log('Students: student1@test.com / password (student1@test.com to student10@test.com)');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await db.$disconnect();
  }
}

createTestData();