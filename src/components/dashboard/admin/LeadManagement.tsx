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
                {viewLead.notes && <div><span className="font-medium">Notes:</span> {viewLead.notes}</div>}
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead>
              <tr>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Name</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Email</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Phone</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Source</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Type</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Priority</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Status</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Assigned To</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Created At</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Property</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Recs</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b text-sm">
                  <td className="px-3 md:px-4 py-2">{lead.name}</td>
                  <td className="px-3 md:px-4 py-2">{lead.email}</td>
                  <td className="px-3 md:px-4 py-2">{lead.phone}</td>
                  <td className="px-3 md:px-4 py-2">{lead.source}</td>
                  <td className="px-3 md:px-4 py-2">{lead.type}</td>
                  <td className="px-3 md:px-4 py-2">{lead.priority}</td>
                  <td className="px-3 md:px-4 py-2">{lead.status}</td>
                  <td className="px-3 md:px-4 py-2">{lead.assignedTo}</td>
                  <td className="px-3 md:px-4 py-2 whitespace-nowrap">{lead.createdAt}</td>
                  <td className="px-3 md:px-4 py-2">
                    {lead.propertyId ? (
                      <Link to={`/properties/${lead.propertyId}`} className="text-blue-600 underline hover:text-blue-800" target="_blank">
                        {lead.propertyTitle || lead.propertyId}
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-3 md:px-4 py-2">
                    {getRecommendations(lead).map(p => (
                      <Link key={p.id} to={`/properties/${p.id}`} className="block text-sm text-primary underline hover:text-secondary" target="_blank">
                        {p.title}
                      </Link>
                    ))}
                  </td>
                  <td className="px-3 md:px-4 py-2 whitespace-nowrap">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => setViewLead(lead)}>View</button>
                    <button className="text-green-600 hover:underline mr-2" onClick={() => handleEditLead(lead)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDeleteLead(lead.id)} disabled={deletingId === lead.id}>{deletingId === lead.id ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadManagement; 