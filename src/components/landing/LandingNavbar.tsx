'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

const links = [
  { label: 'LAYANAN', section: 'services' },
  { label: 'WORKFLOW', section: 'workflow' },
  { label: 'ARSITEKTUR', section: 'architecture' },
  { label: 'PORTOFOLIO', section: 'portfolio' },
  { label: 'PRICING', section: 'pricing' },
  { label: 'FAQ', section: 'faq' },
  { label: 'KONTAK', section: 'contact' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export const LandingNavbar: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { setActiveView, currentUser, setIsLoginModalOpen } = useApp();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.section);
    const obs: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-35% 0px -60% 0px' }
      );
      o.observe(el);
      obs.push(o);
    });

    return () => obs.forEach((o) => o.disconnect());
  }, []);

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid #1E1E1E' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center justify-between h-[64px] px-6 md:px-[48px] max-w-[1400px] mx-auto">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-[10px] shrink-0 group">
          <AtasiLabsLogo height={32} />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-[32px]">
          {links.map(({ label, section }) => {
            const isActive = active === section;
            return (
              <button
                key={label}
                onClick={() => scrollTo(section)}
                className="relative font-ibm-mono text-[11px] tracking-[1.5px] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                style={{ color: isActive ? '#FFD600' : '#888888' }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F0';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = isActive ? '#FFD600' : '#888888';
                }}
              >
                {label}
                <span
                  className="absolute left-0 -bottom-[3px] h-[2px] bg-[#FFD600] transition-all duration-300"
                  style={{ width: isActive ? '100%' : '0%' }}
                />
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-[12px]">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 h-[38px] px-5 bg-[#FFD600] hover:bg-[#e6c200] text-[#0A0A0A] font-grotesk text-[11px] font-bold tracking-[1.5px] transition-all cursor-pointer border-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#0A0A0A] animate-pulse" />
            LOGIN
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none cursor-pointer text-[#F5F5F0]"
          aria-label="Toggle Menu"
        >
          <span className={`h-[2px] bg-[#FFD600] transition-transform ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`h-[2px] bg-[#F5F5F0] ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-[2px] bg-[#FFD600] transition-transform ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col bg-[#0A0A0A] border-b border-[#2D2D2D] px-6 py-6 gap-4">
          {links.map(({ label, section }) => (
            <button
              key={label}
              onClick={() => {
                scrollTo(section);
                setMenuOpen(false);
              }}
              className="text-left font-ibm-mono text-[12px] text-[#F5F5F0] tracking-[2px] py-2 border-b border-[#1A1A1A] bg-transparent"
            >
              // {label}
            </button>
          ))}
          <button
            onClick={() => {
              router.push('/login');
              setMenuOpen(false);
            }}
            className="mt-2 h-[44px] bg-[#FFD600] text-[#0A0A0A] font-grotesk text-[12px] font-bold tracking-[2px] border-none cursor-pointer"
          >
            LOGIN
          </button>
        </div>
      )}
    </header>
  );
};
