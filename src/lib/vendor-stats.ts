import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { distanceKm } from '@/lib/geo';

export interface VendorStats {
  days: number;
  profileViews: number;
  mapClicks: number;
  contactClicks: number;
  websiteClicks: number;
  enquiries: number;
  tradingDays: number;
  nearbySearches: number;
  /** Busiest times people searched near the vendor's spots, e.g. "Fri 12pm". */
  busiestTimes: { label: string; count: number }[];
  /** Suburbs people searched near the vendor's spots. */
  topPlaces: { label: string; count: number }[];
  hasSpots: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hobartParts(iso: string) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Hobart',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { weekday: get('weekday'), hour: Number(get('hour')) % 24, day: `${get('year')}-${get('month')}-${get('day')}` };
}

function hourLabel(h: number) {
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${suffix}`;
}

/** Last 30 days of stats for one vendor. Uses the logged-in vendor's own database access. */
export async function getVendorStats(
  supabase: SupabaseClient,
  vendorId: string,
  spots: { lat: number; lng: number }[]
): Promise<VendorStats> {
  const days = 30;
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const [events, sessions, searches] = await Promise.all([
    supabase.from('vendor_events').select('kind').eq('vendor_id', vendorId).gte('created_at', since).limit(20000),
    supabase.from('live_sessions').select('started_at').eq('vendor_id', vendorId).gte('started_at', since).limit(1000),
    spots.length
      ? supabase.from('search_events').select('lat, lng, label, created_at').gte('created_at', since).limit(10000)
      : Promise.resolve({ data: [] as { lat: number; lng: number; label: string | null; created_at: string }[] }),
  ]);

  const count = (k: string) => (events.data ?? []).filter((e) => e.kind === k).length;
  const tradingDays = new Set((sessions.data ?? []).map((s) => hobartParts(s.started_at).day)).size;

  // Searches within 10km of any of the vendor's usual spots
  const near = (searches.data ?? []).filter((s) =>
    spots.some((p) => distanceKm(p, { lat: Number(s.lat), lng: Number(s.lng) }) <= 10)
  );
  const slots = new Map<string, number>();
  const places = new Map<string, number>();
  for (const s of near) {
    const { weekday, hour } = hobartParts(s.created_at);
    const key = `${weekday} ${hourLabel(hour)}`;
    slots.set(key, (slots.get(key) ?? 0) + 1);
    if (s.label) places.set(s.label, (places.get(s.label) ?? 0) + 1);
  }
  const top = (m: Map<string, number>, n: number) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));

  return {
    days,
    profileViews: count('profile_view'),
    mapClicks: count('map_click'),
    contactClicks: count('contact_click'),
    websiteClicks: count('website_click'),
    enquiries: count('enquiry'),
    tradingDays,
    nearbySearches: near.length,
    busiestTimes: top(slots, 3),
    topPlaces: top(places, 5),
    hasSpots: spots.length > 0,
  };
}

export { DAYS };
