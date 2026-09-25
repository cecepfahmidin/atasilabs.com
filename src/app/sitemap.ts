import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Refresh dynamic sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atasilabs.com';
  const currentDate = new Date();

  // Fetch dynamic data from Database
  let dbPortfolios: any[] = [];
  let dbPricing: any[] = [];

  try {
    const [sbPort, sbPricing] = await Promise.all([
      supabase.from('Portfolio').select('*').order('createdAt', { ascending: false }),
      supabase.from('PricingTier').select('*').order('tierNumber', { ascending: true }),
    ]);

    if (!sbPort.error && sbPort.data) {
      dbPortfolios = sbPort.data;
    } else {
      dbPortfolios = await prisma.portfolio.findMany({ orderBy: { createdAt: 'desc' } });
    }

    if (!sbPricing.error && sbPricing.data) {
      dbPricing = sbPricing.data;
    } else {
      dbPricing = await prisma.pricingTier.findMany({ orderBy: { tierNumber: 'asc' } });
    }
  } catch (error) {
    dbPortfolios = [];
    dbPricing = [];
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

