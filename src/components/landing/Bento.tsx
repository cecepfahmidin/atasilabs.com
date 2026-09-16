'use client';

import { SectionHeader } from './SectionHeader';

export function Bento() {
  return (
    <section id="architecture" className="flex flex-col w-full bg-[#0D0D0D] py-16 px-6 md:py-[100px] md:px-[80px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[05] // ENTERPRISE ARCHITECTURE"
        title={'STACK TEKNOLOGI MODERN.\nDALAM SATU EKOSISTEM.'}
        subtitle="Arsitektur teruji skala produksi dengan kehandalan tinggi, keamanan RLS, dan otomatisasi PDF."
      />

      <div className="flex flex-col w-full gap-6">
        {/* Row 1: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {/* Bento A — Yellow Highlight */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#FFD600] border-2 border-[#FFD600] shadow-[0_0_30px_rgba(255,214,0,0.15)] hover:scale-[1.01] transition-transform duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#1A1A1A] tracking-[2px]">[01/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#0A0A0A] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                NEXT.JS 15 APP ROUTER & SERVER ACTIONS
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#1A1A1A] tracking-[0.5px] leading-[1.6]">
                SERVER-SIDE RENDERING (SSR), INCREMENTAL STATIC REGENERATION (ISR), DAN SKOR LIGHTHOUSE 98+.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#0A0A0A] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] tracking-[2px]">[NEXT.JS 15]</span>
            </div>
          </div>

          {/* Bento B */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[02/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                PRISMA ORM & POSTGRESQL SUPABASE
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                SKEMA DATABASE TYPE-SAFE RELASIONAL DENGAN ROW LEVEL SECURITY (RLS) ANTI-BOCOR DATA.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#333] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#4ADE80] tracking-[2px]">[PRISMA ORM]</span>
            </div>
          </div>

          {/* Bento C */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#0A0A0A] border border-[#2D2D2D] hover:border-[#FF6B35] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FF6B35] tracking-[2px]">[03/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                MATERIAL UI (MUI V6) DESIGN SYSTEM
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                ANTARMUKA MANAGEMENT DATA INTERAKTIF, DATAGRID COMPLEX, & MULTI-THEME LIGHT/DARK DYNAMIC.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[MUI V6 SYSTEM]</span>
            </div>
          </div>
        </div>

        {/* Row 2: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {/* Bento D */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[260px] bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[04/06]</span>
              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-2">
                OTOMATISASI PDF DOKUMEN SOP
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                PENERBITAN OTOMATIS 5 DOKUMEN RESMI (CIF, RSD, MOU, SPK, BAST) BER-KOP RESMI PT AULIA INDOLAND GRP.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#333] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#888888] tracking-[2px]">[PDF AUTO-GEN]</span>
            </div>
          </div>

          {/* Bento E */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[260px] bg-[#0F0F0F] border-2 border-[#FF6B35] shadow-[0_0_25px_rgba(255,107,53,0.12)] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FF6B35] tracking-[2px]">[05/06]</span>
              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-2">
                UU ITE E-SIGNATURE VERIFIED
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                TANDA TANGAN CANVAS DRAWING + AUDIT TRAIL TIMESTAMP & VERIFIKASI METADATA IP ADDRESS KLIEN.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[UU ITE VERIFIED]</span>
            </div>
          </div>

          {/* Bento F */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[260px] bg-[#0A0A0A] border border-[#2D2D2D] hover:border-[#4ADE80] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#4ADE80] tracking-[2px]">[06/06]</span>
              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-2">
                PAYMENT GATEWAY & REAL-TIME
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                INTEGRASI MIDTRANS SNAP API, QRIS, VIRTUAL ACCOUNT, & SUPABASE REALTIME CHANNEL SYNC.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#4ADE80]/40 w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#4ADE80] tracking-[2px]">[REALTIME & MIDTRANS]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
