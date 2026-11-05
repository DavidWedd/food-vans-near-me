import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VendorCard } from '@/components/vendor/VendorCard';
import { MarketMap } from '@/components/market/MarketMap';
import { SEED_MARKETS } from '@/lib/seed-data';
import { getPublicVendors } from '@/lib/vendors';
import { distanceKm } from '@/lib/geo';
import { isVendorLive } from '@/lib/utils';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SEED_MARKETS.map((m) => ({ slug: m.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const market = SEED_MARKETS.find((m) => m.slug === slug);
  if (!market) return { title: 'Market not found' };
  return {
    title: `Food vans at ${market.name} - Food Vans Near Me`,
    description: `Which food vans are at ${market.name} in ${market.suburb}, and who's trading there right now. ${market.day_of_week ?? ''}`.trim(),
    alternates: { canonical: `/markets/${market.slug}` },
  };
}

/** Lower-case words only, for loose name matching ("Street Eats @ Franko" ~ "street eats franko"). */
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default async function MarketPage({ params }: Props) {
  const { slug } = await params;
  const market = SEED_MARKETS.find((m) => m.slug === slug);
  if (!market) notFound();

  const vendors = await getPublicVendors();
  const name = words(market.name);

  // Trading there right now: tapped "I'm here" within 400 m of the market, or named the market
  const here = vendors.filter((v) => {
    if (!isVendorLive(v.location) || v.location?.source !== 'live') return false;
    const nearby = distanceKm({ lat: market.lat, lng: market.lng }, v.location) <= 0.4;
    const named = v.location.event_name ? words(v.location.event_name).includes(name) || name.includes(words(v.location.event_name)) : false;
    return nearby || named;
  });
  // Regulars: their weekly times mention this market
  const regulars = vendors.filter(
    (v) => !here.some((h) => h.id === v.id) && v.schedule?.some((s) => words(s.location_name).includes(name))
  );

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/markets" className="text-[14px] underline" style={{ color: 'var(--muted)' }}>
          All markets and events
        </Link>
        <h1
          className="text-3xl sm:text-4xl font-extrabold mt-3 mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          {market.name}
        </h1>
        <div className="space-y-1 mb-4 text-[15px]" style={{ color: 'var(--muted)' }}>
          <p className="flex items-center gap-1.5">
            <MapPin size={15} />
            {market.location_name}, {market.suburb} {market.state}
          </p>
          {market.day_of_week && (
            <p className="flex items-center gap-1.5">
              <Calendar size={15} />
              {market.day_of_week}
            </p>
          )}
        </div>
        {market.description && (
          <p className="text-[16px] leading-relaxed max-w-3xl mb-4" style={{ color: 'var(--text)' }}>
            {market.description}
          </p>
        )}
        {market.website_url && (
          <a
            href={market.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold mb-8"
            style={{ color: 'var(--primary)' }}
          >
            Market website <ExternalLink size={14} />
          </a>
        )}

        <div className="rounded-2xl overflow-hidden border mb-10" style={{ borderColor: 'var(--border)' }}>
          <MarketMap lat={market.lat} lng={market.lng} name={market.name} />
        </div>

        <section className="mb-10" aria-labelledby="here-now">
          <h2 id="here-now" className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Trading here now
          </h2>
          {here.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {here.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          ) : (
            <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
              No vans have checked in here right now. Vans show up here when they tap &quot;I&apos;m here&quot; at the market.
            </p>
          )}
        </section>

        {regulars.length > 0 && (
          <section className="mb-10" aria-labelledby="regulars">
            <h2 id="regulars" className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              Regulars
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {regulars.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          </section>
        )}

        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
          Run a van at {market.name}?{' '}
          <Link href="/join" className="underline" style={{ color: 'var(--primary)' }}>
            Get listed
          </Link>{' '}
          so customers can find you here.
        </p>
      </main>
      <Footer />
    </>
  );
}
