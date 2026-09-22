'use client';

import React, { useState } from 'react';
import SectionHeader from './SectionHeader';
import { Portfolio } from '../../types';
import { useApp } from '../../context/AppContext';

export const PortfolioSection: React.FC = () => {
  const { portfolios } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeItem, setActiveItem] = useState<Portfolio | null>(null);

  const categories = ['Semua', 'Full-Stack', 'Dashboard SaaS', 'E-Commerce', 'Mobile-Web'];

  const filteredPortfolios = portfolios.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    return item.category === selectedCategory;
  });

  return (
    <section id="portfolio" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[120px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[07] // PORTOFOLIO PILIHAN"
        title={"PORTOFOLIO PILIHAN\nATASILABS"}
        subtitle="BERBAGAI PROYEK WEBSITE DAN APLIKASI YANG BERHASIL KAMI BANAGUN BERSAMA PARA KLIEN"
      />

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center h-[36px] px-4 font-ibm-mono text-[11px] tracking-[1px] transition-colors border ${isActive
                ? 'bg-[#FFD600] text-[#0A0A0A] font-bold border-[#FFD600]'
                : 'bg-[#111111] text-[#888888] hover:text-[#CCCCCC] border-[#2D2D2D]'
                }`}
            >
              [{cat.toUpperCase()}]
            </button>
          );
        })}
      </div>

      {/* Grid of Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolios.map((item, idx) => {
          const techList = item.techStack || [];
          return (
            <div
              key={item.id}
              className="flex flex-col bg-[#0F0F0F] border-2 border-[#2D2D2D] hover:border-[#FFD600] transition-colors group cursor-pointer"
              onClick={() => setActiveItem(item)}
            >
              {/* Image Preview Box */}
              <div className="relative h-[220px] bg-[#161616] border-b border-[#2D2D2D] overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-ibm-mono text-[11px] text-[#444444] tracking-[2px]">[NO IMAGE PREVIEW]</span>
                    <span className="font-ibm-mono text-[9px] text-[#FFD600]">[CLICK FOR CASE STUDY]</span>
                  </div>
                )}
                {item.featured && (
                  <div className="absolute top-3 left-3 bg-[#FFD600] text-[#0A0A0A] font-ibm-mono text-[9px] font-bold px-2 py-1 border border-[#0A0A0A]">
                    ★ FEATURED
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-[#111111] text-[#888888] font-ibm-mono text-[9px] px-2 py-1 border border-[#2D2D2D]">
                  0{idx + 1} / 0{filteredPortfolios.length}
                </div>
              </div>

              {/* Content Details */}
              <div className="flex flex-col p-6 gap-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-ibm-mono text-[10px] text-[#FF6B35] tracking-[1.5px] uppercase font-bold">
                    [{item.category}]
                  </span>
                  <span className="font-ibm-mono text-[10px] text-[#666666] tracking-[1px]">
                    READY-TO-SHIP
                  </span>
                </div>

                <h3 className="font-grotesk text-[20px] font-bold text-[#F5F5F0] tracking-[0.5px] leading-[1.3] group-hover:text-[#FFD600] transition-colors">
                  {item.title}
                </h3>

                <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] line-clamp-3 leading-[1.6]">
                  {item.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[#1D1D1D]">
                  {techList.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="font-ibm-mono text-[9px] bg-[#1A1A1A] text-[#AAAAAA] px-2 py-0.5 border border-[#2D2D2D]"
                    >
                      {tech}
                    </span>
                  ))}
                  {techList.length > 4 && (
                    <span className="font-ibm-mono text-[9px] bg-[#1A1A1A] text-[#FFD600] px-2 py-0.5 border border-[#2D2D2D]">
                      +{techList.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-sm">
          <div className="bg-[#111111] border-2 border-[#FFD600] w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 relative">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#1A1A1A] text-[#FFD600] border border-[#3D3D3D] hover:bg-[#FFD600] hover:text-[#0A0A0A] font-ibm-mono text-xs font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="font-ibm-mono text-[10px] bg-[#FFD600] text-[#0A0A0A] px-2 py-1 font-bold">
                [{activeItem.category}]
              </span>
              <span className="font-ibm-mono text-[10px] text-[#888888]">
                CASE STUDY & ARSITEKTUR
              </span>
            </div>

            <h2 className="font-grotesk text-[26px] font-bold text-[#F5F5F0]">
              {activeItem.title}
            </h2>

            {activeItem.imageUrl && (
              <div className="w-full h-[260px] bg-[#1A1A1A] border border-[#2D2D2D] overflow-hidden">
                <img src={activeItem.imageUrl} alt={activeItem.title} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="font-ibm-mono text-[12px] text-[#CCCCCC] leading-[1.7] whitespace-pre-line">
              {activeItem.fullDescription || activeItem.description}
            </p>

            {/* Tech Stack List */}
            <div className="flex flex-col gap-2">
              <span className="font-grotesk text-[11px] font-bold text-[#888888] tracking-[2px]">TECH STACK</span>
              <div className="flex flex-wrap gap-2">
                {(activeItem.techStack || []).map((t) => (
                  <span key={t} className="font-ibm-mono text-[10px] bg-[#1A1A1A] text-[#FFD600] px-2.5 py-1 border border-[#3D3D3D]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-[#2D2D2D]">
              {activeItem.liveUrl && (
                <a
                  href={activeItem.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 h-12 bg-[#FFD600] text-[#0A0A0A] font-grotesk font-bold text-[12px] tracking-[1px] hover:bg-[#e6c200] transition-colors"
                >
                  LIVE DEMO ↗
                </a>
              )}
              {activeItem.repoUrl && (
                <a
                  href={activeItem.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 h-12 bg-[#1A1A1A] text-[#CCCCCC] border border-[#3D3D3D] font-ibm-mono text-[11px] tracking-[1px] hover:border-[#FFD600] transition-colors"
                >
                  GITHUB REPO ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
