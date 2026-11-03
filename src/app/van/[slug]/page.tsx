import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VendorProfile } from '@/components/vendor/VendorProfile';
import { SEED_VENDORS } from '@/lib/seed-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEED_VENDORS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = SEED_VENDORS.find((v) => v.slug === slug);
  if (!vendor) return { title: 'Vendor not found' };

  return {
    title: `${vendor.business_name} - Food Vans Near Me`,
    description:
      vendor.description?.slice(0, 155) ??
      `${vendor.business_name} is a mobile food vendor based in ${vendor.suburb}, ${vendor.state}.`,
  };
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;
  const vendor = SEED_VENDORS.find((v) => v.slug === slug);

  if (!vendor) notFound();

  const similar = SEED_VENDORS.filter(
    (v) =>
      v.id !== vendor.id &&
      v.cuisine_type.some((c) => vendor.cuisine_type.includes(c))
  ).slice(0, 4);

  return (
    <>
      <Header showSearch={false} />
      <main id="main-content">
        <VendorProfile vendor={vendor} similarVendors={similar} />
      </main>
      <Footer />
    </>
  );
}
