import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vlboszmxhmamsviufucv.supabase.co',
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY
);