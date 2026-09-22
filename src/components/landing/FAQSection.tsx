'use client';

import React, { useState } from 'react';
import SectionHeader from './SectionHeader';

const faqs = [
  {
    question: "BERAPA LAMA PROSES PEMBUATAN WEBSITE HINGGA BISA DIAKSES?",
    answer:
      "Waktu pengerjaan bervariasi sesuai paket pilihan Anda. Paket Landing Page Express membutuhkan 3-7 hari kerja, sedangkan Company Profile & E-Commerce membutuhkan 1-3 minggu kerja.",
    defaultOpen: true,
  },
  {
    question: "APAKAH BIAYA SUDAH TERMASUK DOMAIN, HOSTING, DAN SSL?",
    answer:
      "YA. Seluruh paket layanan di AtasiLabs sudah termasuk nama domain (.com / .id), cloud hosting berkecepatan tinggi, sertifikat keamanan SSL (HTTPS), dan optimasi dasar.",
  },
  {
    question: "BAGAIMANA SISTEM PEMBAYARAN DAN GARANSI KEAMANANNYA?",
    answer:
      "Pembayaran dilakukan secara bertahap (DP awal untuk memulai pengerjaan dan pelunasan setelah proyek selesai 100%). Kami memberikan jaminan garansi kepuasan serta dokumen kontrak legal resmi.",
  },
  {
    question: "APAKAH WEBSITE DILENGKAPI TAMPILAN MOBILE FRIENDLY & CEPAT?",
    answer:
      "Sangat responsif. Setiap halaman diuji khusus di berbagai perangkat (Smartphone, Tablet, & Laptop) agar muat secara cepat (super-fast loading) dan nyaman dibaca pengunjung.",
  },
  {
    question: "APAKAH SAYA BISA MENGEDIT TEKS DAN PRODUK WEBSITE SENDIRI?",
    answer:
      "Tentu saja. Anda akan mendapatkan akses ke dashboard pengelola yang sangat mudah digunakan tanpa perlu keahlian koding, lengkap dengan panduan operasinya.",
  },
  {
    question: "BAGAIMANA JIKA TERJADI KENDALA ATAU ERROR SETELAH WEBSITE SELESAI?",
    answer:
      "AtasiLabs menyediakan garansi pemeliharaan & dukungan teknis gratis (30 hingga 90 hari) setelah serah terima untuk memastikan website Anda selalu aktif dan lancar.",
  },
  {
    question: "DAPATKAH INTEGRASI FITUR KHUSUS DITAMBAHKAN DI MASA DEPAN?",
    answer:
      "Bisa. Website kami dibangun dengan arsitektur modern yang modular, sehingga fitur baru seperti pembayaran otomatis, WhatsApp catalog, atau sistem booking bisa ditambahkan kapan saja.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="flex flex-col w-full bg-[#060606] py-16 px-6 md:py-[100px] md:px-[120px]">
      <div className="w-full max-w-[540px]">
        <SectionHeader
          label="[09] // FAQ"
          title={"PERTANYAAN\nYANG SERING MUNCUL"}
          subtitle="SEMUA INFORMASI DASAR SEBELUM MEMULAI PROJECT BERSAMA ATASILABS."
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
                  <p className="font-ibm-mono text-[14px] md:text-[15px] text-[#888888] tracking-[0.5px] leading-[1.6]">
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
