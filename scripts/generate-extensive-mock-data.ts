import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Helper function to generate random data
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Sample data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'William', 'Patricia', 'Richard', 'Jennifer', 'Charles', 'Linda', 'Joseph', 'Elizabeth', 'Thomas', 'Barbara'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const courseNames = {
  'BEME': [
    'Engineering Mathematics', 'Engineering Physics', 'Engineering Chemistry', 'Engineering Graphics',
    'Programming for Problem Solving', 'Data Structures', 'Database Management Systems', 'Operating Systems',
    'Computer Networks', 'Software Engineering', 'Web Technologies', 'Machine Learning',
    'Artificial Intelligence', 'Cloud Computing', 'Cyber Security', 'Internet of Things',
    'Big Data Analytics', 'Blockchain Technology', 'DevOps', 'Microprocessors'
  ],
  'BEECE': [
    'Engineering Mathematics', 'Network Analysis', 'Electronic Devices', 'Digital Logic Design',
    'Signals and Systems', 'Electromagnetic Theory', 'Microprocessors', 'Analog Communication',
    'Digital Communication', 'VLSI Design', 'Embedded Systems', 'Digital Signal Processing',
    'Control Systems', 'Power Electronics', 'Microwave Engineering', 'Antenna and Wave Propagation',
    'Optical Communication', 'Wireless Communication', 'Image Processing', 'Robotics'
  ],
  'BBA': [
    'Business Mathematics', 'Business Statistics', 'Financial Accounting', 'Cost Accounting',
    'Management Principles', 'Business Law', 'Economics', 'Marketing Management',
    'Human Resource Management', 'Financial Management', 'Operations Management', 'Business Communication',
    'Organizational Behavior', 'Strategic Management', 'International Business', 'Entrepreneurship',
    'Business Analytics', 'Digital Marketing', 'Supply Chain Management', 'Project Management'
  ],
  'MBA': [
    'Managerial Economics', 'Financial Management', 'Marketing Management', 'Operations Management',
    'Human Resource Management', 'Strategic Management', 'Business Analytics', 'Leadership',
    'International Business', 'Supply Chain Management', 'Corporate Finance', 'Brand Management',
    'Digital Transformation', 'Business Ethics', 'Innovation Management', 'Mergers and Acquisitions',
    'Risk Management', 'Business Intelligence', 'E-Commerce', 'Global Business Strategy'
  ],
  'BPHARMA': [
    'Pharmaceutical Chemistry', 'Pharmaceutics', 'Pharmacology', 'Pharmacognosy',
    'Biochemistry', 'Microbiology', 'Pathophysiology', 'Drug Delivery Systems',
    'Quality Assurance', 'Regulatory Affairs', 'Clinical Pharmacy', 'Hospital Pharmacy',
    'Pharmaceutical Analysis', 'Medicinal Chemistry', 'Toxicology', 'Biopharmaceutics',
    'Pharmaceutical Biotechnology', 'Cosmetic Science', 'Nutraceuticals', 'Pharmaceutical Marketing'
  ],
  'MPHARMA': [
    'Advanced Pharmaceutical Chemistry', 'Advanced Pharmacology', 'Pharmaceutical Analysis',
    'Quality Assurance Management', 'Regulatory Affairs', 'Clinical Research',
    'Pharmaceutical Biotechnology', 'Drug Development', 'Pharmacokinetics', 'Pharmacodynamics',
    'Pharmaceutical Marketing', 'Hospital Pharmacy Management', 'Pharmacoepidemiology',
    'Pharmacoeconomics', 'Good Manufacturing Practices', 'Pharmaceutical Supply Chain',
    'Intellectual Property Rights', 'Pharmaceutical Project Management', 'Drug Regulatory Science'
  ]
};

const courseCodes = {
  'BEME': ['MA101', 'PH101', 'CH101', 'EG101', 'CS101', 'CS201', 'CS202', 'CS203', 'CS204', 'CS205', 'CS206', 'CS207', 'CS208', 'CS209', 'CS210', 'CS211', 'CS212', 'CS213', 'CS214', 'CS215'],
  'BEECE': ['MA101', 'EC101', 'EC102', 'EC103', 'EC104', 'EC105', 'EC106', 'EC107', 'EC108', 'EC109', 'EC110', 'EC111', 'EC112', 'EC113', 'EC114', 'EC115', 'EC116', 'EC117', 'EC118', 'EC119'],
  'BBA': ['BA101', 'BA102', 'BA103', 'BA104', 'BA105', 'BA106', 'BA107', 'BA108', 'BA109', 'BA110', 'BA111', 'BA112', 'BA113', 'BA114', 'BA115', 'BA116', 'BA117', 'BA118', 'BA119', 'BA120'],
  'MBA': ['MBA101', 'MBA102', 'MBA103', 'MBA104', 'MBA105', 'MBA106', 'MBA107', 'MBA108', 'MBA109', 'MBA110', 'MBA111', 'MBA112', 'MBA113', 'MBA114', 'MBA115', 'MBA116', 'MBA117', 'MBA118', 'MBA119', 'MBA120'],
  'BPHARMA': ['PH101', 'PH102', 'PH103', 'PH104', 'PH105', 'PH106', 'PH107', 'PH108', 'PH109', 'PH110', 'PH111', 'PH112', 'PH113', 'PH114', 'PH115', 'PH116', 'PH117', 'PH118', 'PH119', 'PH120'],
  'MPHARMA': ['MP101', 'MP102', 'MP103', 'MP104', 'MP105', 'MP106', 'MP107', 'MP108', 'MP109', 'MP110', 'MP111', 'MP112', 'MP113', 'MP114', 'MP115', 'MP116', 'MP117', 'MP118', 'MP119', 'MP120']
};

const coDescriptions = [
  'Understand the fundamental concepts and principles',
  'Apply theoretical knowledge to solve practical problems',
  'Analyze and evaluate complex scenarios',
  'Design and implement solutions',
  'Use modern tools and techniques effectively',
  'Communicate ideas and results clearly',
  'Work effectively in teams',
  'Understand professional and ethical responsibilities',
  'Apply knowledge in interdisciplinary contexts',
  'Engage in lifelong learning'
];

const assessmentTypes = ['Quiz', 'Assignment', 'Mid Term', 'End Term', 'Project', 'Lab Work', 'Presentation', 'Case Study'];

async function generateExtensiveMockData() {
  try {
    console.log('Starting extensive mock data generation...');

    // Get existing data
    const colleges = await db.college.findMany({ where: { isActive: true } });
    const departments = await db.department.findMany({ where: { isActive: true } });
    const programs = await db.program.findMany({ where: { isActive: true } });
    const batches = await db.batch.findMany({ where: { isActive: true } });
    const pos = await db.pO.findMany({ where: { isActive: true } });

    console.log(`Found ${colleges.length} colleges, ${departments.length} departments, ${programs.length} programs, ${batches.length} batches`);

    // Generate more students
    console.log('Generating students...');
    const students = [];
    const hashedPassword = await hashPassword('student123');

    // Find the highest existing student ID
    const existingStudents = await db.user.findMany({
      where: { role: 'STUDENT' },
      select: { studentId: true },
      orderBy: { studentId: 'desc' }
    });
    
    let startId = 201; // Default start
    if (existingStudents.length > 0) {
      const highestId = existingStudents[0].studentId;
      const numericId = parseInt(highestId.replace('STU', ''));
      startId = numericId + 1;
    }
    
    console.log(`Starting student generation from ID: STU${String(startId).padStart(6, '0')}`);

    for (let i = startId; i <= startId + 199; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const program = getRandomItem(programs);
      const programBatches = batches.filter(b => b.programId === program.id);
      
      if (programBatches.length === 0) continue;
      
      const batch = getRandomItem(programBatches);

      const student = await db.user.create({
        data: {
          studentId: `STU${String(i).padStart(6, '0')}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.com`,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'STUDENT',
          collegeId: program.collegeId,
          departmentId: program.departmentId,
          programId: program.id,
          batchId: batch.id,
          isActive: true
        }
      });
      students.push(student);
    }

    console.log(`Generated ${students.length} students`);

    // Generate courses for each batch
    console.log('Generating courses...');
    const courses = [];
    
    for (const batch of batches) {
      const program = programs.find(p => p.id === batch.programId);
      if (!program) continue;

      const programCode = program.code;
      const courseNamesForProgram = courseNames[programCode as keyof typeof courseNames] || [];
      const courseCodesForProgram = courseCodes[programCode as keyof typeof courseCodes] || [];

      // Generate 8-12 courses per batch
      const numCourses = getRandomNumber(8, 12);
      for (let i = 0; i < Math.min(numCourses, courseNamesForProgram.length); i++) {
        const course = await db.course.create({
          data: {
            code: courseCodesForProgram[i],
            name: courseNamesForProgram[i],
            batchId: batch.id,
            description: `Comprehensive course on ${courseNamesForProgram[i].toLowerCase()} covering fundamental concepts and practical applications.`,
            status: getRandomItem(['FUTURE', 'ACTIVE', 'COMPLETED']),
            targetPercentage: getRandomFloat(45, 65),
            level1Threshold: getRandomFloat(45, 55),
            level2Threshold: getRandomFloat(65, 75),
            level3Threshold: getRandomFloat(75, 85),
            isActive: true
          }
        });
        courses.push(course);
      }
    }

    console.log(`Generated ${courses.length} courses`);

    // Generate Course Outcomes for each course
    console.log('Generating Course Outcomes...');
    const cos = [];
    
    for (const course of courses) {
      const numCOs = getRandomNumber(4, 6);
      for (let i = 1; i <= numCOs; i++) {
        const co = await db.cO.create({
          data: {
            courseId: course.id,
            code: `CO${i}`,
            description: `${getRandomItem(coDescriptions)} related to ${course.name.toLowerCase()}.`,
            isActive: true
          }
        });
        cos.push(co);
      }
    }

    console.log(`Generated ${cos.length} Course Outcomes`);

    // Generate Assessments for each course
    console.log('Generating Assessments...');
    const assessments = [];
    
    for (const course of courses) {
      const numAssessments = getRandomNumber(3, 5);
      const assessmentTypesForCourse = getRandomItems(assessmentTypes, numAssessments);
      
      for (let i = 0; i < numAssessments; i++) {
        const assessment = await db.assessment.create({
          data: {
            courseId: course.id,
            name: `${assessmentTypesForCourse[i]} - ${course.name}`,
            type: assessmentTypesForCourse[i],
            maxMarks: getRandomNumber(50, 100),
            weightage: getRandomFloat(10, 30),
            isActive: true
          }
        });
        assessments.push(assessment);
      }
    }

    console.log(`Generated ${assessments.length} assessments`);

    // Generate Questions for each assessment
    console.log('Generating Questions...');
    const questions = [];
    
    for (const assessment of assessments) {
      const numQuestions = getRandomNumber(5, 10);
      const courseCos = cos.filter(co => co.courseId === assessment.courseId);
      
      for (let i = 1; i <= numQuestions; i++) {
        const question = await db.question.create({
          data: {
            assessmentId: assessment.id,
            question: `Question ${i}: ${getRandomItem([
              'Explain the concept of',
              'Analyze the relationship between',
              'Design a solution for',
              'Evaluate the effectiveness of',
              'Compare and contrast',
              'Apply the principles of',
              'Discuss the implications of',
              'Solve the following problem involving'
            ])} ${getRandomItem(courseCos)?.code || 'CO1'}.`,
            maxMarks: getRandomNumber(5, 20),
            isActive: true
          }
        });
        questions.push(question);

        // Create Question-CO mappings
        const numMappings = getRandomNumber(1, 2);
        const selectedCos = getRandomItems(courseCos, numMappings);
        
        for (const co of selectedCos) {
          await db.questionCOMapping.create({
            data: {
              questionId: question.id,
              coId: co.id,
              isActive: true
            }
          });
        }
      }
    }

    console.log(`Generated ${questions.length} questions`);

    // Generate CO-PO Mappings
    console.log('Generating CO-PO Mappings...');
    
    for (const course of courses) {
      const courseCos = cos.filter(co => co.courseId === course.id);
      const program = programs.find(p => p.id === course.batch.programId);
      const programPOs = pos.filter(po => po.programId === program?.id);
      
      for (const co of courseCos) {
        const numMappings = getRandomNumber(2, 4);
        const selectedPOs = getRandomItems(programPOs, numMappings);
        
        for (const po of selectedPOs) {
          await db.cOPOMapping.create({
            data: {
              coId: co.id,
              poId: po.id,
              courseId: course.id,
              level: getRandomNumber(1, 3),
              isActive: true
            }
          });
        }
      }
    }

    // Generate Enrollments
    console.log('Generating Enrollments...');
    const enrollments = [];
    
    for (const course of courses) {
      const batch = await db.batch.findUnique({ where: { id: course.batchId } });
      const batchStudents = students.filter(s => s.batchId === batch?.id);
      const numEnrollments = getRandomNumber(Math.floor(batchStudents.length * 0.8), batchStudents.length);
      const selectedStudents = getRandomItems(batchStudents, numEnrollments);
      
      for (const student of selectedStudents) {
        const enrollment = await db.enrollment.create({
          data: {
            courseId: course.id,
            studentId: student.id,
            isActive: true
          }
        });
        enrollments.push(enrollment);
      }
    }

    console.log(`Generated ${enrollments.length} enrollments`);

    // Generate Student Marks
    console.log('Generating Student Marks...');
    const marks = [];
    
    for (const enrollment of enrollments) {
      const courseAssessments = assessments.filter(a => a.courseId === enrollment.courseId);
      
      for (const assessment of courseAssessments) {
        const assessmentQuestions = questions.filter(q => q.assessmentId === assessment.id);
        
        for (const question of assessmentQuestions) {
          const marks = await db.studentMark.create({
            data: {
              questionId: question.id,
              studentId: enrollment.studentId,
              obtainedMarks: getRandomNumber(Math.floor(question.maxMarks * 0.3), question.maxMarks),
              maxMarks: question.maxMarks,
              academicYear: '2023-24'
            }
          });
        }
      }
    }

    console.log('Generated student marks');

    // Generate CO Attainment data
    console.log('Generating CO Attainment data...');
    
    for (const enrollment of enrollments) {
      const courseCos = cos.filter(co => co.courseId === enrollment.courseId);
      
      for (const co of courseCos) {
        // Calculate attainment based on student marks
        const coQuestionMappings = await db.questionCOMapping.findMany({
          where: { coId: co.id }
        });
        
        const coQuestionIds = coQuestionMappings.map(m => m.questionId);
        const coQuestions = questions.filter(q => coQuestionIds.includes(q.id));

        if (coQuestions.length > 0) {
          let totalObtained = 0;
          let totalMax = 0;

          for (const question of coQuestions) {
            const studentMark = await db.studentMark.findFirst({
              where: {
                questionId: question.id,
                studentId: enrollment.studentId
              }
            });

            if (studentMark) {
              totalObtained += studentMark.obtainedMarks;
              totalMax += studentMark.maxMarks;
            }
          }

          const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
          const course = courses.find(c => c.id === enrollment.courseId);
          const metTarget = percentage >= (course?.targetPercentage || 50);

          await db.cOAttainment.create({
            data: {
              courseId: enrollment.courseId,
              coId: co.id,
              studentId: enrollment.studentId,
              percentage: parseFloat(percentage.toFixed(2)),
              metTarget,
              academicYear: '2023-24'
            }
          });
        }
      }
    }

    console.log('Generated CO Attainment data');

    console.log('\n✅ Extensive mock data generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Students: ${students.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Course Outcomes: ${cos.length}`);
    console.log(`- Assessments: ${assessments.length}`);
    console.log(`- Questions: ${questions.length}`);
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- CO-PO Mappings: Generated`);
    console.log(`- Student Marks: Generated`);
    console.log(`- CO Attainments: Generated`);

    console.log('\n🔑 Student Login Credentials:');
    console.log('Username: STU000001 / Password: student123');
    console.log('Username: STU000002 / Password: student123');
    console.log('... (STU000001 to STU000200)');

  } catch (error) {
    console.error('Error generating mock data:', error);
  }
}

generateExtensiveMockData();