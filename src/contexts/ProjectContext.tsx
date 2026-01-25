import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '../types';
import { API_BASE_URL } from '../api';

// --- API Functions ---
async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE_URL}/api/projects`);
  if (!res.ok) {
    // If the response is not OK, throw an error with the status
    throw new Error(`Failed to fetch projects: ${res.statusText}`);
  }
  return res.json();
}

// --- Context Shape ---
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => void;
  addProject: (formData: FormData) => Promise<Project>;
  updateProject: (id: string, formData: FormData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// --- Provider Component ---
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      // Ensure projects is always an array
      if (!Array.isArray(data)) {
        setProjects([]);
        return;
      }

      const parseArray = (val: any): any[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
      };

      const parseObject = (val: any): object => {
        if (!val || typeof val === 'object') return val || {};
        try {
          return JSON.parse(val);
        } catch { return {}; }
      };

      const cleanedData = data.map((p: any) => ({
        ...p,
        amenities: parseArray(p.amenities),
        unitTypes: parseArray(p.unitTypes),
        highlights: parseArray(p.highlights),
        pricing: parseArray(p.pricing),
        images: parseArray(p.images),
        floorPlans: parseArray(p.floorPlans),
        approvals: parseArray(p.approvals),
        bankApprovals: parseArray(p.bankApprovals),
        configurations: parseArray(p.configurations),
        landmarks: parseArray(p.landmarks),
        location: parseObject(p.location),
        priceRange: parseObject(p.priceRange),
      }));

      setProjects(cleanedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      setProjects([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to add project');
    const newProject = await res.json();
    await loadProjects(); // Refresh the list
    return newProject;
  };

  const updateProject = async (id: string, formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update project');
    const updatedProject = await res.json();
    await loadProjects(); // Refresh the list
    return updatedProject;
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
    await loadProjects(); // Refresh the list
  };

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    refreshProjects: loadProjects,
    addProject,
    updateProject,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// --- Hook ---
export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 