import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Food Vans Near Me',
    short_name: 'Food Vans',
    description: "Tasmania's food van map - see who's trading near you right now.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF6EB',
    theme_color: '#E07B00',
    lang: 'en-AU',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
