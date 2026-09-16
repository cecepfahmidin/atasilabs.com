'use client';

import React from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';

interface FeatureCardProps {
  iconColor: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  bgColor?: string;
  borderColor?: string;
  serviceName: string;
}

function FeatureCard({
  iconColor,
  title,
  description,
  tag,
  tagColor,
  bgColor = '#111111',
  borderColor = '#2D2D2D',
  serviceName,
}: FeatureCardProps) {
  const { setSelectedServiceForInquiry } = useApp();

  const handleClick = () => {
    setSelectedServiceForInquiry(serviceName);
    const elem = document.getElementById('contact');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col gap-5 p-8 md:p-[32px] border w-full md:flex-1 md:h-[340px] cursor-pointer hover:border-[#FFD600] transition-colors group"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="w-[40px] h-[40px] shrink-0 font-grotesk font-extrabold text-[#0A0A0A] flex items-center justify-center text-lg" style={{ backgroundColor: iconColor }}>
        ★
      </div>
      <h3 className="font-grotesk text-[18px] font-bold text-[#F5F5F0] tracking-[1px] leading-[1.2] whitespace-pre-line group-hover:text-[#FFD600] transition-colors">
        {title}
      </h3>
      <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] leading-[1.6]">
        {description}
      </p>
      <div
        className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border w-fit mt-auto"
        style={{ borderColor: tagColor }}
      >
        <span className="font-ibm-mono text-[11px] tracking-[2px]" style={{ color: tagColor }}>
          {tag}
        </span>
      </div>
    </div>
  );
}

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[01] // LAYANAN UTAMA"
        title={"SEGALA YANG ANDA BUTUHKAN.\nTANPA KOMPROMI."}
        subtitle="ARSITEKTUR NEXT.JS APP ROUTER PRESISI TINGGI. SUPABASE POSTGRESQL & OTOMATISASI LEGAL DOKUMEN INTEGRATED."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <FeatureCard
          iconColor="#FFD600"
          title={"FULL-STACK WEB APP\n& SAAS PLATFORM"}
          description="PENGEMBANGAN APLIKASI WEB NEXT.JS 15 + PRISMA ORM BERKAPASITAS HIGH-TRAFFIC DEPLOYMENT."
          tag="CORE APP"
          tagColor="#FFD600"
          borderColor="#FFD600"
          serviceName="Full-Stack Web App (Next.js & Supabase)"
        />
        <FeatureCard
          iconColor="#FF6B35"
          title={"ENTERPRISE DASHBOARD\n& WORKFLOW CMS"}
          description="INTEGRASI MATERIAL UI V6 DASHBOARD UNTUK MANAJEMEN WORKFLOW KLIEN, PROYEK, DAN E-SIGNATURE."
          tag="ENTERPRISE"
          tagColor="#FF6B35"
          bgColor="#0F0F0F"
          borderColor="#FF6B35"
          serviceName="SaaS & Enterprise Dashboard UI (Material UI)"
        />
        <FeatureCard
          iconColor="#F5F5F0"
          title={"DATABASE ORM & AUTOMATED\nDOCS WORKFLOW"}
          description="OTOMATISASI 5 PAKET DOKUMEN SOP (CIF, RSD, MOU, SPK, BAST) BER-KOP RESMI RESMI DAN VERIFIED E-SIGN."
          tag="WORKFLOW"
          tagColor="#888888"
          borderColor="#555555"
          serviceName="Database Architecture & ORM Migration (Prisma)"
        />
      </div>
    </section>
  );
};

export default ServicesSection;
