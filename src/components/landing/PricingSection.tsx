'use client';

import React, { useRef, useEffect, useState } from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PricingSection: React.FC = () => {
  const { pricingTiers, setSelectedServiceForInquiry, isLoadingData } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const visibleTiers = pricingTiers.filter((t) => t.active !== false);
  const cardCount = visibleTiers.length > 0 ? visibleTiers.length : 3;

  const handleSelectTier = (tierName: string, tierNumber: number) => {
    setSelectedServiceForInquiry(`Paket Tier ${tierNumber}: ${tierName}`);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The core mechanism: as user scrolls down through the tall section,
  // the sticky container stays pinned and we translate the track horizontally on desktop.
  useEffect(() => {
    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        // On mobile screens (<768px), cards flow vertically so disable horizontal transform
        if (window.innerWidth < 768) {
          track.style.transform = 'none';
          setProgress(0);
          return;
        }

        const rect = section.getBoundingClientRect();
        const navH = 72;
        const sectionH = section.offsetHeight;
        const vh = window.innerHeight;
        const scrollableH = sectionH - vh;

        if (scrollableH <= 0) {
          track.style.transform = 'translateX(0px)';
          setProgress(0);
          return;
        }

        // scrolled = 0 when rect.top == navH (section just arrived under navbar)
        // scrolled = scrollableH when rect.top == -(scrollableH - navH)
        const scrolled = navH - rect.top;
        const p = Math.min(Math.max(scrolled / scrollableH, 0), 1);
        setProgress(p);

        // Calculate how far to translate the track
        const trackW = track.scrollWidth;
        const viewW = track.parentElement ? track.parentElement.clientWidth : vh;
        const maxTranslate = Math.max(0, trackW - viewW);

        track.style.transform = maxTranslate > 0 ? `translateX(-${p * maxTranslate}px)` : 'translateX(0px)';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pricingTiers, isLoadingData]);

  // Section height: optimized vertical scroll room for desktop horizontal scroll
  const sectionHeightVh = cardCount <= 1 ? 100 : Math.max(130, 100 + (cardCount - 1) * 25);

  const scrollSection = (direction: 'next' | 'prev') => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (section && track && cardCount > 1) {
      const sectionH = section.offsetHeight;
      const scrollableH = sectionH - vh;
      const trackW = track.scrollWidth;
      const viewW = track.parentElement ? track.parentElement.clientWidth : vh;
      const maxTranslate = Math.max(0, trackW - viewW);

      if (maxTranslate > 0 && scrollableH > 0) {
        // Target moving approximately 1 card width per button click
        const approxCardW = 310; 
        const step = Math.max(vh * 0.3, (approxCardW / maxTranslate) * scrollableH);
        window.scrollBy({
          top: direction === 'next' ? step : -step,
          behavior: 'smooth',
        });
        return;
      }
    }

    const step = vh * 0.5;
    window.scrollBy({
      top: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative w-full bg-[#080808] h-auto md:h-[var(--section-vh)]"
      style={{ '--section-vh': `${sectionHeightVh}vh` } as React.CSSProperties}
    >
      {/* Sticky container on desktop, static vertical flow on mobile */}
      <div className="relative md:sticky md:top-[72px] h-auto md:h-[calc(100vh-72px)] w-full flex flex-col justify-between py-8 md:py-8 px-6 md:px-[80px] lg:px-[120px] gap-6 md:gap-4 overflow-visible md:overflow-hidden">
        {/* Header & Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 shrink-0 z-10 w-full">
          <div className="flex-1">
            <SectionHeader
              label="[08] // INFORMASI HARGA"
              title="PAKET HEMAT PENGERJAAN CEPAT"
              subtitle="Tanpa Biaya Tersembunyi. Proses Pengerjaan Cepat Dan Efisien."
            />
          </div>

          {/* Navigation Hint & Progress (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0 pb-1 self-end md:self-auto">
            <span className="font-ibm-mono text-[10px] md:text-[11px] text-[#888888] tracking-[1.2px] uppercase">
              ↓ SCROLL / GESER ({cardCount} PAKET)
            </span>
            {/* Visual Mini Progress Bar */}
            <div className="w-16 sm:w-20 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden border border-[#2D2D2D]">
              <div
                className="h-full bg-[#FFD600] rounded-full transition-[width] duration-100 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollSection('prev')}
                aria-label="Previous Pricing Tier"
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] text-[#F5F5F0] hover:text-[#FFD600] transition-colors cursor-pointer font-bold text-xs sm:text-sm"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollSection('next')}
                aria-label="Next Pricing Tier"
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] text-[#F5F5F0] hover:text-[#FFD600] transition-colors cursor-pointer font-bold text-xs sm:text-sm"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Track Container: Stack vertically on mobile, horizontal track on desktop */}
        <div className="w-full flex-1 flex items-center overflow-visible md:overflow-hidden mt-2 md:mt-0">
          <div
            ref={trackRef}
            className="flex flex-col md:flex-row md:flex-nowrap w-full md:w-max gap-4 sm:gap-4 md:gap-5 items-stretch will-change-transform py-1"
            style={{ transition: 'transform 0.04s ease-out' }}
          >
            {isLoadingData && visibleTiers.length === 0 ? (
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex flex-col justify-between p-3.5 sm:p-4 w-full md:w-[290px] lg:w-[310px] xl:w-[330px] shrink-0 bg-[#0F0F0F] border border-[#2D2D2D] h-[370px] animate-pulse"
                >
                  <div className="h-4 bg-[#252525] w-1/3 rounded" />
                  <div className="h-6 bg-[#252525] w-2/3 rounded my-2" />
                  <div className="space-y-2 my-2">
                    <div className="h-3 bg-[#1E1E1E] w-full rounded" />
                    <div className="h-3 bg-[#1E1E1E] w-4/5 rounded" />
                    <div className="h-3 bg-[#1E1E1E] w-3/4 rounded" />
                  </div>
                  <div className="h-8 bg-[#252525] w-full rounded mt-auto" />
                </div>
              ))
            ) : visibleTiers.length === 0 ? (
              <div className="p-8 text-center text-[#888] font-ibm-mono w-full border border-dashed border-[#2D2D2D]">
                [ BELUM ADA PAKET HARGA AKTIF ]
              </div>
            ) : (
              visibleTiers.map((tier) => {
                const isPopular = tier.popular;
                const tierLabel = `TIER 0${tier.tierNumber}`;

                return (
                  <div
                    key={tier.id}
                    className={`flex flex-col justify-between p-4 md:p-4.5 w-full md:w-[290px] lg:w-[310px] xl:w-[330px] shrink-0 transition-colors duration-300 relative ${
                      isPopular
                        ? 'bg-[#111111] border-2 border-[#FFD600] shadow-[0_0_25px_rgba(255,214,0,0.12)]'
                        : 'bg-[#0F0F0F] border border-[#2D2D2D] hover:border-[#555555]'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Badge Header */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex items-center justify-center h-[22px] px-[8px] w-fit ${
                            isPopular
                              ? 'bg-[#FFD600] text-[#0A0A0A] font-bold'
                              : 'bg-[#1A1A1A] border border-[#3D3D3D] text-[#888888]'
                          }`}
                        >
                          <span className="font-ibm-mono text-[10px] md:text-[11px] tracking-[1px]">
                            {isPopular ? '★ POPULER' : tierLabel}
                          </span>
                        </div>
                        {isPopular && (
                          <span className="font-ibm-mono text-[9px] font-bold text-[#FFD600] tracking-[1px] uppercase">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <div className="flex flex-col gap-0.5">
                        <h3
                          className={`font-grotesk text-[17px] md:text-[19px] font-bold tracking-[0.3px] ${
                            isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                          }`}
                        >
                          {tier.name}
                        </h3>
                        <p className="font-ibm-mono text-[10px] text-[#888888] tracking-[0.3px] line-clamp-1">
                          {tier.tagline || 'Paket Rekayasa Perangkat Lunak'}
                        </p>
                      </div>

                      {/* Price Display */}
                      <div className="flex flex-col gap-0.5 py-1 border-y border-[#222222]">
                        {tier.originalPrice && tier.originalPrice > tier.price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-ibm-mono text-[10px] text-[#FF4D4D] line-through font-bold">
                              {formatRupiah(tier.originalPrice)}
                            </span>
                            <span className="font-ibm-mono text-[8px] bg-[#FF4D4D]/20 text-[#FF4D4D] px-1 py-0.2 rounded font-bold border border-[#FF4D4D]/40">
                              DISKON
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-baseline gap-[4px]">
                          <span
                            className={`font-grotesk text-[18px] sm:text-[20px] md:text-[22px] font-bold tracking-[-0.5px] leading-tight ${
                              isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                            }`}
                          >
                            {formatRupiah(tier.price)}
                          </span>
                          <span className="font-ibm-mono text-[10px] text-[#666666] tracking-[0.5px]">
                            /{tier.priceBilling || 'proyek'}
                          </span>
                        </div>
                      </div>

                      {/* Specs & Features List */}
                      <div className="flex flex-col gap-1.5">
                        {/* Specs */}
                        {(tier.specs || []).slice(0, 2).map((spec, i) => (
                          <div key={`spec-${i}`} className="flex items-center justify-between font-ibm-mono text-[10px] md:text-[11px] py-0.5 border-b border-[#1A1A1A]">
                            <span className="text-[#888888] truncate mr-2">{spec.label}</span>
                            <span className="text-[#FFD600] font-bold shrink-0">{spec.value}</span>
                          </div>
                        ))}

                        {/* Main Features */}
                        <div className="space-y-0.5 pt-0.5">
                          {(tier.features || []).slice(0, 4).map((feat, i) => (
                            <div key={`feat-${i}`} className="flex items-start gap-1.5">
                              <span
                                className={`font-ibm-mono text-[11px] leading-tight shrink-0 mt-0.5 ${
                                  isPopular ? 'text-[#FFD600]' : 'text-[#4ADE80]'
                                }`}
                              >
                                +
                              </span>
                              <span className="font-ibm-mono text-[10px] md:text-[10.5px] text-[#A0A09A] tracking-[0.3px] leading-snug line-clamp-1">
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectTier(tier.name, tier.tierNumber)}
                      className={`flex items-center justify-center w-full h-[36px] sm:h-[38px] mt-3 font-grotesk text-[11px] md:text-[12px] font-bold tracking-[1px] transition-all duration-200 cursor-pointer ${
                        isPopular
                          ? 'bg-[#FFD600] text-[#0A0A0A] hover:bg-[#e6c200] shadow-sm'
                          : 'bg-[#1A1A1A] text-[#CCCCCC] border border-[#3D3D3D] hover:border-[#FFD600] hover:text-[#FFD600]'
                      }`}
                    >
                      {tier.ctaText ? tier.ctaText.toUpperCase() : 'PILIH PAKET'} →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
