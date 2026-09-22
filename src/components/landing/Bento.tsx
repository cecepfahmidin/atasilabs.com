'use client';

import { SectionHeader } from './SectionHeader';

export function Bento() {
  return (
    <section id="architecture" className="flex flex-col w-full bg-[#0D0D0D] py-16 px-6 md:py-[100px] md:px-[80px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[05] // KEUNGGULAN SISTEM DI BALIK LAYAR KAMI"
        title={"DIRANCANG UNTUK PERTUMBUHAN\nBISNIS ANDA"}
        subtitle="Sistem modern yang dirancang rapi, cepat, dan transparan untuk mendukung pertumbuhan usaha Anda secara berkelanjutan."
      />

      <div className="flex flex-col w-full gap-6">
        {/* Row 1: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {/* Bento A — Yellow Highlight */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#FFD600] border-2 border-[#FFD600] shadow-[0_0_30px_rgba(255,214,0,0.15)] hover:scale-[1.01] transition-transform duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#1A1A1A] tracking-[2px]">[01/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#0A0A0A] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                AKSES SUPER CEPAT & STABIL
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#1A1A1A] tracking-[0.5px] leading-[1.6]">
                Website dan aplikasi Anda dimuat dalam hitungan detik dari berbagai perangkat, memberikan pengalaman terbaik tanpa hambatan bagi pelanggan yang berkunjung.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#0A0A0A] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] tracking-[2px]">[SUPER CEPAT]</span>
            </div>
          </div>

          {/* Bento B */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">[02/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                KEAMANAN DATA & ANTI-BOCOR
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                Seluruh data rahasia, informasi akun, dan transaksi bisnis Anda dilindungi dengan sistem keamanan bertingkat agar privasi perusahaan terjaga ketat.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#333] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#4ADE80] tracking-[2px]">[KEAMANAN DATA]</span>
            </div>
          </div>

          {/* Bento C */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[280px] bg-[#0A0A0A] border border-[#2D2D2D] hover:border-[#FF6B35] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FF6B35] tracking-[2px]">[03/06]</span>
              <h3 className="font-grotesk text-[22px] md:text-[24px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-3">
                TAMPILAN NYAMAN & MUDAH DIGUNAKAN
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                Antarmuka dashboard dan halaman muka dirancang rapi, modern, serta sangat ramah pengguna (user-friendly) tanpa memerlukan pelatihan rumit bagi tim Anda.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-6">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[USER FRIENDLY]</span>
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
                PENERBITAN DOKUMEN & LAPORAN OTOMATIS
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                Sistem secara otomatis merapikan data masuk, mencetak rekapitulasi, dan memproses berkas operasional penting secara real-time tanpa repot.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#333] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#888888] tracking-[2px]">[LAPORAN OTOMATIS]</span>
            </div>
          </div>

          {/* Bento E */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[260px] bg-[#0F0F0F] border-2 border-[#FF6B35] shadow-[0_0_25px_rgba(255,107,53,0.12)] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#FF6B35] tracking-[2px]">[05/06]</span>
              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-2">
                LEGALITAS PERSETUJUAN DIGITAL
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                Dilengkapi fitur validasi kontrak dan persetujuan digital yang sah secara hukum, lengkap dengan jejak audit waktu yang transparan.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#FF6B35] w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#FF6B35] tracking-[2px]">[E-SIGN SAH]</span>
            </div>
          </div>

          {/* Bento F */}
          <div className="flex flex-col justify-between p-8 md:p-[36px] min-h-[260px] bg-[#0A0A0A] border border-[#2D2D2D] hover:border-[#4ADE80] hover:scale-[1.01] transition-all duration-300">
            <div>
              <span className="font-ibm-mono text-[11px] font-bold text-[#4ADE80] tracking-[2px]">[06/06]</span>
              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[-0.5px] leading-[1.2] mt-3 mb-2">
                INTEGRASI PEMBAYARAN & SINKRONISASI LANGSUNG
              </h3>
              <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                Mendukung berbagai metode pembayaran instan (QRIS, Transfer Bank, E-Wallet) yang terhubung langsung ke laporan keuangan sistem secara otomatis.
              </p>
            </div>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border border-[#4ADE80]/40 w-fit mt-4">
              <span className="font-ibm-mono text-[10px] font-bold text-[#4ADE80] tracking-[2px]">[PEMBAYARAN INSTAN]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
