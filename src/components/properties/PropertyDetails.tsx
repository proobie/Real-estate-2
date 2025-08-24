import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car,
  Calendar, Home, Shield, CheckCircle, Phone, Mail, MessageCircle,
  Camera, Play, Eye, Download, Star, Clock, Users, Wifi,
  Zap, Droplets, TreePine, Building, Navigation, IndianRupee
} from 'lucide-react';
import { useProperties } from '../../contexts/PropertyContext';
import { Property, Project, Agent } from '../../types';
import { addLead, API_BASE_URL } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import Footer from '../common/Footer';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { fetchProperty } = useProperties();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location' | 'emi'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<'inquiry' | 'site-visit'>('inquiry');
  const [form, setForm] = useState({ name: '', phone: '', message: '', preferredTime: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [inquiryType, setInquiryType] = useState<'site-visit' | 'price-negotiation' | 'documentation' | 'general'>('site-visit');
  const [project, setProject] = useState<Project | null>(null);
  const [fallbackAgent, setFallbackAgent] = useState<Agent | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);


  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchProperty(id)
      .then((data) => {
        if (data) {
          const parseArray = (val: any): any[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          };
          const parseObj = <T extends object>(val: any, defaultVal: T): T => {
            if (!val) return defaultVal;
            if (typeof val === 'object' && val !== null) return val as T;
            try {
              return JSON.parse(val) as T || defaultVal;
            } catch {
              return defaultVal;
            }
          };

          const cleanedData: Property = {
            ...data,
            images: parseArray(data.images),
            features: parseArray(data.features),
            highlights: parseArray(data.highlights),
            location: parseObj(data.location, { address: '', city: '', coordinates: { lat: 0, lng: 0 } }),
            agent: parseObj(data.agent, { id: '', name: '', email: '', phone: '', photo: '', specialization: '', experience: 0, languages: [], reraLicense: '' }),
            price: Number(data.price) || 0,
            area: Number(data.area) || 0,
            rentAmount: data.rentAmount ? Number(data.rentAmount) : undefined,
            deposit: data.deposit ? Number(data.deposit) : undefined,
            maintenance: data.maintenance ? Number(data.maintenance) : undefined,
          };

          setProperty(cleanedData);
        } else {
          setError('Property not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Property not found');
        setLoading(false);
      });
  }, [id, fetchProperty]);

  useEffect(() => {
    if (property && property.projectId) {
      fetch(`${API_BASE_URL}/api/projects/${property.projectId}`)
        .then(res => res.json())
        .then(setProject)
        .catch(() => setProject(null));
    } else {
      setProject(null);
    }
  }, [property]);

  // Removed runtime geocoding to avoid CORS; using Google Maps iframe with address

  useEffect(() => {
    // Check if user already submitted for this property
    if (property) {
      const submitted = localStorage.getItem(`lead_submitted_${property.id}`);
      if (submitted) setShowThankYou(true);
    }
  }, [property]);

  // Fetch a public fallback contact (from profiles) so anyone can see agent details
  useEffect(() => {
    (async () => {
      try {
        const ADMIN_PROFILE_ID = '1bd7c566-966e-445c-9163-dc59309fa5b0';
        let query = supabase
          .from('profiles')
          .select('name, avatar_url, contact_email, contact_phone')
          .eq('id', ADMIN_PROFILE_ID)
          .single();
        const { data, error } = await query;
        if (!error && data) {
          setFallbackAgent({
            id: ADMIN_PROFILE_ID,
            name: data.name || 'Team',
            email: data.contact_email || '',
            phone: data.contact_phone || '',
            photo: data.avatar_url || '',
            specialization: 'Agent',
            experience: 0,
            languages: [],
            reraLicense: ''
          });
        }
      } catch { /* ignore */ }
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96 text-lg">Loading property details...</div>;
  }
  if (error || !property) {
    return <div className="flex justify-center items-center h-96 text-red-500 text-lg">{error || 'Property not found'}</div>;
  }

  const agentToDisplay: Agent | undefined = (() => {
    // If property has an assigned agent with at least a name or phone/email, prefer it
    if (property.agent && (property.agent.name || property.agent.phone || property.agent.email)) {
      return property.agent;
    }
    // If an authenticated admin is present and no agent set, use admin details
    if (user?.role === 'admin') {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photo: user.avatar || '',
        specialization: 'Admin Contact',
        experience: 0,
        languages: [],
        reraLicense: ''
      } as Agent;
    }
    // Fallback to public profile row from Supabase
    if (fallbackAgent) return fallbackAgent;
    return undefined;
  })();



  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }
  };

  const calculateEMI = (principal: number, rate: number = 8.5, tenure: number = 20) => {
    const monthlyRate = rate / (12 * 100);
    const months = tenure * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    }
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();

    setShowContactForm(false);
  };

  const openContactForm = (purpose: 'inquiry' | 'site-visit') => {
    setContactPurpose(purpose);
    setShowContactForm(true);
    setForm({ name: '', phone: '', message: '', preferredTime: '' });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Name and phone are required.');
      return;
    }
    setFormLoading(true);
    try {

      await addLead({
        name: form.name,
        email: '',
        phone: form.phone,
        source: 'website',
        type: property.listingType === 'rent' ? 'renter' : 'buyer',
        priority: 'medium',
        status: contactPurpose === 'site-visit' ? 'Site Visit' : 'New',
        assignedTo: '',
        notes: `${contactPurpose === 'site-visit' ? 'Site Visit Request' : 'Inquiry'} for property: ${property.title} (${property.id})${form.preferredTime ? ' (Preferred Time: ' + form.preferredTime + ')' : ''}${form.message ? ' - ' + form.message : ''}`,
        propertyId: property.id,
        propertyTitle: property.title,
      });
      localStorage.setItem(`lead_submitted_${property.id}`, '1');
      setShowContactForm(false);
      setShowThankYou(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => { if (window.history.length > 1) { navigate(-1); } else { navigate('/'); } }}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Properties</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-all ${isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
              >
                <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Image Gallery */}
            {property && property.images && property.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-96 md:h-[500px]">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                    <Camera size={14} />
                    <span>{currentImageIndex + 1}/{property.images.length}</span>
                  </div>

                  {/* Virtual Tour Button */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                      <Play size={16} />
                      <span>Virtual Tour</span>
                    </button>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    {property.featured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    )}
                    {property.verified && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <CheckCircle size={14} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Thumbnails */}
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                          ? 'border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Title and Price */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={18} className="mr-2" />
                  <span>{property.location.address}, {property.location.city}</span>
                </div>

                {/* Office banner near top */}
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-[#e8f0ff] to-white border border-blue-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2">
                    <div className="text-[#0d47a1] font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Visit our office to know more based on your requirements</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057
                      {' '}
                      <a href="https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6" target="_blank" rel="noopener noreferrer" className="text-[#0d47a1] underline ml-1">Open in Maps</a>
                    </div>
                  </div>
                </div>
                {property.listingType === 'rent' ? (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg flex flex-col md:flex-row md:items-center md:space-x-8">
                    <div className="text-2xl font-bold text-primary mb-2 md:mb-0">
                      {property.rentAmount ? `₹${property.rentAmount.toLocaleString('en-IN')} / month` : 'Price not available'}
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-700 text-sm">
                      {typeof property.deposit === 'number' && !isNaN(property.deposit) && (
                        <div>
                          <span className="font-medium">Security Deposit:</span> ₹{property.deposit.toLocaleString('en-IN')}
                        </div>
                      )}
                      {property.leaseTerm && (
                        <div><span className="font-medium">Lease Term:</span> {property.leaseTerm}</div>
                      )}
                      {property.availableFrom && (
                        <div><span className="font-medium">Available From:</span> {new Date(property.availableFrom).toLocaleDateString('en-IN')}</div>
                      )}
                      {typeof property.maintenance === 'number' && !isNaN(property.maintenance) && (
                        <div>
                          <span className="font-medium">Maintenance:</span> ₹{property.maintenance.toLocaleString('en-IN')} / month
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-primary">{formatPrice(property.price)}</div>
                )}
                {property.listingType !== 'rent' && property.price && property.area && (
                  <div className="text-sm text-gray-500">
                    ₹{Math.round(property.price / property.area).toLocaleString('en-IN')}/sq ft
                  </div>
                )}
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Bed size={20} className="text-primary" />
                    <div>
                      <div className="font-semibold">{property.bedrooms} BHK</div>
                      <div className="text-sm text-gray-500">Bedrooms</div>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Bath size={20} className="text-primary" />
                    <div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-500">Bathrooms</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Square size={20} className="text-primary" />
                  <div>
                    <div className="font-semibold">{property.area}</div>
                    <div className="text-sm text-gray-500">Sq Ft</div>
                  </div>
                </div>
                {property.parking && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Car size={20} className="text-primary" />
                    <div>
                      <div className="font-semibold capitalize">{property.parking.replace('-', ' ')}</div>
                      <div className="text-sm text-gray-500">Parking</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'location', label: 'Location' },
                    ...(property.listingType !== 'rent' ? [{ id: 'emi', label: 'EMI Calculator' }] : [])
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{property.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Property Type</span>
                        <span className="font-medium capitalize">{property.type}</span>
                      </div>
                      {property.furnishing && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Furnishing</span>
                          <span className="font-medium capitalize">{property.furnishing.replace('-', ' ')}</span>
                        </div>
                      )}
                      {property.possession && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Possession</span>
                          <span className="font-medium capitalize">{property.possession.replace('-', ' ')}</span>
                        </div>
                      )}
                      {property.facing && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Facing</span>
                          <span className="font-medium capitalize">{property.facing.replace('-', ' ')}</span>
                        </div>
                      )}
                      {property.floor && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Floor</span>
                          <span className="font-medium">{property.floor} of {property.totalFloors}</span>
                        </div>
                      )}
                      {property.ageOfProperty && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Age of Property</span>
                          <span className="font-medium">{property.ageOfProperty} years</span>
                        </div>
                      )}
                      {property.reraId && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">RERA ID</span>
                          <span className="font-medium">{property.reraId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Features & Amenities</h3>
                  {property && property.features && property.features.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Location & Connectivity</h3>
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        title="Property Location Map"
                        className="w-full h-64 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent([property.location.address, property.location.city].filter(Boolean).join(', '))}&output=embed`}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Nearby Landmarks</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Metro Station</span>
                        <span className="font-medium">0.5 km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Shopping Mall</span>
                        <span className="font-medium">1.2 km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Hospital</span>
                        <span className="font-medium">2.0 km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">School</span>
                        <span className="font-medium">0.8 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emi' && property.listingType !== 'rent' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">EMI Calculator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Amount
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={property.price ? formatPrice(property.price * 0.8) : 'N/A'}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Rate (% per annum)
                        </label>
                        <input
                          type="number"
                          defaultValue="8.5"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Tenure (Years)
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent">
                          <option value="15">15 Years</option>
                          <option value="20" selected>20 Years</option>
                          <option value="25">25 Years</option>
                          <option value="30">30 Years</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-primary/10 p-6 rounded-lg">
                      <h4 className="font-semibold mb-4">EMI Breakdown</h4>
                      {property.price ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Monthly EMI</span>
                            <span className="font-bold text-primary">
                              {`₹${calculateEMI(property.price * 0.8).toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Principal Amount</span>
                            <span>{formatPrice(property.price * 0.8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest</span>
                            <span>
                              {formatPrice((calculateEMI(property.price * 0.8) * 240) - (property.price * 0.8))}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total Amount</span>
                            <span>{formatPrice(calculateEMI(property.price * 0.8) * 240)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          EMI details are not available as the property price is not specified.
                        </div>
                      )}
                      <button className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                        Get Pre-Approved Loan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {project && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                <div className="flex items-center mb-4">
                  <img src={project.images && project.images[0] ? project.images[0] : '/default-project.png'} alt={project.name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                    <div className="text-gray-600 text-sm mb-1">by {project.developer}</div>
                    <div className="flex items-center text-yellow-500 text-sm mb-1">
                      <Star size={16} className="mr-1" />
                      {project.status.replace(/-/g, ' ')}
                    </div>
                    <div className="text-gray-700 text-sm">
                      Price: {
                        typeof project.priceRange.min === 'number'
                          ? `₹${project.priceRange.min.toLocaleString()}`
                          : 'N/A'
                      } - {
                        typeof project.priceRange.max === 'number'
                          ? `₹${project.priceRange.max.toLocaleString()}`
                          : 'N/A'
                      }
                    </div>
                    <div className="text-gray-700 text-sm">
                      Configuration: {project.unitTypes.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <Link to={`/projects/${project.id}`} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">View Details</Link>
                  <span className="text-gray-500 text-sm">{project.totalUnits} units</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-96 space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={agentToDisplay?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agentToDisplay?.name || 'Agent')}`}
                  alt={agentToDisplay?.name || 'Agent'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{agentToDisplay?.name || 'Not Assigned'}</div>
                  <div className="text-sm text-gray-500">{agentToDisplay?.specialization || 'N/A'}</div>
                  <div className="flex items-center text-sm text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1">4.8 (127 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => openContactForm('inquiry')}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  disabled={showThankYou}
                >
                  <MessageCircle size={18} />
                  <span>Send Inquiry</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${agentToDisplay?.phone || ''}`}
                    className="flex items-center justify-center space-x-2 py-2 px-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${agentToDisplay?.email || ''}`}
                    className="flex items-center justify-center space-x-2 py-2 px-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg mb-4"
                onClick={() => openContactForm('site-visit')}
                disabled={showThankYou}
              >Schedule Site Visit</button>
              {property.brochure && (
                <a href={property.brochure} target="_blank" rel="noopener noreferrer" className="block w-full border border-gray-300 rounded-lg py-3 mb-2 text-center hover:bg-gray-50">
                  Download Brochure
                </a>
              )}
              {property.floorPlan && (
                <a href={property.floorPlan} target="_blank" rel="noopener noreferrer" className="block w-full border border-gray-300 rounded-lg py-3 text-center hover:bg-gray-50">
                  View Floor Plan
                </a>
              )}
            </div>

            {/* Property Highlights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Property Highlights</h3>
              {property.highlights && property.highlights.length > 0 && (
                <div className="space-y-3">
                  {property.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-only footer */}
      <div className="hidden md:block"><Footer /></div>

      {/* Contact Form Modal */}
      {showContactForm && !showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {contactPurpose === 'site-visit' ? 'Schedule Site Visit' : 'Send Inquiry'}
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleContactFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleContactFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleContactFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message {contactPurpose === 'site-visit' ? '(Optional)' : ''}
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleContactFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder={contactPurpose === 'site-visit' ? 'Any special requests or questions?' : 'I am interested in this property...'}
                ></textarea>
              </div>
              {contactPurpose === 'site-visit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time for Site Visit
                  </label>
                  <input
                    type="datetime-local"
                    name="preferredTime"
                    value={form.preferredTime}
                    onChange={handleContactFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              )}
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {formSuccess && <div className="text-green-600 text-sm">{formSuccess}</div>}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  disabled={formLoading}
                >
                  {formLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-8 flex flex-col items-center">
            <span className="text-4xl mb-4">🎉</span>
            <h3 className="text-xl font-bold mb-2 text-primary">Thank you!</h3>
            <p className="text-gray-700 text-center mb-4">Your request has been received.<br />You will get a response within 24 hours.</p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;