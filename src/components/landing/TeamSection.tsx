'use client';

import React from 'react';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const TeamSection: React.FC = () => {
  const { users, isLoadingData } = useApp();

  // Filter team members (all staff/management roles excluding CLIENT) dynamically from Supabase database
  const teamUsers = users.filter(
    (u) => u.role && u.role.toUpperCase() !== 'CLIENT'
  );

  const getBadgeColor = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'CEO':
        return '#FFD600';
      case 'CTO':
        return '#4ADE80';
      case 'CMO':
        return '#FF6B35';
      default:
        return '#38BDF8';
    }
  };

  return (
    <section id="team" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px] border-t border-[#1D1D1D]">
      <SectionHeader
        label="[11] // TIM MANAJEMEN & LEADERSHIP"
        title={"TIM MANAJEMEN &\nDUKUNGAN KLIEN"}
        subtitle="Dikelola oleh profesional berpengalaman untuk memastikan setiap proyek website dibangun dengan standar kualitas terbaik, cepat, dan presisi."
      />

      {/* Loading Skeleton */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col bg-[#111111] border border-[#2D2D2D] h-[400px] animate-pulse">
              <div className="h-[260px] bg-[#1A1A1A]" />
              <div className="p-6 flex flex-col gap-3">
                <div className="h-5 bg-[#252525] w-3/4 rounded" />
                <div className="h-4 bg-[#1E1E1E] w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : teamUsers.length === 0 ? (
        <div className="p-8 text-center text-[#888888] font-ibm-mono border border-dashed border-[#2D2D2D]">
          [ BELUM ADA DATA TIM MANAJEMEN DI SUPABASE DATABASE ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
          {teamUsers.map((user) => {
            const badgeColor = getBadgeColor(user.role);
            const userRoleTitle = user.roleTitle || user.role || 'MANAGEMENT';
            const userBadge = user.titleBadge || user.role || 'TEAM';
            const userTagline = user.tagline || user.company || '';
            const userBio = user.bio || '';
            const avatarSrc = user.avatarUrl && user.avatarUrl.trim() !== ''
              ? user.avatarUrl
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={user.id}
                className="flex flex-col justify-between bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(255,214,0,0.12)] transition-all duration-300 group overflow-hidden"
              >
                {/* Image & Overlay Header */}
                <div className="relative h-[260px] bg-[#161616] overflow-hidden border-b border-[#2D2D2D]">
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div
                    className="absolute top-3 left-3 flex items-center h-[26px] px-3 bg-[#0A0A0A]/90 backdrop-blur-sm border"
                    style={{ borderColor: badgeColor }}
                  >
                    <span className="font-ibm-mono text-[10px] font-bold tracking-[1.5px]" style={{ color: badgeColor }}>
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
                      {user.name}
                    </h3>
                    {userTagline && (
                      <span className="font-ibm-mono text-[12px] text-[#FFD600] font-semibold tracking-[0.5px]">
                        {userTagline}
                      </span>
                    )}
                    {userBio && (
                      <p className="font-ibm-mono text-[13px] md:text-[14px] text-[#888888] tracking-[0.5px] leading-[1.6] mt-1">
                        {userBio}
                      </p>
                    )}
                  </div>

                  {/* Status / Contact Tag */}
                  <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
                    <span className="font-ibm-mono text-[11px] text-[#555555] tracking-[1px]">
                      STATUS: <span className="text-[#4ADE80] font-bold">● {user.status || 'ACTIVE'}</span>
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
      )}
    </section>
  );
};

export default TeamSection;
