export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: string;
  possession: string;
  parking: string;
  facing: string;
  floor: number;
  totalFloors: number;
  ageOfProperty: number;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  brochure?: string;
  floorPlan?: string;
  features: string[];
  status: string;
  featured: boolean;
  verified: boolean;
  reraId?: string;
  agent?: Agent;
  projectId?: string;
  createdBy?: string;
  creator?: User;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Fields for rental properties
  listingType: 'sale' | 'rent';
  rentAmount?: number;
  deposit?: number;
  leaseTerm?: string;
  availableFrom?: string;
  maintenance?: number;

  highlights?: string[];
  bookingAmount?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  developer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'ready-to-move';
  launchDate?: string;
  possession?: string;
  reraId?: string;
  approvals?: string[];
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  masterPlan?: string;
  floorPlans: string[];
  amenities: string[];
  priceRange: { min: number; max: number };
  unitTypes: string[];
  configurations?: { type: string; area: number; price: number }[];
  brochure?: string;
  completionDate?: string;
  totalUnits: number;
  availableUnits: number;
  bankApprovals?: string[];
  highlights?: string[];
  pricing?: Array<{ type: string; area: number; basePrice: number; pricePerSqFt: number }>;
  landmarks?: Array<{ name: string; distance: string; category: string }>;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  specialization: string;
  experience: number;
  languages: string[];
  reraLicense: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'client';
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  type: 'buyer' | 'renter' | 'seller' | 'landlord';
  priority: 'high' | 'medium' | 'low';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed' | 'Lost' | 'Site Visit';
  assignedTo?: string; // Should be User ID
  createdAt: string;
  updatedAt: string;
  notes: string;
  propertyId?: string;
  propertyTitle?: string;
}

export interface SearchAlert {
  id: string;
  criteria: SearchCriteria;
  frequency: 'daily' | 'weekly' | 'monthly';
  active: boolean;
}

export interface SearchCriteria {
  location?: string;
  type?: Property['type'];
  priceRange?: {
    min: number;
    max: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  areaRange?: {
    min: number;
    max: number;
  };
  features?: string[];
  furnishing?: Property['furnishing'];
  possession?: Property['possession'];
  parking?: Property['parking'];
}

export interface Inquiry {
  id: string;
  propertyId: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
  respondedAt?: string;
  inquiryType: 'site-visit' | 'price-negotiation' | 'documentation' | 'general';
}

export interface PGHostel {
  id: string;
  name: string;
  type: 'pg' | 'hostel' | 'co-living';
  gender: 'male' | 'female' | 'co-ed';
  rent: number;
  deposit: number;
  sharing: '1-sharing' | '2-sharing' | '3-sharing' | '4-sharing';
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  rules: string[];
  images: string[];
  meals: boolean;
  wifi: boolean;
  ac: boolean;
  laundry: boolean;
  availability: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}