'use client';

import React, { useRef, useEffect, useState } from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';
import { PricingTier } from '../../types';

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PricingSection: React.FC = () => {
  const { pricingTiers, setSelectedServiceForInquiry, isLoadingData, companyContact } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTierDetail, setSelectedTierDetail] = useState<PricingTier | null>(null);

  const visibleTiers = pricingTiers.filter((t) => t.active !== false);
  const cardCount = visibleTiers.length > 0 ? visibleTiers.length : 3;

  const handleSelectTier = (tierName: string, tierNumber: number) => {
    setSelectedServiceForInquiry(`Paket Tier ${tierNumber}: ${tierName}`);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (selectedTierDetail) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedTierDetail(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedTierDetail]);

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
  const sectionHeightVh = cardCount <= 1 ? 100 : Math.max(140, 100 + (cardCount - 1) * 35);

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
        const approxCardW = 400;
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
      <div className="relative md:sticky md:top-[72px] h-auto md:h-[calc(100vh-72px)] w-full flex flex-col justify-between py-8 md:py-8 px-6 md:px-[120px] gap-6 md:gap-4 overflow-visible md:overflow-hidden">
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
        <div className="w-full flex-1 flex items-center overflow-visible md:overflow-hidden mt-2 md:mt-0" style={{ '--card-w': 'calc((100% - 48px) / 3)' } as React.CSSProperties}>
          <div
            ref={trackRef}
            className="flex flex-col md:flex-row md:flex-nowrap w-full md:w-max gap-6 items-stretch will-change-transform py-2"
            style={{ transition: 'transform 0.04s ease-out' }}
          >
            {isLoadingData && visibleTiers.length === 0 ? (
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex flex-col justify-between p-5 sm:p-6 w-full lg:w-[var(--card-w)] md:w-[calc((100%-24px)/2)] shrink-0 bg-[#0F0F0F] border border-[#2D2D2D] rounded-lg min-h-[460px] animate-pulse"
                >
                  <div className="h-5 bg-[#252525] w-1/3 rounded" />
                  <div className="h-7 bg-[#252525] w-2/3 rounded my-3" />
                  <div className="space-y-3 my-3">
                    <div className="h-4 bg-[#1E1E1E] w-full rounded" />
                    <div className="h-4 bg-[#1E1E1E] w-4/5 rounded" />
                    <div className="h-4 bg-[#1E1E1E] w-3/4 rounded" />
                  </div>
                  <div className="h-11 bg-[#252525] w-full rounded mt-auto" />
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
                    onClick={() => setSelectedTierDetail(tier)}
                    className={`flex flex-col justify-between p-5 md:p-6 w-full lg:w-[var(--card-w)] md:w-[calc((100%-24px)/2)] shrink-0 transition-all duration-300 relative rounded-lg cursor-pointer group hover:scale-[1.01] ${isPopular
                      ? 'bg-[#111111] border-2 border-[#FFD600] shadow-[0_0_35px_rgba(255,214,0,0.18)] hover:shadow-[0_0_45px_rgba(255,214,0,0.3)]'
                      : 'bg-[#0F0F0F] border border-[#2D2D2D] hover:border-[#FFD600]/70 hover:bg-[#141414]'
                      }`}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Badge Header */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex items-center justify-center h-[26px] px-[10px] w-fit rounded-sm ${isPopular
                            ? 'bg-[#FFD600] text-[#0A0A0A] font-bold'
                            : 'bg-[#1A1A1A] border border-[#3D3D3D] text-[#888888]'
                            }`}
                        >
                          <span className="font-ibm-mono text-[11px] md:text-[12px] tracking-[1px]">
                            {isPopular ? '★ POPULER' : tierLabel}
                          </span>
                        </div>
                        {isPopular && (
                          <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] tracking-[1.2px] uppercase">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <div className="flex flex-col gap-1">
                        <h3
                          className={`font-grotesk text-[20px] md:text-[23px] lg:text-[25px] font-bold tracking-[0.3px] group-hover:text-[#FFD600] transition-colors ${isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                            }`}
                        >
                          {tier.name}
                        </h3>
                        <p className="font-ibm-mono text-[11px] md:text-[12px] text-[#888888] tracking-[0.3px] leading-relaxed line-clamp-2">
                          {tier.tagline || 'Paket Rekayasa Perangkat Lunak & Sistem Terintegrasi'}
                        </p>
                      </div>

                      {/* Price Display */}
                      <div className="flex flex-col gap-1 py-2.5 border-y border-[#222222]">
                        {tier.originalPrice && tier.originalPrice > tier.price ? (
                          <div className="flex items-center gap-2">
                            <span className="font-ibm-mono text-[11px] md:text-[12px] text-[#FF4D4D] line-through font-bold">
                              {formatRupiah(tier.originalPrice)}
                            </span>
                            <span className="font-ibm-mono text-[9px] md:text-[10px] bg-[#FF4D4D]/20 text-[#FF4D4D] px-1.5 py-0.5 rounded font-bold border border-[#FF4D4D]/40">
                              DISKON SPECIAL
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-baseline gap-[6px]">
                          <span
                            className={`font-grotesk text-[24px] sm:text-[28px] md:text-[32px] font-bold tracking-[-0.5px] leading-tight ${isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                              }`}
                          >
                            {formatRupiah(tier.price)}
                          </span>
                          <span className="font-ibm-mono text-[11px] md:text-[12px] text-[#666666] tracking-[0.5px]">
                            /{tier.priceBilling || 'proyek'}
                          </span>
                        </div>
                      </div>

                      {/* Specs & Features List */}
                      <div className="flex flex-col gap-2.5">
                        {/* Specs */}
                        {(tier.specs || []).slice(0, 3).map((spec, i) => (
                          <div key={`spec-${i}`} className="flex items-center justify-between font-ibm-mono text-[11px] md:text-[12px] py-1 border-b border-[#1A1A1A]">
                            <span className="text-[#888888] truncate mr-2">{spec.label}</span>
                            <span className="text-[#FFD600] font-bold shrink-0">{spec.value}</span>
                          </div>
                        ))}

                        {/* Main Features */}
                        <div className="space-y-1.5 pt-1">
                          {(tier.features || []).slice(0, 6).map((feat, i) => (
                            <div key={`feat-${i}`} className="flex items-start gap-2">
                              <span
                                className={`font-ibm-mono text-[13px] leading-tight shrink-0 mt-0.5 ${isPopular ? 'text-[#FFD600]' : 'text-[#4ADE80]'
                                  }`}
                              >
                                +
                              </span>
                              <span className="font-ibm-mono text-[11px] md:text-[12px] text-[#B0B0AA] tracking-[0.3px] leading-snug line-clamp-2">
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clickable prompt hint */}
                      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#1C1C1C] text-[10px] md:text-[11px] font-ibm-mono text-[#888888] group-hover:text-[#FFD600] transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFD600] group-hover:animate-ping" />
                          DESKRIPSI LENGKAP
                        </span>
                        <span className="font-bold underline underline-offset-2">LIHAT DETAIL ↗</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTier(tier.name, tier.tierNumber);
                      }}
                      className={`flex items-center justify-center w-full h-[44px] md:h-[48px] mt-4 rounded font-grotesk text-[12px] md:text-[13px] font-bold tracking-[1.5px] transition-all duration-200 cursor-pointer ${isPopular
                        ? 'bg-[#FFD600] text-[#0A0A0A] hover:bg-[#e6c200] shadow-md hover:scale-[1.01]'
                        : 'bg-[#1A1A1A] text-[#CCCCCC] border border-[#3D3D3D] hover:border-[#FFD600] hover:text-[#FFD600] hover:bg-[#222222]'
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

      {/* MODAL DESKRIPSI LENGKAP TIER PRICING */}
      {selectedTierDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6"
          onClick={() => setSelectedTierDetail(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-[#0E0E0E] border-2 border-[#FFD600] rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#141414] border-b border-[#242424] shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-ibm-mono text-[11px] bg-[#FFD600] text-[#0A0A0A] px-2 py-0.5 font-bold rounded-sm">
                  TIER 0{selectedTierDetail.tierNumber}
                </span>
                <span className="font-ibm-mono text-[11px] text-[#888888] tracking-[1px] uppercase">
                  DESKRIPSI & SPESIFIKASI LENGKAP
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTierDetail(null)}
                className="flex items-center gap-1 font-ibm-mono text-[11px] text-[#888888] hover:text-[#FFD600] transition-colors px-2.5 py-1 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#333333] rounded cursor-pointer"
                aria-label="Tutup Detail"
              >
                <span>✕</span>
                <span className="hidden sm:inline">TUTUP [ESC]</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* Tier Title & Tagline */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-grotesk text-[26px] sm:text-[32px] font-bold text-[#F5F5F0]">
                    {selectedTierDetail.name}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTierDetail.popular && (
                      <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] bg-[#FFD600]/10 border border-[#FFD600]/40 px-2 py-1 rounded">
                        ★ REKOMENDASI POPULER
                      </span>
                    )}
                    {selectedTierDetail.highlightBadge && (
                      <span className="font-ibm-mono text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/40 px-2 py-1 rounded">
                        {selectedTierDetail.highlightBadge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-ibm-mono text-[12px] sm:text-[13px] text-[#B0B0B0] leading-relaxed">
                  {selectedTierDetail.tagline || 'Paket Rekayasa Perangkat Lunak & Sistem Terintegrasi'}
                </p>
              </div>

              {/* Pricing & Key Terms Card */}
              <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  {selectedTierDetail.originalPrice && selectedTierDetail.originalPrice > selectedTierDetail.price ? (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-ibm-mono text-[12px] text-[#FF4D4D] line-through font-bold">
                        {formatRupiah(selectedTierDetail.originalPrice)}
                      </span>
                      <span className="font-ibm-mono text-[10px] bg-[#FF4D4D]/20 text-[#FF4D4D] px-2 py-0.5 rounded font-bold border border-[#FF4D4D]/40">
                        DISKON SPESIAL
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-baseline gap-2">
                    <span className="font-grotesk text-[28px] sm:text-[36px] font-bold text-[#FFD600] tracking-[-0.5px]">
                      {formatRupiah(selectedTierDetail.price)}
                    </span>
                    <span className="font-ibm-mono text-[12px] text-[#888888]">
                      /{selectedTierDetail.priceBilling || 'proyek'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 font-ibm-mono text-[11px] w-full sm:w-auto">
                  {selectedTierDetail.deliveryTime && (
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#1C1C1C] px-3 py-1.5 rounded border border-[#2D2D2D]">
                      <span className="text-[#888888]">ESTIMASI:</span>
                      <span className="text-[#FFD600] font-bold">{selectedTierDetail.deliveryTime}</span>
                    </div>
                  )}
                  {selectedTierDetail.revisionCount && (
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#1C1C1C] px-3 py-1.5 rounded border border-[#2D2D2D]">
                      <span className="text-[#888888]">GARANSI:</span>
                      <span className="text-[#4ADE80] font-bold">{selectedTierDetail.revisionCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Audience / Cocok Untuk */}
              {selectedTierDetail.idealFor && (
                <div className="bg-[#121212] border-l-4 border-[#FFD600] p-4 rounded-r-lg">
                  <span className="font-grotesk text-[10px] font-bold text-[#FFD600] tracking-[1.5px] uppercase block mb-1">
                    TARGET PENGGUNA & REKOMENDASI PENGGUNAAN:
                  </span>
                  <p className="font-ibm-mono text-[12px] sm:text-[13px] text-[#E0E0E0] leading-relaxed">
                    {selectedTierDetail.idealFor}
                  </p>
                </div>
              )}

              {/* Specs Grid */}
              {selectedTierDetail.specs && selectedTierDetail.specs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                    <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[1.5px]">
                      SPESIFIKASI TEKNIS LENGKAP
                    </span>
                    <span className="font-ibm-mono text-[10px] text-[#888888]">
                      {selectedTierDetail.specs.length} SPESIFIKASI
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTierDetail.specs.map((spec, idx) => (
                      <div
                        key={`detail-spec-${idx}`}
                        className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#222222] rounded font-ibm-mono text-[11px]"
                      >
                        <span className="text-[#888888] truncate mr-2">{spec.label}</span>
                        <span className="text-[#FFD600] font-bold shrink-0">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Features Checklist */}
              {selectedTierDetail.features && selectedTierDetail.features.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                    <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[1.5px]">
                      SELURUH FITUR & LAYANAN TERMASUK
                    </span>
                    <span className="font-ibm-mono text-[10px] text-[#4ADE80] font-bold">
                      {selectedTierDetail.features.length} FITUR TERMASUK
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTierDetail.features.map((feat, idx) => (
                      <div
                        key={`detail-feat-${idx}`}
                        className="flex items-start gap-2.5 p-2.5 bg-[#121212] border border-[#1E1E1E] rounded"
                      >
                        <span className="font-ibm-mono text-[#4ADE80] font-bold text-[13px] leading-tight shrink-0">
                          ✓
                        </span>
                        <span className="font-ibm-mono text-[11px] sm:text-[12px] text-[#D0D0CA] leading-snug">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Studio Guarantee Banner */}
              <div className="p-3.5 bg-[#111111] border border-[#262626] rounded text-[11px] font-ibm-mono text-[#888888] leading-relaxed flex items-center gap-3">
                <span className="text-[#FFD600] text-lg font-bold">🛡</span>
                <span>
                  Setiap paket dikerjakan langsung oleh engineer profesional AtasiLabs. Dilengkapi jaminan garansi source code, deployment production, dan sesi onboarding/handover lengkap.
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 bg-[#141414] border-t border-[#242424] shrink-0">
              <a
                href={`https://wa.me/${companyContact?.whatsappRaw || '628216361428'}?text=${encodeURIComponent(
                  `Halo AtasiLabs, saya ingin konsultasi detail paket ${selectedTierDetail.name} (Tier 0${selectedTierDetail.tierNumber}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 h-[44px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#4ADE80] text-[#4ADE80] font-ibm-mono text-[11px] font-bold tracking-[0.5px] rounded transition-colors"
              >
                <span>CHAT WHATSAPP ↗</span>
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedTierDetail(null)}
                  className="flex-1 sm:flex-none px-4 h-[44px] bg-transparent hover:bg-[#222222] border border-[#333333] text-[#888888] hover:text-[#F5F5F0] font-ibm-mono text-[11px] tracking-[1px] rounded transition-colors cursor-pointer"
                >
                  TUTUP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tierName = selectedTierDetail.name;
                    const tierNumber = selectedTierDetail.tierNumber;
                    setSelectedTierDetail(null);
                    handleSelectTier(tierName, tierNumber);
                  }}
                  className="flex-1 sm:flex-none px-6 h-[44px] bg-[#FFD600] hover:bg-[#e6c200] text-[#0A0A0A] font-grotesk text-[12px] font-bold tracking-[1.2px] rounded transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                >
                  PILIH PAKET INI →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PricingSection;
