'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GlitchText } from './GlitchText';
import { CollabCursors } from './CollabCursors';

export const HeroSection: React.FC = () => {
  const { setActiveView } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    const el = document.getElementById('portfolio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col items-center w-full bg-[#0A0A0A] pt-28 pb-16 px-6 md:pt-[130px] md:pb-[90px] md:px-[80px] overflow-hidden">
      {/* Version & Industrial System Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[34px] px-[16px] bg-[#141414] border-2 border-[#FFD600] shadow-[0_0_15px_rgba(255,214,0,0.15)]">
        <div className="w-[8px] h-[8px] bg-[#FFD600] shrink-0 animate-pulse" />
        <span className="font-ibm-mono text-[10px] md:text-[11px] font-bold text-[#FFD600] tracking-[1.5px] md:tracking-[2.5px] whitespace-nowrap">
          [SYSTEM 2.0] // ATASILABS INDUSTRIAL SOP & AUTOMATION
        </span>
      </div>

      <div className="h-8 md:h-[28px]" />

      {/* Main Glitch Headlines */}
      <h1 className="font-grotesk text-[clamp(32px,7vw,84px)] font-bold text-[#F5F5F0] tracking-[-1px] leading-none text-center w-full max-w-[1150px]">
        <GlitchText text="BUILD WITHOUT LIMITS." speed={40} delay={100} />
      </h1>
      <h1 className="font-grotesk text-[clamp(32px,7vw,84px)] font-bold text-[#FFD600] tracking-[-1px] leading-none text-center w-full max-w-[1150px] mt-1">
        <GlitchText text="ENTERPRISE WEB APPS." speed={40} delay={450} />
      </h1>

      <div className="h-6 md:h-[24px]" />

      {/* Subheading */}
      <p className="font-ibm-mono text-[12px] md:text-[14px] text-[#888888] tracking-[1px] leading-[1.7] text-center w-full max-w-[850px]">
        STUDIO PENGEMBANGAN APLIKASI WEB FULL-STACK PERFORMANCE SKALA ENTERPRISE.
        <br />
        NEXT.JS APP ROUTER, PRISMA ORM, SUPABASE POSTGRESQL & OTOMATISASI DOKUMEN SOP 6-STAGE.
      </p>

      <div className="h-10 md:h-[40px]" />

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-[16px] w-full sm:w-auto z-30">
        <button
          onClick={scrollToContact}
          className="flex items-center justify-center w-full sm:w-[230px] h-[54px] bg-[#FFD600] hover:bg-[#e6c200] transition-colors border-none cursor-pointer"
        >
          <span className="font-grotesk text-[12px] font-bold text-[#0A0A0A] tracking-[2px]">
            KONSULTASI PROYEK FREE
          </span>
        </button>

        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center justify-center w-full sm:w-[230px] h-[54px] bg-[#0A0A0A] border-2 border-[#3D3D3D] hover:border-[#FFD600] transition-colors cursor-pointer text-[#F5F5F0]"
        >
          <span className="font-ibm-mono text-[12px] text-[#888888] hover:text-[#FFD600] tracking-[1.5px]">
            MASUK DASHBOARD CMS &gt;
          </span>
        </button>
      </div>

      <div className="h-6 md:h-[20px]" />

      <p className="font-ibm-mono text-[11px] text-[#555555] tracking-[2px] text-center">
        UU ITE E-SIGNATURE VERIFIED // GARANSI BUG 30-90 HARI // 100% TYPE-SAFE
      </p>

      <div className="h-10 md:h-[48px]" />

      {/* Interactive Code & Architecture Canvas */}
      <div
        className="w-full max-w-[1100px] bg-[#0F0F0F] rounded-lg overflow-hidden relative z-10"
        style={{ border: '2px solid #2D2D2D' }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-[#2D2D2D]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="font-ibm-mono text-[11px] text-[#888888] ml-2">
              atasilabs-core.ts — Next.js App Router + Prisma ORM + Supabase RLS
            </span>
          </div>
          <span className="font-ibm-mono text-[10px] text-[#FFD600] bg-[#1A1A1A] px-2 py-0.5 border border-[#FFD600]">
            LIVE REPL // 99.9% UPTIME
          </span>
        </div>

        <div className="p-6 font-ibm-mono text-[12px] leading-relaxed text-[#A0A0A0] overflow-x-auto bg-[#0A0A0A]">
          <div className="text-[#FF6B35]">// 1. Arsitektur Relasional Prisma & Supabase RLS</div>
          <div>
            <span className="text-[#60A5FA]">export async function</span> <span className="text-[#FFD600]">generateEnterpriseProject</span>(params: ProjectSpec) &#123;
          </div>
          <div className="pl-4">
            <span className="text-[#4ADE80]">const</span> project = <span className="text-[#60A5FA]">await</span> prisma.clientProject.<span className="text-[#FFD600]">create</span>(&#123;
          </div>
          <div className="pl-8 text-[#888888]">
            data: &#123; title: params.title, status: <span className="text-[#FFD600]">'IN_PROGRESS'</span>, ipwStage: <span className="text-[#FFD600]">'STAGE_5_EXECUTION'</span> &#125;
          </div>
          <div className="pl-4">&#125;);</div>
          <br />
          <div className="text-[#FF6B35]">// 2. Otomatisasi 5 Paket Dokumen Official (CIF, RSD, MoU, SPK, BAST)</div>
          <div className="pl-4">
            <span className="text-[#4ADE80]">const</span> documents = <span className="text-[#FFD600]">generateAutoDocumentsForProject</span>(project);
          </div>
          <div className="pl-4">
            <span className="text-[#60A5FA]">return</span> &#123; status: <span className="text-[#4ADE80]">200</span>, contractNominal: project.budget, legalPackage: documents &#125;;
          </div>
          <div>&#125;</div>
        </div>
      </div>

      {/* Collab Cursors Floating Overlay */}
      <CollabCursors />
    </section>
  );
};
