'use client';

import React, { useState } from 'react';
import SectionHeader from './SectionHeader';

const faqs = [
  {
    question: "APAKAH ATASILABS MENYEDIAKAN DASHBOARD & PORTAL WORKFLOW KLIEN?",
    answer:
      "YA. SETIAP KLIEN MENDAPATKAN AKSES KE DASHBOARD SISTEM INTEGRASI TERMASUK WORKFLOW PROYEK, REVISE DOKUMEN, PEMBAYARAN, SERTA PENANDATANGANAN DOKUMEN DIGITAL (E-SIGN).",
    defaultOpen: true,
  },
  {
    question: "BERAPA LAMA PROSES DEVELOPMENT BERJALAN?",
    answer:
      "TERGANTUNG SKALA PAKET: SPRINT EXPRESS MVP HANYA MEMBUTHUKAN 1-2 MINGGU. SPRINT ENTERPRISE SAAS MEMBUTUHKAN 3-6 MINGGU DENGAN METODOLOGI IPW (ITERATIVE PHASED WORKFLOW).",
  },
  {
    question: "APAKAH SAYA MENDAPATKAN AKSES CODEBASE SECARA PENUH?",
    answer:
      "YA. 100% REPOSITORI GITHUB DENGAN AKSES DEPLOYMENT SECARA MANDIRI (VERCEL / SUPABASE / DOCKER). TANPA VENDOR LOCK-IN TERSEMBUNYI.",
  },
  {
    question: "BAGAIMANA CARA MEMULAI DISKUSI DAN MEMBUAT KONTRAK KERJA?",
    answer:
      "ANDA DAPAT MENGISI FORM INQUIRY PROYEK DI BAWAH INI. TIM KAMI AKAN MENYIAPKAN DOKUMEN PROPOSAL & SOW LANGSUNG DI DASHBOARD KLIEN.",
  },
  {
    question: "TEKNOLOGI APA YANG UTAMA DIGUNAKAN?",
    answer:
      "NEXT.JS 15 (APP ROUTER), TYPESCRIPT, MATERIAL UI V6, TAILWIND CSS, PRISMA ORM, SUPABASE POSTGRESQL, DAN AUTOMATED DOC WORKFLOW ENGINES.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="flex flex-col w-full bg-[#060606] py-16 px-6 md:py-[100px] md:px-[120px]">
      <div className="w-full max-w-[540px]">
        <SectionHeader
          label="[09] // FAQ"
          title={"PERTANYAAN\nPOPULER."}
          subtitle="SEMUA INFORMASI DASAR SEBELUM MEMULAI PROJECT SPRINT BERSAMA ATASILABS."
          titleWidth="w-full"
          subtitleWidth="w-full"
        />
      </div>

      <div className="h-10 md:h-[48px]" />

      {/* FAQ items */}
      <div className="flex flex-col w-full">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="flex flex-col w-full border-t border-t-[#1D1D1D]">
              <button
                className="flex items-center justify-between w-full py-5 md:h-[72px] text-left gap-4"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="font-grotesk text-[14px] md:text-[16px] font-bold text-[#F5F5F0] tracking-[0.5px]">
                  {faq.question}
                </span>
                <div
                  className="flex items-center justify-center w-[32px] h-[32px] shrink-0"
                  style={{
                    backgroundColor: isOpen ? "#FFD600" : "#1A1A1A",
                    border: isOpen ? "none" : "1px solid #3D3D3D",
                  }}
                >
                  <span
                    className="font-ibm-mono text-[14px] font-bold"
                    style={{ color: isOpen ? "#0A0A0A" : "#888888" }}
                  >
                    {isOpen ? "—" : "+"}
                  </span>
                </div>
              </button>
              {isOpen && faq.answer && (
                <div className="pb-8">
                  <p className="font-ibm-mono text-[12px] md:text-[13px] text-[#888888] tracking-[0.5px] leading-[1.6]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div className="border-t border-t-[#1D1D1D]" />
      </div>

      {/* CTA bottom info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-[16px] pt-10 md:pt-[48px]">
        <span className="font-ibm-mono text-[13px] text-[#555555] tracking-[1px]">
          MASIH PUNYA PERTANYAAN LAIN?
        </span>
        <a
          href="#contact"
          className="font-ibm-mono text-[13px] font-bold text-[#FFD600] tracking-[1px] cursor-pointer hover:underline"
        >
          KONSULTASI GRATIS &gt;
        </a>
      </div>
    </section>
  );
};

export default FAQSection;
