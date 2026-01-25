import React, { useEffect, useState } from 'react';
import { API_BASE_URL, authFetch } from '../../../api';
import { useProperties } from '../../../contexts/PropertyContext';
import { Link } from 'react-router-dom';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  type: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  notes?: string;
  propertyId?: string;
  propertyTitle?: string;
<<<<<<< HEAD
=======
  requirements?: {
    bhk: number;
    furnishing: string;
    listingType: string;
    budget: number;
  };
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
}

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'other', label: 'Other' },
];
const typeOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'renter', label: 'Renter' },
];
const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];
const statusOptions = [
  'New',
  'Contacted',
  'Qualified',
  'Site Visit',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const commTypes = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
];

const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    type: 'buyer',
    priority: 'medium',
    assignedTo: '',
    notes: '',
    status: 'New',
<<<<<<< HEAD
=======
    propertyId: '',
    requirements: {
      bhk: 0,
      furnishing: '',
      listingType: '',
      budget: 0,
    },
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [commForm, setCommForm] = useState({ type: 'call', content: '', by: '' });
  const [commSubmitting, setCommSubmitting] = useState(false);
  const [reminderForm, setReminderForm] = useState({ message: '', dueDate: '' });
  const [reminderSubmitting, setReminderSubmitting] = useState(false);
  const [assignedToEdit, setAssignedToEdit] = useState<{ [id: string]: string }>({});
  const { properties } = useProperties();

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/leads`)
      .then(async res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load leads'))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
=======
  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setForm(prev => ({
        ...prev,
        propertyId,
        requirements: {
          bhk: property.bedrooms,
          furnishing: property.furnishing,
          listingType: property.listingType,
          budget: property.price,
        },
      }));
    } else {
      setForm(prev => ({
        ...prev,
        propertyId,
        requirements: { bhk: 0, furnishing: '', listingType: '', budget: 0 },
      }));
    }
  };

>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Name, Email, and Phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add lead');
      const newLead = await res.json();
      setLeads(prev => [newLead, ...prev]);
      setShowModal(false);
      setForm({
<<<<<<< HEAD
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New',
=======
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New', propertyId: '', requirements: { bhk: 0, furnishing: '', listingType: '', budget: 0 },
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
      });
    } catch {
      setFormError('Failed to add lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setDeletingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch {
      alert('Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditLead(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      type: lead.type,
      priority: lead.priority,
      assignedTo: lead.assignedTo || '',
      notes: lead.notes || '',
      status: lead.status,
<<<<<<< HEAD
=======
      propertyId: lead.propertyId || '',
      requirements: lead.requirements || { bhk: 0, furnishing: '', listingType: '', budget: 0 },
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
    });
    setShowModal(true);
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Name, Email, and Phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/leads/${editLead!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update lead');
      const updated = await res.json();
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      setShowModal(false);
      setEditLead(null);
      setForm({
<<<<<<< HEAD
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New',
=======
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New', propertyId: '', requirements: { bhk: 0, furnishing: '', listingType: '', budget: 0 },
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
      });
    } catch {
      setFormError('Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLead = async (id: string, assignedTo: string) => {
    const res = await authFetch(`${API_BASE_URL}/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    }
  };

  const handleAddComm = async (leadId: string) => {
    if (!commForm.content.trim() || !commForm.by.trim()) return;
    setCommSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/leads/${leadId}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        setViewLead(updated);
        setCommForm({ type: 'call', content: '', by: '' });
      }
    } finally {
      setCommSubmitting(false);
    }
  };

  const handleAddReminder = async (leadId: string) => {
    if (!reminderForm.message.trim() || !reminderForm.dueDate) return;
    setReminderSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/leads/${leadId}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        setViewLead(updated);
        setReminderForm({ message: '', dueDate: '' });
      }
    } finally {
      setReminderSubmitting(false);
    }
  };

  const handleCompleteReminder = async (leadId: string, idx: number) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const reminders = [...(lead as any).reminders];
    reminders[idx].completed = true;
    const res = await authFetch(`${API_BASE_URL}/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reminders }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      setViewLead(updated);
    }
  };

  // Helper to extract config from notes
  function extractConfig(notes: string) {
    // crude extraction: look for "BHK", price, and city in notes
    const bhkMatch = notes.match(/(\d+)\s*BHK/i);
    const priceMatch = notes.match(/\u20b9([\d,.]+)/);
    const cityMatch = notes.match(/in ([A-Za-z ]+)/i);
    return {
      bhk: bhkMatch ? parseInt(bhkMatch[1]) : undefined,
      price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined,
      city: cityMatch ? cityMatch[1].trim() : undefined,
    };
  }

  function getRecommendations(lead: Lead) {
    if (!lead.notes) return [];
    const { bhk, price, city } = extractConfig(lead.notes);
    return properties.filter(p => {
      const matchBHK = bhk ? (p.bedrooms === bhk) : true;
      const matchPrice = price ? (p.price <= price * 1.2 && p.price >= price * 0.8) : true;
      const matchCity = city ? (p.location.city.toLowerCase().includes(city.toLowerCase())) : true;
      return matchBHK && matchPrice && matchCity;
    }).slice(0, 2); // show up to 2 recommendations
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Lead Management</h1>
        <button className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>+ Add Lead</button>
      </div>
<<<<<<< HEAD
=======

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(l => l.status === 'New').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(l => ['Contacted', 'Qualified', 'Site Visit', 'Negotiation'].includes(l.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Closed Won</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(l => l.status === 'Closed Won').length}
              </p>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg shadow-lg p-5 md:p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
            <form onSubmit={editLead ? handleSaveEditLead : handleAddLead} className="space-y-3 md:space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" required />
              </div>
<<<<<<< HEAD
=======
              <div>
                <label className="block mb-1 font-medium">Property of Interest</label>
                <select name="propertyId" value={form.propertyId} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option value="">Select Property (Optional)</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location.address}
                    </option>
                  ))}
                </select>
              </div>
              {form.requirements.bhk > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Auto-filled Requirements</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">BHK:</span> {form.requirements.bhk}</div>
                    <div><span className="font-medium">Furnishing:</span> {form.requirements.furnishing}</div>
                    <div><span className="font-medium">Type:</span> {form.requirements.listingType}</div>
                    <div><span className="font-medium">Budget:</span> ₹{form.requirements.budget.toLocaleString()}</div>
                  </div>
                </div>
              )}
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block mb-1 font-medium">Source</label>
                  <select name="source" value={form.source} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
                    {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Type</label>
                  <select name="type" value={form.type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
                    {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block mb-1 font-medium">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Assigned To</label>
                  <input type="text" name="assignedTo" value={form.assignedTo} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" placeholder="Employee name or ID" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select name="status" value={form.status || editLead?.status || 'New'} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" rows={2} />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 md:px-4 py-2 rounded border" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" disabled={submitting}>{submitting ? 'Saving...' : 'Save Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={() => setViewLead(null)} />
          {/* Drawer */}
          <div className="relative ml-auto h-full w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slideInRight">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b flex items-center justify-between px-6 py-4">
              <h2 className="text-2xl font-bold">Lead Details</h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setViewLead(null)}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
              {/* Lead Info Card */}
              <div className="bg-gray-50 rounded-lg shadow p-4 space-y-2">
                <div className="text-lg font-semibold mb-2">Lead Info</div>
                <div><span className="font-medium">Name:</span> {viewLead.name}</div>
                <div><span className="font-medium">Email:</span> {viewLead.email}</div>
                <div><span className="font-medium">Phone:</span> {viewLead.phone}</div>
                <div><span className="font-medium">Source:</span> {viewLead.source}</div>
                <div><span className="font-medium">Type:</span> {viewLead.type}</div>
                <div><span className="font-medium">Priority:</span> {viewLead.priority}</div>
                <div><span className="font-medium">Status:</span> {viewLead.status}</div>
                <div><span className="font-medium">Assigned To:</span> {viewLead.assignedTo || '-'}</div>
                <div><span className="font-medium">Created At:</span> {new Date(viewLead.createdAt).toLocaleString('en-IN')}</div>
<<<<<<< HEAD
                {viewLead.notes && <div><span className="font-medium">Notes:</span> {viewLead.notes}</div>}
=======
                {viewLead.propertyTitle && <div><span className="font-medium">Property:</span> {viewLead.propertyTitle}</div>}
                <div className="mt-2">
                  <span className="font-medium">Notes:</span>
                  <div className="mt-1">
                    {viewLead.requirements && (
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        Requirements: {viewLead.requirements.bhk} BHK • {viewLead.requirements.furnishing} • {viewLead.requirements.listingType} • ₹{viewLead.requirements.budget.toLocaleString()}
                      </div>
                    )}
                    {viewLead.notes && (
                      <div className="text-sm text-gray-600">{viewLead.notes}</div>
                    )}
                    {!viewLead.requirements && !viewLead.notes && (
                      <span className="text-gray-400 text-sm">No notes or requirements</span>
                    )}
                  </div>
                </div>
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
              </div>
              {/* Communication Log Card */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-lg font-semibold mb-2">Communication Log</div>
                {Array.isArray((viewLead as any).communicationLog) && ((viewLead as any).communicationLog.length === 0 ? (
                  <div className="text-gray-500 text-sm">No communications yet.</div>
                ) : (
                  <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {(viewLead as any).communicationLog.map((log: any, idx: number) => (
                      <li key={idx} className="text-sm border-b pb-1">
                        <span className="font-medium capitalize">{log.type}</span> - {log.content} <span className="text-gray-400">({new Date(log.timestamp).toLocaleString('en-IN')})</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
              {/* Add Communication */}
              <div className="bg-white rounded-lg shadow p-4">
                <form onSubmit={e => { e.preventDefault(); handleAddComm(viewLead.id); }} className="space-y-2">
                  <div className="text-lg font-semibold mb-2">Add Communication</div>
                  <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <select name="type" value={commForm.type} onChange={e => setCommForm(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 border rounded">
                      {commTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Content</label>
                    <textarea name="content" value={commForm.content} onChange={e => setCommForm(prev => ({ ...prev, content: e.target.value }))} className="w-full px-3 py-2 border rounded" rows={2} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">By</label>
                    <input type="text" name="by" value={commForm.by} onChange={e => setCommForm(prev => ({ ...prev, by: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" disabled={commSubmitting}>{commSubmitting ? 'Adding...' : 'Add Communication'}</button>
                  </div>
                </form>
              </div>
              {/* Reminders Card */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-lg font-semibold mb-2">Reminders</div>
                {Array.isArray((viewLead as any).reminders) && ((viewLead as any).reminders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No reminders set.</div>
                ) : (
                  <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {(viewLead as any).reminders.map((rem: any, idx: number) => (
                      <li key={idx} className="text-sm border-b pb-1">
                        <span>{rem.message}</span> <span className="text-gray-400">(Due: {new Date(rem.dueDate).toLocaleDateString('en-IN')})</span> {rem.completed && <span className="text-green-600">✓</span>}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
              {/* Add Reminder */}
              <div className="bg-white rounded-lg shadow p-4">
                <form onSubmit={e => { e.preventDefault(); handleAddReminder(viewLead.id); }} className="space-y-2">
                  <div className="text-lg font-semibold mb-2">Add Reminder</div>
                  <div>
                    <label className="block mb-1 font-medium">Message</label>
                    <textarea name="message" value={reminderForm.message} onChange={e => setReminderForm(prev => ({ ...prev, message: e.target.value }))} className="w-full px-3 py-2 border rounded" rows={2} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Due Date</label>
                    <input type="date" name="dueDate" value={reminderForm.dueDate} onChange={e => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" disabled={reminderSubmitting}>{reminderSubmitting ? 'Adding...' : 'Add Reminder'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideInRight {
              animation: slideInRight 0.3s cubic-bezier(0.4,0,0.2,1);
            }
          `}} />
        </div>
      )}
      {loading ? (
        <div>Loading leads...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.email} · {lead.phone}</div>
                  <div className="mt-2 text-sm text-gray-700"><span className="font-medium">Source:</span> {lead.source}</div>
                  <div className="text-sm text-gray-700"><span className="font-medium">Type:</span> {lead.type}</div>
                  <div className="text-sm text-gray-700"><span className="font-medium">Priority:</span> {lead.priority}</div>
                  <div className="text-sm"><span className="font-medium">Status:</span> {lead.status}</div>
                  <div className="text-sm"><span className="font-medium">Assigned:</span> {lead.assignedTo || '-'}</div>
                </div>
                <div className="text-sm text-right">
                  <div className="text-gray-500">{new Date(lead.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className="mt-3 flex flex-col space-y-2 items-end">
                    <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded" onClick={() => setViewLead(lead)}>View</button>
                    <button className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded" onClick={() => handleEditLead(lead)}>Edit</button>
                    <button className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded" onClick={() => handleDeleteLead(lead.id)} disabled={deletingId === lead.id}>{deletingId === lead.id ? 'Deleting...' : 'Delete'}</button>
=======
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
              {/* Card Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-500">{lead.source}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'Qualified' ? 'bg-purple-100 text-purple-800' :
                      lead.status === 'Site Visit' ? 'bg-indigo-100 text-indigo-800' :
                      lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                      lead.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
                      lead.status === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                      lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lead.priority}
                    </span>
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              <div className="mt-3 border-t pt-3">
                {lead.propertyId && (
                  <div className="text-sm">
                    <span className="font-medium">Property:</span>{' '}
                    <Link to={`/properties/${lead.propertyId}`} className="text-blue-600 underline hover:text-blue-800" target="_blank">{lead.propertyTitle || lead.propertyId}</Link>
                  </div>
                )}

                {getRecommendations(lead).length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Recommendations</div>
                    <div className="mt-1 space-y-1">
                      {getRecommendations(lead).map(p => (
                        <Link key={p.id} to={`/properties/${p.id}`} className="block text-sm text-blue-600 underline" target="_blank">{p.title}</Link>
                      ))}
                    </div>
                  </div>
                )}
=======
              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Contact Info */}
                <div>
                  <div className="text-sm text-gray-600">{lead.email}</div>
                  <div className="text-sm text-gray-600">{lead.phone}</div>
                </div>

                {/* Type */}
                <div>
                  <span className="text-sm font-medium text-gray-700">Type: </span>
                  <span className="text-sm text-gray-600">{lead.type}</span>
                </div>

                {/* Assigned To */}
                {lead.assignedTo && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Assigned: </span>
                    <span className="text-sm text-gray-600">{lead.assignedTo}</span>
                  </div>
                )}

                {/* Requirements */}
                {lead.requirements && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">Requirements:</div>
                    <div className="text-sm text-blue-800">
                      {lead.requirements.bhk} BHK • {lead.requirements.furnishing} • {lead.requirements.listingType} • ₹{lead.requirements.budget.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {lead.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                    <div className="text-sm text-gray-600 line-clamp-2" title={lead.notes}>
                      {lead.notes}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(lead.createdAt).toLocaleDateString('en-IN')} at {new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewLead(lead)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditLead(lead)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteLead(lead.id)}
                  disabled={deletingId === lead.id}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === lead.id ? 'Deleting...' : 'Delete'}
                </button>
>>>>>>> 1a336e031d4db71848c2d045e8423055f298940a
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadManagement; 