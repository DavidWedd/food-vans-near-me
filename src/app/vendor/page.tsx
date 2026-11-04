import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { ImHereCard } from '@/components/dashboard/ImHereCard';
import { ListingForm, type ListingValues } from '@/components/dashboard/ListingForm';
import { MenuEditor } from '@/components/dashboard/MenuEditor';
import { ScheduleEditor } from '@/components/dashboard/ScheduleEditor';
import { PLANS, hasFeature, isPlanId, planFor } from '@/lib/plans';
import { getVendorStats } from '@/lib/vendor-stats';
import { BillingCard, EnquiriesCard, LockedCard, StatsCard, type EnquiryRow } from '@/components/dashboard/ProCards';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: 'Your dashboard - Food Vans Near Me',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing } = await searchParams;
  if (!supabaseConfigured) redirect('/vendor/login');
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/vendor/login');
  const user = auth.user;

  const { data: v } = await supabase
    .from('vendors')
    .select('*, vendor_live_locations(*), vendor_schedule(*), menu_items(*)')
    .eq('owner_id', user.id)
    .maybeSingle();

  const { data: adminRows } = await supabase.from('admin_emails').select('email').limit(1);
  const isAdmin = Boolean(adminRows && adminRows.length);

  const values: ListingValues = {
    business_name: v?.business_name ?? '',
    description: v?.description ?? '',
    suburb: v?.suburb ?? '',
    cuisine_type: v?.cuisine_type ?? [],
    dietary_tags: v?.dietary_tags ?? [],
    payment_methods: v?.payment_methods ?? [],
    price_range: v?.price_range ?? 2,
    phone: v?.phone ?? '',
    email: v?.email ?? '',
    website_url: v?.website_url ?? '',
    instagram_handle: v?.instagram_handle ?? '',
    facebook_url: v?.facebook_url ?? '',
    logo_url: v?.logo_url ?? '',
    cover_photo_url: v?.cover_photo_url ?? '',
  };

  const liveRow = v ? (Array.isArray(v.vendor_live_locations) ? v.vendor_live_locations[0] : v.vendor_live_locations) : null;
  const live = liveRow && new Date(liveRow.expires_at) > new Date() ? liveRow : null;
  const tier: unknown = v?.subscription_tier;
  const plan = isPlanId(tier) ? PLANS[tier] : null;
  const can = (f: Parameters<typeof hasFeature>[1]) => hasFeature(v?.subscription_tier, f);

  // Pro extras: stats and enquiries
  const spots = v
    ? [
        ...(v.vendor_schedule ?? []).filter((x: { lat: number | null }) => x.lat != null),
        ...(liveRow ? [liveRow] : []),
      ].map((x: { lat: number; lng: number }) => ({ lat: x.lat, lng: x.lng }))
    : [];
  if (v && spots.length === 0) {
    const { data: lastSession } = await supabase
      .from('vendor_live_locations')
      .select('lat, lng')
      .eq('vendor_id', v.id)
      .maybeSingle();
    if (lastSession) spots.push({ lat: lastSession.lat, lng: lastSession.lng });
  }
  const stats = v && can('analytics') ? await getVendorStats(supabase, v.id, spots) : null;
  const { data: enquiryRows } =
    v && can('enquiries')
      ? await supabase
          .from('enquiries')
          .select('id, name, email, phone, event_date, event_location, guests, message, created_at')
          .eq('vendor_id', v.id)
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: null };

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              {v ? v.business_name : 'Welcome!'}
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>
              Logged in as {user.email}
              {plan ? ` · ${plan.name} plan${v?.founding ? ' (founding vendor)' : ''}` : ''}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {isAdmin && (
              <Link href="/admin" className="text-[14px] font-semibold underline" style={{ color: 'var(--primary)' }}>
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button className="text-[14px] underline" style={{ color: 'var(--muted)' }}>
                Log out
              </button>
            </form>
          </div>
        </div>

        {v && <StatusBanner status={v.status} slug={v.slug} />}

        {v && <ImHereCard live={live} approved={v.status === 'approved'} />}

        <ListingForm values={values} isNew={!v} userId={user.id} />

        {v && (
          <>
            <MenuEditor
              initial={[...(v.menu_items ?? [])]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((m) => ({
                  name: m.name,
                  description: m.description ?? '',
                  price: m.price != null ? String(m.price) : '',
                  dietary_tags: m.dietary_tags ?? [],
                  is_available: m.is_available,
                }))}
            />
            {can('schedule') ? (
            <ScheduleEditor
              initial={[...(v.vendor_schedule ?? [])]
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map((s) => ({
                  day_of_week: s.day_of_week,
                  start_time: String(s.start_time).slice(0, 5),
                  end_time: String(s.end_time).slice(0, 5),
                  location_name: s.location_name,
                  suburb: s.suburb ?? '',
                  lat: s.lat,
                  lng: s.lng,
                }))}
            />
            ) : (
              <LockedCard title="Regular trading times" planName={planFor('schedule').name}>
                Show customers where you trade each week, like Salamanca Market on Saturdays, so they can find you
                even when you&apos;re not live.
              </LockedCard>
            )}
            {stats ? (
              <StatsCard stats={stats} />
            ) : (
              <LockedCard title="Your stats" planName={planFor('analytics').name}>
                See how many people view your page and tap your pin, and when people search near your spots.
              </LockedCard>
            )}
            {can('enquiries') ? (
              <EnquiriesCard enquiries={(enquiryRows ?? []) as EnquiryRow[]} />
            ) : (
              <LockedCard title="Catering enquiries" planName={planFor('enquiries').name}>
                Add a &quot;Book this van&quot; form to your page, so people can enquire about weddings, parties and events.
              </LockedCard>
            )}
            <BillingCard
              planName={plan?.name ?? 'Basic'}
              founding={Boolean(v.founding)}
              planStatus={v.plan_status ?? null}
              notice={
                billing === 'none'
                  ? 'We couldn\'t find a Stripe sign-up for your login email. Choose a plan on the Join page using the same email, or email hello@foodvansnear.me.'
                  : billing === 'unavailable'
                    ? 'The billing page isn\'t available right now. Please try again shortly.'
                    : null
              }
            />
            {!can('featuredPin') && (
              <LockedCard title="Featured pin" planName={planFor('featuredPin').name}>
                A bigger, gold-ringed pin on the map, top spot in lists, and a chance to be Vendor of the Week on the homepage.
              </LockedCard>
            )}
          </>
        )}

        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
          Need a hand? Email <a href="mailto:hello@foodvansnear.me" className="underline">hello@foodvansnear.me</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}

function StatusBanner({ status, slug }: { status: string; slug: string }) {
  const text =
    status === 'approved' ? (
      <>
        Your listing is live.{' '}
        <Link href={`/van/${slug}`} className="underline font-semibold">
          See your public page
        </Link>
      </>
    ) : status === 'hidden' ? (
      <>Your listing is hidden from the public at the moment. Email hello@foodvansnear.me if that&apos;s unexpected.</>
    ) : (
      <>Thanks for joining! We&apos;re checking your listing and will put you on the map soon, usually within a day.</>
    );
  return (
    <p
      className="rounded-xl px-4 py-3 mb-6 text-[15px]"
      role="status"
      style={{
        color: 'var(--text)',
        backgroundColor:
          status === 'approved'
            ? 'color-mix(in srgb, var(--success) 12%, var(--surface))'
            : 'color-mix(in srgb, var(--primary) 10%, var(--surface))',
      }}
    >
      {text}
    </p>
  );
}
