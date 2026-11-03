'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { getTileConfig } from '@/lib/geo';
import { overlapTile } from '@/lib/map-helpers';

interface MiniMapProps {
  lat: number;
  lng: number;
  vendorName: string;
}

export default function MiniMap({ lat, lng, vendorName }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import('leaflet')).default;
      if (!mounted || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });
      mapRef.current = map;

      const tiles = getTileConfig();
      L.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        tileSize: tiles.tileSize,
        zoomOffset: tiles.zoomOffset,
        maxZoom: tiles.maxZoom,
      })
        .on('tileload', overlapTile(tiles.tileSize))
        .addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:var(--primary,#E07B00);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(vendorName)
        .openPopup();
    }

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, vendorName]);

  return (
    <div
      ref={containerRef}
      className="h-[220px] w-full rounded-xl overflow-hidden"
      aria-label={`Map showing location of ${vendorName}`}
    />
  );
}
