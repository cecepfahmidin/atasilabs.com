'use client';

import React from 'react';
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
  const { pricingTiers, setSelectedServiceForInquiry } = useApp();

  const handleSelectTier = (tierName: string, tierNumber: number) => {
    setSelectedServiceForInquiry(`Paket Tier ${tierNumber}: ${tierName}`);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[09] // TRANSPARENT PRICING"
        title={"PAKET DEDIKASI.\nTRANSPARAN."}
        subtitle="TANPA BIAYA TERSEMBUNYI. PENGEMBANGAN SOFTWARE INDUSTRIAL GRADE DENGAN MODEL SPRINT BISA DIATUR."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
        {pricingTiers.map((tier) => {
          const isPopular = tier.popular;
          const tierLabel = `TIER 0${tier.tierNumber}`;

          return (
            <div
              key={tier.id}
              className={`flex flex-col justify-between p-6 md:p-[36px] w-full transition-all duration-300 relative ${
                isPopular
                  ? 'bg-[#111111] border-2 border-[#FFD600] shadow-[0_0_35px_rgba(255,214,0,0.15)] lg:-translate-y-2'
                  : 'bg-[#0F0F0F] border border-[#2D2D2D] hover:border-[#555555]'
              }`}
            >
              <div className="flex flex-col gap-6">
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center justify-center h-[28px] px-[12px] w-fit ${
                      isPopular
                        ? 'bg-[#FFD600] text-[#0A0A0A] font-bold'
                        : 'bg-[#1A1A1A] border border-[#3D3D3D] text-[#888888]'
                    }`}
                  >
                    <span className="font-ibm-mono text-[11px] tracking-[2px]">
                      {isPopular ? '★ RECOMMENDED' : tierLabel}
                    </span>
                  </div>
                  {isPopular && (
                    <span className="font-ibm-mono text-[9px] font-bold text-[#FFD600] tracking-[1.5px] uppercase">
                      MOST POPULAR
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <div className="flex flex-col gap-1">
                  <h3
                    className={`font-grotesk text-[24px] md:text-[26px] font-bold tracking-[0.5px] ${
                      isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p className="font-ibm-mono text-[11px] text-[#666666] tracking-[0.5px]">
                    {tier.tagline || 'Paket Rekayasa Perangkat Lunak'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-end gap-[6px] py-2 border-y border-[#222222]">
                  <span
                    className={`font-grotesk text-[26px] xl:text-[32px] font-bold tracking-[-1px] leading-none ${
                      isPopular ? 'text-[#FFD600]' : 'text-[#F5F5F0]'
                    }`}
                  >
                    {formatRupiah(tier.price)}
                  </span>
                  <span className="font-ibm-mono text-[11px] text-[#555555] tracking-[1px] mb-[2px]">
                    /{tier.priceBilling || 'PROYEK'}
                  </span>
                </div>

                {/* Specs & Features List */}
                <div className="flex flex-col gap-[12px]">
                  <span className="font-grotesk text-[10px] font-bold text-[#888888] tracking-[2px] uppercase">
                    DELIVERABLES & SCOPE:
                  </span>

                  {/* Specs */}
                  {(tier.specs || []).map((spec, i) => (
                    <div key={`spec-${i}`} className="flex items-center justify-between font-ibm-mono text-[11px] py-1 border-b border-[#1A1A1A]">
                      <span className="text-[#888888]">{spec.label}</span>
                      <span className="text-[#FFD600] font-bold">{spec.value}</span>
                    </div>
                  ))}

                  {/* Main Features */}
                  {(tier.features || []).map((feat, i) => (
                    <div key={`feat-${i}`} className="flex items-start gap-3">
                      <span
                        className={`font-ibm-mono text-[13px] leading-none shrink-0 mt-0.5 ${
                          isPopular ? 'text-[#FFD600]' : 'text-[#4ADE80]'
                        }`}
                      >
                        +
                      </span>
                      <span className="font-ibm-mono text-[11px] text-[#A0A09A] tracking-[0.5px]">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectTier(tier.name, tier.tierNumber)}
                className={`flex items-center justify-center w-full h-[48px] mt-8 font-grotesk text-[12px] font-bold tracking-[2px] transition-all duration-200 ${
                  isPopular
                    ? 'bg-[#FFD600] text-[#0A0A0A] hover:bg-[#e6c200] shadow-md'
                    : 'bg-[#1A1A1A] text-[#CCCCCC] border-2 border-[#3D3D3D] hover:border-[#FFD600] hover:text-[#FFD600]'
                }`}
              >
                {tier.ctaText ? tier.ctaText.toUpperCase() : 'PILIH PAKET PROYEK'} →
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
