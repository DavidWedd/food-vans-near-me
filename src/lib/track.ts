'use client';

import { createBrowserSupabase } from '@/lib/supabase/browser';

export type VendorEventKind = 'profile_view' | 'map_click' | 'contact_click' | 'website_click';

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Counts each thing once per browser session, so refreshing a page doesn't inflate a vendor's stats. */
function once(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
  } catch {
    // Private browsing etc. - still count it
  }
  return true;
}

/** Anonymous count for a vendor's stats. Fire and forget - never blocks the page. */
export function trackVendor(vendorId: string, kind: VendorEventKind) {
  if (!configured || !once(`fvnm:${kind}:${vendorId}`)) return;
  void createBrowserSupabase()
    .from('vendor_events')
    .insert({ vendor_id: vendorId, kind })
    .then(() => undefined, () => undefined);
}

/** Records roughly where someone searched (rounded to about 1km), so vendors can see demand near them. */
export function trackSearch(lat: number, lng: number, label: string, source: 'near_me' | 'place') {
  const rlat = Math.round(lat * 100) / 100;
  const rlng = Math.round(lng * 100) / 100;
  if (!configured || !once(`fvnm:search:${rlat},${rlng}`)) return;
  void createBrowserSupabase()
    .from('search_events')
    .insert({ lat: rlat, lng: rlng, label: source === 'near_me' ? null : label.slice(0, 60), source })
    .then(() => undefined, () => undefined);
}
