async function testLogin() {
  try {
    console.log('=== Testing Login ===');
    
    // Test login with program coordinator credentials
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
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
      
      // Now test auth/me
      const authResponse = await fetch('http://127.0.0.1:3000/api/auth/me', {
        credentials: 'include',
      });
      
      console.log('Auth/me status:', authResponse.status);
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('User data:', userData);
      } else {
        console.log('Auth/me failed:', await authResponse.text());
      }
    } else {
      console.log('Login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

testLogin();