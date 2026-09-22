'use client';

import React from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  bgColor?: string;
  accentColor: string;
}

function TestimonialCard({
  quote,
  name,
  role,
  company,
  avatarUrl,
  bgColor = '#111111',
  accentColor,
}: TestimonialCardProps) {
  return (
    <div
      className="flex flex-col justify-between gap-6 p-8 md:p-[36px] border-l-4 w-full transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: bgColor, borderLeftColor: accentColor }}
    >
      <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#CCCCCC] tracking-[0.5px] leading-[1.65] italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-[14px] pt-2 border-t border-[#222222]">
        {avatarUrl && avatarUrl.trim() !== '' ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-[42px] h-[42px] rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: accentColor }}
          />
        ) : (
          <div
            className="w-[42px] h-[42px] rounded-full bg-[#222222] border-2 shrink-0 flex items-center justify-center font-grotesk text-sm text-[#FFD600] font-bold"
            style={{ borderColor: accentColor }}
          >
            {name ? name.charAt(0) : 'T'}
          </div>
        )}
        <div className="flex flex-col gap-[2px]">
          <span className="font-grotesk text-[14px] font-bold text-[#F5F5F0] tracking-[0.5px]">
            {name}
          </span>
          <span className="font-ibm-mono text-[11px] text-[#888888] tracking-[0.5px]">
            {role} {company && <span className="text-[#FFD600] font-semibold">• {company}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

export const TestimonialsSection: React.FC = () => {
  const { testimonials } = useApp();

  const activeTestimonials = (testimonials || []).filter((item) => item.featured !== false);

  return (
    <section id="testimonials" className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[04] // KEPERCAYAAN KLIEN"
        title={"KEPUASAN MEREKA\nPRIORITAS KAMI"}
        subtitle="KATA MEREKA YANG SUDAH MERASAKAN LAYANAN DIGITAL ATASILABS."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6 items-stretch">
        {activeTestimonials.map((item, index) => {
          const colors = ['#FFD600', '#06B6D4', '#3B82F6', '#10B981', '#8B5CF6'];
          const accentColor = item.accentColor || colors[index % colors.length];
          const bgColor = item.bgColor || '#111111';

          return (
            <TestimonialCard
              key={item.id}
              quote={item.quote}
              name={item.name}
              role={item.role}
              company={item.company}
              avatarUrl={item.avatarUrl}
              bgColor={bgColor}
              accentColor={accentColor}
            />
          );
        })}
      </div>
    </section>
  );
};

export default TestimonialsSection;
