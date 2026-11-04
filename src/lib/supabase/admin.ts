import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Full-access database client for trusted server code only (e.g. emailing a vendor their enquiry).
 * Never import this into anything that runs in the browser. Returns null if the key isn't set.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const enquiriesConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.RESEND_API_KEY);
