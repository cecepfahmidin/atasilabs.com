import { ClientProject, CIFData, RSDData, MoUData, SPKData, BASTData, QAData, QATestItem } from '../types';
import { getFreelancerFeeForTier } from './pricingUtils';

export function numberToWordsIDR(amount: number): string {
  if (!amount || amount <= 0) return 'Nol Rupiah';

  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 12) return units[n];
    if (n < 20) return units[n - 10] + ' Belas';
    if (n < 100) return units[Math.floor(n / 10)] + ' Puluh' + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 200) return 'Seratus' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    return units[Math.floor(n / 100)] + ' Ratus' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  }

  function convert(n: number): string {
    if (n === 0) return 'Nol';
    let str = '';
    if (n >= 1000000000) {
      const milyar = Math.floor(n / 1000000000);
      str += convertLessThanThousand(milyar) + ' Miliar ';
      n %= 1000000000;
    }
    if (n >= 1000000) {
      const juta = Math.floor(n / 1000000);
      str += convertLessThanThousand(juta) + ' Juta ';
      n %= 1000000;
    }
    if (n >= 1000) {
      const ribu = Math.floor(n / 1000);
      if (ribu === 1) {
        str += 'Seribu ';
      } else {
        str += convertLessThanThousand(ribu) + ' Ribu ';
      }
      n %= 1000;
    }
    if (n > 0) {
      str += convertLessThanThousand(n) + ' ';
    }
    return str.trim();
  }

  const words = convert(Math.floor(amount));
  return words ? `${words} Rupiah` : 'Nol Rupiah';
}

export function inferTierFromBudget(budget: number): { tierName: string; isTier1_2: boolean; num: 1 | 2 | 3 | 4 | 5 } {
  if (budget <= 6000000) return { tierName: 'Tier 1: Starter', isTier1_2: true, num: 1 };
  if (budget <= 14000000) return { tierName: 'Tier 2: Growth', isTier1_2: true, num: 2 };
  if (budget <= 28000000) return { tierName: 'Tier 3: Profesional', isTier1_2: false, num: 3 };
  if (budget <= 55000000) return { tierName: 'Tier 4: Enterprise', isTier1_2: false, num: 4 };
  return { tierName: 'Tier 5: Elite', isTier1_2: false, num: 5 };
}

export function generateQAFromRSD(rsd: RSDData, proj: ClientProject, existingQA?: QAData): QAData {
  const cleanId = proj.id.replace(/\D/g, '') || '1';
  const indexStr = cleanId.padStart(3, '0').slice(-3);
  const year = new Date().getFullYear();
  const dateStr = new Date().toISOString().split('T')[0];

  const existingMap = new Map<string, QATestItem>();
  if (existingQA && existingQA.testItems) {
    existingQA.testItems.forEach((ti) => {
      const match = ti.category?.match(/ATL-\d+/i) || ti.testCase?.match(/ATL-\d+/i);
      if (match) {
        existingMap.set(match[0].toUpperCase(), ti);
      } else if (ti.id) {
        existingMap.set(ti.id, ti);
      }
    });
  }

  const functionalTestItems: QATestItem[] = (rsd.functionalFeatures || []).map((f, idx) => {
    const code = f.featureCode || `ATL-${String(idx + 1).padStart(3, '0')}`;
    const existing = existingMap.get(code.toUpperCase());

    return {
      id: existing?.id || `tc-f-${code}`,
      category: `RSD [${code}] - ${f.moduleArea}`,
      testCase: `Pengujian Fitur ${code}: ${f.nameAndDesc}`,
      expectedResult: `Fungsi ${f.moduleArea} berjalan normal untuk role ${f.roleAccess}`,
      status: existing?.status || 'PASSED',
      notes: existing?.notes || `Ref RSD: ${code} (Prioritas: ${f.priority})`,
    };
  });

  const secItem: QATestItem = existingMap.get('tc-sec') || {
    id: 'tc-sec',
    category: 'RSD Non-Fungsional (Security)',
    testCase: 'Keamanan HTTPS, Password Hashing, & Supabase RLS Policies',
    expectedResult: rsd.nonFunctional?.security || 'Enkripsi HTTPS & Supabase RLS Policies',
    status: 'PASSED',
    notes: 'Verified Security',
  };

  const perfItem: QATestItem = existingMap.get('tc-perf') || {
    id: 'tc-perf',
    category: 'RSD Non-Fungsional (Performance)',
    testCase: 'Audit Kecepatan API Response Time & Page Load',
    expectedResult: rsd.nonFunctional?.performance || 'API Response Time <= 2s, Page Load <= 3s',
    status: 'PASSED',
    notes: 'Lighthouse Score 95+',
  };

  const uatItem: QATestItem = existingMap.get('tc-uat') || {
    id: 'tc-uat',
    category: 'Checklist UAT Klien',
    testCase: `User Acceptance Testing (UAT) Mandiri oleh Klien (${proj.clientName || 'Klien'})`,
    expectedResult: 'Seluruh deliverable disetujui tanpa kendala blocker',
    status: 'PASSED',
    notes: 'UAT Verified',
  };

  return {
    id: existingQA?.id || `qa-${proj.id}`,
    projectId: proj.id,
    docNumber: existingQA?.docNumber || `${indexStr}/ATL-QA/III/${year}`,
    issueDate: existingQA?.issueDate || dateStr,
    clientName: rsd.clientName || proj.clientName || '',
    projectTitle: proj.title || '',
    qaLeadName: existingQA?.qaLeadName || '',
    testerName: existingQA?.testerName || proj.freelancerName || '',
    clientPic: existingQA?.clientPic || (proj.clientName ? `${proj.clientName} (PIC UAT)` : ''),
    stagingUrl: existingQA?.stagingUrl || '',
    summary: existingQA?.summary || (proj.title ? `Laporan Pengujian QA Sprints untuk proyek ${proj.title}.` : ''),
    overallStatus: existingQA?.overallStatus || 'PASSED',
    testItems: [...functionalTestItems, secItem, perfItem, uatItem],
    updatedAt: new Date().toISOString(),
    party1Signature: existingQA?.party1Signature,
    party2Signature: existingQA?.party2Signature,
  };
}

export function generateAutoDocumentsForProject(proj: ClientProject) {
  const cleanId = proj.id.replace(/\D/g, '') || '1';
  const indexStr = cleanId.padStart(3, '0').slice(-3);
  const year = new Date().getFullYear();
  const dateStr = new Date().toISOString().split('T')[0];
  const { tierName, isTier1_2 } = inferTierFromBudget(proj.budget);
  const budgetWords = numberToWordsIDR(proj.budget);
  const devFee = proj.freelancerFee || getFreelancerFeeForTier(tierName);

  const cif: CIFData = {
    id: `cif-${proj.id}`,
    projectId: proj.id,
    docNumber: `${indexStr}/CIF/ATL/III/${year}`,
    adminName: 'Cecep Fahmidin',
    date: dateStr,
    infoSource: 'Direct Lead',
    clientName: proj.clientName || '',
    picName: proj.clientName ? `${proj.clientName} (PIC Utama)` : '',
    contact: proj.clientEmail
      ? (proj.clientPhone ? `${proj.clientEmail} / ${proj.clientPhone}` : proj.clientEmail)
      : (proj.clientPhone || ''),
    industry: 'Teknologi & Bisnis',
    websiteUrl: '',
    businessLocation: '',
    projectSummary: proj.description || '',
    primaryGoals: proj.title ? `Membangun platform ${proj.title} berkinerja tinggi.` : '',
    targetAudience: 'Pengguna umum & Klien target.',
    tier: tierName,
    pageStructure: '1) Homepage / Landing, 2) About Us, 3) Fitur / Layanan, 4) Kontak',
    mainFeatures: 'Desain Responsif, Form Kontak, SEO Friendly.',
    techFramework: 'Next.js, TypeScript, Tailwind CSS / MUI',
    scopeOthers: '',
    brandingAssets: { logo: true, color: true, officialFont: false, others: '' },
    visualStyle: { modern: true, professional: true, elegant: false, others: '' },
    referenceWebsites: ['', '', ''],
    contentAvailability: { general: 'Disediakan Developer', copywriting: 'Disediakan Developer', images: 'Disediakan Developer' },
    estimatedBudget: proj.budget,
    additionalCosts: 0,
    paymentScheme: isTier1_2
      ? { dpPercent: 50, finalPercent: 50 }
      : { dpPercent: 30, midPercent: 30, finalPercent: 40 },
    targetLaunchDate: proj.deadline || '',
    additionalNotes: '',
    additionalNotesTable: [
      { prihal: 'Diskusi Awal', catatan: 'Pengumpulan kebutuhan awal proyek oleh tim Sales & Admin.' },
    ],
    updatedAt: new Date().toISOString(),
  };

  const rsd: RSDData = {
    id: `rsd-${proj.id}`,
    projectId: proj.id,
    docCode: `${indexStr}/ATL-RSD/III/${year}`,
    clientName: proj.clientName || '',
    issueDate: dateStr,
    domain: '',
    emailPass: '',
    authorITLead: '',
    tier: tierName,
    freelancerName: proj.freelancerName || '',
    businessContext: proj.description || '',
    solutionSummary: proj.description || '',
    projectGoals: proj.deadline ? `Target pengerjaan sebelum ${proj.deadline}.` : '',
    inScope: '',
    outOfScope: '',
    techStack: [
      { component: 'Frontend Web', techFramework: 'Next.js App Router', versionSpec: 'v14+', reason: 'Performa & SEO' },
      { component: 'Backend API', techFramework: 'Next.js Route Handlers', versionSpec: 'v20+', reason: 'Integrasi native' },
      { component: 'Database Utama', techFramework: 'PostgreSQL Supabase', versionSpec: 'v15+', reason: 'RLS Security Policies' },
      { component: 'Infrastructure / Cloud', techFramework: 'Vercel PaaS & Edge Cloud', versionSpec: 'Enterprise Cloud', reason: 'Deployment serverless & auto-scaling' },
    ],
    functionalFeatures: [
      { id: 'f1', featureCode: 'ATL-001', moduleArea: 'Autentikasi', nameAndDesc: 'Login & Management User', roleAccess: 'All User', priority: 'High' },
      { id: 'f2', featureCode: 'ATL-002', moduleArea: 'Dashboard Utama', nameAndDesc: `Fitur Utama Proyek ${proj.title}`, roleAccess: 'Admin', priority: 'High' },
    ],
    nonFunctional: {
      security: 'Enkripsi HTTPS & Supabase RLS Policies',
      performance: 'API Response Time <= 2s, Page Load <= 3s',
      availability: 'Target uptime 99.5%',
      compatibility: 'Multi-browser & Mobile Responsive',
    },
    milestones: [
      { name: 'Milestone 1: Discovery & Setup', scope: 'Finalisasi skema & RSD', durationDays: 5, targetDate: dateStr },
      { name: 'Milestone 2: Execution & Live', scope: 'Development & Quality Assurance', durationDays: 14, targetDate: proj.deadline || dateStr },
    ],
    updatedAt: new Date().toISOString(),
  };

  const mou: MoUData = {
    id: `mou-${proj.id}`,
    projectId: proj.id,
    docNumber: `${indexStr}/MoU/ATL/III/${year}`,
    date: dateStr,
    dayName: '',
    monthName: '',
    yearName: `${year}`,
    atasilabsPic: '',
    atasilabsRole: '',
    clientCompany: proj.clientCompany || proj.clientName || '',
    clientAddress: '',
    clientPic: proj.clientName || '',
    clientRole: '',
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
    tier: tierName,
    atasilabsPic: '',
    atasilabsRole: '',
    atasilabsAddress: '',
    atasilabsWhatsapp: '0821-6361-428',
    atasilabsEmail: 'contact@atasilabs.com',
    freelancerName: proj.freelancerName || '',
    freelancerNik: '',
    freelancerAddress: '',
    freelancerWhatsapp: '',
    freelancerEmail: '',
    freelancerStatus: proj.freelancerName ? 'Fullstack Developer (Freelance Partner)' : '',
    freelancerBankInfo: '',
    deadlineDate: proj.deadline || '',
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
    date: proj.deadline || dateStr,
    atasilabsPic: '',
    atasilabsRole: '',
    clientCompany: proj.clientCompany || proj.clientName || '',
    clientAddress: '',
    clientPic: proj.clientName || '',
    clientRole: '',
    mainUrl: '',
    sourceCodeAccess: '',
    adminPanelAccess: '',
    warrantyDays: 30,
    locationCity: '',
    updatedAt: new Date().toISOString(),
  };

  const qa = generateQAFromRSD(rsd, proj);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('atasilabs_custom_project_documents');
      if (saved) {
        const allCustom = JSON.parse(saved);
        const projCustom = allCustom[proj.id];
        if (projCustom) {
          const mergedCif = projCustom.cif || cif;
          const mergedRsd = projCustom.rsd || rsd;
          const mergedMou = projCustom.mou || mou;
          const mergedSpk = projCustom.spk || spk;
          const mergedBast = projCustom.bast || bast;
          const mergedQa = projCustom.qa || generateQAFromRSD(mergedRsd, proj, qa);
          return { cif: mergedCif, rsd: mergedRsd, mou: mergedMou, spk: mergedSpk, bast: mergedBast, qa: mergedQa };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return { cif, rsd, mou, spk, bast, qa };
}
