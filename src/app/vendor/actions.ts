'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { notifyFavourites } from '@/lib/alerts';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isInLiveArea } from '@/lib/regions';
import { hasFeature } from '@/lib/plans';
import { syncVendorByEmail } from '@/lib/stripe-sync';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const CUISINES = ['coffee', 'tacos', 'bbq', 'asian', 'dessert', 'burgers', 'vegan', 'pizza', 'thai', 'japanese', 'fish-chips', 'bubble-tea', 'indian', 'mexican', 'other'];
const DIETARY = ['vegan', 'vegetarian', 'halal', 'gluten-free', 'nut-free', 'dairy-free'];
const PAYMENTS = ['eftpos', 'cash', 'apple-pay', 'google-pay'];

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/vendor/login');
  return { supabase, user: data.user };
}

async function myVendor() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from('vendors')
    .select('id, slug, subscription_tier')
    .eq('owner_id', user.id)
    .maybeSingle();
  return { supabase, user, vendor: data as { id: string; slug: string; subscription_tier: string } | null };
}

function refreshPublic(slug?: string) {
  revalidatePath('/');
  revalidatePath('/markets');
  if (slug) revalidatePath(`/van/${slug}`);
  revalidatePath('/vendor');
}

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? '').trim().slice(0, max);
const onlyAllowed = (values: FormDataEntryValue[], allowed: string[]) =>
  values.map(String).filter((v) => allowed.includes(v));

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'food-van'
  );
}

function normaliseInstagram(v: string) {
  return v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
}

function normaliseUrl(v: string) {
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Creates or updates the logged-in vendor's listing. */
export async function saveListing(formData: FormData): Promise<ActionResult> {
  const { supabase, user, vendor } = await myVendor();

  const business_name = clean(formData.get('business_name'), 80);
  if (business_name.length < 2) return { ok: false, error: 'Please enter your business name.' };

  const fields = {
    business_name,
    description: clean(formData.get('description'), 1500) || null,
    suburb: clean(formData.get('suburb'), 60),
    cuisine_type: onlyAllowed(formData.getAll('cuisine_type'), CUISINES),
    dietary_tags: onlyAllowed(formData.getAll('dietary_tags'), DIETARY),
    payment_methods: onlyAllowed(formData.getAll('payment_methods'), PAYMENTS),
    price_range: Math.min(4, Math.max(1, Number(formData.get('price_range')) || 2)),
    phone: clean(formData.get('phone'), 30) || null,
    email: clean(formData.get('email'), 120) || null,
    website_url: normaliseUrl(clean(formData.get('website_url'), 200)) || null,
    instagram_handle: normaliseInstagram(clean(formData.get('instagram_handle'), 100)) || null,
    facebook_url: normaliseUrl(clean(formData.get('facebook_url'), 200)) || null,
  };

  if (vendor) {
    const { error } = await supabase.from('vendors').update(fields).eq('id', vendor.id);
    if (error) return { ok: false, error: 'Sorry, that didn\'t save. Please try again.' };
    refreshPublic(vendor.slug);
    return { ok: true, message: 'Saved.' };
  }

  // New listing: find a free web address (slug) for it
  const base = slugify(business_name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from('vendors').insert({ ...fields, slug });
    if (!error) {
      // If they've already signed up through Stripe, pick up their plan straight away
      await syncVendorByEmail(user.email);
      refreshPublic();
      return { ok: true, message: 'Thanks! Your listing is in. We\'ll check it and put you on the map, usually within a day.' };
    }
    if (error.code !== '23505') {
      return { ok: false, error: 'Sorry, that didn\'t save. Please try again.' };
    }
  }
  return { ok: false, error: 'Sorry, that didn\'t save. Please try again.' };
}

/** Saves a photo URL after the browser has uploaded the file to storage. */
export async function setPhoto(kind: 'logo' | 'cover', url: string): Promise<ActionResult> {
  const { supabase, user, vendor } = await myVendor();
  if (!vendor) return { ok: false, error: 'Save your listing details first.' };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Only accept photos from this user's own folder in our storage bucket
  if (!base || !url.startsWith(`${base}/storage/v1/object/public/vendor-photos/${user.id}/`)) {
    return { ok: false, error: 'That photo couldn\'t be used.' };
  }
  const column = kind === 'logo' ? 'logo_url' : 'cover_photo_url';
  const { error } = await supabase.from('vendors').update({ [column]: url }).eq('id', vendor.id);
  if (error) return { ok: false, error: 'Sorry, the photo didn\'t save.' };
  refreshPublic(vendor.slug);
  return { ok: true, message: 'Photo updated.' };
}

/** "I'm here": puts the van on the map at the vendor's current spot for a set number of hours. */
export async function goLive(input: {
  lat: number;
  lng: number;
  hours: number;
  suburb: string;
  note: string;
  eventName?: string;
}): Promise<ActionResult> {
  const { supabase, vendor } = await myVendor();
  if (!vendor) return { ok: false, error: 'Save your listing details first.' };
  const { lat, lng } = input;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInLiveArea(lat, lng)) {
    return { ok: false, error: 'Your location looks like it\'s outside Tasmania. Check location is turned on and try again.' };
  }
  const hours = Math.min(12, Math.max(1, Math.round(input.hours) || 4));
  const now = new Date();
  const { error } = await supabase.from('vendor_live_locations').upsert({
    vendor_id: vendor.id,
    lat,
    lng,
    suburb: input.suburb.slice(0, 60),
    event_name: (input.eventName ?? '').trim().slice(0, 80) || null,
    notes: input.note.trim().slice(0, 200) || null,
    started_at: now.toISOString(),
    expires_at: new Date(now.getTime() + hours * 3600_000).toISOString(),
  });
  if (error) return { ok: false, error: 'Sorry, that didn\'t work. Please try again.' };
  // Keep a history for the vendor's own stats
  await supabase.from('live_sessions').insert({ vendor_id: vendor.id, hours, suburb: input.suburb.slice(0, 60) || null });
  // Let people who saved this van know (once a day). Runs after the response so the vendor isn't kept waiting.
  after(() => notifyFavourites(vendor.id, input.suburb, input.note.trim() || null));
  refreshPublic(vendor.slug);
  return { ok: true, message: `You're on the map for the next ${hours} hours.` };
}

export async function stopLive(): Promise<ActionResult> {
  const { supabase, vendor } = await myVendor();
  if (!vendor) return { ok: false, error: 'No listing found.' };
  const { error } = await supabase.from('vendor_live_locations').delete().eq('vendor_id', vendor.id);
  if (error) return { ok: false, error: 'Sorry, that didn\'t work. Please try again.' };
  refreshPublic(vendor.slug);
  return { ok: true, message: 'You\'re off the map. See you next time!' };
}

export interface MenuInput {
  name: string;
  description: string;
  price: string;
  dietary_tags: string[];
  is_available: boolean;
}

export async function saveMenu(items: MenuInput[]): Promise<ActionResult> {
  const { supabase, vendor } = await myVendor();
  if (!vendor) return { ok: false, error: 'Save your listing details first.' };
  const rows = items
    .filter((i) => i.name.trim())
    .slice(0, 60)
    .map((i, idx) => {
      const price = Number(String(i.price).replace(/[^0-9.]/g, ''));
      return {
        vendor_id: vendor.id,
        name: i.name.trim().slice(0, 80),
        description: i.description.trim().slice(0, 300) || null,
        price: Number.isFinite(price) && price > 0 ? price : null,
        dietary_tags: i.dietary_tags.filter((t) => DIETARY.includes(t)),
        is_available: i.is_available,
        sort_order: idx,
      };
    });
  const del = await supabase.from('menu_items').delete().eq('vendor_id', vendor.id);
  if (del.error) return { ok: false, error: 'Sorry, the menu didn\'t save.' };
  if (rows.length) {
    const ins = await supabase.from('menu_items').insert(rows);
    if (ins.error) return { ok: false, error: 'Sorry, the menu didn\'t save.' };
  }
  refreshPublic(vendor.slug);
  return { ok: true, message: 'Menu saved.' };
}

export interface ScheduleInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_name: string;
  suburb: string;
  lat: number | null;
  lng: number | null;
}

export async function saveSchedule(entries: ScheduleInput[]): Promise<ActionResult> {
  const { supabase, vendor } = await myVendor();
  if (!vendor) return { ok: false, error: 'Save your listing details first.' };
  if (!hasFeature(vendor.subscription_tier, 'schedule')) {
    return { ok: false, error: 'Regular trading times are part of the Pro plan.' };
  }
  const time = /^\d{2}:\d{2}$/;
  const rows = entries
    .filter((e) => e.location_name.trim() && time.test(e.start_time) && time.test(e.end_time))
    .slice(0, 30)
    .map((e) => ({
      vendor_id: vendor.id,
      day_of_week: Math.min(6, Math.max(0, Math.round(e.day_of_week))),
      start_time: e.start_time,
      end_time: e.end_time,
      location_name: e.location_name.trim().slice(0, 80),
      suburb: e.suburb.trim().slice(0, 60),
      lat: e.lat != null && e.lng != null && isInLiveArea(e.lat, e.lng) ? e.lat : null,
      lng: e.lat != null && e.lng != null && isInLiveArea(e.lat, e.lng) ? e.lng : null,
    }));
  const del = await supabase.from('vendor_schedule').delete().eq('vendor_id', vendor.id);
  if (del.error) return { ok: false, error: 'Sorry, your times didn\'t save.' };
  if (rows.length) {
    const ins = await supabase.from('vendor_schedule').insert(rows);
    if (ins.error) return { ok: false, error: 'Sorry, your times didn\'t save.' };
  }
  refreshPublic(vendor.slug);
  return { ok: true, message: 'Trading times saved.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/vendor/login');
}
