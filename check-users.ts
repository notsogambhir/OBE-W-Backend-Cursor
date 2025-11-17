import { db } from './src/lib/db';

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        employeeId: true,
        collegeId: true,
        programId: true,
        batchId: true,
        sectionId: true,
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`📊 Found ${users.length} users:`);
    
    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`\n👥 ${role} (${roleUsers.length}):`);
      roleUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) ${user.studentId ? `[${user.studentId}]` : user.employeeId ? `[${user.employeeId}]` : ''}`);
      });
    });

    // Check for sections
    const sections = await db.section.findMany({
      select: {
        id: true,
        name: true,
        batchId: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      take: 10
    });

    console.log(`\n🏫 Found ${sections.length} sections (showing first 10):`);
    sections.forEach(section => {
      console.log(`  - Section ${section.name} (${section._count?.students || 0} students)`);
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUsers();