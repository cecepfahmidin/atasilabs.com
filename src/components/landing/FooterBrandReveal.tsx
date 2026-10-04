'use client';

import React, { useEffect, useRef } from 'react';

/**
 * FooterBrandReveal
 * -----------------------------------------------------------------------------
 * Layer paling belakang dari footer laman depan (efek closing ala TRAE.ai).
 *
 * Teknik:
 * - `.brand-reveal` (wrapper) berada di alur dokumen normal setinggi panel dan
 *   memakai `clip-path` sehingga anak `position: fixed` hanya terlihat di area
 *   wrapper tersebut.
 * - `.brand-reveal__panel` di-`fixed` ke bawah viewport → typography raksasa
 *   DIAM di tempat, sementara footer hitam (layer depan, z-index lebih tinggi)
 *   bergeser ke atas dan "menyingkap" panel kuning dari bawah.
 * - Progress reveal (0 → 1) ditulis ke CSS var `--reveal` untuk micro-animasi
 *   (shade, parallax brand mark, fade meta) tanpa re-render React.
 */

const BRAND_SVG_SRC = '/sticky-footer.svg';

export const FooterBrandReveal: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const brandImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel) return;

    let raf = 0;

    // 1) Samakan tinggi wrapper (alur dokumen) dengan tinggi panel fixed
    const syncHeight = () => {
      wrapper.style.height = `${panel.offsetHeight}px`;
    };

    // 2) Hitung progress reveal 0 → 1 saat wrapper masuk viewport
    const updateProgress = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const h = rect.height || 1;
      const p = Math.min(1, Math.max(0, (vh - rect.top) / h));
      wrapper.style.setProperty('--reveal', p.toFixed(4));
      wrapper.dataset.active = p > 0 ? 'true' : 'false';
    };

    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    };

    const relayout = () => {
      syncHeight();
      requestUpdate();
    };

    relayout();
    const img = brandImgRef.current;
    if (img && !img.complete) img.addEventListener('load', relayout, { once: true });

    const ro = new ResizeObserver(() => {
      syncHeight();
      requestUpdate();
    });
    ro.observe(panel);

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', relayout);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', relayout);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div ref={wrapperRef} className="brand-reveal" data-active="false" aria-label="AtasiLabs">
      <div ref={panelRef} className="brand-reveal__panel">
        {/* Editorial grid lines */}
        <div className="brand-reveal__grid" aria-hidden="true" />

        {/* Meta row */}
        <div className="brand-reveal__meta">
          <div className="flex flex-col gap-1">
            <span className="font-grotesk text-[12px] md:text-[13px] font-bold tracking-[2px]">[ ATASILABS® ]</span>
            <span className="font-ibm-mono text-[10px] md:text-[11px] tracking-[1px] opacity-70">
              BUILD YOUR DIGITAL FUTURE
            </span>
          </div>

          <div className="hidden md:flex flex-col gap-1">
            <span className="font-ibm-mono text-[11px] tracking-[1px] font-bold">SUBANG — JAWA BARAT — ID</span>
            <span className="font-ibm-mono text-[11px] tracking-[1px] opacity-70">6.6291° S / 107.7549° E</span>
          </div>

          <div className="hidden lg:flex flex-col gap-1">
            <span className="font-ibm-mono text-[11px] tracking-[1px] font-bold">SOFTWARE DEVELOPER & DIGITAL PARTNER</span>
            <span className="font-ibm-mono text-[11px] tracking-[1px] opacity-70">EST. 2026 / V.1.0</span>
          </div>

          <button
            id="footer-back-to-top"
            type="button"
            onClick={scrollToTop}
            className="brand-reveal__top-btn"
            aria-label="Kembali ke atas halaman"
          >
            <span className="hidden sm:inline">KEMBALI KE ATAS</span>
            <span className="sm:hidden">TOP</span>
            <span className="brand-reveal__top-arrow" aria-hidden="true">↑</span>
          </button>
        </div>

        {/* Giant brand mark (SVG) — full-bleed, bagian bawah sengaja keluar viewport */}
        <div className="brand-reveal__giant">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={brandImgRef}
            src={BRAND_SVG_SRC}
            alt="ATASILABS"
            width={1223}
            height={186}
            draggable={false}
            className="brand-reveal__svg"
          />
        </div>

        {/* Shade: gelap saat tertutup, terang saat foreground terangkat */}
        <div className="brand-reveal__shade" aria-hidden="true" />
      </div>
    </div>
  );
};

export default FooterBrandReveal;
