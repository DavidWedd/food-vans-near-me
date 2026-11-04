/**
 * Map tiles, distance maths and place search.
 *
 * Map tiles: uses Mapbox when NEXT_PUBLIC_MAPBOX_TOKEN is set (Vercel env var),
 * otherwise falls back to the free OpenStreetMap tiles so the map never goes blank.
 */

import { liveBounds } from '@/lib/regions';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const HOBART_CENTRE = { lat: -42.8821, lng: 147.3272 };

export interface TileConfig {
  url: string;
  attribution: string;
  tileSize: number;
  zoomOffset: number;
  maxZoom: number;
}

export function getTileConfig(): TileConfig {
  if (MAPBOX_TOKEN) {
    return {
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}{r}?access_token=${MAPBOX_TOKEN}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
    };
  }
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 256,
    zoomOffset: 0,
    maxZoom: 19,
  };
}

/** Straight-line distance between two points, in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface SearchCentre {
  lat: number;
  lng: number;
  label: string;
}

/**
 * Looks up an Australian suburb, town or postcode with Mapbox geocoding.
 * Returns null if there's no token, no match, or the request fails.
 */
export async function geocodePlace(query: string, signal?: AbortSignal): Promise<SearchCentre | null> {
  if (!MAPBOX_TOKEN) return null;
  const q = query.trim();
  if (q.length < 3) return null;

  // Only search inside the live area (Tasmania for now), so "Kingston"
  // finds Kingston TAS rather than Kingston ACT.
  const [[south, west], [north, east]] = liveBounds();
  const params = new URLSearchParams({
    q,
    country: 'au',
    bbox: `${west},${south},${east},${north}`,
    types: 'postcode,place,locality,neighborhood',
    limit: '1',
    proximity: `${HOBART_CENTRE.lng},${HOBART_CENTRE.lat}`,
    access_token: MAPBOX_TOKEN,
  });

  try {
    const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f?.geometry?.coordinates) return null;
    const [lng, lat] = f.geometry.coordinates as [number, number];
    const label: string = f.properties?.name_preferred || f.properties?.name || q;
    return { lat, lng, label };
  } catch {
    return null;
  }
}

/**
 * Finds a trading spot from an address or place plus suburb (e.g. "Salamanca Place, Hobart").
 * Falls back to the suburb alone. Returns null if nothing in the live area matches.
 */
export async function geocodeSpot(spot: string, suburb: string): Promise<SearchCentre | null> {
  if (!MAPBOX_TOKEN) return null;
  const [[south, west], [north, east]] = liveBounds();
  const tryQuery = async (q: string, types: string) => {
    const params = new URLSearchParams({
      q,
      country: 'au',
      bbox: `${west},${south},${east},${north}`,
      types,
      limit: '1',
      proximity: `${HOBART_CENTRE.lng},${HOBART_CENTRE.lat}`,
      access_token: MAPBOX_TOKEN,
    });
    try {
      const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`);
      if (!res.ok) return null;
      const f = (await res.json())?.features?.[0];
      if (!f?.geometry?.coordinates) return null;
      const [lng, lat] = f.geometry.coordinates as [number, number];
      return { lat, lng, label: f.properties?.name_preferred || f.properties?.name || q };
    } catch {
      return null;
    }
  };
  const full = [spot, suburb].filter(Boolean).join(', ');
  return (
    (full && (await tryQuery(full, 'address,street,neighborhood,locality,place,postcode'))) ||
    (suburb && (await tryQuery(suburb, 'neighborhood,locality,place,postcode'))) ||
    null
  );
}

/** Suburb or town name for a point, for the "I'm here" pin. Empty string if unknown. */
export async function reverseSuburb(lat: number, lng: number): Promise<string> {
  if (!MAPBOX_TOKEN) return '';
  const params = new URLSearchParams({
    longitude: String(lng),
    latitude: String(lat),
    types: 'neighborhood,locality,place',
    limit: '1',
    access_token: MAPBOX_TOKEN,
  });
  try {
    const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?${params}`);
    if (!res.ok) return '';
    const f = (await res.json())?.features?.[0];
    return f?.properties?.name_preferred || f?.properties?.name || '';
  } catch {
    return '';
  }
}
