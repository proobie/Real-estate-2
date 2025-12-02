import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { API_BASE_URL } from './api';
import { PropertyProvider } from './contexts/PropertyContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginRegisterForm';
import ClientDashboard from './components/dashboard/client/ClientDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Hero from './components/home/Hero';
import FeaturedProperties from './components/properties/FeaturedProperties';
import FeaturedProjects from './components/projects/FeaturedProjects';
import ServiceSection from './components/common/ServiceSection';
import TestimonialSection from './components/common/TestimonialSection';
import HomePage from './components/home/HomePage';
import PropertyDetails from './components/properties/PropertyDetails';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ProjectDetails from './components/projects/ProjectDetails';
import { Project } from './types';
import SearchResults from './components/properties/SearchResults';
import { ProjectProvider } from './contexts/ProjectContext';
import WhatsAppWidget from './components/common/WhatsAppWidget';
import ChatAssistant from './components/common/ChatAssistant';
import ProjectsList from './components/projects/ProjectsList';
import MobileBottomNav from './components/common/MobileBottomNav';
import Blogs from "./components/blogs/blogs";
import BlogDetails from './components/blogs/blogdetails';

import EmployeeDashboard from './components/dashboard/admin/employee/EmployeeDashboard';


const ProjectDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects/${id}`);
        if (!res.ok) throw new Error('Project not found');
        const data = await res.json();

        // --- Start Parsing Logic ---
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
          try { return JSON.parse(val); } catch { return {}; }
        };

        const fixImageUrl = (u: string): string => {
          // API_BASE_URL is already imported
          if (!u) return u;
          if (u.startsWith('http')) return u;
          if (u.startsWith('/')) return `${API_BASE_URL}${u}`;
          return `${API_BASE_URL}/${u}`;
        };

        const cleanedData = {
          ...data,
          amenities: parseArray(data.amenities),
          unitTypes: parseArray(data.unitTypes),
          highlights: parseArray(data.highlights),
          pricing: parseArray(data.pricing),
          images: parseArray(data.images).map(fixImageUrl),
          floorPlans: parseArray(data.floorPlans),
          approvals: parseArray(data.approvals),
          bankApprovals: parseArray(data.bankApprovals),
          configurations: parseArray(data.configurations),
          landmarks: parseArray(data.landmarks),
          location: parseObject(data.location),
          priceRange: parseObject(data.priceRange),
        };
        // --- End Parsing Logic ---

        setProject(cleanedData);
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found.</div>;

  return <ProjectDetails project={project} onBack={() => navigate('/')} />;
};

function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProjectDetailsWrapper />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetails />} />
              {/* Add other routes as needed */}
            </Routes>
            <WhatsAppWidget />
            <ChatAssistant />
            <MobileBottomNav />
          </BrowserRouter>
        </ProjectProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;