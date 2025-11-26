'use client';

// Enhanced assessments tab with integrated marks upload functionality
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  FileText, 
  Plus, 
  Edit, 
  Upload, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Trash2,
  X,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { courseEvents } from '@/lib/course-events';

interface Question {
  id: string;
  question: string;
  maxMarks: number;
  isActive: boolean;
  createdAt: string;
  coMappings: {
    id: string;
    co: {
      id: string;
      code: string;
      description: string;
    };
  }[];
}

interface CourseOutcome {
  id: string;
  code: string;
  description: string;
}

interface Assessment {
  id: string;
  name: string;
  type: 'exam' | 'quiz' | 'assignment' | 'project';
  maxMarks: number;
  weightage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sectionId?: string;
  section?: {
    id: string;
    name: string;
  };
  questions?: Question[];
}

interface TeacherAssignment {
  id: string;
  courseId: string;
  sectionId?: string;
  teacherId: string;
  isActive: boolean;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Section {
  id: string;
  name: string;
  batchId: string;
  _count?: {
    students: number;
  };
}

interface UploadResult {
  processedCount: number;
  totalRows: number;
  errors?: string[];
  warnings?: string[];
  uploadedMarks?: any[];
}

interface AssessmentsTabProps {
  courseId: string;
  courseData?: any;
  onMarksUploaded?: (assessmentId: string) => void;
}

export function AssessmentsTabSectionAware({ courseId, courseData }: AssessmentsTabProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'exam' as 'exam' | 'quiz' | 'assignment' | 'project',
    maxMarks: 100,
    weightage: 10,
    sectionId: '' as string
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Question management state for expanded assessment
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cos, setCOs] = useState<CourseOutcome[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'upload'>('questions');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    maxMarks: 10,
    selectedCOs: [] as string[]
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [marksUploadStatus, setMarksUploadStatus] = useState<{[key: string]: { hasMarks: boolean; totalQuestions: number; questionsWithMarks: number; percentage: number } }>({});
  
  // Marks upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);
  const [showMarksDialog, setShowMarksDialog] = useState(false);
  const [uploadedMarks, setUploadedMarks] = useState<any>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentAssessmentForUpload, setCurrentAssessmentForUpload] = useState<Assessment | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('obe-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Always fetch assessments from API to ensure proper filtering for teachers
    fetchAssessments();
    
    // Listen for CO updates
    const handleCOUpdate = () => {
      fetchAssessments();
    };
    
    courseEvents.on('co-updated', handleCOUpdate);
    
    return () => {
      courseEvents.off('co-updated', handleCOUpdate);
    };
  }, [courseId]);

  useEffect(() => {
    if (expandedAssessment) {
      fetchQuestions();
      fetchCOs();
    }
  }, [expandedAssessment]);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const handleRefreshMarksStatus = async (assessment: Assessment) => {
    const status = await checkMarksUploadStatus(assessment);
    setMarksUploadStatus(prev => ({
      ...prev,
      [assessment.id]: status
    }));
  };

  useEffect(() => {
    if (assessments.length > 0) {
      // Check marks upload status for all assessments
      assessments.forEach(async (assessment) => {
        const status = await checkMarksUploadStatus(assessment);
        setMarksUploadStatus(prev => ({
          ...prev,
          [assessment.id]: status
        }));
      });
    }
  }, [assessments, courseId]);

  const fetchTeacherData = async () => {
    try {
      // Fetch teacher assignments to determine which sections this teacher can manage
      const response = await fetch(`/api/courses/${courseId}/teacher-assignments`);
      if (response.ok) {
        const data = await response.json();
        setTeacherAssignments(data.assignments || []);
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const url = `/api/courses/${courseId}/assessments`;
      
      const response = await fetch(url);
      if (response.ok) {
        const assessmentsData = await response.json();
        setAssessments(assessmentsData || []);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const fetchQuestions = async () => {
    if (!expandedAssessment) return;
    
    try {
      // Always fetch from API since we're now getting filtered assessments
      const response = await fetch(`/api/courses/${courseId}/assessments/${expandedAssessment}/questions`);
      if (response.ok) {
        const data = await response.json();
        console.log('Questions fetched:', data.length, data);
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const fetchCOs = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/cos`);
      if (response.ok) {
        const data = await response.json();
        setCOs(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch COs:', error);
    }
  };

  const checkMarksUploadStatus = async (assessment: Assessment) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assessments/${assessment.id}/marks-status`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error checking marks upload status:', error);
    }
    return { hasMarks: false, totalQuestions: 0, questionsWithMarks: 0, percentage: 0 };
  };

  const getAvailableSections = () => {
    if (user?.role === 'TEACHER') {
      // Teachers can only create assessments for their assigned sections
      return sections.filter(section => 
        teacherAssignments.some(a => 
          a.sectionId === section.id && a.teacherId === user.id
        )
      );
    }
    // Admins, PCs, etc. can create assessments for any section
    return sections;
  };

  const getSectionName = (assessment: Assessment) => {
    return assessment.section?.name || 'No Section';
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.name.trim() || !newAssessment.sectionId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including section",
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
          sectionId: newAssessment.sectionId,
        }),
      });

      if (response.ok) {
        const createdAssessment = await response.json();
        setAssessments(prev => [...prev, createdAssessment]);
        setNewAssessment({ 
          name: '', 
          type: 'exam', 
          maxMarks: 100, 
          weightage: 10,
          sectionId: ''
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

  const handleUpdateAssessment = async () => {
    if (!editingAssessment || !editingAssessment.name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/assessments/${editingAssessment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingAssessment.name.trim(),
          type: editingAssessment.type,
          maxMarks: editingAssessment.maxMarks,
          weightage: editingAssessment.weightage,
          sectionId: editingAssessment.sectionId,
        }),
      });

      if (response.ok) {
        const updatedAssessment = await response.json();
        setAssessments(prev => 
          prev.map(assessment => 
            assessment.id === updatedAssessment.id ? updatedAssessment : assessment
          )
        );
        setIsCreateDialogOpen(false);
        setEditingAssessment(null);
        toast({
          title: "Success",
          description: "Assessment updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update assessment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAssessment = async () => {
    if (!assessmentToDelete) return;

    setLoading(true);
    try {
      const deleteUrl = `/api/courses/${courseId}/assessments/${assessmentToDelete.id}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAssessments();
        setShowDeleteDialog(false);
        setAssessmentToDelete(null);
        toast({
          title: "Success",
          description: "Assessment deleted successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete assessment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Marks upload functions
  const handleDownloadMarksTemplate = async (assessmentId: string) => {
    try {
      setLoading(true);
      console.log('🔍 Starting CSV template download for assessment:', assessmentId);
      
      const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}/template`);
      console.log('📥 Template API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Template data received:', {
          assessment: data.assessment?.name,
          hasTemplate: !!data.template,
          hasStudents: !!data.students,
          hasQuestions: !!data.questions,
          studentsCount: data.students?.length,
          questionsCount: data.questions?.length,
          headers: data.template?.headers
        });
        
        if (!data.template || !data.students || !data.questions) {
          console.error('❌ Template data is incomplete');
          toast({
            title: "Error",
            description: "Template data is incomplete",
            variant: "destructive",
          });
          return;
        }
        
        // Create CSV content
        const headers = data.template.headers;
        const csvContent = [
          headers.join(','),
          ...data.students.map((student: any) => [
            student.studentId,
            student.name,
            student.email,
            ...data.questions.map(() => '') // Empty marks columns
          ].join(','))
        ].join('\n');
        
        console.log('📄 CSV content generated (first 200 chars):', csvContent.substring(0, 200));
        console.log('📄 CSV content length:', csvContent.length);
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.assessment.name}_Marks_Template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ CSV download initiated successfully for:', data.assessment.name);
        
        toast({
          title: "Success",
          description: "CSV template downloaded successfully",
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Template API error:', errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to download template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Template download error:', error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMarksClick = (assessment: Assessment) => {
    setCurrentAssessmentForUpload(assessment);
    setUploadFile(null);
    setUploadResults(null);
    setShowMarksDialog(true);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setUploadFile(file);
        handleFilePreview(file);
      } else {
        toast({
          title: "Error",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleFilePreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
        
        setPreviewData({
          fileName: file.name,
          headers,
          rows,
          totalRows: lines.length - 1
        });
        setShowPreviewDialog(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read CSV file preview",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleUploadMarks = async () => {
    if (!uploadFile || !currentAssessmentForUpload) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch(`/api/courses/${courseId}/assessments/${currentAssessmentForUpload.id}/upload-marks`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: UploadResult = await response.json();
        setUploadResults(result);
        
        toast({
          title: "Success",
          description: `${result.processedCount} students processed successfully`,
        });
        
        // Refresh marks status
        if (currentAssessmentForUpload) {
          await handleRefreshMarksStatus(currentAssessmentForUpload);
        }
        
        // Reset and close dialog
        setUploadFile(null);
        setShowMarksDialog(false);
        setCurrentAssessmentForUpload(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to upload marks",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload marks",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewUploadedMarks = async (assessmentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}/uploaded-marks`);
      if (response.ok) {
        const data = await response.json();
        setUploadedMarks(data);
        setShowMarksDialog(true);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch uploaded marks",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch uploaded marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800 border-red-200';
      case 'quiz': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assignment': return 'bg-green-100 text-green-800 border-green-200';
      case 'project': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessments Management</h2>
          <p className="text-gray-600">Create assessments, manage questions, and upload student marks</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssessments}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Assessment List */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment List</CardTitle>
          <CardDescription>
            {user?.role === 'TEACHER' 
              ? 'Assessments for your assigned sections'
              : 'All assessments for this course'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {user?.role === 'TEACHER'
                ? 'No assessments found for your assigned sections. Create your first assessment to get started.'
                : 'No assessments found for this course. Create an assessment to get started.'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="border rounded-lg">
                  <Collapsible
                    open={expandedAssessment === assessment.id}
                    onOpenChange={(open) => setExpandedAssessment(open ? assessment.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(assessment.type)}`}>
                            {getTypeLabel(assessment.type)}
                          </div>
                          <div>
                            <div className="font-medium">{assessment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Section: {getSectionName(assessment)} • {assessment.maxMarks} marks • {assessment.weightage}% weight
                            </div>
                            {/* Marks Upload Status Indicator */}
                            {marksUploadStatus[assessment.id] && (
                              <div className="mt-2 flex items-center gap-2">
                                {marksUploadStatus[assessment.id].hasMarks ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                      Marks Uploaded ({marksUploadStatus[assessment.id].questionsWithMarks}/{marksUploadStatus[assessment.id].totalQuestions})
                                    </span>
                                  </>
                                ) : marksUploadStatus[assessment.id].totalQuestions > 0 ? (
                                  <>
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                      Pending Upload ({marksUploadStatus[assessment.id].questionsWithMarks}/{marksUploadStatus[assessment.id].totalQuestions})
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                      No Questions Yet
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedAssessment === assessment.id ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      {/* Assessment Actions */}
                      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => handleDownloadMarksTemplate(assessment.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleUploadMarksClick(assessment)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Marks
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewUploadedMarks(assessment.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Uploaded Marks
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadQuestionTemplate(assessment.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Question Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleBulkQuestionUpload(assessment.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Bulk Upload Questions
                        </Button>
                        <Button size="sm" onClick={() => setShowQuestionDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingAssessment(assessment);
                            setIsCreateDialogOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Assessment
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteAssessment(assessment)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Assessment
                        </Button>
                      </div>

                      {/* Questions Table */}
                      <div className="border rounded-lg">
                        <div className="p-4 border-b">
                          <h4 className="font-medium">Questions</h4>
                        </div>
                        {questions && questions.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Max Marks</TableHead>
                                <TableHead>COs</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {questions.map((question) => (
                                <TableRow key={question.id}>
                                  <TableCell className="max-w-xs">
                                    <div className="truncate" title={question.question}>
                                      {question.question}
                                    </div>
                                  </TableCell>
                                  <TableCell>{question.maxMarks}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {question.coMappings.map((mapping) => (
                                        <Badge key={mapping.co.id} variant="secondary" className="text-xs">
                                          {mapping.co.code}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditQuestion(question)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No questions added yet. Click "Add Question" to get started.
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Marks Dialog */}
      <Dialog open={showMarksDialog} onOpenChange={setShowMarksDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {uploadedMarks ? 'Uploaded Marks' : 'Upload Student Marks'}
            </DialogTitle>
            <DialogDescription>
              {uploadedMarks 
                ? 'View the uploaded marks for this assessment'
                : 'Upload marks for students in this assessment'
              }
            </DialogDescription>
          </DialogHeader>
          
          {uploadedMarks ? (
            // Display uploaded marks
            <div className="space-y-4">
              {uploadedMarks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      {uploadedMarks[0].questions?.map((q: any, index: number) => (
                        <TableHead key={index}>Q{index + 1}</TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedMarks.map((student: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        {student.questions?.map((marks: number, qIndex: number) => (
                          <TableCell key={qIndex}>{marks}</TableCell>
                        ))}
                        <TableCell className="font-medium">
                          {student.questions?.reduce((sum: number, marks: number) => sum + marks, 0) || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No marks have been uploaded yet.
                </div>
              )}
            </div>
          ) : (
            // Upload form
            <div className="space-y-4">
              {currentAssessmentForUpload && (
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium">{currentAssessmentForUpload.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Section: {getSectionName(currentAssessmentForUpload)} • {currentAssessmentForUpload.maxMarks} marks
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {uploadFile && (
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm font-medium">Selected file: {uploadFile.name}</p>
                  <p className="text-sm text-muted-foreground">Size: {(uploadFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              {uploadResults && (
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-800">
                    Upload completed successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    {uploadResults.processedCount} students processed
                  </p>
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-800">Errors:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {uploadResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResults.errors.length > 5 && (
                          <li>... and {uploadResults.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowMarksDialog(false);
                  setUploadedMarks(null);
                  setUploadResults(null);
                  setUploadFile(null);
                  setCurrentAssessmentForUpload(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUploadMarks} disabled={!uploadFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload Marks'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
            <DialogDescription>
              Preview of the CSV file: {previewData?.fileName}
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total rows: {previewData.totalRows}
              </div>
              
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData.headers.map((header: string, index: number) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.map((row: string[], rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowPreviewDialog(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Assessment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
            </DialogTitle>
            <DialogDescription>
              {editingAssessment ? 'Edit assessment details' : 'Create a new assessment for this course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Assessment Name</Label>
              <Input
                id="name"
                value={editingAssessment ? editingAssessment.name : newAssessment.name}
                onChange={(e) => {
                  if (editingAssessment) {
                    setEditingAssessment({ ...editingAssessment, name: e.target.value });
                  } else {
                    setNewAssessment({ ...newAssessment, name: e.target.value });
                  }
                }}
                placeholder="Enter assessment name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={editingAssessment ? editingAssessment.type : newAssessment.type}
                onValueChange={(value: 'exam' | 'quiz' | 'assignment' | 'project') => {
                  if (editingAssessment) {
                    setEditingAssessment({ ...editingAssessment, type: value });
                  } else {
                    setNewAssessment({ ...newAssessment, type: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
              <Label htmlFor="maxMarks">Max Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                value={editingAssessment ? editingAssessment.maxMarks : newAssessment.maxMarks}
                onChange={(e) => {
                  if (editingAssessment) {
                    setEditingAssessment({ ...editingAssessment, maxMarks: parseInt(e.target.value) });
                  } else {
                    setNewAssessment({ ...newAssessment, maxMarks: parseInt(e.target.value) });
                  }
                }}
                placeholder="Enter max marks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightage">Weightage (%)</Label>
              <Input
                id="weightage"
                type="number"
                value={editingAssessment ? editingAssessment.weightage : newAssessment.weightage}
                onChange={(e) => {
                  if (editingAssessment) {
                    setEditingAssessment({ ...editingAssessment, weightage: parseFloat(e.target.value) });
                  } else {
                    setNewAssessment({ ...newAssessment, weightage: parseFloat(e.target.value) });
                  }
                }}
                placeholder="Enter weightage percentage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={editingAssessment ? editingAssessment.sectionId : newAssessment.sectionId}
                onValueChange={(value) => {
                  if (editingAssessment) {
                    setEditingAssessment({ ...editingAssessment, sectionId: value });
                  } else {
                    setNewAssessment({ ...newAssessment, sectionId: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSections().map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingAssessment(null);
              setNewAssessment({
                name: '',
                type: 'exam',
                maxMarks: 100,
                weightage: 10,
                sectionId: ''
              });
            }}>
              Cancel
            </Button>
            <Button onClick={editingAssessment ? handleUpdateAssessment : handleCreateAssessment} disabled={loading}>
              {loading ? (editingAssessment ? 'Updating...' : 'Creating...') : (editingAssessment ? 'Update Assessment' : 'Create Assessment')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assessmentToDelete?.name}"? This action cannot be undone and will also delete all associated questions and marks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAssessment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Helper functions for question management (simplified for this example)
  function handleDownloadQuestionTemplate(assessmentId: string) {
    // Implementation for downloading question template
    toast({
      title: "Info",
      description: "Question template download feature coming soon",
    });
  }

  function handleBulkQuestionUpload(assessmentId: string) {
    // Implementation for bulk question upload
    toast({
      title: "Info", 
      description: "Bulk question upload feature coming soon",
    });
  }

  function handleEditQuestion(question: Question) {
    // Implementation for editing question
    setEditingQuestion(question);
    setShowQuestionDialog(true);
  }

  function handleDeleteQuestion(questionId: string) {
    // Implementation for deleting question
    toast({
      title: "Info",
      description: "Delete question feature coming soon",
    });
  }
}