import { Portfolio, Lead, ClientProject, ServiceItem, User, PricingTier, CompanyContact, Testimonial } from '../types';

export const INITIAL_COMPANY_CONTACT: CompanyContact = {
  companyName: 'ATASILABS HQ & STUDIO',
  subtitle: 'BUILD YOUR DIGITAL FUTURE',
  description: 'Siap mendiskusikan kebutuhan arsitektur Next.js, Material UI, Prisma ORM, maupun integrasi workflow internal perusahaan Anda.',
  email: 'atasilabs@gmail.com',
  phone: '+62 821-6361-428',
  whatsapp: '+62 821-6361-428',
  whatsappRaw: '628216361428',
  address: 'Jakarta & Bandung, Indonesia (Remote First)',
  workingHours: 'Senin - Jumat // 09:00 - 18:00 WIB',
  facebookUrl: 'https://facebook.com/atasilabs',
  instagramUrl: 'https://instagram.com/atasilabs',
  ndaNotice: '100% Non-Disclosure Agreement (NDA) Dijamin. Kerahasiaan Ide & Codebase Proyek Terjaga.',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_USER: User = {
  id: 'usr-ceo',
  email: 'ceo@atasilabs.com',
  name: 'Irfan Aulia Ulumuddin',
  role: 'CEO',
  phone: '0812-3456-7890',
  company: 'PT Aulia Indoland Grup (Atasilabs)',
  status: 'ACTIVE',
  avatarUrl: '/team/ceo.jpg',
  titleBadge: 'CEO & FOUNDER',
  createdAt: '2024-01-15T08:00:00.000Z',
};

export const INITIAL_USERS: User[] = [
  INITIAL_USER,
  {
    id: 'usr-9409681',
    email: 'cecepfahmidin@gmail.com',
    name: 'Cecep Fahmidin, S.Kom., M.Kom., Gr.',
    role: 'CTO',
    phone: '0813-9876-5432',
    company: 'Atasilabs Tech Division',
    status: 'ACTIVE',
    avatarUrl: '/team/cto.jpg',
    titleBadge: 'CTO & LEAD ARCHITECT',
    createdAt: '2024-01-16T09:00:00.000Z',
  },
  {
    id: 'usr-cmo',
    email: 'cmo@atasilabs.com',
    name: 'Dian Hidayat, S.E., M.Pd.I',
    role: 'CMO',
    phone: '0857-1122-3344',
    company: 'Atasilabs Growth & Business Dev',
    status: 'ACTIVE',
    avatarUrl: '/team/cmo.jpg',
    titleBadge: 'CMO & HEAD OF UI/UX',
    createdAt: '2024-01-17T10:00:00.000Z',
  },
  {
    id: 'usr-admin',
    email: 'admin@atasilabs.com',
    name: 'Hendra Gunawan',
    role: 'ADMIN',
    phone: '0821-4455-6677',
    company: 'Atasilabs Operations',
    status: 'ACTIVE',
    avatarUrl: '',
    createdAt: '2024-01-18T11:00:00.000Z',
  },
  {
    id: 'usr-client',
    email: 'budi.santoso@nusantaratech.id',
    name: 'Budi Santoso',
    role: 'CLIENT',
    phone: '0811-2233-4455',
    company: 'PT Nusantara Teknologi Mandiri',
    status: 'ACTIVE',
    avatarUrl: '',
    createdAt: '2024-02-01T08:00:00.000Z',
  },
  {
    id: 'usr-freelancer',
    email: 'doni.freelance@devmail.com',
    name: 'Doni Wijaya',
    role: 'FREELANCER',
    phone: '0896-5566-7788',
    company: 'Mitra Developer Senior',
    status: 'ACTIVE',
    avatarUrl: '',
    createdAt: '2024-02-05T14:00:00.000Z',
  },
];

export const INITIAL_PORTFOLIOS: Portfolio[] = [
  {
    id: 'port-1',
    title: 'SaaS ERP & Logistics Dashboard',
    description: 'Sistem manajemen rantai pasok dan inventaris real-time terintegrasi dengan analitik armada dan otomatisasi faktur.',
    fullDescription: 'Aplikasi Enterprise Resource Planning skala penuh untuk perusahaan logistik multinasional. Memproses lebih dari 10.000 transaksi harian dengan latensi sub-100ms menggunakan Next.js App Router dan PostgreSQL Supabase terindeks.',
    category: 'Dashboard SaaS',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Next.js 14', 'Material UI', 'Prisma ORM', 'Supabase PostgreSQL', 'TypeScript', 'Recharts'],
    liveUrl: 'https://demo-erp-logistics.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/erp-logistics-dashboard',
    featured: true,
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-03-01T15:30:00.000Z',
  },
  {
    id: 'port-2',
    title: 'Modern E-Commerce Storefront & Payment Gateway',
    description: 'Platform toko daring performa tinggi dengan fitur live stock inventory, integrasi Midtrans Snap API, dan server-side caching.',
    fullDescription: 'Arsitektur e-commerce headless dengan skor Google Lighthouse 98. Menggunakan Prisma Transaction untuk mencegah race condition pada pesanan flash sale dan Supabase Storage untuk kompresi WebP gambar produk secara instan.',
    category: 'E-Commerce',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Next.js', 'Prisma', 'Supabase Auth', 'Material UI', 'Midtrans', 'Tailwind CSS'],
    liveUrl: 'https://demo-storefront.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/modern-ecommerce-store',
    featured: true,
    createdAt: '2024-01-20T09:15:00.000Z',
    updatedAt: '2024-02-18T11:20:00.000Z',
  },
  {
    id: 'port-3',
    title: 'HealthCare Clinic & Telemedicine Portal',
    description: 'Portal rekam medis elektronik (EMR) dan reservasi dokter dengan enkripsi data pasien dan audit log kepatuhan HIPAA.',
    fullDescription: 'Solusi sistem informasi klinik terpadu yang memfasilitasi telekonsultasi, rekam medis digital, dan antrian poliklinik berbasis WebRTC dan Supabase Realtime Channels.',
    category: 'Full-Stack',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    techStack: ['React', 'Next.js', 'MUI v5', 'Prisma', 'Supabase Storage', 'PostgreSQL'],
    liveUrl: 'https://demo-medika-portal.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/healthcare-telemedicine-portal',
    featured: true,
    createdAt: '2023-11-05T14:40:00.000Z',
    updatedAt: '2024-01-12T08:10:00.000Z',
  },
  {
    id: 'port-4',
    title: 'EduTech LMS & Interactive Code Sandbox',
    description: 'Learning Management System interaktif dengan compiler kode langsung, kuis adaptif, dan penerbitan sertifikat digital otomatis.',
    fullDescription: 'Platform edukasi coding online dengan sandbox eksekusi terisolasi, pelacakan progres siswa melalui MUI DataGrid, dan integrasi webhook sertifikat digital.',
    category: 'Full-Stack',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Next.js App Router', 'Material UI', 'Prisma ORM', 'Supabase Auth', 'Monaco Editor'],
    liveUrl: 'https://demo-edutech-lms.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/edutech-interactive-lms',
    featured: false,
    createdAt: '2023-10-18T13:00:00.000Z',
    updatedAt: '2023-12-20T16:00:00.000Z',
  },
  {
    id: 'port-5',
    title: 'Fintech Personal Budget & Investment Tracker',
    description: 'Aplikasi pelacak keuangan pribadi dengan integrasi Open Banking API, kalkulator portofolio reksadana, dan simulasi pensiun.',
    fullDescription: 'Dashboard keuangan modern dengan visualisasi dinamis chart MUI, kategori transaksi otomatis, dan ekspor laporan PDF berbasis server-side rendering.',
    category: 'Dashboard SaaS',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Next.js', 'MUI', 'Prisma', 'PostgreSQL', 'Chart.js', 'Tailwind'],
    liveUrl: 'https://demo-fintech-tracker.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/fintech-budget-tracker',
    featured: false,
    createdAt: '2023-09-02T11:00:00.000Z',
    updatedAt: '2023-11-14T09:45:00.000Z',
  },
  {
    id: 'port-6',
    title: 'Property & Real Estate Discovery PWA',
    description: 'Progressive Web App pencarian properti dan sewa apartemen dengan peta interaktif, tur virtual 360°, dan kalkulator KPR instan.',
    fullDescription: 'Aplikasi web mobile-first dengan dukungan offline PWA, filter harga dan lokasi dinamis, serta integrasi formulir kontak agen langsung tersinkron ke database Supabase.',
    category: 'Mobile-Web',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Next.js PWA', 'MUI', 'Prisma ORM', 'Supabase', 'Leaflet / Maps'],
    liveUrl: 'https://demo-properti-pwa.devstudio.id',
    repoUrl: 'https://github.com/cecepfahmidin/realestate-pwa-discovery',
    featured: false,
    createdAt: '2023-08-15T08:30:00.000Z',
    updatedAt: '2023-10-01T14:15:00.000Z',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@nusantaratech.id',
    company: 'PT Nusantara Teknologi Mandiri',
    serviceType: 'Full-Stack Web App (Next.js & Supabase)',
    budget: 'Rp 25.000.000 - Rp 50.000.000',
    message: 'Halo Mas Cecep, kami membutuhkan peremajaan platform portal B2B internal kami ke Next.js dan Prisma. Apakah ada jadwal ketersediaan di bulan ini untuk sesi konsultasi teknis?',
    status: 'READ',
    createdAt: '2024-03-12T09:20:00.000Z',
  },
  {
    id: 'lead-2',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@kreasiboutique.com',
    company: 'Kreasi Busana Indonesia',
    serviceType: 'E-Commerce Storefront & Payment Gateway',
    budget: 'Rp 15.000.000 - Rp 25.000.000',
    message: 'Selamat siang, kami tertarik membuat toko online dengan integrasi Midtrans dan manajemen stok seperti di portofolio Anda. Mohon info estimasi timeline pengerjaan.',
    status: 'READ',
    createdAt: '2024-03-11T14:45:00.000Z',
  },
  {
    id: 'lead-3',
    name: 'Hendrik Pratama',
    email: 'hendrik@alphacapital.co.id',
    company: 'Alpha Capital Partners',
    serviceType: 'SaaS Analytics & Data Dashboard',
    budget: 'Rp 50.000.000+',
    message: 'Kami ingin mengembangkan executive dashboard dengan Material UI dan PostgreSQL untuk visualisasi portofolio pendanaan startup kami. Desain UI di portofolio Anda sangat rapi dan sesuai kebutuhan kami.',
    status: 'READ',
    createdAt: '2024-03-08T11:15:00.000Z',
  },
  {
    id: 'lead-4',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@sehatplus.org',
    company: 'Yayasan Medika Sehat',
    serviceType: 'HealthTech / Portal Pasien',
    budget: 'Rp 20.000.000 - Rp 35.000.000',
    message: 'Terima kasih atas proposal sebelumnya. Kami sudah mendiskusikan dengan tim dokter dan ingin melanjutkan ke tahap penandatanganan SPK kerja sama.',
    status: 'READ',
    createdAt: '2024-03-01T16:00:00.000Z',
  },
  {
    id: 'lead-5',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@solusidigital.net',
    company: 'Solusi Digital Kreatif',
    serviceType: 'Code Audit & Performance Optimization',
    budget: '< Rp 15.000.000',
    message: 'Permintaan optimasi Lighthouse skor web e-learning yang mengalami query bottleneck pada Prisma dan Supabase.',
    status: 'ARCHIVED',
    createdAt: '2024-02-15T10:30:00.000Z',
  },
];

export const INITIAL_PROJECTS: ClientProject[] = [
  {
    id: 'proj-1',
    clientName: 'PT Nusantara Teknologi Mandiri',
    clientEmail: 'budi.santoso@nusantaratech.id',
    title: 'Migrasi & Redesign Portal B2B Mitra',
    description: 'Implementasi Next.js App Router, Prisma ORM dengan skema relasional kompleks, dan Supabase Auth RLS.',
    deadline: '2024-04-15',
    budget: 45000000,
    progress: 85,
    status: 'IN_PROGRESS',
    ipwStage: 'STAGE_5_EXECUTION',
    tierNumber: 3,
    freelancerName: 'Doni Wijaya',
    freelancerFee: 18000000,
    totalPaid: 27000000,
    payments: [
      {
        id: 'pay-101',
        date: '2024-02-05',
        amount: 13500000,
        stage: 'DP Tahap 1 (30%)',
        notes: 'Transfer Bank BRI a.n. PT Nusantara Tech Ref#88912',
        status: 'VERIFIED',
      },
      {
        id: 'pay-102',
        date: '2024-03-01',
        amount: 13500000,
        stage: 'Termin Progress Tahap 2 (30%)',
        notes: 'Transfer Bank BRI Ref#90318',
        status: 'VERIFIED',
      },
    ],
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-03-10T14:00:00.000Z',
  },
  {
    id: 'proj-2',
    clientName: 'Kreasi Busana Indonesia',
    clientEmail: 'siti.rahma@kreasiboutique.com',
    title: 'Modern Headless E-Commerce & Midtrans Snap',
    description: 'Integrasi keranjang belanja, voucher diskon, integrasi ongkos kirim RajaOngkir, dan payment gateway QRIS/Virtual Account.',
    deadline: '2024-04-30',
    budget: 22000000,
    progress: 45,
    status: 'IN_PROGRESS',
    ipwStage: 'STAGE_3_CONTRACTING',
    tierNumber: 2,
    freelancerName: 'Rian Febrian',
    freelancerFee: 8800000,
    totalPaid: 11000000,
    payments: [
      {
        id: 'pay-201',
        date: '2024-02-22',
        amount: 11000000,
        stage: 'DP Tahap 1 (50%)',
        notes: 'Transfer QRIS Midtrans Ref#KB-4412',
        status: 'VERIFIED',
      },
    ],
    createdAt: '2024-02-20T10:00:00.000Z',
    updatedAt: '2024-03-12T11:20:00.000Z',
  },
  {
    id: 'proj-3',
    clientName: 'Alpha Capital Partners',
    clientEmail: 'hendrik@alphacapital.co.id',
    title: 'Executive Financial Portfolio Dashboard',
    description: 'Penyusunan komponen DataGrid MUI, chart visualisasi pergerakan aset, dan ekspor laporan berkala berbasis PDF.',
    deadline: '2024-03-25',
    budget: 60000000,
    progress: 85,
    status: 'REVIEW',
    ipwStage: 'STAGE_5_EXECUTION',
    tierNumber: 4,
    freelancerName: 'Bagas Aditya',
    freelancerFee: 24000000,
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-03-11T16:00:00.000Z',
  },
  {
    id: 'proj-4',
    clientName: 'Yayasan Medika Sehat',
    clientEmail: 'dewi.lestari@sehatplus.org',
    title: 'Portal Reservasi Pasien & Telemedicine',
    description: 'Penyelesaian modul jadwal dokter poli, otentikasi pasien via SMS OTP, dan integrasi Supabase Storage untuk foto rujukan.',
    deadline: '2024-05-10',
    budget: 32000000,
    progress: 15,
    status: 'PLANNING',
    ipwStage: 'STAGE_1_DISCOVERY',
    tierNumber: 2,
    createdAt: '2024-03-05T13:30:00.000Z',
    updatedAt: '2024-03-08T09:00:00.000Z',
  },
  {
    id: 'proj-5',
    clientName: 'Solusi Digital Kreatif',
    clientEmail: 'ahmad.fauzi@solusidigital.net',
    title: 'Database Query Optimization & Speed Boost',
    description: 'Optimasi query Prisma, indeks PostgreSQL Supabase, dan implementasi caching ISR Next.js.',
    deadline: '2024-02-28',
    budget: 12000000,
    progress: 100,
    status: 'COMPLETED',
    ipwStage: 'STAGE_6_CLOSURE',
    tierNumber: 1,
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-28T17:00:00.000Z',
  },
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Full-Stack Web Development',
    subtitle: 'Next.js App Router & React 19',
    description: 'Pembangunan aplikasi web modern dari hulu ke hilir dengan performa tinggi, Server Components, SEO optimal, dan arsitektur modular.',
    features: ['Server-Side Rendering (SSR) & ISR', 'Type-safe API & Server Actions', 'SEO & Core Web Vitals Skala 95+', 'Responsive Mobile First'],
    iconName: 'Code',
    techTags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'srv-2',
    title: 'SaaS & Enterprise Dashboard UI',
    subtitle: 'Material UI (MUI) Design System',
    description: 'Antarmuka manajemen data interaktif, tabel data kompleks (MUI DataGrid), analitik visual, dan sistem tema Light/Dark yang elegan.',
    features: ['Sistem Tema & Aksesibilitas WCAG', 'Komponen DataGrid & Filter Lanjutan', 'Visualisasi Grafik & Metrik Real-time', 'Micro-interactions yang Halus'],
    iconName: 'LayoutDashboard',
    techTags: ['Material UI', 'DataGrid', 'Recharts', 'Emotion'],
  },
  {
    id: 'srv-3',
    title: 'Database Architecture & ORM',
    subtitle: 'Prisma ORM & PostgreSQL Supabase',
    description: 'Desain skema basis data relasional yang kokoh, migrasi terkelola, perlindungan injeksi SQL, dan Row Level Security (RLS) anti-bocor.',
    features: ['Skema Relasional & Type-Safety Prisma', 'Row Level Security (RLS) Supabase', 'Optimasi Indeks & Latensi Query Rendah', 'Backup & Replikasi Otomatis'],
    iconName: 'Database',
    techTags: ['Prisma ORM', 'Supabase', 'PostgreSQL', 'RLS Policies'],
  },
  {
    id: 'srv-4',
    title: 'Storage, Media & API Integration',
    subtitle: 'Supabase Storage & Payment Gateway',
    description: 'Manajemen aset gambar terkompresi otomatis, integrasi otentikasi OAuth sosial, dan gerbang pembayaran (Midtrans, Xendit, Stripe).',
    features: ['Upload Gambar ke Supabase Storage', 'Konversi Otomatis ke WebP Cepat', 'Integrasi Payment Gateway QRIS/VA', 'Webhook & Background Jobs'],
    iconName: 'CloudUpload',
    techTags: ['Supabase Storage', 'Midtrans', 'OAuth', 'REST / GraphQL'],
  },
  {
    id: 'srv-5',
    title: 'Auth & Session Security',
    subtitle: 'Supabase Auth & Next.js Middleware',
    description: 'Implementasi otentikasi aman berbasis JWT/Cookies, proteksi rute halaman admin via Next.js Middleware, dan kontrol akses berbasis peran (RBAC).',
    features: ['Middleware Proteksi Rute /dashboard', 'Multi-role User & Admin Access', 'Session Refresh Otomatis', 'Audit Log & Keamanan Akun'],
    iconName: 'ShieldCheck',
    techTags: ['Supabase Auth', 'JWT', 'Next Middleware', 'RBAC'],
  },
  {
    id: 'srv-6',
    title: 'Performance Audit & Maintenance',
    subtitle: 'Code Refactoring & Cloud Deployment',
    description: 'Audit menyeluruh performa aplikasi web, penyelesaian query bottleneck, pembaruan dependensi, serta setup CI/CD pipeline.',
    features: ['Audit Lighthouse & Memory Leak Check', 'Optimasi Query Database Prisma', 'Deployment ke Cloud Run / Vercel', 'Monitoring & SLA Uptime'],
    iconName: 'Gauge',
    techTags: ['CI/CD', 'Cloud Run', 'Vercel', 'Lighthouse'],
  },
];

export const INITIAL_PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier-1',
    tierNumber: 1,
    name: 'Starter',
    tagline: 'Ideal untuk landing page produk, personal branding, atau UMKM go-digital.',
    price: 4500000,
    priceBilling: 'per proyek',
    popular: false,
    highlightBadge: 'Ekonomis & Cepat',
    deliveryTime: '5 - 7 Hari Kerja',
    revisionCount: '3x Revisi Utama',
    idealFor: 'Landing page promosi, portofolio profil, atau website statis modern.',
    ctaText: 'Pilih Paket Starter',
    updatedAt: '2024-03-01T10:00:00.000Z',
    features: [
      'Single Page / Landing Page Responsif',
      'Desain UI Kustom Material UI & Tailwind',
      'Integrasi Form Kontak (Direct Supabase Lead)',
      'Optimasi SEO On-Page & Core Web Vitals (90+)',
      'Setup Domain & Hosting Deployment Cloud',
      'Dukungan Pemeliharaan 1 Bulan Gratis',
    ],
    specs: [
      { label: 'Halaman / Tampilan', value: '1 - 3 Halaman' },
      { label: 'Teknologi Frontend', value: 'Next.js 14 / React 19' },
      { label: 'UI Framework', value: 'MUI v5 + Tailwind CSS' },
      { label: 'Database & Auth', value: 'Supabase Serverless (Basic)' },
      { label: 'CMS Dashboard', value: 'Tidak Termasuk (Lead Form Only)' },
      { label: 'Garansi Bug', value: '30 Hari Garansi' },
    ],
  },
  {
    id: 'tier-2',
    tierNumber: 2,
    name: 'Growth',
    tagline: 'Pondasi aplikasi web bisnis berkembang dengan multi-page dan form dinamis.',
    price: 9500000,
    priceBilling: 'per proyek',
    popular: false,
    highlightBadge: 'Pilihan Bisnis Baru',
    deliveryTime: '10 - 14 Hari Kerja',
    revisionCount: '5x Revisi Desain',
    idealFor: 'Profil perusahaan interaktif, katalog jasa/produk, atau portal berita.',
    ctaText: 'Pilih Paket Growth',
    updatedAt: '2024-03-01T10:00:00.000Z',
    features: [
      'Struktur Multi-Page Komprehensif (s/d 8 Halaman)',
      'Sistem Tema Dinamis (Light & Dark Mode)',
      'Manajemen Database dengan Prisma ORM',
      'Formulir Lead & Permintaan Penawaran Terintegrasi',
      'Integrasi Supabase Storage untuk Gambar Portofolio',
      'Analitik Pengunjung & Keamanan SSL',
      'Dukungan Pemeliharaan 2 Bulan',
    ],
    specs: [
      { label: 'Halaman / Tampilan', value: 'Hingga 8 Halaman Dinamis' },
      { label: 'Teknologi Frontend', value: 'Next.js App Router (SSR & ISR)' },
      { label: 'UI Framework', value: 'Material UI Premium Theme' },
      { label: 'Database & Auth', value: 'Prisma ORM + PostgreSQL Supabase' },
      { label: 'CMS Dashboard', value: 'Panel Admin Sederhana (Konten)' },
      { label: 'Garansi Bug', value: '60 Hari Garansi' },
    ],
  },
  {
    id: 'tier-3',
    tierNumber: 3,
    name: 'Profesional',
    tagline: 'Solusi lengkap full-stack dengan dashboard admin, auth RBAC, dan CRUD portofolio.',
    price: 18500000,
    priceBilling: 'per proyek',
    popular: true,
    highlightBadge: 'Paling Populer ★',
    deliveryTime: '3 - 4 Minggu',
    revisionCount: 'Unlimited Minor + 5x Major',
    idealFor: 'SaaS MVP, portal manajemen klien, dashboard internal bisnis, atau e-katalog kompleks.',
    ctaText: 'Mulai Proyek Profesional',
    updatedAt: '2024-03-01T10:00:00.000Z',
    features: [
      'Aplikasi Full-Stack End-to-End dengan Next.js App Router',
      'Panel Admin Lengkap (CMS Portofolio, Leads, & Proyek)',
      'Autentikasi Supabase Auth & Role-Based Access Control (RBAC)',
      'Skema Database Prisma Lengkap dengan Row Level Security (RLS)',
      'Visualisasi Data Interaktif (Recharts & MUI DataGrid)',
      'Manajemen Berkas & Gambar (Supabase Storage Cloud)',
      'Audit Kinerja & Optimasi Query Indeks Database',
      'Dukungan SLA Prioritas & Pemeliharaan 3 Bulan',
    ],
    specs: [
      { label: 'Halaman / Tampilan', value: 'Unlimited Dynamic Pages & Views' },
      { label: 'Teknologi Frontend', value: 'Next.js App Router + TypeScript' },
      { label: 'UI Framework', value: 'Custom MUI Design System + Dark Mode' },
      { label: 'Database & Auth', value: 'Prisma ORM + Supabase Auth + RLS' },
      { label: 'CMS Dashboard', value: 'Full Admin Panel (CMS + Leads + Proyek)' },
      { label: 'Garansi Bug', value: '90 Hari Garansi & Pemeliharaan' },
    ],
  },
  {
    id: 'tier-4',
    tierNumber: 4,
    name: 'Enterprise',
    tagline: 'Arsitektur skala besar dengan integrasi payment gateway, workflow otomatis, dan multi-user.',
    price: 38000000,
    priceBilling: 'per proyek',
    popular: false,
    highlightBadge: 'Skala Korporat',
    deliveryTime: '5 - 8 Minggu',
    revisionCount: 'Unlimited Revisions',
    idealFor: 'Platform SaaS komersial, marketplace/e-commerce, sistem logistik, atau portal kesehatan.',
    ctaText: 'Konsultasi Enterprise',
    updatedAt: '2024-03-01T10:00:00.000Z',
    features: [
      'Arsitektur Microservices / Modular Monolith Berkinerja Tinggi',
      'Integrasi Payment Gateway Otomatis (Midtrans, Xendit, Stripe)',
      'Sistem Realtime Push Notifications & Supabase Channels',
      'Audit Log Keamanan & Kepatuhan Data Enkripsi',
      'Manajemen Antrian Tugas (Background Jobs / Webhook)',
      'CI/CD Automated Deployment Pipeline ke Cloud Run / AWS',
      'SLA Uptime 99.9% & Dokumentasi API Lengkap (OpenAPI/Swagger)',
      'Dukungan Teknis Dedikasi 6 Bulan',
    ],
    specs: [
      { label: 'Halaman / Tampilan', value: 'Arsitektur Kompleks Skala Enterprise' },
      { label: 'Teknologi Frontend', value: 'Next.js Enterprise + Micro-frontend' },
      { label: 'UI Framework', value: 'Bespoke MUI Enterprise Kit' },
      { label: 'Database & Auth', value: 'PostgreSQL Terkelola + Redis Cache' },
      { label: 'CMS Dashboard', value: 'Multi-Role Admin & Analytics Dashboard' },
      { label: 'Garansi Bug', value: '6 Bulan SLA & Dedicated Support' },
    ],
  },
  {
    id: 'tier-5',
    tierNumber: 5,
    name: 'Elite',
    tagline: 'Kemitraan teknologi eksklusif: kustomisasi total, AI integration, dan dedicated lead architect.',
    price: 75000000,
    priceBilling: 'kontrak komprehensif',
    popular: false,
    highlightBadge: 'Kemitraan Strategis',
    deliveryTime: 'Sesuai Roadmap / Agile Sprints',
    revisionCount: 'Full Agile Co-Development',
    idealFor: 'Fintech, AI-powered SaaS platforms, korporasi multinasional, atau scale-up tier-1.',
    ctaText: 'Jadwalkan Sesi Kemitraan Elite',
    updatedAt: '2024-03-01T10:00:00.000Z',
    features: [
      'Dedicated Principal Full-Stack Engineer & Tech Lead',
      'Integrasi AI Canggih (Gemini API, LLM Function Calling, RAG)',
      'Infrastruktur High-Availability Auto-Scaling Multi-Region',
      'Arsitektur Database Terdistribusi dengan Read Replicas',
      'Audit Keamanan Pentest & Enkripsi Data Tingkat Bank',
      'White-label Custom Design System & Paten Source Code',
      'Transfer Knowledge, Sesi Pelatihan Tim Internal, & SOP',
      'Dedicated SLA Response Time < 1 Jam & Retainer 1 Tahun',
    ],
    specs: [
      { label: 'Halaman / Tampilan', value: 'Kustomisasi Tanpa Batas (Bespoke)' },
      { label: 'Teknologi Frontend', value: 'State-of-the-Art Next.js + AI SDK' },
      { label: 'UI Framework', value: 'Proprietary Design System' },
      { label: 'Database & Auth', value: 'Enterprise Distributed Cloud DB' },
      { label: 'CMS Dashboard', value: 'Custom Intelligence & BI Dashboard' },
      { label: 'Garansi Bug', value: '1 Tahun Dedicated SLA' },
    ],
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    quote: 'TERIMA KASIH ATASILABS SUDAH BANTU BIKIN WEBSITE UNTUK PT. NUSANTARA TEKNOLOGI. HASILNYA SANGAT MEMUASKAN',
    name: 'YOGI AHMAD PRATAMA',
    role: 'CEO, PT NUSANTARA TEKNOLOGI',
    accentColor: '#FFD600',
    bgColor: '#111111',
  },
  {
    id: 'testi-2',
    quote: 'HASILNYA SANGAT MEMUASKAN. TIDAK MENYESAL MEMILIH ATASILABS SEBAGAI PARTNER UNTUK MEMBANGUN WEBSITE KAMI',
    name: 'ANDRI WAHYUDI',
    role: 'CEO, ALPHA CAPITAL PARTNERS',
    accentColor: '#FF6B35',
    bgColor: '#0D0D0D',
  },
  {
    id: 'testi-3',
    quote: 'PROSES PEMBUATAN WEBSITE SANGAT CEPAT DAN MEMUASKAN. TERIMA KASIH ATASILABS',
    name: 'EVA DAHLIAWATI',
    role: 'CEO, KREASI BUSANA INDONESIA',
    accentColor: '#F5F5F0',
    bgColor: '#111111',
  },
];

export const PRISMA_SCHEMA_CODE = `// prisma/schema.prisma
// Sistem Informasi Web Developer (Portofolio & Manajemen Proyek)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      String   @default("ADMIN") // ADMIN, DEVELOPER
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Portfolio {
  id          String   @id @default(uuid())
  title       String
  description String
  imageUrl    String?  // URL dari Supabase Storage bucket: "portfolio-assets"
  techStack   String[] // Array of strings untuk label MUI Chip
  category    String   @default("Full-Stack") // Full-Stack, Dashboard SaaS, E-Commerce, Mobile-Web
  liveUrl     String?
  repoUrl     String?
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
}

model Lead {
  id          String   @id @default(uuid())
  name        String
  email       String
  company     String?
  serviceType String?
  budget      String?
  message     String
  status      String   @default("NEW") // NEW, READ, ARCHIVED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}

model ClientProject {
  id          String   @id @default(uuid())
  clientName  String
  clientEmail String
  title       String
  description String
  deadline    DateTime
  budget      Float    @default(0)
  progress    Int      @default(0) // 0-100% (MUI LinearProgress / CircularProgress)
  status      String   @default("PLANNING") // PLANNING, IN_PROGRESS, REVIEW, COMPLETED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
}

model PricingTier {
  id             String   @id @default(uuid())
  tierNumber     Int      @unique // 1 (Starter), 2 (Growth), 3 (Profesional), 4 (Enterprise), 5 (Elite)
  name           String   // Starter, Growth, Profesional, Enterprise, Elite
  tagline        String
  price          Float    // Harga dalam IDR (Rupiah)
  priceBilling   String   @default("per proyek")
  popular        Boolean  @default(false)
  highlightBadge String?
  deliveryTime   String
  revisionCount  String
  idealFor       String
  ctaText        String
  features       String[] // Array fitur yang didapat
  specs          Json     // Spesifikasi teknis (label, value)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([tierNumber])
}
`;

