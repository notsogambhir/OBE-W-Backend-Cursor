// Test script for batch and course management APIs
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('=== Testing Batch and Course Management APIs ===\n');

  try {
    // Test 1: Get all batches
    console.log('1. Testing GET /api/batches');
    const batchesResponse = await fetch(`${BASE_URL}/api/batches`);
    const batches = await batchesResponse.json();
    console.log('Status:', batchesResponse.status);
    console.log('Batches:', JSON.stringify(batches, null, 2));
    console.log('');

    // Test 2: Get all programs
    console.log('2. Testing GET /api/programs');
    const programsResponse = await fetch(`${BASE_URL}/api/programs`);
    const programs = await programsResponse.json();
    console.log('Status:', programsResponse.status);
    console.log('Programs:', JSON.stringify(programs, null, 2));
    console.log('');

    // Test 3: Get all courses
    console.log('3. Testing GET /api/courses');
    const coursesResponse = await fetch(`${BASE_URL}/api/courses`);
    const courses = await coursesResponse.json();
    console.log('Status:', coursesResponse.status);
    console.log('Courses:', JSON.stringify(courses, null, 2));
    console.log('');

    // Test 4: Get courses for a specific batch (if batches exist)
    if (batches.length > 0) {
      console.log('4. Testing GET /api/courses?batchId=' + batches[0].id);
      const batchCoursesResponse = await fetch(`${BASE_URL}/api/courses?batchId=${batches[0].id}`);
      const batchCourses = await batchCoursesResponse.json();
      console.log('Status:', batchCoursesResponse.status);
      console.log('Batch Courses:', JSON.stringify(batchCourses, null, 2));
      console.log('');
    }

    console.log('=== API Tests Completed ===');

  } catch (error) {
    console.error('Error testing APIs:', error.message);
  }
}

// Run the tests
testAPIs();