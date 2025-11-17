// Test frontend access
async function testFrontend() {
  try {
    console.log('=== Testing Frontend Access ===');
    
    // Test main page
    console.log('\n1. Testing main page access...');
    const mainPageResponse = await fetch('http://127.0.0.1:3000/');
    console.log('Main page status:', mainPageResponse.status);
    
    if (mainPageResponse.ok) {
      const html = await mainPageResponse.text();
      console.log('Main page loaded successfully, length:', html.length);
      if (html.includes('OBE Management Portal')) {
        console.log('✓ Main page contains expected content');
      } else {
        console.log('⚠ Main page may not contain expected content');
      }
    } else {
      console.error('Main page failed to load');
    }

    // Test colleges API (needed for login form)
    console.log('\n2. Testing colleges API...');
    const collegesResponse = await fetch('http://127.0.0.1:3000/api/colleges');
    console.log('Colleges API status:', collegesResponse.status);
    
    if (collegesResponse.ok) {
      const colleges = await collegesResponse.json();
      console.log('✓ Colleges API working, found', colleges.length, 'colleges');
      console.log('Colleges:', colleges.map(c => c.name));
    } else {
      console.error('Colleges API failed');
    }

    // Test auth/me API (should return 401 when not logged in)
    console.log('\n3. Testing auth/me API (unauthenticated)...');
    const authMeResponse = await fetch('http://127.0.0.1:3000/api/auth/me', {
      credentials: 'include'
    });
    console.log('Auth/me API status:', authMeResponse.status);
    
    if (authMeResponse.status === 401) {
      console.log('✓ Auth/me API correctly returns 401 for unauthenticated requests');
    } else {
      console.log('⚠ Auth/me API unexpected response:', authMeResponse.status);
    }

    console.log('\n=== Frontend testing completed ===');
  } catch (error) {
    console.error('Frontend test failed:', error);
  }
}

testFrontend();