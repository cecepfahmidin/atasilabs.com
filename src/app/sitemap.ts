import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { INITIAL_PORTFOLIOS, INITIAL_PRICING_TIERS } from '@/data/initialData';

export const revalidate = 3600; // Refresh dynamic sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atasilabs.com';
  const currentDate = new Date();

  // Fetch dynamic data from PostgreSQL Database
  let dbPortfolios: any[] = [];
  let dbPricing: any[] = [];

  try {
    const [portfolios, pricing] = await Promise.all([
      prisma.portfolio.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.pricingTier.findMany({ orderBy: { tierNumber: 'asc' } }),
    ]);

    dbPortfolios = portfolios.length > 0 ? portfolios : INITIAL_PORTFOLIOS;
    dbPricing = pricing.length > 0 ? pricing : INITIAL_PRICING_TIERS;
  } catch (error) {
    dbPortfolios = INITIAL_PORTFOLIOS;
    dbPricing = INITIAL_PRICING_TIERS;
  }

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

  // Dynamic Portfolio Entries from Database
  const portfolioEntries: MetadataRoute.Sitemap = dbPortfolios.map((item) => ({
    url: `${baseUrl}/#portfolio-${item.id}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : (item.createdAt ? new Date(item.createdAt) : currentDate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Pricing Tier Entries from Database
  const pricingEntries: MetadataRoute.Sitemap = dbPricing.map((tier) => ({
    url: `${baseUrl}/#pricing-tier-${tier.tierNumber || tier.id}`,
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

