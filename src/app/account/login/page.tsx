import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { LoginForm } from '@/app/vendor/login/LoginForm';

export const metadata: Metadata = { title: 'Log in - Food Vans Near Me', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; next?: string }>;
}) {
  const { email, error, next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';
  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(safeNext);
  }
  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Save your favourite vans
        </h1>
        <p className="text-[15px] mb-8" style={{ color: 'var(--muted)' }}>
          Log in to save vans, get an email when they start trading, and leave reviews. New here? Just enter your
          email and we&apos;ll set you up.
        </p>
        <LoginForm
          initialEmail={email ?? ''}
          linkError={error === 'link'}
          next={safeNext}
          hint="No password needed - we'll email you a login link."
        />
        <p className="text-[14px] mt-10" style={{ color: 'var(--muted)' }}>
          Run a food van? <Link href="/vendor/login" className="underline">Vendor login</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
