'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Edit, 
  Upload, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { courseEvents } from '@/lib/course-events';
import Link from 'next/link';
import { AssessmentManagement } from './assessment-management-new';

interface Assessment {
  id: string;
  name: string;
  type: 'exam' | 'quiz' | 'assignment' | 'project';
  maxMarks: number;
  weightage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentsTabProps {
  courseId: string;
  courseData?: any;
}

export function AssessmentsTab({ courseId, courseData }: AssessmentsTabProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showManagementDialog, setShowManagementDialog] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'exam' as 'exam' | 'quiz' | 'assignment' | 'project',
    maxMarks: 100,
    weightage: 10,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseData?.assessments) {
      setAssessments(courseData.assessments);
    } else {
      fetchAssessments();
    }
    
    // Listen for CO updates (in case assessments need to refresh CO-related data)
    const handleCOUpdate = () => {
      fetchAssessments();
    };
    
    courseEvents.on('co-updated', handleCOUpdate);
    
    return () => {
      courseEvents.off('co-updated', handleCOUpdate);
    };
  }, [courseId, courseData]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assessments`);
      if (response.ok) {
        const assessmentsData = await response.json();
        setAssessments(assessmentsData || []);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAssessment.name.trim(),
          type: newAssessment.type,
          maxMarks: newAssessment.maxMarks,
          weightage: newAssessment.weightage,
        }),
      });

      if (response.ok) {
        const createdAssessment = await response.json();
        setAssessments(prev => [...prev, createdAssessment]);
        setNewAssessment({ 
          name: '', 
          type: 'exam', 
          maxMarks: 100, 
          weightage: 10
        });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Assessment created successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create assessment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Exam';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      case 'project': return 'Project';
      default: return type;
    }
  };

  const handleManageAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowManagementDialog(true);
  };

  const handleAssessmentUpdate = () => {
    fetchAssessments();
    setShowManagementDialog(false);
    setSelectedAssessment(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Assessments</CardTitle>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                  <DialogDescription>
                    Create a new assessment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-name">Assessment Name</Label>
                    <Input
                      id="assessment-name"
                      placeholder="e.g., Mid Term Examination"
                      value={newAssessment.name}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessment-type">Type</Label>
                    <Select
                      value={newAssessment.type}
                      onValueChange={(value: 'exam' | 'quiz' | 'assignment' | 'project') => 
                        setNewAssessment(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input
                      id="total-marks"
                      type="number"
                      min="1"
                      max="1000"
                      value={newAssessment.maxMarks}
                      onChange={(e) => setNewAssessment(prev => ({ 
                        ...prev, 
                        maxMarks: parseInt(e.target.value) || 100 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightage">Weightage (%)</Label>
                    <Input
                      id="weightage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newAssessment.weightage}
                      onChange={(e) => setNewAssessment(prev => ({ 
                        ...prev, 
                        weightage: parseFloat(e.target.value) || 10 
                      }))}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssessment} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Assessment'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments</h3>
              <p className="text-gray-600 mb-4">
                Create your first assessment to start tracking student performance
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Weightage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {assessment.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(assessment.type)}>
                          {getTypeLabel(assessment.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.maxMarks}</TableCell>
                      <TableCell>{assessment.weightage}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleManageAssessment(assessment)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                          <Button size="sm" variant="outline">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Exams</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.filter(a => a.type === 'exam').length}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.filter(a => a.type === 'assignment').length}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Total Weightage</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.reduce((sum, a) => sum + a.weightage, 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-red-600">[PLACEHOLDER] Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Bulk Upload Marks</p>
                  <p className="text-sm text-gray-600">Upload marks from Excel file</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Upload
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Generate Reports</p>
                  <p className="text-sm text-gray-600">Create assessment reports</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Management Dialog */}
      {selectedAssessment && (
        <AssessmentManagement
          courseId={courseId}
          assessment={selectedAssessment}
          onClose={() => {
            setShowManagementDialog(false);
            setSelectedAssessment(null);
          }}
          onUpdate={handleAssessmentUpdate}
        />
      )}
    </div>
  );
}