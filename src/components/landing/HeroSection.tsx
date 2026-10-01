'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { GlitchText } from './GlitchText';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { currentUser, setActiveView } = useApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col items-center w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] overflow-hidden">
      {/* Version & Industrial System Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[32px] px-[12px] md:px-[16px] bg-[#1A1A1A] border-2 border-[#FFD600]">
        <div className="w-[8px] h-[8px] bg-[#FFD600] shrink-0 animate-pulse" />
        <span className="font-ibm-mono text-[9px] md:text-[11px] font-bold text-[#FFD600] tracking-[1px] md:tracking-[2px] whitespace-nowrap">
          BUILD YOUR DIGITAL FUTURE
        </span>
      </div>

      <div className="h-4 md:h-[16px]" />

      {/* Main Glitch Headlines */}
      <h1 className="font-grotesk text-[clamp(32px,8vw,90px)] font-bold text-[#F5F5F0] tracking-[-1px] leading-none text-center w-full max-w-[1100px]">
        <GlitchText text="PENGEN WEBSITE KEREN?" speed={40} delay={100} />
      </h1>
      <h1 className="font-grotesk text-[clamp(32px,8vw,90px)] font-bold text-[#FFD600] tracking-[-1px] leading-none text-center w-full max-w-[1100px] mt-2">
        <GlitchText text="KITA BANGUN BERSAMA!" speed={40} delay={400} />
      </h1>

      <div className="h-6 md:h-[24px]" />

      {/* Subtitle Description */}
      <p className="font-ibm-mono text-[15px] md:text-[18px] text-[#A0A0A0] leading-[22px] md:leading-[28px] tracking-[1px] max-w-[800px] text-center">
        Ceritain aja konsep web impianmu, pilih paketnya, dan biarkan tim kami yang handle sisanya dengan transparan dan profesional.
      </p>

      <div className="h-8 md:h-[32px]" />

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-[16px] w-full sm:w-auto z-30">
        <button
          onClick={scrollToContact}
          className="flex items-center justify-center w-full max-w-[280px] sm:w-[230px] h-[56px] bg-[#FFD600] hover:bg-[#e6c200] transition-colors border-none cursor-pointer"
        >
          <span className="font-ibm-mono text-[12px] font-bold text-[#0A0A0A] tracking-[2px]">
            MULAI KONSULTASI GRATIS
          </span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setActiveView('dashboard');
              router.push('/dashboard');
            } else {
              router.push('/login');
            }
          }}
          className="flex items-center justify-center w-full max-w-[280px] sm:w-[230px] h-[56px] bg-[#0A0A0A] border-2 border-[#3D3D3D] hover:border-[#FFD600] transition-colors cursor-pointer text-[#F5F5F0] group"
        >
          <span className="font-ibm-mono text-[12px] text-[#888888] group-hover:text-[#FFD600] tracking-[1.5px] transition-colors">
            {mounted && currentUser ? 'DASHBOARD >' : 'LOGIN >'}
          </span>
        </button>
      </div>

      <div className="h-6 md:h-[24px]" />

      <p className="font-ibm-mono text-[11px] text-[#FFFFFF] font-semibold tracking-[2px] text-center">
        BUILD YOUR DIGITAL FUTURE WITH ATASILABS TEAM
      </p>
    </section>
  );
};

export default HeroSection;
