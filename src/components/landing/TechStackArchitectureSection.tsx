'use client';

import React from 'react';
import SectionHeader from './SectionHeader';

export const TechStackArchitectureSection: React.FC = () => {
  const architecturePillars = [
    {
      numStr: '[01/03]',
      title: 'TAMPILAN MODERN & SANGAT CEPAT',
      badge: 'RESPONSIF SEMUA HP & LAPTOP',
      tagColor: '#FFD600',
      desc: 'Website dapat dibuka secara instan tanpa lemot dari perangkat apa pun, memberikan kenyamanan maksimal bagi setiap pengunjung.',
      points: [
        'Tampilan rapi dan pas di layar HP, tablet, maupun komputer',
        'Loading halaman super cepat tanpa waktu tunggu lama',
        'Gambar dan foto produk tampil jernih serta hemat kuota',
      ],
    },
    {
      numStr: '[02/03]',
      title: 'PEMROSESAN DATA OTOMATIS & AKURAT',
      badge: 'TANPA REPOT & BEBAS ERROR',
      tagColor: '#4ADE80',
      desc: 'Setiap data pelanggan dan pesanan baru langsung diolah secara otomatis oleh sistem tanpa perlu dicatat manual satu per satu.',
      points: [
        'Mencegah kesalahan catat atau salah input data',
        'Data pesan dan transaksi diproses secara real-time',
        'Rekapitulasi laporan rapi dan siap dicek kapan saja',
      ],
    },
    {
      numStr: '[03/03]',
      title: 'KEAMANAN DATA & PENYIMPANAN AMAN',
      badge: 'PROTEKSI PRIVASI BISNIS',
      tagColor: '#FF6B35',
      desc: 'Seluruh informasi rahasia, transaksi, dan berkas bisnis Anda dilindungi dengan sistem keamanan modern agar terjaga dari kebocoran.',
      points: [
        'Perlindungan privasi data pelanggan dari kebocoran',
        'Akses dashboard aman dengan verifikasi akun terpercaya',
        'Penyimpanan berkas & cadangan data otomatis di server cloud',
      ],
    },
  ];

  const dataFlowSteps = [
    { step: '[01]', title: 'PEMILIHAN PAKET', desc: 'Pilih paket layanan yang sesuai dengan kebutuhan bisnis.' },
    { step: '[02]', title: 'PENGISIAN FORMULIR', desc: 'Isi formulir kebutuhan proyek dan detail usaha.' },
    { step: '[03]', title: 'VERIFIKASI, MOU & DP', desc: 'Verifikasi data, penerbitan MoU, dan pembayaran awal.' },
    { step: '[04]', title: 'PENGERJAAN WEBSITE', desc: 'Pengembangan sistem, perancangan, dan pengujian.' },
    { step: '[05]', title: 'SERAH TERIMA', desc: 'Penyerahan akses akun, dokumen BAST, dan garansi.' },
  ];

  return (
    <section id="architecture" className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px] border-t border-[#1D1D1D]">
      <SectionHeader
        label="[06] // ARSITEKTUR & SPESIFIKASI SISTEM"
        title={"TEKNOLOGI MODERN UNTUK\nPERTUMBUHAN BISNIS ANDA"}
        subtitle="Website dan aplikasi Anda dibangun menggunakan teknologi terkini yang ramah pengguna, loading super cepat, aman dari peretasan, dan siap mengikuti pertumbuhan bisnis Anda."
      />

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {architecturePillars.map((pillar) => (
          <div
            key={pillar.title}
            className="flex flex-col justify-between p-8 md:p-[36px] bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(255,214,0,0.12)] transition-all duration-300 group"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[2px]">
                  {pillar.numStr}
                </span>
                <div
                  className="flex items-center justify-center h-[26px] px-[10px] bg-[#1A1A1A] border w-fit"
                  style={{ borderColor: pillar.tagColor }}
                >
                  <span className="font-ibm-mono text-[9px] font-bold tracking-[1.5px]" style={{ color: pillar.tagColor }}>
                    {pillar.badge}
                  </span>
                </div>
              </div>

              <h3 className="font-grotesk text-[20px] md:text-[22px] font-bold text-[#F5F5F0] tracking-[0.5px] leading-[1.25] group-hover:text-[#FFD600] transition-colors">
                {pillar.title}
              </h3>

              <p className="font-ibm-mono text-[12px] text-[#888888] tracking-[0.5px] leading-[1.65]">
                {pillar.desc}
              </p>

              <div className="pt-4 border-t border-[#222222] flex flex-col gap-2.5">
                {pillar.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5">
                    <span className="font-ibm-mono text-[12px] text-[#FFD600] font-bold">✓</span>
                    <span className="font-ibm-mono text-[11px] text-[#CCCCCC] leading-[1.5]">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Flow Pipeline Box */}
      <div className="flex flex-col gap-6 p-8 md:p-10 bg-[#0F0F0F] border border-[#2D2D2D]">
        <div className="flex items-center gap-3">
          <span className="font-ibm-mono text-[14px] text-[#FFD600] font-bold"></span>
          <h4 className="font-grotesk text-[18px] md:text-[20px] font-bold text-[#F5F5F0] tracking-[1px]">
            ALUR KERJA OPERASIONAL: 5 TAHAP DARI PEMESANAN HINGGA SERAH TERIMA
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {dataFlowSteps.map((step) => (
            <div
              key={step.step}
              className="flex flex-col gap-2 p-5 bg-[#141414] border border-[#222222] hover:border-[#FFD600] transition-colors"
            >
              <span className="font-ibm-mono text-[10px] font-bold text-[#FFD600] tracking-[2px]">
                {step.step}
              </span>
              <h5 className="font-grotesk text-[15px] font-bold text-[#F5F5F0]">
                {step.title}
              </h5>
              <p className="font-ibm-mono text-[11px] text-[#888888] leading-[1.5]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackArchitectureSection;


