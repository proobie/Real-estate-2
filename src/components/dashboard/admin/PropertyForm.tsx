import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../../api';
import {
  ArrowLeft,
  Upload,
  X
} from 'lucide-react';
import { Property, Project } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

interface PropertyFormProps {
  property?: Property | null;
  onSave: (formData: FormData) => Promise<Property | null>;
  onCancel: () => void;
  isEdit: boolean;
  loading: boolean;
  submitError: string | null;
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSave,
  onCancel,
  isEdit,
  loading,
  submitError,
  setProperties,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Helper parsers (declared before state initialisation to avoid hoisting issues)
  const parseArrayField = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as string[];
    try {
      const parsed = JSON.parse(val as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseImages = (imgs: any): string[] => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs as string[];
    try {
      const parsed = JSON.parse(imgs as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const fixImageUrl = (u: string): string => {
    if (!u) return u;
    if (u.startsWith('http')) return u;
    if (u.startsWith('/')) return `${API_BASE_URL}${u}`;
    return `${API_BASE_URL}/${u}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || 0,
    type: property?.type || 'apartment',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    area: property?.area || 0,
    furnishing: property?.furnishing || 'unfurnished',
    possession: property?.possession || 'ready-to-move',
    parking: property?.parking || 'none',
    facing: property?.facing || 'north',
    floor: property?.floor || 0,
    totalFloors: property?.totalFloors || 0,
    ageOfProperty: property?.ageOfProperty || 0,
    location: {
      address: property?.location?.address || '',
      city: property?.location?.city || '',
      coordinates: property?.location?.coordinates || { lat: 0, lng: 0 }
    },
    features: property?.features || [],
    status: property?.status || 'available',
    featured: property?.featured || false,
    verified: property?.verified || false,
    reraId: property?.reraId || '',
    agent: property?.agent || {
      id: 'agent1',
      name: 'Priya Sharma',
      email: 'priya@propertyindia.com',
      phone: '+91 98765 43210',
      photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      specialization: 'Mumbai Properties',
      experience: 8,
      languages: ['Hindi', 'English', 'Marathi'],
      reraLicense: 'MH12345678'
    },
    projectId: property?.projectId || '',
    highlights: parseArrayField(property?.highlights),
    listingType: property?.listingType ?? 'sale',
    bookingAmount: property?.bookingAmount ?? '',
  });

  const [images, setImages] = useState<string[]>(parseImages(property?.images).map(fixImageUrl));
  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [listingType, setListingType] = useState<'sale' | 'rent'>(property?.listingType ?? 'sale');
  const [rentAmount, setRentAmount] = useState(property?.rentAmount || '');
  const [deposit, setDeposit] = useState(property?.deposit || '');
  const [leaseTerm, setLeaseTerm] = useState(property?.leaseTerm || '');
  const [maintenance, setMaintenance] = useState(property?.maintenance || '');

  useEffect(() => {
    // Fetch projects for dropdown
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      title: property?.title || '',
      description: property?.description || '',
      price: property?.price || 0,
      type: property?.type || 'apartment',
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      area: property?.area || 0,
      furnishing: property?.furnishing || 'unfurnished',
      possession: property?.possession || 'ready-to-move',
      parking: property?.parking || 'none',
      facing: property?.facing || 'north',
      floor: property?.floor || 0,
      totalFloors: property?.totalFloors || 0,
      ageOfProperty: property?.ageOfProperty || 0,
      location: {
        address: property?.location?.address || '',
        city: property?.location?.city || '',
        coordinates: property?.location?.coordinates || { lat: 0, lng: 0 }
      },
      features: parseArrayField(property?.features),
      status: property?.status || 'available',
      featured: property?.featured || false,
      verified: property?.verified || false,
      reraId: property?.reraId || '',
      agent: property?.agent || {
        id: 'agent1',
        name: 'Priya Sharma',
        email: 'priya@propertyindia.com',
        phone: '+91 98765 43210',
        photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        specialization: 'Mumbai Properties',
        experience: 8,
        languages: ['Hindi', 'English', 'Marathi'],
        reraLicense: 'MH12345678'
      },
      projectId: property?.projectId || '',
      highlights: parseArrayField(property?.highlights),
      listingType: property?.listingType ?? 'sale',
      bookingAmount: property?.bookingAmount ?? '',
    }));
    setImages(parseImages(property?.images).map(fixImageUrl));
    setImageFiles([]);
    setBrochureFile(null);
    setFloorPlanFile(null);
    setListingType(property?.listingType ?? 'sale');
    setRentAmount(property?.rentAmount ?? '');
    setDeposit(property?.deposit ?? '');
    setLeaseTerm(property?.leaseTerm ?? '');
    setMaintenance(property?.maintenance ?? '');
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 :
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'projectId') {
      setFormData(prev => ({ ...prev, projectId: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      // Generate preview URLs for the selected files
      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setImages(previewUrls);
    }
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBrochureFile(file);
  };

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFloorPlanFile(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...parseArrayField(prev.features), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.area <= 0) newErrors.area = 'Area must be greater than 0';
    if (!formData.location.address.trim()) newErrors['location.address'] = 'Address is required';
    if (!formData.location.city.trim()) newErrors['location.city'] = 'City is required';
    // Only require image upload if not editing or if both imageFiles and images are empty
    if (!isEdit && imageFiles.length === 0) newErrors.images = 'At least one image is required';
    if (isEdit && imageFiles.length === 0 && images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalFormData = new FormData();

    if (user) {
      finalFormData.append('createdBy', user.id);
      const agentData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photo: user.avatar || '',
        specialization: 'Mumbai Properties',
        experience: 8,
        languages: ['English', 'Hindi'],
        reraLicense: 'A123456789'
      };
      finalFormData.append('agent', JSON.stringify(agentData));
    }

    // Append all string/number/boolean fields
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'location' || key === 'agent' || key === 'features' || key === 'highlights') {
        finalFormData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        finalFormData.append(key, String(value));
      }
    }

    // Append files
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => finalFormData.append('images', file));
    } else if (isEdit) {
      finalFormData.append('existingImages', JSON.stringify(images));
    }

    if (brochureFile) finalFormData.append('brochure', brochureFile);
    if (floorPlanFile) finalFormData.append('floorPlan', floorPlanFile);

    // Append additional fields
    finalFormData.append('rentAmount', String(rentAmount));
    finalFormData.append('deposit', String(deposit));
    finalFormData.append('leaseTerm', leaseTerm);
    finalFormData.append('maintenance', String(maintenance));

    await onSave(finalFormData).then((newProperty) => {
      if (!isEdit && newProperty) {
        setProperties(prev => [...prev, newProperty]);
      }
    });
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'house', label: 'House' },
    { value: 'plot', label: 'Plot' },
    { value: 'office', label: 'Office' },
    { value: 'shop', label: 'Shop' },
    { value: 'warehouse', label: 'Warehouse' }
  ];

  const furnishingOptions = [
    { value: 'unfurnished', label: 'Unfurnished' },
    { value: 'semi-furnished', label: 'Semi Furnished' },
    { value: 'fully-furnished', label: 'Fully Furnished' }
  ];

  const possessionOptions = [
    { value: 'ready-to-move', label: 'Ready to Move' },
    { value: 'under-construction', label: 'Under Construction' }
  ];

  const parkingOptions = [
    { value: 'none', label: 'No Parking' },
    { value: 'open', label: 'Open Parking' },
    { value: 'covered', label: 'Covered Parking' }
  ];

  const facingOptions = [
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
    { value: 'north-east', label: 'North East' },
    { value: 'north-west', label: 'North West' },
    { value: 'south-east', label: 'South East' },
    { value: 'south-west', label: 'South West' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' },
    { value: 'under-offer', label: 'Under Offer' }
  ];

  const AMENITIES_OPTIONS = [
    "Cricket Pitch",
    "Volleyball Court",
    "Tennis Court",
    "Gazebo",
    "Swimming Pool",
    "Landscaping & Tree Planting",
    "Water Conservation",
    "Rain water Harvesting",
    "Gymnasium",
    "Fire Fighting System",
    "Community Buildings",
    "Closed Car Parking",
    "24X7 Water Supply",
    "Multipurpose Room",
    "Street Lighting",
    "Indoor Games",
    "Sports Facility",
    "Party Lawn",
    "Sewage Treatment Plant",
    "Club House",
    "Intercom",
    "Children's Play Area",
    "Entrance Lobby",
    "Steam Room",
    "Barbecue Area",
    "Recreation Facilities",
    "Solid Waste Management And Disposal",
    "Lift(s)",
    "Badminton Court",
    "24x7 CCTV Surveillance",
    "Video Door Security",
    "Community Hall",
    "Basketball Court",
    "Paved Compound",
    "Storm Water Drains",
    "Solar Water Heating",
    "Open Parking",
    "Internal Roads & Footpaths",
    "24x7 Security",
    "Electrical meter Room",
    "Energy management",
    "Power Backup",
    "Cafeteria"
  ];

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update property information' : 'Create a new property listing'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-24 md:pb-24" encType="multipart/form-data">
          {/* Basic Information */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Luxury 3 BHK Apartment in Bandra West"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Detailed description of the property..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., 4500000"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.area ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., 1450"
                />
                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RERA ID
                </label>
                <input
                  type="text"
                  name="reraId"
                  value={formData.reraId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., P51700000123"
                />
              </div>

              {/* Listing Details Section */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block mb-1 font-medium">Listing Type</label>
                    <select
                      value={listingType}
                      onChange={e => {
                        setListingType(e.target.value as 'sale' | 'rent');
                        setFormData(prev => ({ ...prev, listingType: e.target.value as 'sale' | 'rent' }));
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>
                  {listingType === 'sale' && (
                    <div>
                      <label className="block mb-1 font-medium">Booking Amount</label>
                      <input
                        type="number"
                        value={formData.bookingAmount}
                        onChange={e => setFormData(prev => ({ ...prev, bookingAmount: e.target.value }))}
                        required={listingType === 'sale'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 100000"
                        min="0"
                      />
                    </div>
                  )}
                  {listingType === 'rent' && (
                    <>
                      <div>
                        <label className="block mb-1 font-medium">Rent Amount</label>
                        <input
                          type="number"
                          value={rentAmount}
                          onChange={e => setRentAmount(e.target.value)}
                          required={listingType === 'rent'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 50000"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Deposit</label>
                        <input
                          type="number"
                          value={deposit}
                          onChange={e => setDeposit(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 200000"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Lease Term</label>
                        <input
                          type="text"
                          value={leaseTerm}
                          onChange={e => setLeaseTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 11 months"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Maintenance (per month)</label>
                        <input
                          type="number"
                          value={maintenance}
                          onChange={e => setMaintenance(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 5000"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Floors
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {furnishingOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession
                </label>
                <select
                  name="possession"
                  value={formData.possession}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {possessionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking
                </label>
                <select
                  name="parking"
                  value={formData.parking}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {parkingOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {facingOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['location.address'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Complete address"
                />
                {errors['location.address'] && <p className="text-red-500 text-sm mt-1">{errors['location.address']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['location.city'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="City, State"
                />
                {errors['location.city'] && <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images *</h2>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </button>
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add amenity"
                />
                <select
                  className="border rounded px-3 py-2 w-full sm:w-auto"
                  onChange={e => {
                    const val = e.target.value;
                    if (val && !formData.features.includes(val)) {
                      setFormData(prev => ({ ...prev, features: [...prev.features, val] }));
                    }
                    e.target.selectedIndex = 0;
                  }}
                >
                  <option value="">Select Amenity</option>
                  {AMENITIES_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-blue-600 text-white px-3 py-2 rounded w-full sm:w-auto"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.length > 0 && formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-1 text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={!!formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Property</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={!!formData.verified}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Brochure Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Brochure (PDF)</h2>
            <input type="file" accept="application/pdf" onChange={handleBrochureUpload} />
            {brochureFile && <span className="ml-2 text-sm text-gray-700">{brochureFile.name}</span>}
          </div>

          {/* Floor Plan Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Floor Plan (Image/PDF)</h2>
            <input type="file" accept="image/*,application/pdf" onChange={handleFloorPlanUpload} />
            {floorPlanFile && <span className="ml-2 text-sm text-gray-700">{floorPlanFile.name}</span>}
          </div>

          {/* Project */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project</h2>
            <select
              name="projectId"
              value={formData.projectId || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- No Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Property Highlights */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Highlights</h2>
            <div className="space-y-2">
              {formData.highlights && formData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={e => {
                      const newHighlights = [...formData.highlights];
                      newHighlights[idx] = e.target.value;
                      setFormData(prev => ({ ...prev, highlights: newHighlights }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== idx) }));
                    }}
                    className="text-red-500 hover:text-red-700 px-2"
                  >Remove</button>
                </div>
              ))}
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={e => setNewHighlight(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a highlight (e.g., RERA Approved)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newHighlight.trim()) {
                      setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), newHighlight.trim()] }));
                      setNewHighlight('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >Add</button>
              </div>
            </div>
          </div>

          {/* Actions - mobile fixed bar */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3">
            <div className="max-w-4xl mx-auto flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Save'}
              </button>
            </div>
          </div>
          {/* Actions - desktop full-width stable bar */}
          <div className="hidden md:block fixed bottom-0 left-64 right-0 z-20 border-t bg-white/95 backdrop-blur">
            <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-end gap-3 pr-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Save'}
              </button>
            </div>
          </div>
          {submitError && <div className="text-red-500 text-center mt-4">{submitError}</div>}
        </form>
      </div>
    </div>
  );
};

export default PropertyForm; 