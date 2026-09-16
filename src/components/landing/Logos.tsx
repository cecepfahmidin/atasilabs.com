'use client';

const logos = [
  'PT NUSANTARA TEKNOLOGI',
  'ALPHA CAPITAL PARTNERS',
  'KREASI BUSANA INDONESIA',
  'YAYASAN MEDIKA SEHAT',
  'SOLUSI DIGITAL KREATIF',
];

export function Logos() {
  return (
    <section className="flex flex-col items-center w-full bg-[#0F0F0F] py-[44px] px-6 md:px-[80px] gap-[24px] border-y border-[#1E1E1E]">
      <span className="font-ibm-mono text-[10px] md:text-[11px] text-[#666666] tracking-[3px]">
        [01] // DUKUNGAN KEMITRAAN & EKOSISTEM KLIEN AKTIF
      </span>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-[36px] w-full">
        {logos.map((logo) => (
          <span
            key={logo}
            className="inline-block font-grotesk text-[11px] md:text-[13px] font-bold text-[#888888] hover:text-[#FFD600] transition-colors tracking-[2px] px-3 py-1.5 bg-[#141414] border border-[#262626]"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}

export default Logos;
