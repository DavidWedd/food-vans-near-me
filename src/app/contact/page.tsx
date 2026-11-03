import type { Metadata } from 'next';
import { ContentPage } from '@/components/layout/ContentPage';
import { BUSINESS, FOUNDING_SPOT_MAILTO } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Contact - Food Vans Near Me',
  description: 'Get in touch with Food Vans Near Me.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <ContentPage title="Contact us" intro="We'd love to hear from you.">
      <h2>Email</h2>
      <p>
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>

      <h2>Run a food van or mobile food business?</h2>
      <p>
        We&apos;re signing up our founding vendors now.{' '}
        <a href={FOUNDING_SPOT_MAILTO}>Email us to claim a founding spot</a> and we&apos;ll get you set up.
      </p>

      <h2>Spotted something wrong?</h2>
      <p>
        If a listing or market detail is out of date, email us with the details and we&apos;ll fix it.
      </p>

      <h2>Post</h2>
      <p>
        {BUSINESS.legalName} trading as {BUSINESS.tradingName}
        <br />
        {BUSINESS.postalAddress}
        <br />
        ABN {BUSINESS.abn}
      </p>
    </ContentPage>
  );
}
