import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/layout/ContentPage';
import { BUSINESS, BUSINESS_LINE, LEGAL_LAST_UPDATED } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy - Food Vans Near Me',
  description: 'How Food Vans Near Me collects, uses and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      intro={`${BUSINESS_LINE}. This policy explains what personal information we collect, why, and what you can do about it.`}
      updated={LEGAL_LAST_UPDATED}
    >
      <p>
        In this policy, &quot;we&quot;, &quot;us&quot; and &quot;our&quot; mean {BUSINESS.legalName} trading as{' '}
        {BUSINESS.tradingName}. We handle personal information in line with the Privacy Act 1988 (Cth)
        and the Australian Privacy Principles.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>If you browse the site</strong>, you don&apos;t need an account. We collect:
      </p>
      <ul>
        <li>
          <strong>Your location, only if you tap &quot;Near me&quot;</strong> and allow it in your browser.
          It is used in your browser to show vans near you. We don&apos;t store your exact location. We record
          only the general area (rounded to about 1km) and the time of the search, with nothing that identifies
          you, so vendors can see when and where people look for food vans.
        </li>
        <li>
          <strong>What you type into the search box.</strong> Suburb and postcode searches are sent to our map
          provider, Mapbox, to find the place on the map. We keep the place name and its general area, without
          anything that identifies you.
        </li>
        <li>
          <strong>Anonymous counts of what&apos;s popular.</strong> When you view a van&apos;s page, tap its pin
          or tap its contact links, we count it for that vendor&apos;s stats. These counts don&apos;t include who
          you are.
        </li>
        <li>
          <strong>Booking enquiries.</strong> If you use a van&apos;s &quot;Book this van&quot; form, we keep what
          you enter (name, email, phone if given, event details and message) and send it to that vendor so they
          can reply to you. The vendor then deals with you directly.
        </li>
        <li>
          <strong>Listing reports.</strong> If you tell us something is wrong with a listing, we keep what you
          wrote and your email if you give it, so we can check and reply.
        </li>
        <li>
          <strong>Basic technical information</strong> that any website receives, such as your IP address,
          browser type and the pages you visit. Our hosting provider keeps this in server logs for security
          and to keep the site running. We count visits with Vercel Web Analytics, which doesn&apos;t use
          cookies and doesn&apos;t identify you.
        </li>
      </ul>
      <p>
        <strong>If you create an account to save vans or leave reviews</strong>, we collect your email address,
        the vans you save and whether you want trading alerts, and any reviews you write. Reviews are public and
        show the name you choose. We email you when a van you saved starts trading (at most once a day per van),
        and every email has a link to stop them.
      </p>
      <p>
        <strong>If you list a food van or other mobile food business</strong>, we also collect:
      </p>
      <ul>
        <li>your name, business name, ABN, email address and phone number</li>
        <li>
          your business profile: description, menu, photos, payment methods, dietary information, social
          media links and trading schedule
        </li>
        <li>
          your trading locations, when you share them (for example by tapping &quot;I&apos;m here&quot;), and
          when they were updated
        </li>
        <li>
          billing details for paid plans. Card payments are handled by Stripe. We never see or store your full
          card number.
        </li>
        <li>emails and messages you send us</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>to show food vans and markets on the map and in search results</li>
        <li>to publish vendor profiles and trading locations, which vendors choose to share publicly</li>
        <li>to set up and manage vendor accounts, subscriptions, invoices and support</li>
        <li>to send service emails, such as account, billing and trial-ending notices</li>
        <li>
          to send news or offers, only if you&apos;ve agreed. Every marketing email has an unsubscribe link,
          in line with the Spam Act 2003
        </li>
        <li>to keep the site secure, prevent misuse and improve how it works</li>
      </ul>

      <h2>What is public</h2>
      <p>
        Vendor profiles are public. That includes business name, photos, menu, schedule, payment methods,
        social links and current trading location while a vendor is marked as trading. A vendor&apos;s
        private contact details and ABN are not shown publicly unless the vendor chooses to show them.
      </p>

      <h2>Who we share it with</h2>
      <p>We don&apos;t sell personal information. We share it only with service providers who help us run the site:</p>
      <ul>
        <li>Vercel - website hosting</li>
        <li>Mapbox - maps and place search</li>
        <li>Supabase - our database (data stored in Sydney, Australia)</li>
        <li>Stripe - payments</li>
        <li>Resend - sending emails</li>
      </ul>
      <p>
        Some of these providers are based in, or process information in, the United States and other
        countries. We choose providers with strong security and privacy commitments. We may also disclose
        information if the law requires it.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        The site saves your light or dark mode choice in your browser&apos;s local storage. We use essential
        cookies to keep you logged in if you have an account. We don&apos;t use advertising or tracking cookies.
      </p>

      <h2>Keeping it secure</h2>
      <p>
        We use reputable providers, encrypted connections (HTTPS) and access controls to protect personal
        information. We keep it only as long as we need it, then delete or de-identify it. If you close a
        vendor account, we remove your public profile and keep only what we must for tax and legal reasons.
      </p>

      <h2>Accessing or correcting your information</h2>
      <p>
        You can ask to see or correct the personal information we hold about you, or ask us to delete it, by
        emailing <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Vendors can update most of their
        details in their account.
      </p>

      <h2>Complaints</h2>
      <p>
        If you&apos;re unhappy with how we&apos;ve handled your personal information, contact us first at{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. We&apos;ll respond within 30 days. If
        you&apos;re still not satisfied, you can contact the Office of the Australian Information
        Commissioner at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as the site grows. The date at the top shows when it last changed. We&apos;ll
        email vendors about significant changes.
      </p>

      <h2>Contact us</h2>
      <p>
        {BUSINESS.legalName} trading as {BUSINESS.tradingName}
        <br />
        ABN {BUSINESS.abn}
        <br />
        {BUSINESS.postalAddress}
        <br />
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
      <p>
        See also our <Link href="/terms">Terms of Use</Link>.
      </p>
    </ContentPage>
  );
}
