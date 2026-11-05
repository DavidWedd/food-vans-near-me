import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * If the admin added a van and named this person's email as the owner,
 * link it to their login. Returns true if a listing was claimed.
 */
export async function claimListingFor(userId: string, email: string | undefined | null): Promise<boolean> {
  if (!email) return false;
  const db = createAdminClient();
  if (!db) return false;
  const { data } = await db
    .from('vendor_private')
    .select('vendor_id, vendors!inner(owner_id)')
    .eq('owner_email', email.trim().toLowerCase())
    .is('vendors.owner_id', null)
    .limit(1);
  const row = data?.[0];
  if (!row) return false;
  const { error } = await db.from('vendors').update({ owner_id: userId }).eq('id', row.vendor_id).is('owner_id', null);
  return !error;
}
