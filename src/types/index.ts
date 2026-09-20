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

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';

export type IPWStage = 
  | 'STAGE_1_DISCOVERY' 
  | 'STAGE_2_PRE_SALES' 
  | 'STAGE_3_CONTRACTING' 
  | 'STAGE_4_DELEGATION' 
  | 'STAGE_5_EXECUTION' 
  | 'STAGE_6_CLOSURE';

export type DocumentType = 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'HPP' | 'QA';

export interface ClientProject {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  progress: number; // 0 - 100
  status: ProjectStatus;
  ipwStage?: IPWStage;
  tierNumber?: 1 | 2 | 3 | 4 | 5;
  freelancerName?: string;
  freelancerFee?: number;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Electronic Signature & Audit Trail Data Models
export interface SignatureAuditTrail {
  signedAt: string;          // Tanggal & Jam (e.g. "16 September 2026, 08:30:15 WIB")
  ipAddress: string;         // IP Address (e.g. "180.252.88.192")
  userAgent: string;         // Browser / Device Info
  signedBy: string;          // Nama penandatangan
  signerRole: string;        // Jabatan / Peran (Pihak Pertama / Pihak Kedua)
  signedEmail?: string;      // Email penandatangan (opsional)
  documentHash: string;      // Verification Reference / Unique SHA Hash (e.g. "ATL-SIGN-K9X2-88F1")
}

export interface DigitalSignatureData {
  signatureBase64?: string; // Data URI Base64 PNG dari Canvas Drawing
  auditTrail?: SignatureAuditTrail;
}

// 1. Client Intake Form (CIF) Data Model
export interface CIFData {
  id: string;
  projectId?: string;
  docNumber: string;
  adminName: string;
  date: string;
  infoSource: string;
  clientName: string;
  picName: string;
  contact: string;
  industry: string;
  websiteUrl?: string;
  businessLocation: string;
  projectSummary: string;
  primaryGoals: string;
  targetAudience: string;
  tier: 'Tier 1: Starter' | 'Tier 2: Growth' | 'Tier 3: Profesional' | 'Tier 4: Enterprise' | 'Tier 5: Elite' | string;
  pageStructure: string;
  mainFeatures: string;
  techFramework: string;
  scopeOthers?: string; // Ruang Lingkup & Fitur: Lain-Lain
  brandingAssets: {
    logo: boolean;
    color: boolean;
    officialFont: boolean;
    others?: string;
  };
  visualStyle: string | { // Modern/Minimalis, Profesional/Korporasi, Elegant/Mewah, Lainnya
    modern?: boolean;
    professional?: boolean;
    elegant?: boolean;
    others?: string;
  };
  referenceWebsites: string[];
  contentAvailability: {
    general: 'Tersedia' | 'Tidak Tersedia' | 'Disediakan Developer' | string;
    copywriting: 'Tersedia' | 'Tidak Tersedia' | 'Disediakan Developer' | string;
    images: 'Tersedia' | 'Tidak Tersedia' | 'Disediakan Developer' | string;
  };
  estimatedBudget: number;
  additionalCosts?: number;
  paymentScheme: {
    dpPercent: number;
    midPercent?: number;
    finalPercent: number;
  };
  targetLaunchDate: string;
  additionalNotes?: string;
  additionalNotesTable?: Array<{ prihal: string; catatan: string }>;
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 2. Requirement Specification Document (RSD) Data Model
export interface RSDFeatureItem {
  id: string;
  featureCode: string; // e.g. ATL-001
  moduleArea: string;
  nameAndDesc: string;
  roleAccess: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RSDTechComponent {
  component: string; // e.g. Frontend Web, Backend API, Database Utama, Cache, Cloud
  techFramework: string;
  versionSpec: string;
  reason: string;
}

export interface RSDMilestone {
  name: string;
  scope: string;
  durationDays: number;
  targetDate: string;
}

export interface RSDData {
  id: string;
  projectId?: string;
  docCode: string; // .../ATL-RSD/.../20...
  clientName: string;
  clientPic?: string;
  clientContact?: string;
  issueDate: string;
  domain: string;
  emailPass: string;
  authorITLead: string;
  tier: string;
  freelancerName: string;
  businessContext: string;
  solutionSummary: string;
  projectGoals: string;
  inScope: string;
  outOfScope: string;
  techStack: RSDTechComponent[];
  functionalFeatures: RSDFeatureItem[];
  nonFunctional: {
    security: string;
    performance: string;
    availability: string;
    compatibility: string;
  };
  milestones: RSDMilestone[];
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 3. MoU (Memorandum of Understanding) Data Model
export interface MoUData {
  id: string;
  projectId?: string;
  docNumber: string; // .../MoU/ATL/.../20...
  date: string;
  dayName: string;
  monthName: string;
  yearName: string;
  atasilabsPic: string;
  atasilabsRole: string;
  clientCompany: string;
  clientAddress: string;
  clientPic: string;
  clientRole: string;
  tierCategory: 'Tier 1-2' | 'Tier 3-5';
  totalInvestment: number;
  totalInvestmentTerbilang: string;
  paymentScheme: {
    dpPercent: number;
    dpNominal: number;
    midPercent?: number;
    midNominal?: number;
    finalPercent: number;
    finalNominal: number;
  };
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  warrantyDays: number; // default 30
  revisionLimitDays: number;
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 4. Surat Perintah Kerja (SPK) Data Model
export interface SPKData {
  id: string;
  projectId?: string;
  spkNumber: string; // .../SPK-ATL/.../20...
  date: string;
  tier?: string;
  atasilabsPic: string;
  atasilabsRole: string;
  atasilabsAddress: string;
  atasilabsWhatsapp: string;
  atasilabsEmail: string;

  freelancerName: string;
  freelancerNik: string;
  freelancerAddress: string;
  freelancerWhatsapp: string;
  freelancerEmail: string;
  freelancerStatus: string;
  freelancerBankInfo: string;

  deadlineDate: string;
  totalNominal: number;
  totalNominalTerbilang: string;
  dpPercent: number; // default 40
  dpNominal: number;
  finalPercent: number; // default 60
  finalNominal: number;
  penaltyPerDayPercent: number; // 0.5%
  maxPenaltyPercent: number; // 10%
  revisionLimitCount: number;
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 5. Berita Acara Serah Terima (BAST) Data Model
export interface BASTData {
  id: string;
  projectId?: string;
  bastNumber: string; // .../BAST/ATL/.../20...
  date: string;
  atasilabsPic: string;
  atasilabsRole: string;
  atasilabsAddress?: string;
  clientCompany: string;
  clientAddress: string;
  clientPic: string;
  clientRole: string;
  mainUrl: string;
  sourceCodeAccess: string;
  adminPanelAccess: string;
  warrantyDays: number;
  locationCity: string; // Subang
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 5b. Quality Assurance & UAT Testing Checklist (QA) Data Model
export interface QATestItem {
  id: string;
  category: string;
  testCase: string;
  expectedResult: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  notes?: string;
}

export interface QAData {
  id: string;
  projectId?: string;
  docNumber: string;
  issueDate: string;
  clientName: string;
  projectTitle: string;
  qaLeadName: string;
  testerName: string;
  clientPic: string;
  stagingUrl: string;
  summary: string;
  testItems: QATestItem[];
  overallStatus: 'PASSED' | 'NEEDS_REVISION' | 'APPROVED' | 'FAILED';
  updatedAt: string;
  party1Signature?: DigitalSignatureData;
  party2Signature?: DigitalSignatureData;
}

// 6. HPP Financial Breakdown Data Model
export interface HPPItem {
  tierNumber: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  pageRange: string;
  developerFee: number;
  developerRole: string;
  domainHostingFee: number;
  domainHostingSpec: string;
  qaDeploymentFee: number;
  totalHPP: number;
  sellingPrice: number;
  grossProfit: number;
  grossProfitPercent: number;
  workingDays: string;
  profitAllocations: {
    marketing: number; // 17.5% of Gross Profit
    operational: number; // 5%
    businessDev: number; // 10%
    mitigation: number; // 5%
    zakat: number; // 2.5%
  };
}

export type UserRole = 'CEO' | 'CTO' | 'CMO' | 'ADMIN' | 'CLIENT' | 'FREELANCER' | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  phone?: string;
  company?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
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

export interface CompanyContact {
  companyName: string;
  subtitle: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappRaw: string;
  address: string;
  workingHours: string;
  facebookUrl: string;
  instagramUrl: string;
  ndaNotice: string;
  updatedAt?: string;
}


