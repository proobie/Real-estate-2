import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../api';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import Header from '../common/Header';
import Footer from '../common/Footer';

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [unitType, setUnitType] = useState<string>('');
  const [sort, setSort] = useState<'relevant' | 'priceLow' | 'priceHigh' | 'newest'>('relevant');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        const parseArray = (val: any): any[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try { return JSON.parse(val); } catch { return []; }
        };
        const parseObject = (val: any): object => {
          if (!val || typeof val === 'object') return val || {};
          try { return JSON.parse(val); } catch { return {}; }
        };
        const cleaned = data.map((p: any) => ({
          ...p,
          images: parseArray(p.images),
          floorPlans: parseArray(p.floorPlans),
          amenities: parseArray(p.amenities),
          configuration: parseArray(p.configurations),
          location: parseObject(p.location),
          priceRange: parseObject(p.priceRange)
        }));
        setProjects(cleaned);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (status && p.status !== status) return false;
      const min = (p.priceRange as any)?.min ? Number((p.priceRange as any).min) : undefined;
      const max = (p.priceRange as any)?.max ? Number((p.priceRange as any).max) : undefined;
      if (minPrice !== '' && (min ?? 0) < Number(minPrice)) return false;
      if (maxPrice !== '' && (max ?? 0) > Number(maxPrice)) return false;
      if (unitType && !(p.unitTypes || []).map((s: string) => s.toLowerCase()).includes(unitType.toLowerCase())) return false;
      return true;
    });
  }, [projects, status, minPrice, maxPrice, unitType]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'priceLow':
        return arr.sort((a, b) => ((a.priceRange as any)?.min ?? 0) - ((b.priceRange as any)?.min ?? 0));
      case 'priceHigh':
        return arr.sort((a, b) => ((b.priceRange as any)?.max ?? 0) - ((a.priceRange as any)?.max ?? 0));
      case 'newest':
        return arr.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      default:
        return arr;
    }
  }, [filtered, sort]);

  const clearAll = () => {
    setStatus(''); setMinPrice(''); setMaxPrice(''); setUnitType(''); setSort('relevant');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 w-full bg-white rounded-lg shadow-sm border p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button onClick={clearAll} className="text-sm text-primary-dark hover:underline">Clear All</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="ready-to-move">Ready To Move</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-md" />
                  <input value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Types</label>
                <input value={unitType} onChange={e => setUnitType(e.target.value)} type="text" placeholder="e.g., 2 BHK, 3 BHK" className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{sorted.length} Projects</h1>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by</label>
                <select value={sort} onChange={e => setSort(e.target.value as any)} className="px-3 py-2 border rounded-md">
                  <option value="relevant">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && sorted.length === 0 && (
              <div className="text-gray-500 text-lg">No projects match your filters.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sorted.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default ProjectsList;


