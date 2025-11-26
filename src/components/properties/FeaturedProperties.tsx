import React from 'react';
import { useProperties } from '../../contexts/PropertyContext';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';

interface FeaturedPropertiesProps {
  onViewDetails?: (property: Property) => void;
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ onViewDetails }) => {
  const { properties, loading, error } = useProperties();
  const featuredProperties = properties.filter(
    (property) => property.featured && property.status === 'available'
  ).slice(0, 6);
  const navigate = useNavigate();

  const handleSaveProperty = (propertyId: string) => {
    // Handle save property functionality
  };

  const handleShareProperty = (property: Property) => {
    // Handle share property functionality
  };

  const handleContactAgent = (property: Property) => {
    // Handle contact agent functionality
  };

  const handleViewDetails = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  if (loading) return <div>Loading featured properties...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <section id="featured-properties" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-[#457B9D] max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties offering exceptional value and prime locations
          </p>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSave={handleSaveProperty}
                onShare={handleShareProperty}
                onContact={handleContactAgent}
                onViewDetails={() => navigate(`/properties/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-lg font-semibold text-[#1D3557] mb-2">
                No Featured Properties Available
              </h3>
              <p className="text-[#457B9D]">
                Featured properties will appear here once they are added by the admin.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/search')}
            className="bg-[#E63946] hover:bg-[#d12d3a] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            View All Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;