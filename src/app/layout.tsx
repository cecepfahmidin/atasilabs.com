import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/index.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.atasilabs.com'),
  title: 'AtasiLabs - Modern Web Development Studio & Enterprise Dashboard',
  description: 'Studio pengembangan aplikasi web full-stack profesional. Layanan pembuatan website, Landing Page, E-Commerce, dan Portal Enterprise.',
  keywords: ['website', 'landing page', 'E-Commerce', 'Portal Enterprise', 'AtasiLabs', 'Full-Stack Web Development', 'Jasa Pembuatan Website', 'Jasa Pembuatan Landing Page', 'Jasa Pembuatan E-Commerce', 'Jasa Pembuatan Portal Enterprise', 'Jasa Pembuatan Full-Stack Web Development', 'Jasa Pembuatan SaaS', 'Jasa Pembuatan Enterprise Dashboard', 'Jasa Pembuatan Aplikasi Web Full-Stack'],
  authors: [{ name: 'ATASILABS', url: 'https://www.atasilabs.com' }],
  publisher: 'ATASILABS',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'AtasiLabs - Modern Web Development Studio & Enterprise Dashboard',
    description: 'Studio pengembangan aplikasi web full-stack profesional. Layanan pembuatan website, Landing Page, E-Commerce, dan Portal Enterprise.',
    url: 'https://www.atasilabs.com',
    siteName: 'AtasiLabs',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'AtasiLabs Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AtasiLabs - Modern Web Development Studio',
    description: 'Studio pengembangan aplikasi web full-stack profesional.',
    images: ['/android-chrome-512x512.png'],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AtasiLabs',
  url: 'https://www.atasilabs.com',
  logo: 'https://www.atasilabs.com/android-chrome-512x512.png',
  image: 'https://www.atasilabs.com/android-chrome-512x512.png',
  description: 'Studio pengembangan aplikasi web full-stack profesional.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AtasiLabs',
  url: 'https://www.atasilabs.com',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <AppProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </AppProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

