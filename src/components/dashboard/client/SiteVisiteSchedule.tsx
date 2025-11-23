import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { API_BASE_URL } from '../../../api';

type SiteVisitRow = {
  id: string;
  lead_id: string;
  property_id: string | null;
  scheduled_at: string; // ISO
  note?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type LeadLite = {
  id: string;
  email?: string;
  phone?: string;
  propertyId?: string | null;
  propertyTitle?: string | null;
  createdAt?: string | null;
};

export default function SiteVisiteSchedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visits, setVisits] = useState<SiteVisitRow[]>([]);
  const [propertyTitles, setPropertyTitles] = useState<Record<string, string>>({});

  const loadVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user || null;
      const email = (user?.email || '').toLowerCase();
      const phone = String(user?.phone || user?.user_metadata?.phone || '');

      // Try to fetch visits joined to leads filtered by this user
      let combined: any[] = [];
      const baseSelect =
        'id, lead_id, property_id, scheduled_at, note, status, created_at, leads!inner(id,email,phone)';

      if (email) {
        const { data, error: e1 } = await supabase
          .from('site_visite_schedule')
          .select(baseSelect)
          .eq('leads.email', email)
          .order('scheduled_at', { ascending: true });
        if (!e1 && Array.isArray(data)) combined = combined.concat(data);
      }
      if (phone) {
        const { data, error: e2 } = await supabase
          .from('site_visite_schedule')
          .select(baseSelect)
          .eq('leads.phone', phone)
          .order('scheduled_at', { ascending: true });
        if (!e2 && Array.isArray(data)) combined = combined.concat(data);
      }

      let nextVisits: SiteVisitRow[] = [];
      if (combined.length === 0) {
        // Fallback: fetch all visits visible to this user (depends on read policy)
        const { data: siteVisits, error: svErr } = await supabase
          .from('site_visite_schedule')
          .select('id, lead_id, property_id, scheduled_at, note, status, created_at')
          .order('scheduled_at', { ascending: true });
        if (svErr) throw svErr;
        nextVisits = Array.isArray(siteVisits) ? (siteVisits as SiteVisitRow[]) : [];
      } else {
        // Normalize and deduplicate
        const norm = combined.map((v: any) => ({
          id: v.id,
          lead_id: v.lead_id,
          property_id: v.property_id ?? null,
          scheduled_at: v.scheduled_at,
          note: v.note,
          status: v.status,
          created_at: v.created_at,
        }));
        const seen = new Set<string>();
        nextVisits = norm.filter((x: any) => {
          if (seen.has(x.id)) return false;
          seen.add(x.id);
          return true;
        }) as SiteVisitRow[];
      }

      setVisits(nextVisits);

      // Enrich property titles
      const propertyIds = Array.from(
        new Set((nextVisits || []).map((v: any) => v.property_id).filter(Boolean))
      );
      if (propertyIds.length > 0) {
        const { data: properties } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);
        if (properties && Array.isArray(properties)) {
          const map: Record<string, string> = {};
          for (const p of properties) {
            map[p.id] = p.title;
          }
          setPropertyTitles(map);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load site visits');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVisits(); }, []);

  // Realtime updates: refresh when visits change
  useEffect(() => {
    const channel = supabase
      .channel('site-visite-schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_visite_schedule' }, () => {
        loadVisits();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const rows = useMemo(() => {
    return visits.map(v => {
      const propId = v.property_id || undefined;
      const propTitle =
        (propId && propertyTitles[propId]) || (propId || '—');
      return {
        id: v.id,
        leadId: v.lead_id,
        propertyId: propId,
        propertyTitle: propTitle,
        scheduledAt: v.scheduled_at,
        note: v.note || '',
        status: v.status || 'scheduled',
      };
    });
  }, [visits, propertyTitles]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Visite Schedule</h3>
      {error && <div className="mb-3 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">{error}</div>}
      {loading ? (
        <p className="text-gray-600">Loading site visits…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-600">No site visits scheduled yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr className="text-gray-700 text-sm">
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Inquiry</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Property</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Date</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Note</th>
                <th className="px-3 md:px-4 py-2 text-left whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">#{r.leadId.slice(0, 8)}</td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    {r.propertyId ? (
                      <a
                        href={`/properties/${r.propertyId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {r.propertyTitle}
                      </a>
                    ) : (
                      <span className="text-gray-900">{r.propertyTitle}</span>
                    )}
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    {new Date(r.scheduledAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-3 md:px-4 py-3">{r.note || '—'}</td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


