import React, { useEffect, useState } from 'react';
import { useProjects } from '../../../../contexts/ProjectContext';
import { Search } from 'lucide-react';

const EmployeeProjectView: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState(projects || []);

  useEffect(() => {
    if (Array.isArray(projects)) {
      setFiltered(
        projects.filter(p =>
          (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.developer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.location?.city?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, projects]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
        <span className="text-xs md:text-sm text-gray-500">View-only</span>
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

      {loading && <div className="p-6">Loading projects...</div>}
      {error && <div className="p-6 text-red-500">Error loading projects: {error}</div>}

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filtered) && filtered.length > 0 ? (
                filtered.map(project => (
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProjectView;


