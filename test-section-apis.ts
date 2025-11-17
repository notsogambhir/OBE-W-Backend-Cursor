import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:3000/api';

async function testSectionAPIs() {
  console.log('Testing Section APIs...\n');

  try {
    // First login as Department Head to get auth token
    console.log('1. Logging in as Department Head...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dept.head@test.com',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log('✅ Login successful');

    // Get batch info
    console.log('\n2. Fetching batches...');
    const batchesResponse = await fetch(`${API_BASE}/batches?programId=`, {
      headers: { 'Cookie': `auth-token=${authToken}` }
    });
    
    if (batchesResponse.ok) {
      const batches = await batchesResponse.json();
      console.log('✅ Batches fetched:', batches.length);
      const testBatch = batches.find(b => b.name === '2025-2029');
      if (testBatch) {
        console.log(`Using batch: ${testBatch.name} (ID: ${testBatch.id})`);
        
        // Test fetching sections for the batch
        console.log('\n3. Fetching sections for batch...');
        const sectionsResponse = await fetch(`${API_BASE}/sections?batchId=${testBatch.id}`, {
          headers: { 'Cookie': `auth-token=${authToken}` }
        });
        
        if (sectionsResponse.ok) {
          const sections = await sectionsResponse.json();
          console.log('✅ Sections fetched:', sections.length);
          sections.forEach(s => {
            console.log(`  - Section ${s.name}: ${s._count?.students || 0} students`);
          });
        } else {
          console.error('❌ Failed to fetch sections:', sectionsResponse.status);
        }

        // Test creating a new section
        console.log('\n4. Creating a new section...');
        const createResponse = await fetch(`${API_BASE}/sections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
          },
          body: JSON.stringify({
            name: 'C',
            batchId: testBatch.id
          })
        });
        
        if (createResponse.ok) {
          const newSection = await createResponse.json();
          console.log('✅ Section created successfully:', newSection.name);
          
          // Test deleting the section
          console.log('\n5. Deleting section...');
          const deleteResponse = await fetch(`${API_BASE}/sections/${newSection.id}`, {
            method: 'DELETE',
            headers: { 'Cookie': `auth-token=${authToken}` }
          });
          
          if (deleteResponse.ok) {
            console.log('✅ Section deleted successfully');
          } else {
            const error = await deleteResponse.json();
            console.error('❌ Failed to delete section:', error.error);
          }
        } else {
          const error = await createResponse.json();
          console.error('❌ Failed to create section:', error.error);
        }
      }
    }

    // Test student section assignment
    console.log('\n6. Testing student section assignment...');
    const studentsResponse = await fetch(`${API_BASE}/students?batchId=`, {
      headers: { 'Cookie': `auth-token=${authToken}` }
    });
    
    if (studentsResponse.ok) {
      const students = await studentsResponse.json();
      const testStudent = students.find(s => s.email === 'student1@test.com');
      if (testStudent && sections.length > 0) {
        console.log(`Testing with student: ${testStudent.name}`);
        
        // Get section A
        const sectionA = sections.find(s => s.name === 'A');
        if (sectionA) {
          // Assign student to section A
          const assignResponse = await fetch(`${API_BASE}/students/${testStudent.id}/section`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `auth-token=${authToken}`
            },
            body: JSON.stringify({
              sectionId: sectionA.id
            })
          });
          
          if (assignResponse.ok) {
            console.log('✅ Student assigned to section successfully');
          } else {
            console.error('❌ Failed to assign student to section:', assignResponse.status);
          }
        }
      }
    }

    console.log('\n✅ Section API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSectionAPIs();