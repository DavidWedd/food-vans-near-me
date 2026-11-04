import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { stripeInfoFor } from '@/lib/stripe-admin';
import { foundingSpotsLeft } from '@/lib/stripe';
import { FOUNDING } from '@/lib/plans';
import { VendorAdminRow, type AdminVendor } from './VendorAdminRow';

export const metadata: Metadata = {
  title: 'Admin - Food Vans Near Me',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  if (!supabaseConfigured) redirect('/');
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/vendor/login?next=/admin');
  const { data: adminRows } = await supabase.from('admin_emails').select('email').limit(1);
  if (!adminRows || adminRows.length === 0) redirect('/vendor');

  const { show = 'pending' } = await searchParams;
  const { data: all } = await supabase
    .from('vendors')
    .select('*, vendor_live_locations(expires_at, suburb)')
    .order('created_at', { ascending: false });

  const vendors = all ?? [];
  const counts = {
    pending: vendors.filter((v) => v.status === 'pending').length,
    approved: vendors.filter((v) => v.status === 'approved').length,
    hidden: vendors.filter((v) => v.status === 'hidden').length,
  };
  const shown = vendors.filter((v) => show === 'all' || v.status === show);
  const rows: AdminVendor[] = await Promise.all(
    shown.map(async (v) => {
      const live = Array.isArray(v.vendor_live_locations) ? v.vendor_live_locations[0] : v.vendor_live_locations;
      return {
        id: v.id,
        slug: v.slug,
        business_name: v.business_name,
        suburb: v.suburb,
        owner_email: v.owner_email,
        status: v.status,
        subscription_tier: v.subscription_tier,
        founding: v.founding,
        admin_notes: v.admin_notes ?? '',
        created_at: v.created_at,
        live_until: live && new Date(live.expires_at) > new Date() ? live.expires_at : null,
        live_suburb: live?.suburb ?? '',
        has_logo: Boolean(v.logo_url),
        has_cover: Boolean(v.cover_photo_url),
        has_description: Boolean(v.description),
        stripe: await stripeInfoFor(v.owner_email),
      };
    })
  );
  const spots = await foundingSpotsLeft();
  const liveNow = vendors.filter((v) => {
    const l = Array.isArray(v.vendor_live_locations) ? v.vendor_live_locations[0] : v.vendor_live_locations;
    return l && new Date(l.expires_at) > new Date();
  }).length;

  const tabs: { key: string; label: string }[] = [
    { key: 'pending', label: `Waiting for approval (${counts.pending})` },
    { key: 'approved', label: `On the map (${counts.approved})` },
    { key: 'hidden', label: `Hidden (${counts.hidden})` },
    { key: 'all', label: `All (${vendors.length})` },
  ];

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Admin
          </h1>
          <Link href="/vendor" className="text-[14px] underline" style={{ color: 'var(--muted)' }}>
            Back to vendor dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="Waiting for approval" value={counts.pending} />
          <Stat label="On the map" value={counts.approved} />
          <Stat label="Trading right now" value={liveNow} />
          <Stat label="Founding spots left" value={spots ?? FOUNDING.spots} suffix={spots === null ? ' (Stripe not connected)' : ` of ${FOUNDING.spots}`} />
        </div>

        <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filter vendors">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin?show=${t.key}`}
              className="rounded-full px-4 py-2 text-[14px] font-semibold border"
              style={{
                borderColor: show === t.key ? 'var(--primary)' : 'var(--border)',
                backgroundColor: show === t.key ? 'var(--primary)' : 'transparent',
                color: show === t.key ? 'white' : 'var(--text)',
              }}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {rows.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nothing here.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <VendorAdminRow key={r.id} vendor={r} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="text-[26px] font-extrabold" style={{ color: 'var(--text)' }}>
        {value}
        <span className="text-[13px] font-normal" style={{ color: 'var(--muted)' }}>
          {suffix}
        </span>
      </p>
    </div>
  );
}
