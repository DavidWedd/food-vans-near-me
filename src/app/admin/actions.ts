'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isPlanId } from '@/lib/plans';
import { syncVendorByEmail } from '@/lib/stripe-sync';

export type AdminResult = { ok: true; message?: string } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/vendor/login?next=/admin');
  const { data } = await supabase.from('admin_emails').select('email').limit(1);
  if (!data || data.length === 0) redirect('/vendor');
  return supabase;
}

function refresh(slug?: string) {
  revalidatePath('/');
  revalidatePath('/markets');
  revalidatePath('/admin');
  if (slug) revalidatePath(`/van/${slug}`);
}

export async function setStatus(id: string, status: 'approved' | 'hidden' | 'pending'): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from('vendors').update({ status }).eq('id', id).select('slug').single();
  if (error) return { ok: false, error: 'That didn\'t save.' };
  refresh(data.slug);
  return { ok: true, message: status === 'approved' ? 'Approved - they\'re on the map.' : status === 'hidden' ? 'Hidden from the public.' : 'Moved back to waiting.' };
}

/** Approves a vendor and copies their plan from Stripe in one go. */
export async function approveWithStripe(id: string): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { data: v } = await supabase.from('vendors').select('slug, vendor_private(owner_email)').eq('id', id).single();
  const priv = v ? (Array.isArray(v.vendor_private) ? v.vendor_private[0] : v.vendor_private) : null;
  const { error } = await supabase.from('vendors').update({ status: 'approved' }).eq('id', id);
  if (error) return { ok: false, error: 'That didn\'t save.' };
  await syncVendorByEmail(priv?.owner_email);
  const { data: after } = await supabase.from('vendors').select('subscription_tier, founding, plan_status').eq('id', id).single();
  refresh(v?.slug);
  return {
    ok: true,
    message: after?.plan_status
      ? `Approved on the ${after.subscription_tier} plan${after.founding ? ' (founding)' : ''}.`
      : 'Approved. No Stripe sign-up found for their email, so they\'re on Basic - set the plan by hand if needed.',
  };
}

/** Re-reads the vendor's plan from Stripe. */
export async function syncFromStripe(id: string): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { data: v } = await supabase.from('vendors').select('slug, vendor_private(owner_email)').eq('id', id).single();
  const priv = v ? (Array.isArray(v.vendor_private) ? v.vendor_private[0] : v.vendor_private) : null;
  await syncVendorByEmail(priv?.owner_email);
  refresh(v?.slug);
  return { ok: true, message: 'Plan refreshed from Stripe.' };
}

export async function setPlan(id: string, tier: string, founding: boolean): Promise<AdminResult> {
  if (!isPlanId(tier)) return { ok: false, error: 'Unknown plan.' };
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from('vendors')
    .update({ subscription_tier: tier, founding })
    .eq('id', id)
    .select('slug')
    .single();
  if (error) return { ok: false, error: 'That didn\'t save.' };
  refresh(data.slug);
  return { ok: true, message: 'Plan updated.' };
}

export async function saveNotes(id: string, notes: string): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from('vendor_private')
    .upsert({ vendor_id: id, admin_notes: notes.slice(0, 2000) || null }, { onConflict: 'vendor_id' });
  if (error) return { ok: false, error: 'That didn\'t save.' };
  revalidatePath('/admin');
  return { ok: true, message: 'Notes saved.' };
}

export async function clearLive(id: string): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from('vendor_live_locations').delete().eq('vendor_id', id);
  if (error) return { ok: false, error: 'That didn\'t work.' };
  refresh();
  return { ok: true, message: 'Taken off the live map.' };
}

/** Picks (or clears) the Vendor of the Week shown on the homepage. Premium vendors only. */
export async function setVendorOfWeek(id: string | null): Promise<AdminResult> {
  const supabase = await requireAdmin();
  if (id) {
    const { data: v } = await supabase.from('vendors').select('status, subscription_tier').eq('id', id).single();
    if (!v || v.status !== 'approved' || v.subscription_tier !== 'premium') {
      return { ok: false, error: 'Only approved Premium vendors can be Vendor of the Week.' };
    }
  }
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'vendor_of_week', value: { vendor_id: id }, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: 'That didn\'t save.' };
  refresh();
  return { ok: true, message: id ? 'Now Vendor of the Week on the homepage.' : 'Vendor of the Week cleared.' };
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from('reviews').update({ hidden }).eq('id', id).select('vendors(slug)').single();
  if (error) return { ok: false, error: 'That didn\'t save.' };
  const v = Array.isArray(data?.vendors) ? data.vendors[0] : data?.vendors;
  refresh((v as { slug?: string } | null)?.slug);
  return { ok: true, message: hidden ? 'Review hidden.' : 'Review shown again.' };
}
