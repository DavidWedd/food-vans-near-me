import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { FavouriteRow } from '@/components/account/FavouriteRow';
import { signOutCustomer } from './actions';
import { ChangeEmailCard } from '@/components/account/ChangeEmailCard';

export const metadata: Metadata = { title: 'Your saved vans - Food Vans Near Me', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ unsubscribed?: string; email?: string }> }) {
  if (!supabaseConfigured) redirect('/');
  const { unsubscribed, email: emailStatus } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/account/login${unsubscribed ? '?next=/account' : ''}`);

  const [{ data: favs }, { data: reviews }, { data: ownVan }] = await Promise.all([
    supabase
      .from('favourites')
      .select('vendor_id, notify, vendors(business_name, slug, suburb, vendor_live_locations(expires_at))')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, rating, comment, vendor_reply, vendors(business_name, slug)')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false }),
    supabase.from('vendors').select('id').eq('owner_id', auth.user.id).maybeSingle(),
  ]);

  const one = <T,>(x: T | T[] | null | undefined): T | null => (Array.isArray(x) ? x[0] ?? null : x ?? null);

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              Your saved vans
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>
              Logged in as {auth.user.email}
            </p>
          </div>
          <div className="flex gap-4 items-center text-[14px]">
            {ownVan && (
              <Link href="/vendor" className="underline font-semibold" style={{ color: 'var(--primary)' }}>
                Your van&apos;s dashboard
              </Link>
            )}
            <form action={signOutCustomer}>
              <button className="underline" style={{ color: 'var(--muted)' }}>Log out</button>
            </form>
          </div>
        </div>

        {unsubscribed && (
          <p role="status" className="rounded-xl px-4 py-3 mb-6 text-[15px]" style={{ backgroundColor: 'var(--surface-off)', color: 'var(--text)' }}>
            Done - you won&apos;t get trading emails for that van any more. You can turn them back on below.
          </p>
        )}

        {!favs || favs.length === 0 ? (
          <p className="text-[15px] mb-10" style={{ color: 'var(--muted)' }}>
            No saved vans yet. Tap <strong>Save</strong> on any van&apos;s page and we&apos;ll email you when they start
            trading. <Link href="/" className="underline">Find vans</Link>
          </p>
        ) : (
          <ul className="space-y-3 mb-10">
            {favs.map((f) => {
              const v = one(f.vendors as unknown as { business_name: string; slug: string; suburb: string; vendor_live_locations: { expires_at: string } | { expires_at: string }[] | null });
              if (!v) return null;
              const live = one(v.vendor_live_locations);
              return (
                <FavouriteRow
                  key={f.vendor_id}
                  vendorId={f.vendor_id}
                  name={v.business_name}
                  slug={v.slug}
                  suburb={v.suburb}
                  live={Boolean(live && new Date(live.expires_at) > new Date())}
                  notify={f.notify}
                />
              );
            })}
          </ul>
        )}

        <h2 className="text-[20px] font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Your reviews
        </h2>
        {!reviews || reviews.length === 0 ? (
          <p className="text-[15px]" style={{ color: 'var(--muted)' }}>You haven&apos;t reviewed any vans yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const v = one(r.vendors as unknown as { business_name: string; slug: string });
              return (
                <li key={r.id} className="rounded-xl border p-4 text-[14px]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <Link href={`/van/${v?.slug ?? ''}#reviews`} className="font-semibold underline">{v?.business_name}</Link>{' '}
                  <span style={{ color: 'var(--primary)' }}>{'★'.repeat(r.rating)}</span>
                  {r.comment && <p className="mt-1">{r.comment}</p>}
                  {r.vendor_reply && (
                    <p className="mt-2 pl-3 border-l-2" style={{ borderColor: 'var(--primary)', color: 'var(--muted)' }}>
                      Reply: {r.vendor_reply}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-10">
          <ChangeEmailCard current={auth.user.email ?? ''} status={emailStatus} />
        </div>
      </main>
      <Footer />
    </>
  );
}
