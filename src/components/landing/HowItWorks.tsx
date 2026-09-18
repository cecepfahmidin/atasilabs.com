'use client';

import { SectionHeader } from './SectionHeader';

const stages = [
  {
    num: '01',
    title: 'PEMILIHAN PAKET',
    desc: 'Pilih paket layanan yang sesuai dengan kebutuhan dan skala bisnis Anda.',
    doc: 'Katalog Paket (Starter, Growth, Pro, Elite)',
    badge: 'STAGE 1',
  },
  {
    num: '02',
    title: 'PENGISIAN FORMULIR',
    desc: 'Isi formulir online sesuai kebutuhan fitur website dan profil usaha Anda.',
    doc: 'Formulir Intake Klien (CIF)',
    badge: 'STAGE 2',
  },
  {
    num: '03',
    title: 'VERIFIKASI, MOU DAN PEMBAYARAN AWAL',
    desc: 'Tim atasilabs memverifikasi data, menerbitkan MoU/kontrak kerja, dan invoice DP awal.',
    doc: 'MoU & Invoice Pembayaran Awal',
    badge: 'STAGE 3',
  },
  {
    num: '04',
    title: 'PENGERJAAN WEBSITE',
    desc: 'Tim atasilabs mulai merancang dan membangun website sesuai paket pilihan Anda.',
    doc: 'RSD (Requirement Spec) & QA Checklist',
    badge: 'STAGE 4',
  },
  {
    num: '05',
    title: 'SERAH TERIMA',
    desc: 'Penandatanganan BAST, penyerahan akses kredensial lengkap, & garansi 30 hari.',
    doc: 'BAST (Berita Acara Serah Terima)',
    badge: 'STAGE 5',
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[80px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[02] // OPERATIONAL WORKFLOW"
        title={'ALUR SERTA SOP KERJA TERPERCAYA.\n5 TAHAP TRANSPARAN & OTOMATIS.'}
        subtitle="Setiap proyek diproses mengikuti 5 tahap SOP operasional bergaransi dengan penerbitan dokumen legal resmi."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
        {stages.map((stg) => (
          <div
            key={stg.num}
            className="flex flex-col justify-between p-8 bg-[#111111] border border-[#2D2D2D] hover:border-[#FFD600] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,214,0,0.1)] transition-all duration-300 relative group min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-ibm-mono text-[20px] font-bold text-[#FFD600] tracking-[2px]">
                  [{stg.num}]
                </span>
                <span className="font-ibm-mono text-[10px] text-[#FFD600] bg-[#1A180E] px-2.5 py-1 border border-[#FFD600]/40 font-bold tracking-[1px]">
                  {stg.badge}
                </span>
              </div>

              <h3 className="font-grotesk text-[18px] md:text-[19px] font-bold text-[#F5F5F0] mb-3 leading-snug group-hover:text-[#FFD600] transition-colors">
                {stg.title}
              </h3>

              <p className="font-ibm-mono text-[12px] text-[#888888] leading-[1.65] mb-6">
                {stg.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
              <div>
                <span className="font-ibm-mono text-[9px] text-[#555555] block tracking-[1px] uppercase">DOKUMEN RESMI SOP:</span>
                <span className="font-ibm-mono text-[11px] text-[#A0A0A0] font-semibold group-hover:text-[#F5F5F0] transition-colors">{stg.doc}</span>
              </div>
              <span className="font-ibm-mono text-[10px] text-[#FFD600] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
