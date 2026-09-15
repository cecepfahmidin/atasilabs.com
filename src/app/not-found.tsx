'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '5rem' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Halaman Tidak Ditemukan
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
      </Typography>
      <Button variant="contained" component={Link} href="/" sx={{ fontWeight: 700 }}>
        Kembali ke Beranda
      </Button>
    </Box>
  );
}
