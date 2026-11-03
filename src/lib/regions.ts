/**
 * Where the site is live.
 *
 * The site is built for all of Australia, but launches one region at a time.
 * To go live somewhere new, add it to LIVE_REGIONS - the map's opening view,
 * suburb search and "outside our area" messages all follow this list.
 */

export interface Region {
  code: string;
  name: string;
  /** [[south, west], [north, east]] */
  bounds: [[number, number], [number, number]];
}

export const REGIONS: Record<string, Region> = {
  TAS: { code: 'TAS', name: 'Tasmania', bounds: [[-43.7, 144.5], [-39.5, 148.5]] },
  VIC: { code: 'VIC', name: 'Victoria', bounds: [[-39.2, 140.9], [-33.9, 150.0]] },
  NSW: { code: 'NSW', name: 'New South Wales', bounds: [[-37.6, 140.9], [-28.1, 153.7]] },
  ACT: { code: 'ACT', name: 'Canberra', bounds: [[-35.95, 148.75], [-35.1, 149.4]] },
  QLD: { code: 'QLD', name: 'Queensland', bounds: [[-29.2, 137.9], [-10.6, 153.6]] },
  SA: { code: 'SA', name: 'South Australia', bounds: [[-38.1, 129.0], [-25.9, 141.0]] },
  WA: { code: 'WA', name: 'Western Australia', bounds: [[-35.2, 112.9], [-13.7, 129.0]] },
  NT: { code: 'NT', name: 'Northern Territory', bounds: [[-26.0, 129.0], [-10.9, 138.0]] },
};

/** Regions currently live. Start: Tasmania only. */
export const LIVE_REGIONS: Region[] = [REGIONS.TAS];

export const LIVE_AREA_NAME = LIVE_REGIONS.map((r) => r.name).join(', ');

/** One box covering every live region - used for the map's opening view and search. */
export function liveBounds(): [[number, number], [number, number]] {
  const s = Math.min(...LIVE_REGIONS.map((r) => r.bounds[0][0]));
  const w = Math.min(...LIVE_REGIONS.map((r) => r.bounds[0][1]));
  const n = Math.max(...LIVE_REGIONS.map((r) => r.bounds[1][0]));
  const e = Math.max(...LIVE_REGIONS.map((r) => r.bounds[1][1]));
  return [[s, w], [n, e]];
}

export function isInLiveArea(lat: number, lng: number): boolean {
  return LIVE_REGIONS.some(
    (r) => lat >= r.bounds[0][0] && lat <= r.bounds[1][0] && lng >= r.bounds[0][1] && lng <= r.bounds[1][1]
  );
}
