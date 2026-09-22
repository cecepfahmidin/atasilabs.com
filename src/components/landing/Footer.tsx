'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

const serviceLinks = [
  "SOFTWARE ARCHITECTURE",
  "SAAS DASHBOARD UI",
  "E-COMMERCE SYSTEM",
  "WORKFLOW AUTOMATION",
];
const companyLinks = [
  "TENTANG ATASILABS",
  "METODOLOGI IPW",
  "CASE STUDIES",
  "INQUIRY PROYEK",
];
const dashboardLinks = [
  "CLIENT PORTAL LOGIN",
  "WORKFLOW DOKUMEN",
  "DIGITAL E-SIGN",
  "PROJECT TRACKING",
];

export const Footer: React.FC = () => {
  const router = useRouter();
  const { setDashboardTab, companyContact } = useApp();

  const handleDashboardClick = (tab: string) => {
    setDashboardTab(tab as any);
    router.push('/dashboard');
  };

  const socialLinks = [
    { label: "FB", url: companyContact?.facebookUrl || "https://facebook.com" },
    { label: "WA", url: `https://wa.me/${companyContact?.whatsappRaw || '628216361428'}` },
    ...(companyContact?.instagramUrl ? [{ label: "IG", url: companyContact.instagramUrl }] : []),
  ];

  return (
    <footer className="flex flex-col w-full bg-[#050505] border-t border-[#1D1D1D]">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-[80px] px-6 md:px-[120px] py-12 md:py-[64px]">
        {/* Brand Column */}
        <div className="flex flex-col gap-6 md:w-[320px] md:shrink-0">
          <div className="flex items-center gap-[12px]">
            <AtasiLabsLogo height={32} />
          </div>
          <p className="font-ibm-mono text-[13px] md:text-[14px] text-[#888888] tracking-[0.5px] leading-[1.6]">
            INDUSTRIAL-GRADE SOFTWARE ENGINEERING STUDIO. REKAYASA ARSITEKTUR NEXT.JS, MATERIAL UI & PRISMA ORM UNTUK ENTERPRISE DENGAN SYSTEM SPRINT MANAJEMEN PRESISI TINGGI.
          </p>
          <div className="flex gap-[12px]">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[36px] h-[36px] bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] transition-colors"
              >
                <span className="font-grotesk text-[10px] font-bold text-[#AAAAAA] hover:text-[#FFD600]">
                  {s.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 md:flex-1 gap-8 md:gap-[60px]">
          {/* Column 1: Services */}
          <div className="flex flex-col gap-4">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px]">
              LAYANAN
            </span>
            {serviceLinks.map((link) => (
              <a
                key={link}
                href="#services"
                className="font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px] hover:text-[#FFD600] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Column 2: Perusahaan */}
          <div className="flex flex-col gap-4">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px]">
              PERUSAHAAN
            </span>
            {companyLinks.map((link) => (
              <a
                key={link}
                href="#contact"
                className="font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px] hover:text-[#FFD600] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Column 3: Dashboard */}
          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px]">
              CLIENT PORTAL
            </span>
            <button
              onClick={() => handleDashboardClick('overview')}
              className="text-left font-ibm-mono text-[11px] text-[#FFD600] tracking-[0.5px] hover:underline"
            >
              ➔ DASHBOARD OVERVIEW
            </button>
            <button
              onClick={() => handleDashboardClick('documents')}
              className="text-left font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px] hover:text-[#FFD600]"
            >
              WORKFLOW DOKUMEN & E-SIGN
            </button>
            <button
              onClick={() => handleDashboardClick('projects')}
              className="text-left font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px] hover:text-[#FFD600]"
            >
              PROYEK AKTIF KLIEN
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-6 md:px-[120px] py-4 md:h-[56px] border-t border-t-[#1D1D1D] gap-3 sm:gap-0 bg-[#080808]">
        <span className="font-ibm-mono text-[11px] text-[#666666] tracking-[1px]">
          © 2026 ATASILABS SYSTEMS. HAK CIPTA DILINDUNGI.
        </span>
        <a
          href="https://www.atasilabs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-ibm-mono text-[12px] md:text-[13px] font-bold text-[#FFD600] tracking-[1px] hover:underline"
        >
          www.atasilabs.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
