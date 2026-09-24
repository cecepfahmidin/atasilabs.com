'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

const navLinks = [
  { label: "LAYANAN UTAMA", sectionId: "services" },
  { label: "ALUR WORKFLOW SOP", sectionId: "workflow" },
  { label: "ARSITEKTUR TECH STACK", sectionId: "architecture" },
  { label: "PORTOFOLIO PROYEK", sectionId: "portfolio" },
  { label: "PAKET HARGA & SPEK", sectionId: "pricing" },
  { label: "TANYA JAWAB (FAQ)", sectionId: "faq" },
];

const dashboardLinks = [
  { label: "PORTAL DASHBOARD", tab: "overview", isPrimary: true },
  { label: "PROYEK AKTIF KLIEN", tab: "projects" },
  { label: "WORKFLOW DOKUMEN & E-SIGN", tab: "documents" },
  { label: "DATABASE LEAD MASUK", tab: "leads" },
  { label: "CMS PRICELIST & SPEK", tab: "pricing" },
];

export const Footer: React.FC = () => {
  const router = useRouter();
  const { setDashboardTab, companyContact } = useApp();

  const handleDashboardClick = (tab: string) => {
    setDashboardTab(tab as any);
    router.push('/dashboard');
  };

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/') {
        router.push(`/#${id}`);
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        router.push(`/#${id}`);
      }
    }
  };

  const socialLinks = [
    { label: "FB", url: companyContact?.facebookUrl || "https://facebook.com/atasilabs" },
    { label: "WA", url: `https://wa.me/${companyContact?.whatsappRaw || '628216361428'}` },
    { label: "IG", url: companyContact?.instagramUrl || "https://instagram.com/atasilabs" },
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
                title={`Kunjungi ${s.label} AtasiLabs`}
              >
                <span className="font-grotesk text-[10px] font-bold text-[#AAAAAA] hover:text-[#FFD600]">
                  {s.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:flex-1 gap-8 md:gap-[50px]">
          {/* Column 1: Landing Page Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px] mb-1">
              NAVIGASI LAMAN DEPAN
            </span>
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-left font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px] hover:text-[#FFD600] transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Column 2: Official Contact Info */}
          <div className="flex flex-col gap-3">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px] mb-1">
              KONTAK RESMI STUDIO
            </span>
            <div className="flex flex-col gap-2 font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px]">
              <div>
                <span className="text-[#666666] block text-[10px]">EMAIL SUPPORT:</span>
                <a
                  href={`mailto:${companyContact?.email || 'atasilabs@gmail.com'}`}
                  className="text-[#F5F5F0] hover:text-[#FFD600] transition-colors"
                >
                  {companyContact?.email || 'atasilabs@gmail.com'}
                </a>
              </div>
              <div>
                <span className="text-[#666666] block text-[10px]">WHATSAPP HOTLINE:</span>
                <a
                  href={`https://wa.me/${companyContact?.whatsappRaw || '628216361428'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5F5F0] hover:text-[#FFD600] transition-colors"
                >
                  {companyContact?.whatsapp || '+62 821-6361-428'}
                </a>
              </div>
              <div>
                <span className="text-[#666666] block text-[10px]">ALAMAT STUDIO:</span>
                <span className="text-[#CCCCCC] leading-snug block">
                  {companyContact?.address || 'Jl. Raya Godog, Garut, Jawa Barat, Indonesia'}
                </span>
              </div>
              <div>
                <span className="text-[#666666] block text-[10px]">JAM OPERASIONAL:</span>
                <span className="text-[#CCCCCC] block">
                  {companyContact?.workingHours || 'Senin - Sabtu: 08.00 - 20.00 WIB'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Portal Management */}
          <div className="flex flex-col gap-3">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px] mb-1">
              PORTAL MANAGEMENT
            </span>
            {dashboardLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleDashboardClick(item.tab)}
                className={`text-left font-ibm-mono text-[11px] tracking-[0.5px] transition-colors cursor-pointer bg-transparent border-none p-0 ${
                  item.isPrimary
                    ? 'text-[#FFD600] font-bold hover:underline'
                    : 'text-[#888888] hover:text-[#FFD600]'
                }`}
              >
                {item.isPrimary ? `➔ ${item.label}` : item.label}
              </button>
            ))}
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



