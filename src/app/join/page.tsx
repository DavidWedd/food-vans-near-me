import { Check, X as XIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { BUSINESS } from '@/lib/business';
import { PlanButton } from '@/components/ui/PlanButton';
import { FOUNDING, PLANS, formatPrice } from '@/lib/plans';
import { foundingSpotsLeft, getStripe } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'List Your Food Van - Food Vans Near Me',
  description:
    'List your food truck, coffee cart or market stall on Food Vans Near Me. Get found by hungry Tasmanians looking for their next favourite food van.',
};

const FEATURES = [
  { label: 'Live location pin', basic: true, pro: true, premium: true },
  { label: 'Vendor profile + photos', basic: true, pro: true, premium: true },
  { label: 'Menu listing', basic: true, pro: true, premium: true },
  { label: 'Weekly schedule', basic: false, pro: true, premium: true },
  { label: 'Vendor social posts', basic: false, pro: true, premium: true },
  { label: 'Analytics dashboard', basic: false, pro: true, premium: true },
  { label: 'Featured map pin', basic: false, pro: false, premium: true },
  { label: 'Vendor of the Week eligibility', basic: false, pro: false, premium: true },
  { label: 'Priority support', basic: false, pro: false, premium: true },
];

const FAQS = [
  {
    q: 'How do customers find me?',
    a: 'When you mark yourself as trading, your van appears on the map for people searching nearby. Customers can also browse by cuisine, dietary needs, payment method and suburb, and see which markets you trade at.',
  },
  {
    q: 'Can I update my location from my phone?',
    a: 'Yes. Your vendor dashboard works on your phone: tap "I\'m here" and your pin appears on the map straight away. Vendor dashboards are opening to our founding vendors first.',
  },
  {
    q: 'What payment methods do customers use?',
    a: 'You can specify which payment methods you accept — EFTPOS, cash, Apple Pay and Google Pay. This is displayed on your profile so customers know what to bring.',
  },
  {
    q: 'Do I need an ABN to sign up?',
    a: 'No. You can add your ABN at checkout if you have one, and it will appear on your tax invoices.',
  },
  {
    q: 'What is the founding vendor offer?',
    a: 'The first 15 Tasmanian food vans, coffee carts and mobile food businesses to join get any plan free for 12 months. No credit card needed. We\'ll remind you well before the free year ends, and you only pay if you add a card and choose to continue.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There are no lock-in contracts. Cancel any time and your plan stays active until the end of the period you\'ve paid for.',
  },
];

function FeatureRow({ label, basic, pro, premium }: { label: string; basic: boolean; pro: boolean; premium: boolean }) {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
      <td className="py-3 pr-4 text-[14px]" style={{ color: 'var(--text)' }}>{label}</td>
      <td className="text-center py-3">
        {basic ? (
          <Check size={16} style={{ color: 'var(--success)', margin: 'auto' }} />
        ) : (
          <XIcon size={16} style={{ color: 'var(--muted)', margin: 'auto' }} />
        )}
      </td>
      <td className="text-center py-3">
        {pro ? (
          <Check size={16} style={{ color: 'var(--success)', margin: 'auto' }} />
        ) : (
          <XIcon size={16} style={{ color: 'var(--muted)', margin: 'auto' }} />
        )}
      </td>
      <td className="text-center py-3">
        {premium ? (
          <Check size={16} style={{ color: 'var(--success)', margin: 'auto' }} />
        ) : (
          <XIcon size={16} style={{ color: 'var(--muted)', margin: 'auto' }} />
        )}
      </td>
    </tr>
  );
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const checkoutEnabled = getStripe() !== null;
  const spotsLeft = checkoutEnabled ? await foundingSpotsLeft() : null;
  // If we can't count (e.g. Stripe not set up yet), keep showing the offer.
  const foundingOpen = spotsLeft === null || spotsLeft > 0;
  const trialLabel = (days: number, cents: number) =>
    foundingOpen ? `Free for 12 months, then ${formatPrice(cents)}/mo` : days > 0 ? `Free ${days}-day trial, then ${formatPrice(cents)}/mo` : `${formatPrice(cents)}/mo`;
  const ctaLabel = (days: number) => (foundingOpen ? 'Claim free year' : days > 0 ? 'Start free trial' : 'Get started');

  return (
    <>
      <Header showSearch={false} />

      <main id="main-content">
        {/* Hero */}
        <div
          className="py-16 px-4 text-center"
          style={{
            background: 'linear-gradient(160deg, color-mix(in srgb, var(--primary) 10%, var(--bg)) 0%, var(--bg) 60%)',
          }}
        >
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            List Your Food Van
          </h1>
          <p className="text-[17px] max-w-2xl mx-auto mb-2" style={{ color: 'var(--muted)' }}>
            Get found by hungry Tasmanians looking for their next favourite food van
          </p>
        </div>

        {/* Pricing cards */}
        <section
          id="pricing"
          className="py-14 px-4"
          aria-label="Pricing plans"
          style={{ backgroundColor: 'var(--surface-off)' }}
        >
          {checkout && (
            <div
              role="alert"
              className="max-w-3xl mx-auto mb-6 rounded-xl border p-4 text-center text-[15px]"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
            >
              Sorry, sign-up isn&apos;t working right now. Please try again shortly, or email{' '}
              <a href={`mailto:${BUSINESS.email}`} style={{ color: 'var(--primary)' }}>{BUSINESS.email}</a> and
              we&apos;ll set you up.
            </div>
          )}
          {foundingOpen && (
          <div
            className="max-w-3xl mx-auto mb-10 rounded-2xl border-2 p-6 text-center"
            style={{ borderColor: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 7%, var(--surface))' }}
          >
            <p className="text-[12px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
              Founding vendor offer
            </p>
            <p className="text-[20px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              The first {FOUNDING.spots} Tasmanian vendors get any plan free for 12 months
            </p>
            <p className="text-[15px] mb-4" style={{ color: 'var(--muted)' }}>
              No card, no catch. Pick a plan below to claim your spot.
            </p>
            {spotsLeft !== null && (
              <p className="text-[15px] font-bold" style={{ color: 'var(--primary)' }}>
                {spotsLeft} of {FOUNDING.spots} spots left
              </p>
            )}
          </div>
          )}
          <div className="max-w-5xl mx-auto">
            {/* Desktop: feature table */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pb-6 pr-4" />
                    {/* Basic */}
                    <th className="pb-6 px-4">
                      <div
                        className="rounded-2xl border p-5"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <p className="font-bold text-[18px] mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Basic</p>
                        <p className="text-[13px] mb-3" style={{ color: 'var(--muted)' }}>{trialLabel(PLANS.basic.trialDays, PLANS.basic.priceCents)}</p>
                        <PlanButton
                          plan="basic"
                          enabled={checkoutEnabled}
                          className="block text-center rounded-full py-2 text-[14px] font-semibold border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                          {ctaLabel(PLANS.basic.trialDays)}
                        </PlanButton>
                      </div>
                    </th>
                    {/* Pro */}
                    <th className="pb-6 px-4">
                      <div
                        className="rounded-2xl border-2 p-5"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--primary)',
                          boxShadow: '0 0 0 1px var(--primary)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Pro</p>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                          >
                            Most Popular
                          </span>
                        </div>
                        <p className="text-[13px] mb-3" style={{ color: 'var(--muted)' }}>{trialLabel(PLANS.pro.trialDays, PLANS.pro.priceCents)}</p>
                        <PlanButton
                          plan="pro"
                          enabled={checkoutEnabled}
                          className="block text-center rounded-full py-2 text-[14px] font-semibold text-white"
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          {ctaLabel(PLANS.pro.trialDays)}
                        </PlanButton>
                      </div>
                    </th>
                    {/* Premium */}
                    <th className="pb-6 px-4">
                      <div
                        className="rounded-2xl border p-5"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <p className="font-bold text-[18px] mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Premium</p>
                        <p className="text-[13px] mb-3" style={{ color: 'var(--muted)' }}>{trialLabel(PLANS.premium.trialDays, PLANS.premium.priceCents)}</p>
                        <PlanButton
                          plan="premium"
                          enabled={checkoutEnabled}
                          className="block text-center rounded-full py-2 text-[14px] font-semibold text-white"
                          style={{ backgroundColor: 'var(--teal)' }}
                        >
                          {foundingOpen ? 'Claim free year' : 'Get Premium'}
                        </PlanButton>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f) => (
                    <FeatureRow key={f.label} {...f} />
                  ))}
                </tbody>
              </table>
              <p className="text-center text-[13px] mt-4" style={{ color: 'var(--muted)' }}>
                All prices include GST
              </p>
            </div>

            {/* Mobile: stacked cards */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  id: 'basic' as const,
                  name: 'Basic',
                  price: trialLabel(PLANS.basic.trialDays, PLANS.basic.priceCents),
                  highlight: false,
                  cta: ctaLabel(PLANS.basic.trialDays),
                  ctaStyle: { borderColor: 'var(--border)', color: 'var(--text)' } as React.CSSProperties,
                  ctaClass: 'border',
                },
                {
                  id: 'pro' as const,
                  name: 'Pro',
                  price: trialLabel(PLANS.pro.trialDays, PLANS.pro.priceCents),
                  highlight: true,
                  cta: ctaLabel(PLANS.pro.trialDays),
                  ctaStyle: { backgroundColor: 'var(--primary)', color: 'white' } as React.CSSProperties,
                  ctaClass: '',
                },
                {
                  id: 'premium' as const,
                  name: 'Premium',
                  price: trialLabel(PLANS.premium.trialDays, PLANS.premium.priceCents),
                  highlight: false,
                  cta: foundingOpen ? 'Claim free year' : 'Get Premium',
                  ctaStyle: { backgroundColor: 'var(--teal)', color: 'white' } as React.CSSProperties,
                  ctaClass: '',
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: plan.highlight ? 'var(--primary)' : 'var(--border)',
                    borderWidth: plan.highlight ? 2 : 1,
                  }}
                >
                  {plan.highlight && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      Most Popular
                    </span>
                  )}
                  <h3
                    className="text-[20px] font-bold mb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
                    {plan.price}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {FEATURES.map((f) => {
                      const included = plan.name === 'Basic' ? f.basic : plan.name === 'Pro' ? f.pro : f.premium;
                      return (
                        <li key={f.label} className="flex items-center gap-2 text-[13px]" style={{ color: included ? 'var(--text)' : 'var(--muted)', opacity: included ? 1 : 0.5 }}>
                          {included ? <Check size={14} style={{ color: 'var(--success)' }} /> : <XIcon size={14} />}
                          {f.label}
                        </li>
                      );
                    })}
                  </ul>
                  <PlanButton
                    plan={plan.id}
                    enabled={checkoutEnabled}
                    className={`block text-center rounded-full py-2.5 text-[14px] font-semibold ${plan.ctaClass}`}
                    style={plan.ctaStyle}
                  >
                    {plan.cta}
                  </PlanButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-14 px-4" aria-label="How it works">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-[26px] font-bold text-center mb-10"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: '📝',
                  title: 'Create your profile',
                  desc: 'Add photos, your menu, dietary info and social links. Takes less than 10 minutes.',
                },
                {
                  icon: '📍',
                  title: 'Update your location',
                  desc: 'Tap "I\'m Here!" when you start trading. Your live pin appears on the map instantly.',
                },
                {
                  icon: '🔍',
                  title: 'Get discovered',
                  desc: 'Hungry customers nearby find you on the map and come straight to your van.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="text-5xl mb-4" aria-hidden="true">
                    {icon}
                  </div>
                  <h3
                    className="text-[18px] font-bold mb-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* FAQ */}
        <section className="py-14 px-4" aria-label="Frequently asked questions">
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-[26px] font-bold text-center mb-10"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <details
                  key={q}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <summary
                    className="px-5 py-4 text-[15px] font-semibold cursor-pointer select-none list-none flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                  >
                    {q}
                    <span className="ml-3 flex-shrink-0 text-[20px]" style={{ color: 'var(--primary)' }} aria-hidden="true">+</span>
                  </summary>
                  <div
                    className="px-5 py-4 text-[14px] leading-relaxed"
                    style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-16 px-4 text-center"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--bg)) 0%, var(--bg) 70%)',
          }}
          aria-label="Sign up call to action"
        >
          <h2
            className="text-[28px] sm:text-[32px] font-extrabold mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            Ready to get started?
          </h2>
          <p className="text-[16px] mb-8" style={{ color: 'var(--muted)' }}>
            {foundingOpen
              ? `The first ${FOUNDING.spots} Tasmanian vendors get any plan free for 12 months. Sign up in a couple of minutes and we'll help set up your listing.`
              : 'Sign up in a couple of minutes and we\'ll help set up your listing.'}
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[16px] font-bold text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {foundingOpen ? 'Claim a founding spot' : 'Choose a plan'}
          </a>
          <p className="mt-3 text-[13px]" style={{ color: 'var(--muted)' }}>
            No credit card needed for free periods. Cancel any time.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
