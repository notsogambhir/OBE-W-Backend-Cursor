async function testAuthFix() {
  try {
    console.log('=== Testing Auth Fix ===');
    
    // Test 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'emily.martinez@pc.com',
        password: 'password123'
      }),
      credentials: 'include',
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('User:', loginData.user.email, loginData.user.role);
      
      // Test 2: Check auth
      console.log('\n2. Testing /api/auth/me...');
      const authResponse = await fetch('http://127.0.0.1:3000/api/auth/me', {
        credentials: 'include',
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ Auth check successful');
        console.log('User data:', authData.user.email, authData.user.role);
        
        // Test 3: Get courses
        console.log('\n3. Testing /api/courses...');
        const coursesResponse = await fetch('http://127.0.0.1:3000/api/courses', {
          credentials: 'include',
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log('✅ Courses fetch successful');
          console.log('Total courses:', coursesData.length);
          
          // Show first course
          if (coursesData.length > 0) {
            const firstCourse = coursesData[0];
            console.log('First course:', firstCourse.code, '-', firstCourse.name, '(' + firstCourse.status + ')');
          }
        } else {
          console.log('❌ Courses fetch failed:', coursesResponse.status);
        }
      } else {
        console.log('❌ Auth check failed:', authResponse.status, await authResponse.text());
      }
    } else {
      console.log('❌ Login failed:', loginResponse.status, await loginResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuthFix();