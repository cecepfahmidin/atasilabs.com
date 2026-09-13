export type LeadStatus = 'NEW' | 'READ' | 'ARCHIVED';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  serviceType?: string;
  budget?: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  category: 'Full-Stack' | 'Dashboard SaaS' | 'E-Commerce' | 'Mobile-Web';
  imageUrl: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface ClientProject {
  id: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  progress: number; // 0 - 100
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DEVELOPER';
  avatarUrl?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  iconName: string;
  techTags: string[];
}

export interface PricingSpecItem {
  label: string;
  value: string;
  included?: boolean;
}

export interface PricingTier {
  id: string;
  tierNumber: 1 | 2 | 3 | 4 | 5;
  name: 'Starter' | 'Growth' | 'Profesional' | 'Enterprise' | 'Elite' | string;
  tagline: string;
  price: number; // in IDR
  priceBilling: string; // e.g., 'mulai dari' or 'per proyek' or 'sekali bayar'
  popular?: boolean;
  highlightBadge?: string;
  deliveryTime: string;
  revisionCount: string;
  features: string[];
  specs: PricingSpecItem[];
  idealFor: string;
  ctaText: string;
  updatedAt: string;
}
