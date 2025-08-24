import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useProjects } from '../../../contexts/ProjectContext';
import { Project } from '../../../types';
import ProjectForm from './ProjectForm'; // Import the restored form

const ProjectManagement: React.FC = () => {
  const { projects, loading, error, deleteProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (Array.isArray(projects)) {
      setFilteredProjects(
        projects.filter(p =>
          (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.developer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.location?.city?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, projects]);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {

    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  if (isFormOpen) {
    return (
      <ProjectForm
        project={selectedProject}
        onCancel={handleCloseForm}
        isEdit={!!selectedProject}
      />
    );
  }

  if (loading) {
    return <div className="p-6">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading projects: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Project Management</h1>
        <button
          onClick={handleAddProject}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search projects by name, developer, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <tr key={project.id}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap font-medium text-gray-900">{project.name}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500">{project.developer}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500">{project.location?.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-500">{project.totalUnits}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleEditProject(project)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement; 