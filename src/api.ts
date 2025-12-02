// Resolve API base URL with sensible defaults for local dev and explicit config for production
const envBase: string | undefined = (import.meta as any)?.env?.VITE_API_BASE_URL?.trim();
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(hostname);
// Optional runtime override: set `window.__API_BASE_URL__ = 'https://api.example.com'` before app loads
const runtimeOverride = isBrowser ? (window as any).__API_BASE_URL__ : undefined;
// Optional persistent override for quick testing without rebuild. Set via DevTools then reload:
// localStorage.setItem('API_BASE_URL', 'https://api.example.com')
const storageOverride = isBrowser ? localStorage.getItem('API_BASE_URL') || undefined : undefined;

const defaultProdApi = 'https://real-estate-2-production.up.railway.app';
export const API_BASE_URL: string =
  (envBase && envBase.length > 0 ? envBase :
    (runtimeOverride && String(runtimeOverride).length > 0 ? String(runtimeOverride) :
      (storageOverride && storageOverride.length > 0 ? storageOverride :
        (isLocalhost ? 'http://localhost:5000' : defaultProdApi))));

// Only warn in local development to avoid noisy logs in production
if (isBrowser && isLocalhost && !envBase && !runtimeOverride && !storageOverride) {
  // eslint-disable-next-line no-console
  console.warn('[Config] VITE_API_BASE_URL is not set. Using', API_BASE_URL);
}

export async function addLead(lead: any) {
  async function postWithAuth(base: string) {
    return authFetch(`${base}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
  }

  async function postNoAuth(base: string) {
    return fetch(`${base}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
  }

  async function ensureOk(res: Response | null) {
    if (!res) throw new Error('Failed to add lead');
    if (!res.ok) {
      try {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to add lead');
      } catch {
        throw new Error('Failed to add lead');
      }
    }
    try { return await res.json(); } catch { return { ok: true }; }
  }

  async function tryRequest(fn: () => Promise<Response>): Promise<Response | null> {
    try {
      const res = await fn();
      if (res && res.ok) return res;
      return res;
    } catch {
      return null;
    }
  }

  // Attempt order: current(auth) → current(no-auth) → prod(auth) → prod(no-auth)
  let res: Response | null = null;
  res = await tryRequest(() => postWithAuth(API_BASE_URL));
  if (!res || !res.ok) res = await tryRequest(() => postNoAuth(API_BASE_URL));
  if ((!res || !res.ok) && typeof API_BASE_URL === 'string' && API_BASE_URL.includes('localhost')) {
    if (!res || !res.ok) res = await tryRequest(() => postWithAuth(defaultProdApi));
    if (!res || !res.ok) res = await tryRequest(() => postNoAuth(defaultProdApi));
  }

  // Final fallback: write directly to Supabase 'leads' if HTTP calls failed (useful when local backend is down or CORS blocks)
  if (!res || !res.ok) {
    try {
      const payload = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        type: lead.type,
        priority: lead.priority,
        status: lead.status || 'New',
        assigned_to: lead.assignedTo || null,
        notes: lead.notes || '',
        property_id: lead.propertyId || null,
      };
      const { data, error } = await supabase.from('leads').insert(payload).select('*').single();
      if (error) throw error;
      const transformed = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        type: data.type,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assigned_to,
        createdAt: data.created_at,
        updatedAt: data.updated_at || null,
        notes: data.notes,
        communicationLog: data.communication_log || [],
        reminders: data.reminders || [],
        propertyId: data.property_id,
        propertyTitle: lead.propertyTitle || null,
      };
      return transformed;
    } catch {
      // fall through to generic error
    }
  }

  return ensureOk(res);
}

// Property search for chatbot assistant
export interface PropertySearchFilters {
  query?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
  listingType?: 'sale' | 'rent';
}

export async function searchProperties(filters: PropertySearchFilters) {
  const res = await fetch(`${API_BASE_URL}/api/properties/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters || {}),
  });
  if (!res.ok) throw new Error('Failed to search properties');
  return res.json();
}

// AI chat API
export interface AiMessage { role: 'system' | 'user' | 'assistant'; content: string }
export async function aiChat(messages: AiMessage[]) {
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    let msg = 'AI chat failed';
    try { const d = await res.json(); if (d?.error) msg = d.error; } catch { }
    throw new Error(msg);
  }
  return res.json() as Promise<{ reply: string; filters: PropertySearchFilters; propertyResults: any[]; projectResults: any[] }>;
}

// --- Authenticated fetch helper ---
import { supabase } from './supabaseClient';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

// Users (Auth) API
export interface CreateUserPayload {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'employee' | 'client';
  phone?: string;
  role_key?: string;
}

export async function listUsers() {
  let res = await authFetch(`${API_BASE_URL}/api/users`);
  // If local backend is missing admin creds, fall back to production API just for this call
  if (!res.ok && API_BASE_URL.includes('localhost')) {
    try {
      res = await fetch(`${defaultProdApi}/api/users`);
    } catch {
      // ignore and let the generic error below surface
    }
  }
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

// --- Keys API ---
export interface KeyRecordDto {
  id: string;
  propertyId: string;
  holder: string;
  contact: string;
  status: 'Available' | 'Issued' | 'Returned' | 'Lost' | 'Duplicated';
  issuedOn: string;
  returnedOn?: string;
  remarks?: string;
  assignedTo?: string;
  history: Array<{ holder: string; contact: string; issuedOn: string; returnedOn?: string; assignedTo?: string; status?: 'Available' | 'Issued' | 'Returned' | 'Lost' | 'Duplicated' }>;
  createdAt?: string;
}

export async function listKeys(): Promise<KeyRecordDto[]> {
  const res = await authFetch(`${API_BASE_URL}/api/keys`);
  if (!res.ok) throw new Error('Failed to load keys');
  return res.json();
}

export async function createKey(payload: Omit<KeyRecordDto, 'id' | 'createdAt' | 'history'> & { history?: KeyRecordDto['history'] }): Promise<KeyRecordDto> {
  const res = await authFetch(`${API_BASE_URL}/api/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create key');
  return res.json();
}

export async function updateKey(id: string, update: Partial<KeyRecordDto>): Promise<KeyRecordDto> {
  const res = await authFetch(`${API_BASE_URL}/api/keys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update key');
  return res.json();
}

export async function deleteKey(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/api/keys/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete key');
}

export async function assignKey(id: string, userId: string): Promise<KeyRecordDto> {
  const res = await authFetch(`${API_BASE_URL}/api/keys/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to assign key');
  return res.json();
}

export async function createUser(payload: CreateUserPayload) {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = 'Failed to create user';
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { }
    throw new Error(message);
  }
  return res.json();
}

// Roles API
export interface RoleRecord {
  id: string;
  name: string;
  key: string;
  permissions: any;
}

export async function listRoles(): Promise<RoleRecord[]> {
  const res = await authFetch(`${API_BASE_URL}/api/roles`);
  if (!res.ok) throw new Error('Failed to load roles');
  return res.json();
}

export async function createRole(role: { name: string; key: string; permissions: any; }) {
  const res = await authFetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  });
  if (!res.ok) throw new Error('Failed to create role');
  return res.json();
}

export async function updateRole(id: string, role: { name: string; key: string; permissions: any; }) {
  const res = await authFetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function deleteRole(id: string) {
  const res = await authFetch(`${API_BASE_URL}/api/roles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete role');
}