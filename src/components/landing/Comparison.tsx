'use client';

import React from 'react';
import SectionHeader from './SectionHeader';

const rows = [
  { feature: "NEXT.JS 15 & MUI V6 ARCHITECTURE", atasilabs: "[✓]", conventional: "[✗]", freelancer: "[—]" },
  { feature: "INTEGRATED DASHBOARD & WORKFLOW", atasilabs: "[✓]", conventional: "[—]", freelancer: "[✗]" },
  { feature: "AUTOMATED E-SIGN & CONTRACT WORKFLOW", atasilabs: "[✓]", conventional: "[✗]", freelancer: "[✗]" },
  { feature: "REAL-TIME PORTFOLIO & PRICING CMS", atasilabs: "[✓]", conventional: "[✗]", freelancer: "[✗]" },
  { feature: "PRISMA ORM & SUPABASE POSTGRES", atasilabs: "[✓]", conventional: "[—]", freelancer: "[—]" },
  { feature: "100% FULL SOURCE CODE ACCESS", atasilabs: "[✓]", conventional: "[✓]", freelancer: "[—]" },
];

function cellStyle(val: string) {
  if (val === "[✓]") return "font-bold text-[14px]";
  if (val === "[✗]") return "text-[#3D3D3D] text-[13px]";
  if (val === "[—]") return "text-[#444444] text-[13px]";
  return "text-[#444444] text-[10px]";
}

export const Comparison: React.FC = () => {
  return (
    <section id="comparison" className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[06] // ATASILABS SOP VS OTHERS"
        title={"MENGAPA ATASILABS\nUNGGUL."}
        subtitle="METODOLOGI SOFTWARE ENGINEERING TRANSPARAN. DOKUMEN DAN DEPLOYMENT KONTROL PENUH."
      />

      {/* Desktop table */}
      <div className="hidden md:flex flex-col w-full border border-[#2D2D2D]">
        {/* Header */}
        <div className="flex w-full h-[56px] bg-[#111111] border-b-2 border-b-[#FFD600]">
          <div className="flex items-center w-[400px] shrink-0 px-[32px] border-r border-r-[#2D2D2D]">
            <span className="font-grotesk text-[11px] font-bold text-[#888888] tracking-[2px]">FITUR / METODE</span>
          </div>
          <div className="flex items-center flex-1 px-[32px] bg-[#1A1A1A] border-r border-r-[#2D2D2D]">
            <span className="font-grotesk text-[11px] font-bold text-[#FFD600] tracking-[2px]">ATASILABS SYSTEM</span>
          </div>
          {["AGENSI KONVENSIONAL", "FREELANCER BIASA"].map((tool, i) => (
            <div key={tool} className={`flex items-center flex-1 px-[32px] ${i < 1 ? "border-r border-r-[#2D2D2D]" : ""}`}>
              <span className="font-grotesk text-[11px] font-bold text-[#555555] tracking-[2px]">{tool}</span>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, i) => (
          <div key={row.feature} className={`flex w-full h-[56px] ${i < rows.length - 1 ? "border-b border-b-[#1D1D1D]" : ""}`}>
            <div className="flex items-center w-[400px] shrink-0 px-[32px] border-r border-r-[#2D2D2D]">
              <span className="font-ibm-mono text-[12px] text-[#CCCCCC] tracking-[1px]">{row.feature}</span>
            </div>
            <div className="flex items-center flex-1 px-[32px] bg-[#0D0D0D] border-r border-r-[#2D2D2D]">
              <span className="font-ibm-mono tracking-[1px] text-[#FFD600] font-bold text-[14px]">{row.atasilabs}</span>
            </div>
            {[row.conventional, row.freelancer].map((val, j) => (
              <div key={j} className={`flex items-center flex-1 px-[32px] ${j < 1 ? "border-r border-r-[#2D2D2D]" : ""}`}>
                <span className={`font-ibm-mono tracking-[1px] ${cellStyle(val)}`}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile grid */}
      <div className="flex flex-col md:hidden w-full gap-[2px]">
        <div className="grid grid-cols-4 bg-[#111111] border border-[#FFD600] border-b-2">
          <div className="col-span-2 px-3 py-3">
            <span className="font-grotesk text-[9px] font-bold text-[#888888] tracking-[1px]">FITUR</span>
          </div>
          <div className="px-2 py-3 bg-[#1A1A1A]">
            <span className="font-grotesk text-[9px] font-bold text-[#FFD600] tracking-[1px]">ATASILABS</span>
          </div>
          <div className="px-2 py-3">
            <span className="font-grotesk text-[9px] font-bold text-[#555555] tracking-[1px]">LAINNYA</span>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-4 border border-[#1D1D1D] ${i % 2 === 0 ? "bg-[#0A0A0A]" : "bg-[#0D0D0D]"}`}>
            <div className="col-span-2 flex items-center px-3 py-4">
              <span className="font-ibm-mono text-[9px] text-[#CCCCCC] tracking-[1px] leading-[1.4]">{row.feature}</span>
            </div>
            <div className="flex items-center px-2 py-4 bg-[#0D0D0D]">
              <span className="font-ibm-mono text-[12px] text-[#FFD600] font-bold">{row.atasilabs}</span>
            </div>
            <div className="flex items-center px-2 py-4">
              <span className={`font-ibm-mono text-[11px] ${cellStyle(row.conventional)}`}>{row.conventional}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Comparison;
