'use client';

import React, { useState } from 'react';

const logos = [
  'UMKM & BISNIS LOKAL',
  'PERUSAHAAN / KORPORASI',
  'LEMBAGA PENDIDIKAN',
  'PEMERINTAH & INSTANSI PUBLIK',
  'STARTUP & TEKNOLOGI',
];

export function Logos() {
  const [activeLogo, setActiveLogo] = useState<string | null>(null);

  const handleMouseUp = (logo: string) => {
    setActiveLogo(logo);
    setTimeout(() => {
      setActiveLogo(null);
    }, 300);
  };

  return (
    <section className="flex flex-col items-center w-full bg-[#0F0F0F] py-[44px] px-6 md:px-[80px] gap-[24px] border-y border-[#1E1E1E]">
      <span className="font-ibm-mono text-[10px] md:text-[11px] text-[#666666] tracking-[3px]">
        [00] // SOLUSI UNTUK BERBAGAI SKALA BISNIS
      </span>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-[36px] w-full">
        {logos.map((logo) => {
          const isActive = activeLogo === logo;
          return (
            <span
              key={logo}
              onMouseUp={() => handleMouseUp(logo)}
              className={`inline-block font-grotesk text-[11px] md:text-[13px] font-bold text-[#FFD600] border border-[#FFD600] tracking-[2px] px-4 py-2 bg-[#1A180E] cursor-pointer select-none transition-all duration-200 hover:scale-105 hover:bg-[#FFD600] hover:text-[#0A0A0A] hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] active:scale-95 ${
                isActive ? 'scale-110 shadow-[0_0_30px_rgba(255,214,0,0.8)] bg-[#FFD600] text-[#0A0A0A]' : ''
              }`}
            >
              {logo}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default Logos;

