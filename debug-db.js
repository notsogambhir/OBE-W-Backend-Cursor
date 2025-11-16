const { PrismaClient } = require('@prisma/client');

async function debugDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking database connection ===');
    
    // Check courses
    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`- ${course.code}: ${course.name} (${course.status})`);
    });
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.role} (${user.name})`);
    });
    
    // Check enrollments
    const enrollments = await prisma.enrollment.findMany();
    console.log(`\nFound ${enrollments.length} enrollments:`);
    enrollments.forEach(enrollment => {
      console.log(`- User ${enrollment.studentId} -> Course ${enrollment.courseId} (${enrollment.status})`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();