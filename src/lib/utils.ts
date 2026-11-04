import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CuisineType, DietaryTag, FilterState, ScheduleEntry, Vendor, VendorLocation } from '@/types';
import { distanceKm } from '@/lib/geo';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 0.1) return 'Under 100m away';
  if (km < 1) return `${Math.round(km * 10) * 100}m away`;
  return `${km.toFixed(1)}km away`;
}

export const cuisineEmoji: Record<CuisineType, string> = {
  coffee: '☕',
  tacos: '🌮',
  bbq: '🔥',
  asian: '🍜',
  dessert: '🍦',
  burgers: '🍔',
  vegan: '🌿',
  pizza: '🍕',
  thai: '🇹🇭',
  japanese: '🍣',
  'fish-chips': '🐟',
  'bubble-tea': '🧋',
  indian: '🍛',
  mexican: '🌯',
  other: '🍽️',
};

export function cuisineLabel(type: CuisineType): string {
  const labels: Record<CuisineType, string> = {
    coffee: '☕ Coffee',
    tacos: '🌮 Tacos',
    bbq: '🔥 BBQ',
    asian: '🍜 Asian',
    dessert: '🍦 Dessert',
    burgers: '🍔 Burgers',
    vegan: '🌿 Vegan',
    pizza: '🍕 Pizza',
    thai: '🇹🇭 Thai',
    japanese: '🍣 Japanese',
    'fish-chips': '🐟 Fish & Chips',
    'bubble-tea': '🧋 Bubble Tea',
    indian: '🍛 Indian',
    mexican: '🌯 Mexican',
    other: '🍽️ Other',
  };
  return labels[type] || type;
}

export function formatPrice(range: 1 | 2 | 3 | 4): string {
  return '$'.repeat(range);
}

export function isVendorLive(location?: VendorLocation): boolean {
  if (!location) return false;
  return location.is_live === true && new Date(location.expires_at) > new Date();
}

export function getNextSchedule(schedule?: ScheduleEntry[]): string | null {
  if (!schedule || schedule.length === 0) return null;

  const now = new Date();
  const todayDow = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let nearest: { daysAway: number; entry: ScheduleEntry } | null = null;

  for (const entry of schedule) {
    const [h, m] = entry.start_time.split(':').map(Number);
    const entryMinutes = h * 60 + m;

    let daysAway = entry.day_of_week - todayDow;
    if (daysAway < 0) daysAway += 7;
    if (daysAway === 0 && currentMinutes >= entryMinutes) daysAway = 7;

    if (!nearest || daysAway < nearest.daysAway) {
      nearest = { daysAway, entry };
    }
  }

  if (!nearest) return null;

  const { daysAway, entry } = nearest;
  const dayLabel =
    daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : dayNames[entry.day_of_week];
  const [h] = entry.start_time.split(':').map(Number);
  const timeLabel = `${h > 12 ? h - 12 : h === 0 ? 12 : h}${h >= 12 ? 'pm' : 'am'}`;

  return `${dayLabel} ${timeLabel} · ${entry.location_name}`;
}

/** Does the text search match a van's name, suburb, state or cuisine? */
export function matchesText(v: Vendor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    v.business_name.toLowerCase().includes(q) ||
    v.suburb.toLowerCase().includes(q) ||
    v.state.toLowerCase().includes(q) ||
    v.cuisine_type.some((c) => c.toLowerCase().includes(q))
  );
}

function vendorPoint(v: Vendor): { lat: number; lng: number } | null {
  if (v.location?.lat != null && v.location?.lng != null) return v.location;
  const s = v.schedule?.find((e) => e.lat != null && e.lng != null);
  return s ? { lat: s.lat as number, lng: s.lng as number } : null;
}

export function filterVendors(vendors: Vendor[], filters: FilterState): Vendor[] {
  const { centre } = filters;

  // With a centre (near me / suburb / postcode): work out distances,
  // keep vans inside the radius, nearest first. Text search is not applied,
  // because the search box text is the place name.
  if (centre) {
    return vendors
      .map((v) => {
        const p = vendorPoint(v);
        return { ...v, distance_km: p ? distanceKm(centre, p) : undefined };
      })
      .filter((v) => v.distance_km !== undefined && v.distance_km <= filters.radius)
      .filter((v) => passesFilters(v, { ...filters, searchQuery: '' }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }

  // Featured (Premium) vans first, then trading-now vans, then the rest
  const rank = (v: Vendor) => (v.subscription_tier === 'premium' ? 0 : 2) + (isVendorLive(v.location) ? 0 : 1);
  return vendors
    .filter((v) => passesFilters(v, filters))
    .map((v, i) => ({ v, i }))
    .sort((a, b) => rank(a.v) - rank(b.v) || a.i - b.i)
    .map(({ v }) => v);
}

function passesFilters(v: Vendor, filters: FilterState): boolean {
  if (filters.openNow && !isVendorLive(v.location)) return false;

  if (filters.cuisineTypes.length > 0) {
    const hasMatch = filters.cuisineTypes.some((c) => v.cuisine_type.includes(c));
    if (!hasMatch) return false;
  }

  if (filters.dietaryTags.length > 0) {
    const hasAll = filters.dietaryTags.every((d) => v.dietary_tags.includes(d));
    if (!hasAll) return false;
  }

  if (filters.state !== 'ALL' && v.state !== filters.state) return false;

  if (filters.searchQuery && !matchesText(v, filters.searchQuery)) return false;

  return true;
}

export function dietaryShortLabel(tag: DietaryTag): string {
  const map: Record<DietaryTag, string> = {
    vegan: 'VG',
    vegetarian: 'V',
    halal: 'H',
    'gluten-free': 'GF',
    'nut-free': 'NF',
    'dairy-free': 'DF',
  };
  return map[tag] || tag;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
