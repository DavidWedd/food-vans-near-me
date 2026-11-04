import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://foodvansnear.me';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/vendor', '/admin', '/auth', '/api', '/join/welcome'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
