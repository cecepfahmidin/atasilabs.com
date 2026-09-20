import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atasilabs.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/hpp', '/dashboard/master-data', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
