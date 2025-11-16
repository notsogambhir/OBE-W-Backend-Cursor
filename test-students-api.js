async function testStudentsAPI() {
  try {
    // First login to get the cookie
    console.log('🔐 Logging in as teacher...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher1@obeportal.com',
        password: 'teacher123',
        collegeId: 'cmi0lak7w0000ooorxsklihn5'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      return;
    }

    // Extract cookie from response headers
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error('❌ No cookie received');
      return;
    }

    console.log('🍪 Received cookie:', setCookieHeader);

    // Extract just the cookie value
    const cookieMatch = setCookieHeader.match(/auth-token=([^;]+)/);
    if (!cookieMatch) {
      console.error('❌ Could not extract cookie value');
      return;
    }

    const cookieValue = cookieMatch[1];
    console.log('🔑 Cookie value:', cookieValue);

    // Now test the students API with the cookie
    console.log('📚 Testing students API...');
    const studentsResponse = await fetch('http://localhost:3000/api/students', {
      headers: {
        'Cookie': 'auth-token=' + cookieValue
      }
    });

    if (studentsResponse.ok) {
      const students = await studentsResponse.json();
      console.log('✅ Students API Response:');
      console.log('Total students:', students.length);
      
      if (students.length > 0) {
        console.log('📋 First 3 students:');
        students.slice(0, 3).forEach((student, index) => {
          console.log((index + 1) + '. ' + student.studentId + ': ' + student.name + ' (' + student.email + ')');
        });
      } else {
        console.log('📭 No students found');
      }
    } else {
      console.error('❌ Students API failed:', studentsResponse.status);
      const errorText = await studentsResponse.text();
      console.error('Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentsAPI();
