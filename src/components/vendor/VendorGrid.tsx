'use client';

import { VendorCard } from '@/components/vendor/VendorCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import type { Vendor } from '@/types';

interface VendorGridProps {
  vendors: Vendor[];
  loading?: boolean;
  selectedVendorId?: string | null;
}

export function VendorGrid({ vendors, loading = false, selectedVendorId }: VendorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🍽️</div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          No food vans found
        </h3>
        <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
          Try adjusting your filters or search in a different area.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      role="list"
      aria-label="Food van listings"
    >
      {vendors.map((vendor) => (
        <div key={vendor.id} role="listitem" id={`vendor-card-${vendor.id}`}>
          <VendorCard
            vendor={vendor}
            highlighted={selectedVendorId === vendor.id}
          />
        </div>
      ))}
    </div>
  );
}
