'use client';

import React from 'react';
import GlitchText from './GlitchText';

export const FinalCTA: React.FC = () => {
  const scrollToContact = () => {
    const elem = document.getElementById('contact');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="flex flex-col items-center w-full bg-[#0A0A0A] py-16 px-6 md:p-[120px] gap-10 md:gap-[48px] border-t-2 border-t-[#FFD600]">
      {/* Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[32px] px-[16px] bg-[#1A1A1A] border-2 border-[#FFD600]">
        <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">
          <GlitchText text="[SIAP MEMBANGUN SOFTWARE?]" speed={30} />
        </span>
      </div>

      {/* Title */}
      <h2 className="font-grotesk text-[40px] md:text-[72px] font-bold text-[#F5F5F0] tracking-[-1px] leading-none text-center w-full max-w-[1000px] whitespace-pre-line">
        <GlitchText text={"BERHENTI RAGU\nMULAI PROYEK ANDA SEKARANG"} speed={40} delay={200} />
      </h2>

      {/* Subtitle */}
      <p className="font-ibm-mono text-[15px] md:text-[18px] text-[#888888] tracking-[0.5px] text-center w-full max-w-[700px] px-2">
        <GlitchText text="APAKAH ANDA SIAP MENGUBAH IDE MENJADI KENYATAAN? KAMI SIAP MEMBANTU MEWUJUDKANNYA." speed={20} delay={450} />
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-[16px] w-full sm:w-auto">
        <button
          onClick={scrollToContact}
          className="flex items-center justify-center w-full sm:w-[260px] h-[64px] bg-[#FFD600] hover:bg-[#e6c200] transition-colors"
        >
          <span className="font-grotesk text-[13px] font-bold text-[#0A0A0A] tracking-[2px]">
            MULAI PROYEK SEKARANG
          </span>
        </button>
        <a
          href="#services"
          className="flex items-center justify-center w-full sm:w-[220px] h-[64px] bg-[#0A0A0A] border-2 border-[#3D3D3D] hover:border-[#888888] transition-colors"
        >
          <span className="font-ibm-mono text-[12px] text-[#888888] tracking-[2px]">
            LIHAT SERVICES
          </span>
        </a>
      </div>
    </section>
  );
};

export default FinalCTA;
