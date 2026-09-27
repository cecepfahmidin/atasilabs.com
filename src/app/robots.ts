import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atasilabs.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/'],
        disallow: ['/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/'],
        disallow: ['/dashboard/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
