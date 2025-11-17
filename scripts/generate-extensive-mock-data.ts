import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function generateExtensiveMockData() {
  try {
    console.log('🌱 Starting extensive mock data generation...');
    
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

    // Get existing colleges
    const colleges = await db.college.findMany();
    const cuietCollege = colleges.find(c => c.code === 'CUIET');
    const cbsCollege = colleges.find(c => c.code === 'CBS');
    const ccpCollege = colleges.find(c => c.code === 'CCP');
    
    if (!cuietCollege || !cbsCollege || !ccpCollege) {
      throw new Error('Colleges not found. Please run basic seed first.');
    }

    // Create Teachers for all programs
    console.log('👨‍🏫 Creating teachers...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const teachers = [
      // CUIET Teachers
      { email: 'teacher.mech@obeportal.com', name: 'Mechanical Engineering Teacher', employeeId: 'TCH001', role: 'TEACHER', collegeId: cuietCollege.id },
      { email: 'teacher.cs1@obeportal.com', name: 'Computer Science Teacher 1', employeeId: 'TCH002', role: 'TEACHER', collegeId: cuietCollege.id },
      { email: 'teacher.cs2@obeportal.com', name: 'Computer Science Teacher 2', employeeId: 'TCH003', role: 'TEACHER', collegeId: cuietCollege.id },
      { email: 'teacher.math@obeportal.com', name: 'Mathematics Teacher', employeeId: 'TCH004', role: 'TEACHER', collegeId: cuietCollege.id },
      { email: 'teacher.physics@obeportal.com', name: 'Physics Teacher', employeeId: 'TCH005', role: 'TEACHER', collegeId: cuietCollege.id },
      
      // CBS Teachers
      { email: 'teacher.business1@obeportal.com', name: 'Business Studies Teacher 1', employeeId: 'TCH006', role: 'TEACHER', collegeId: cbsCollege.id },
      { email: 'teacher.business2@obeportal.com', name: 'Business Studies Teacher 2', employeeId: 'TCH007', role: 'TEACHER', collegeId: cbsCollege.id },
      { email: 'teacher.economics@obeportal.com', name: 'Economics Teacher', employeeId: 'TCH008', role: 'TEACHER', collegeId: cbsCollege.id },
      { email: 'teacher.management@obeportal.com', name: 'Management Teacher', employeeId: 'TCH009', role: 'TEACHER', collegeId: cbsCollege.id },
      
      // CCP Teachers
      { email: 'teacher.pharma1@obeportal.com', name: 'Pharmacy Teacher 1', employeeId: 'TCH010', role: 'TEACHER', collegeId: ccpCollege.id },
      { email: 'teacher.pharma2@obeportal.com', name: 'Pharmacy Teacher 2', employeeId: 'TCH011', role: 'TEACHER', collegeId: ccpCollege.id },
      { email: 'teacher.pharma3@obeportal.com', name: 'Pharmacy Teacher 3', employeeId: 'TCH012', role: 'TEACHER', collegeId: ccpCollege.id },
      { email: 'teacher.chemistry@obeportal.com', name: 'Chemistry Teacher', employeeId: 'TCH013', role: 'TEACHER', collegeId: ccpCollege.id },
    ];

    const createdTeachers = await db.user.createMany({
      data: teachers.map(t => ({ ...t, password: hashedPassword, isActive: true }))
    });
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    // Create Program Coordinators
    console.log('👨‍💼 Creating program coordinators...');
    const coordinators = [
      { email: 'pc.mech@obeportal.com', name: 'ME Program Coordinator', employeeId: 'PC001', role: 'PROGRAM_COORDINATOR', collegeId: cuietCollege.id },
      { email: 'pc.cs@obeportal.com', name: 'CS Program Coordinator', employeeId: 'PC002', role: 'PROGRAM_COORDINATOR', collegeId: cuietCollege.id },
      { email: 'pc.business@obeportal.com', name: 'Business Program Coordinator', employeeId: 'PC003', role: 'PROGRAM_COORDINATOR', collegeId: cbsCollege.id },
      { email: 'pc.pharma@obeportal.com', name: 'Pharmacy Program Coordinator', employeeId: 'PC004', role: 'PROGRAM_COORDINATOR', collegeId: ccpCollege.id },
    ];

    const createdCoordinators = await db.user.createMany({
      data: coordinators.map(c => ({ ...c, password: hashedPassword, isActive: true }))
    });
    console.log(`✅ Created ${createdCoordinators.length} program coordinators`);

    // Get existing programs
    const programs = await db.program.findMany({
      include: { college: true }
    });

    // Create extensive courses for each batch
    console.log('📚 Creating extensive courses...');
    const courseData = [];

    for (const program of programs) {
      const batches = await db.batch.findMany({
        where: { programId: program.id }
      });
      
      for (const batch of batches) {
        // Generate courses based on program type
        const courses = generateCoursesForProgram(program.code, batch.id, batch.startYear);
        courseData.push(...courses);
      }
    }

    const createdCourses = await db.course.createMany({
      data: courseData
    });
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Create COs for all courses
    console.log('🎯 Creating Course Outcomes...');
    const coData = [];
    for (const course of createdCourses) {
      const cos = generateCOsForCourse(course.code);
      coData.push(...cos.map(co => ({ ...co, courseId: course.id })));
    }

    const createdCOs = await db.cO.createMany({
      data: coData
    });
    console.log(`✅ Created ${createdCOs.length} Course Outcomes`);

    // Create assessments for courses
    console.log('📝 Creating assessments...');
    const assessmentData = [];
    for (const course of createdCourses) {
      const assessments = generateAssessmentsForCourse(course.id);
      assessmentData.push(...assessments);
    }

    const createdAssessments = await db.assessment.createMany({
      data: assessmentData
    });
    console.log(`✅ Created ${createdAssessments.length} assessments`);

    // Create questions for assessments
    console.log('❓ Creating questions...');
    const questionData = [];
    for (const assessment of createdAssessments) {
      const questions = generateQuestionsForAssessment(assessment.id);
      questionData.push(...questions);
    }

    const createdQuestions = await db.question.createMany({
      data: questionData
    });
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // Create CO-Question mappings
    console.log('🔗 Creating CO-Question mappings...');
    const mappingPromises = createdQuestions.map(async (question) => {
      const coIds = await getRandomCOsForQuestion(createdCOs, 2);
      return coIds.map(coId => ({
        questionId: question.id,
        coId,
        isActive: true
      }));
    });
    
    const mappingData = (await Promise.all(mappingPromises)).flat();

    await db.questionCOMapping.createMany({
      data: mappingData
    });
    console.log(`✅ Created CO-Question mappings`);

    // Create students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    let studentCounter = 1;
    
    for (const program of programs) {
      const batches = await db.batch.findMany({
        where: { programId: program.id }
      });
      
      for (const batch of batches) {
        const batchSize = Math.floor(Math.random() * 30) + 20; // 20-50 students per batch
        for (let i = 0; i < batchSize; i++) {
          students.push({
            email: `student${String(studentCounter++).padStart(3, '0')}@obeportal.com`,
            studentId: `STU${String(studentCounter - 1).padStart(4, '0')}`,
            name: `Student ${studentCounter - 1}`,
            password: hashedPassword,
            role: 'STUDENT',
            collegeId: program.collegeId,
            programId: program.id,
            batchId: batch.id,
            isActive: true
          });
        }
      }
    }

    const createdStudents = await db.user.createMany({
      data: students
    });
    console.log(`✅ Created ${createdStudents.length} students`);

    // Create enrollments
    console.log('📋 Creating enrollments...');
    const enrollmentData = [];
    for (const course of createdCourses) {
      const courseStudents = createdStudents.filter(s => s.batchId === course.batchId);
      enrollmentData.push(...courseStudents.map(student => ({
        courseId: course.id,
        studentId: student.id,
        isActive: true
      })));
    }

    await db.enrollment.createMany({
      data: enrollmentData
    });
    console.log(`✅ Created ${enrollmentData.length} enrollments`);

    // Create student marks
    console.log('📊 Creating student marks...');
    const markData = [];
    for (const question of createdQuestions) {
      const questionStudents = createdStudents.filter(s => s.batchId === question.assessment?.courseId);
      markData.push(...questionStudents.map(student => ({
        questionId: question.id,
        studentId: student.id,
        obtainedMarks: Math.floor(Math.random() * question.maxMarks * 0.6) + Math.floor(question.maxMarks * 0.2), // 60-80% range
        maxMarks: question.maxMarks,
        academicYear: '2024-2025'
      })));
    }

    await db.studentMark.createMany({
      data: markData
    });
    console.log(`✅ Created ${markData.length} student marks`);

    console.log('🎉 Extensive mock data generation completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- ${createdTeachers.length} Teachers`);
    console.log(`- ${createdCoordinators.length} Program Coordinators`);
    console.log(`- ${createdCourses.length} Courses`);
    console.log(`- ${createdCOs.length} Course Outcomes`);
    console.log(`- ${createdAssessments.length} Assessments`);
    console.log(`- ${createdQuestions.length} Questions`);
    console.log(`- ${createdStudents.length} Students`);
    console.log(`- ${enrollmentData.length} Enrollments`);
    console.log(`- ${markData.length} Student Marks`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
  } finally {
    await db.$disconnect();
  }
}

// Helper functions
function generateCoursesForProgram(programCode: string, batchId: string, startYear: number) {
  const courseTemplates = {
    'BEME': [
      { code: 'ME101', name: 'Engineering Mathematics I', description: 'Calculus, linear algebra, and differential equations' },
      { code: 'ME102', name: 'Engineering Mechanics', description: 'Statics, dynamics, and mechanics of materials' },
      { code: 'ME103', name: 'Thermodynamics', description: 'Heat transfer, energy systems, and thermodynamics' },
      { code: 'ME104', name: 'Fluid Mechanics', description: 'Fluid behavior, fluid statics, and fluid dynamics' },
      { code: 'ME105', name: 'Manufacturing Processes', description: 'Traditional and modern manufacturing processes' },
      { code: 'ME106', name: 'Machine Design', description: 'Design principles and practices for mechanical systems' },
      { code: 'ME107', name: 'Heat Transfer', description: 'Conduction, convection, and radiation heat transfer' },
      { code: 'ME108', name: 'Vibrations', description: 'Mechanical vibrations and control theory' },
    ],
    'BCSE': [
      { code: 'CS101', name: 'Programming Fundamentals', description: 'Introduction to programming and problem-solving' },
      { code: 'CS102', name: 'Data Structures and Algorithms', description: 'Data organization and algorithmic analysis' },
      { code: 'CS103', name: 'Computer Organization', description: 'Computer architecture and organization' },
      { code: 'CS104', name: 'Operating Systems', description: 'Process management and resource allocation' },
      { code: 'CS105', name: 'Database Systems', description: 'Database design, implementation, and management' },
      { code: 'CS106', name: 'Software Engineering', description: 'Software development methodologies and practices' },
      { code: 'CS107', name: 'Computer Networks', description: 'Network protocols, architectures, and security' },
      { code: 'CS108', name: 'Web Development', description: 'Frontend and backend web technologies' },
    ],
    'BBA': [
      { code: 'BA101', name: 'Business Mathematics', description: 'Mathematical concepts for business applications' },
      { code: 'BA102', name: 'Business Communication', description: 'Professional communication in business contexts' },
      { code: 'BA103', name: 'Financial Accounting', description: 'Accounting principles and financial statement analysis' },
      { code: 'BA104', name: 'Marketing Management', description: 'Marketing strategies and consumer behavior' },
      { code: 'BA105', name: 'Human Resource Management', description: 'Personnel management and organizational behavior' },
      { code: 'BA106', name: 'Business Law', description: 'Legal aspects of business operations' },
    ],
    'BPHARM': [
      { code: 'PH101', name: 'Pharmaceutical Chemistry', description: 'Chemical principles in pharmaceutical sciences' },
      { code: 'PH102', name: 'Pharmacology', description: 'Drug actions and therapeutic effects' },
      { code: 'PH103', name: 'Pharmacognosy', description: 'Natural drug sources and identification' },
      { code: 'PH104', name: 'Pharmaceutical Analysis', description: 'Quality control and analytical methods' },
      { code: 'PH105', name: 'Medicinal Chemistry', description: 'Organic chemistry for drug synthesis' },
      { code: 'PH106', name: 'Pharmacy Practice', description: 'Professional pharmacy operations and patient care' },
    ],
  };

  const templates = courseTemplates[programCode as keyof typeof courseTemplates] || [];
  return templates.map(template => ({
    ...template,
    batchId,
    status: startYear <= 2022 ? 'COMPLETED' : startYear === 2023 ? 'ACTIVE' : 'FUTURE',
    targetPercentage: 60.0 + Math.random() * 20, // 60-80%
    level1Threshold: 60.0,
    level2Threshold: 75.0,
    level3Threshold: 85.0,
  }));
}

function generateCOsForCourse(courseCode: string) {
  const baseCOs = {
    'ME': [
      { code: 'ME101-CO1', description: 'Apply calculus concepts to solve engineering problems' },
      { code: 'ME101-CO2', description: 'Analyze forces and moments in mechanical systems' },
      { code: 'ME101-CO3', description: 'Design mechanical components considering safety and reliability' },
      { code: 'ME102-CO1', description: 'Apply principles of statics to analyze structures' },
      { code: 'ME102-CO2', description: 'Understand material properties and their applications' },
      { code: 'ME103-CO1', description: 'Apply laws of thermodynamics to engineering systems' },
      { code: 'ME103-CO2', description: 'Analyze heat transfer mechanisms and efficiency' },
    ],
    'CS': [
      { code: 'CS101-CO1', description: 'Design and implement algorithms to solve computational problems' },
      { code: 'CS101-CO2', description: 'Analyze time and space complexity of algorithms' },
      { code: 'CS102-CO1', description: 'Implement data structures for efficient data organization' },
      { code: 'CS102-CO2', description: 'Compare and evaluate different data structure implementations' },
      { code: 'CS103-CO1', description: 'Understand computer architecture and instruction sets' },
      { code: 'CS103-CO2', description: 'Analyze performance characteristics of computer systems' },
    ],
    'BA': [
      { code: 'BA101-CO1', description: 'Apply mathematical concepts to business decision making' },
      { code: 'BA101-CO2', description: 'Use statistical methods for business analysis' },
      { code: 'BA102-CO1', description: 'Develop effective business communication strategies' },
      { code: 'BA102-CO2', description: 'Create professional business documents and presentations' },
    ],
    'PH': [
      { code: 'PH101-CO1', description: 'Apply chemical principles to pharmaceutical formulations' },
      { code: 'PH101-CO2', description: 'Analyze chemical reactions and mechanisms in drugs' },
      { code: 'PH102-CO1', description: 'Understand drug mechanisms and therapeutic effects' },
      { code: 'PH102-CO2', description: 'Evaluate drug efficacy and safety profiles' },
    ],
  };

  const prefix = courseCode.substring(0, 2);
  const cos = baseCOs[prefix as keyof typeof baseCOs] || baseCOs['ME'];
  return cos.map(co => ({ ...co, isActive: true }));
}

function generateAssessmentsForCourse(courseId: string) {
  const assessmentTypes = ['exam', 'quiz', 'assignment', 'project'];
  return assessmentTypes.map((type, index) => ({
    courseId,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
    type,
    maxMarks: type === 'exam' ? 100 : type === 'project' ? 50 : 25,
    weightage: type === 'exam' ? 0.4 : type === 'project' ? 0.2 : 0.1,
    isActive: true
  }));
}

function generateQuestionsForAssessment(assessmentId: string) {
  const questions = [];
  const questionCount = Math.floor(Math.random() * 5) + 5; // 5-10 questions per assessment
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      assessmentId,
      question: `Question ${i + 1}: ${generateQuestionText()}`,
      maxMarks: Math.floor(Math.random() * 10) + 10, // 10-20 marks per question
      isActive: true
    });
  }
  
  return questions;
}

function generateQuestionText(): string {
  const templates = [
    'Analyze the given scenario and provide a detailed solution',
    'Calculate the required values using the provided formulas',
    'Design a system that meets the specified requirements',
    'Evaluate the given options and select the most appropriate one',
    'Explain the underlying principles and their applications',
    'Compare and contrast the different approaches mentioned',
    'Apply the theoretical concepts to a practical problem',
    'Justify your answer with relevant examples and reasoning',
    'Propose improvements to the existing system'
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

async function getRandomCOsForQuestion(createdCOs: any[], count: number): Promise<string[]> {
  // Simple implementation - return random CO IDs
  const coIds = createdCOs.map(co => co.id);
  const shuffled = coIds.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

generateExtensiveMockData().catch(console.error);