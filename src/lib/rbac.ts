import { UserRole } from '../types';

export interface RoleConfig {
  role: UserRole;
  label: string;
  badgeColor: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  hexColor: string;
  description: string;
  permissions: {
    overview: boolean;
    leads: boolean;
    projects: boolean;
    documents: boolean;
    portfolio: boolean;
    pricing: boolean;
    contact: boolean;
    testimonials: boolean;
    team: boolean;
    users: boolean;
    schema: boolean;
    hpp: boolean;
    masterData: boolean;
    // Granular permissions
    hppFinancials: boolean; // Internal HPP Profit Matrix & Developer Fees
    freelancerFees: boolean; // SPK Fee Rates
    clientPricingMoU: boolean; // MoU Contract Values
    leadManagement: boolean; // Raw Leads
    userManagement: boolean; // Manage & Edit Users
    systemSettings: boolean; // Schema & Prisma DB
  };
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  CEO: {
    role: 'CEO',
    label: 'Chief Executive Officer',
    badgeColor: 'warning',
    hexColor: '#f59e0b',
    description: 'Direktur Utama. Akses penuh ke seluruh statistik bisnis, margin keuangan HPP, dokumen legal, dan manajemen tim.',
    permissions: {
      overview: true,
      leads: true,
      projects: true,
      documents: true,
      portfolio: true,
      pricing: true,
      contact: true,
      testimonials: true,
      team: true,
      users: true,
      schema: true,
      hpp: true,
      masterData: true,
      hppFinancials: true,
      freelancerFees: true,
      clientPricingMoU: true,
      leadManagement: true,
      userManagement: true,
      systemSettings: true,
    },
  },
  CTO: {
    role: 'CTO',
    label: 'Chief Technology Officer',
    badgeColor: 'primary',
    hexColor: '#3b82f6',
    description: 'Direktur Teknologi. Bertanggung jawab atas spesifikasi teknis (RSD), alur kerja IPW 6-Stage, SPK Freelancer, BAST, dan arsitektur database.',
    permissions: {
      overview: true,
      leads: true,
      projects: true,
      documents: true,
      portfolio: true,
      pricing: true,
      contact: true,
      testimonials: true,
      team: true,
      users: true,
      schema: true,
      hpp: true,
      masterData: true,
      hppFinancials: true, // Needs fee structure
      freelancerFees: true,
      clientPricingMoU: true,
      leadManagement: false,
      userManagement: true,
      systemSettings: true,
    },
  },
  CMO: {
    role: 'CMO',
    label: 'Chief Marketing Officer',
    badgeColor: 'secondary',
    hexColor: '#ec4899',
    description: 'Direktur Pemasaran & Penjualan. Mengelola Lead inbound, form CIF, kontrak bisnis MoU (Tier 1-5), portofolio, dan strategi pricing.',
    permissions: {
      overview: true,
      leads: true,
      projects: true,
      documents: true,
      portfolio: true,
      pricing: true,
      contact: true,
      testimonials: true,
      team: true,
      users: false,
      schema: false,
      hpp: false,
      masterData: true,
      hppFinancials: false, // Hidden from CMO
      freelancerFees: false,
      clientPricingMoU: true,
      leadManagement: true,
      userManagement: false,
      systemSettings: false,
    },
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'System Administrator',
    badgeColor: 'info',
    hexColor: '#06b6d4',
    description: 'Administrator Operasional. Pengelolaan data sistem harian, penerbitan dokumen otomatis, otentikasi user, dan manajemen status proyek.',
    permissions: {
      overview: true,
      leads: true,
      projects: true,
      documents: true,
      portfolio: true,
      pricing: true,
      contact: true,
      testimonials: true,
      team: true,
      users: true,
      schema: true,
      hpp: true,
      masterData: true,
      hppFinancials: true,
      freelancerFees: true,
      clientPricingMoU: true,
      leadManagement: true,
      userManagement: true,
      systemSettings: true,
    },
  },
  CLIENT: {
    role: 'CLIENT',
    label: 'Klien / Enterprise Customer',
    badgeColor: 'success',
    hexColor: '#10b981',
    description: 'Portal Khusus Klien. Memantau progres proyek milik sendiri, melihat dokumen CIF, MoU, dan penyerahan BAST aset digital.',
    permissions: {
      overview: true,
      leads: false,
      projects: true,
      documents: true,
      portfolio: false,
      pricing: false,
      contact: false,
      testimonials: false,
      team: false,
      users: false,
      schema: false,
      hpp: false,
      masterData: false, // Strictly Hidden
      hppFinancials: false, // Strictly Hidden
      freelancerFees: false, // Strictly Hidden
      clientPricingMoU: true,
      leadManagement: false,
      userManagement: false,
      systemSettings: false,
    },
  },
  FREELANCER: {
    role: 'FREELANCER',
    label: 'Mitra / Freelance Developer',
    badgeColor: 'default',
    hexColor: '#8b5cf6',
    description: 'Portal Mitra Developer. Mengakses dokumen teknis RSD, Surat Perintah Kerja (SPK), perincian fee pengerjaan (40/60), dan checklist BAST.',
    permissions: {
      overview: true,
      leads: false,
      projects: true,
      documents: true,
      portfolio: false,
      pricing: false,
      contact: false,
      testimonials: false,
      team: false,
      users: false,
      schema: false,
      hpp: false,
      masterData: false, // Strictly Hidden
      hppFinancials: false, // Strictly Hidden
      freelancerFees: true, // Only own SPK fee
      clientPricingMoU: false, // Hidden
      leadManagement: false,
      userManagement: false,
      systemSettings: false,
    },
  },
  DEVELOPER: {
    role: 'DEVELOPER',
    label: 'In-House Developer',
    badgeColor: 'info',
    hexColor: '#0284c7',
    description: 'Developer Internal Atasilabs. Mengakses spesifikasi teknis (RSD), alur pengerjaan proyek, dokumen SPK, dan testing/deployment.',
    permissions: {
      overview: true,
      leads: false,
      projects: true,
      documents: true,
      portfolio: true,
      pricing: false,
      contact: false,
      testimonials: true,
      team: true,
      users: false,
      schema: true,
      hpp: false,
      masterData: true,
      hppFinancials: false,
      freelancerFees: true,
      clientPricingMoU: false,
      leadManagement: false,
      userManagement: false,
      systemSettings: false,
    },
  },
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  CEO: { ...ROLE_CONFIGS.CEO.permissions },
  CTO: { ...ROLE_CONFIGS.CTO.permissions },
  CMO: { ...ROLE_CONFIGS.CMO.permissions },
  ADMIN: { ...ROLE_CONFIGS.ADMIN.permissions },
  CLIENT: { ...ROLE_CONFIGS.CLIENT.permissions },
  FREELANCER: { ...ROLE_CONFIGS.FREELANCER.permissions },
  DEVELOPER: { ...ROLE_CONFIGS.DEVELOPER.permissions },
};

export const hasPermission = (role: UserRole, key: string, customMap?: Record<UserRole, Record<string, boolean>>): boolean => {
  const normKey = key === 'master-data' ? 'masterData' : key;
  if (customMap && customMap[role]) {
    if (customMap[role][normKey] !== undefined) {
      return !!customMap[role][normKey];
    }
    if (customMap[role][key] !== undefined) {
      return !!customMap[role][key];
    }
  }
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  if ((config.permissions as any)[normKey] !== undefined) {
    return !!(config.permissions as any)[normKey];
  }
  if ((config.permissions as any)[key] !== undefined) {
    return !!(config.permissions as any)[key];
  }
  return false;
};
