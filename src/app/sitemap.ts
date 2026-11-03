import type { MetadataRoute } from 'next';
import { SEED_VENDORS } from '@/lib/seed-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://foodvansnear.me';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/markets`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/join`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...SEED_VENDORS.map((v) => ({
      url: `${SITE_URL}/van/${v.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ];
}
