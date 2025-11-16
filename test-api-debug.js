// Test the courses API
const testCoursesAPI = async () => {
  try {
    // Test with batchId (from logs)
    const batchId = 'cmhka3v7s000qnh1gb9jnecdt';
    console.log(`Testing /api/courses?batchId=${batchId}`);
    
    const response = await fetch(`http://localhost:3000/api/courses?batchId=${batchId}`, {
      headers: {
        'Cookie': 'auth-token=your-auth-token-here' // You'll need to use actual auth
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

// This won't work without proper auth, but let's check the server logs
console.log('API Test script ready - need proper authentication');