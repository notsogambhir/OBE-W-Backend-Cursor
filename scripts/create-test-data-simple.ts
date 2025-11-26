import { db } from '../src/lib/db';

async function createTestData() {
  try {
    console.log('🚀 Creating test data for marks upload functionality...');

    // Get or create a college
    let college = await db.college.findFirst();
    if (!college) {
      college = await db.college.create({
        data: {
          name: 'Test University',
          code: 'TU001',
          description: 'Test University for OBE System'
        }
      });
      console.log('✅ Created college:', college.name);
    }

    // Get or create a program
    let program = await db.program.findFirst();
    if (!program) {
      program = await db.program.create({
        data: {
          name: 'Computer Science Engineering',
          code: 'CSE',
          collegeId: college.id,
          duration: 4,
          description: 'Bachelor of Technology in Computer Science Engineering'
        }
      });
      console.log('✅ Created program:', program.name);
    }

    // Get or create a batch
    let batch = await db.batch.findFirst();
    if (!batch) {
      batch = await db.batch.create({
        data: {
          name: '2024-2028',
          programId: program.id,
          startYear: 2024,
          endYear: 2028
        }
      });
      console.log('✅ Created batch:', batch.name);
    }

    // Get or create a section
    let section = await db.section.findFirst();
    if (!section) {
      section = await db.section.create({
        data: {
          name: 'A',
          batchId: batch.id
        }
      });
      console.log('✅ Created section:', section.name);
    }

    // Get or create a course
    let course = await db.course.findFirst({
      where: { batchId: batch.id }
    });
    if (!course) {
      course = await db.course.create({
        data: {
          code: 'CS101',
          name: 'Introduction to Programming',
          batchId: batch.id,
          description: 'Fundamental concepts of programming and problem-solving',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Created course:', course.name);
    }

    // Create sample students if they don't exist
    const existingStudents = await db.user.count({
      where: { role: 'STUDENT' }
    });
    
    if (existingStudents === 0) {
      const students = [];
      for (let i = 1; i <= 5; i++) {
        const student = await db.user.create({
          data: {
            name: `Student ${i}`,
            email: `student${i}@test.com`,
            studentId: `STU00${i}`,
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9x5xe', // password123
            role: 'STUDENT',
            programId: program.id,
            batchId: batch.id,
            sectionId: section.id
          }
        });
        students.push(student);
      }

      // Enroll students in the course
      for (const student of students) {
        await db.enrollment.create({
          data: {
            courseId: course.id,
            studentId: student.id
          }
        });
      }
      console.log('✅ Created 5 students and enrolled them in the course');
    }

    // Create sample assessment if it doesn't exist
    let assessment = await db.assessment.findFirst({
      where: { courseId: course.id }
    });
    if (!assessment) {
      assessment = await db.assessment.create({
        data: {
          name: 'Mid Term Examination',
          type: 'exam',
          maxMarks: 100,
          weightage: 30,
          courseId: course.id,
          sectionId: section.id
        }
      });
      console.log('✅ Created assessment:', assessment.name);
    }

    // Create sample questions if they don't exist
    const existingQuestions = await db.question.count({
      where: { assessmentId: assessment.id }
    });

    if (existingQuestions === 0) {
      const questions = [
        { question: 'What is the difference between procedural and object-oriented programming?', maxMarks: 20 },
        { question: 'Write a program to find the factorial of a number.', maxMarks: 25 },
        { question: 'Explain the concept of recursion with an example.', maxMarks: 15 },
        { question: 'What are data types? Explain with examples.', maxMarks: 20 },
        { question: 'Write a program to sort an array using bubble sort.', maxMarks: 20 }
      ];

      for (const q of questions) {
        await db.question.create({
          data: {
            question: q.question,
            maxMarks: q.maxMarks,
            assessmentId: assessment.id
          }
        });
      }
      console.log('✅ Created 5 sample questions');
    }

    console.log('🎉 Test data creation completed!');
    console.log('📊 Summary:');
    console.log(`   - College: ${college.name}`);
    console.log(`   - Program: ${program.name}`);
    console.log(`   - Batch: ${batch.name}`);
    console.log(`   - Section: ${section.name}`);
    console.log(`   - Course: ${course.name}`);
    console.log(`   - Assessment: ${assessment.name}`);
    console.log(`   - Students: 5`);
    console.log(`   - Questions: 5`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await db.$disconnect();
  }
}

createTestData();