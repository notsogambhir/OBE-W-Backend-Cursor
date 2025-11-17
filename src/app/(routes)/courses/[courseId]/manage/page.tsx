'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  BarChart3, 
  Users, 
  FileText,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { courseEvents } from '@/lib/course-events';
import { OverviewTab } from '@/components/course/tabs/overview-tab';
import { COsTab } from '@/components/course/tabs/cos-tab';
import { AssessmentsTab } from '@/components/course/tabs/assessments-tab-new';
import { COPOMappingTab } from '@/components/course/tabs/co-po-mapping-tab';
import { COAttainmentsTab } from '@/components/course/tabs/co-attainments-tab';
import { StudentReportsTab } from '@/components/course/tabs/student-reports-tab';
import { TeacherAssignment } from '@/components/teacher-assignment';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  description?: string;
  status: string;
  programName: string;
  batchName: string;
  stats: {
    students: number;
    assessments: number;
    cos: number;
  };
  courseOutcomes: any[];
  assessments: any[];
  enrollments: any[];
}

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user from localStorage or context
    const storedUser = localStorage.getItem('obe-user');
    console.log('Stored user from localStorage:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    console.log('About to fetch course with courseId:', courseId);
    fetchCourse();
    
    // Listen for CO updates to refresh course data
    const handleCOUpdate = () => {
      console.log('CO update event triggered, refetching course');
      fetchCourse();
    };
    
    courseEvents.on('co-updated', handleCOUpdate);
    
    return () => {
      courseEvents.off('co-updated', handleCOUpdate);
    };
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      console.log('Fetching course with courseId:', courseId);
      const response = await fetch(`/api/courses/${courseId}`);
      console.log('Course fetch response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch course:', response.status, response.statusText);
        throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
      }
      
      const courseData = await response.json();
      console.log('Course data received:', courseData);
      setCourse(courseData);
    } catch (error) {
      console.error('Error in fetchCourse:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
        <p className="text-sm text-gray-500 mt-4">Course ID: {courseId}</p>
        <Link href="/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  // Add user permission check
  const hasCourseAccess = () => {
    if (!user || !course) return false;
    
    // Check permissions based on user role
    switch (user.role) {
      case 'ADMIN':
      case 'UNIVERSITY':
        return true;
      case 'PROGRAM_COORDINATOR':
        return course.batch.programId === user.programId;
      case 'DEPARTMENT':
        return course.batch.program.collegeId === user.collegeId;
      case 'TEACHER':
        return course.batchId === user.batchId; // Teachers can access courses in their batch
      default:
        return false;
    }
  };

  const getAccessRequirement = (user: any, course: any) => {
    if (!user || !course) return 'Authentication required';
    
    switch (user.role) {
      case 'ADMIN':
      case 'UNIVERSITY':
        return 'Full access granted';
      case 'PROGRAM_COORDINATOR':
        return course.batch.programId === user.programId 
          ? 'Program Coordinator access granted' 
          : `You can only access courses from your assigned program (${course?.batch?.program?.name || 'Unknown'})`;
      case 'DEPARTMENT':
        return course.batch.program.collegeId === user.collegeId 
          ? 'Department access granted' 
          : `You can only access courses from your college (${course?.batch?.program?.collegeId || 'Unknown'})`;
      case 'TEACHER':
        return course.batchId === user.batchId 
          ? 'Teacher access granted' 
          : `You can only access courses from your batch (${course?.batch?.name || 'Unknown'})`;
      default:
        return 'Limited access';
    }
  };

  if (!hasCourseAccess()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access this course.</p>
        <div className="mt-4 p-4 bg-red-50 border-red-200 rounded-lg">
          <p className="font-medium">Access Details:</p>
          <p><strong>Your Role:</strong> {user?.role || 'Unknown'}</p>
          <p><strong>Required Access:</strong> {getAccessRequirement(user, course)}</p>
          <p><strong>Course:</strong> {course?.name || 'Unknown'} ({course?.code || 'Unknown'})</p>
        </div>
        <Link href="/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>{course.code}</span>
              <span>•</span>
              <span>{course.semester} Semester</span>
              <Badge variant="outline" className="text-xs">{course.programName}</Badge>
              <Badge variant="secondary" className="text-xs">{course.batchName}</Badge>
              <Badge 
                variant={course.status === 'ACTIVE' ? 'default' : course.status === 'COMPLETED' ? 'secondary' : 'outline'} 
                className="text-xs"
              >
                {course.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{course.stats.students}</div>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-lg font-semibold">{course.stats.assessments}</div>
                <p className="text-xs text-gray-500">Assessments</p>
              </div>
            </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-lg font-semibold">[85%]</div>
                <p className="text-xs text-gray-500">Attainment</p>
              </div>
            </CardContent>
        </Card>
      </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-lg font-semibold">[85%]</div>
                <p className="text-xs text-gray-500">Attainment</p>
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cos" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            COs
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="co-po-mapping" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            CO-PO Mapping
          </TabsTrigger>
          <TabsTrigger value="co-attainments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            CO Attainments
          </TabsTrigger>
          <TabsTrigger value="student-reports" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Reports
          </TabsTrigger>
          {user && ['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR'].includes(user.role) && (
            <TabsTrigger value="teacher-assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Faculty Assignment
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab courseId={courseId} courseData={course} />
        </TabsContent>
        <TabsContent value="cos">
          <COsTab courseId={courseId} courseData={course} />
        </TabsContent>
        <TabsContent value="assessments">
          <AssessmentsTab courseId={courseId} courseData={course} />
        </TabsContent>
        <TabsContent value="co-po-mapping">
          <COPOMappingTab courseId={courseId} courseData={course} />
        </TabsContent>
        <TabsContent value="co-attainments">
          <COAttainmentsTab courseId={courseId} courseData={course} />
        </TabsContent>
        <TabsContent value="student-reports">
          <StudentReportsTab courseId={courseId} courseData={course} />
        </TabsContent>
        
        {user && ['ADMIN', 'UNIVERSITY', 'PROGRAM_COORDINATOR'].includes(user.role) && (
          <TabsContent value="teacher-assignment">
            <TeacherAssignment courseId={courseId} user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ManageCoursePage;