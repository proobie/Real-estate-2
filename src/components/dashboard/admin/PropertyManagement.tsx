import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  Users,
  Download,
  Upload,
  CheckCircle,
  Mail,
  Phone,
  User,
  RotateCw
} from 'lucide-react';
import { Property } from '../../../types';
import { useProperties } from '../../../contexts/PropertyContext';
import PropertyForm from './PropertyForm';
import { API_BASE_URL, authFetch } from '../../../api';
import { supabase } from '../../../supabaseClient';

const PropertyManagement: React.FC = () => {
  const { properties, loading, error, addProperty, updateProperty, deleteProperty, bulkUpload, setProperties, refresh } = useProperties();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<Record<string, { name: string; email: string; phone: string }>>({});

  const handleCreateProperty = () => {
    setSelectedProperty(null);
    setCurrentView('create');
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('edit');
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteProperty(propertyId);
    }
  };

  const handleSaveProperty = async (formData: FormData) => {
    if (selectedProperty) {
      await updateProperty(selectedProperty.id, formData);
      setCurrentView('list');
      setSelectedProperty(null);
      return null;
    } else {
      const newProperty = await addProperty(formData);
      setCurrentView('list');
      setSelectedProperty(null);
      return newProperty;
    }
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProperty(null);
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      'ID', 'Title', 'Description', 'Price', 'Type', 'Bedrooms', 'Bathrooms',
      'Area', 'Address', 'City', 'Status', 'Featured', 'Agent Name', 'Agent Email'
    ];

    const csvData = properties.map(property => [
      property.id,
      property.title,
      property.description,
      property.price,
      property.type,
      property.bedrooms,
      property.bathrooms,
      property.area,
      property.location.address,
      property.location.city,
      property.status,
      property.featured ? 'Yes' : 'No',
      property.agent?.name,
      property.agent?.email
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `properties_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleBulkUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setBulkLoading(true);
        setBulkError(null);
        setBulkSuccess(null);
        try {
          const formData = new FormData();
          formData.append('csv', file);
          const result = await bulkUpload(formData);
          setBulkSuccess(`Successfully imported ${result.imported} properties!`);
        } catch (err: any) {
          setBulkError(err.message || 'Bulk upload failed');
        } finally {
          setBulkLoading(false);
        }
      }
    };
    input.click();
  };

  const filteredProperties = properties
    .filter(property => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        (property.title && property.title.toLowerCase().includes(searchLower)) ||
        (property.location?.city && property.location.city.toLowerCase().includes(searchLower)) ||
        (property.location?.address && property.location.address.toLowerCase().includes(searchLower));
      const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
      const matchesType = filterType === 'all' || property.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      // Prioritize pending-approval properties at the top
      const aIsPending = a.status === 'pending-approval';
      const bIsPending = b.status === 'pending-approval';

      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      // If both are pending or both are not pending, sort by creation date (newest first)
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();

      // For pending-approval, newest first; for others, also newest first
      return bDate - aDate;
    });

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'under-offer': return 'bg-yellow-100 text-yellow-800';
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  const handleApproveProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to approve this property? It will become available on the frontend.')) {
      return;
    }
    setApprovingId(propertyId);
    try {
      const formData = new FormData();
      formData.set('status', 'available');
      await updateProperty(propertyId, formData);
      // Refresh properties list to get updated data
      await refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve property');
    } finally {
      setApprovingId(null);
    }
  };

  // Fetch client details for properties with createdBy (if not already loaded from backend join)
  useEffect(() => {
    const fetchClientDetails = async () => {
      // Fetch for all properties that have createdBy - ensure we have complete info
      const propertiesWithCreator = properties.filter(p => p.createdBy);
      if (propertiesWithCreator.length === 0) return;

      const userIds = [...new Set(propertiesWithCreator.map(p => p.createdBy!))];
      const details: Record<string, { name: string; email: string; phone: string }> = {};

      // Fetch from profiles table AND users API to get complete client information
      for (const userId of userIds) {
        try {
          let clientName = '';
          let clientEmail = '';
          let clientPhone = '';

          // Step 1: Try to get from profiles table (where Profile Information is saved)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, email, contact_email, contact_phone')
            .eq('id', userId)
            .single();

          if (!profileError && profile) {
            clientName = profile.name || '';
            clientEmail = profile.email || profile.contact_email || '';
            clientPhone = profile.contact_phone || '';
          }

          // Step 2: If email is missing, get from users API (auth.users has the email)
          if (!clientEmail) {
            try {
              const res = await authFetch(`${API_BASE_URL}/api/users`);
              if (res.ok) {
                const users = await res.json();
                const userData = Array.isArray(users) ? users.find((u: any) => u.id === userId) : null;
                if (userData) {
                  // Use email from auth.users (this is the client's login email)
                  clientEmail = userData.email || '';
                  // Also get name if not already found
                  if (!clientName) {
                    clientName = userData.name || userData.user_metadata?.name || '';
                  }
                  // Also get phone if not already found
                  if (!clientPhone) {
                    clientPhone = userData.user_metadata?.phone || userData.user_metadata?.contact_phone || '';
                  }
                }
              }
            } catch (apiErr) {
              console.error('Error fetching user from API:', apiErr);
            }
          }

          // Save the complete client information
          details[userId] = {
            name: clientName || 'Unknown User',
            email: clientEmail || 'No email',
            phone: clientPhone || 'No phone',
          };
        } catch (err) {
          console.error('Error fetching client details:', err);
          details[userId] = {
            name: `User ${userId.substring(0, 8)}`,
            email: 'No email available',
            phone: 'No phone available',
          };
        }
      }

      setClientDetails(prev => ({ ...prev, ...details }));
    };

    fetchClientDetails();
  }, [properties]);

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="h-full overflow-hidden">
        <PropertyForm
          property={selectedProperty}
          onSave={handleSaveProperty}
          onCancel={handleBack}
          isEdit={currentView === 'edit'}
          loading={bulkLoading}
          submitError={bulkError}
          setProperties={setProperties}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage your property listings and assignments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
          <button
            onClick={() => {
              refresh();
              setSearchQuery('');
              setFilterStatus('all');
              setFilterType('all');
            }}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh properties list"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleBulkUpload}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={handleCreateProperty}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'sold').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.status === 'pending-approval').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search properties by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="under-offer">Under Offer</option>
              <option value="pending-approval">Pending Approval</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="plot">Plot</option>
              <option value="office">Office</option>
              <option value="shop">Shop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">Error Loading Properties</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                refresh();
                setSearchQuery('');
                setFilterStatus('all');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
            <p className="text-xs text-red-500 mt-2">
              <strong>Tip:</strong> If the error persists, make sure your backend server is running on port 5000.
              <br />
              Check the browser console (F12) for more details.
            </p>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Loading properties...</p>
        </div>
      )}

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Properties ({filteredProperties.length} of {properties.length} total)
          </h3>
          {!loading && !error && properties.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">No properties found in database</p>
          )}
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 text-sm md:text-base">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.images && property.images.length > 0 && property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="50" dy=".3em" x="50%" y="50%" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {property.title}
                          {property.featured && (
                            <Star className="h-4 w-4 text-yellow-500 ml-1" fill="currentColor" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms}BHK • {property.area} sq ft
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {property.location?.city || property.location?.address || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {formatStatusLabel(property.status)}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.agent?.photo ? (
                        <img
                          src={property.agent.photo}
                          alt={property.agent.name}
                          className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-2">
                        <div className="text-sm text-gray-900">{property.agent?.name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm">
                      {property.createdBy ? (
                        (() => {
                          // Get client info - prioritize creator from backend, merge with clientDetails for missing fields
                          const backendCreator = property.creator;
                          const fetchedDetails = clientDetails[property.createdBy];

                          // Merge data: use backend creator first, then fill missing fields from fetched details
                          const clientInfo = backendCreator
                            ? {
                              name: backendCreator.name || fetchedDetails?.name || 'Unknown User',
                              email: backendCreator.email || fetchedDetails?.email || 'No email',
                              phone: backendCreator.phone || fetchedDetails?.phone || 'No phone',
                            }
                            : fetchedDetails;

                          if (clientInfo) {
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center text-gray-900 font-medium">
                                  <User className="h-3 w-3 mr-1 text-gray-500" />
                                  {clientInfo.name || 'Unknown User'}
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {clientInfo.email &&
                                    clientInfo.email !== 'No email' &&
                                    clientInfo.email !== 'No email available'
                                    ? clientInfo.email
                                    : 'No email'}
                                </div>
                                {clientInfo.phone &&
                                  clientInfo.phone !== 'No phone' &&
                                  clientInfo.phone !== 'No phone available' && (
                                    <div className="flex items-center text-xs text-gray-600">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {clientInfo.phone}
                                    </div>
                                  )}
                              </div>
                            );
                          }
                          return (
                            <div className="text-xs text-gray-500">
                              <div>Loading client info...</div>
                              <div className="text-gray-400">ID: {property.createdBy.substring(0, 8)}...</div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-xs text-gray-400">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* TODO: View property */ }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View property"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {property.status === 'pending-approval' && (
                        <button
                          onClick={() => handleApproveProperty(property.id)}
                          disabled={approvingId === property.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve property"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new property listing.
              </p>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>
      </div>

      {/* Bulk Upload Status */}
      {bulkLoading && <div className="text-blue-600 text-sm mt-2">Uploading...</div>}
      {bulkError && <div className="text-red-500 text-sm mt-2">{bulkError}</div>}
      {bulkSuccess && <div className="text-green-600 text-sm mt-2">{bulkSuccess}</div>}
    </div>
  );
};

export default PropertyManagement; 