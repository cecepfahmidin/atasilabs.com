import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import '@/index.css';

export const metadata: Metadata = {
  title: 'AtasiLabs - Modern Web Development Studio & Enterprise Dashboard (Next.js, Prisma, Supabase)',
  description: 'Studio pengembangan aplikasi web full-stack profesional berbasis Next.js App Router, Prisma ORM, dan Supabase PostgreSQL. Layanan pembuatan SaaS, E-Commerce, dan Portal Enterprise.',
  keywords: ['Next.js', 'Prisma ORM', 'Supabase', 'PostgreSQL', 'Material UI', 'React 19', 'Full-Stack Web Development', 'AtasiLabs'],
  authors: [{ name: 'Cecep Fahmidin', url: 'https://atasilabs.com' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
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
