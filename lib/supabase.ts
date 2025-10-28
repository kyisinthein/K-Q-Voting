import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase env vars:', { supabaseUrl, hasKey: !!supabaseKey });
  throw new Error('Supabase URL or anon key is not set. Check .env.local and restart Expo.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);