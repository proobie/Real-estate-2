import type { Property, Project } from '../types';

type ListingType = 'sale' | 'rent' | 'buy';

type SearchUrlInput = {
  city?: string;
  location?: string;
  listingType?: ListingType;
  query?: string;
  developer?: string;
};

type LocationRule = {
  key: string;
  aliases: string[];
};

const LOCATION_RULES: LocationRule[] = [
  { key: 'hinjewadi', aliases: ['hinjewadi', 'hinjewadi phase 1', 'hinjewadi phase 2', 'hinjewadi phase 3'] },
  { key: 'mahalunge', aliases: ['mahalunge', 'mhalunge', 'mahalunge maan', 'mahalunge hi-tech city'] },
];

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'item';
};

const normalizeCity = (value?: string): string => {
  const base = (value || 'pune').split(',')[0].trim();
  return slugify(base || 'pune');
};

const pickShortLocation = (address?: string, city?: string): string => {
  const combined = `${address || ''} ${city || ''}`.toLowerCase();
  for (const rule of LOCATION_RULES) {
    if (rule.aliases.some(alias => combined.includes(alias))) {
      return rule.key;
    }
  }

  // If no match, default to hinjewadi (current inventory is only hinjewadi/mahalunge)
  return 'hinjewadi';
};

const normalizeTitle = (value?: string): string => slugify(value || 'property');

const normalizeListingType = (value?: ListingType): 'sale' | 'rent' => {
  if (!value) return 'sale';
  if (value === 'rent') return 'rent';
  return 'sale';
};

export const parseSlugId = (value?: string): string => {
  if (!value) return '';
  const parts = value.split('--');
  return parts.length > 1 ? parts[parts.length - 1] : value;
};

export const buildPropertyUrl = (property: Property): string => {
  const city = normalizeCity(property.location?.city);
  const location = pickShortLocation(property.location?.address, property.location?.city);
  const title = normalizeTitle(property.title);
  return `/property/${city}/${location}/${title}--${property.id}`;
};

export const buildProjectUrl = (project: Project): string => {
  const city = normalizeCity(project.location?.city);
  const location = pickShortLocation(project.location?.address, project.location?.city);
  const title = normalizeTitle(project.name);
  return `/project/${city}/${location}/${title}--${project.id}`;
};

export const buildSearchUrl = (input: SearchUrlInput): string => {
  const city = normalizeCity(input.city);
  const location = input.location ? slugify(input.location) : 'all';
  const listing = normalizeListingType(input.listingType);
  const base = `/${city}/${location}/${listing}`;
  const query = new URLSearchParams();
  if (input.query && input.query.trim()) query.set('q', input.query.trim());
  if (input.developer && input.developer.trim()) query.set('developer', input.developer.trim());
  const suffix = query.toString();
  return suffix ? `${base}?${suffix}` : base;
};

export const buildProjectsListUrl = (input: SearchUrlInput): string => {
  const city = normalizeCity(input.city);
  const location = input.location ? slugify(input.location) : 'all';
  const base = `/${city}/${location}/projects`;
  const query = new URLSearchParams();
  if (input.developer && input.developer.trim()) query.set('developer', input.developer.trim());
  const suffix = query.toString();
  return suffix ? `${base}?${suffix}` : base;
};

export const listingTypeFromPath = (value?: string): 'sale' | 'rent' | '' => {
  if (!value) return '';
  const lower = value.toLowerCase();
  if (lower === 'rent') return 'rent';
  if (lower === 'buy') return 'sale';
  if (lower === 'sale') return 'sale';
  return '';
};

export const cityFromPath = (value?: string): string => {
  if (!value) return '';
  return value.replace(/-/g, ' ');
};

export const locationFromPath = (value?: string): string => {
  if (!value) return '';
  const normalized = value.replace(/-/g, ' ').trim();
  if (normalized === 'all' || normalized === 'any') return '';
  return normalized;
};
