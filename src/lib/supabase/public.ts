import 'server-only';
import { createClient as createSupabase } from '@supabase/supabase-js';

/** Cookie-free client for reading public data (approved vendors). Safe to use in cached pages. */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
