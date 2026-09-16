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

      <div className="flex flex-col w-full gap-[2px]">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row w-full gap-[2px]">
          {/* Bento A — Yellow Highlight */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[300px] bg-[#FFD600] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#1A1A1A] tracking-[2px]">[01]</span>
              <h3 className="font-grotesk text-[24px] md:text-[26px] font-bold text-[#0A0A0A] tracking-[-1px] leading-[1.1] mt-2 mb-3">
                NEXT.JS 14 APP ROUTER & SERVER ACTIONS
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#1A1A1A] tracking-[0.5px] leading-[1.6]">
                SERVER-SIDE RENDERING (SSR), INCREMENTAL STATIC REGENERATION (ISR), DAN SKORE LIGHTHOUSE 95+.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#0A0A0A] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] tracking-[2px]">[NEXT.JS 14]</span>
            </div>
          </div>

          {/* Bento B */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[300px] bg-[#111111] border border-[#2D2D2D] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[02]</span>
              <h3 className="font-grotesk text-[24px] md:text-[26px] font-bold text-[#F5F5F0] tracking-[-1px] leading-[1.1] mt-2 mb-3">
                PRISMA ORM & POSTGRESQL SUPABASE
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                SKEMA DATABASE TYPE-SAFE RELASIONAL DENGAN ROW LEVEL SECURITY (RLS) ANTI-BOCOR.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#333] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#4ADE80] tracking-[2px]">[PRISMA ORM]</span>
            </div>
          </div>

          {/* Bento C */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[300px] bg-[#0A0A0A] border border-[#2D2D2D] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[03]</span>
              <h3 className="font-grotesk text-[24px] md:text-[26px] font-bold text-[#F5F5F0] tracking-[-1px] leading-[1.1] mt-2 mb-3">
                MATERIAL UI (MUI) DESIGN SYSTEM
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                ANTARMUKA MANAGEMENT DATA INTERAKTIF, DATAGRID COMPLEX, & MULTI-THEME LIGHT/DARK.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[MUI V5]</span>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col md:flex-row w-full gap-[2px]">
          {/* Bento D */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[260px] bg-[#111111] border border-[#2D2D2D] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[04]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-1px] leading-[1.1] mt-2 mb-2">
                OTOMATISASI PDF DOKUMEN SOP
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                PENERBITAN OTOMATIS 5 DOKUMEN RESMI (CIF, RSD, MOU, SPK, BAST) BER-KOP A4.
              </p>
            </div>
          </div>

          {/* Bento E */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[260px] bg-[#0F0F0F] border-2 border-[#FF6B35] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FF6B35] tracking-[2px]">[05]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-1px] leading-[1.1] mt-2 mb-2">
                UU ITE E-SIGNATURE VERIFIED
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                TANDA TANGAN CANVAS DRAWING + AUDIT TRAIL TIMESTAMP & VERIFIKASI METADATA IP ADDRESS.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-3">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[UU ITE VERIFIED]</span>
            </div>
          </div>

          {/* Bento F */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] md:h-[260px] bg-[#0A0A0A] border border-[#2D2D2D] w-full md:flex-1">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-1px] leading-[1.1] mt-2 mb-2">
                PAYMENT GATEWAY & REAL-TIME
              </h3>
              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                INTEGRASI MIDTRANS SNAP API, QRIS, VIRTUAL ACCOUNT, & SUPABASE REALTIME STORAGE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
