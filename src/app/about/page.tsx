import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/layout/ContentPage';
import { BUSINESS, BUSINESS_LINE } from '@/lib/business';

export const metadata: Metadata = {
  title: 'About - Food Vans Near Me',
  description: "Food Vans Near Me is Tasmania's food van map, made in Hobart.",
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <ContentPage title="About Food Vans Near Me" intro="Tasmania's food van map, made in Hobart.">
      <p>
        Tasmania has brilliant food vans, coffee carts and mobile food businesses. Finding them is the hard
        part: they move around, and their plans are spread across Facebook posts, Instagram stories and
        market line-ups.
      </p>
      <p>
        {BUSINESS.tradingName} puts them all on one map. You can see who&apos;s trading near you right now,
        where your favourites will be this week, and which markets to head to.
      </p>

      <h2>For food lovers</h2>
      <p>
        Free, with no app to download. Search your suburb or tap &quot;Near me&quot;, then filter by what you
        feel like, what you can eat and how you want to pay.
      </p>

      <h2>For vendors</h2>
      <p>
        A simple way to tell customers where you are, without another app to manage. Update your location
        from your phone in seconds and get found by people nearby.{' '}
        <Link href="/join">See how it works and our founding-vendor offer</Link>.
      </p>

      <h2>Starting in Tasmania</h2>
      <p>
        We&apos;re starting right across Tasmania, and we&apos;ll bring the map to the rest of
        Australia once it&apos;s working well here.
      </p>

      <h2>Who we are</h2>
      <p>
        {BUSINESS_LINE}, a Hobart business that also runs the Tasmanian events guide Tasguide. Questions or
        ideas? <Link href="/contact">Get in touch</Link>.
      </p>
    </ContentPage>
  );
}
