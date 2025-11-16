'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Users, Upload, Search, Loader2, Power, PowerOff, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { StudentBulkUpload } from '@/components/student-bulk-upload';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  role: string;
  isActive: boolean;
  email?: string;
  college?: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  batch?: {
    id: string;
    name: string;
    startYear: number;
    endYear: number;
    program: {
      id: string;
      name: string;
      code: string;
    };
  };
  program?: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    enrollments: number;
  };
}

interface StudentFormData {
  studentId: string;
  name: string;
  email: string;
  password: string;
  collegeId: string;
  programId: string;
  batchId: string;
}

interface College {
  id: string;
  name: string;
  code: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  collegeId: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  programId: string;
}

export function StudentManagementAdmin({ user }: { user: User }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState<StudentFormData>({
    studentId: '',
    name: '',
    email: '',
    password: '',
    collegeId: '',
    programId: '',
    batchId: '',
  });

  // Fetch colleges
  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/colleges');
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  // Fetch programs based on selected college
  const fetchPrograms = async (collegeId: string) => {
    if (!collegeId) return;
    try {
      const response = await fetch(`/api/programs?collegeId=${collegeId}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Fetch batches based on selected program
  const fetchBatches = async (programId: string) => {
    if (!programId) return;
    try {
      const response = await fetch(`/api/batches?programId=${programId}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch students with filters
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCollegeId) params.append('collegeId', selectedCollegeId);
      if (selectedProgramId) params.append('programId', selectedProgramId);
      if (selectedBatchId) params.append('batchId', selectedBatchId);

      const response = await fetch(`/api/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchPrograms(selectedCollegeId);
    setSelectedProgramId('');
    setSelectedBatchId('');
  }, [selectedCollegeId]);

  useEffect(() => {
    fetchBatches(selectedProgramId);
    setSelectedBatchId('');
  }, [selectedProgramId]);

  useEffect(() => {
    fetchStudents();
  }, [selectedCollegeId, selectedProgramId, selectedBatchId, refreshKey]);

  // Handle college selection change
  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setSelectedProgramId('');
    setSelectedBatchId('');
    setFormData(prev => ({
      ...prev,
      collegeId,
      programId: '',
      batchId: '',
    }));
  };

  // Handle program selection change
  const handleProgramChange = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedBatchId('');
    setFormData(prev => ({
      ...prev,
      programId,
      batchId: '',
    }));
  };

  // Handle batch selection change
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setFormData(prev => ({
      ...prev,
      batchId,
    }));
  };

  // Check if user can upload students
  const canUploadStudents = selectedCollegeId && selectedProgramId && selectedBatchId;

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all required fields are selected
    if (!formData.collegeId || formData.collegeId.trim() === '') {
      toast.error('Please select a college');
      return;
    }

    if (!formData.programId || formData.programId.trim() === '') {
      toast.error('Please select a program');
      return;
    }

    if (!formData.batchId || formData.batchId.trim() === '') {
      toast.error('Please select a batch');
      return;
    }

    if (!formData.studentId.trim() || !formData.name.trim()) {
      toast.error('Student ID and Name are required');
      return;
    }

    if (!editingStudent && !formData.email.trim()) {
      toast.error('Email is required for new students');
      return;
    }

    if (!editingStudent && !formData.password.trim()) {
      toast.error('Password is required for new students');
      return;
    }
    
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      console.log('Submitting student data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingStudent ? 'Student updated successfully!' : 'Student created successfully!');
        setRefreshKey(prev => prev + 1);
        setShowCreateForm(false);
        setEditingStudent(null);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Student creation error:', errorData);
        toast.error(errorData.error || 'Failed to save student');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  // Handle student status toggle
  const handleToggleStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, isActive: updatedStudent.isActive }
              : student
          )
        );
        toast.success(`Student ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Failed to update student status');
    }
  };

  // Handle student deletion
  const handleDelete = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete student ${studentName}?`)) return;
    
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student deleted successfully!');
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email || '',
      password: '',
      collegeId: student.batch?.program.collegeId || student.college?.id || '',
      programId: student.batch?.programId || student.program?.id || '',
      batchId: student.batch?.id || '',
    });
    setShowCreateForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      password: '',
      collegeId: selectedCollegeId,
      programId: selectedProgramId,
      batchId: selectedBatchId,
    });
    setEditingStudent(null);
  };

  // Handle bulk upload completion
  const handleBulkUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
    setShowBulkUpload(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">
            Comprehensive student management across all colleges and programs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (!canUploadStudents) {
                toast.error('You need to select college, program, and batch to upload students.');
                return;
              }
              setShowBulkUpload(!showBulkUpload);
              setShowCreateForm(false);
            }}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!canUploadStudents}
          >
            <Upload className="h-4 w-4" />
            {showBulkUpload ? 'Cancel' : 'Bulk Upload'}
          </Button>
          <Button
            onClick={() => {
              if (!canUploadStudents) {
                toast.error('You need to select college, program, and batch to add students.');
                return;
              }
              setShowCreateForm(!showCreateForm);
              setShowBulkUpload(false);
              resetForm();
            }}
            className="flex items-center gap-2"
            disabled={!canUploadStudents}
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Cancel' : 'Add Student'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="college">College</Label>
              <Select value={selectedCollegeId} onValueChange={handleCollegeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Select value={selectedProgramId} onValueChange={handleProgramChange} disabled={!selectedCollegeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select college first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatchId} onValueChange={handleBatchChange} disabled={!selectedProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.startYear}-{batch.endYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showBulkUpload && (
        <StudentBulkUpload
          user={{
            ...user,
            collegeId: selectedCollegeId,
            programId: selectedProgramId,
            batchId: selectedBatchId,
          }}
          onStudentsUploaded={handleBulkUploadComplete}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">College *</Label>
                  <Select value={formData.collegeId} onValueChange={(value) => setFormData({ ...formData, collegeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="program">Program *</Label>
                  <Select value={formData.programId} onValueChange={(value) => setFormData({ ...formData, programId: value })} disabled={!formData.collegeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college first" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.filter(p => !formData.collegeId || p.collegeId === formData.collegeId).map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch">Batch *</Label>
                  <Select value={formData.batchId} onValueChange={(value) => setFormData({ ...formData, batchId: value })} disabled={!formData.programId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program first" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.filter(b => !formData.programId || b.programId === formData.programId).map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} ({batch.startYear}-{batch.endYear})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g. CS101001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email {!editingStudent && '*'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. student@example.com"
                    required={!editingStudent}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password {!editingStudent && '*'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required={!editingStudent}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingStudent ? 'Update Student' : 'Create Student')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {filteredStudents.length} Students
                </Badge>
                {selectedCollegeId && (
                  <Badge variant="secondary">
                    {colleges.find(c => c.id === selectedCollegeId)?.name || 'Selected College'}
                  </Badge>
                )}
                {selectedProgramId && (
                  <Badge variant="secondary">
                    {programs.find(p => p.id === selectedProgramId)?.name || 'Selected Program'}
                  </Badge>
                )}
                {selectedBatchId && (
                  <Badge variant="secondary">
                    {batches.find(b => b.id === selectedBatchId)?.name || 'Selected Batch'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No students match your search criteria' : 'No students found for the selected filters'}
              </p>
              {canUploadStudents && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Student
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>
                        {student.college?.name || student.batch?.program.college?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {student.program?.name || student.batch?.program?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {student.batch?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? "default" : "secondary"} className="text-xs">
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(student.id, student.isActive)}
                            className={`flex items-center gap-1 ${student.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                          >
                            {student.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id, student.name)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}