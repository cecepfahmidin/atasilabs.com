'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from './SectionHeader';
import { useApp } from '../../context/AppContext';

import { computeBudgetFromService } from '../../lib/pricingUtils';

export const ContactSection: React.FC = () => {
  const router = useRouter();
  const { addLead, selectedServiceForInquiry, setDashboardTab, pricingTiers, companyContact } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    serviceType: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedServiceForInquiry) {
      setFormData((prev) => ({
        ...prev,
        serviceType: selectedServiceForInquiry,
      }));
    }
  }, [selectedServiceForInquiry]);

  const defaultOptions = [
    ...pricingTiers.map((t) => `Paket Tier ${t.tierNumber}: ${t.name}`),
    'Full-Stack Web App (Next.js & Supabase)',
    'SaaS & Enterprise Dashboard UI (Material UI)',
    'E-Commerce Storefront & Payment Gateway',
    'Database Architecture & ORM Migration (Prisma)',
    'Code Audit & Performance Optimization',
    'Lainnya / Konsultasi Kustom',
  ];

  const serviceOptions = Array.from(
    new Set(
      formData.serviceType && !defaultOptions.includes(formData.serviceType)
        ? [formData.serviceType, ...defaultOptions]
        : defaultOptions
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Mohon lengkapi Nama, Email, dan Pesan Proyek Anda.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const company = formData.company.trim();
    const serviceType = formData.serviceType || 'Konsultasi Umum';
    const message = formData.message.trim();
    const budgetInfo = computeBudgetFromService(serviceType, pricingTiers);

    try {
      const created = await addLead({
        name,
        email,
        company: company || 'Pribadi / Perorangan',
        serviceType,
        budget: budgetInfo.text,
        message,
      });

      setSubmittedLeadId(created.id);

      const waText = `Halo ${companyContact.companyName || 'Atasilabs'}, saya ingin mengirim inquiry proyek:\n\n` +
        `• Nama: ${name}\n` +
        `• Email: ${email}\n` +
        (company ? `• Perusahaan: ${company}\n` : '') +
        `• Layanan: ${serviceType}\n` +
        `• Estimasi Paket: ${budgetInfo.text}\n` +
        `• Pesan: ${message}`;

      const waUrl = `https://wa.me/${companyContact.whatsappRaw || '628216361428'}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');

      setFormData({
        name: '',
        email: '',
        company: '',
        serviceType: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px] border-t border-[#1D1D1D]">
      <SectionHeader
        label="[10] // GET IN TOUCH"
        title={"MULAI PROYEK\nSOFTWARE ANDA."}
        subtitle="KIRIMKAN RINCIAN PROYEK. TIM ARCHITECT ATASILABS AKAN MERESPONS DALAM 24 JAM BERSAMA ESTIMASI SOW."
      />

      {submittedLeadId ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-[#111111] border-2 border-[#FFD600] gap-6 text-center max-w-[800px] mx-auto w-full">
          <div className="w-16 h-16 bg-[#FFD600] text-[#0A0A0A] flex items-center justify-center font-grotesk text-2xl font-bold">
            ✓
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-ibm-mono text-[11px] text-[#FFD600] tracking-[2px]">
              [PESAN TERKIRIM // LEAD ID: {submittedLeadId}]
            </span>
            <h3 className="font-grotesk text-[28px] font-bold text-[#F5F5F0]">
              Terima Kasih! Inquiry Anda Telah Diterima.
            </h3>
            <p className="font-ibm-mono text-[12px] text-[#888888] max-w-[600px] mx-auto leading-[1.6]">
              Tim Software Engineer kami telah menerima inquiry Anda di dashboard dan membuka percakapan WhatsApp. Jika WhatsApp belum terbuka, silakan klik tombol di bawah.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href={`https://wa.me/${companyContact.whatsappRaw || '628216361428'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 h-12 bg-[#25D366] text-[#0A0A0A] font-grotesk font-bold text-[12px] tracking-[1px] hover:bg-[#20bd5a] transition-colors"
            >
              HUBUNGI VIA WHATSAPP ({companyContact.whatsapp}) →
            </a>
            <button
              onClick={() => {
                setDashboardTab('leads');
                router.push('/dashboard/leads');
              }}
              className="flex items-center justify-center px-6 h-12 bg-[#FFD600] text-[#0A0A0A] font-grotesk font-bold text-[12px] tracking-[1px] hover:bg-[#e6c200] transition-colors"
            >
              PANTAU LEAD DI DASHBOARD →
            </button>
            <button
              onClick={() => setSubmittedLeadId(null)}
              className="flex items-center justify-center px-6 h-12 bg-[#1A1A1A] text-[#888888] border border-[#3D3D3D] font-ibm-mono text-[11px] tracking-[1px] hover:text-[#F5F5F0]"
            >
              KIRIM PESAN LAIN
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 flex flex-col gap-8 bg-[#0F0F0F] p-8 border border-[#2D2D2D]">
            <div className="flex flex-col gap-2">
              <span className="font-ibm-mono text-[10px] text-[#FFD600] tracking-[2px] font-bold">
                [CONTACT DIRECTORY]
              </span>
              <h3 className="font-grotesk text-[22px] font-bold text-[#F5F5F0]">
                {companyContact.companyName}
              </h3>
              <p className="font-ibm-mono text-[11px] text-[#888888] leading-[1.6]">
                {companyContact.description}
              </p>
            </div>

            <div className="flex flex-col gap-6 pt-4 border-t border-[#1D1D1D]">
              <div className="flex flex-col gap-1">
                <span className="font-ibm-mono text-[9px] text-[#555555] tracking-[2px] font-bold">EMAIL SUPPORT</span>
                <a href={`mailto:${companyContact.email}`} className="font-ibm-mono text-[13px] text-[#F5F5F0] font-bold hover:text-[#FFD600]">
                  {companyContact.email}
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-ibm-mono text-[9px] text-[#555555] tracking-[2px] font-bold">WHATSAPP / CONSULTATION</span>
                <a
                  href={`https://wa.me/${companyContact.whatsappRaw || '628216361428'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ibm-mono text-[13px] text-[#FFD600] font-bold hover:underline"
                >
                  {companyContact.whatsapp}
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-ibm-mono text-[9px] text-[#555555] tracking-[2px] font-bold">STUDIO LOCATION</span>
                <span className="font-ibm-mono text-[12px] text-[#CCCCCC]">{companyContact.address}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-ibm-mono text-[9px] text-[#555555] tracking-[2px] font-bold">WORKING HOURS</span>
                <span className="font-ibm-mono text-[12px] text-[#CCCCCC]">{companyContact.workingHours}</span>
              </div>
            </div>

            {/* NDA Guarantee Tag */}
            <div className="flex items-center gap-3 p-4 bg-[#141414] border border-[#2D2D2D] mt-auto">
              <span className="font-ibm-mono text-[14px] text-[#FFD600]">🔒</span>
              <span className="font-ibm-mono text-[10px] text-[#888888] leading-[1.4]">
                {companyContact.ndaNotice}
              </span>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-[#111111] p-8 md:p-10 border-2 border-[#2D2D2D]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {errorMsg && (
                <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35] font-ibm-mono text-[11px] text-[#FF6B35]">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                    NAMA LENGKAP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full h-12 bg-[#0A0A0A] border border-[#2D2D2D] focus:border-[#FFD600] px-4 font-ibm-mono text-[12px] text-[#F5F5F0] outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                    EMAIL BISNIS *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full h-12 bg-[#0A0A0A] border border-[#2D2D2D] focus:border-[#FFD600] px-4 font-ibm-mono text-[12px] text-[#F5F5F0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company */}
                <div className="flex flex-col gap-2">
                  <label className="font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                    NAMA PERUSAHAAN / STARTUP
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="PT Tech Innovation"
                    className="w-full h-12 bg-[#0A0A0A] border border-[#2D2D2D] focus:border-[#FFD600] px-4 font-ibm-mono text-[12px] text-[#F5F5F0] outline-none transition-colors"
                  />
                </div>

                {/* Service Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                    JENIS LAYANAN / PAKET
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full h-12 bg-[#0A0A0A] border border-[#2D2D2D] focus:border-[#FFD600] px-4 font-ibm-mono text-[12px] text-[#F5F5F0] outline-none transition-colors"
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0A0A0A] text-[#F5F5F0]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="font-ibm-mono text-[10px] text-[#888888] tracking-[1.5px] font-bold uppercase">
                  RINGKASAN PROYEK & KEBUTUHAN UTAMA *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Jelaskan kebutuhan aplikasi, target launching, atau integrasi yang diinginkan..."
                  className="w-full bg-[#0A0A0A] border border-[#2D2D2D] focus:border-[#FFD600] p-4 font-ibm-mono text-[12px] text-[#F5F5F0] outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#FFD600] hover:bg-[#e6c200] disabled:bg-[#333333] text-[#0A0A0A] font-grotesk font-bold text-[13px] tracking-[2px] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'SENDING INQUIRY...' : 'KIRIM INQUIRY PROYEK →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactSection;
