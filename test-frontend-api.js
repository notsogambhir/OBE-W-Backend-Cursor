// Test script to simulate frontend API calls
async function testFrontendAPI() {
  try {
    console.log('=== Testing Frontend API Calls ===');
    
    // Test 1: Get courses without authentication
    console.log('\n1. Testing /api/courses without auth:');
    const coursesResponse = await fetch('http://127.0.0.1:3000/api/courses');
    console.log('Status:', coursesResponse.status);
    if (coursesResponse.ok) {
      const courses = await coursesResponse.json();
      console.log('Courses count:', courses.length);
      console.log('First course:', courses[0]?.code, courses[0]?.name);
    }
    
    // Test 2: Try to get user info without auth
    console.log('\n2. Testing /api/auth/me without auth:');
    const authResponse = await fetch('http://127.0.0.1:3000/api/auth/me', {
      credentials: 'include',
    });
    console.log('Status:', authResponse.status);
    const authText = await authResponse.text();
    console.log('Response:', authText);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFrontendAPI();