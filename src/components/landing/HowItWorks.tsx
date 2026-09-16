'use client';

import { SectionHeader } from './SectionHeader';

const stages = [
  {
    num: '01',
    title: 'DISCOVERY & INTAKE (CIF)',
    desc: 'Pengumpulan kebutuhan awal (Form CIF), target launching, & penentuan klaster Tier 1-5.',
    doc: 'CIF (Customer Information Form)',
    badge: 'STAGE 1',
  },
  {
    num: '02',
    title: 'SPESIFIKASI TEKNIS (RSD)',
    desc: 'Penyusunan rincian fitur ATL-xxx, NFR, Tech Stack, & estimasi milestone pengerjaan.',
    doc: 'RSD (Requirement Spec Document)',
    badge: 'STAGE 2',
  },
  {
    num: '03',
    title: 'KONTRAK BISNIS (MoU)',
    desc: 'Kesepakatan MoU PT Aulia Indoland Grup, skema DP/termin, & rekening pembayaran.',
    doc: 'MoU (Memorandum of Understanding)',
    badge: 'STAGE 3',
  },
  {
    num: '04',
    title: 'PENDELEGASIAN TIM (SPK)',
    desc: 'Penerbitan SPK Mitra Developer, skema fee pengerjaan, & jadwal deadline sprints.',
    doc: 'SPK (Surat Perintah Kerja)',
    badge: 'STAGE 4',
  },
  {
    num: '05',
    title: 'QA TESTING & UAT REVIEW',
    desc: 'Pengembangan full-stack, QA Testing Sprints, Staging deployment, & checklist UAT Klien.',
    doc: 'QA Checklist & UAT Report',
    badge: 'STAGE 5',
  },
  {
    num: '06',
    title: 'SERAH TERIMA & BAST',
    desc: 'Penandatanganan Berita Acara Serah Terima (BAST), serah kredensial & garansi 30-90 hari.',
    doc: 'BAST (Berita Acara Serah Terima)',
    badge: 'STAGE 6',
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[80px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[03] // OPERATIONAL WORKFLOW"
        title={'ALUR SERTA SOP KERJA 6-STAGE IPW.\nTERPERCAYA & OTOMATIS.'}
        subtitle="Setiap proyek diproses mengikuti 6 tahap SOP operasional bergaransi dengan penerbitan 5 paket dokumen legal otomatis ber-kop resmi."
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
