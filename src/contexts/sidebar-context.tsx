'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface College {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  duration: number;
  description?: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface SidebarContextType {
  // Current selections
  selectedCollege: string | null;
  selectedProgram: string | null;
  selectedBatch: string | null;
  
  // Available data
  colleges: College[];
  programs: Program[];
  batches: Batch[];
  
  // Loading states
  loadingPrograms: boolean;
  loadingBatches: boolean;
  
  // Actions
  setSelectedCollege: (collegeId: string | null) => void;
  setSelectedProgram: (programId: string | null) => void;
  setSelectedBatch: (batchId: string | null) => void;
  
  // Context string for API calls
  getContextString: () => string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { user, updateUserSelections } = useAuth();
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const isInitialMount = useRef(true);

  // Sync with user's batchId when it changes
  useEffect(() => {
    if (user?.batchId && user.batchId !== selectedBatch) {
      setSelectedBatch(user.batchId);
    }
  }, [user?.batchId, selectedBatch]);

  // Sync with user's programId when it changes
  useEffect(() => {
    if (user?.programId && user.programId !== selectedProgram) {
      setSelectedProgram(user.programId);
    }
  }, [user?.programId, selectedProgram]);

  // Initialize admin user's college on first load only
  useEffect(() => {
    if (isInitialMount.current && user?.role === 'ADMIN' && user.collegeId && !selectedCollege) {
      setSelectedCollege(user.collegeId);
      isInitialMount.current = false;
    }
  }, [user?.role, user?.collegeId, selectedCollege]);

  // Reset initial mount flag when user changes
  useEffect(() => {
    isInitialMount.current = true;
  }, [user?.id]);

  // Fetch colleges on mount
  useEffect(() => {
    fetchColleges();
  }, []);

  // Fetch programs when college changes or for teachers on mount
  useEffect(() => {
    if (selectedCollege) {
      fetchPrograms(selectedCollege);
    } else if (user?.role === 'TEACHER' && user?.collegeId) {
      // For teachers, fetch programs from their assigned college
      fetchPrograms(user.collegeId);
    } else {
      setPrograms([]);
      setSelectedProgram(null);
      setSelectedBatch(null);
    }
  }, [selectedCollege, user?.role, user?.collegeId]);

  // Fetch batches when program changes
  useEffect(() => {
    if (selectedProgram) {
      fetchBatches(selectedProgram);
    } else {
      setBatches([]);
      setSelectedBatch(null);
    }
  }, [selectedProgram]);

  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/colleges');
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
    }
  };

  const fetchPrograms = async (collegeId: string) => {
    setLoadingPrograms(true);
    try {
      const response = await fetch(`/api/programs?collegeId=${collegeId}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
        // Only reset selections if this is not the teacher's auto-fetch
        if (!(user?.role === 'TEACHER' && collegeId === user.collegeId && !selectedCollege)) {
          setSelectedProgram(null);
          setSelectedBatch(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchBatches = async (programId: string) => {
    setLoadingBatches(true);
    try {
      const response = await fetch(`/api/batches?programId=${programId}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
        // Auto-select newest batch
        if (data.length > 0) {
          setSelectedBatch(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleSetSelectedCollege = (collegeId: string | null) => {
    setSelectedCollege(collegeId);
    // Clear dependent selections
    setSelectedProgram(null);
    setSelectedBatch(null);
  };

  const handleSetSelectedProgram = (programId: string | null) => {
    setSelectedProgram(programId);
    // Clear dependent selection
    setSelectedBatch(null);
  };

  const handleSetSelectedBatch = (batchId: string | null) => {
    setSelectedBatch(batchId);
    // Also update user's batchId if it's different
    if (user && batchId !== user.batchId) {
      updateUserSelections({ batchId: batchId || undefined });
    }
  };

  const getContextString = () => {
    const params = new URLSearchParams();
    if (selectedCollege) params.append('collegeId', selectedCollege);
    if (selectedProgram) params.append('programId', selectedProgram);
    if (selectedBatch) params.append('batchId', selectedBatch);
    return params.toString();
  };

  return (
    <SidebarContext.Provider
      value={{
        selectedCollege,
        selectedProgram,
        selectedBatch,
        colleges,
        programs,
        batches,
        loadingPrograms,
        loadingBatches,
        setSelectedCollege: handleSetSelectedCollege,
        setSelectedProgram: handleSetSelectedProgram,
        setSelectedBatch: handleSetSelectedBatch,
        getContextString,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}