import MarketsClient from '@/components/home/MarketsClient';
import { getPublicVendors } from '@/lib/vendors';

export const revalidate = 60;

export default async function MarketsPage() {
  const vendors = await getPublicVendors();
  return <MarketsClient vendors={vendors} />;
}
