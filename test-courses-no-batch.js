async function testCoursesNoBatch() {
  try {
    console.log('=== Testing courses API without batchId ===');
    
    const response = await fetch('http://127.0.0.1:3000/api/courses');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Total courses returned:', data.length);
    console.log('First course batchId:', data[0]?.batchId);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCoursesNoBatch();