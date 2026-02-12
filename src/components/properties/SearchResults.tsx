import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import PropertyCard from './PropertyCard';
import Fuse from 'fuse.js';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Seo from '../common/Seo';
import { buildPropertyUrl, cityFromPath, listingTypeFromPath, locationFromPath } from '../../utils/urlUtils';

const bedroomOptions = [1, 2, 3, 4, 5];
const propertyTypes = ['1bhk', '2bhk', '3bhk'];
const furnishingOptions = ['unfurnished', 'semi-furnished', 'furnished'];

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { city, location: pathLocation, listingType: pathListingType } = useParams<{ city?: string; location?: string; listingType?: string }>();
  const { properties, loading, error } = useProperties();

  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const queryLocation = params.get('loc') || locationFromPath(pathLocation);
  const queryCity = cityFromPath(city);
  const queryType = (params.get('type') || '').toLowerCase();
  const queryListingType = (params.get('ltype') as 'sale' | 'rent' | null) || listingTypeFromPath(pathListingType);
  const queryMinPrice = params.get('minPrice');
  const queryMaxPrice = params.get('maxPrice');

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [minArea, setMinArea] = useState<number | ''>('');
  const [maxArea, setMaxArea] = useState<number | ''>('');
  const [listingType, setListingType] = useState<'sale' | 'rent' | ''>('');
  const [sort, setSort] = useState<'relevant' | 'priceLow' | 'priceHigh' | 'newest'>('relevant');
  const [furnishing, setFurnishing] = useState<string>('');
  const [parking, setParking] = useState<string>('');
  const [possession, setPossession] = useState<string>('');

  const fuse = useMemo(() => new Fuse(properties, {
    keys: ['title', 'description', 'location.city', 'location.address', 'type', 'features', 'agent.name'],
    threshold: 0.4
  }), [properties]);

  const searched = query.trim() ? fuse.search(query).map(r => r.item) : properties;

  const filtered = useMemo(() => {
    return searched.filter(p => {
      const effectiveListingType = listingType || queryListingType || '';
      if (effectiveListingType && p.listingType !== effectiveListingType) return false;
      const cityMatch = queryCity
        ? (p.location?.city || '').toLowerCase().includes(queryCity.toLowerCase())
        : true;
      if (!cityMatch) return false;
      const locationMatch = queryLocation
        ? (p.location?.address || '').toLowerCase().includes(queryLocation.toLowerCase()) ||
        (p.location?.city || '').toLowerCase().includes(queryLocation.toLowerCase())
        : true;
      if (!locationMatch) return false;
      // Map propertyType filters to bedrooms when possible, else fallback to type contains
      let typeMatch = true;
      const propertyTypeLower = (p.type || '').toLowerCase();
      if (queryType) {
        if (['1bhk', '2bhk', '3bhk'].includes(queryType)) {
          const expected = Number(queryType[0]);
          typeMatch = Number(p.bedrooms) === expected || propertyTypeLower.includes(queryType);
        } else {
          typeMatch = propertyTypeLower.includes(queryType);
        }
      }
      if (!typeMatch) return false;
      if (selectedBedrooms.length > 0 && !selectedBedrooms.includes(Number(p.bedrooms))) return false;
      if (selectedTypes.length > 0) {
        const matchAny = selectedTypes.some(t => {
          const expected = Number(t[0]);
          return Number(p.bedrooms) === expected || ((p.type || '').toLowerCase().includes(t));
        });
        if (!matchAny) return false;
      }
      if (selectedFurnishing.length > 0 && !selectedFurnishing.includes((p.furnishing || '').toLowerCase())) return false;
      const lower = Number(queryMinPrice ?? minPrice ?? '');
      const upper = Number(queryMaxPrice ?? maxPrice ?? '');
      if ((queryMinPrice || minPrice !== '') && (Number(p.price) || 0) < lower) return false;
      if ((queryMaxPrice || maxPrice !== '') && (Number(p.price) || 0) > upper) return false;
      if (minArea !== '' && (Number(p.area) || 0) < Number(minArea)) return false;
      if (maxArea !== '' && (Number(p.area) || 0) > Number(maxArea)) return false;
      // Furnishing filter (simple contains)
      if (furnishing && (p.furnishing || '').toLowerCase() !== furnishing.toLowerCase()) return false;
      // Parking filter - naive contains on features/highlights
      if (parking) {
        const hasParking = (p.features || []).concat(p.highlights || []).join(' ').toLowerCase().includes(parking.toLowerCase());
        if (!hasParking) return false;
      }
      // Possession filter - check possession text/date
      if (possession) {
        const poss = (p.possession || '').toLowerCase();
        if (!poss.includes(possession.toLowerCase())) return false;
      }
      return true;
    });
  }, [searched, listingType, queryListingType, queryLocation, queryType, queryMinPrice, queryMaxPrice, selectedBedrooms, selectedTypes, selectedFurnishing, minPrice, maxPrice, minArea, maxArea, furnishing, parking, possession]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'priceLow':
        return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'priceHigh':
        return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case 'newest':
        return arr.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      default:
        return arr;
    }
  }, [filtered, sort]);

  const toggleIn = (list: string[], value: string, setter: (v: string[]) => void) => {
    if (list.includes(value)) setter(list.filter(v => v !== value));
    else setter([...list, value]);
  };

  const toggleBedroom = (num: number) => {
    if (selectedBedrooms.includes(num)) setSelectedBedrooms(selectedBedrooms.filter(n => n !== num));
    else setSelectedBedrooms([...selectedBedrooms, num]);
  };

  const clearAll = () => {
    setMinPrice(''); setMaxPrice(''); setMinArea(''); setMaxArea('');
    setSelectedBedrooms([]); setSelectedTypes([]); setSelectedFurnishing([]);
    setListingType(''); setSort('relevant');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title={query ? `Search: ${query}` : 'Properties'} description={query ? `Search results for ${query}` : 'Browse properties available on Lotlite'} url={`${(import.meta.env.VITE_SITE_URL || 'https://lotliterealestate.com').replace(/\/$/, '')}${location.pathname}${location.search}`} />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 w-full bg-white rounded-lg shadow-sm border p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button onClick={clearAll} className="text-sm text-primary-dark hover:underline">Clear All</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                <div className="flex gap-2 flex-wrap">
                  {['sale', 'rent'].map(t => (
                    <button key={t} onClick={() => setListingType(listingType === t ? '' : (t as any))} className={`px-3 py-1 rounded-full text-sm border ${listingType === t ? 'bg-secondary text-primary-dark border-secondary' : 'text-gray-700 border-gray-300 hover:border-gray-400'}`}>{t === 'sale' ? 'Buy' : 'Rent'}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-md" />
                  <input value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                <div className="flex gap-2 flex-wrap">
                  {bedroomOptions.map(n => (
                    <button key={n} onClick={() => toggleBedroom(n)} className={`px-3 py-1 rounded-full text-sm border ${selectedBedrooms.includes(n) ? 'bg-secondary text-primary-dark border-secondary' : 'text-gray-700 border-gray-300 hover:border-gray-400'}`}>{n} BHK</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                <div className="flex gap-2 flex-wrap">
                  {propertyTypes.map(t => (
                    <button key={t} onClick={() => toggleIn(selectedTypes, t, setSelectedTypes)} className={`px-3 py-1 rounded-full text-sm capitalize border ${selectedTypes.includes(t) ? 'bg-secondary text-primary-dark border-secondary' : 'text-gray-700 border-gray-300 hover:border-gray-400'}`}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <div className="flex gap-2 flex-wrap">
                  {furnishingOptions.map(t => (
                    <button key={t} onClick={() => toggleIn(selectedFurnishing, t, setSelectedFurnishing)} className={`px-3 py-1 rounded-full text-sm capitalize border ${selectedFurnishing.includes(t) ? 'bg-secondary text-primary-dark border-secondary' : 'text-gray-700 border-gray-300 hover:border-gray-400'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq ft)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={minArea} onChange={e => setMinArea(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-md" />
                  <input value={maxArea} onChange={e => setMaxArea(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>

              {/* Advanced: Furnishing, Parking, Possession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <select value={furnishing} onChange={e => setFurnishing(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
                <select value={parking} onChange={e => setParking(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="parking">Parking</option>
                  <option value="covered">Covered</option>
                  <option value="open">Open</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Possession</label>
                <select value={possession} onChange={e => setPossession(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="ready">Ready</option>
                  <option value="under construction">Under Construction</option>
                  <option value="new">New</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{sorted.length} results {query ? `| “${query}”` : ''}</h1>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by</label>
                <select value={sort} onChange={e => setSort(e.target.value as any)} className="px-3 py-2 border rounded-md">
                  <option value="relevant">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && sorted.length === 0 && (
              <div className="text-gray-500 text-lg">No properties match your filters.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map(p => (
                <PropertyCard key={p.id} property={p} onViewDetails={() => navigate(buildPropertyUrl(p))} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default SearchResults; 