'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionManagement } from '@/components/section-management';
import { StudentManagementAdmin } from '@/components/student-management-admin';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId?: string;
  programId?: string;
}

export default function StudentsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user from localStorage or context
    const storedUser = localStorage.getItem('obe-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Check if user is Department Head or has equivalent permissions
  const canManageSections = ['ADMIN', 'UNIVERSITY', 'DEPARTMENT'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage student enrollment and section assignments
          </p>
        </div>
        <Badge variant={canManageSections ? "default" : "secondary"}>
          {user.role.replace('_', ' ')}
        </Badge>
      </div>

      {canManageSections ? (
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sections">Section Management</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="space-y-4">
            <SectionManagement user={user} />
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <StudentManagementAdmin user={user} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Access Restricted
                </h3>
                <p className="text-muted-foreground">
                  You don't have permission to manage sections and student assignments.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Only Administrators, University staff, and Department Heads can access this feature.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}