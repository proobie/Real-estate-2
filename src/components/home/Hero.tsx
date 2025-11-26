import React, { useMemo, useState } from 'react';
import { Search, MapPin, Home, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import Fuse from 'fuse.js';

const Hero: React.FC = () => {
  const [searchType, setSearchType] = useState<'buy' | 'rent' | 'pg'>('buy');
  const [propertyType, setPropertyType] = useState('all');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const navigate = useNavigate();
  const { properties } = useProperties();

  // Build locality-only suggestions (smart/fuzzy)
  const suggestionItems = useMemo(() => {
    const localities = new Set<string>();
    const add = (label: string) => {
      const v = (label || '').trim();
      if (!v) return;
      if (v.length < 3) return;
      // Skip tokens that are mostly numbers
      if (/\d{3,}/.test(v)) return;
      localities.add(v);
    };
    properties.forEach(p => {
      add(p.location?.city || '');
      const addr = p.location?.address || '';
      addr.split(',').map(s => s.trim()).forEach(add);
    });
    return Array.from(localities).map(label => ({ label, type: 'Locality' as const }));
  }, [properties]);

  const fuse = useMemo(() => new Fuse(suggestionItems, {
    keys: ['label'],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.4,
    minMatchCharLength: 2,
  }), [suggestionItems]);
  const suggestions = location.trim().length >= 2
    ? fuse.search(location.trim()).slice(0, 8).map(r => r.item)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Build explicit filters for search page
    let minPrice = '';
    let maxPrice = '';
    if (priceRange && priceRange !== 'all') {
      if (priceRange.endsWith('+')) {
        minPrice = priceRange.replace('+', '');
      } else if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-');
        minPrice = min;
        maxPrice = max;
      }
    }

    const params = new URLSearchParams();
    if (location) params.set('loc', location);
    if (propertyType && propertyType !== 'all') params.set('type', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('ltype', searchType === 'buy' ? 'sale' : 'rent');
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}{/* only new photo url changed below  14 aug */}
      <div className="absolute inset-0">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/027/717/341/small_2x/successful-real-estate-transaction-realtor-and-buyer-shaking-hands-generative-ai-photo.jpg"

          // "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop"
          alt="Modern Indian residential complex"
          className="w-full h-full object-cover filter brightness-110 contrast-110 saturate-110"
        />
        <div className="absolute inset-0 bg-[#0f2746]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2746]/70 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]">
            Find Your Dream
            <span className="block text-[#E63946]">
              Property in India
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#F1FAEE] max-w-3xl mx-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            Discover the perfect home with our extensive collection of premium properties across major Indian cities
          </p>
          <div className="flex justify-center flex-wrap gap-2 md:gap-3 mt-4">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs md:text-sm">
              <Shield size={14} /> Verified listings
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs md:text-sm">
              <Star size={14} /> Top-rated support
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs md:text-sm">
              15+ years experience
            </span>
          </div>
        </div>

        {/* Search Form */}{/* only bg-opacity-80 property added below  14 aug */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto border border-[#A8DADC]/60 ring-1 ring-white/10">
          {/* Search Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 rounded-full p-1 flex">
              <button
                onClick={() => setSearchType('buy')}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${searchType === 'buy'
                  ? 'bg-[#1D3557] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#1D3557]'
                  }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${searchType === 'rent'
                  ? 'bg-[#1D3557] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#1D3557]'
                  }`}
              >
                Rent
              </button>
              {/* <button
                onClick={() => setSearchType('pg')}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${searchType === 'pg'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary'
                  }`}
              >
                PG/Hostel
              </button> */}
            </div>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Location */}
              <div className="relative">
                <label className="hidden md:block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search location (e.g., Pune)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-label="Location"
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto text-left">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLocation(s.label)}
                          className="w-full px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-800">{s.label}</span>
                          <span className="text-xs text-gray-500">{s.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="hidden md:block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    aria-label="Property Type"
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent appearance-none"
                  >
                    <option value="all">All Flats</option>
                    <option value="1bhk">1 BHK</option>
                    <option value="2bhk">2 BHK</option>
                    <option value="3bhk">3 BHK</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="hidden md:block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'rent' || searchType === 'pg' ? 'Monthly Rent' : 'Budget'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-bold">₹</span>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    aria-label={searchType === 'rent' || searchType === 'pg' ? 'Monthly Rent' : 'Budget'}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent appearance-none"
                  >
                    {searchType === 'buy' ? (
                      <>
                        <option value="all">Any Budget</option>
                        <option value="0-2500000">Under ₹25 Lakh</option>
                        <option value="2500000-5000000">₹25L - ₹50L</option>
                        <option value="5000000-7500000">₹50L - ₹75L</option>
                        <option value="7500000-10000000">₹75L - ₹1 Cr</option>
                        <option value="10000000-20000000">₹1 Cr - ₹2 Cr</option>
                        <option value="20000000-50000000">₹2 Cr - ₹5 Cr</option>
                        <option value="50000000+">₹5 Cr+</option>
                      </>
                    ) : searchType === 'rent' ? (
                      <>
                        <option value="all">Any Rent</option>
                        <option value="0-10000">Under ₹10,000</option>
                        <option value="10000-25000">₹10K - ₹25K</option>
                        <option value="25000-50000">₹25K - ₹50K</option>
                        <option value="50000-75000">₹50K - ₹75K</option>
                        <option value="75000-100000">₹75K - ₹1L</option>
                        <option value="100000+">₹1L+</option>
                      </>
                    ) : (
                      <>
                        <option value="all">Any Budget</option>
                        <option value="0-5000">Under ₹5,000</option>
                        <option value="5000-10000">₹5K - ₹10K</option>
                        <option value="10000-15000">₹10K - ₹15K</option>
                        <option value="15000-25000">₹15K - ₹25K</option>
                        <option value="25000+">₹25K+</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#E63946] hover:bg-[#d12d3a] text-white font-semibold py-2 md:py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Search size={20} />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/search?advanced=true')}
                className="text-[#1D3557] hover:text-[#0f2746] font-medium text-xs md:text-sm underline"
              >
                Advanced Search Options (Furnishing, Parking, Possession)
              </button>
            </div>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10,000+</div>
            <div className="text-gray-200">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">150+</div>
            <div className="text-gray-200">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">25,000+</div>
            <div className="text-gray-200">Happy Families</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">15+</div>
            <div className="text-gray-200">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;