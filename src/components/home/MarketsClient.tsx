'use client';

import Link from 'next/link';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEED_MARKETS } from '@/lib/seed-data';
import type { Vendor } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MarketCover } from '@/components/ui/MarketCover';

export default function MarketsClient({ vendors }: { vendors: Vendor[] }) {
  const filtered = SEED_MARKETS;

  // Find vendors that attend each market based on schedule location name
  const getMarketVendors = (marketName: string) =>
    vendors.filter((v) =>
      v.schedule?.some((s) => s.location_name.toLowerCase().includes(marketName.toLowerCase()))
    );

  return (
    <>
      <Header showSearch={false} />

      <main id="main-content">
        {/* Page header */}
        <div
          className="py-12 px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--bg)) 0%, var(--bg) 60%)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Markets &amp; Events
            </h1>
            <p className="text-[16px] max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              Tasmania&apos;s best food markets, and where to find your favourite vans
            </p>
          </div>
        </div>


        {/* Markets grid */}
        <div className="max-w-5xl mx-auto px-4 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🏪</p>
              <p className="text-[16px]" style={{ color: 'var(--muted)' }}>
                No markets listed yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((market) => {
                const attendingVendors = getMarketVendors(market.name);
                return (
                  <article
                    key={market.id}
                    id={market.slug}
                    className="rounded-2xl border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {/* Cover photo */}
                    <div className="relative overflow-hidden">
                      <MarketCover market={market} height="h-36" />
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="frequency">{market.frequency}</Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Title */}
                      <h2
                        className="text-[20px] font-bold mb-1 leading-snug"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                      >
                        <Link href={`/markets/${market.slug}`} className="hover:underline">
                          {market.name}
                        </Link>
                      </h2>

                      {/* Location */}
                      <div
                        className="flex items-center gap-1 text-[13px] mb-1"
                        style={{ color: 'var(--muted)' }}
                      >
                        <MapPin size={13} />
                        {market.location_name}, {market.suburb} {market.state}
                      </div>

                      {/* Day/time */}
                      {market.day_of_week && (
                        <div
                          className="flex items-center gap-1 text-[13px] mb-4"
                          style={{ color: 'var(--muted)' }}
                        >
                          <Calendar size={13} />
                          {market.day_of_week}
                        </div>
                      )}

                      {/* Description */}
                      {market.description && (
                        <p
                          className="text-[14px] leading-relaxed mb-4"
                          style={{ color: 'var(--muted)' }}
                        >
                          {market.description}
                        </p>
                      )}

                      {/* Attending vendors */}
                      {attendingVendors.length > 0 && (
                        <div className="mb-4">
                          <p
                            className="text-[12px] font-semibold uppercase tracking-wider mb-2"
                            style={{ color: 'var(--text)' }}
                          >
                            Vendors attending
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {attendingVendors.map((v) => (
                              <Link
                                key={v.id}
                                href={`/van/${v.slug}`}
                                className="text-[13px] font-medium px-2.5 py-1 rounded-full border transition-colors"
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--teal)',
                                }}
                              >
                                {v.business_name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/markets/${market.slug}`}
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold mr-5"
                        style={{ color: 'var(--teal)' }}
                      >
                        See who&apos;s trading
                      </Link>
                      {/* Visit website */}
                      {market.website_url && (
                        <a
                          href={market.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[14px] font-semibold"
                          style={{ color: 'var(--primary)' }}
                        >
                          Visit Website
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
