import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Vendor login - Food Vans Near Me',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function VendorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; next?: string }>;
}) {
  const { email, error, next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/vendor';

  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(safeNext);
  }

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-md mx-auto px-4 py-12">
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          Vendor login
        </h1>
        <p className="text-[15px] mb-8" style={{ color: 'var(--muted)' }}>
          Update your listing, menu and trading times, and tap &quot;I&apos;m here&quot; when you start trading.
        </p>
        {supabaseConfigured ? (
          <LoginForm initialEmail={email ?? ''} linkError={error === 'link'} next={safeNext} />
        ) : (
          <p style={{ color: 'var(--text)' }}>Vendor logins are opening soon.</p>
        )}
        <p className="text-[14px] mt-10" style={{ color: 'var(--muted)' }}>
          Not listed yet? <Link href="/join" className="underline">See plans and the founding vendor offer</Link>.
        </p>
      </main>
      <Footer />
    </>
  );
}
