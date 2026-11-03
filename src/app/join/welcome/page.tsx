import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/layout/ContentPage';
import { BUSINESS } from '@/lib/business';
import { PLANS, isPlanId } from '@/lib/plans';
import { getStripe } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Welcome aboard - Food Vans Near Me',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

async function loadSignUp(sessionId: string | undefined) {
  const stripe = getStripe();
  if (!stripe || !sessionId || !sessionId.startsWith('cs_')) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    if (session.status !== 'complete') return null;
    const subscription = typeof session.subscription === 'object' ? session.subscription : null;
    const planId = subscription?.metadata?.plan;
    return {
      businessName: session.custom_fields.find((f) => f.key === 'business_name')?.text?.value ?? null,
      email: session.customer_details?.email ?? null,
      planName: isPlanId(planId) ? PLANS[planId].name : null,
      founding: subscription?.metadata?.founding === 'true',
    };
  } catch {
    return null;
  }
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const signUp = await loadSignUp(session_id);
  const portalUrl = process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL;

  return (
    <ContentPage title={signUp?.businessName ? `Welcome aboard, ${signUp.businessName}!` : 'Welcome aboard!'}>
      {signUp?.founding && (
        <p>
          <strong>You&apos;re a founding vendor.</strong> Your {signUp.planName ?? ''} plan is free for 12 months.
          We&apos;ll email you well before the free year ends, and nothing is charged unless you add a card and
          choose to continue.
        </p>
      )}
      {signUp && !signUp.founding && (
        <p>Your {signUp.planName ?? ''} plan is set up. Stripe has emailed your receipt.</p>
      )}

      <h2>What happens next</h2>
      <ol>
        <li>
          We&apos;ll be in touch within one business day{signUp?.email ? ` at ${signUp.email}` : ''} to set up
          your listing.
        </li>
        <li>Send us your logo, a few photos, your menu and where you usually trade.</li>
        <li>We&apos;ll put you on the map and let you know when you&apos;re live.</li>
      </ol>

      <p>
        Questions? Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>
      {portalUrl && (
        <p>
          You can change plans, update billing details or cancel any time from your{' '}
          <a href={portalUrl}>billing page</a>.
        </p>
      )}
      <p>
        <Link href="/">Back to the map</Link>
      </p>
    </ContentPage>
  );
}
