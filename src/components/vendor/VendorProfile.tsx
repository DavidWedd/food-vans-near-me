'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  Instagram,
  Globe,
  Clock,
  MapPin,
  Calendar,
  Star,
  MessageSquare,
} from 'lucide-react';
import type { Vendor } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/vendor/StarRating';
import { VendorCard } from '@/components/vendor/VendorCard';
import {
  cuisineLabel,
  dietaryShortLabel,
  formatDate,
  formatPrice,
  getNextSchedule,
  isVendorLive,
} from '@/lib/utils';

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[220px] rounded-xl animate-pulse"
      style={{ backgroundColor: 'var(--surface-off)' }}
    />
  ),
});

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const paymentLabels: Record<string, string> = {
  eftpos: 'EFTPOS',
  cash: 'Cash',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
};
const paymentIcons: Record<string, React.ReactNode> = {
  eftpos: <CreditCard size={16} />,
  cash: <Banknote size={16} />,
  'apple-pay': <Smartphone size={16} />,
  'google-pay': <Smartphone size={16} />,
};

interface VendorProfileProps {
  vendor: Vendor;
  similarVendors: Vendor[];
}

export function VendorProfile({ vendor, similarVendors }: VendorProfileProps) {
  const live = isVendorLive(vendor.location);
  const nextSchedule = getNextSchedule(vendor.schedule);

  // Expiry countdown
  const expiresIn = vendor.location?.expires_at
    ? Math.max(
        0,
        Math.round(
          (new Date(vendor.location.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)
        )
      )
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Back link */}
      <div
        className="border-b"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-medium transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--primary)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--muted)')}
          >
            <ArrowLeft size={16} />
            Back to map
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[300px] overflow-hidden">
        {vendor.cover_photo_url ? (
          <Image
            src={vendor.cover_photo_url}
            alt={`${vendor.business_name} cover photo`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Vendor name + cuisine over image */}
        <div className="absolute bottom-14 left-4 right-4 sm:left-8">
          <div className="flex flex-wrap gap-2 mb-2">
            {vendor.cuisine_type.map((c) => (
              <span
                key={c}
                className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                {cuisineLabel(c)}
              </span>
            ))}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {vendor.business_name}
          </h1>
        </div>

        {/* Logo */}
        {vendor.logo_url && (
          <div
            className="absolute bottom-0 left-4 sm:left-8 translate-y-1/2 w-20 h-20 rounded-full border-4 overflow-hidden z-10"
            style={{ borderColor: 'var(--surface)', backgroundColor: 'var(--surface)' }}
          >
            <Image
              src={vendor.logo_url}
              alt={`${vendor.business_name} logo`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 mt-14">
        {/* Live status card */}
        <section
          className="rounded-2xl border p-5 mb-6"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          aria-label="Trading status"
        >
          {live ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-3 h-3 rounded-full animate-pulse-dot"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--success)' }}
                >
                  Open Now
                </span>
                {expiresIn !== null && expiresIn < 9999 && (
                  <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                    · Expires in {expiresIn}h
                  </span>
                )}
              </div>
              {vendor.location?.notes && (
                <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
                  <MapPin size={14} className="inline mr-1" />
                  {vendor.location.notes}
                </p>
              )}
              {vendor.location && (
                <MiniMap
                  lat={vendor.location.lat}
                  lng={vendor.location.lng}
                  vendorName={vendor.business_name}
                />
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: 'var(--muted)' }}
              />
              <div>
                <p className="font-bold text-[16px]" style={{ color: 'var(--text)' }}>
                  Not trading right now
                </p>
                {nextSchedule && (
                  <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>
                    <Clock size={13} className="inline mr-1" />
                    Next up: {nextSchedule}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Info bar */}
        <section
          className="rounded-2xl border p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          aria-label="Vendor details"
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
              Price Range
            </p>
            <p className="font-bold text-[18px]" style={{ color: 'var(--primary)' }}>
              {formatPrice(vendor.price_range)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
              State
            </p>
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>
              {vendor.suburb}, {vendor.state}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              Payment
            </p>
            <div className="flex gap-2 flex-wrap">
              {vendor.payment_methods.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 text-[12px]"
                  style={{ color: 'var(--text)' }}
                  title={paymentLabels[m]}
                >
                  {paymentIcons[m]}
                  <span className="hidden sm:inline">{paymentLabels[m]}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              Dietary
            </p>
            <div className="flex gap-1 flex-wrap">
              {vendor.dietary_tags.map((tag) => (
                <Badge key={tag} variant="dietary">
                  {dietaryShortLabel(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        {vendor.description && (
          <section className="mb-8" aria-label="About">
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              About
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {vendor.description}
            </p>
            <div className="flex gap-4 mt-4">
              {vendor.instagram_handle && (
                <a
                  href={`https://instagram.com/${vendor.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  <Instagram size={16} />@{vendor.instagram_handle}
                </a>
              )}
              {vendor.website_url && (
                <a
                  href={vendor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium"
                  style={{ color: 'var(--teal)' }}
                >
                  <Globe size={16} />
                  Website
                </a>
              )}
            </div>
          </section>
        )}

        {/* Menu */}
        {vendor.menu_items && vendor.menu_items.length > 0 && (
          <section className="mb-8" aria-label="Menu">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Menu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.menu_items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    opacity: item.is_available ? 1 : 0.5,
                  }}
                >
                  {item.photo_url ? (
                    <div className="relative h-28 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={item.photo_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-28 rounded-lg mb-3 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: 'var(--surface-off)' }}
                    >
                      {item.dietary_tags.includes('vegan') ? '🌿' : '🍽️'}
                    </div>
                  )}
                  <h3 className="font-semibold text-[15px] mb-1" style={{ color: 'var(--text)' }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-[13px] mb-2 leading-snug" style={{ color: 'var(--muted)' }}>
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {item.price !== undefined && (
                      <span className="font-bold text-[15px]" style={{ color: 'var(--primary)' }}>
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                    {item.dietary_tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.dietary_tags.map((t) => (
                          <Badge key={t} variant="dietary" className="text-[10px]">
                            {dietaryShortLabel(t)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Schedule */}
        {vendor.schedule && vendor.schedule.length > 0 && (
          <section className="mb-8" aria-label="Weekly schedule">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Regular Schedule
            </h2>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              {vendor.schedule.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="w-24 flex-shrink-0">
                    <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                      {DAY_NAMES[entry.day_of_week]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--muted)' }}>
                    <Clock size={13} />
                    {entry.start_time} – {entry.end_time}
                  </div>
                  <div className="flex items-center gap-1 text-[13px] ml-auto text-right" style={{ color: 'var(--muted)' }}>
                    <MapPin size={13} />
                    {entry.location_name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {vendor.reviews && vendor.reviews.length > 0 && (
          <section className="mb-8" aria-label="Customer reviews">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                Reviews
              </h2>
              {vendor.avg_rating !== undefined && (
                <StarRating
                  rating={vendor.avg_rating}
                  reviewCount={vendor.review_count}
                  size={16}
                />
              )}
            </div>

            <div className="space-y-4">
              {vendor.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] flex-shrink-0 text-white"
                      style={{ backgroundColor: 'var(--primary)' }}
                      aria-hidden="true"
                    >
                      {review.user_display_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                          {review.user_display_name}
                        </span>
                        <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--muted)' }}>
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <div className="flex mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < review.rating ? 'var(--primary)' : 'none'}
                            stroke="var(--primary)"
                            strokeWidth={1.5}
                            opacity={i >= review.rating ? 0.3 : 1}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text)' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vendor reply */}
                  {review.vendor_reply && (
                    <div
                      className="mt-3 ml-13 pl-4 border-l-2 rounded-r-lg p-3"
                      style={{
                        borderColor: 'var(--primary)',
                        backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                      }}
                    >
                      <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--primary)' }}>
                        Owner reply
                      </p>
                      <p className="text-[13px]" style={{ color: 'var(--text)' }}>
                        {review.vendor_reply}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Write a review button */}
            <button
              disabled
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold border cursor-not-allowed opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              title="Sign in to write a review"
              aria-describedby="review-disabled-tooltip"
            >
              <MessageSquare size={16} />
              Write a Review
            </button>
            <p id="review-disabled-tooltip" className="sr-only">
              Sign in to write a review
            </p>
          </section>
        )}

        {/* Similar vans */}
        {similarVendors.length > 0 && (
          <section aria-label="Similar food vans">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              More {cuisineLabel(vendor.cuisine_type[0]).split(' ').slice(1).join(' ')} vans you might like
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
              {similarVendors.map((v) => (
                <div key={v.id} className="flex-shrink-0 w-[280px]">
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
