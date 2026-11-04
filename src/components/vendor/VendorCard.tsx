'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';
import type { Vendor } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/vendor/StarRating';
import {
  cuisineLabel,
  formatDistance,
  formatPrice,
  isVendorLive,
  getNextSchedule,
  dietaryShortLabel,
} from '@/lib/utils';

interface VendorCardProps {
  vendor: Vendor;
  highlighted?: boolean;
}

const paymentIcons = {
  eftpos: <CreditCard size={14} aria-label="EFTPOS" />,
  cash: <Banknote size={14} aria-label="Cash" />,
  'apple-pay': <Smartphone size={14} aria-label="Apple Pay" />,
  'google-pay': <Smartphone size={14} aria-label="Google Pay" />,
};

export function VendorCard({ vendor, highlighted = false }: VendorCardProps) {
  const live = isVendorLive(vendor.location);
  const nextSchedule = getNextSchedule(vendor.schedule);

  return (
    <Link
      href={`/van/${vendor.slug}`}
      className="group block rounded-2xl overflow-hidden border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: highlighted ? 'var(--primary)' : 'var(--border)',
        boxShadow: highlighted ? '0 0 0 2px var(--primary)' : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderLeftColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = highlighted ? '0 0 0 2px var(--primary)' : '';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderLeftColor = highlighted ? 'var(--primary)' : 'var(--border)';
      }}
      aria-label={`View ${vendor.business_name} profile`}
    >
      {/* Cover photo */}
      <div className="relative aspect-video overflow-hidden">
        {vendor.cover_photo_url ? (
          <Image
            src={vendor.cover_photo_url}
            alt={`${vendor.business_name} cover photo`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, var(--surface)) 0%, color-mix(in srgb, var(--teal) 20%, var(--surface)) 100%)',
            }}
          />
        )}

        {/* Status badge – top right */}
        <div className="absolute top-2 right-2">
          {live ? (
            <Badge variant="open">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
              Open Now
            </Badge>
          ) : (
            <Badge variant="closed" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white' }}>
              {nextSchedule ? `Next: ${nextSchedule.split('·')[0].trim()}` : 'Closed'}
            </Badge>
          )}
        </div>

        {/* Featured badge – top left */}
        {vendor.subscription_tier === 'premium' && (
          <div className="absolute top-2 left-2">
            <Badge variant="featured">⭐ Featured</Badge>
          </div>
        )}

        {/* Logo */}
        {vendor.logo_url && (
          <div
            className="absolute bottom-0 left-3 translate-y-1/2 w-10 h-10 rounded-full border-2 overflow-hidden z-10"
            style={{ borderColor: 'var(--surface)', backgroundColor: 'var(--surface)' }}
          >
            <Image
              src={vendor.logo_url}
              alt={`${vendor.business_name} logo`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 pt-6">
        {/* Business name */}
        <h3
          className="font-bold text-[17px] leading-snug mb-2 truncate"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          {vendor.business_name}
        </h3>

        {/* Cuisine chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {vendor.cuisine_type.map((c) => (
            <Badge key={c} variant="cuisine" className="text-[11px]">
              {cuisineLabel(c)}
            </Badge>
          ))}
        </div>

        {/* Rating + distance */}
        <div className="flex items-center justify-between mb-2">
          {vendor.avg_rating !== undefined && (
            <StarRating
              rating={vendor.avg_rating}
              reviewCount={vendor.review_count}
              size={13}
            />
          )}
          {vendor.distance_km !== undefined && (
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
              {formatDistance(vendor.distance_km)}
            </span>
          )}
        </div>

        {/* Price range + suburb */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-[13px] font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            {formatPrice(vendor.price_range)}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {vendor.suburb}, {vendor.state}
          </span>
        </div>

        {/* Dietary tags */}
        {vendor.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {vendor.dietary_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="dietary">
                {dietaryShortLabel(tag)}
              </Badge>
            ))}
          </div>
        )}

        {/* Payment methods */}
        <div
          className="flex items-center gap-2 pt-2 border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          {vendor.payment_methods.map((method) => (
            <span key={method} title={method} aria-label={method}>
              {paymentIcons[method]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
