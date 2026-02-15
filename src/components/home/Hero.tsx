import React, { useMemo, useState } from 'react';
import { Search, Home, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import Fuse from 'fuse.js';
import { buildSearchUrl } from '../../utils/urlUtils';

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
    if (propertyType && propertyType !== 'all') params.set('type', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const baseUrl = buildSearchUrl({
      city: 'pune',
      location: location || 'all',
      listingType: searchType === 'buy' ? 'sale' : 'rent'
    });
    const queryString = params.toString();
    navigate(queryString ? `${baseUrl}?${queryString}` : baseUrl);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#5f56d6] via-[#4b43c6] to-[#f6f7fb]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-[#8f87ff]/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg aria-hidden="true" viewBox="0 0 1440 180" className="w-full h-44 text-white/15">
            <path
              fill="currentColor"
              d="M0 140L60 120C120 100 240 60 360 50C480 40 600 60 720 70C840 80 960 80 1080 90C1200 100 1320 120 1380 130L1440 140V180H1380C1320 180 1200 180 1080 180C960 180 840 180 720 180C600 180 480 180 360 180C240 180 120 180 60 180H0Z"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-3">Homes and Projects</p>
            <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight">
              Find a place you love in Pune
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85">
              Verified listings, transparent pricing, and expert support for buying or renting.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 border border-white/20">
                <Shield size={14} /> Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 border border-white/20">
                <Star size={14} /> Trusted
              </span>
            </div>
          </div>

          <div className="w-full max-w-4xl">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/60">
              {/* Search Type Toggle */}
              <div className="rounded-t-2xl bg-[#2e2963] px-4 py-3">
                <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-white/60">
                  <button
                    onClick={() => setSearchType('buy')}
                    className={`pb-2 transition-all ${searchType === 'buy'
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/60 hover:text-white'
                      }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSearchType('rent')}
                    className={`pb-2 transition-all ${searchType === 'rent'
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/60 hover:text-white'
                      }`}
                  >
                    Rent
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <form onSubmit={handleSearch}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1.2fr_1.2fr_auto] bg-white rounded-xl border border-gray-200 shadow-sm divide-y md:divide-y-0 md:divide-x">
                    {/* Location */}
                    <div className="relative px-4 py-3">
                      <label className="sr-only">Location</label>
                      <div className="relative">
                        <Search className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search locality, landmark, project, or builder"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          aria-label="Location"
                          className="w-full pl-7 pr-2 py-2 text-sm md:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
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
                    <div className="relative px-4 py-3">
                      <label className="sr-only">Property Type</label>
                      <div className="relative">
                        <Home className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          aria-label="Property Type"
                          className="w-full pl-6 pr-2 py-2 text-sm md:text-base text-gray-800 bg-transparent focus:outline-none appearance-none"
                        >
                          <option value="all">All Flats</option>
                          <option value="1bhk">1 BHK</option>
                          <option value="2bhk">2 BHK</option>
                          <option value="3bhk">3 BHK</option>
                        </select>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="relative px-4 py-3">
                      <label className="sr-only">Budget</label>
                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">₹</span>
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          aria-label={searchType === 'rent' || searchType === 'pg' ? 'Monthly Rent' : 'Budget'}
                          className="w-full pl-6 pr-2 py-2 text-sm md:text-base text-gray-800 bg-transparent focus:outline-none appearance-none"
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
                    <div className="flex items-center justify-center px-4 py-3">
                      <button
                        type="submit"
                        className="w-full md:w-auto bg-[#5b2ce8] hover:bg-[#4c24c7] text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Search size={18} />
                        <span>Search</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-4 sm:px-5 pb-2 text-xs text-gray-500 text-center">
                Popular: Hinjewadi, Mahalunge
              </div>
              <div className="pb-5 text-center">
                <button
                  type="button"
                  onClick={() => navigate(`${buildSearchUrl({ city: 'pune', location: 'all', listingType: 'sale' })}?advanced=true`)}
                  className="text-[#1D3557] hover:text-[#0f2746] font-medium text-xs md:text-sm underline"
                >
                  Advanced Search Options (Furnishing, Parking, Possession)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;