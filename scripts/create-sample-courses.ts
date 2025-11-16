import { db } from '@/lib/db';

async function createSampleCourses() {
  try {
    console.log('Creating sample courses...');

    // Get existing batches
    const batches = await db.batch.findMany();
    if (batches.length === 0) {
      console.log('No batches found. Please run seed script first.');
      return;
    }

    // Create sample courses for each batch
    const sampleCourses = [
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        semester: '1',
        description: 'Fundamental concepts of computer science and programming',
      },
      {
        code: 'CS102',
        name: 'Data Structures and Algorithms',
        semester: '2',
        description: 'Introduction to data structures and algorithm analysis',
      },
      {
        code: 'CS201',
        name: 'Database Management Systems',
        semester: '3',
        description: 'Database design, implementation, and management',
      },
      {
        code: 'CS202',
        name: 'Web Development',
        semester: '4',
        description: 'Modern web development technologies and practices',
      },
      {
        code: 'ME101',
        name: 'Engineering Mathematics',
        semester: '1',
        description: 'Mathematical foundations for engineering',
      },
      {
        code: 'ME102',
        name: 'Mechanics of Materials',
        semester: '2',
        description: 'Stress, strain, and material properties',
      },
      {
        code: 'ECE101',
        name: 'Digital Electronics',
        semester: '1',
        description: 'Digital logic circuits and systems',
      },
      {
        code: 'ECE102',
        name: 'Signals and Systems',
        semester: '2',
        description: 'Analysis of signals and systems in engineering',
      },
      {
        code: 'BBA101',
        name: 'Business Communication',
        semester: '1',
        description: 'Effective communication in business environments',
      },
      {
        code: 'BBA102',
        name: 'Principles of Management',
        semester: '2',
        description: 'Fundamental concepts of business management',
      },
    ];

    // Create courses for each batch
    for (const batch of batches) {
      console.log(`Creating courses for batch: ${batch.name}`);
      
      // Filter courses based on program
      let coursesToCreate = sampleCourses;
      if (batch.programId.includes('BEME') || batch.programId.includes('BE')) {
        coursesToCreate = sampleCourses.filter(course => 
          course.code.startsWith('CS') || course.code.startsWith('ME')
        );
      } else if (batch.programId.includes('ECE')) {
        coursesToCreate = sampleCourses.filter(course => 
          course.code.startsWith('ECE') || course.code.startsWith('CS')
        );
      } else if (batch.programId.includes('BBA')) {
        coursesToCreate = sampleCourses.filter(course => 
          course.code.startsWith('BBA')
        );
      }

      for (const courseData of coursesToCreate) {
        try {
          const course = await db.course.create({
            data: {
              ...courseData,
              batchId: batch.id,
              status: 'ACTIVE',
            },
          });
          console.log(`Created course: ${course.code} - ${course.name}`);

          // Create sample course outcomes
          const cos = [
            {
              code: 'CO1',
              description: `Understand fundamental concepts of ${course.name}`,
            },
            {
              code: 'CO2',
              description: `Apply theoretical knowledge to practical problems in ${course.name}`,
            },
            {
              code: 'CO3',
              description: `Analyze and solve complex problems related to ${course.name}`,
            },
          ];

          for (const coData of cos) {
            const co = await db.cO.create({
              data: {
                ...coData,
                courseId: course.id,
              },
            });
            console.log(`Created CO: ${co.code} for course ${course.code}`);
          }

          // Create sample assessments
          const assessments = [
            {
              name: 'Mid Term Examination',
              type: 'exam',
              maxMarks: 50,
              weightage: 0.3,
              semester: courseData.semester,
            },
            {
              name: 'Final Examination',
              type: 'exam',
              maxMarks: 100,
              weightage: 0.5,
              semester: courseData.semester,
            },
            {
              name: 'Assignments',
              type: 'assignment',
              maxMarks: 50,
              weightage: 0.2,
              semester: courseData.semester,
            },
          ];

          for (const assessmentData of assessments) {
            const assessment = await db.assessment.create({
              data: {
                ...assessmentData,
                courseId: course.id,
              },
            });
            console.log(`Created assessment: ${assessment.name} for course ${course.code}`);
          }

        } catch (error) {
          console.error(`Error creating course ${courseData.code} for batch ${batch.name}:`, error);
        }
      }
    }

    console.log('Sample courses created successfully!');

  } catch (error) {
    console.error('Error creating sample courses:', error);
  }
}

createSampleCourses();