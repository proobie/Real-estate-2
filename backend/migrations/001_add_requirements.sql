-- Migration: add requirements jsonb column to leads
-- Run in Supabase SQL editor or via psql
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS requirements jsonb;

-- Optional: set default empty object
-- ALTER TABLE public.leads
--   ALTER COLUMN requirements SET DEFAULT '{}'::jsonb;
