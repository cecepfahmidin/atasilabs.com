'use client';

import React from 'react';
import SectionHeader from './SectionHeader';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  bgColor?: string;
  accentColor: string;
}

function TestimonialCard({
  quote,
  name,
  role,
  bgColor = '#111111',
  accentColor,
}: TestimonialCardProps) {
  return (
    <div
      className="flex flex-col gap-6 p-8 md:p-[40px] border-l-4 w-full md:flex-1"
      style={{ backgroundColor: bgColor, borderLeftColor: accentColor }}
    >
      <p className="font-ibm-mono text-[13px] text-[#CCCCCC] tracking-[1px] leading-[1.6]">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-[12px]">
        <div className="w-[36px] h-[36px] rounded-full bg-[#222222] border border-[#333333] shrink-0 flex items-center justify-center font-grotesk text-xs text-[#FFD600] font-bold">
          {name.charAt(0)}
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="font-grotesk text-[13px] font-bold text-[#F5F5F0] tracking-[1px]">
            {name}
          </span>
          <span className="font-ibm-mono text-[11px] text-[#555555] tracking-[1px]">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[04] // KEPERCAYAN KLIEN"
        title={"TESTIMONI KLIEN.\nHASIL NYATA."}
        subtitle="TESTIMONI FOUNDER & LEAD ENGINEER YANG TELAH SHIPPING SYSTEM BERSAMA ATASILABS."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <TestimonialCard
          quote="ATASILABS MEMBANTU KAMI SHIPPING DASHBOARD ENTERPRISE DALAM 3 MINGGU. DOKUMEN E-SIGN OTOMATIS SANGAT MEMUDAHKAN DELEGASI VENDOR."
          name="BUDI SANTOSO"
          role="CEO, PT NUSANTARA TEKNOLOGI"
          accentColor="#FFD600"
        />
        <TestimonialCard
          quote="ARSITEKTUR NEXT.JS APP ROUTER DAN PRISMA ORM SANGAT HANDAL DAN TYPE-SAFE. TIDAK ADA BUG CRITICAL SAAT LAUNCHING REBOOT 2.0."
          name="RIZKY RAMADHAN"
          role="CTO, ALPHA CAPITAL PARTNERS"
          bgColor="#0D0D0D"
          accentColor="#FF6B35"
        />
        <TestimonialCard
          quote="PROSES SPRINT SANGAT TRANSPARAN TERORGANISASI DI PORTAL DASHBOARD. CODEBASE GITHUB DISERAHKAN FULL 100%."
          name="DONI PRASETYO"
          role="LEAD DEV, KREASI BUSANA INDONESIA"
          accentColor="#F5F5F0"
        />
      </div>
    </section>
  );
};

export default TestimonialsSection;
