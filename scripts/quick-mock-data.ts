import { db } from '@/lib/db';

async function quickMockData() {
  try {
    console.log('Generating quick mock data...');

    const students = await db.user.findMany({ where: { role: 'STUDENT' }, take: 20 });
    const courses = await db.course.findMany({ take: 10 });
    const assessments = await db.assessment.findMany({ take: 20 });
    const questions = await db.question.findMany({ take: 50 });

    console.log(`Processing ${students.length} students, ${courses.length} courses`);

    // Generate enrollments for first 10 courses
    for (let i = 0; i < Math.min(10, courses.length); i++) {
      const course = courses[i];
      const batch = await db.batch.findUnique({ where: { id: course.batchId } });
      const batchStudents = students.filter(s => s.batchId === batch?.id);
      
      // Enroll first 5 students from each batch
      const selectedStudents = batchStudents.slice(0, 5);
      
      for (const student of selectedStudents) {
        try {
          await db.enrollment.create({
            data: {
              courseId: course.id,
              studentId: student.id,
              isActive: true
            }
          });
          console.log(`Enrolled ${student.name} in ${course.name}`);
        } catch (error) {
          continue;
        }
      }
    }

    // Generate marks for first 20 assessments
    const enrollments = await db.enrollment.findMany({ take: 30 });
    
    for (const enrollment of enrollments.slice(0, 20)) {
      const courseAssessments = assessments.filter(a => a.courseId === enrollment.courseId);
      
      for (const assessment of courseAssessments.slice(0, 2)) {
        const assessmentQuestions = questions.filter(q => q.assessmentId === assessment.id);
        
        for (const question of assessmentQuestions.slice(0, 3)) {
          const obtainedMarks = Math.floor(question.maxMarks * (0.5 + Math.random() * 0.4));
          
          try {
            await db.studentMark.create({
              data: {
                questionId: question.id,
                studentId: enrollment.studentId,
                obtainedMarks,
                maxMarks: question.maxMarks,
                academicYear: '2023-24'
              }
            });
          } catch (error) {
            continue;
          }
        }
      }
    }

    console.log('✅ Quick mock data generation completed!');

  } catch (error) {
    console.error('Error:', error);
  }
}

quickMockData();