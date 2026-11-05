'use client';

import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), {
  ssr: false,
  loading: () => <div className="h-56 rounded-2xl" style={{ backgroundColor: 'var(--surface-2, #eee)' }} />,
});

export function MarketMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  return <MiniMap lat={lat} lng={lng} vendorName={name} />;
}
