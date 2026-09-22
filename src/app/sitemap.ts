import { MetadataRoute } from 'next';
import { INITIAL_PORTFOLIOS, INITIAL_PRICING_TIERS } from '@/data/initialData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atasilabs.com';
  const currentDate = new Date();

  // Landing Page Main Navigation & Section Anchors
  const landingSections: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#testimonials`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/#workflow`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#architecture`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/#portfolio`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/#pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/#team`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

  // Dynamic Portfolio Entries from Landing Content
  const portfolioEntries: MetadataRoute.Sitemap = (INITIAL_PORTFOLIOS || []).map((item) => ({
    url: `${baseUrl}/#portfolio-${item.id}`,
    lastModified: item.createdAt ? new Date(item.createdAt) : currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Pricing Tier Entries from Landing Content
  const pricingEntries: MetadataRoute.Sitemap = (INITIAL_PRICING_TIERS || []).map((tier) => ({
    url: `${baseUrl}/#pricing-tier-${tier.tierNumber}`,
    lastModified: tier.updatedAt ? new Date(tier.updatedAt) : currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Application & Portal Access Pages
  const portalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  return [...landingSections, ...pricingEntries, ...portfolioEntries, ...portalPages];
}
