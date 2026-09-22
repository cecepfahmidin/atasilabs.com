import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import '@/index.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'AtasiLabs - Modern Web Development Studio & Enterprise Dashboard',
  description: 'Studio pengembangan aplikasi web full-stack profesional. Layanan pembuatan website, Landing Page, E-Commerce, dan Portal Enterprise.',
  keywords: ['website', 'landing page', 'E-Commerce', 'Portal Enterprise', 'AtasiLabs', 'Full-Stack Web Development', 'Jasa Pembuatan Website', 'Jasa Pembuatan Landing Page', 'Jasa Pembuatan E-Commerce', 'Jasa Pembuatan Portal Enterprise', 'Jasa Pembuatan Full-Stack Web Development', 'Jasa Pembuatan SaaS', 'Jasa Pembuatan Enterprise Dashboard', 'Jasa Pembuatan Aplikasi Web Full-Stack'],
  authors: [{ name: 'ATASILABS', url: 'https://www.atasilabs.com' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
