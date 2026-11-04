import HomeClient from '@/components/home/HomeClient';
import { getPublicVendors } from '@/lib/vendors';

// Refresh at least every 30 seconds so "I'm here" pins show up quickly.
export const revalidate = 30;

export default async function HomePage() {
  const vendors = await getPublicVendors();
  return <HomeClient vendors={vendors} />;
}
