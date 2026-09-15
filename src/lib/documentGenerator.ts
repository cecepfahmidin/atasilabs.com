import { ClientProject, CIFData, RSDData, MoUData, SPKData, BASTData } from '../types';

export function numberToWordsIDR(amount: number): string {
  if (amount <= 0) return 'Nol Rupiah';
  if (amount === 45000000) return 'Empat Puluh Lima Juta Rupiah';
  if (amount === 22000000) return 'Dua Puluh Dua Juta Rupiah';
  if (amount === 60000000) return 'Enam Puluh Juta Rupiah';
  if (amount === 32000000) return 'Tiga Puluh Dua Juta Rupiah';
  if (amount === 12000000) return 'Dua Belas Juta Rupiah';

  const juta = Math.floor(amount / 1000000);
  const ribu = Math.floor((amount % 1000000) / 1000);
  if (juta > 0) {
    return `${juta} Juta ${ribu > 0 ? ribu + ' Ribu' : ''} Rupiah`;
  }
  return `${ribu} Ribu Rupiah`;
}

export function inferTierFromBudget(budget: number): { tierName: string; isTier1_2: boolean; num: 1 | 2 | 3 | 4 | 5 } {
  if (budget <= 3000000) return { tierName: 'Tier 1: Starter', isTier1_2: true, num: 1 };
  if (budget <= 8000000) return { tierName: 'Tier 2: Growth', isTier1_2: true, num: 2 };
  if (budget <= 25000000) return { tierName: 'Tier 3: Profesional', isTier1_2: false, num: 3 };
  if (budget <= 50000000) return { tierName: 'Tier 4: Enterprise', isTier1_2: false, num: 4 };
  return { tierName: 'Tier 5: Elite', isTier1_2: false, num: 5 };
}

export function generateAutoDocumentsForProject(proj: ClientProject) {
  const cleanId = proj.id.replace(/\D/g, '') || '1';
  const indexStr = cleanId.padStart(3, '0').slice(-3);
  const year = new Date().getFullYear();
  const dateStr = new Date().toISOString().split('T')[0];
  const { tierName, isTier1_2 } = inferTierFromBudget(proj.budget);
  const budgetWords = numberToWordsIDR(proj.budget);
  const devFee = proj.freelancerFee || Math.round(proj.budget * 0.35);

  const cif: CIFData = {
    id: `cif-${proj.id}`,
    projectId: proj.id,
    docNumber: `${indexStr}/CIF/ATL/III/${year}`,
    adminName: 'Cecep Fahmidin',
    date: dateStr,
    infoSource: 'Registrasi Proyek Baru / System Auto-Gen',
    clientName: proj.clientName,
    picName: proj.clientName + ' (PIC Utama)',
    contact: proj.clientEmail + (proj.clientPhone ? ` / ${proj.clientPhone}` : ''),
    industry: 'Teknologi & Digital Solution',
    websiteUrl: `https://${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    businessLocation: 'Jakarta / Indonesia',
    projectSummary: proj.description,
    primaryGoals: `Membangun platform ${proj.title} berkinerja tinggi berbasis Next.js & Supabase.`,
    targetAudience: 'Pengguna bisnis, konsumen akhir, & manajemen operasional internal.',
    tier: tierName,
    pageStructure: '1) Halaman Utama, 2) Dashboard Admin, 3) Form Transaksi, 4) Laporan & Analitik',
    mainFeatures: 'Autentikasi Supabase RLS, Management User RBAC, Visualisasi Recharts, Eksport PDF/Excel',
    techFramework: 'Next.js 14 App Router, Material UI, Prisma ORM, Supabase Cloud',
    brandingAssets: { logo: true, color: true, officialFont: true },
    visualStyle: 'Modern/Minimalis & Profesional',
    referenceWebsites: ['https://atasilabs.com', 'https://vercel.com'],
    contentAvailability: { general: 'Tersedia', copywriting: 'Disediakan Developer', images: 'Tersedia' },
    estimatedBudget: proj.budget,
    paymentScheme: isTier1_2
      ? { dpPercent: 50, finalPercent: 50 }
      : { dpPercent: 30, midPercent: 30, finalPercent: 40 },
    targetLaunchDate: proj.deadline,
    updatedAt: new Date().toISOString(),
  };

  const rsd: RSDData = {
    id: `rsd-${proj.id}`,
    projectId: proj.id,
    docCode: `${indexStr}/ATL-RSD/III/${year}`,
    clientName: proj.clientName,
    issueDate: dateStr,
    domain: `${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.atasilabs.com`,
    emailPass: `admin@${proj.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com / ********`,
    authorITLead: 'Cecep Fahmidin (IT Lead Atasilabs)',
    tier: tierName,
    freelancerName: proj.freelancerName || 'Senior Fullstack Freelancer',
    businessContext: `Proyek ${proj.title} dikembangkan untuk mendukung kegiatan bisnis ${proj.clientName}.`,
    solutionSummary: proj.description,
    projectGoals: `Menyelesaikan sistem ${proj.title} tepat waktu sebelum ${proj.deadline}.`,
    inScope: 'Development Frontend Next.js, API Route Handlers, PostgreSQL Supabase RLS, & Live Deployment.',
    outOfScope: 'Mobile Native iOS/Android App, Integrasi Hardware POS.',
    techStack: [
      { component: 'Frontend Web', techFramework: 'Next.js 14 App Router', versionSpec: 'v14.2+', reason: 'Performa SSR & SEO 95+' },
      { component: 'Backend API', techFramework: 'Next.js Route Handlers', versionSpec: 'v20.x', reason: 'Integrasi native' },
      { component: 'Database Utama', techFramework: 'PostgreSQL Supabase', versionSpec: 'v15.x', reason: 'RLS Security Policies' },
    ],
    functionalFeatures: [
      { id: 'f1', featureCode: 'ATL-001', moduleArea: 'Autentikasi', nameAndDesc: 'Login, Register, OTP Email', roleAccess: 'All User', priority: 'High' },
      { id: 'f2', featureCode: 'ATL-002', moduleArea: 'User Management', nameAndDesc: 'Kelola Profil & Penetapan Role RBAC', roleAccess: 'Admin', priority: 'High' },
      { id: 'f3', featureCode: 'ATL-003', moduleArea: 'Dashboard Utama', nameAndDesc: 'Visualisasi Grafik & Statistik Ringkasan', roleAccess: 'Admin / Manager', priority: 'Medium' },
      { id: 'f4', featureCode: 'ATL-004', moduleArea: 'Manajemen Transaksi', nameAndDesc: 'Pencatatan data & ekspor laporan PDF/Excel', roleAccess: 'Admin / Finance', priority: 'High' },
    ],
    nonFunctional: {
      security: 'Enkripsi HTTPS, Password Hashing, Supabase RLS Policies',
      performance: 'API Response Time <= 2s, Page Load <= 3s',
      availability: 'Target uptime 99.5%',
      compatibility: 'Multi-browser & Mobile Responsive',
    },
    milestones: [
      { name: 'Milestone 1: Discovery & Setup', scope: 'Finalisasi skema & RSD', durationDays: 5, targetDate: dateStr },
      { name: 'Milestone 2: Execution & Testing', scope: 'Coding & Quality Assurance', durationDays: 14, targetDate: proj.deadline },
    ],
    updatedAt: new Date().toISOString(),
  };

  const mou: MoUData = {
    id: `mou-${proj.id}`,
    projectId: proj.id,
    docNumber: `${indexStr}/MoU/ATL/III/${year}`,
    date: dateStr,
    dayName: 'Senin',
    monthName: 'Maret',
    yearName: `${year}`,
    atasilabsPic: 'Cecep Fahmidin',
    atasilabsRole: 'Founder & Tech Lead',
    clientCompany: proj.clientName,
    clientAddress: 'Indonesia',
    clientPic: proj.clientName,
    clientRole: 'Direktur / Owner',
    tierCategory: isTier1_2 ? 'Tier 1-2' : 'Tier 3-5',
    totalInvestment: proj.budget,
    totalInvestmentTerbilang: budgetWords,
    paymentScheme: isTier1_2
      ? { dpPercent: 50, dpNominal: Math.round(proj.budget * 0.5), finalPercent: 50, finalNominal: Math.round(proj.budget * 0.5) }
      : { dpPercent: 30, dpNominal: Math.round(proj.budget * 0.3), midPercent: 30, midNominal: Math.round(proj.budget * 0.3), finalPercent: 40, finalNominal: Math.round(proj.budget * 0.4) },
    bankAccount: {
      bankName: 'Bank Rakyat Indonesia (BRI)',
      accountNumber: '4388-01-00025-56-7',
      accountHolder: 'PT AULIA INDOLAND GRUP',
    },
    warrantyDays: 30,
    revisionLimitDays: 14,
    updatedAt: new Date().toISOString(),
  };

  const spk: SPKData = {
    id: `spk-${proj.id}`,
    projectId: proj.id,
    spkNumber: `${indexStr}/SPK-ATL/III/${year}`,
    date: dateStr,
    atasilabsPic: 'Cecep Fahmidin',
    atasilabsRole: 'IT Lead & Managing Director',
    atasilabsAddress: 'Jl. Cinangsi RT 003 RW 001, Subang, Jawa Barat',
    atasilabsWhatsapp: '0812-9876-5432',
    atasilabsEmail: 'cecepfahmidin@gmail.com',
    freelancerName: proj.freelancerName || 'Freelancer Partner',
    freelancerNik: '3213000000000000',
    freelancerAddress: 'Bandung, Jawa Barat',
    freelancerWhatsapp: '0857-0000-0000',
    freelancerEmail: 'freelancer@atasilabs.com',
    freelancerStatus: 'Fullstack Developer (Freelance Partner)',
    freelancerBankInfo: 'BCA 8400-000-000 a.n. Developer',
    deadlineDate: proj.deadline,
    totalNominal: devFee,
    totalNominalTerbilang: numberToWordsIDR(devFee),
    dpPercent: 40,
    dpNominal: Math.round(devFee * 0.4),
    finalPercent: 60,
    finalNominal: Math.round(devFee * 0.6),
    penaltyPerDayPercent: 0.5,
    maxPenaltyPercent: 10,
    revisionLimitCount: 3,
    updatedAt: new Date().toISOString(),
  };

  const bast: BASTData = {
    id: `bast-${proj.id}`,
    projectId: proj.id,
    bastNumber: `${indexStr}/BAST/ATL/III/${year}`,
    date: proj.deadline,
    atasilabsPic: 'Cecep Fahmidin',
    atasilabsRole: 'Tech Lead Atasilabs',
    clientCompany: proj.clientName,
    clientAddress: 'Indonesia',
    clientPic: proj.clientName,
    clientRole: 'Direktur / Owner',
    mainUrl: `https://${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    sourceCodeAccess: `https://github.com/atasilabs-clients/${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    adminPanelAccess: `https://${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/dashboard`,
    warrantyDays: 30,
    locationCity: 'Subang',
    updatedAt: new Date().toISOString(),
  };

  return { cif, rsd, mou, spk, bast };
}
