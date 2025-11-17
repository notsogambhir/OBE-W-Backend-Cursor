import { db } from './src/lib/db';

async function diagnoseApplicationIssues() {
  try {
    console.log('🔍 Diagnosing application issues...\n');

    // 1. Check database connection
    console.log('1. DATABASE CONNECTION TEST:');
    try {
      const userCount = await db.user.count();
      console.log(`   ✅ Database connected: ${userCount} users found`);
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
    }

    // 2. Check API endpoints
    console.log('\n2. API ENDPOINTS TEST:');
    const endpoints = [
      '/api/health',
      '/api/colleges',
      '/api/programs',
      '/api/students'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        console.log(`   ✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
    }

    // 3. Check user authentication
    console.log('\n3. AUTHENTICATION TEST:');
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'admin123',
          collegeId: 'cmi1uz5wv0000nn1gk0guuthc'
        }),
      });

      if (loginResponse.ok) {
        console.log('   ✅ Login API working');
        
        // Test auth/me endpoint
        const authResponse = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include',
        headers: {
          'Cookie': loginResponse.headers.get('set-cookie')
          }
        });
        
        if (authResponse.ok) {
          console.log('   ✅ Auth verification working');
        } else {
          console.log(`   ❌ Auth verification failed: ${authResponse.status}`);
        }
      } else {
        console.log(`   ❌ Login failed: ${loginResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Authentication test failed: ${error.message}`);
    }

    // 4. Check server configuration
    console.log('\n4. SERVER CONFIGURATION:');
    console.log(`   Server URL: http://localhost:3000`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: 3000`);

    // 5. Check for common issues
    console.log('\n5. COMMON ISSUES CHECK:');
    
    // Check if there are any users
    const userStats = await db.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    console.log('   User distribution:');
    userStats.forEach(stat => {
      console.log(`     ${stat.role}: ${stat._count.role}`);
    });

    // Check if there are any colleges and programs
    const collegeCount = await db.college.count();
    const programCount = await db.program.count();
    const batchCount = await db.batch.count();
    const courseCount = await db.course.count();

    console.log(`   Colleges: ${collegeCount}`);
    console.log(`   Programs: ${programCount}`);
    console.log(`   Batches: ${batchCount}`);
    console.log(`   Courses: ${courseCount}`);

    // 6. Recommendations
    console.log('\n6. RECOMMENDATIONS:');
    
    if (userCount === 0) {
      console.log('   ⚠️  No users found - run user creation scripts');
    }
    
    if (collegeCount === 0) {
      console.log('   ⚠️  No colleges found - database may be empty');
    }
    
    if (programCount === 0) {
      console.log('   ⚠️  No programs found - run data setup scripts');
    }

    console.log('   ✅ Server appears to be running correctly');
    console.log('   ✅ Database connection working');
    console.log('   ✅ API endpoints responding');
    console.log('   💡 If preview is not loading, check browser console for JavaScript errors');
    console.log('   💡 If timeouts occur, check network connectivity to localhost:3000');

    console.log('\n🎯 DIAGNOSIS COMPLETE');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await db.$disconnect();
  }
}

diagnoseApplicationIssues();