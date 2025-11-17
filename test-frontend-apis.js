const axios = require('axios');

async function testFrontendAPIs() {
  console.log('Testing frontend APIs...');
  
  try {
    // Test colleges API
    console.log('\n1. Testing colleges API...');
    const collegesResponse = await axios.get('http://127.0.0.1:3000/api/colleges');
    console.log('✅ Colleges API working!');
    console.log('Colleges:', collegesResponse.data.map(c => ({ id: c.id, name: c.name, code: c.code })));
    
    // Test batches API
    console.log('\n2. Testing batches API...');
    const batchesResponse = await axios.get('http://127.0.0.1:3000/api/batches');
    console.log('✅ Batches API working!');
    console.log('Batches:', batchesResponse.data.length, 'batches found');
    
    // Test programs API
    console.log('\n3. Testing programs API...');
    const programsResponse = await axios.get('http://127.0.0.1:3000/api/programs');
    console.log('✅ Programs API working!');
    console.log('Programs:', programsResponse.data.length, 'programs found');
    
    // Test health API
    console.log('\n4. Testing health API...');
    const healthResponse = await axios.get('http://127.0.0.1:3000/api/health');
    console.log('✅ Health API working!');
    console.log('Health status:', healthResponse.data);
    
    console.log('\n🎉 All frontend API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error.response?.data || error.message);
  }
}

testFrontendAPIs();