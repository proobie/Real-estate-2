import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../../api';
import { supabase } from '../../../supabaseClient';

function formatDateTime(input) {
  try {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d.toLocaleString('en-IN');
  } catch { }
  return '';
}

function statusBadgeClass(status) {
  if (/(closed\s*lost|failed|fail|no\s*connect|could\s*not)/i.test(status)) return 'bg-red-100 text-red-700';
  if (/(closed\s*won|resolved|in\s*contact|contacted)/i.test(status)) return 'bg-green-100 text-green-700';
  if (/(assigned|review|qualified|negotiation|site\s*visit|pending)/i.test(status)) return 'bg-yellow-100 text-yellow-800';
  if (/(closed|inactive|archived)/i.test(status)) return 'bg-gray-100 text-gray-700';
  if (/(new|pending|open)/i.test(status)) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-700';
}

function SortableTh({ label, active, dir, onClick }) {
  return (
    <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap select-none">
      <button onClick={onClick} className={`inline-flex items-center gap-1 ${active ? 'text-blue-700' : 'text-gray-700'} hover:text-blue-800`}>
        <span>{label}</span>
        <span className="text-xs">{active ? (dir === 'asc' ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  );
}

// Normalizes an inquiry/lead into the UI shape we expect
function normalizeRecord(rec) {
  const createdAt = rec.createdAt || rec.created_at || rec.created_on || rec.date || new Date().toISOString();
  const updatedAt = rec.updatedAt || rec.updated_at || rec.updatedOn || rec.updated_on || rec.lastUpdated || rec.last_updated || rec.modifiedAt || rec.modified_at || rec.lastUpdate || null;
  const propertyId = rec.propertyId || rec.property_id || '';
  const propertyTitle = rec.propertyTitle || rec.property_title || rec.property || propertyId || '—';
  const status = String(rec.status || 'New');
  return {
    id: rec.id || `${propertyId}-${createdAt}`,
    propertyId,
    propertyTitle,
    createdAt,
    updatedAt,
    status,
    notes: rec.notes || rec.message || '',
    communicationLog: rec.communicationLog || rec.timeline || [],
  };
}

export default function InquiryHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('submitted'); // 'property' | 'submitted' | 'status' | 'updated'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [expandedId, setExpandedId] = useState(null);

  async function loadInquiries(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const user = session?.session?.user || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const isLocal = typeof window !== 'undefined' && String(API_BASE_URL).includes('localhost');
      const PROD_API = 'https://real-estate-2-production.up.railway.app';

      // 1) Preferred user-scoped endpoint (current base)
      let res = await fetch(`${API_BASE_URL}/api/user/inquiries`, { headers });
      let list = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data.map(normalizeRecord) : [];
      } else {
        // 1b) Try production user-scoped when local base fails
        if (isLocal) {
          const prodUser = await fetch(`${PROD_API}/api/user/inquiries`, { headers });
          if (prodUser.ok) {
            const data = await prodUser.json();
            list = Array.isArray(data) ? data.map(normalizeRecord) : [];
          }
        }

        // 2) Legacy leads endpoint with client-side filter by user (current base)
        if (list.length === 0) {
          res = await fetch(`${API_BASE_URL}/api/leads`, { headers });
          if (res.ok) {
            const data = await res.json();
            const email = (user?.email || '').toLowerCase();
            const phone = user?.phone || user?.user_metadata?.phone || '';
            const mine = Array.isArray(data)
              ? data.filter((l) => {
                const le = String(l.email || '').trim().toLowerCase();
                const lp = String(l.phone || '').replace(/\D/g, '');
                const up = String(phone || '').replace(/\D/g, '');
                return (email && le === email) || (up && lp && lp === up);
              })
              : [];
            list = mine.map(normalizeRecord);
          }
        }

        // 2b) Legacy leads endpoint on production as last resort
        if (list.length === 0 && isLocal) {
          const prodLeads = await fetch(`${PROD_API}/api/leads`, { headers });
          if (prodLeads.ok) {
            const data = await prodLeads.json();
            const email = (user?.email || '').toLowerCase();
            const phone = user?.phone || user?.user_metadata?.phone || '';
            const mine = Array.isArray(data)
              ? data.filter((l) => {
                const le = String(l.email || '').trim().toLowerCase();
                const lp = String(l.phone || '').replace(/\D/g, '');
                const up = String(phone || '').replace(/\D/g, '');
                return (email && le === email) || (up && lp && lp === up);
              })
              : [];
            list = mine.map(normalizeRecord);
          }
        }

        // 3) No mock fallback – show empty state when no records or load fails
        if (!Array.isArray(list)) list = [];
      }

      // Fetch property titles for inquiries that have propertyId but missing propertyTitle
      const needsTitle = list.filter(i => i.propertyId && (!i.propertyTitle || i.propertyTitle === i.propertyId));
      if (needsTitle.length > 0) {
        const propertyIds = [...new Set(needsTitle.map(i => i.propertyId).filter(Boolean))];
        try {
          const { data: properties } = await supabase
            .from('properties')
            .select('id, title')
            .in('id', propertyIds);
          if (properties && Array.isArray(properties)) {
            const propMap = properties.reduce((acc, p) => {
              acc[p.id] = p.title;
              return acc;
            }, {});
            list = list.map(i => {
              if (i.propertyId && (!i.propertyTitle || i.propertyTitle === i.propertyId)) {
                return { ...i, propertyTitle: propMap[i.propertyId] || i.propertyTitle || i.propertyId };
              }
              return i;
            });
          }
        } catch (err) {
          console.error('Failed to fetch property titles:', err);
        }
      }

      setInquiries(list);
    } catch (e) {
      setError('Failed to load inquiries');
      setInquiries([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries(false);
    const onFocus = () => loadInquiries(true);
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(() => { if (!document.hidden) loadInquiries(true); }, 30000);
    return () => { window.removeEventListener('focus', onFocus); window.clearInterval(interval); };
  }, []);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'status' || key === 'property' ? 'asc' : 'desc');
    }
  }

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = inquiries.filter((i) => !q || String(i.propertyTitle).toLowerCase().includes(q));
    const enriched = filtered.map((i) => {
      const last = i.updatedAt || (Array.isArray(i.communicationLog) && i.communicationLog.length
        ? new Date(Math.max(...i.communicationLog.map((l) => new Date(l.timestamp).getTime()))).toISOString()
        : null);
      return { ...i, lastUpdate: last };
    });
    const withKeys = enriched.map((i) => ({
      i,
      propertyKey: String(i.propertyTitle || '').toLowerCase(),
      submittedKey: new Date(i.createdAt).getTime() || 0,
      statusKey: String(i.status || '').toLowerCase(),
      updatedKey: i.lastUpdate ? new Date(i.lastUpdate).getTime() || 0 : 0,
    }));
    withKeys.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'property': cmp = a.propertyKey.localeCompare(b.propertyKey); break;
        case 'submitted': cmp = a.submittedKey - b.submittedKey; break;
        case 'status': cmp = a.statusKey.localeCompare(b.statusKey); break;
        case 'updated': cmp = a.updatedKey - b.updatedKey; break;
        default: cmp = a.submittedKey - b.submittedKey;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return withKeys.map((x) => x.i);
  }, [inquiries, search, sortKey, sortDir]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Inquiry History</h3>
        <p className="text-sm text-gray-500 mt-1">Track statuses of all property enquiries you have made.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="text-sm text-gray-600">
          {loading ? 'Loading your inquiries…' : (inquiries.length > 0 ? `${inquiries.length} enquiries` : ' ')}
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property name"
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">{error}</div>
      )}

      {!loading && inquiries.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-700 font-medium">You haven't made any property inquiries yet. Find a property you love and contact us to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-700 text-sm">
                <SortableTh label="Property" active={sortKey === 'property'} dir={sortDir} onClick={() => toggleSort('property')} />
                <SortableTh label="Date Submitted" active={sortKey === 'submitted'} dir={sortDir} onClick={() => toggleSort('submitted')} />
                <SortableTh label="Status" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
                <SortableTh label="Last Update" active={sortKey === 'updated'} dir={sortDir} onClick={() => toggleSort('updated')} />
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-5 bg-gray-200 rounded w-20" /></td>
                    <td className="px-3 md:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No results match your search.</td>
                </tr>
              ) : items.map((rec) => {
                const link = rec.propertyId ? `/properties/${rec.propertyId}` : null;
                return (
                  <React.Fragment key={rec.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId((p) => (p === rec.id ? null : rec.id))}>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                        {link ? (
                          <a href={link} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noreferrer">{rec.propertyTitle}</a>
                        ) : (
                          <span className="text-gray-900">{rec.propertyTitle}</span>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">{formatDateTime(rec.createdAt)}</td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass(rec.status)}`}>{rec.status}</span>
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">{rec.lastUpdate ? formatDateTime(rec.lastUpdate) : '—'}</td>
                    </tr>
                    {expandedId === rec.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg border p-4">
                              <div className="font-semibold mb-2">Original Message</div>
                              <div className="text-sm text-gray-700 whitespace-pre-line">{rec.notes || '—'}</div>
                            </div>
                            <div className="bg-white rounded-lg border p-4">
                              <div className="font-semibold mb-2">Timeline</div>
                              {Array.isArray(rec.communicationLog) && rec.communicationLog.length > 0 ? (
                                <ul className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                  {[...rec.communicationLog]
                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .map((log, idx) => (
                                      <li key={idx} className="text-sm">
                                        <div className="font-medium capitalize">{log.type}</div>
                                        <div className="text-gray-700">{log.content}</div>
                                        <div className="text-gray-400 text-xs mt-0.5">{formatDateTime(log.timestamp)}</div>
                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <div className="text-sm text-gray-500">No timeline entries yet.</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


