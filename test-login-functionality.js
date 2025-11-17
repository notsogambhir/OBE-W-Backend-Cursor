const axios = require('axios');

async function testLogin() {
  console.log('Testing login functionality...');
  
  try {
    // Test admin login
    console.log('\n1. Testing admin login...');
    const adminResponse = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'admin@obeportal.com',
      password: 'password123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('User:', adminResponse.data.user);
    console.log('Token received:', adminResponse.data.token ? 'Yes' : 'No');
    
    // Test teacher login with college
    console.log('\n2. Testing teacher login with college...');
    const collegesResponse = await axios.get('http://127.0.0.1:3000/api/colleges');
    const cuietCollege = collegesResponse.data.find(c => c.code === 'CUIET');
    
    if (cuietCollege) {
      const teacherResponse = await axios.post('http://127.0.0.1:3000/api/auth/login', {
        email: 'teacher1@obeportal.com',
        password: 'password123',
        collegeId: cuietCollege.id
      });
      
      console.log('✅ Teacher login successful!');
      console.log('User:', teacherResponse.data.user);
      console.log('Token received:', teacherResponse.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ CUIET college not found');
    }
    
    // Test invalid login
    console.log('\n3. Testing invalid login...');
    try {
      await axios.post('http://127.0.0.1:3000/api/auth/login', {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed');
    } catch (error) {
      console.log('✅ Invalid login correctly rejected');
    }
    
    console.log('\n🎉 All login tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

testLogin();