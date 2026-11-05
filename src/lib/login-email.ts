import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

/**
 * After someone changes their login email, bring everything else into line:
 * their van's owner email, their Stripe customer's email, and their saved-van alerts.
 * Safe to call any time - it does nothing if nothing has changed.
 */
export async function syncLoginEmail(userId: string, email: string | null | undefined) {
  const next = email?.trim().toLowerCase();
  const db = createAdminClient();
  if (!next || !db) return;

  // Saved-van alerts go to this address
  await db.from('favourites').update({ email: next }).eq('user_id', userId).neq('email', next);

  const { data: vendor } = await db.from('vendors').select('id').eq('owner_id', userId).maybeSingle();
  if (!vendor) return;
  const { data: priv } = await db
    .from('vendor_private')
    .select('owner_email, stripe_customer_id')
    .eq('vendor_id', vendor.id)
    .maybeSingle();
  const previous = priv?.owner_email?.toLowerCase() ?? null;
  if (previous === next) return;

  const stripe = getStripe();
  if (stripe) {
    try {
      let customerId = priv?.stripe_customer_id ?? null;
      if (!customerId && previous) {
        customerId = (await stripe.customers.list({ email: previous, limit: 1 })).data[0]?.id ?? null;
      }
      if (customerId) {
        await stripe.customers.update(customerId, { email: next });
        await db.from('vendor_private').update({ stripe_customer_id: customerId }).eq('vendor_id', vendor.id);
      }
    } catch (err) {
      console.error('Could not update Stripe email', err);
    }
  }
  await db
    .from('vendor_private')
    .upsert({ vendor_id: vendor.id, owner_email: next }, { onConflict: 'vendor_id' });
}
