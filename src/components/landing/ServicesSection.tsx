'use client';

import React from 'react';
import { SERVICES_DATA } from '../../data/initialData';
import { useApp } from '../../context/AppContext';
import { SectionHeader } from './SectionHeader';

export const ServicesSection: React.FC = () => {
  const { setSelectedServiceForInquiry } = useApp();

  const handleSelectService = (title: string) => {
    setSelectedServiceForInquiry(title);
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="flex flex-col w-full bg-[#0D0D0D] py-16 px-6 md:py-[100px] md:px-[80px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[02] // CORE CAPABILITIES"
        title={'LAYANAN TEKNOLOGI FULL-STACK.\nSKALA HIGH-PERFORMANCE.'}
        subtitle="Pembangunan aplikasi web modern dari hulu ke hilir dengan Next.js App Router, Prisma ORM, Supabase Auth/Storage, dan Material UI."
        titleWidth="w-full max-w-[850px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {SERVICES_DATA.map((srv, index) => (
          <div
            key={srv.id}
            className="flex flex-col justify-between p-8 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">
                  [0{index + 1}]
                </span>
                <span className="font-ibm-mono text-[10px] text-[#888888] bg-[#1A1A1A] px-2 py-0.5 border border-[#333]">
                  {srv.subtitle}
                </span>
              </div>

              <h3 className="font-grotesk text-[22px] font-bold text-[#F5F5F0] group-hover:text-[#FFD600] transition-colors mb-3 leading-snug">
                {srv.title}
              </h3>

              <p className="font-ibm-mono text-[12px] text-[#888888] leading-[1.6] mb-6">
                {srv.description}
              </p>

              <ul className="flex flex-col gap-2 mb-6">
                {srv.features.map((feat, fIdx) => (
                  <li key={fIdx} className="font-ibm-mono text-[11px] text-[#A0A0A0] flex items-center gap-2">
                    <span className="text-[#FFD600]">✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {srv.techTags.map((tag) => (
                  <span
                    key={tag}
                    className="font-ibm-mono text-[10px] text-[#FFD600] bg-[#1A180E] border border-[#FFD600]/30 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleSelectService(srv.title)}
                className="w-full h-[42px] bg-[#1A1A1A] hover:bg-[#FFD600] text-[#F5F5F0] hover:text-[#0A0A0A] font-grotesk text-[11px] font-bold tracking-[1.5px] border border-[#3D3D3D] transition-all cursor-pointer"
              >
                KONSULTASI FITUR INI &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
