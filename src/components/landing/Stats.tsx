'use client';

const stats = [
  { value: '100%', label: 'TYPE-SAFE PRISMA ORM', border: true },
  { value: '98+', label: 'LIGHTHOUSE SPEED SCORE', border: true },
  { value: '5-DOC', label: 'AUTOMATED SOP PACKAGE', border: true },
  { value: '<100MS', label: 'SUPABASE POSTGRES LATENCY', border: false },
];

export function Stats() {
  return (
    <section className="flex flex-col w-full bg-[#FFD600] py-12 px-6 md:py-[75px] md:px-[80px]">
      <span className="font-ibm-mono text-[12px] font-bold text-[#0A0A0A] tracking-[3px]">
        [04] // METRIK PERFORMA & STANDAR APLIKASI WEB
      </span>
      <div className="h-6 md:h-[28px]" />
      <div className="grid grid-cols-2 md:flex w-full gap-[2px] md:gap-0">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-2 items-center justify-center py-6 md:py-0 md:h-[150px] md:flex-1
              ${stat.border ? 'md:border-r-2 md:border-r-[#0A0A0A]' : ''}
              ${i === 0 ? 'md:pr-[30px]' : i === stats.length - 1 ? 'md:pl-[30px]' : 'md:px-[30px]'}
              ${i % 2 === 0 ? 'border-r-2 border-r-[#0A0A0A] pr-4 md:border-r-0 md:pr-0' : 'pl-4 md:pl-0'}
              ${i >= 2 ? 'border-t-2 border-t-[#0A0A0A] pt-4 md:border-t-0 md:pt-0' : ''}
            `}
          >
            <span className="font-grotesk text-[36px] md:text-[54px] font-bold text-[#0A0A0A] tracking-[-2px] leading-none">
              {stat.value}
            </span>
            <span className="font-ibm-mono text-[10px] md:text-[11px] font-bold text-[#1A1A1A] tracking-[2px] text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
