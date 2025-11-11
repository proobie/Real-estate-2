import React, { useEffect, useMemo, useState } from 'react';
import { useProperties } from '../../../contexts/PropertyContext';
import { listUsers, listKeys, createKey as apiCreateKey, updateKey as apiUpdateKey, deleteKey as apiDeleteKey, assignKey as apiAssignKey } from '../../../api';

type KeyStatus = 'Available' | 'Issued' | 'Returned' | 'Lost' | 'Duplicated';

interface KeyRecord {
  id: string;
  propertyId: string; // property id from PropertyContext
  holder: string;
  contact: string;
  status: KeyStatus;
  issuedOn: string; // ISO date
  returnedOn?: string; // ISO date
  remarks?: string;
  assignedTo?: string; // user id
  history: Array<{
    holder: string;
    contact: string;
    issuedOn: string;
    returnedOn?: string;
    assignedTo?: string;
    status?: KeyStatus;
  }>;
}

const initialData: KeyRecord[] = [];

function statusBadgeColor(status: KeyStatus) {
  switch (status) {
    case 'Available': return 'bg-green-100 text-green-800';
    case 'Issued': return 'bg-yellow-100 text-yellow-800';
    case 'Returned': return 'bg-blue-100 text-blue-800';
    case 'Lost': return 'bg-red-100 text-red-800';
    case 'Duplicated': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function KeyManagement() {
  const [records, setRecords] = useState<KeyRecord[]>(initialData);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [historyFor, setHistoryFor] = useState<KeyRecord | null>(null);
  const [editing, setEditing] = useState<KeyRecord | null>(null);
  const { properties } = useProperties();
  const [users, setUsers] = useState<Array<{ id: string; name?: string; email?: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  useEffect(() => {
    setUsersLoading(true);
    setUsersError(null);
    listUsers()
      .then((u) => {
        const arr = Array.isArray(u) ? u : [];
        setUsers(arr);
      })
      .catch((e: any) => setUsersError(e?.message || 'Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, []);

  useEffect(() => {
    setKeysLoading(true);
    setKeysError(null);
    listKeys()
      .then((ks) => {
        const arr = Array.isArray(ks) ? ks : [];
        setRecords(arr as unknown as KeyRecord[]);
      })
      .catch((e: any) => setKeysError(e?.message || 'Failed to load keys'))
      .finally(() => setKeysLoading(false));
  }, []);

  const [form, setForm] = useState({
    propertyId: '',
    holder: '',
    contact: '',
    status: 'Available' as KeyStatus,
    issuedOn: '',
    returnedOn: '',
    remarks: '',
  });
  const [noReturnYet, setNoReturnYet] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r =>
      (properties.find(p => p.id === r.propertyId)?.title || '').toLowerCase().includes(q) ||
      r.holder.toLowerCase().includes(q)
    );
  }, [records, search, properties]);

  function resetForm() {
    setForm({ propertyId: '', holder: '', contact: '', status: 'Available', issuedOn: '', returnedOn: '', remarks: '' });
    setNoReturnYet(false);
  }

  async function addKey(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        propertyId: form.propertyId,
        holder: form.holder,
        contact: form.contact,
        status: form.status,
        issuedOn: form.issuedOn,
        returnedOn: form.returnedOn || undefined,
        remarks: form.remarks || undefined,
        history: [{ holder: form.holder, contact: form.contact, issuedOn: form.issuedOn, returnedOn: form.returnedOn || undefined, status: form.status }],
      } as any;
      const created = await apiCreateKey(payload);
      setRecords(prev => [created as unknown as KeyRecord, ...prev]);
      resetForm();
      setShowModal(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to create key');
    }
  }

  function startEdit(rec: KeyRecord) {
    setEditing(rec);
    setForm({
      propertyId: rec.propertyId,
      holder: rec.holder,
      contact: rec.contact,
      status: rec.status,
      issuedOn: rec.issuedOn,
      returnedOn: rec.returnedOn || '',
      remarks: rec.remarks || '',
    });
    setNoReturnYet(!rec.returnedOn);
    setShowModal(true);
  }

  async function editKey(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      const updatedHistory = [
        { holder: form.holder, contact: form.contact, issuedOn: form.issuedOn, returnedOn: form.returnedOn || undefined, status: form.status },
        ...editing.history,
      ];
      const toSend: any = {
        propertyId: form.propertyId,
        holder: form.holder,
        contact: form.contact,
        status: form.status,
        issuedOn: form.issuedOn,
        returnedOn: form.returnedOn || undefined,
        remarks: form.remarks || undefined,
        history: updatedHistory,
      };
      const saved = await apiUpdateKey(editing.id, toSend);
      setRecords(prev => prev.map(r => r.id === editing.id ? (saved as unknown as KeyRecord) : r));
      setEditing(null);
      resetForm();
      setShowModal(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to update key');
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Delete this key record?')) return;
    try {
      await apiDeleteKey(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete key');
    }
  }

  function viewHistory(rec: KeyRecord) {
    setHistoryFor(rec);
  }

  async function assignTo(recId: string, userId: string) {
    try {
      const saved = await apiAssignKey(recId, userId);
      setRecords(prev => prev.map(r => r.id === recId ? (saved as unknown as KeyRecord) : r));
    } catch (e: any) {
      alert(e?.message || 'Failed to assign key');
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Key Management</h1>
          <p className="text-gray-600">Track property keys, current holders, and history.</p>
        </div>
        <button
          className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
        >
          + Add Key
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border mb-4 md:mb-6">
        <div className="relative max-w-md">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by property or holder..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {keysLoading && <div className="p-3 text-gray-500">Loading keys...</div>}
        {keysError && <div className="p-3 text-red-600">{keysError}</div>}
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holder</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign To</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(rec => (
              <tr key={rec.id} className="text-sm">
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">{properties.find(p => p.id === rec.propertyId)?.title || rec.propertyId}</td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">{rec.holder}</td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">{rec.contact}</td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeColor(rec.status)}`}>{rec.status}</span>
                </td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">{rec.issuedOn}</td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">{rec.returnedOn || '-'}</td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                  <select
                    value={rec.assignedTo || ''}
                    onChange={(e) => assignTo(rec.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={usersLoading || !!usersError}
                  >
                    <option value="">{usersLoading ? 'Loading users…' : (usersError ? 'Users unavailable' : 'Select user…')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 md:px-6 py-3 whitespace-nowrap space-x-3">
                  <button className="text-blue-600 hover:underline" onClick={() => viewHistory(rec)}>View History</button>
                  <button className="text-green-600 hover:underline" onClick={() => startEdit(rec)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => deleteKey(rec.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 md:px-6 py-6 text-center text-gray-500" colSpan={8}>No key records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg shadow-lg p-5 md:p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowModal(false); setEditing(null); }}>×</button>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Key Record' : 'Add Key Record'}</h2>
            <form onSubmit={editing ? editKey : addKey} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block mb-1 font-medium">Property</label>
                  <select value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className="w-full px-3 py-2 border rounded" required>
                    <option value="" disabled>Select property...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Current Key Holder Name</label>
                  <input value={form.holder} onChange={e => setForm(f => ({ ...f, holder: e.target.value }))} className="w-full px-3 py-2 border rounded" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block mb-1 font-medium">Contact Number</label>
                  <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as KeyStatus }))} className="w-full px-3 py-2 border rounded">
                    <option>Available</option>
                    <option>Issued</option>
                    <option>Returned</option>
                    <option>Lost</option>
                    <option>Duplicated</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block mb-1 font-medium">Date Issued</label>
                  <input type="date" value={form.issuedOn} onChange={e => setForm(f => ({ ...f, issuedOn: e.target.value }))} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Date Returned</label>
                  <div className="flex items-center gap-3">
                    <input type="date" value={noReturnYet ? '' : form.returnedOn} onChange={e => setForm(f => ({ ...f, returnedOn: e.target.value }))} className="w-full px-3 py-2 border rounded disabled:bg-gray-100" disabled={noReturnYet} />
                    <label className="inline-flex items-center text-sm text-gray-600 whitespace-nowrap">
                      <input type="checkbox" className="mr-2" checked={noReturnYet} onChange={(e) => { setNoReturnYet(e.target.checked); if (e.target.checked) setForm(f => ({ ...f, returnedOn: '' })); }} />
                      No return yet
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Remarks (optional)</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="w-full px-3 py-2 border rounded" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 md:px-4 py-2 rounded border" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{editing ? 'Save Changes' : 'Add Key'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg shadow-lg p-5 md:p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setHistoryFor(null)}>×</button>
            <h2 className="text-xl font-bold mb-4">Key History — {properties.find(p => p.id === historyFor.propertyId)?.title || historyFor.propertyId}</h2>
            <div className="mb-4 text-sm text-gray-700">
              <span className="font-medium">Current Remarks:</span> {historyFor.remarks || '-'}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Holder</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Assigned To</th>
                    <th className="px-4 py-2 text-left">Issued On</th>
                    <th className="px-4 py-2 text-left">Returned On</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyFor.history.map((h, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-4 py-2">{h.holder}</td>
                      <td className="px-4 py-2">{h.contact}</td>
                      <td className="px-4 py-2">{h.status || '-'}</td>
                      <td className="px-4 py-2">{(() => { const u = users.find(u => u.id === h.assignedTo); return u?.name || u?.email || h.assignedTo || '-'; })()}</td>
                      <td className="px-4 py-2">{h.issuedOn}</td>
                      <td className="px-4 py-2">{h.returnedOn || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 border rounded" onClick={() => setHistoryFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


