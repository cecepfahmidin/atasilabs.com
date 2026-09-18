'use client';

import React from 'react';
import SectionHeader from './SectionHeader';

export const TechStackArchitectureSection: React.FC = () => {
  const comparisonPillars = [
    {
      numStr: '[01/03]',
      title: 'KEPASTIAN KONTRAK & LEGALITAS',
      badge: 'ATASILABS vs VENDOR LAIN',
      tagColor: '#FFD600',
      desc: 'Setiap tahapan proyek dijamin dengan dokumen resmi ber-kop legal agar hak dan investasi bisnis Anda 100% aman.',
      points: [
        '✓ ATASILABS: Terbit MoU legal, Invoice resmi, & BAST otomatis',
        '✕ VENDOR LAIN: Tanpa kontrak jelas & harga sering membengkak',
      ],
    },
    {
      numStr: '[02/03]',
      title: 'KECEPATAN & KINERJA SISTEM',
      badge: 'MODERN vs CARA TRADISIONAL',
      tagColor: '#4ADE80',
      desc: 'Website dibangun dengan standar teknologi terbaru yang sangat cepat dibuka di HP tanpa ada waktu tunggu lama.',
      points: [
        '✓ ATASILABS: Loading super cepat, ringan di HP, & bebas lemot',
        '✕ VENDOR LAIN: Pakai template berat yang mudah lambat & crash',
      ],
    },
    {
      numStr: '[03/03]',
      title: 'KEAMANAN DATA & GARANSI',
      badge: 'PROTEKSI PENUH vs TANPA JAMINAN',
      tagColor: '#FF6B35',
      desc: 'Seluruh data rahasia bisnis Anda dilindungi dengan sistem enkripsi ketat plus dukungan garansi resmi pasca serah terima.',
      points: [
        '✓ ATASILABS: Enkripsi data, backup otomatis, & garansi 30 hari',
        '✕ VENDOR LAIN: Rawan kebocoran data & lepas tangan setelah jadi',
      ],
    },
  ];

  const comparisonRows = [
    { label: 'Kejelasan Biaya', atasilabs: 'Transparan sejak awal tanpa biaya tersembunyi', others: 'Sering ada tambahan biaya di tengah jalan' },
    { label: 'Waktu Pengerjaan', atasilabs: 'Terjadwal presisi & dapat dipantau real-time', others: 'Sering molor bertingkat tanpa kepastian' },
    { label: 'Kelengkapan Dokumen', atasilabs: 'Penerbitan otomatis MoU, RSD, & BAST resmi', others: 'Hanya serah terima lisan / tanpa dokumen' },
    { label: 'Keamanan System', atasilabs: 'Proteksi privasi data & backup cloud otomatis', others: 'Sistem rentan di-hack & data rawan hilang' },
    { label: 'Dukungan Garansi', atasilabs: 'Garansi operasional 30 hari & bantuan teknis', others: 'Tidak ada garansi jika terjadi error' },
  ];

  return (
    <section id="architecture" className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[80px] lg:px-[120px] gap-12 md:gap-[64px] border-t border-[#1D1D1D]">
      <SectionHeader
        label="[06] // ATASILABS SOP VS OTHERS"
        title={"PERBANDINGAN KUALITAS &\nKEUNTUNGAN BISNIS ANDA"}
        subtitle="Lihat bagaimana standar sistem & SOP operasional ATASILABS memberikan perlindungan, kepastian, dan kualitas jauh di atas vendor biasa."
      />

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {comparisonPillars.map((pillar) => (
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

              <div className="pt-4 border-t border-[#222222] flex flex-col gap-3">
                {pillar.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2">
                    <span
                      className={`font-ibm-mono text-[11px] leading-[1.5] ${
                        pt.startsWith('✓') ? 'text-[#4ADE80] font-semibold' : 'text-[#FF6B35]'
                      }`}
                    >
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Comparison Table / Box */}
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[#2D2D2D]">
        <div className="flex items-center gap-3 border-b border-[#222222] pb-4">
          <span className="font-ibm-mono text-[14px] text-[#FFD600] font-bold">⚡</span>
          <h4 className="font-grotesk text-[18px] md:text-[20px] font-bold text-[#F5F5F0] tracking-[1px]">
            TABEL PERBANDINGAN STANDAR LAYANAN: ATASILABS vs VENDOR LAIN
          </h4>
        </div>

        <div className="flex flex-col w-full divide-y divide-[#1F1F1F]">
          {comparisonRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2 md:gap-4 items-center">
              <span className="font-grotesk text-[14px] font-bold text-[#F5F5F0]">
                {row.label}
              </span>
              <div className="flex items-center gap-2 text-[#4ADE80]">
                <span className="font-ibm-mono text-[12px]">✓</span>
                <span className="font-ibm-mono text-[12px] text-[#DDDDDD]">{row.atasilabs}</span>
              </div>
              <div className="flex items-center gap-2 text-[#FF6B35]">
                <span className="font-ibm-mono text-[12px]">✕</span>
                <span className="font-ibm-mono text-[12px] text-[#777777]">{row.others}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackArchitectureSection;



