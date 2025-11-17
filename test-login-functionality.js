// Test login functionality
async function testLogin() {
  try {
    console.log('=== Testing Login API ===');
    
    // Test admin login (no college required)
    console.log('\n1. Testing Admin login...');
    const adminResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@obeportal.com',
        password: 'password123'
      }),
    });
    
    console.log('Admin login status:', adminResponse.status);
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('Admin login successful:', adminData.user.name, adminData.user.role);
    } else {
      const adminError = await adminResponse.json();
      console.error('Admin login failed:', adminError.error);
    }

    // Test university login (no college required)
    console.log('\n2. Testing University login...');
    const universityResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'university@obeportal.com',
        password: 'password123'
      }),
    });
    
    console.log('University login status:', universityResponse.status);
    if (universityResponse.ok) {
      const universityData = await universityResponse.json();
      console.log('University login successful:', universityData.user.name, universityData.user.role);
    } else {
      const universityError = await universityResponse.json();
      console.error('University login failed:', universityError.error);
    }

    // Test department head login (college required)
    console.log('\n3. Testing Department Head login...');
    const deptResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cse@obeportal.com',
        password: 'password123',
        collegeId: 'cmi2nu8gj0000ppy8892ddw5n' // CUIET college ID
      }),
    });
    
    console.log('Department Head login status:', deptResponse.status);
    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      console.log('Department Head login successful:', deptData.user.name, deptData.user.role);
    } else {
      const deptError = await deptResponse.json();
      console.error('Department Head login failed:', deptError.error);
    }

    // Test teacher login (college required)
    console.log('\n4. Testing Teacher login...');
    const teacherResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher1@obeportal.com',
        password: 'password123',
        collegeId: 'cmi2nu8gj0000ppy8892ddw5n' // CUIET college ID
      }),
    });
    
    console.log('Teacher login status:', teacherResponse.status);
    if (teacherResponse.ok) {
      const teacherData = await teacherResponse.json();
      console.log('Teacher login successful:', teacherData.user.name, teacherData.user.role);
    } else {
      const teacherError = await teacherResponse.json();
      console.error('Teacher login failed:', teacherError.error);
    }

    console.log('\n=== Login testing completed ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLogin();