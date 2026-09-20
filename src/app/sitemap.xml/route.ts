import { NextResponse } from 'next/server';
import { INITIAL_PORTFOLIOS, INITIAL_PRICING_TIERS } from '@/data/initialData';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atasilabs.com';
  const lastMod = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${baseUrl}`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/#services`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/#workflow`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/#architecture`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${baseUrl}/#portfolio`, priority: '0.95', changefreq: 'daily' },
    { loc: `${baseUrl}/#pricing`, priority: '0.95', changefreq: 'weekly' },
    { loc: `${baseUrl}/#faq`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/#contact`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/login`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/dashboard`, priority: '0.7', changefreq: 'daily' },
  ];

  const pricingUrls = (INITIAL_PRICING_TIERS || []).map((tier) => ({
    loc: `${baseUrl}/#pricing-tier-${tier.tierNumber}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const portfolioUrls = (INITIAL_PORTFOLIOS || []).map((item) => ({
    loc: `${baseUrl}/#portfolio-${item.id}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const allUrls = [...staticUrls, ...pricingUrls, ...portfolioUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
