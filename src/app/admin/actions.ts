'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isPlanId } from '@/lib/plans';
import { stripeInfoFor } from '@/lib/stripe-admin';

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
  const info = await stripeInfoFor(priv?.owner_email ?? null);
  const patch: Record<string, unknown> = { status: 'approved' };
  if (info?.plan) {
    patch.subscription_tier = info.plan;
    patch.founding = info.founding;
  }
  const { error } = await supabase.from('vendors').update(patch).eq('id', id);
  if (error) return { ok: false, error: 'That didn\'t save.' };
  refresh(v?.slug);
  return {
    ok: true,
    message: info?.plan
      ? `Approved on the ${info.plan} plan${info.founding ? ' (founding)' : ''}.`
      : 'Approved. No Stripe sign-up found for their email, so they\'re on Basic - set the plan by hand if needed.',
  };
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
