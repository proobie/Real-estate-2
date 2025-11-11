import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '../../../api';
import { supabase } from '../../../supabaseClient';
import { Bed, Bath, Square, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function parseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseObj(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
}

// Calculate similarity score between two properties
function calculateSimilarity(prop1, prop2) {
  let score = 0;
  let factors = 0;

  // Location similarity (city)
  if (prop1.location?.city && prop2.location?.city) {
    if (prop1.location.city.toLowerCase() === prop2.location.city.toLowerCase()) {
      score += 30;
    }
    factors++;
  }

  // Price range similarity (within 20% range)
  const price1 = prop1.price || prop1.rentAmount || 0;
  const price2 = prop2.price || prop2.rentAmount || 0;
  if (price1 > 0 && price2 > 0) {
    const diff = Math.abs(price1 - price2) / Math.max(price1, price2);
    if (diff <= 0.2) score += 25;
    else if (diff <= 0.4) score += 15;
    factors++;
  }

  // Listing type similarity
  if (prop1.listingType && prop2.listingType) {
    if (prop1.listingType === prop2.listingType) {
      score += 15;
    }
    factors++;
  }

  // Bedrooms similarity
  if (prop1.bedrooms && prop2.bedrooms) {
    const bedDiff = Math.abs(prop1.bedrooms - prop2.bedrooms);
    if (bedDiff === 0) score += 10;
    else if (bedDiff === 1) score += 5;
    factors++;
  }

  // Bathrooms similarity
  if (prop1.bathrooms && prop2.bathrooms) {
    const bathDiff = Math.abs(prop1.bathrooms - prop2.bathrooms);
    if (bathDiff === 0) score += 10;
    else if (bathDiff === 1) score += 5;
    factors++;
  }

  // Area similarity (within 20% range)
  if (prop1.area && prop2.area) {
    const areaDiff = Math.abs(prop1.area - prop2.area) / Math.max(prop1.area, prop2.area);
    if (areaDiff <= 0.2) score += 10;
    factors++;
  }

  return factors > 0 ? score / factors : 0;
}

// Extract client preferences from inquiries and saved properties
function extractPreferences(inquiries, savedProperties, allProperties) {
  const preferences = {
    locations: new Set(),
    priceRange: { min: Infinity, max: -Infinity },
    listingTypes: new Set(),
    bedrooms: new Set(),
    bathrooms: new Set(),
    propertyTypes: new Set(),
    areas: [],
  };

  const propertyIds = new Set();

  // Add property IDs from inquiries
  inquiries.forEach(inq => {
    if (inq.propertyId) propertyIds.add(inq.propertyId);
  });

  // Add property IDs from saved properties
  savedProperties.forEach(prop => {
    if (prop.id) propertyIds.add(prop.id);
  });

  // Analyze properties the client has interacted with
  propertyIds.forEach(id => {
    const prop = allProperties.find(p => p.id === id);
    if (!prop) return;

    if (prop.location?.city) preferences.locations.add(prop.location.city);
    if (prop.location?.address) preferences.locations.add(prop.location.address);

    const price = prop.price || prop.rentAmount || 0;
    if (price > 0) {
      preferences.priceRange.min = Math.min(preferences.priceRange.min, price);
      preferences.priceRange.max = Math.max(preferences.priceRange.max, price);
    }

    if (prop.listingType) preferences.listingTypes.add(prop.listingType);
    if (prop.bedrooms) preferences.bedrooms.add(prop.bedrooms);
    if (prop.bathrooms) preferences.bathrooms.add(prop.bathrooms);
    if (prop.type) preferences.propertyTypes.add(prop.type);
    if (prop.area) preferences.areas.push(prop.area);
  });

  return {
    locations: Array.from(preferences.locations),
    priceRange: preferences.priceRange.min !== Infinity ? preferences.priceRange : null,
    listingTypes: Array.from(preferences.listingTypes),
    bedrooms: Array.from(preferences.bedrooms),
    bathrooms: Array.from(preferences.bathrooms),
    propertyTypes: Array.from(preferences.propertyTypes),
    avgArea: preferences.areas.length > 0
      ? preferences.areas.reduce((a, b) => a + b, 0) / preferences.areas.length
      : null,
  };
}

export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const user = session?.session?.user || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Load inquiries
      const inquiriesRes = await fetch(`${API_BASE_URL}/api/user/inquiries`, { headers });
      let inquiriesList = [];
      if (inquiriesRes.ok) {
        const data = await inquiriesRes.json();
        inquiriesList = Array.isArray(data) ? data : [];
      }
      setInquiries(inquiriesList);

      // Load saved properties
      if (user) {
        const { data: savedData } = await supabase
          .from('saved_properties')
          .select('property_id, properties(*)')
          .eq('user_id', user.id);

        let saved = [];
        if (savedData && Array.isArray(savedData)) {
          saved = savedData.map(r => r.properties).filter(Boolean);
        }

        // Fallback to property IDs
        if (saved.length === 0) {
          const { data: idsData } = await supabase
            .from('saved_properties')
            .select('property_id')
            .eq('user_id', user.id);
          const ids = (idsData || []).map(r => r.property_id).filter(Boolean);
          if (ids.length > 0) {
            const { data: propsData } = await supabase
              .from('properties')
              .select('*')
              .in('id', ids);
            if (propsData) saved = propsData;
          }
        }
        setSavedProperties(saved);
      }

      // Load all properties
      const propertiesRes = await fetch(`${API_BASE_URL}/api/properties`);
      if (!propertiesRes.ok) throw new Error('Failed to load properties');
      const rawProperties = await propertiesRes.json();

      const cleanedProperties = rawProperties.map((p) => ({
        ...p,
        images: parseArray(p.images),
        features: parseArray(p.features),
        highlights: parseArray(p.highlights),
        location: parseObj(p.location),
        agent: parseObj(p.agent),
      }));

      setAllProperties(cleanedProperties);
    } catch (e) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', e);
    } finally {
      setLoading(false);
    }
  }

  const recommendations = useMemo(() => {
    if (!allProperties.length) return [];

    // Get interacted property IDs
    const interactedIds = new Set();
    inquiries.forEach(inq => {
      if (inq.propertyId) interactedIds.add(inq.propertyId);
    });
    savedProperties.forEach(prop => {
      if (prop.id) interactedIds.add(prop.id);
    });

    // Extract preferences
    const preferences = extractPreferences(inquiries, savedProperties, allProperties);

    // Score and rank properties
    const scored = allProperties
      .filter(prop => !interactedIds.has(prop.id)) // Exclude already interacted properties
      .map(prop => {
        let score = 0;
        const reasons = [];

        // Similarity to interacted properties
        let maxSimilarity = 0;
        [...inquiries, ...savedProperties].forEach(interacted => {
          const interactedProp = allProperties.find(p =>
            p.id === (interacted.propertyId || interacted.id)
          );
          if (interactedProp) {
            const similarity = calculateSimilarity(prop, interactedProp);
            maxSimilarity = Math.max(maxSimilarity, similarity);
          }
        });
        score += maxSimilarity * 0.5;
        if (maxSimilarity > 50) reasons.push('Similar to your interests');

        // Location match
        if (preferences.locations.length > 0) {
          const propLocation = prop.location?.city || prop.location?.address || '';
          const locationMatch = preferences.locations.some(loc =>
            propLocation.toLowerCase().includes(loc.toLowerCase()) ||
            loc.toLowerCase().includes(propLocation.toLowerCase())
          );
          if (locationMatch) {
            score += 20;
            reasons.push('In your preferred location');
          }
        }

        // Price range match
        if (preferences.priceRange) {
          const price = prop.price || prop.rentAmount || 0;
          if (price >= preferences.priceRange.min * 0.8 &&
            price <= preferences.priceRange.max * 1.2) {
            score += 15;
            if (!reasons.some(r => r.includes('price'))) {
              reasons.push('Matches your price range');
            }
          }
        }

        // Listing type match
        if (preferences.listingTypes.length > 0 &&
          preferences.listingTypes.includes(prop.listingType)) {
          score += 10;
          if (!reasons.some(r => r.includes('type'))) {
            reasons.push(`Matches your preferred ${prop.listingType} type`);
          }
        }

        // Bedrooms match
        if (preferences.bedrooms.length > 0 &&
          preferences.bedrooms.includes(prop.bedrooms)) {
          score += 8;
        }

        // Featured property boost
        if (prop.featured) {
          score += 15;
          reasons.push('Featured property');
        }

        // Verified property boost
        if (prop.verified) {
          score += 10;
        }

        return { property: prop, score, reasons };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12) // Top 12 recommendations
      .map(item => item.property);

    // If no recommendations based on preferences, show featured properties
    if (scored.length === 0) {
      return allProperties
        .filter(prop => prop.featured && !interactedIds.has(prop.id))
        .slice(0, 12);
    }

    return scored;
  }, [allProperties, inquiries, savedProperties]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Property Recommendations</h3>
        <p className="text-sm text-gray-500 mt-1">
          Properties tailored to your preferences based on your inquiry history and saved properties.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden bg-white animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-10">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            No recommendations available yet.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Start exploring properties, save your favorites, or make inquiries to get personalized recommendations!
          </p>
          <button
            onClick={() => navigate('/search')}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((prop) => {
            const price = prop.listingType === 'rent' && prop.rentAmount
              ? `₹${Number(prop.rentAmount).toLocaleString('en-IN')}/mo`
              : (prop.price ? `₹${Number(prop.price).toLocaleString('en-IN')}` : '—');

            return (
              <div
                key={prop.id}
                className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/properties/${prop.id}`)}
              >
                <div className="relative h-48 bg-gray-100">
                  {Array.isArray(prop.images) && prop.images[0] ? (
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {prop.featured && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                      Featured
                    </span>
                  )}
                  {prop.status && (
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${String(prop.status).toLowerCase().includes('sold')
                          ? 'bg-gray-700 text-white'
                          : String(prop.status).toLowerCase().includes('price')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {String(prop.status).toLowerCase().includes('new')
                        ? 'New Listing'
                        : String(prop.status).toLowerCase().includes('price')
                          ? 'Price Reduced'
                          : String(prop.status).toLowerCase().includes('sold')
                            ? 'Sold'
                            : prop.status}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{prop.title}</h4>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {prop.location?.address || prop.location?.city || 'Location not specified'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-gray-700">
                    <div className="flex items-center space-x-3">
                      {prop.bedrooms && (
                        <div className="flex items-center space-x-1">
                          <Bed className="h-4 w-4" />
                          <span className="text-sm">{prop.bedrooms} BHK</span>
                        </div>
                      )}
                      {prop.bathrooms && (
                        <div className="flex items-center space-x-1">
                          <Bath className="h-4 w-4" />
                          <span className="text-sm">{prop.bathrooms}</span>
                        </div>
                      )}
                      {prop.area && (
                        <div className="flex items-center space-x-1">
                          <Square className="h-4 w-4" />
                          <span className="text-sm">{prop.area} sq ft</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-semibold text-lg text-gray-900">{price}</div>
                    {prop.listingType && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded capitalize">
                        {prop.listingType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${prop.id}`);
                    }}
                    className="mt-4 w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 rounded-md transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

