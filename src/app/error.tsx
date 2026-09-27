'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
        Pembaruan Aplikasi Tersedia
      </h2>
      <p style={{ color: '#888888', marginBottom: '24px', maxWidth: '400px' }}>
        Versi terbaru AtasiLabs telah berhasil di-deploy. Silakan muat ulang halaman untuk memperbarui aset aplikasi.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#000000',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Muat Ulang Halaman
      </button>
    </div>
  );
}
