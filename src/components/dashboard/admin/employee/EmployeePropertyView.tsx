import React, { useMemo, useState } from 'react';
import { useProperties } from '../../../../contexts/PropertyContext';
import { Home, MapPin, Search } from 'lucide-react';

const EmployeePropertyView: React.FC = () => {
  const { properties, loading, error } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = useMemo(() => {
    return properties
      .filter(p => {
        const s = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
          (p.title && p.title.toLowerCase().includes(s)) ||
          (p.location?.city && p.location.city.toLowerCase().includes(s)) ||
          (p.location?.address && p.location.address.toLowerCase().includes(s));
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchesType = filterType === 'all' || p.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
  }, [properties, searchQuery, filterStatus, filterType]);

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

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Properties</h1>
        <span className="text-xs md:text-sm text-gray-500">View-only</span>
      </div>

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

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">Failed to load properties</div>}
      {loading && <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">Loading properties...</div>}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Properties ({filtered.length} of {properties.length} total)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 text-sm md:text-base">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {p.images && p.images.length > 0 && p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{p.title}</div>
                        <div className="text-sm text-gray-500">{p.bedrooms}BHK • {p.area} sq ft</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {p.location?.city || p.location?.address || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(p.price)}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">No properties found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePropertyView;


