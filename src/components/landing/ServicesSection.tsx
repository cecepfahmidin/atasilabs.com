'use client';

import React from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';

interface FeatureCardProps {
  iconColor: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  bgColor?: string;
  borderColor?: string;
  serviceName: string;
  numberStr: string;
}

function FeatureCard({
  iconColor,
  title,
  description,
  tag,
  tagColor,
  bgColor = '#111111',
  borderColor = '#2D2D2D',
  serviceName,
  numberStr,
}: FeatureCardProps) {
  const { setSelectedServiceForInquiry } = useApp();

  const handleClick = () => {
    setSelectedServiceForInquiry(serviceName);
    const elem = document.getElementById('contact');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col justify-between p-8 md:p-[36px] border min-h-[320px] w-full cursor-pointer hover:border-[#FFD600] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(255,214,0,0.12)] transition-all duration-300 group relative"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div
            className="w-[40px] h-[40px] shrink-0 font-grotesk font-extrabold text-[#0A0A0A] flex items-center justify-center text-lg shadow-sm"
            style={{ backgroundColor: iconColor }}
          >
            ★
          </div>
          <span className="font-ibm-mono text-[12px] font-bold text-[#666666] group-hover:text-[#FFD600] transition-colors">
            {numberStr}
          </span>
        </div>

        <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[0.5px] leading-[1.25] whitespace-pre-line group-hover:text-[#FFD600] transition-colors">
          {title}
        </h3>

        <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.65]">
          {description}
        </p>
      </div>

      <div className="pt-6 mt-4 border-t border-[#222222] flex items-center justify-between">
        <div
          className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border w-fit"
          style={{ borderColor: tagColor }}
        >
          <span className="font-ibm-mono text-[10px] font-bold tracking-[2px]" style={{ color: tagColor }}>
            {tag}
          </span>
        </div>
        <span className="font-ibm-mono text-[11px] text-[#555555] group-hover:text-[#FFD600] transition-colors font-bold">
          KONSULTASI &gt;
        </span>
      </div>
    </div>
  );
}

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[01] // LAYANAN UTAMA"
        title={"JASA PEMBUATAN WEBSITE\nCEPAT, MURAH, DAN PROFESIONAL"}
        subtitle="ATASILABS hadir untuk menciptakan desain yang memukau, fitur yang canggih, dan strategi digital yang tepat sasaran untuk menjadikan website dan landing page Anda magnet bagi pengunjung. Percayakan kebutuhan digital Anda kepada kami, dan lihat bagaimana kami mengubah peluang menjadi hasil nyata!"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <FeatureCard
          numberStr="[01/03]"
          iconColor="#FFD600"
          title={"Cepat & Profesional"}
          description="Pengembangan website modern, responsif, cepat, dan profesional sesuai kebutuhan dalam waktu yang efisien."
          tag="CORE APP"
          tagColor="#FFD600"
          borderColor="#FFD600"
          serviceName="Full-Stack Web App (Next.js & Supabase)"
        />
        <FeatureCard
          numberStr="[02/03]"
          iconColor="#FF6B35"
          title={"Harga Transparan"}
          description="Solusi terbaik dengan harga yang kompetitif. Tidak ada biaya tersembunyi, semua transparan."
          tag="ENTERPRISE"
          tagColor="#FF6B35"
          bgColor="#0F0F0F"
          borderColor="#FF6B35"
          serviceName="SaaS & Enterprise Dashboard UI (Material UI)"
        />
        <FeatureCard
          numberStr="[03/03]"
          iconColor="#F5F5F0"
          title={"Bayar Lunas Setelah Jadi"}
          description="Garansi kepuasan 100%. Bayar lunas setelah website Anda selesai dan sesuai dengan yang diinginkan."
          tag="WORKFLOW"
          tagColor="#4ADE80"
          borderColor="#2D2D2D"
          serviceName="Database Architecture & ORM Migration (Prisma)"
        />
      </div>
    </section>
  );
};

export default ServicesSection;
