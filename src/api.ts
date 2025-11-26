// Resolve API base URL with sensible defaults for local dev and explicit config for production
const envBase: string | undefined = (import.meta as any)?.env?.VITE_API_BASE_URL?.trim();
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(hostname);
// Optional runtime override: set `window.__API_BASE_URL__ = 'https://api.example.com'` before app loads
const runtimeOverride = isBrowser ? (window as any).__API_BASE_URL__ : undefined;
// Optional persistent override for quick testing without rebuild. Set via DevTools then reload:
// localStorage.setItem('API_BASE_URL', 'https://api.example.com')
const storageOverride = undefined; // FORCE IGNORE STORAGE for now to fix caching issues

const defaultProdApi = 'https://api.lotliterealestate.com';
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
  const res = await fetch(`${API_BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error('Failed to add lead');
  return res.json();
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
    try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
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
  const res = await fetch(`${API_BASE_URL}/api/users`);
  if (!res.ok) throw new Error('Failed to load users');
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
    } catch {}
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