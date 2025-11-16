// Test script to check CO-PO mapping APIs
async function testAPIs() {
  const courseId = 'cmhkpjvcx0005m5dwb75dn7cw'; // Use first course ID
  
  console.log('=== Testing APIs for course:', courseId, '===');
  
  try {
    // Test 1: Get course details
    console.log('\n1. Testing course details API...');
    const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    if (courseResponse.ok) {
      const courseData = await courseResponse.json();
      console.log('✓ Course details fetched');
      console.log('  Course:', courseData.code, courseData.name);
      console.log('  Batch:', courseData.batch?.name);
      console.log('  Program ID:', courseData.batch?.programId);
    } else {
      console.log('✗ Failed to fetch course details:', courseResponse.status);
    }

    // Test 2: Get COs
    console.log('\n2. Testing COs API...');
    const cosResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/cos`);
    if (cosResponse.ok) {
      const cosData = await cosResponse.json();
      console.log('✓ COs fetched:', cosData.length);
      cosData.forEach(co => console.log(`  - ${co.code}: ${co.description}`));
    } else {
      console.log('✗ Failed to fetch COs:', cosResponse.status);
    }

    // Test 3: Get POs (need program ID first)
    console.log('\n3. Testing POs API...');
    const courseResponse2 = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    if (courseResponse2.ok) {
      const courseData = await courseResponse2.json();
      const programId = courseData.batch?.programId;
      
      if (programId) {
        const posResponse = await fetch(`http://localhost:3000/api/pos?programId=${programId}`);
        if (posResponse.ok) {
          const posData = await posResponse.json();
          console.log('✓ POs fetched:', posData.length);
          posData.forEach(po => console.log(`  - ${po.code}: ${po.description.substring(0, 50)}...`));
        } else {
          console.log('✗ Failed to fetch POs:', posResponse.status);
        }
      } else {
        console.log('✗ No program ID found');
      }
    }

    // Test 4: Get CO-PO mappings
    console.log('\n4. Testing CO-PO mappings API...');
    const mappingsResponse = await fetch(`http://localhost:3000/api/co-po-mappings?courseId=${courseId}`);
    if (mappingsResponse.ok) {
      const mappingsData = await mappingsResponse.json();
      console.log('✓ Mappings fetched:', mappingsData.length);
      mappingsData.forEach(mapping => console.log(`  - ${mapping.co?.code} -> ${mapping.po?.code} (Level ${mapping.level})`));
    } else {
      console.log('✗ Failed to fetch mappings:', mappingsResponse.status);
    }

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

testAPIs();