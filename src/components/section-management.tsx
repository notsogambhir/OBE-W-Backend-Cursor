'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Trash2, Users, Plus } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  batchId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  sectionId?: string;
  batchId: string;
  programId: string;
}

interface Batch {
  id: string;
  name: string;
  programId: string;
  startYear: number;
  endYear: number;
}

interface Program {
  id: string;
  name: string;
  code: string;
  collegeId: string;
}

interface SectionManagementProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    collegeId?: string;
    programId?: string;
  };
}

export function SectionManagement({ user }: SectionManagementProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sectionsLoading, setSectionsLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);

  

  // Fetch programs based on user role
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        let url = '/api/programs';
        if (user.role === 'DEPARTMENT') {
          url = `/api/programs?collegeId=${user.collegeId}`;
        } else if (user.role === 'PROGRAM_COORDINATOR') {
          url = `/api/programs/${user.programId}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPrograms(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    };

    fetchPrograms();
  }, [user]);

  // Fetch batches when program is selected
  useEffect(() => {
    if (selectedProgram) {
      const fetchBatches = async () => {
        try {
          setBatches([]);
          setSelectedBatch('');
          const response = await fetch(`/api/batches?programId=${selectedProgram}`);
          if (response.ok) {
            const data = await response.json();
            setBatches(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Failed to fetch batches:', error);
        }
      };

      fetchBatches();
    }
  }, [selectedProgram]);

  // Fetch sections and students when batch is selected
  useEffect(() => {
    if (selectedBatch) {
      const fetchSections = async () => {
        try {
          setSectionsLoading(true);
          const response = await fetch(`/api/sections?batchId=${selectedBatch}`);
          if (response.ok) {
            const data = await response.json();
            setSections(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Failed to fetch sections:', error);
        } finally {
          setSectionsLoading(false);
        }
      };

      const fetchStudents = async () => {
        try {
          setStudentsLoading(true);
          const response = await fetch(`/api/students?batchId=${selectedBatch}`);
          if (response.ok) {
            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Failed to fetch students:', error);
        } finally {
          setStudentsLoading(false);
        }
      };

      fetchSections();
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Section name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSectionName.trim(),
          batchId: selectedBatch,
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        setSections(prev => [...prev, newSection]);
        setNewSectionName('');
        toast({
          title: "Success",
          description: `Section "${newSection.name}" created successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create section",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (!confirm(`Are you sure you want to delete section "${sectionName}"? All students in this section will become unassigned.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(prev => prev.filter(s => s.id !== sectionId));
        // Update students in this section to be unassigned
        setStudents(prev => prev.map(student => 
          student.sectionId === sectionId 
            ? { ...student, sectionId: undefined }
            : student
        ));
        toast({
          title: "Success",
          description: `Section "${sectionName}" deleted successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete section",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleAssignStudentToSection = async (studentId: string, sectionId: string | null) => {
    try {
      const response = await fetch(`/api/students/${studentId}/section`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId }),
      });

      if (response.ok) {
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, sectionId }
            : student
        ));
        toast({
          title: "Success",
          description: "Student section assignment updated",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update student section",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update student section:', error);
      toast({
        title: "Error",
        description: "Failed to update student section",
        variant: "destructive",
      });
    }
  };

  const getSectionStudentCount = (sectionId: string) => {
    return students.filter(student => student.sectionId === sectionId).length;
  };

  const getUnassignedStudentCount = () => {
    return students.filter(student => !student.sectionId).length;
  };

  return (
    <div className="space-y-6">
      {/* Context Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Context</CardTitle>
          <CardDescription>
            First select a Program and Batch to manage sections and student assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
                disabled={programs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select
                value={selectedBatch}
                onValueChange={setSelectedBatch}
                disabled={batches.length === 0 || !selectedProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.startYear}-{batch.endYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBatch && (
        <>
          {/* Section Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Sections
              </CardTitle>
              <CardDescription>
                Create and manage sections for the selected batch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter section name (e.g., A, B, C)"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCreateSection}
                  disabled={loading || !newSectionName.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Add Section'}
                </Button>
              </div>

              {/* Existing Sections */}
              <div>
                <h4 className="text-sm font-medium mb-3">Existing Sections</h4>
                {sectionsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading sections...
                  </div>
                ) : sections.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No sections found. Create your first section above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <div className="font-medium">Section {section.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {getSectionStudentCount(section.id)} students
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id, section.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Students to Sections</CardTitle>
              <CardDescription>
                Assign students to sections within the selected batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading students...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                      <div className="text-sm text-blue-600">Total Students</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{getUnassignedStudentCount()}</div>
                      <div className="text-sm text-green-600">Unassigned</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
                      <div className="text-sm text-purple-600">Sections</div>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted font-medium text-sm">
                      <div>Student Name</div>
                      <div>Student ID</div>
                      <div>Email</div>
                      <div>Assigned Section</div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {students.map((student) => (
                        <div key={student.id} className="grid grid-cols-4 gap-4 p-4 border-t hover:bg-muted/50">
                          <div className="font-medium">{student.name}</div>
                          <div>{student.studentId}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div>
                            <Select
                              value={student.sectionId || 'unassigned'}
                              onValueChange={(value) => handleAssignStudentToSection(student.id, value === 'unassigned' ? null : value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {sections.map((section) => (
                                  <SelectItem key={section.id} value={section.id}>
                                    Section {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}