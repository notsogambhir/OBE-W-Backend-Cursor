'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  batchId?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  status: string;
  batchId: string;
  batch: {
    id: string;
    name: string;
  };
}

export default function DebugPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          console.log('User data:', userData);
        } else {
          console.error('Failed to fetch user:', await userResponse.text());
        }

        // Fetch all courses
        const allCoursesResponse = await fetch('/api/courses');
        if (allCoursesResponse.ok) {
          const coursesData = await allCoursesResponse.json();
          setAllCourses(coursesData);
          console.log('All courses:', coursesData.length);
        }

        // Fetch filtered courses (if user has batchId)
        const filteredResponse = await fetch('/api/courses?batchId=cmhafms41000fnfuy4ojp0re5');
        if (filteredResponse.ok) {
          const filteredData = await filteredResponse.json();
          setFilteredCourses(filteredData);
          console.log('Filtered courses:', filteredData.length);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        {user ? (
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Course Statistics</h2>
        <p>All Courses: {allCourses.length}</p>
        <p>Filtered Courses: {filteredCourses.length}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Courses (First 5)</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-64 overflow-auto">
          {JSON.stringify(allCourses.slice(0, 5), null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Batch IDs in Courses</h2>
        <ul className="list-disc pl-6">
          {Array.from(new Set(allCourses.map(c => c.batchId))).map(batchId => (
            <li key={batchId}>{batchId}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}