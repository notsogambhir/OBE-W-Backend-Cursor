import { db } from './src/lib/db';
import bcrypt from 'bcrypt';

async function createSampleData() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await db.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('Created admin user:', admin.email);
    
    // Create college
    const college = await db.college.create({
      data: {
        name: 'Sample College',
        code: 'SC001',
        description: 'Sample College for Testing'
      }
    });
    
    console.log('Created college:', college.name);
    
    // Create teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await db.user.create({
      data: {
        email: 'teacher@example.com',
        employeeId: 'EMP001',
        password: teacherPassword,
        name: 'Teacher User',
        role: 'TEACHER',
        collegeId: college.id,
        isActive: true
      }
    });
    
    console.log('Created teacher user:', teacher.email);
    
    // Create student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await db.user.create({
      data: {
        email: 'student@example.com',
        studentId: 'STU001',
        password: studentPassword,
        name: 'Student User',
        role: 'STUDENT',
        collegeId: college.id,
        isActive: true
      }
    });
    
    console.log('Created student user:', student.email);
    
    console.log('Sample data created successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Teacher: teacher@example.com / teacher123');
    console.log('Student: student@example.com / student123');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

createSampleData();