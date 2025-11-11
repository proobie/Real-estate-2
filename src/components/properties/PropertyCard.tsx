import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Bed, Bath, Square, Camera, Share2 } from 'lucide-react';
import { Property, Agent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onSave?: (propertyId: string, isSaved: boolean) => void;
  onShare?: (property: Property) => void;
  onContact?: (property: Property) => void;
  onViewDetails?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved: initialIsSaved,
  onSave,
  onShare,
  onContact,
  onViewDetails
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const [fallbackAgent, setFallbackAgent] = useState<Agent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const ADMIN_PROFILE_ID = '1bd7c566-966e-445c-9163-dc59309fa5b0';
        const { data } = await supabase
          .from('profiles')
          .select('name, avatar_url, contact_email, contact_phone')
          .eq('id', ADMIN_PROFILE_ID)
          .single();
        if (data) {
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

  const agentToDisplay: Agent | undefined = (() => {
    if (property.agent && (property.agent.phone || property.agent.email || property.agent.name)) return property.agent;
    if (user?.role === 'admin') return {
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
    return fallbackAgent || undefined;
  })();

  useEffect(() => {
    if (user?.id) {
      setIsSaved(initialIsSaved);
    } else {
      setIsSaved(false);
    }
  }, [initialIsSaved, user?.id]);

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) {
          setIsSaved(false);
          return;
        }
        const { data, error } = await supabase
          .from('saved_properties')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', property.id)
          .maybeSingle();
        if (!error) setIsSaved(Boolean(data));
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, property.id]);

  const handleSave = async () => {
    if (!user?.id) {
      window.alert('Please log in to save properties.');
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);
        if (error) throw error;
        setIsSaved(false);
        onSave?.(property.id, false);
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: property.id });
        if (error) throw error;
        setIsSaved(true);
        onSave?.(property.id, true);
      }
    } catch {
      // Fallback to per-user localStorage when Supabase is unavailable
      try {
        const key = `saved_props:${user.id}`;
        const savedIds: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        const exists = savedIds.includes(property.id);
        const next = exists ? savedIds.filter(id => id !== property.id) : [...savedIds, property.id];
        localStorage.setItem(key, JSON.stringify(next));
        setIsSaved(!exists);
        onSave?.(property.id, !exists);
      } catch { /* ignore */ }
    }
  };

  const handleShare = () => {
    onShare?.(property);
  };

  const handleContact = () => {
    // Prefer phone linking; fallback to onContact
    if (agentToDisplay?.phone) {
      window.location.href = `tel:${agentToDisplay.phone}`;
      return;
    }
    onContact?.(property);
  };

  const handleViewDetails = () => {
    onViewDetails?.(property);
  };

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

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      {/* Image Gallery */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Image Navigation */}
        {property.images.length > 1 && (
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

            {/* Image Counter */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Camera size={12} />
              <span>{currentImageIndex + 1}/{property.images.length}</span>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all ${isSaved
              ? 'bg-[#E63946] text-white'
              : 'bg-white bg-opacity-90 text-gray-700 hover:bg-[#FDECEE] hover:text-[#E63946]'
              }`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Status Badge */}
        {property.featured && (
          <div className="absolute top-2 left-2 bg-[#E63946] text-white px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 bg-[#1D3557] text-white px-3 py-1 rounded-full font-bold">
          {property.listingType === 'rent' && property.rentAmount
            ? `₹${property.rentAmount.toLocaleString('en-IN')} / month`
            : formatPrice(property.price)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin size={14} className="mr-1" />
            <span className="line-clamp-1">{property.location.address}, {property.location.city}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4 text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center space-x-1">
              <Bed size={16} />
              <span className="text-sm">{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center space-x-1">
              <Bath size={16} />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Square size={16} />
            <span className="text-sm">{property.area} sq ft</span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="border-t border-gray-100 mt-3 pt-3 mb-4">
          <div className="flex items-center gap-3">
            {agentToDisplay && (
              <>
                <img
                  className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover shadow-sm"
                  src={agentToDisplay.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agentToDisplay.name || 'Agent')}`}
                  alt={agentToDisplay.name}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{agentToDisplay.name}</p>
                  <p className="text-xs text-gray-500 truncate">{agentToDisplay.specialization}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleContact}
            className="flex-1 bg-[#1D3557] hover:bg-[#0f2746] text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors"
          >
            Contact Agent
          </button>
          <button
            onClick={handleViewDetails}
            className="flex-1 border border-[#1D3557] text-[#1D3557] hover:bg-[#1D3557]/10 font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;