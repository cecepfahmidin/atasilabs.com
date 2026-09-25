'use client';

import React, { useRef } from 'react';
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleSelectTier = (tierName: string, tierNumber: number) => {
    setSelectedServiceForInquiry(`Paket Tier ${tierNumber}: ${tierName}`);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[120px] gap-10 md:gap-[48px]">
      {/* Header Banner & Navigation Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeader
          label="[08] // INFORMASI HARGA"
          title={"PAKET HEMAT\nPENGERJAAN CEPAT"}
          subtitle="TANPA BIAYA TERSEMBUNYI. PROSES PENGERJAAN YANG CEPAT DAN EFIISIEN."
        />

        {/* Navigation Buttons & Scroll Hint */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] uppercase">
            ↔ GESER PAKET ({pricingTiers.length})
          </span>
          <button
            onClick={scrollLeft}
            aria-label="Previous Tier"
            className="flex items-center justify-center w-11 h-11 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] text-[#F5F5F0] hover:text-[#FFD600] transition-colors cursor-pointer font-bold text-lg"
          >
            ←
          </button>
          <button
            onClick={scrollRight}
            aria-label="Next Tier"
            className="flex items-center justify-center w-11 h-11 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] text-[#F5F5F0] hover:text-[#FFD600] transition-colors cursor-pointer font-bold text-lg"
          >
            →
          </button>
        </div>
      </div>

      {/* 1-Row Carousel Container */}
      <div
        ref={carouselRef}
        className="flex flex-nowrap overflow-x-auto gap-6 md:gap-8 w-full items-stretch pb-6 snap-x snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#333333 #111111',
        }}
      >
        {isLoadingData ? (
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex flex-col justify-between p-6 md:p-[36px] w-[320px] sm:w-[370px] md:w-[410px] shrink-0 bg-[#0F0F0F] border border-[#2D2D2D] h-[480px] animate-pulse"
            >
              <div className="h-6 bg-[#252525] w-1/3 rounded" />
              <div className="h-10 bg-[#252525] w-2/3 rounded my-4" />
              <div className="space-y-3 my-4">
                <div className="h-4 bg-[#1E1E1E] w-full rounded" />
                <div className="h-4 bg-[#1E1E1E] w-4/5 rounded" />
                <div className="h-4 bg-[#1E1E1E] w-3/4 rounded" />
              </div>
              <div className="h-12 bg-[#252525] w-full rounded mt-auto" />
            </div>
          ))
        ) : pricingTiers.length === 0 ? (
          <div className="p-8 text-center text-[#888] font-ibm-mono w-full border border-dashed border-[#2D2D2D]">
            [ BELUM ADA DATA PRICING DI SUPABASE DATABASE ]
          </div>
        ) : (
        pricingTiers.map((tier) => {
          const isPopular = tier.popular;
          const tierLabel = `TIER 0${tier.tierNumber}`;

          return (
            <div
              key={tier.id}
              className={`flex flex-col justify-between p-6 md:p-[36px] w-[320px] sm:w-[370px] md:w-[410px] shrink-0 snap-start transition-all duration-300 relative ${isPopular
                ? 'bg-[#111111] border-2 border-[#FFD600] shadow-[0_0_35px_rgba(255,214,0,0.15)]'
                : 'bg-[#0F0F0F] border border-[#2D2D2D] hover:border-[#555555]'
                }`}
            >
              <div className="flex flex-col gap-6">
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center justify-center h-[30px] px-[14px] w-fit ${isPopular
                      ? 'bg-[#FFD600] text-[#0A0A0A] font-bold'
                      : 'bg-[#1A1A1A] border border-[#3D3D3D] text-[#888888]'
                      }`}
                  >
                    <span className="font-ibm-mono text-[12px] md:text-[13px] tracking-[2px]">
                      {isPopular ? '★ RECOMMENDED' : tierLabel}
                    </span>
                  </div>
                  {isPopular && (
                    <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[1.5px] uppercase">
                      MOST POPULAR
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <div className="flex flex-col gap-1.5">
                  <h3
                    className={`font-grotesk text-[28px] md:text-[30px] font-bold tracking-[0.5px] ${isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                      }`}
                  >
                    {tier.name}
                  </h3>
                  <p className="font-ibm-mono text-[13px] md:text-[14px] text-[#888888] tracking-[0.5px]">
                    {tier.tagline || 'Paket Rekayasa Perangkat Lunak'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex flex-col gap-1 py-3 border-y border-[#222222]">
                  {tier.originalPrice && tier.originalPrice > tier.price ? (
                    <div className="flex items-center gap-2">
                      <span className="font-ibm-mono text-[13px] md:text-[14px] text-[#FF4D4D] line-through font-bold">
                        {formatRupiah(tier.originalPrice)}
                      </span>
                      <span className="font-ibm-mono text-[10px] bg-[#FF4D4D]/20 text-[#FF4D4D] px-2 py-0.5 rounded font-bold border border-[#FF4D4D]/40">
                        HEMAT DISKON
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-end gap-[6px]">
                    <span
                      className={`font-grotesk text-[30px] xl:text-[36px] font-bold tracking-[-1px] leading-none ${isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                        }`}
                    >
                      {formatRupiah(tier.price)}
                    </span>
                    <span className="font-ibm-mono text-[13px] md:text-[14px] text-[#666666] tracking-[1px] mb-[2px]">
                      /{tier.priceBilling || 'PROYEK'}
                    </span>
                  </div>
                </div>

                {/* Specs & Features List */}
                <div className="flex flex-col gap-[14px]">
                  <span className="font-grotesk text-[12px] font-bold text-[#888888] tracking-[2px] uppercase">
                    DELIVERABLES & SCOPE:
                  </span>

                  {/* Specs */}
                  {(tier.specs || []).map((spec, i) => (
                    <div key={`spec-${i}`} className="flex items-center justify-between font-ibm-mono text-[13px] md:text-[14px] py-1.5 border-b border-[#1A1A1A]">
                      <span className="text-[#888888]">{spec.label}</span>
                      <span className="text-[#FFD600] font-bold">{spec.value}</span>
                    </div>
                  ))}

                  {/* Main Features */}
                  {(tier.features || []).map((feat, i) => (
                    <div key={`feat-${i}`} className="flex items-start gap-3">
                      <span
                        className={`font-ibm-mono text-[15px] leading-none shrink-0 mt-0.5 ${isPopular ? 'text-[#FFD600]' : 'text-[#4ADE80]'
                          }`}
                      >
                        +
                      </span>
                      <span className="font-ibm-mono text-[13px] md:text-[14px] text-[#A0A09A] tracking-[0.5px] leading-[1.5]">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectTier(tier.name, tier.tierNumber)}
                className={`flex items-center justify-center w-full h-[52px] mt-8 font-grotesk text-[14px] font-bold tracking-[2px] transition-all duration-200 ${isPopular
                  ? 'bg-[#FFD600] text-[#0A0A0A] hover:bg-[#e6c200] shadow-md'
                  : 'bg-[#1A1A1A] text-[#CCCCCC] border-2 border-[#3D3D3D] hover:border-[#FFD600] hover:text-[#FFD600]'
                  }`}
              >
                {tier.ctaText ? tier.ctaText.toUpperCase() : 'PILIH PAKET PROYEK'} →
              </button>
            </div>
          );
        })
        )}
      </div>
    </section>
  );
};

export default PricingSection;
