import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://foodvansnear.me';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Food Vans Near Me - Tasmania\'s food van map',
  description:
    'Find food vans, coffee carts and market stalls trading near you in Tasmania. Search by suburb, see who\'s open now and find them at Hobart and Launceston markets.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Food Vans Near Me - Tasmania\'s food van map',
    description: 'Find food vans, coffee carts and market stalls trading near you in Tasmania.',
    url: SITE_URL,
    siteName: 'Food Vans Near Me',
    type: 'website',
    locale: 'en_AU',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* Anti-flash theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fvnm-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        {/* Font preconnect */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        {/* Fonts */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
        />
      </head>
      <body className="transition-theme">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
