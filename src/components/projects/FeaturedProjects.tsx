import React, { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '../../types';
import { API_BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';

interface FeaturedProjectsProps {
  onViewDetails?: (project: Project) => void;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ onViewDetails }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) throw new Error('Failed to fetch projects');
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
          location: parseObject(p.location),
          priceRange: parseObject(p.priceRange),
        }));
        // --- End Parsing Logic ---

        setProjects(cleanedData);
      } catch (err: any) {
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleViewDetails = (project: Project) => {
    onViewDetails?.(project);
  };

  const handleDownloadBrochure = (project: Project) => {
    // Implement download logic if needed
  };

  if (loading) return <div className="text-center py-12">Loading projects...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <section id="featured-projects" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-[#457B9D] max-w-2xl mx-auto">
            Explore premium development projects by India's leading builders offering world-class amenities
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleViewDetails}
              onDownloadBrochure={handleDownloadBrochure}
              homeVariant
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/projects')}
            className="bg-[#E63946] hover:bg-[#d12d3a] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            View All Projects
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;