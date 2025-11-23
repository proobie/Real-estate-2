import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property } from '../types';
import { API_BASE_URL } from '../api';

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  fetchProperty: (id: string) => Promise<Property | null>;
  addProperty: (formData: FormData) => Promise<Property>;
  updateProperty: (id: string, data: FormData) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  bulkUpload: (formData: FormData) => Promise<any>;
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[PropertyContext] Fetching from:', `${API_BASE_URL}/api/properties`);
      const res = await fetch(`${API_BASE_URL}/api/properties`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[PropertyContext] API Error:', res.status, res.statusText, errorText);
        throw new Error(`Failed to fetch properties: ${res.status} ${res.statusText}. ${errorText || 'Check if backend server is running.'}`);
      }

      const raw = await res.json();
      console.log('[PropertyContext] Received properties:', Array.isArray(raw) ? raw.length : 'Not an array');

      if (!Array.isArray(raw)) {
        console.error('[PropertyContext] Response is not an array:', raw);
        throw new Error('Invalid response format: expected array');
      }

      const parseArray = (val: any): any => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };
      const parseObj = (val: any): any => {
        if (!val) return {};
        if (typeof val === 'object' && !Array.isArray(val)) return val;
        try {
          return JSON.parse(val);
        } catch {
          return {};
        }
      };

      const cleaned = raw.map((p: any) => ({
        ...p,
        images: parseArray(p.images),
        features: parseArray(p.features),
        highlights: parseArray(p.highlights),
        location: parseObj(p.location),
        agent: parseObj(p.agent),
        // Preserve creator/profile data if available from backend join
        // Handle both array and object formats from Supabase join
        creator: (p.profiles && (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles)) ? {
          id: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles).id || p.createdBy,
          name: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles).name || '',
          email: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles).contact_email || '',
          phone: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles).contact_phone || '',
          avatar: (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles).avatar_url || '',
        } : undefined,
      }));
      setProperties(cleaned);
      console.log('[PropertyContext] Successfully loaded', cleaned.length, 'properties');
    } catch (err: any) {
      console.error('[PropertyContext] Error loading properties:', err);
      const errorMessage = err.message || 'Failed to load properties';

      // Provide helpful error messages
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running on port 5000.`);
      } else {
        setError(errorMessage);
      }
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const refresh = loadProperties;

  const fetchProperty = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`);
      if (!res.ok) throw new Error('Property not found');
      return res.json();
    } catch {
      return null;
    }
  };

  const addProperty = async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to add property');
    const newProperty = await res.json();
    await loadProperties(); // Refresh the list after adding
    return newProperty;
  };

  const bulkUpload = async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/properties/bulk-upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Bulk upload failed');
    const result = await res.json();
    await loadProperties();
    return result;
  };

  const updateProperty = async (id: string, formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      body: formData
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Update property error:", errorBody);
      throw new Error(`Failed to update property: ${res.statusText}`);
    }
    await loadProperties(); // Refresh the list after update
  };

  const deleteProperty = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await loadProperties(); // Refresh the list after deletion
    }
  };

  const value: PropertyContextType = {
    properties,
    loading,
    error,
    refresh,
    fetchProperty,
    addProperty,
    updateProperty,
    deleteProperty,
    bulkUpload,
    setProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
} 