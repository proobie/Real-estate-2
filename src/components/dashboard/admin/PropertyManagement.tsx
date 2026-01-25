import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
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
  Upload
} from 'lucide-react';
import { Property } from '../../../types';
import { useProperties } from '../../../contexts/PropertyContext';
import PropertyForm from './PropertyForm';

const PropertyManagement: React.FC = () => {
  const { properties, addProperty, updateProperty, deleteProperty, bulkUpload, setProperties } = useProperties();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBhk, setFilterBhk] = useState<string>('all');
  const [filterFurnishing, setFilterFurnishing] = useState<string>('all');
  const [filterListingType, setFilterListingType] = useState<string>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    const matchesType = filterType === 'all' || property.type === filterType;
    const matchesBhk = filterBhk === 'all' || String(property.bedrooms) === filterBhk;
    const matchesFurnishing = filterFurnishing === 'all' || (property.furnishing || '').toLowerCase() === filterFurnishing;
    const matchesListing = filterListingType === 'all' || (property.listingType || '').toLowerCase() === filterListingType;

    return matchesSearch && matchesStatus && matchesType && matchesBhk && matchesFurnishing && matchesListing;
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage your property listings and assignments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
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
            
            <select
              value={filterBhk}
              onChange={(e) => setFilterBhk(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All BHK</option>
              {[...new Set(properties.map(p => String(p.bedrooms)))].sort().map(b => (
                <option key={b} value={b}>{b} BHK</option>
              ))}
            </select>

            <select
              value={filterFurnishing}
              onChange={(e) => setFilterFurnishing(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Furnishing</option>
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>

            <select
              value={filterListingType}
              onChange={(e) => setFilterListingType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Listing</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Properties ({filteredProperties.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 text-sm md:text-base">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover"
                      />
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
                      {property.location.city}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={property.agent?.photo}
                        alt={property.agent?.name}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full"
                      />
                      <div className="ml-2">
                        <div className="text-sm text-gray-900">{property.agent?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* TODO: View property */ }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Bulk Upload Status */}
      {bulkLoading && <div className="text-blue-600 text-sm mt-2">Uploading...</div>}
      {bulkError && <div className="text-red-500 text-sm mt-2">{bulkError}</div>}
      {bulkSuccess && <div className="text-green-600 text-sm mt-2">{bulkSuccess}</div>}
    </div>
  );
};

export default PropertyManagement; 