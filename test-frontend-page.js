const axios = require('axios');

async function testFrontendPage() {
  console.log('Testing frontend page load...');
  
  try {
    // Test main page
    console.log('\n1. Testing main page...');
    const pageResponse = await axios.get('http://127.0.0.1:3000');
    console.log('✅ Main page loaded successfully!');
    console.log('Status:', pageResponse.status);
    console.log('Content type:', pageResponse.headers['content-type']);
    
    // Check if page contains login form content
    const content = pageResponse.data;
    if (content.includes('OBE Portal') && content.includes('Faculty & Management Portal')) {
      console.log('✅ Login form content found in page!');
    } else {
      console.log('❌ Login form content not found');
    }
    
    console.log('\n🎉 Frontend page test completed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend page test failed:', error.response?.status || error.message);
  }
}

testFrontendPage();