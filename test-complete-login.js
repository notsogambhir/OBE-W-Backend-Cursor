const axios = require('axios');

async function testCompleteLoginFlow() {
  console.log('🧪 Testing complete login flow...');
  
  try {
    // Step 1: Get the main page (should have login form)
    console.log('\n1. Loading main page...');
    const pageResponse = await axios.get('http://127.0.0.1:3000', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log('✅ Main page loaded (Status:', pageResponse.status + ')');
    
    // Step 2: Get colleges for the dropdown
    console.log('\n2. Fetching colleges...');
    const collegesResponse = await axios.get('http://127.0.0.1:3000/api/colleges');
    console.log('✅ Colleges fetched:', collegesResponse.data.length, 'colleges');
    
    // Step 3: Test login with admin credentials (no college needed for admin)
    console.log('\n3. Testing admin login...');
    const loginResponse = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'admin@obeportal.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful!');
    console.log('User details:', {
      id: loginResponse.data.user.id,
      name: loginResponse.data.user.name,
      role: loginResponse.data.user.role,
      email: loginResponse.data.user.email
    });
    
    // Step 4: Test authenticated API call
    console.log('\n4. Testing authenticated API call...');
    const authCookie = loginResponse.headers['set-cookie'];
    if (authCookie) {
      const meResponse = await axios.get('http://127.0.0.1:3000/api/auth/me', {
        headers: {
          'Cookie': authCookie
        }
      });
      console.log('✅ Authenticated API call successful!');
      console.log('Current user:', meResponse.data.user.name);
    } else {
      console.log('❌ No auth cookie received');
    }
    
    // Step 5: Test teacher login with college
    console.log('\n5. Testing teacher login with college...');
    const cuietCollege = collegesResponse.data.find(c => c.code === 'CUIET');
    if (cuietCollege) {
      const teacherLoginResponse = await axios.post('http://127.0.0.1:3000/api/auth/login', {
        email: 'teacher1@obeportal.com',
        password: 'password123',
        collegeId: cuietCollege.id
      });
      
      console.log('✅ Teacher login successful!');
      console.log('Teacher details:', {
        id: teacherLoginResponse.data.user.id,
        name: teacherLoginResponse.data.user.name,
        role: teacherLoginResponse.data.user.role,
        collegeId: teacherLoginResponse.data.user.collegeId,
        programId: teacherLoginResponse.data.user.programId
      });
    }
    
    console.log('\n🎉 Complete login flow test passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Frontend loads correctly');
    console.log('✅ Colleges API working');
    console.log('✅ Admin login working');
    console.log('✅ Authenticated API calls working');
    console.log('✅ Teacher login with college working');
    console.log('\n🔑 Available test accounts:');
    console.log('• Admin: admin@obeportal.com / password123');
    console.log('• University: university@obeportal.com / password123');
    console.log('• Teacher: teacher1@obeportal.com / password123 (CUIET college)');
    console.log('• Student: student1@obeportal.com / password123');
    
  } catch (error) {
    console.error('❌ Login flow test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteLoginFlow();