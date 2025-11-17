// Test login functionality comprehensively
const test = async () => {
  const baseUrl = 'http://127.0.0.1:3000';
  
  console.log('=== COMPREHENSIVE LOGIN TEST ===');
  
  try {
    // Test 1: Admin login (should work without college)
    console.log('\n1. Testing Admin login...');
    const adminResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@obeportal.com',
        password: 'password123'
      })
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin login successful:', adminData.user.role);
      
      // Test auth verification
      const verifyResponse = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 
          'Cookie': `auth-token=${adminData.token}` 
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Admin auth verification successful:', verifyData.user.role);
      } else {
        console.log('❌ Admin auth verification failed');
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
    // Test 2: Teacher login (should require college)
    console.log('\n2. Testing Teacher login...');
    const teacherResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@obeportal.com',
        password: 'password123',
        collegeId: 'cmi2o9fyi0000ksbko24ctuew'
      })
    });
    
    if (teacherResponse.ok) {
      const teacherData = await teacherResponse.json();
      console.log('✅ Teacher login successful:', teacherData.user.role);
    } else {
      console.log('❌ Teacher login failed');
    }
    
    // Test 3: Student login
    console.log('\n3. Testing Student login...');
    const studentResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@obeportal.com',
        password: 'password123',
        collegeId: 'cmi2o9fyi0000ksbko24ctuew'
      })
    });
    
    if (studentResponse.ok) {
      const studentData = await studentResponse.json();
      console.log('✅ Student login successful:', studentData.user.role);
    } else {
      console.log('❌ Student login failed');
    }
    
    // Test 4: Invalid login
    console.log('\n4. Testing invalid login...');
    const invalidResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
    });
    
    if (invalidResponse.status === 401) {
      console.log('✅ Invalid login properly rejected');
    } else {
      console.log('❌ Invalid login not properly handled');
    }
    
    // Test 5: Colleges API
    console.log('\n5. Testing Colleges API...');
    const collegesResponse = await fetch(`${baseUrl}/api/colleges`);
    if (collegesResponse.ok) {
      const colleges = await collegesResponse.json();
      console.log('✅ Colleges API working, found', colleges.length, 'colleges');
    } else {
      console.log('❌ Colleges API failed');
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};

test();