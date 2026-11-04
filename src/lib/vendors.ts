import 'server-only';
import { createPublicClient } from '@/lib/supabase/public';
import { hasFeature } from '@/lib/plans';
import type { AustralianState, CuisineType, DietaryTag, PaymentMethod, Vendor } from '@/types';

/** Columns and related rows we read for a vendor. */
export const VENDOR_SELECT =
  '*, vendor_live_locations(*), vendor_schedule(*), menu_items(*)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toVendor(row: any): Vendor {
  const live = Array.isArray(row.vendor_live_locations)
    ? row.vendor_live_locations[0]
    : row.vendor_live_locations;
  return {
    id: row.id,
    business_name: row.business_name,
    slug: row.slug,
    cuisine_type: (row.cuisine_type ?? []) as CuisineType[],
    description: row.description ?? undefined,
    cover_photo_url: row.cover_photo_url ?? undefined,
    logo_url: row.logo_url ?? undefined,
    dietary_tags: (row.dietary_tags ?? []) as DietaryTag[],
    payment_methods: (row.payment_methods ?? []) as PaymentMethod[],
    price_range: (row.price_range ?? 2) as 1 | 2 | 3 | 4,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website_url: row.website_url ?? undefined,
    instagram_handle: row.instagram_handle ?? undefined,
    facebook_url: row.facebook_url ?? undefined,
    state: (row.state ?? 'TAS') as AustralianState,
    suburb: row.suburb ?? '',
    is_active: row.status === 'approved',
    subscription_tier: row.subscription_tier ?? 'basic',
    location: live && new Date(live.expires_at) > new Date()
      ? {
          lat: live.lat,
          lng: live.lng,
          suburb: live.suburb ?? '',
          state: 'TAS',
          is_live: new Date(live.expires_at) > new Date(),
          expires_at: live.expires_at,
          event_name: live.event_name ?? undefined,
          notes: live.notes ?? undefined,
          updated_at: live.started_at,
          source: 'live' as const,
        }
      : hasFeature(row.subscription_tier, 'schedule')
        ? scheduledNow(row.vendor_schedule ?? [])
        : undefined,
    // Weekly schedule is a Pro and Premium feature
    schedule: (hasFeature(row.subscription_tier, 'schedule') ? row.vendor_schedule ?? [] : [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => ({
        day_of_week: s.day_of_week,
        start_time: String(s.start_time).slice(0, 5),
        end_time: String(s.end_time).slice(0, 5),
        location_name: s.location_name,
        suburb: s.suburb ?? '',
        state: 'TAS' as AustralianState,
        lat: s.lat ?? undefined,
        lng: s.lng ?? undefined,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)),
    menu_items: (row.menu_items ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description ?? undefined,
        price: m.price != null ? Number(m.price) : undefined,
        dietary_tags: (m.dietary_tags ?? []) as DietaryTag[],
        is_available: m.is_available,
      })),
  };
}

/** All approved vendors, for the public map and lists. Returns [] if the database isn't set up. */
export async function getPublicVendors(): Promise<Vendor[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('vendors')
    .select(VENDOR_SELECT)
    .eq('status', 'approved')
    .order('business_name');
  if (error) {
    console.error('Could not load vendors', error);
    return [];
  }
  return (data ?? []).map(toVendor);
}

export async function getPublicVendorBySlug(slug: string): Promise<Vendor | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('vendors')
    .select(VENDOR_SELECT)
    .eq('status', 'approved')
    .eq('slug', slug)
    .maybeSingle();
  return data ? toVendor(data) : null;
}

/** The vendor the admin picked as Vendor of the Week, if any. */
export async function getVendorOfWeekId(): Promise<string | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'vendor_of_week').maybeSingle();
  const id = (data?.value as { vendor_id?: string } | null)?.vendor_id;
  return typeof id === 'string' ? id : null;
}

/** Current day of week (0 = Sunday) and minutes past midnight in Hobart. */
function hobartNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Hobart',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

const toMinutes = (t: string) => {
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + (m || 0);
};

/**
 * If the van is inside one of its regular trading times right now, treat it as "usually here"
 * at that spot until the slot ends. Used when the vendor hasn't tapped "I'm here".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scheduledNow(schedule: any[], now = new Date()): Vendor['location'] {
  const { day, minutes } = hobartNow(now);
  for (const s of schedule) {
    if (s.lat == null || s.lng == null) continue;
    const start = toMinutes(s.start_time);
    const end = toMinutes(s.end_time);
    let left: number | null = null;
    if (end > start) {
      if (s.day_of_week === day && minutes >= start && minutes < end) left = end - minutes;
    } else {
      // Runs past midnight, e.g. 6pm to 2am
      if (s.day_of_week === day && minutes >= start) left = 24 * 60 - minutes + end;
      if (s.day_of_week === (day + 6) % 7 && minutes < end) left = end - minutes;
    }
    if (left !== null && left > 0) {
      return {
        lat: s.lat,
        lng: s.lng,
        suburb: s.suburb ?? '',
        state: 'TAS',
        is_live: true,
        expires_at: new Date(now.getTime() + left * 60_000).toISOString(),
        event_name: s.location_name,
        notes: `Regular trading time at ${s.location_name}. Times can change, so check their socials if you're making a special trip.`,
        updated_at: now.toISOString(),
        source: 'schedule',
      };
    }
  }
  return undefined;
}
