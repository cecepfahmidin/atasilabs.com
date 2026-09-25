'use client';

import React from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const TeamSection: React.FC = () => {
  const { users } = useApp();

  // Find leadership users dynamically from database / app state context
  const ceoUser = users.find((u) => u.role === 'CEO' || u.id === 'usr-ceo') as User | undefined;
  const ctoUser = users.find((u) => u.role === 'CTO' || u.id === 'usr-cto') as User | undefined;
  const cmoUser = users.find((u) => u.role === 'CMO' || u.id === 'usr-cmo') as User | undefined;

  const teamList = [
    {
      user: ceoUser,
      fallbackName: 'Irfan Aulia Ulumuddin',
      roleTitle: 'CHIEF EXECUTIVE OFFICER',
      titleBadge: 'CEO & FOUNDER',
      badgeColor: '#FFD600',
      defaultTagline: 'Visi Strategis & Manajemen Layanan Klien',
      defaultBio: 'Memastikan seluruh operasional studio, standar layanan, dan komitmen garansi kepuasan klien berjalan dengan presisi dan transparansi tinggi.',
      fallbackImage: '/team/ceo.jpg',
    },
    {
      user: ctoUser,
      fallbackName: 'Cecep Fahmidin, S.Kom., M.Kom., Gr.',
      roleTitle: 'CHIEF TECHNOLOGY OFFICER',
      titleBadge: 'CTO & LEAD ARCHITECT',
      badgeColor: '#4ADE80',
      defaultTagline: 'Arsitektur Software & Keamanan Sistem',
      defaultBio: 'Mengawasi infrastruktur Next.js, optimasi kecepatan loading, keandalan cloud hosting, serta arsitektur sistem keamanan data.',
      fallbackImage: '/team/cto.jpg',
    },
    {
      user: cmoUser,
      fallbackName: 'Dian Hidayat, S.Pd., M.Pd.',
      roleTitle: 'CHIEF MARKETING OFFICER',
      titleBadge: 'CMO & HEAD OF UI/UX',
      badgeColor: '#FF6B35',
      defaultTagline: 'Strategi Digital, UI/UX & Growth',
      defaultBio: 'Merancang desain antarmuka (UI/UX) yang memukau, ramah pengguna (user-friendly), serta strategi konversi untuk pertumbuhan bisnis Anda.',
      fallbackImage: '/team/cmo.jpg',
    },
  ];

  return (
    <section id="team" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px] border-t border-[#1D1D1D]">
      <SectionHeader
        label="[11] // TIM MANAJEMEN & LEADERSHIP"
        title={"TIM MANAJEMEN &\nDUKUNGAN KLIEN"}
        subtitle="Dikelola oleh profesional berpengalaman untuk memastikan setiap proyek website dibangun dengan standar kualitas terbaik, cepat, dan presisi."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
        {teamList.map((item) => {
          const userName = item.user?.name && item.user.name.trim() !== '' ? item.user.name : item.fallbackName;
          const userAvatar = item.user?.avatarUrl && item.user.avatarUrl.trim() !== '' ? item.user.avatarUrl : null;
          const imageSrc = userAvatar || item.fallbackImage;
          const userBio = item.user?.bio && item.user.bio.trim() !== '' ? item.user.bio : item.defaultBio;
          const userTagline = item.user?.tagline && item.user.tagline.trim() !== '' ? item.user.tagline : (item.user?.company || item.defaultTagline);
          const userBadge = item.user?.titleBadge && item.user.titleBadge.trim() !== '' ? item.user.titleBadge : item.titleBadge;
          const userRoleTitle = item.user?.roleTitle && item.user.roleTitle.trim() !== '' ? item.user.roleTitle : item.roleTitle;
          const userStatus = item.user?.status || 'ACTIVE';

          return (
            <div
              key={item.roleTitle}
              className="flex flex-col justify-between bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(255,214,0,0.12)] transition-all duration-300 group overflow-hidden"
            >
              {/* Image & Overlay Header */}
              <div className="relative h-[260px] bg-[#161616] overflow-hidden border-b border-[#2D2D2D]">
                <img
                  src={imageSrc}
                  alt={userName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div
                  className="absolute top-3 left-3 flex items-center h-[26px] px-3 bg-[#0A0A0A]/90 backdrop-blur-sm border"
                  style={{ borderColor: item.badgeColor }}
                >
                  <span className="font-ibm-mono text-[10px] font-bold tracking-[1.5px]" style={{ color: item.badgeColor }}>
                    {userBadge}
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="flex flex-col p-6 md:p-7 gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <span className="font-ibm-mono text-[11px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                    [{userRoleTitle}]
                  </span>
                  <h3 className="font-grotesk text-[16px] sm:text-[17px] md:text-[18px] lg:text-[19px] font-bold text-[#F5F5F0] tracking-tight leading-[1.25] group-hover:text-[#FFD600] transition-colors">
                    {userName}
                  </h3>
                  <span className="font-ibm-mono text-[12px] text-[#FFD600] font-semibold tracking-[0.5px]">
                    {userTagline}
                  </span>
                  <p className="font-ibm-mono text-[13px] md:text-[14px] text-[#888888] tracking-[0.5px] leading-[1.6] mt-1">
                    {userBio}
                  </p>
                </div>

                {/* Status / Contact Tag */}
                <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
                  <span className="font-ibm-mono text-[11px] text-[#555555] tracking-[1px]">
                    STATUS: <span className="text-[#4ADE80] font-bold">● {userStatus}</span>
                  </span>
                  <a
                    href="#contact"
                    className="font-ibm-mono text-[11px] text-[#FFD600] font-bold hover:underline"
                  >
                    KONSULTASI &gt;
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TeamSection;
