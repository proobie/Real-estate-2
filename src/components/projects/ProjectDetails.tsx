import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Heart, Share2, MapPin, Building, Calendar, Users,
  Download, Eye, Phone, Mail, MessageCircle, Star, CheckCircle,
  Clock, Shield, Home, IndianRupee, Camera, Play, FileText,
  TrendingUp, Award, Zap, TreePine, Car, Wifi, Dumbbell
} from 'lucide-react';
import { Project } from '../../types';
import { supabase } from '../../supabaseClient';
import Footer from '../common/Footer';
import Seo from '../common/Seo';
import { buildProjectUrl } from '../../utils/urlUtils';

interface ProjectDetailsProps {
  project: Project;
  onBack?: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'floor-plans' | 'location' | 'pricing'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [inquiryType, setInquiryType] = useState<'site-visit' | 'brochure' | 'pricing' | 'booking'>('site-visit');
  const [selectedUnitType, setSelectedUnitType] = useState(project.unitTypes[0]);
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const ADMIN_PROFILE_ID = '1bd7c566-966e-445c-9163-dc59309fa5b0';
        const { data } = await supabase
          .from('profiles')
          .select('contact_phone, contact_email')
          .eq('id', ADMIN_PROFILE_ID)
          .single();
        setContactPhone(data?.contact_phone || '');
        setContactEmail(data?.contact_email || '');
      } catch { /* ignore */ }
    })();
  }, []);

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

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready-to-move':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === project.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.images.length - 1 : prev - 1
    );
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: project.description,
        url: window.location.href,
      });
    }
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();

    setShowContactForm(false);
  };

  const calculateAvailabilityPercentage = () => {
    return Math.round((project.availableUnits / project.totalUnits) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title={project.name} description={project.description || undefined} image={project.images?.[0]} url={`${(import.meta.env.VITE_SITE_URL || 'https://lotliterealestate.com').replace(/\/$/, '')}${buildProjectUrl(project)}`} type="product" />
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Projects</span>
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
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visit our office banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white border border-blue-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#0d47a1] font-semibold">
            <MapPin className="w-5 h-5" />
            <span>Visit our office to know more based on your criteria</span>
          </div>
          <div className="text-sm text-gray-700">
            Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057
            {' '}
            <a href="https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6" target="_blank" rel="noopener noreferrer" className="text-[#0d47a1] underline ml-1">Open in Maps</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={project.images[currentImageIndex]}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {project.images.length > 1 && (
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
                  <span>{currentImageIndex + 1}/{project.images.length}</span>
                </div>

                {/* Virtual Tour Button */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                    <Play size={16} />
                    <span>Virtual Tour</span>
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Image Thumbnails */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                        ? 'border-blue-500'
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

            {/* Project Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Title and Basic Info */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <Building size={18} className="mr-2" />
                  <span>by {project.developer}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={18} className="mr-2" />
                  <span>{project.location.address}, {project.location.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">
                    {formatPrice(project.priceRange.min)} - {formatPrice(project.priceRange.max)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Starting Price
                  </div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Building size={20} className="text-blue-600" />
                  <div>
                    <div className="font-semibold">{project.totalUnits}</div>
                    <div className="text-sm text-gray-500">Total Units</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Users size={20} className="text-green-600" />
                  <div>
                    <div className="font-semibold">{project.availableUnits}</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp size={20} className="text-purple-600" />
                  <div>
                    <div className="font-semibold">{calculateAvailabilityPercentage()}%</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                </div>
                {project.completionDate && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-orange-600" />
                    <div>
                      <div className="font-semibold text-sm">
                        {new Date(project.completionDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">Completion</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Types */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Available Configurations</h3>
                <div className="flex flex-wrap gap-2">
                  {project.unitTypes.map((type, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex flex-wrap gap-3 sm:gap-4 md:flex-nowrap md:space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'floor-plans', label: 'Floor Plans' },
                    { id: 'location', label: 'Location' },
                    { id: 'pricing', label: 'Pricing' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-normal break-words text-center ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
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
                    <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                    <p className="text-gray-600 leading-relaxed">{project.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Shield className="text-green-500" size={20} />
                        <span className="text-sm">RERA Approved Project</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Award className="text-blue-500" size={20} />
                        <span className="text-sm">Award Winning Developer</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Home className="text-purple-500" size={20} />
                        <span className="text-sm">Vastu Compliant</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <CheckCircle className="text-orange-500" size={20} />
                        <span className="text-sm">Bank Loan Approved</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Project Launch</span>
                        <span className="font-medium">Q2 2024</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Construction Start</span>
                        <span className="font-medium">Q3 2024</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Expected Completion</span>
                        <span className="font-medium">
                          {project.completionDate ?
                            new Date(project.completionDate).toLocaleDateString('en-IN') :
                            'Q4 2026'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Possession</span>
                        <span className="font-medium">Q1 2027</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">World-Class Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'floor-plans' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Floor Plans & Layouts</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.floorPlans.map((plan, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 h-48 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <FileText size={48} className="mx-auto mb-2" />
                            <p>Floor Plan {index + 1}</p>
                            <p className="text-sm">{project.unitTypes[index] || 'Layout'}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <a href={plan} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <Download size={16} />
                            <span>Download Plan</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {project.masterPlan && (
                    <div>
                      <h4 className="font-semibold mb-3">Master Plan</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 h-64 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Building size={48} className="mx-auto mb-2" />
                            <p>Project Master Plan</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <a href={project.masterPlan} target="_blank" rel="noopener noreferrer" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <Download size={16} />
                            <span>Download Master Plan</span>
                          </a>
                        </div>
                      </div>
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
                        title="Project Location Map"
                        className="w-full h-64 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent([project.location.address, project.location.city].filter(Boolean).join(', '))}&output=embed`}
                      />
                    </div>
                  </div>

                  {project.landmarks && project.landmarks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Nearby Landmarks & Connectivity</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Group landmarks by category */}
                        {Object.entries(project.landmarks.reduce((acc, landmark) => {
                          acc[landmark.category] = acc[landmark.category] || [];
                          acc[landmark.category].push(landmark);
                          return acc;
                        }, {} as Record<string, typeof project.landmarks>)).map(([category, landmarks]) => (
                          <div key={category}>
                            <h5 className="font-medium mb-2 text-blue-600">{category}</h5>
                            <div className="space-y-2">
                              {landmarks.map((landmark, idx) => (
                                <div key={idx} className="flex justify-between py-1 text-sm">
                                  <span className="text-gray-600">{landmark.name}</span>
                                  <span className="font-medium">{landmark.distance}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Pricing & Payment Plans</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.unitTypes.map((unitType, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{unitType}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Area</span>
                            <span className="font-medium">
                              {index === 0 ? '1,200' : index === 1 ? '1,450' : '1,800'} sq ft
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-medium">
                              {formatPrice(project.priceRange.min + (index * 5000000))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per sq ft</span>
                            <span className="font-medium">
                              ₹{Math.round((project.priceRange.min + (index * 5000000)) / (1200 + (index * 250))).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                          Get Detailed Pricing
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-4">Flexible Payment Plans</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">20%</div>
                        <div className="text-sm text-gray-600">On Booking</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">60%</div>
                        <div className="text-sm text-gray-600">During Construction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">20%</div>
                        <div className="text-sm text-gray-600">On Possession</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors">
                        Book Now with ₹1 Lakh
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Get Project Information</h3>

              <div className="space-y-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={18} />
                  <span>Send Inquiry</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a href={contactPhone ? `tel:${contactPhone}` : '#'} className="flex items-center justify-center space-x-2 py-2 px-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                  <a href={contactEmail ? `mailto:${contactEmail}` : '#'} className="flex items-center justify-center space-x-2 py-2 px-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Mail size={16} />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Calendar size={18} />
                  <span>Schedule Site Visit</span>
                </button>
                {project.brochure && (
                  <a href={project.brochure} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Download size={18} />
                    <span>Download Brochure</span>
                  </a>
                )}
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Eye size={18} />
                  <span>View Sample Flat</span>
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <IndianRupee size={18} />
                  <span>EMI Calculator</span>
                </button>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="text-green-500" size={20} />
                  <span className="text-sm">RERA Approved</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-sm">Construction Started</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-blue-500" size={20} />
                  <span className="text-sm">On Schedule</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="text-purple-500" size={20} />
                  <span className="text-sm">Award Winning Developer</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {project.availableUnits}
                </div>
                <div className="text-gray-600 mb-4">Units Available</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${calculateAvailabilityPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {calculateAvailabilityPercentage()}% Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Project Inquiry</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInquiry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="site-visit">Schedule Site Visit</option>
                  <option value="brochure">Download Brochure</option>
                  <option value="pricing">Get Pricing Details</option>
                  <option value="booking">Booking Information</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="I'm interested in this project..."
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Desktop-only footer */}
      <div className="hidden md:block"><Footer /></div>
      {/* Mobile bottom spacer to avoid content under mobile nav */}
      <div className="h-24 md:h-0" />
    </div>
  );
};

export default ProjectDetails;