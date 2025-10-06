import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
// Fallback: if running from backend/ and env lives at project root, load it
if (!process.env.SUPABASE_SERVICE_KEY) {
  try {
    const rootEnvPath = path.resolve(__dirname, '../../.env');
    dotenv.config({ path: rootEnvPath });
  } catch { }
}

/** @type {import('express').Express} */
const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = 'https://vlboszmxhmamsviufucv.supabase.co';


// Accept common env var names and trim whitespace/quotes
let supabaseKey = (process.env.SUPABASE_SERVICE_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SECRET
  || '').toString().trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
if (!supabaseKey) {
  // As a last resort, avoid using anon key for server-side admin operations,
  // but allow app to start with a clear warning for read-only scenarios.
  const maybeAnon = (process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || '').toString().trim();
  if (maybeAnon) {
    console.warn('[Config] Using SUPABASE_ANON_KEY as fallback. For full features, set SUPABASE_SERVICE_KEY.');
    supabaseKey = maybeAnon;
  }
}
if (!supabaseKey) {
  console.error('[Config] Missing Supabase service key. Checked SUPABASE_SERVICE_KEY / SUPABASE_SERVICE_ROLE_KEY.');
}
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- OpenAI setup (optional) ---
const openaiApiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '').toString().trim();
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null as unknown as OpenAI;

// --- Auth/Permission helpers ---
type Section = 'properties' | 'projects' | 'leads' | 'roles';
type Action = 'view' | 'create' | 'edit' | 'delete';

async function getUserFromRequest(req: Request) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function getPermissionsForUser(user: any) {
  // Admin shortcut
  const roleKey = user?.user_metadata?.role_key || user?.user_metadata?.role || '';
  if (roleKey === 'admin') {
    return {
      properties: { view: true, create: true, edit: true, delete: true },
      projects: { view: true, create: true, edit: true, delete: true },
      leads: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
    } as Record<string, Record<string, boolean>>;
  }
  if (!roleKey) return {};
  const { data } = await supabase.from('roles').select('permissions').eq('key', roleKey).single();
  return (data?.permissions || {}) as Record<string, Record<string, boolean>>;
}

function requireAdmin() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await getUserFromRequest(req);
      if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const roleKey = user.user_metadata?.role_key || user.user_metadata?.role || '';
      if (roleKey !== 'admin') { res.status(403).json({ error: 'Admin only' }); return; }
      next();
    } catch (e) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

function requirePermission(section: Section, action: Action) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await getUserFromRequest(req);
      if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const roleKey = user.user_metadata?.role_key || user.user_metadata?.role || '';
      if (roleKey === 'admin') return next();
      const perms = await getPermissionsForUser(user);
      const allowed = Boolean((perms as any)?.[section]?.[action]);
      if (!allowed) { res.status(403).json({ error: 'Forbidden' }); return; }
      next();
    } catch (e) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

async function uploadToSupabaseStorage(file: Express.Multer.File, folder = '') {
  const path = require('path');
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const storagePath = folder ? `${folder}/${filename}` : filename;
  const { error } = await supabase.storage.from('uploads').upload(storagePath, file.buffer, { upsert: false, contentType: file.mimetype });
  if (error) throw error;
  return `${supabaseUrl}/storage/v1/object/public/uploads/${storagePath}`;
}

// Middleware
const ALLOWED_ORIGINS: string[] = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Ensure CORS headers are always present, even on 404/500
app.use((req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin as string | undefined;
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  if (allowed) {
    res.header('Access-Control-Allow-Origin', allowed);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// In-memory property store
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: string;
  possession: string;
  parking: string;
  facing: string;
  floor: number;
  totalFloors: number;
  ageOfProperty: number;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  brochure?: string;
  floorPlan?: string;
  features: string[];
  status: string;
  featured: boolean;
  verified: boolean;
  reraId: string;
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo: string;
    specialization: string;
    experience: number;
    languages: string[];
    reraLicense: string;
  };
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  createdBy?: string;
  highlights?: string[];
  bookingAmount?: number;
  listingType?: 'sale' | 'rent';
  rentAmount?: number;
  deposit?: number;
  leaseTerm?: string;
  availableFrom?: string;
  maintenance?: number;
}

// REMOVE: properties array, propertiesFilePath, loading/saving from disk, and all old /api/properties endpoints and helpers
// Only keep the new Supabase-based /api/properties endpoints (GET, POST, PUT, DELETE) as previously implemented.

// Project interface (match frontend type)
interface Project {
  id: string;
  name: string;
  description: string;
  developer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'ready-to-move';
  launchDate?: string;
  possession?: string;
  reraId?: string;
  approvals?: string[];
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  masterPlan?: string;
  floorPlans: string[];
  amenities: string[];
  priceRange: { min: number; max: number };
  unitTypes: string[];
  configurations?: { type: string; area: number; price: number }[];
  brochure?: string;
  completionDate?: string;
  totalUnits: number;
  availableUnits: number;
  bankApprovals?: string[];
  highlights?: string[];
  pricing?: Array<{ type: string; area: number; basePrice: number; pricePerSqFt: number }>;
  landmarks?: Array<{ name: string; distance: string; category: string }>;
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- PROPERTIES API USING SUPABASE ---

// Get all properties
app.get('/api/properties', async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('properties').select('*, profiles!createdBy(*)');
  if (error) {
    console.error('Error fetching properties from Supabase:', error);
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

// Get property by ID
app.get('/api/properties/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('properties').select('*, profiles!createdBy(*)').eq('id', id).single();
  if (error || !data) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }
  res.json(data);
});

// Semantic search helper for chatbot-style queries
// Accepts JSON body: { query?: string, city?, type?, minPrice?, maxPrice? }
app.post('/api/properties/search', async (req: Request, res: Response) => {
  try {
    const { query, city, type, minPrice, maxPrice } = req.body || {};

    let q = supabase.from('properties').select('*');

    // Basic filters
    if (type) {
      // @ts-ignore
      q = q.eq('type', type);
    }
    if (typeof minPrice === 'number') {
      // @ts-ignore
      q = q.gte('price', minPrice);
    }
    if (typeof maxPrice === 'number') {
      // @ts-ignore
      q = q.lte('price', maxPrice);
    }

    // Location filter by city if provided
    if (city) {
      // location is a JSONB with city field in our schema
      // @ts-ignore
      q = q.contains('location', { city });
    }

    const { data, error } = await q.limit(50);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // If a free-text query is provided, do a secondary rank based on simple scoring
    let results = data || [];
    if (query && typeof query === 'string' && query.trim().length > 0) {
      const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results
        .map((p: any) => {
          const hay = [p.title, p.description, p.type, p.status, p.reraId]
            .filter(Boolean)
            .join(' ') + ' ' + (p.location?.address || '') + ' ' + (p.location?.city || '');
          const text = String(hay).toLowerCase();
          const score = qWords.reduce((s: number, w: string) => s + (text.includes(w) ? 1 : 0), 0);
          return { score, p };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .map((x: any) => x.p);
    }

    res.json(results);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Invalid search request' });
  }
});

// AI chat endpoint: extracts filters from conversation, performs search, returns response + natural reply
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    if (!openai) { res.status(500).json({ error: 'AI not configured' }); return; }
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) { res.status(400).json({ error: 'messages array required' }); return; }

    const systemPrompt = `You are Lotlite's AI assistant. Help with ONLY property or project related queries.
If the user requests anything unrelated, politely say you can answer property/project questions and offer to connect to a human: +91 9011135889.
If asked to talk to a human, include in 'reply' the phone number +91 9011135889.
Do not refuse to show listings. If information is insufficient, ask concise follow-ups. Only suggest calling a human when no results match or the user requests a human.
Extract and return STRICT JSON with these keys (omit unknown):
  reply: string                       // friendly response or next step
  category?: "property" | "project"   // user's intent
  type?: string                        // for property, e.g., "Apartment"
  listingType?: "sale" | "rent"        // for property
  bhk?: number                         // bedrooms for property (e.g., 2,3,4)
  city?: string
  minPriceINR?: number                 // integer rupees (1 Cr=10000000, 90 Lacs=9000000)
  maxPriceINR?: number                 // integer rupees
  query?: string
Rules:
- Convert crore/lakh/lac to rupees.
- Output JSON ONLY.`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: String(m.content || '') }))
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' } as any
    });

    const content = chat.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { }

    // Normalize numeric prices if expressed in strings
    const normalize = (v: any) => typeof v === 'string' ? Number(v.replace(/[^0-9.]/g, '')) : v;
    const searchFilters = {
      query: parsed.query,
      type: parsed.type,
      city: parsed.city,
      minPrice: typeof parsed.minPriceINR === 'number' ? parsed.minPriceINR : normalize(parsed.minPrice),
      maxPrice: typeof parsed.maxPriceINR === 'number' ? parsed.maxPriceINR : normalize(parsed.maxPrice),
    };

    // Infer listing type (sale/rent) from model output or query text
    let listingType: 'sale' | 'rent' | undefined = undefined;
    const qLower = String(parsed.query || '').toLowerCase();
    if (typeof parsed.listingType === 'string') {
      const lt = String(parsed.listingType).toLowerCase();
      listingType = lt.includes('rent') ? 'rent' : (lt.includes('buy') || lt.includes('sale') ? 'sale' : undefined);
    } else if (qLower.includes('rent')) {
      listingType = 'rent';
    } else if (qLower.includes('buy') || qLower.includes('sale')) {
      listingType = 'sale';
    }
    const bhk: number | undefined = typeof parsed.bhk === 'number' ? parsed.bhk : undefined;
    const category: string = String(parsed.category || '').toLowerCase();
    const propertyIntent = category === 'property' || listingType != null || /apartment|flat/i.test(String(parsed.type || ''));
    const projectIntent = category === 'project' || /project/i.test(qLower);

    const hasPropertyRequirements = Boolean(propertyIntent && searchFilters.city && (searchFilters.minPrice || searchFilters.maxPrice) && typeof bhk === 'number');
    const hasProjectRequirements = Boolean(projectIntent && searchFilters.city);

    let results: any[] = [];
    let projectResults: any[] = [];
    if (hasPropertyRequirements) {
      // Perform property search
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(50);
      if (error) { res.status(500).json({ error: error.message }); return; }
      results = data || [];
      if (searchFilters.type) results = results.filter((p: any) => (p.type || '').toLowerCase() === String(searchFilters.type).toLowerCase());
      if (searchFilters.city) results = results.filter((p: any) => (p.location?.city || '').toLowerCase() === String(searchFilters.city).toLowerCase());
      if (listingType) results = results.filter((p: any) => (p.listingType || '').toLowerCase() === listingType);
      // Choose the correct numeric field based on listing type
      const getAmount = (p: any) => listingType === 'rent' ? Number(p.rentAmount || 0) : Number(p.price || 0);
      if (typeof searchFilters.minPrice === 'number') results = results.filter((p: any) => getAmount(p) >= (searchFilters.minPrice as number));
      if (typeof searchFilters.maxPrice === 'number') results = results.filter((p: any) => getAmount(p) <= (searchFilters.maxPrice as number));
      if (typeof bhk === 'number') results = results.filter((p: any) => Number(p.bedrooms || 0) === bhk);

    }
    if (hasProjectRequirements) {
      // Perform project search
      const { data: projectsData, error: projectsErr } = await supabase
        .from('projects')
        .select('*')
        .limit(50);
      if (projectsErr) { res.status(500).json({ error: projectsErr.message }); return; }
      projectResults = projectsData || [];
      if (searchFilters.city) {
        projectResults = projectResults.filter((pr: any) => (pr.location?.city || '').toLowerCase() === String(searchFilters.city).toLowerCase());
      }
      if (typeof searchFilters.minPrice === 'number' || typeof searchFilters.maxPrice === 'number') {
        projectResults = projectResults.filter((pr: any) => {
          const min = Number(pr?.priceRange?.min || 0);
          const max = Number(pr?.priceRange?.max || 0);
          const lowerOk = typeof searchFilters.minPrice !== 'number' || max === 0 || max >= searchFilters.minPrice!;
          const upperOk = typeof searchFilters.maxPrice !== 'number' || min === 0 || min <= searchFilters.maxPrice!;
          return lowerOk && upperOk;
        });
      }
    }

    // Build a concise reply (override model's reply to avoid false "searching" when requirements are incomplete)
    let reply: string;
    const parts: string[] = [];
    if (searchFilters.type) parts.push(searchFilters.type);
    if (searchFilters.city) parts.push(`in ${searchFilters.city}`);
    if (typeof bhk === 'number') parts.push(`${bhk} BHK`);
    if (listingType) parts.push(listingType === 'rent' ? 'for rent' : 'for sale');
    if (searchFilters.minPrice || searchFilters.maxPrice) {
      const min = searchFilters.minPrice ? `₹${searchFilters.minPrice.toLocaleString?.('en-IN') || searchFilters.minPrice}` : '';
      const max = searchFilters.maxPrice ? `₹${searchFilters.maxPrice.toLocaleString?.('en-IN') || searchFilters.maxPrice}` : '';
      const range = min && max ? `${min} - ${max}` : (min || max);
      if (range) parts.push(`budget ${range}`);
    }
    if (hasPropertyRequirements || hasProjectRequirements) {
      reply = parts.length > 0 ? `Searching for ${parts.join(' ')}. Please hold on for a moment.` : `Searching...`;
      if (results.length > 0 || projectResults.length > 0) {
        // Replace searching text with results intro
        reply = parts.length > 0 ? `Here are some options for ${parts.join(' ')}.` : `Here are some options I found.`;
      } else if (results.length === 0 && projectResults.length === 0) {
        reply = `I couldn't find exact matches yet. You can adjust type, city, BHK, or budget.`;
      }
    } else {
      if (propertyIntent) {
        // Ask only for what is missing
        const needs: string[] = [];
        if (!searchFilters.city) needs.push('city');
        if (!(searchFilters.minPrice || searchFilters.maxPrice)) needs.push('budget');
        if (typeof bhk !== 'number') needs.push('BHK (2/3/4)');
        reply = `Got it! Please share ${needs.join(', ')} to continue.`;
      } else if (projectIntent) {
        reply = `Great! Which city/area are you interested in for projects?`;
      } else {
        reply = `I can help with apartments (buy/rent) or projects. Start with 'Buy apartments', 'Rent apartments' or 'Browse projects'.`;
      }
    }

    res.json({ reply, filters: searchFilters, propertyResults: results, projectResults });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'AI chat failed' });
  }
});

// Create a new property
app.post('/api/properties', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'brochure', maxCount: 1 },
  { name: 'floorPlan', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const files = req.files as Record<string, Express.Multer.File[]>;

    let images: string[] = [];
    if (files.images) {
      images = await Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'properties/images')));
    }

    let brochure;
    if (files.brochure && files.brochure[0]) {
      brochure = await uploadToSupabaseStorage(files.brochure[0], 'properties/brochures');
    }

    let floorPlan;
    if (files.floorPlan && files.floorPlan[0]) {
      floorPlan = await uploadToSupabaseStorage(files.floorPlan[0], 'properties/floorplans');
    }

    const parseJsonField = (field: any, defaultValue: any) => {
      if (!field) return defaultValue;
      try { return JSON.parse(field); } catch { return defaultValue; }
    };

    const newProperty = {
      title: data.title,
      description: data.description,
      type: data.type,
      furnishing: data.furnishing,
      possession: data.possession,
      parking: data.parking,
      facing: data.facing,
      status: data.status,
      reraId: data.reraId,
      projectId: data.projectId || null,
      listingType: data.listingType,
      leaseTerm: data.leaseTerm,
      availableFrom: data.availableFrom,
      images,
      brochure,
      floorPlan,
      location: parseJsonField(data.location, {}),
      features: parseJsonField(data.features, []),
      highlights: parseJsonField(data.highlights, []),
      agent: parseJsonField(data.agent, {}),
      price: Number(data.price) || 0,
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      area: Number(data.area) || 0,
      floor: Number(data.floor) || 0,
      totalFloors: Number(data.totalFloors) || 0,
      ageOfProperty: Number(data.ageOfProperty) || 0,
      bookingAmount: data.bookingAmount ? Number(data.bookingAmount) : undefined,
      rentAmount: data.rentAmount ? Number(data.rentAmount) : undefined,
      deposit: data.deposit ? Number(data.deposit) : undefined,
      maintenance: data.maintenance ? Number(data.maintenance) : undefined,
      featured: data.featured === 'true',
      verified: data.verified === 'true',
      createdBy: data.createdBy,
    };

    const { data: inserted, error } = await supabase.from('properties').insert(newProperty).select().single();

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).json({ error: error.message, details: error.details });
      return;
    }
    res.status(201).json(inserted);
  } catch (err: any) {
    console.error('POST /api/properties error:', err);
    res.status(400).json({ error: 'Invalid property data', details: err.message });
  }
});


// Update a property by ID
app.put('/api/properties/:id', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'brochure', maxCount: 1 },
  { name: 'floorPlan', maxCount: 1 }
]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data: existing, error: fetchError } = await supabase.from('properties').select('*').eq('id', id).single();
  if (fetchError || !existing) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }
  try {
    const data = req.body;
    const files = req.files as Record<string, Express.Multer.File[]>;

    let finalImages = existing.images || [];
    if (data.existingImages) {
      try { finalImages = JSON.parse(data.existingImages); } catch { }
    }
    if (files.images && files.images.length > 0) {
      const newImageUrls = await Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'properties/images')));
      finalImages = [...finalImages, ...newImageUrls];
    }

    const brochure = files.brochure?.[0] ? await uploadToSupabaseStorage(files.brochure[0], 'properties/brochures') : existing.brochure;
    const floorPlan = files.floorPlan?.[0] ? await uploadToSupabaseStorage(files.floorPlan[0], 'properties/floorplans') : existing.floorPlan;

    const updateData: any = {};

    const stringFields = ['title', 'description', 'type', 'furnishing', 'possession', 'parking', 'facing', 'status', 'reraId', 'listingType', 'leaseTerm', 'availableFrom'];
    stringFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (data.projectId !== undefined) {
      updateData.projectId = data.projectId || null;
    }

    const jsonFields = ['location', 'features', 'highlights', 'agent'];
    jsonFields.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        try { updateData[field] = JSON.parse(data[field]); } catch { }
      } else if (data[field]) {
        updateData[field] = data[field];
      }
    });

    const numericFields = ['price', 'bedrooms', 'bathrooms', 'area', 'floor', 'totalFloors', 'ageOfProperty', 'bookingAmount', 'rentAmount', 'deposit', 'maintenance'];
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = Number(data[field]);
      }
    });

    updateData.featured = data.featured === 'true';
    updateData.verified = data.verified === 'true' || existing.verified;
    if (data.createdBy) updateData.createdBy = data.createdBy;

    updateData.images = finalImages;
    updateData.brochure = brochure;
    updateData.floorPlan = floorPlan;

    const { data: updated, error } = await supabase.from('properties').update(updateData).eq('id', id).select().single();
    if (error) {
      console.error('Supabase update error:', error);
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid property data', details: err.message });
  }
});

// Bulk upload via CSV (CRM)
app.post('/api/properties/bulk-upload', upload.single('csv'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'CSV file required' });
      return;
    }
    const csvContent = fs.readFileSync(file.path, 'utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    const imported: Property[] = records.map((row: any, idx: number) => ({
      id: `import_${Date.now()}_${idx}`,
      title: row.Title,
      description: row.Description,
      price: parseFloat(row.Price),
      type: row.Type,
      bedrooms: parseInt(row.Bedrooms),
      bathrooms: parseInt(row.Bathrooms),
      area: parseFloat(row.Area),
      furnishing: 'unfurnished',
      possession: 'ready-to-move',
      parking: 'none',
      facing: 'north',
      floor: 0,
      totalFloors: 0,
      ageOfProperty: 0,
      location: {
        address: row.Address,
        city: row.City,
        coordinates: { lat: 0, lng: 0 }
      },
      images: [],
      brochure: row.Brochure || undefined,
      floorPlan: row.FloorPlan || undefined,
      features: ['Imported Property'],
      status: row.Status,
      featured: row.Featured?.toLowerCase() === 'yes',
      verified: true,
      reraId: row.RERAID || '',
      agent: {
        id: 'agent1',
        name: row['Agent Name'] || 'Default Agent',
        email: row['Agent Email'] || 'agent@example.com',
        phone: '',
        photo: '',
        specialization: '',
        experience: 0,
        languages: [],
        reraLicense: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: row.ProjectId || undefined,
      highlights: ['Imported Property'],
      bookingAmount: row.BookingAmount ? parseFloat(row.BookingAmount) : undefined,
      listingType: row.ListingType || undefined,
      rentAmount: row.RentAmount ? parseFloat(row.RentAmount) : undefined,
      deposit: row.Deposit ? parseFloat(row.Deposit) : undefined,
      leaseTerm: row.LeaseTerm || undefined,
      availableFrom: row.AvailableFrom || undefined,
      maintenance: row.Maintenance ? parseFloat(row.Maintenance) : undefined,
      createdBy: 'imported', // Indicate it's an imported property
    }));
    // The original code had properties = [...imported, ...properties];
    // Since properties is removed, this line is effectively removed.
    // The imported properties are not saved to Supabase, only the new ones are added.
    res.json({ imported: imported.length });
  } catch (err) {
    res.status(400).json({ error: 'Invalid CSV', details: err });
  }
});

// Delete property by ID
app.delete('/api/properties/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(204).send();
});

// --- USERS (AUTH) API USING SUPABASE ADMIN ---

// List users (basic)
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    // supabase-js v2 returns { users } under data
    // Normalize to array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (data as any)?.users || [];
    res.json(users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      user_metadata: u.user_metadata || {},
      last_sign_in_at: u.last_sign_in_at,
      phone: u.phone,
      is_confirmed: u.confirmed_at != null
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list users' });
  }
});

// Create user (employee/admin)
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'employee', phone } = req.body as {
      email: string; password: string; name?: string; role?: 'employee' | 'admin' | 'client'; phone?: string;
    };
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, phone }
    });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = (data as any)?.user || data;
    res.status(201).json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: user.user_metadata || {},
      last_sign_in_at: user.last_sign_in_at,
      phone: user.phone
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// --- PROJECTS API USING SUPABASE ---

// Get all projects
app.get('/api/projects', async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

// Get project by ID
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error || !data) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(data);
});

// Add new project (with file upload)
app.post('/api/projects', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'brochure', maxCount: 1 },
  { name: 'floorPlans', maxCount: 10 },
  { name: 'masterPlan', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const files = req.files as { [field: string]: Express.Multer.File[] };

    let images: string[] = [];
    if (files.images) {
      images = await Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'projects/images')));
    }
    let floorPlans: string[] = [];
    if (files.floorPlans) {
      floorPlans = await Promise.all(files.floorPlans.map(f => uploadToSupabaseStorage(f, 'projects/floorplans')));
    }
    let masterPlan;
    if (files.masterPlan && files.masterPlan[0]) {
      masterPlan = await uploadToSupabaseStorage(files.masterPlan[0], 'projects/masterplans');
    }
    let brochure;
    if (files.brochure && files.brochure[0]) {
      brochure = await uploadToSupabaseStorage(files.brochure[0], 'projects/brochures');
    }

    const parseJsonField = (field: any, defaultValue: any) => {
      if (!field) return defaultValue;
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    };

    const projectData = {
      name: data.name,
      description: data.description,
      developer: data.developer,
      status: data.status,
      launchDate: data.launchDate || null,
      possession: data.possession || null,
      reraId: data.reraId,
      approvals: parseJsonField(data.approvals, []),
      location: parseJsonField(data.location, { address: '', city: '', coordinates: { lat: 0, lng: 0 } }),
      images,
      masterPlan,
      floorPlans,
      amenities: parseJsonField(data.amenities, []),
      priceRange: parseJsonField(data.priceRange, { min: 0, max: 0 }),
      unitTypes: parseJsonField(data.unitTypes, []),
      configurations: parseJsonField(data.configurations, []),
      brochure,
      completionDate: data.completionDate || null,
      totalUnits: Number(data.totalUnits) || 0,
      availableUnits: Number(data.availableUnits) || 0,
      bankApprovals: parseJsonField(data.bankApprovals, []),
      highlights: parseJsonField(data.highlights, []),
      pricing: parseJsonField(data.pricing, []),
      landmarks: parseJsonField(data.landmarks, []),
    };

    const { data: insertedProject, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error for project:', error);
      throw new Error(error.message);
    }

    res.status(201).json(insertedProject);
  } catch (err: any) {
    console.error('Failed to add project:', err);
    res.status(400).json({ error: 'Invalid project data', details: err.message });
  }
});

// Update project by ID
app.put('/api/projects/:id', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'brochure', maxCount: 1 },
  { name: 'floorPlans', maxCount: 10 },
  { name: 'masterPlan', maxCount: 1 }
]), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const data = req.body;
    const files = req.files as { [field: string]: Express.Multer.File[] };

    let finalImages: string[] = [];
    if (data.existingImages) {
      try {
        finalImages = JSON.parse(data.existingImages);
      } catch { }
    }

    if (files.images && files.images.length > 0) {
      const newImageUrls = await Promise.all(files.images.map(f => uploadToSupabaseStorage(f, 'projects/images')));
      finalImages = [...finalImages, ...newImageUrls];
    }

    let finalFloorPlans: string[] = existingProject.floorPlans || [];
    if (data.existingFloorPlans) {
      try {
        finalFloorPlans = JSON.parse(data.existingFloorPlans);
      } catch { }
    }

    if (files.floorPlans && files.floorPlans.length > 0) {
      const newFloorPlanUrls = await Promise.all(files.floorPlans.map(f => uploadToSupabaseStorage(f, 'projects/floorplans')));
      finalFloorPlans = [...finalFloorPlans, ...newFloorPlanUrls];
    }

    const masterPlan = files.masterPlan?.[0] ? await uploadToSupabaseStorage(files.masterPlan[0], 'projects/masterplans') : existingProject.masterPlan;
    const brochure = files.brochure?.[0] ? await uploadToSupabaseStorage(files.brochure[0], 'projects/brochures') : existingProject.brochure;

    const projectUpdateData: any = { ...data };

    const jsonFields = ['location', 'priceRange', 'amenities', 'unitTypes', 'configurations', 'approvals', 'bankApprovals', 'highlights', 'pricing', 'landmarks'];
    for (const field of jsonFields) {
      if (projectUpdateData[field] && typeof projectUpdateData[field] === 'string') {
        try {
          projectUpdateData[field] = JSON.parse(projectUpdateData[field]);
        } catch (e) {
          console.warn(`Could not parse JSON for field ${field}:`, projectUpdateData[field]);
        }
      }
    }

    projectUpdateData.images = finalImages;
    projectUpdateData.floorPlans = finalFloorPlans;
    projectUpdateData.masterPlan = masterPlan;
    projectUpdateData.brochure = brochure;

    // Ensure numeric fields are parsed correctly
    const numericFields = ['totalUnits', 'availableUnits'];
    for (const field of numericFields) {
      if (projectUpdateData[field] && typeof projectUpdateData[field] === 'string') {
        projectUpdateData[field] = Number(projectUpdateData[field]);
      }
    }

    delete projectUpdateData.id;
    delete projectUpdateData.createdAt;
    delete projectUpdateData.updatedAt;
    delete projectUpdateData.existingImages;
    delete projectUpdateData.existingFloorPlans;


    const { data: updatedProjectData, error: updateError } = await supabase
      .from('projects')
      .update(projectUpdateData)
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw new Error(updateError.message);
    }

    if (!updatedProjectData || updatedProjectData.length === 0) {
      console.warn(`Update for project ${id} succeeded but returned no data. Refetching.`);
      const { data: refetchedProject, error: refetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (refetchError) {
        throw new Error('Project not found after update and refetch failed.');
      }

      res.json(refetchedProject);
      return;
    }

    res.json(updatedProjectData[0]);
  } catch (err: any) {
    console.error(`Failed to update project ${id}:`, err);
    res.status(400).json({ error: 'Invalid project data', details: err.message });
  }
});

// Delete project by ID
app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(204).send();
});


// --- ROLES API (for Admin-defined roles and permissions) ---
// Table expected: roles(id uuid pk default gen_random_uuid(), name text, key text unique, permissions jsonb, created_at timestamptz)

// Get roles
app.get('/api/roles', requirePermission('roles', 'view'), async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('roles').select('*').order('name');
  if (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data || []);
});

// Create role
app.post('/api/roles', requirePermission('roles', 'create'), async (req: Request, res: Response): Promise<void> => {
  const { name, key, permissions } = req.body || {};
  if (!name || !key) { res.status(400).json({ error: 'name and key are required' }); return; }
  const { data, error } = await supabase
    .from('roles')
    .insert({ name, key, permissions: permissions || {} })
    .select('*')
    .single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// Update role
app.put('/api/roles/:id', requirePermission('roles', 'edit'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, key, permissions } = req.body || {};
  const { data, error } = await supabase
    .from('roles')
    .update({ name, key, permissions })
    .eq('id', id)
    .select('*')
    .single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// Delete role
app.delete('/api/roles/:id', requirePermission('roles', 'delete'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(204).send();
});

// --- USERS (Admin) API using Supabase Admin ---
// List users (admin only)
app.get('/api/users', requirePermission('roles', 'view'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) { res.status(500).json({ error: error.message }); return; }
    const users = (data.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || '',
      role_key: u.user_metadata?.role_key || '',
      created_at: u.created_at,
    }));
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to list users' });
  }
});

// Create user (admin only)
app.post('/api/users', requirePermission('roles', 'create'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role_key } = req.body || {};
    if (!email || !password) { res.status(400).json({ error: 'email and password required' }); return; }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, role_key },
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(201).json({ id: data.user?.id, email: data.user?.email });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create user' });
  }
});

// (cleaned) removed one-time admin promotion endpoint

// Lead interface (match frontend type)
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
  updatedAt: string;
  notes: string;
  communicationLog: {
    type: string;
    content: string;
    by: string;
    timestamp: string;
  }[];
  reminders: {
    message: string;
    dueDate: string;
    completed: boolean;
  }[];
  propertyId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let leads: Lead[] = [];
const leadsFilePath = path.join(__dirname, '../leads.json');
if (fs.existsSync(leadsFilePath)) {
  try {
    const fileData = fs.readFileSync(leadsFilePath, 'utf-8');
    leads = JSON.parse(fileData);

  } catch (err) {
    console.error('Failed to load leads from disk:', err);
  }
}
function saveLeadsToDisk() {
  fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf-8');
}

// Lead API endpoints
// @ts-ignore
app.get('/api/leads', requirePermission('leads', 'view'), async (_req, res) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ error: error.message });
  }
  return res.json((data || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source,
    type: l.type,
    priority: l.priority,
    status: l.status,
    assignedTo: l.assigned_to,
    createdAt: l.created_at,
    notes: l.notes,
    communicationLog: l.communication_log || [],
    reminders: l.reminders || [],
    propertyId: l.property_id,
  })));
});

// @ts-ignore
app.post('/api/leads', requirePermission('leads', 'create'), async (req, res) => {
  const d = req.body;
  const payload = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    source: d.source,
    type: d.type,
    priority: d.priority,
    status: d.status || 'New',
    assigned_to: d.assignedTo || null,
    notes: d.notes || '',
    communication_log: [],
    reminders: [],
    property_id: d.propertyId || null,
  };
  const { data, error } = await supabase.from('leads').insert(payload).select('*').single();
  if (error) {
    console.error('Error adding lead:', error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json({
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
    notes: data.notes,
    communicationLog: data.communication_log || [],
    reminders: data.reminders || [],
    propertyId: data.property_id,
  });
});

// @ts-ignore
app.get('/api/leads/:id', requirePermission('leads', 'view'), async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Lead not found' });
  return res.json({
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
    notes: data.notes,
    communicationLog: data.communication_log || [],
    reminders: data.reminders || [],
    propertyId: data.property_id,
  });
});

// @ts-ignore
app.put('/api/leads/:id', requirePermission('leads', 'edit'), async (req, res) => {
  const { id } = req.params;
  const d = req.body;
  const update: any = {};
  const map: Record<string, string> = {
    assignedTo: 'assigned_to',
    propertyId: 'property_id',
    communicationLog: 'communication_log',
  };
  Object.keys(d).forEach((k) => {
    const column = (map as any)[k] || k;
    update[column] = d[k];
  });
  const { data, error } = await supabase.from('leads').update(update).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
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
    notes: data.notes,
    communicationLog: data.communication_log || [],
    reminders: data.reminders || [],
    propertyId: data.property_id,
  });
});

// @ts-ignore
app.delete('/api/leads/:id', requirePermission('leads', 'delete'), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

// @ts-ignore
app.post('/api/leads/:id/communication', requirePermission('leads', 'edit'), async (req, res) => {
  const { id } = req.params;
  const { type, content, by } = req.body;
  const { data: lead, error: fetchErr } = await supabase.from('leads').select('*').eq('id', id).single();
  if (fetchErr || !lead) return res.status(404).json({ error: 'Lead not found' });
  const log = lead.communication_log || [];
  log.push({ type, content, by, timestamp: new Date().toISOString() });
  const { data, error } = await supabase.from('leads').update({ communication_log: log }).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
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
    notes: data.notes,
    communicationLog: data.communication_log || [],
    reminders: data.reminders || [],
    propertyId: data.property_id,
  });
});

// @ts-ignore
app.post('/api/leads/:id/reminder', requirePermission('leads', 'edit'), async (req, res) => {
  const { id } = req.params;
  const { message, dueDate } = req.body;
  const { data: lead, error: fetchErr } = await supabase.from('leads').select('*').eq('id', id).single();
  if (fetchErr || !lead) return res.status(404).json({ error: 'Lead not found' });
  const reminders = lead.reminders || [];
  reminders.push({ message, dueDate, completed: false });
  const { data, error } = await supabase.from('leads').update({ reminders }).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({
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
    notes: data.notes,
    communicationLog: data.communication_log || [],
    reminders: data.reminders || [],
    propertyId: data.property_id,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 