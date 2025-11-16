'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PO {
  id: string;
  code: string;
  description: string;
  programId: string;
  program: {
    name: string;
    code: string;
  };
}

interface Program {
  id: string;
  name: string;
  code: string;
}

export default function ProgramOutcomesPage() {
  const { user } = useAuth();
  const [pos, setPOs] = useState<PO[]>([]);
  const [allPOs, setAllPOs] = useState<PO[]>([]); // For code generation
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PO | null>(null);
  const [newPO, setNewPO] = useState({
    programId: '',
    code: '',
    description: ''
  });

  // Auto-suggest PO code when program changes
  useEffect(() => {
    if (newPO.programId && !newPO.code) {
      setNewPO(prev => ({ ...prev, code: getNextPOCode() }));
    }
  }, [newPO.programId, allPOs]);

  const isProgramCoordinator = user?.role === 'PROGRAM_COORDINATOR';
  const canManagePOs = ['PROGRAM_COORDINATOR', 'ADMIN', 'UNIVERSITY'].includes(user?.role || '');

  useEffect(() => {
    fetchPrograms();
    if (isProgramCoordinator && user?.programId) {
      setSelectedProgramId(user.programId);
      // Also set the newPO programId for program coordinators
      setNewPO(prev => ({ ...prev, programId: user.programId || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchPOs();
      // Update newPO programId when selection changes (for non-program coordinators)
      if (!isProgramCoordinator) {
        setNewPO(prev => ({ ...prev, programId: selectedProgramId }));
      }
    }
  }, [selectedProgramId, isProgramCoordinator]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const programsData = await response.json();
        setPrograms(programsData);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchPOs = async () => {
    if (!selectedProgramId) return;
    
    setLoading(true);
    try {
      // Fetch active POs for display
      const response = await fetch(`/api/pos?programId=${selectedProgramId}`);
      if (response.ok) {
        const posData = await response.json();
        setPOs(posData);
      }
      
      // Fetch all POs (including inactive) for code generation
      const allResponse = await fetch(`/api/pos?programId=${selectedProgramId}&includeInactive=true`);
      if (allResponse.ok) {
        const allPosData = await allResponse.json();
        setAllPOs(allPosData);
      }
    } catch (error) {
      console.error('Failed to fetch POs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    // Ensure the program ID is properly set when opening the dialog
    if (isProgramCoordinator && user?.programId) {
      setNewPO(prev => ({ ...prev, programId: user.programId || '' }));
    } else if (selectedProgramId) {
      setNewPO(prev => ({ ...prev, programId: selectedProgramId }));
    }
    setIsCreateDialogOpen(true);
  };

  const handleCreatePO = async () => {
    // Ensure programId is set before proceeding
    const programIdToUse = newPO.programId || selectedProgramId;
    
    if (!programIdToUse || !newPO.code.trim() || !newPO.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: programIdToUse,
          code: newPO.code.trim(),
          description: newPO.description.trim()
        }),
      });

      if (response.ok) {
        const createdPO = await response.json();
        setPOs(prev => [...prev, createdPO]);
        setNewPO({ programId: isProgramCoordinator ? user?.programId || '' : selectedProgramId || '', code: '', description: '' });
        setIsCreateDialogOpen(false);
        
        if (createdPO.reactivated) {
          toast({
            title: "PO Reactivated",
            description: `PO ${createdPO.code} has been reactivated successfully`,
          });
        } else {
          toast({
            title: "Success",
            description: `PO ${createdPO.code} created successfully`,
          });
        }
      } else {
        const error = await response.json();
        
        // Handle specific error cases
        if (response.status === 409) {
          // Conflict - PO code already exists
          toast({
            title: "Duplicate PO Code",
            description: `PO ${newPO.code} already exists. Please use a different code.`,
            variant: "destructive",
          });
          // Auto-suggest next available code
          const nextCode = getNextPOCode();
          setNewPO(prev => ({ ...prev, code: nextCode }));
        } else {
          toast({
            title: "Error",
            description: error.error || "Failed to create PO",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PO",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePO = async () => {
    if (!editingPO || !editingPO.code.trim() || !editingPO.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pos/${editingPO.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editingPO.code.trim(),
          description: editingPO.description.trim()
        }),
      });

      if (response.ok) {
        const updatedPO = await response.json();
        setPOs(prev => prev.map(po => po.id === updatedPO.id ? updatedPO : po));
        setEditingPO(null);
        toast({
          title: "Success",
          description: `PO ${updatedPO.code} updated successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update PO",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PO",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePO = async (poId: string, poCode: string) => {
    if (!confirm(`Are you sure you want to delete PO ${poCode}?`)) return;

    try {
      const response = await fetch(`/api/pos/${poId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPOs(prev => prev.filter(po => po.id !== poId));
        toast({
          title: "Success",
          description: `PO ${poCode} deleted successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete PO",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PO",
        variant: "destructive",
      });
    }
  };

  const getNextPOCode = () => {
    if (!selectedProgramId) return 'PO1';
    
    // Get existing PO codes (both active and inactive) and find the next available number
    const existingNumbers = allPOs
      .map(po => {
        const match = po.code.match(/PO(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b);
    
    if (existingNumbers.length === 0) return 'PO1';
    
    // Find the first missing number in the sequence
    for (let i = 1; i <= existingNumbers.length + 1; i++) {
      if (!existingNumbers.includes(i)) {
        return `PO${i}`;
      }
    }
    
    // If all numbers are taken, use the next one
    return `PO${existingNumbers.length + 1}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Program Outcomes</h1>
        </div>
        {canManagePOs && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add PO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Program Outcome</DialogTitle>
                <DialogDescription>
                  Create a new program outcome for NBA accreditation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={newPO.programId}
                    onValueChange={(value) => setNewPO(prev => ({ ...prev, programId: value }))}
                    disabled={isProgramCoordinator}
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
                  {isProgramCoordinator && (
                    <p className="text-sm text-gray-500">
                      You can only create POs for your assigned program
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-code">PO Code</Label>
                  <Input
                    id="po-code"
                    placeholder="e.g., PO1"
                    value={newPO.code}
                    onChange={(e) => setNewPO(prev => ({ ...prev, code: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500">
                    Suggested: {getNextPOCode()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-description">Description</Label>
                  <Textarea
                    id="po-description"
                    placeholder="Enter PO description..."
                    value={newPO.description}
                    onChange={(e) => setNewPO(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePO} disabled={loading}>
                    {loading ? 'Creating...' : 'Create PO'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Program Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Program
          </CardTitle>
          <CardDescription>
            Choose a program to view and manage its Program Outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select
              value={selectedProgramId}
              onValueChange={setSelectedProgramId}
              disabled={isProgramCoordinator}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({program.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isProgramCoordinator && (
              <p className="text-sm text-gray-500 mt-2">
                You are viewing your assigned program only
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* POs List */}
      {selectedProgramId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Program Outcomes</CardTitle>
                <CardDescription>
                  NBA Program Outcomes for {programs.find(p => p.id === selectedProgramId)?.name}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {pos.length} POs
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading POs...</p>
              </div>
            ) : pos.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Program Outcomes</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first Program Outcome
                </p>
                {canManagePOs && (
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First PO
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">PO Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell>
                          <Badge variant="outline">{po.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {editingPO?.id === po.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingPO.description}
                                onChange={(e) => setEditingPO(prev => prev ? { ...prev, description: e.target.value } : null)}
                                rows={3}
                                className="min-w-0"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleUpdatePO}
                                  disabled={loading}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingPO(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="max-w-2xl">
                              <p className="text-sm">{po.description}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingPO?.id !== po.id && canManagePOs && (
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPO(po)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePO(po.id, po.code)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            About Program Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">NBA Requirements</h4>
              <p className="text-sm text-blue-700">
                Program Outcomes (POs) are broad statements describing what students are expected to know and be able to do by the time of graduation. These should align with NBA accreditation requirements.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Best Practices</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Define 6-12 POs covering all engineering domains</li>
                <li>• Use clear, measurable, and outcome-oriented language</li>
                <li>• Ensure POs align with program mission and vision</li>
                <li>• Review and update POs periodically with stakeholders</li>
              </ul>
            </div>
            {!canManagePOs && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Access Level</h4>
                <p className="text-sm text-yellow-700">
                  You have read-only access. Only Program Coordinators and administrators can manage Program Outcomes.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}