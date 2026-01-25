import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../../../types';
import { useProjects } from '../../../contexts/ProjectContext'; // Import useProjects
import { API_BASE_URL } from '../../../api'; // Import API_BASE_URL

interface ProjectFormProps {
  project: Project | null;
  onCancel: () => void;
  isEdit: boolean;
}

const emptyProject: Partial<Project> = {
  name: '',
  description: '',
  developer: '',
  status: 'upcoming',
  location: { address: '', city: '', coordinates: { lat: 0, lng: 0 } },
  images: [],
  floorPlans: [],
  amenities: [],
  priceRange: { min: 0, max: 0 },
  unitTypes: [],
  totalUnits: 0,
  availableUnits: 0,
};

const HIGHLIGHT_OPTIONS = [
  'RERA Approved Project',
  'Award Winning Developer',
  'Vastu Compliant',
  'Bank Loan Approved',
  'IGBC Certified',
  'Prime Location',
  'Smart Home Features',
  'Gated Community',
];

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onCancel, isEdit }) => {
  const { addProject, updateProject } = useProjects(); // Get mutation functions

  // Isolate images into their own state for clarity and reliable updates
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingFloorPlans, setExistingFloorPlans] = useState<string[]>([]);
  const [newFloorPlans, setNewFloorPlans] = useState<File[]>([]);
  const [newMasterPlan, setNewMasterPlan] = useState<File | null>(null);
  const [newBrochure, setNewBrochure] = useState<File | null>(null);

  // State for form data, including EXISTING image URLs
  const [form, setForm] = useState<Partial<Project>>(emptyProject);

  // Display names for existing files
  const [existingMasterPlanName, setExistingMasterPlanName] = useState('');
  const [existingBrochureName, setExistingBrochureName] = useState('');

  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [unitTypesInput, setUnitTypesInput] = useState('');
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [pricing, setPricing] = useState<any[]>([]);
  const [pricingInput, setPricingInput] = useState({ type: '', area: '', basePrice: '', pricePerSqFt: '' });

  // State for landmarks
  const [landmarks, setLandmarks] = useState<any[]>(project?.landmarks || []);
  const [landmarkInput, setLandmarkInput] = useState({ name: '', distance: '', category: 'Transportation' });

  useEffect(() => {
    if (project) {
      setForm({ ...emptyProject, ...project });
      setExistingImages(project.images || []);
      setExistingFloorPlans(project.floorPlans || []);
      // Extract and set the filenames from the full URL
      setExistingMasterPlanName(project.masterPlan?.split('/').pop() || '');
      setExistingBrochureName(project.brochure?.split('/').pop() || '');
    } else {
      setForm(emptyProject);
      setExistingImages([]);
      setExistingFloorPlans([]);
      setExistingMasterPlanName('');
      setExistingBrochureName('');
    }
    setHighlights(project?.highlights || []);
    setPricing(project?.pricing || []);
  }, [project]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollDivRef.current) {
        setShowScrollTop(scrollDivRef.current.scrollTop > 100);
      }
    };
    const node = scrollDivRef.current;
    if (node) node.addEventListener('scroll', handleScroll);
    return () => { if (node) node.removeEventListener('scroll', handleScroll); };
  }, []);

  const scrollToTop = () => {
    if (scrollDivRef.current) scrollDivRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      location: {
        address: name === 'address' ? value : prev.location?.address || '',
        city: name === 'city' ? value : prev.location?.city || '',
        coordinates: prev.location?.coordinates || { lat: 0, lng: 0 },
      },
    }));
  };

  const handleAddAmenity = () => {
    if (amenitiesInput.trim()) {
      setForm(prev => ({ ...prev, amenities: [...(prev.amenities || []), amenitiesInput.trim()] }));
      setAmenitiesInput('');
    }
  };

  const handleRemoveAmenity = (idx: number) => {
    setForm(prev => ({ ...prev, amenities: (prev.amenities || []).filter((_, i) => i !== idx) }));
  };

  const handleAddUnitType = () => {
    if (unitTypesInput.trim()) {
      setForm(prev => ({ ...prev, unitTypes: [...(prev.unitTypes || []), unitTypesInput.trim()] }));
      setUnitTypesInput('');
    }
  };

  const handleRemoveUnitType = (idx: number) => {
    setForm(prev => ({ ...prev, unitTypes: (prev.unitTypes || []).filter((_, i) => i !== idx) }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewImages(Array.from(e.target.files));
  };
  const handleFloorPlansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFloorPlans(Array.from(e.target.files));
  };
  const handleMasterPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setNewMasterPlan(e.target.files[0]);
  };
  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setNewBrochure(e.target.files[0]);
  };

  const handleAddLandmark = () => {
    if (landmarkInput.name && landmarkInput.distance) {
      setLandmarks(prev => [...prev, landmarkInput]);
      setLandmarkInput({ name: '', distance: '', category: 'Transportation' });
    }
  };

  const handleRemoveLandmark = (index: number) => {
    setLandmarks(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveExistingFloorPlan = (indexToRemove: number) => {
    setExistingFloorPlans(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // Append all simple fields
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'floorPlans' && key !== 'masterPlan' && key !== 'brochure' &&
        typeof value !== 'object') {
        formData.append(key, String(value));
      }
    });

    // Append JSON objects and arrays
    formData.append('location', JSON.stringify(form.location));
    formData.append('priceRange', JSON.stringify(form.priceRange));
    formData.append('amenities', JSON.stringify(form.amenities));
    formData.append('unitTypes', JSON.stringify(form.unitTypes));
    formData.append('highlights', JSON.stringify(highlights));
    formData.append('pricing', JSON.stringify(pricing));
    formData.append('landmarks', JSON.stringify(landmarks));

    // Distinguish between existing images and new uploads
    formData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach(file => formData.append('images', file));

    formData.append('existingFloorPlans', JSON.stringify(existingFloorPlans));
    newFloorPlans.forEach(file => formData.append('floorPlans', file));


    if (newMasterPlan) formData.append('masterPlan', newMasterPlan);
    if (newBrochure) formData.append('brochure', newBrochure);

    try {
      if (isEdit && project?.id) {
        await updateProject(project.id, formData);
      } else {
        await addProject(formData);
      }
      onCancel(); // Close the form on success
    } catch (error) {
      console.error("Failed to save project", error);
      // Optionally, set an error state here to show in the UI
    }
  };

  return (
    <div className="relative max-h-[80vh] overflow-y-auto" ref={scrollDivRef}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-white p-4 md:p-6 rounded-lg shadow-md max-w-2xl mx-auto min-h-[600px] pb-24 md:pb-40">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Project' : 'Add Project'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block font-medium mb-1">Project Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Developer</label>
            <input name="developer" value={form.developer || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select name="status" value={form.status || 'upcoming'} onChange={handleSelectChange} className="w-full border rounded px-3 py-2">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="ready-to-move">Ready to Move</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">City</label>
            <input name="city" value={form.location?.city || ''} onChange={handleLocationChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input name="address" value={form.location?.address || ''} onChange={handleLocationChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Total Units</label>
            <input name="totalUnits" type="number" value={form.totalUnits || 0} onChange={handleNumberChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Available Units</label>
            <input name="availableUnits" type="number" value={form.availableUnits || 0} onChange={handleNumberChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Min Price</label>
            <input name="min" type="number" value={form.priceRange?.min ?? 0} onChange={e => setForm(prev => ({ ...prev, priceRange: { min: Number(e.target.value), max: prev.priceRange?.max ?? 0 } }))} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Max Price</label>
            <input name="max" type="number" value={form.priceRange?.max ?? 0} onChange={e => setForm(prev => ({ ...prev, priceRange: { min: prev.priceRange?.min ?? 0, max: Number(e.target.value) } }))} className="w-full border rounded px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Amenities</label>
          <div className="flex gap-2 mb-2">
            <input value={amenitiesInput} onChange={e => setAmenitiesInput(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Add amenity" />
            <select
              className="border rounded px-3 py-2"
              onChange={e => {
                const val = e.target.value;
                if (val && !(form.amenities || []).includes(val)) {
                  setForm(prev => ({ ...prev, amenities: [...(prev.amenities || []), val] }));
                }
                e.target.selectedIndex = 0;
              }}
            >
              <option value="">Select Amenity</option>
              <option value="Cricket Pitch">Cricket Pitch</option>
              <option value="Volleyball Court">Volleyball Court</option>
              <option value="Tennis Court">Tennis Court</option>
              <option value="Gazebo">Gazebo</option>
              <option value="Swimming Pool">Swimming Pool</option>
              <option value="Landscaping & Tree Planting">Landscaping & Tree Planting</option>
              <option value="Water Conservation">Water Conservation</option>
              <option value="Rain water Harvesting">Rain water Harvesting</option>
              <option value="Gymnasium">Gymnasium</option>
              <option value="Fire Fighting System">Fire Fighting System</option>
              <option value="Community Buildings">Community Buildings</option>
              <option value="Closed Car Parking">Closed Car Parking</option>
              <option value="24X7 Water Supply">24X7 Water Supply</option>
              <option value="Multipurpose Room">Multipurpose Room</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Indoor Games">Indoor Games</option>
              <option value="Sports Facility">Sports Facility</option>
              <option value="Party Lawn">Party Lawn</option>
              <option value="Sewage Treatment Plant">Sewage Treatment Plant</option>
              <option value="Club House">Club House</option>
              <option value="Intercom">Intercom</option>
              <option value="Children's Play Area">Children's Play Area</option>
              <option value="Entrance Lobby">Entrance Lobby</option>
              <option value="Steam Room">Steam Room</option>
              <option value="Barbecue Area">Barbecue Area</option>
              <option value="Recreation Facilities">Recreation Facilities</option>
              <option value="Solid Waste Management And Disposal">Solid Waste Management And Disposal</option>
              <option value="Lift(s)">Lift(s)</option>
              <option value="Badminton Court">Badminton Court</option>
              <option value="24x7 CCTV Surveillance">24x7 CCTV Surveillance</option>
              <option value="Video Door Security">Video Door Security</option>
              <option value="Community Hall">Community Hall</option>
              <option value="Basketball Court">Basketball Court</option>
              <option value="Paved Compound">Paved Compound</option>
              <option value="Storm Water Drains">Storm Water Drains</option>
              <option value="Solar Water Heating">Solar Water Heating</option>
              <option value="Open Parking">Open Parking</option>
              <option value="Internal Roads & Footpaths">Internal Roads & Footpaths</option>
              <option value="24x7 Security">24x7 Security</option>
              <option value="Electrical meter Room">Electrical meter Room</option>
              <option value="Energy management">Energy management</option>
              <option value="Power Backup">Power Backup</option>
              <option value="Cafeteria">Cafeteria</option>
            </select>
            <button type="button" onClick={handleAddAmenity} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.amenities || []).map((a, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {a} <button type="button" onClick={() => handleRemoveAmenity(idx)} className="ml-1 text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Unit Types</label>
          <div className="flex gap-2 mb-2">
            <input value={unitTypesInput} onChange={e => setUnitTypesInput(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Add unit type (e.g. 2 BHK)" />
            <select
              className="border rounded px-3 py-2"
              onChange={e => {
                const val = e.target.value;
                if (val && !(form.unitTypes || []).includes(val)) {
                  setForm(prev => ({ ...prev, unitTypes: [...(prev.unitTypes || []), val] }));
                }
                e.target.selectedIndex = 0;
              }}
            >
              <option value="">Select Type</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="1 RK">1 RK</option>
              <option value="Villa">Villa</option>
              <option value="Independent House">Independent House</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Plot/Land">Plot/Land</option>
              <option value="Farm House">Farm House</option>
              <option value="Commercial">Commercial</option>
              <option value="Office Space">Office Space</option>
              <option value="Shop/Showroom">Shop/Showroom</option>
              <option value="Warehouse/Godown">Warehouse/Godown</option>
            </select>
            <button type="button" onClick={handleAddUnitType} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.unitTypes || []).map((u, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {u} <button type="button" onClick={() => handleRemoveUnitType(idx)} className="ml-1 text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Project Highlights</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {HIGHLIGHT_OPTIONS.map(option => (
              <button
                type="button"
                key={option}
                className={`px-3 py-1 rounded-full border ${highlights.includes(option) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setHighlights(h => h.includes(option) ? h.filter(o => o !== option) : [...h, option])}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Add custom highlight" />
            <button type="button" onClick={() => { if (highlightInput.trim()) { setHighlights(h => [...h, highlightInput.trim()]); setHighlightInput(''); } }} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {h} <button type="button" onClick={() => setHighlights(hs => hs.filter((_, i) => i !== idx))} className="ml-1 text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Pricing & Payment Plans</label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
            <input placeholder="Type (e.g. 2 BHK)" value={pricingInput.type} onChange={e => setPricingInput(p => ({ ...p, type: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <input placeholder="Area (sq ft)" type="number" value={pricingInput.area} onChange={e => setPricingInput(p => ({ ...p, area: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <input placeholder="Base Price" type="number" value={pricingInput.basePrice} onChange={e => setPricingInput(p => ({ ...p, basePrice: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <input placeholder="Price per sq ft" type="number" value={pricingInput.pricePerSqFt} onChange={e => setPricingInput(p => ({ ...p, pricePerSqFt: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <button type="button" onClick={() => {
              if (pricingInput.type && pricingInput.area && pricingInput.basePrice && pricingInput.pricePerSqFt) {
                setPricing(p => [...p, { type: pricingInput.type, area: Number(pricingInput.area), basePrice: Number(pricingInput.basePrice), pricePerSqFt: Number(pricingInput.pricePerSqFt) }]);
                setPricingInput({ type: '', area: '', basePrice: '', pricePerSqFt: '' });
              }
            }} className="bg-blue-600 text-white px-3 py-2 md:py-1 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pricing.map((p, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {p.type} | {p.area} sq ft | ₹{p.basePrice} | ₹{p.pricePerSqFt}/sq ft
                <button type="button" onClick={() => setPricing(pr => pr.filter((_, i) => i !== idx))} className="ml-1 text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Nearby Landmarks & Connectivity</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <input placeholder="Landmark Name (e.g., Metro Station)" value={landmarkInput.name} onChange={e => setLandmarkInput(p => ({ ...p, name: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <input placeholder="Distance (e.g., 1.2 km)" value={landmarkInput.distance} onChange={e => setLandmarkInput(p => ({ ...p, distance: e.target.value }))} className="border rounded px-2 py-2 md:py-1" />
            <select value={landmarkInput.category} onChange={e => setLandmarkInput(p => ({ ...p, category: e.target.value }))} className="border rounded px-2 py-2 md:py-1">
              <option>Transportation</option>
              <option>Essential Services</option>
              <option>Entertainment</option>
              <option>Schools</option>
              <option>Hospitals</option>
            </select>
            <button type="button" onClick={handleAddLandmark} className="bg-blue-600 text-white px-3 py-2 md:py-1 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {landmarks.map((landmark, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                {landmark.category}: {landmark.name} ({landmark.distance})
                <button type="button" onClick={() => handleRemoveLandmark(idx)} className="ml-2 text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Images</label>
          {isEdit && existingImages && existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingImages.map((imgUrl, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={imgUrl}
                    alt={`Project Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg p-1 text-xs leading-none"
                    title="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files || []))} />
        </div>
        <div>
          <label className="block font-medium mb-1">Floor Plans</label>
          {isEdit && existingFloorPlans && existingFloorPlans.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingFloorPlans.map((planUrl, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-center p-1">
                    <span className="text-xs text-gray-600 truncate">{planUrl.split('/').pop()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingFloorPlan(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg p-1 text-xs leading-none"
                    title="Remove floor plan"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <input type="file" multiple accept="image/*,application/pdf" onChange={handleFloorPlansChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">Master Plan</label>
          {isEdit && existingMasterPlanName && !newMasterPlan && (
            <div className="text-sm text-gray-600 mb-2">
              Current: <span className="font-medium text-indigo-600">{existingMasterPlanName}</span> (Upload a new file to replace)
            </div>
          )}
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setNewMasterPlan(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Brochure</label>
          {isEdit && existingBrochureName && !newBrochure && (
            <div className="text-sm text-gray-600 mb-2">
              Current: <span className="font-medium text-indigo-600">{existingBrochureName}</span> (Upload a new file to replace)
            </div>
          )}
          <input type="file" accept="application/pdf" onChange={(e) => setNewBrochure(e.target.files?.[0] || null)} />
        </div>
        {/* Mobile actions bar */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{isEdit ? 'Update' : 'Save'}</button>
          </div>
        </div>
        {/* Desktop actions bar - stable full-width, right-aligned (match PropertyForm) */}
        <div className="hidden md:block fixed bottom-0 left-64 right-0 z-20 border-t bg-white/95 backdrop-blur">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-end gap-3 pr-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEdit ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </form>
      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-24 md:bottom-24 right-6 md:right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg z-30 hover:bg-blue-700 transition-all">
          ↑
        </button>
      )}
    </div>
  );
};

export default ProjectForm; 