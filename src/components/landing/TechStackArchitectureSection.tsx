'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Storage as StorageIcon,
  Shield as ShieldIcon,
  Code as CodeIcon,
  Layers as LayersIcon,
  SyncAlt as SyncAltIcon,
  CheckCircleOutlined as CheckIcon,
} from '@mui/icons-material';

export const TechStackArchitectureSection: React.FC = () => {
  const theme = useTheme();

  const architecturePillars = [
    {
      title: 'Frontend & UI Presentation',
      badge: 'Client & Server Components',
      color: theme.palette.primary.main,
      icon: <LayersIcon sx={{ color: theme.palette.primary.main }} />,
      desc: 'Next.js App Router dipadukan dengan Material UI (MUI) versi terbaru untuk antarmuka konsisten, responsif, dan aksesibilitas tinggi.',
      points: [
        'MUI ThemeProvider mendukung Light/Dark mode native',
        'Komponen MUI DataGrid untuk tabel admin kompleks',
        'Next/image teroptimasi untuk aset Supabase Storage',
      ],
    },
    {
      title: 'Server Actions & ORM Layer',
      badge: 'Type-Safe Data Processing',
      color: '#10b981',
      icon: <CodeIcon sx={{ color: '#10b981' }} />,
      desc: 'Logika backend diproses via Next.js Server Actions dan Route Handlers yang divalidasi langsung oleh Prisma ORM.',
      points: [
        'Prisma Client mencegah injeksi SQL secara otomatis',
        'Type-safety penuh antara schema.prisma dan TypeScript',
        'Incremental Static Regeneration (ISR) untuk cache cepat',
      ],
    },
    {
      title: 'Supabase PostgreSQL & Auth',
      badge: 'Database, RLS & Storage',
      color: '#8b5cf6',
      icon: <StorageIcon sx={{ color: '#8b5cf6' }} />,
      desc: 'Basis data PostgreSQL terkelola dengan Row Level Security (RLS), Supabase Auth untuk proteksi rute, dan Supabase Storage untuk media.',
      points: [
        'Row Level Security (RLS) menjaga akses data Lead & Proyek',
        'Middleware Next.js memverifikasi sesi JWT pengguna',
        'Supabase Storage bucket terisolasi untuk aset gambar portofolio',
      ],
    },
  ];

  return (
    <Box
      id="architecture"
      sx={{
        py: { xs: 8, md: 12 },
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#0e1424' : '#f1f5f9',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 }, maxWidth: 750, mx: 'auto' }}>
          <Chip
            label="ARSITEKTUR & SPESIFIKASI SISTEM"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.75rem', letterSpacing: '0.05em' }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Arsitektur Full-Stack Serverless Terintegrasi
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            Desain alur kerja end-to-end yang menjamin keamanan data, kecepatan rendering, dan kemudahan skalabilitas sesuai Dokumen Spesifikasi Kebutuhan Sistem (RSD).
          </Typography>
        </Box>

        {/* Pillars Grid */}
        <Grid container spacing={3.5} sx={{ mb: 6 }}>
          {architecturePillars.map((pillar, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3.5,
                  borderRadius: 3.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: pillar.color,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      backgroundColor: `${pillar.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {pillar.icon}
                  </Box>
                  <Chip
                    label={pillar.badge}
                    size="small"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: `${pillar.color}15`,
                      color: pillar.color,
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {pillar.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
                  {pillar.desc}
                </Typography>

                <Divider sx={{ mb: 2.5 }} />

                <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                  {pillar.points.map((pt, pIdx) => (
                    <Box key={pIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                      <CheckIcon sx={{ fontSize: 18, color: pillar.color, mt: '2px', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                        {pt}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Data Flow Pipeline Illustration Box */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncAltIcon color="primary" /> Alur Pemrosesan Data: Dari Formulir Kontak ke Tabel Supabase
          </Typography>

          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {[
              { step: '1', title: 'User Input', desc: 'Pengunjung mengisi formulir MUI TextField di Landing Page' },
              { step: '2', title: 'Server Action', desc: 'Data divalidasi di server Next.js tanpa membocorkan kredensial' },
              { step: '3', title: 'Prisma Client', desc: 'Query parameterisasi type-safe dieksekusi secara otomatis' },
              { step: '4', title: 'Supabase DB', desc: 'Tersimpan aman di tabel Lead dengan perlindungan RLS Supabase' },
            ].map((step, sIdx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={sIdx}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}
                >
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
                    FASE 0{step.step}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};
