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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ADD_CUISINES = ['coffee', 'tacos', 'bbq', 'asian', 'dessert', 'burgers', 'vegan', 'pizza', 'thai', 'japanese', 'fish-chips', 'bubble-tea', 'indian', 'mexican', 'other'];

function slugify(name: string) {
  return (
    name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'food-van'
  );
}

/** Admin adds a van themselves. If an owner email is given, that person takes it over when they log in. */
export async function addVendor(formData: FormData): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const get = (k: string, max: number) => String(formData.get(k) ?? '').trim().slice(0, max);
  const business_name = get('business_name', 80);
  if (business_name.length < 2) return { ok: false, error: 'Please enter the van\'s name.' };
  const ownerEmail = get('owner_email', 120).toLowerCase();
  if (ownerEmail && !EMAIL_RE.test(ownerEmail)) return { ok: false, error: 'Please check the owner\'s email.' };
  const instagram = get('instagram_handle', 100).replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  const website = get('website_url', 200);
  const fields = {
    business_name,
    suburb: get('suburb', 60),
    description: get('description', 1500) || null,
    cuisine_type: formData.getAll('cuisine_type').map(String).filter((c) => ADD_CUISINES.includes(c)),
    instagram_handle: instagram || null,
    website_url: website ? (/^https?:\/\//i.test(website) ? website : `https://${website}`) : null,
    phone: get('phone', 30) || null,
    status: formData.get('publish') === 'on' ? 'approved' : 'pending',
  };

  const base = slugify(business_name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase.from('vendors').insert({ ...fields, slug }).select('id, slug').single();
    if (error?.code === '23505') continue;
    if (error || !data) return { ok: false, error: 'That didn\'t save.' };
    if (ownerEmail) {
      await supabase.from('vendor_private').upsert({ vendor_id: data.id, owner_email: ownerEmail }, { onConflict: 'vendor_id' });
    }
    refresh(data.slug);
    return {
      ok: true,
      message: ownerEmail
        ? `Added. When ${ownerEmail} logs in at foodvansnear.me/vendor/login, the listing becomes theirs.`
        : 'Added. You can hand it over later by adding the owner\'s email on its card below.',
    };
  }
  return { ok: false, error: 'That didn\'t save.' };
}

/** Sets who takes over a van the admin added. Only for vans nobody has logged in to yet. */
export async function setOwnerEmail(id: string, email: string): Promise<AdminResult> {
  const supabase = await requireAdmin();
  const clean = email.trim().toLowerCase().slice(0, 120);
  if (clean && !EMAIL_RE.test(clean)) return { ok: false, error: 'Please check the email.' };
  const { data: v } = await supabase.from('vendors').select('owner_id').eq('id', id).single();
  if (v?.owner_id) return { ok: false, error: 'This van is already linked to a login, so it can\'t be handed over.' };
  const { error } = await supabase.from('vendor_private').upsert({ vendor_id: id, owner_email: clean || null }, { onConflict: 'vendor_id' });
  if (error) return { ok: false, error: 'That didn\'t save.' };
  revalidatePath('/admin');
  return {
    ok: true,
    message: clean ? `Done. When ${clean} logs in at foodvansnear.me/vendor/login, the listing becomes theirs.` : 'Hand-over email removed.',
  };
}
