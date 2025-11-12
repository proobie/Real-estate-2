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
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New',
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
        name: '', email: '', phone: '', source: 'website', type: 'buyer', priority: 'medium', assignedTo: '', notes: '', status: 'New',
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
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setViewLead(null)}
          />
          <div className="relative z-10 flex min-h-full items-start justify-center overflow-y-auto p-4 md:p-6 lg:p-8">
            <div
              className="relative flex w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Lead Details</h2>
                  <p className="text-sm text-gray-500">
                    Created on {viewLead.createdAt ? new Date(viewLead.createdAt).toLocaleString('en-IN') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                    {viewLead.status}
                  </span>
                  <button
                    onClick={() => setViewLead(null)}
                    className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-2 bg-white">
                  {/* Left column */}
                  <div className="space-y-6 pb-6 lg:pb-0">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Client Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Client Name</label>
                          <input value={viewLead.name || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</label>
                          <input value={viewLead.email || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</label>
                          <div className="flex gap-3">
                            <input value="+91" readOnly className="w-20 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" />
                            <input value={viewLead.phone || '—'} readOnly className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Source</label>
                          <input value={viewLead.source || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm capitalize text-gray-700" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Type</label>
                          <input value={viewLead.type || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm capitalize text-gray-700" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Priority</label>
                          <input value={viewLead.priority || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm capitalize text-gray-700" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Assigned To</label>
                          <input value={viewLead.assignedTo || '—'} readOnly className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Notes & Requirement</h3>
                      <textarea
                        value={viewLead.notes || 'No notes added for this lead.'}
                        readOnly
                        rows={6}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Communication Log</h3>
                      {Array.isArray((viewLead as any).communicationLog) && ((viewLead as any).communicationLog.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-400">
                          No communications yet.
                        </div>
                      ) : (
                        <ul className="space-y-3 max-h-56 overflow-y-auto pr-2">
                          {(viewLead as any).communicationLog.map((log: any, idx: number) => (
                            <li key={idx} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold capitalize text-gray-900">{log.type}</span>
                                <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                              </div>
                              <p className="mt-2 text-gray-700">{log.content}</p>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Communication</h3>
                      <form onSubmit={e => { e.preventDefault(); handleAddComm(viewLead.id); }} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Type</label>
                            <select
                              name="type"
                              value={commForm.type}
                              onChange={e => setCommForm(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                            >
                              {commTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">By</label>
                            <input
                              type="text"
                              name="by"
                              value={commForm.by}
                              onChange={e => setCommForm(prev => ({ ...prev, by: e.target.value }))}
                              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Content</label>
                          <textarea
                            name="content"
                            value={commForm.content}
                            onChange={e => setCommForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={3}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                            disabled={commSubmitting}
                          >
                            {commSubmitting ? 'Adding…' : 'Add Communication'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Reminders</h3>
                      {Array.isArray((viewLead as any).reminders) && ((viewLead as any).reminders.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-400">
                          No reminders set.
                        </div>
                      ) : (
                        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                          {(viewLead as any).reminders.map((rem: any, idx: number) => (
                            <li key={idx} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">{rem.message}</span>
                                <span className="text-xs text-gray-400">
                                  Due: {new Date(rem.dueDate).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                              {rem.completed && <span className="mt-2 inline-flex items-center text-xs font-semibold text-green-600">✓ Completed</span>}
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Reminder</h3>
                      <form onSubmit={e => { e.preventDefault(); handleAddReminder(viewLead.id); }} className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Message</label>
                          <textarea
                            name="message"
                            value={reminderForm.message}
                            onChange={e => setReminderForm(prev => ({ ...prev, message: e.target.value }))}
                            rows={3}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Due Date</label>
                          <input
                            type="date"
                            name="dueDate"
                            value={reminderForm.dueDate}
                            onChange={e => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                            disabled={reminderSubmitting}
                          >
                            {reminderSubmitting ? 'Adding…' : 'Add Reminder'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading leads...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Leads Overview</span>
              <span className="hidden lg:inline-block text-xs text-gray-400">Showing {leads.length} records</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 bg-white">
                <span>Records</span>
                <select className="bg-transparent text-gray-700 text-xs focus:outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg bg-white px-2 py-1">
                <input
                  type="text"
                  placeholder="Search lead…"
                  className="text-xs text-gray-600 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[1200px] table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Name</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Email</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Phone</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Source</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Type</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Priority</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Status</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Assigned To</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Created At</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Property</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Recs</th>
                  <th className="border border-gray-200 px-4 py-3 font-medium whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={`text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                  >
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="max-w-[220px] truncate text-gray-700">{lead.email}</div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap">{lead.phone}</td>
                    <td className="border border-gray-200 px-4 py-3 capitalize whitespace-nowrap">{lead.source}</td>
                    <td className="border border-gray-200 px-4 py-3 capitalize whitespace-nowrap">{lead.type}</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                        {lead.priority}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 capitalize">
                        {lead.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">{lead.assignedTo || '—'}</td>
                    <td className="border border-gray-200 px-4 py-3 whitespace-nowrap">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 min-w-[160px]">
                      {lead.propertyId ? (
                        <Link
                          to={`/properties/${lead.propertyId}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                        >
                          {lead.propertyTitle || lead.propertyId}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 min-w-[160px] space-y-1">
                      {getRecommendations(lead).length === 0 ? (
                        <span className="text-xs text-gray-400">No matches</span>
                      ) : (
                        getRecommendations(lead).map(p => (
                          <Link
                            key={p.id}
                            to={`/properties/${p.id}`}
                            className="block text-xs text-primary underline hover:text-secondary truncate"
                            target="_blank"
                          >
                            {p.title}
                          </Link>
                        ))
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 min-w-[130px] whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-blue-600 text-xs font-semibold hover:underline"
                          onClick={() => setViewLead(lead)}
                        >
                          View
                        </button>
                        <button
                          className="text-green-600 text-xs font-semibold hover:underline"
                          onClick={() => handleEditLead(lead)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 text-xs font-semibold hover:underline"
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deletingId === lead.id}
                        >
                          {deletingId === lead.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <div>
              Showing <span className="font-semibold">{Math.min(leads.length, 10)}</span> of{' '}
              <span className="font-semibold">{leads.length}</span> entries
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(page => (
                <button
                  key={page}
                  className={`px-2.5 py-1 rounded border ${page === 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-100'
                    }`}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement; 