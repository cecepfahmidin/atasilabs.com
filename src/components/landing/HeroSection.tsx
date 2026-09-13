'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowForward as ArrowForwardIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  Layers as LayersIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const theme = useTheme();
  const { setActiveView } = useApp();

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 14 },
        overflow: 'hidden',
        background:
          theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.15), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(217, 119, 6, 0.09), transparent)',
      }}
    >
      <Container maxWidth="lg">
        {/* Top Status Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              px: 2,
              py: 0.7,
              borderRadius: '9999px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.25)'}`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25)',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                letterSpacing: '0.02em',
                fontSize: '0.8rem',
              }}
            >
              AtasiLabs • Terbuka untuk Kontrak Proyek Web & Konsultasi Sistem
            </Typography>
          </Stack>
        </Box>

        {/* Main Headline */}
        <Box sx={{ textAlign: 'center', maxWidth: 840, mx: 'auto', mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 2.5,
              letterSpacing: '-0.03em',
            }}
          >
            Sistem Informasi Web Developer{' '}
            <Box
              component="span"
              sx={{
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 40%, #D97706 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #88481A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Portofolio & Manajemen Proyek
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            Arsitektur modern berbasis <strong>Next.js (App Router)</strong>, komponen antarmuka presisi <strong>Material UI (MUI)</strong>, komunikasi database type-safe <strong>Prisma ORM</strong>, serta penyimpanan & otentikasi <strong>Supabase (PostgreSQL)</strong>.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 7, justifyContent: 'center', alignItems: 'center' }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => handleScrollTo('#portfolio')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 3.5,
              py: 1.4,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 2.5,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.32)',
            }}
          >
            Jelajahi Portofolio
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => handleScrollTo('#contact')}
            startIcon={<EmailIcon />}
            sx={{
              px: 3.5,
              py: 1.4,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2.5,
              borderWidth: 1.5,
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              '&:hover': {
                borderWidth: 1.5,
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Konsultasi Proyek (Inquiry)
          </Button>

          <Button
            variant="text"
            size="large"
            onClick={() => setActiveView('dashboard')}
            sx={{
              px: 2.5,
              py: 1.4,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Buka Dashboard Admin →
          </Button>
        </Stack>

        {/* Tech Stack Banner Cards */}
        <Grid container spacing={2} sx={{ maxWidth: 960, mx: 'auto', justifyContent: 'center' }}>
          {[
            {
              title: 'Next.js App Router',
              subtitle: 'Server Actions & ISR',
              icon: <CodeIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />,
            },
            {
              title: 'Material UI (MUI)',
              subtitle: 'Design System & DataGrid',
              icon: <LayersIcon fontSize="small" sx={{ color: '#0ea5e9' }} />,
            },
            {
              title: 'Prisma ORM',
              subtitle: 'Type-Safe SQL Schemas',
              icon: <StorageIcon fontSize="small" sx={{ color: '#10b981' }} />,
            },
            {
              title: 'Supabase PostgreSQL',
              subtitle: 'RLS Security & Storage',
              icon: <SecurityIcon fontSize="small" sx={{ color: '#34d399' }} />,
            },
          ].map((item, idx) => (
            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${theme.palette.divider}`,
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    mx: 'auto',
                    mb: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.3 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {item.subtitle}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
