'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Market, Vendor } from '@/types';
import { cuisineEmoji, isVendorLive } from '@/lib/utils';
import { getTileConfig, HOBART_CENTRE, type SearchCentre } from '@/lib/geo';
import { liveBounds } from '@/lib/regions';
import { overlapTile, MARKET_PIN_SVG } from '@/lib/map-helpers';

interface VendorMapProps {
  vendors: Vendor[];
  /** Markets shown as their own pins (not clustered with vans). */
  markets?: Market[];
  onVendorSelect?: (vendor: Vendor) => void;
  /** Search centre (user's location or a searched suburb). Draws the radius circle. */
  centre?: SearchCentre | null;
  radiusKm?: number;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [HOBART_CENTRE.lat, HOBART_CENTRE.lng];
const DEFAULT_ZOOM = 12;

function createPinHtml(vendor: Vendor, live: boolean): string {
  const emoji = cuisineEmoji[vendor.cuisine_type[0]] || '🍽️';
  const bg = live ? 'var(--primary, #E07B00)' : '#9CA3AF';
  return `<div style="
    width:40px;height:40px;border-radius:50%;
    background:${bg};
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 2px 10px rgba(0,0,0,0.3);
    border:2px solid white;cursor:pointer;
    transition:transform 0.15s ease;
  " aria-label="${vendor.business_name}">${emoji}</div>`;
}

function createPopupHtml(vendor: Vendor, live: boolean): string {
  const statusBg = live ? '#437A22' : '#9CA3AF';
  const statusLabel = live ? 'Open Now' : 'Closed';
  const distance = vendor.distance_km != null
    ? `<span style="color:var(--muted,#7A776F);font-size:12px;">${vendor.distance_km.toFixed(1)}km away</span>`
    : '';

  return `<div style="font-family:Satoshi,ui-sans-serif,sans-serif;padding:14px;min-width:190px;max-width:240px;">
  <p style="font-weight:700;font-size:15px;color:var(--text,#2A2520);margin:0 0 4px;">
    ${vendor.business_name}
  </p>
  <p style="font-size:12px;color:var(--muted,#7A776F);margin:0 0 8px;">
    ${vendor.suburb}, ${vendor.state}
  </p>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <span style="background:${statusBg};color:white;font-size:11px;padding:2px 8px;border-radius:999px;font-weight:700;">
      ${statusLabel}
    </span>
    ${distance}
  </div>
  <a href="/van/${vendor.slug}"
     style="display:inline-block;color:var(--primary,#E07B00);font-size:13px;font-weight:700;text-decoration:none;">
    View Profile →
  </a>
</div>`;
}

export default function VendorMap({
  vendors,
  markets = [],
  onVendorSelect,
  centre = null,
  radiusKm = 5,
  className = '',
}: VendorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;

    const L = (await import('leaflet')).default;
    await import('leaflet.markercluster');

    // Fix default icon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });
    mapRef.current = map;

    // Map tiles: Mapbox if the key is set, otherwise OpenStreetMap
    const tiles = getTileConfig();
    L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      tileSize: tiles.tileSize,
      zoomOffset: tiles.zoomOffset,
      maxZoom: tiles.maxZoom,
    })
      .on('tileload', overlapTile(tiles.tileSize))
      .addTo(map);

    // Marker cluster group
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      showCoverageOnHover: false,
    });

    vendors.forEach((vendor) => {
      const live = isVendorLive(vendor.location);
      const lat = vendor.location?.lat ?? 0;
      const lng = vendor.location?.lng ?? 0;
      if (!lat && !lng) return;

      const icon = L.divIcon({
        className: '',
        html: createPinHtml(vendor, live),
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(createPopupHtml(vendor, live), {
        closeButton: true,
        maxWidth: 260,
      });

      marker.on('click', () => {
        onVendorSelect?.(vendor);
        // Scroll to card
        const card = document.getElementById(`vendor-card-${vendor.id}`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      // Pin hover effect
      marker.on('mouseover', () => {
        const el = marker.getElement();
        if (el) (el as HTMLElement).style.transform = 'scale(1.15)';
      });
      marker.on('mouseout', () => {
        const el = marker.getElement();
        if (el) (el as HTMLElement).style.transform = 'scale(1)';
      });

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    // Market pins
    markets.forEach((m) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:34px;height:34px;border-radius:10px;background:#01696F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;" aria-label="${m.name}">${MARKET_PIN_SVG}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });
      L.marker([m.lat, m.lng], { icon })
        .bindPopup(
          `<div style="font-family:Satoshi,ui-sans-serif,sans-serif;padding:12px;min-width:180px;max-width:240px;">
            <p style="font-weight:700;font-size:15px;color:#2A2520;margin:0 0 4px;">${m.name}</p>
            <p style="font-size:12px;color:#7A776F;margin:0 0 8px;">${m.day_of_week ?? ''}</p>
            <a href="/markets#${m.slug}" style="color:#E07B00;font-size:13px;font-weight:700;text-decoration:none;">Market details →</a>
          </div>`,
          { maxWidth: 260 }
        )
        .addTo(map);
    });

    if (centre) {
      // Show the search area: a circle of the chosen radius around the centre
      const circle = L.circle([centre.lat, centre.lng], {
        radius: radiusKm * 1000,
        color: '#E07B00',
        weight: 1.5,
        fillColor: '#E07B00',
        fillOpacity: 0.06,
      }).addTo(map);
      L.circleMarker([centre.lat, centre.lng], {
        radius: 7,
        fillColor: '#E07B00',
        fillOpacity: 1,
        color: 'white',
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(centre.label === 'you' ? 'You are here' : centre.label);
      map.fitBounds(circle.getBounds(), { padding: [20, 20] });
    } else if (vendors.length < 2) {
      // Opening view: the whole live area (Tasmania for now)
      map.fitBounds(liveBounds(), { padding: [10, 10] });
    } else if (vendors.some((v) => v.location?.lat)) {
      // Fit bounds to markers if we have any
      try {
        const bounds = clusterGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      } catch {}
    }

    // Geolocation button
    const LocateControl = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create(
          'button',
          'leaflet-bar leaflet-control leaflet-control-locate'
        );
        btn.innerHTML = '📍';
        btn.title = 'Show my location';
        btn.setAttribute('aria-label', 'Show my location');
        btn.style.cssText =
          'width:34px;height:34px;font-size:18px;cursor:pointer;background:white;border:none;display:flex;align-items:center;justify-content:center;';
        L.DomEvent.on(btn, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);
            L.circleMarker([latitude, longitude], {
              radius: 8,
              fillColor: '#E07B00',
              fillOpacity: 1,
              color: 'white',
              weight: 2,
            })
              .addTo(map)
              .bindPopup('You are here')
              .openPopup();
          });
        });
        return btn;
      },
    });

    new LocateControl({ position: 'topright' }).addTo(map);
  }, [vendors, markets, onVendorSelect, centre, radiusKm]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height: '55vh', minHeight: '320px' }}
      aria-label="Food van locations map"
      role="application"
    />
  );
}
