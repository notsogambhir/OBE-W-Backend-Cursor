'use client';

import { useAuth } from '@/hooks/use-auth';
import { StudentManagementProgramCoordinator } from '@/components/student-management-program-coordinator';
import { StudentManagementTeacher } from '@/components/student-management-teacher';
import { StudentManagementAdmin } from '@/components/student-management-admin';

export default function StudentsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Use different components based on user role
  switch (user.role) {
    case 'ADMIN':
    case 'UNIVERSITY':
      // Admin and University users can view and manage all students across all colleges
      return (
        <div className="p-6">
          <StudentManagementAdmin user={user} />
        </div>
      );
    case 'DEPARTMENT':
      // Department users can view and manage students from their college
      return (
        <div className="p-6">
          <StudentManagementAdmin user={user} />
        </div>
      );
    case 'PROGRAM_COORDINATOR':
      return (
        <div className="p-6">
          <StudentManagementProgramCoordinator user={user} />
        </div>
      );
    case 'TEACHER':
      return (
        <div className="p-6">
          <StudentManagementTeacher user={user} />
        </div>
      );
    default:
      return (
        <div className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Student management is available for authorized personnel only.</p>
          </div>
        </div>
      );
  }
}