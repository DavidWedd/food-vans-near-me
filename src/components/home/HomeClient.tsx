'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/vendor/FilterBar';
import { VendorGrid } from '@/components/vendor/VendorGrid';
import { SEED_MARKETS } from '@/lib/seed-data';
import { filterVendors, matchesText } from '@/lib/utils';
import { geocodePlace } from '@/lib/geo';
import { isInLiveArea, LIVE_AREA_NAME } from '@/lib/regions';
import type { FilterState, Vendor } from '@/types';
import { StarRating } from '@/components/vendor/StarRating';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight } from 'lucide-react';
import { MarketCover } from '@/components/ui/MarketCover';

const VendorMap = dynamic(() => import('@/components/map/VendorMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full animate-pulse"
      style={{ height: '55vh', minHeight: '320px', backgroundColor: 'var(--surface-off)' }}
    >
      <div className="flex items-center justify-center h-full">
        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
          Loading map…
        </p>
      </div>
    </div>
  ),
});

const DEFAULT_FILTERS: FilterState = {
  openNow: false,
  cuisineTypes: [],
  dietaryTags: [],
  state: 'ALL',
  searchQuery: '',
  radius: 5,
  centre: null,
};

export default function HomeClient({ vendors }: { vendors: Vendor[] }) {
  // Premium vendors are eligible for Vendor of the Week
  const VENDOR_OF_WEEK = vendors.find((v) => v.subscription_tier === 'premium');
  const HAS_VENDORS = vendors.length > 0;
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const handleFiltersChange = (next: FilterState) => {
    setIsFiltering(true);
    setFilters(next);
    setTimeout(() => setIsFiltering(false), 300);
  };

  // Typing clears any previous place; the effect below looks the place up.
  const handleSearchChange = (q: string) => {
    setLocationMessage(null);
    handleFiltersChange({ ...filters, searchQuery: q, centre: null });
  };

  // If the search text doesn't match a van name or cuisine, treat it as a
  // suburb, town or postcode and search around it.
  useEffect(() => {
    const q = filters.searchQuery.trim();
    if (q.length < 3 || filters.centre) return;
    if (vendors.some((v) => matchesText(v, q))) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const place = await geocodePlace(q, controller.signal);
      if (place) {
        setFilters((f) => (f.searchQuery.trim() === q ? { ...f, centre: place } : f));
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters.searchQuery, filters.centre, vendors]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Your browser can\'t share your location. Try typing your suburb or postcode instead.');
      return;
    }
    setLocationMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isInLiveArea(latitude, longitude)) {
          setLocationMessage(
            `We're only in ${LIVE_AREA_NAME} for now - the rest of Australia is coming. Try searching for a suburb in ${LIVE_AREA_NAME}.`
          );
          return;
        }
        setLocationMessage(null);
        handleFiltersChange({
          ...filters,
          searchQuery: '',
          centre: { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'you' },
        });
      },
      () => {
        setLocationMessage('We couldn\'t get your location. Try typing your suburb or postcode instead.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const filtered = useMemo(() => filterVendors(vendors, filters), [vendors, filters]);

  // Stable callback so the map isn't rebuilt every time the page re-renders
  const handleVendorSelect = useCallback((vendor: Vendor) => {
    setSelectedVendorId(vendor.id);
    const el = document.getElementById(`vendor-card-${vendor.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <>
      <Header
        searchQuery={filters.searchQuery}
        radius={filters.radius}
        onSearchChange={handleSearchChange}
        onRadiusChange={(r) => handleFiltersChange({ ...filters, radius: r })}
        onLocateMe={handleLocateMe}
        showSearch
      />

      <main id="main-content">
        {/* Intro */}
        <div className="max-w-7xl mx-auto px-4 pt-5 pb-4">
          <h1
            className="text-[26px] sm:text-[32px] font-extrabold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            Tasmania&apos;s food van map
          </h1>
          <p className="text-[15px] mt-1" style={{ color: 'var(--muted)' }}>
            Find food vans, coffee carts and market stalls trading near you, right now.
          </p>
          {locationMessage && (
            <p
              className="text-[14px] mt-3 rounded-xl px-4 py-3"
              role="status"
              style={{ color: 'var(--text)', backgroundColor: 'var(--surface-off)' }}
            >
              {locationMessage}
            </p>
          )}
        </div>

        {/* Hero Map */}
        <section aria-label="Food van locations map">
          <VendorMap
            vendors={filtered}
            markets={SEED_MARKETS}
            centre={filters.centre ?? null}
            radiusKm={filters.radius}
            onVendorSelect={handleVendorSelect}
            className="w-full"
          />
          {/* Hidden screen-reader vendor list */}
          <ul className="sr-only" aria-label="List of food vans">
            {filtered.map((v) => (
              <li key={v.id}>
                <Link href={`/van/${v.slug}`}>
                  {v.business_name} — {v.suburb}, {v.state}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {HAS_VENDORS ? (
          <>
            {/* Filter bar */}
            <FilterBar filters={filters} onChange={handleFiltersChange} />

            {/* Vendor grid section */}
            <section
              className="max-w-7xl mx-auto px-4 py-8"
              aria-label="Food van listings"
            >
              <h2
                className="text-[22px] font-bold mb-6"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                {filters.centre
                  ? `${filtered.length} food van${filtered.length !== 1 ? 's' : ''} within ${filters.radius}km of ${filters.centre.label}`
                  : `${filtered.length} food van${filtered.length !== 1 ? 's' : ''} found`}
              </h2>
              <VendorGrid
                vendors={filtered}
                loading={isFiltering}
                selectedVendorId={selectedVendorId}
              />
            </section>

          </>
        ) : (
          <section
            className="max-w-3xl mx-auto px-4 py-12 text-center"
            aria-label="Launching soon"
          >
            <div className="text-5xl mb-4" aria-hidden="true">🚚</div>
            <h2
              className="text-[24px] sm:text-[28px] font-extrabold mb-3 leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Tasmania&apos;s food van map is coming
            </h2>
            <p className="text-[16px] leading-relaxed mb-6" style={{ color: 'var(--muted)' }}>
              We&apos;re signing up our first food vans, coffee carts and mobile food businesses
              now, starting in Hobart. In the meantime, the markets on the map are a great place
              to find them.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Run a food van? Be one of the first listed
              <ArrowRight size={16} />
            </Link>
          </section>
        )}

        {/* Vendor of the Week */}
        {VENDOR_OF_WEEK && (
          <section
            className="py-12 px-4"
            style={{ backgroundColor: 'var(--surface-off)' }}
            aria-label="Vendor of the week"
          >
            <div className="max-w-5xl mx-auto">
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: 'var(--primary)',
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--surface)) 0%, var(--surface) 100%)',
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-1/2 h-56 md:h-auto min-h-[220px] flex-shrink-0">
                    <Image
                      src={VENDOR_OF_WEEK.cover_photo_url || ''}
                      alt={`${VENDOR_OF_WEEK.business_name} — Vendor of the Week`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <p
                      className="text-[12px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'var(--primary)' }}
                    >
                      ⭐ Vendor of the Week
                    </p>
                    <h2
                      className="text-[28px] font-extrabold leading-tight mb-2"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                      {VENDOR_OF_WEEK.business_name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {VENDOR_OF_WEEK.cuisine_type.map((c) => (
                        <Badge key={c} variant="cuisine">
                          {c === 'bbq' ? '🔥 BBQ' : c}
                        </Badge>
                      ))}
                    </div>
                    {VENDOR_OF_WEEK.avg_rating !== undefined && (
                      <div className="mb-3">
                        <StarRating
                          rating={VENDOR_OF_WEEK.avg_rating}
                          reviewCount={VENDOR_OF_WEEK.review_count}
                          size={16}
                        />
                      </div>
                    )}
                    <p
                      className="text-[15px] leading-relaxed mb-5 line-clamp-3"
                      style={{ color: 'var(--muted)' }}
                    >
                      {VENDOR_OF_WEEK.description}
                    </p>
                    <Link
                      href={`/van/${VENDOR_OF_WEEK.slug}`}
                      className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-[14px] font-semibold text-white"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      View Profile
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Markets strip */}
        <section className="py-12 px-4" aria-label="Markets and events">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-[22px] font-bold mb-6"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Markets where you&apos;ll find food vans
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4">
              {SEED_MARKETS.map((market) => (
                <Link
                  key={market.id}
                  href={`/markets#${market.slug}`}
                  className="flex-shrink-0 w-[300px] rounded-2xl border overflow-hidden group transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                    (e.currentTarget as HTMLElement).style.transform = '';
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <MarketCover market={market} />
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-[16px] mb-1 leading-snug"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                      {market.name}
                    </h3>
                    <p className="text-[13px] mb-2" style={{ color: 'var(--muted)' }}>
                      {market.suburb}, {market.state}
                    </p>
                    <Badge variant="frequency">{market.frequency}</Badge>
                    <p className="text-[12px] mt-2" style={{ color: 'var(--muted)' }}>
                      {market.day_of_week}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
