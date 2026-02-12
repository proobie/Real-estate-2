import React, { useState } from 'react';
import { MapPin, Building, Calendar, Users, Download, Eye, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildProjectUrl } from '../../utils/urlUtils';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
  onDownloadBrochure?: (project: Project) => void;
  homeVariant?: boolean; // use light gray backgrounds instead of mint when true
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onDownloadBrochure,
  homeVariant = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

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
        return 'bg-[#A8DADC] text-[#1D3557] border-[#A8DADC]';
      case 'ongoing':
        return 'bg-[#457B9D] text-white border-[#457B9D]';
      case 'completed':
        return 'bg-[#1D3557] text-white border-[#1D3557]';
      case 'ready-to-move':
        return 'bg-[#E63946] text-white border-[#E63946]';
      default:
        return `${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} text-[#1D3557] border-[#A8DADC]`;
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

  const calculateAvailabilityPercentage = () => {
    return Math.round((project.availableUnits / project.totalUnits) * 100);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project);
      return;
    }
    navigate(buildProjectUrl(project));
  };

  const handleDownloadBrochure = () => {
    onDownloadBrochure?.(project);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      {/* Image Gallery */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <img
          src={project.images[currentImageIndex]}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Image Navigation */}
        {project.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
            >
              →
            </button>
          </>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${getStatusColor(project.status)}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 ${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-[#1D3557]`}>
          {calculateAvailabilityPercentage()}% Available
        </div>

        {/* Price Range */}
        <div className="absolute bottom-3 left-3 bg-[#1D3557] text-white px-3 py-1 rounded-full font-bold text-sm">
          {formatPrice(project.priceRange.min)} - {formatPrice(project.priceRange.max)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Title and Developer */}
        <div className="mb-3">
          <h3 className="text-lg md:text-xl font-bold text-[#1D3557] mb-1 line-clamp-1">
            {project.name}
          </h3>
          <div className="flex items-center text-[#457B9D] text-sm mb-2">
            <Building size={14} className="mr-1" />
            <span>by {project.developer}</span>
          </div>
          <div className="flex items-center text-[#457B9D] text-sm">
            <MapPin size={14} className="mr-1" />
            <span className="line-clamp-1">{project.location.address}, {project.location.city}</span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          <div className={`text-center p-2 ${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} rounded-lg`}>
            <div className="text-lg font-bold text-[#1D3557]">{project.totalUnits}</div>
            <div className="text-xs text-[#457B9D]">Total Units</div>
          </div>
          <div className={`text-center p-2 ${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} rounded-lg`}>
            <div className="text-lg font-bold text-[#457B9D]">{project.availableUnits}</div>
            <div className="text-xs text-[#457B9D]">Available</div>
          </div>
          <div className={`text-center p-2 ${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} rounded-lg`}>
            <div className="text-lg font-bold text-[#1D3557]">
              {project.completionDate ?
                new Date(project.completionDate).getFullYear() :
                '2026'
              }
            </div>
            <div className="text-xs text-[#457B9D]">Completion</div>
          </div>
        </div>

        {/* Unit Types */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {project.unitTypes.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="bg-[#A8DADC] text-[#1D3557] px-2 py-1 rounded-full text-xs font-medium"
              >
                {type}
              </span>
            ))}
            {project.unitTypes.length > 3 && (
              <span className={`${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} text-[#1D3557] px-2 py-1 rounded-full text-xs`}>
                +{project.unitTypes.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {project.amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className={`${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} text-[#1D3557] px-2 py-1 rounded-full text-xs`}
              >
                {amenity}
              </span>
            ))}
            {project.amenities.length > 4 && (
              <span className={`${homeVariant ? 'bg-gray-50' : 'bg-[#F1FAEE]'} text-[#1D3557] px-2 py-1 rounded-full text-xs`}>
                +{project.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-[#E63946] hover:bg-[#d12d3a] text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors"
          >
            View Details
          </button>
          <a
            href={project.brochure}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[#1D3557] text-[#1D3557] hover:bg-[#1D3557]/10 font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors text-center"
          >
            Brochure
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;