async function testLogin() {
  try {
    console.log('=== Testing Login API ===');
    
    // First get colleges
    console.log('\n1. Getting colleges...');
    const collegesResponse = await fetch('http://127.0.0.1:3000/api/colleges');
    if (collegesResponse.ok) {
      const colleges = await collegesResponse.json();
      console.log('✅ Colleges fetched:', colleges.length);
      console.log('First college:', colleges[0]?.name, colleges[0]?.code);
    } else {
      console.log('❌ Failed to fetch colleges:', collegesResponse.status);
      return;
    }
    
    // Test login with admin (no college required)
    console.log('\n2. Testing admin login...');
    const adminLoginResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@obeportal.com',
        password: 'password123'
      }),
      credentials: 'include',
    });
    
    if (adminLoginResponse.ok) {
      const adminData = await adminLoginResponse.json();
      console.log('✅ Admin login successful');
      console.log('User:', adminData.user.email, adminData.user.role);
    } else {
      console.log('❌ Admin login failed:', await adminLoginResponse.text());
    }
    
    // Test login with program coordinator (requires college)
    console.log('\n3. Testing program coordinator login...');
    const pcLoginResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'emily.martinez@pc.com',
        password: 'password123',
        collegeId: 'cmhafms3q0000nfuyynq342xh' // IOT college
      }),
      credentials: 'include',
    });
    
    if (pcLoginResponse.ok) {
      const pcData = await pcLoginResponse.json();
      console.log('✅ Program coordinator login successful');
      console.log('User:', pcData.user.email, pcData.user.role);
    } else {
      console.log('❌ Program coordinator login failed:', await pcLoginResponse.text());
    }
    
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

testLogin();