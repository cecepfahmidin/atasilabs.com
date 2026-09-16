'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Terminal as TerminalIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

export const Footer: React.FC = () => {
  const theme = useTheme();
  const { setActiveView, setDashboardTab } = useApp();

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        pt: 8,
        pb: 5,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#050505' : '#f8fafc',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand Col */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AtasiLabsLogo height={36} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2.5, maxWidth: 320 }}>
              Sistem Informasi Web Developer & Portofolio Manajemen Proyek AtasiLabs berbasis Next.js, Material UI, Prisma ORM, dan Supabase Database.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                component="a"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                component="a"
                href="mailto:cecepfahmidin@gmail.com"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Navigation Col */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Navigasi
            </Typography>
            <Stack spacing={1.2}>
              {['Beranda', 'Layanan', 'Pricelist', 'Portofolio', 'Arsitektur', 'Kontak'].map((link) => (
                <Link
                  key={link}
                  component="button"
                  onClick={() => handleNavClick(link === 'Pricelist' ? '#pricing' : `#${link.toLowerCase()}`)}
                  color="text.secondary"
                  underline="hover"
                  sx={{ textAlign: 'left', fontSize: '0.88rem' }}
                >
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Technology Stack Col */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Teknologi Sistem
            </Typography>
            <Stack spacing={1.2}>
              <Typography variant="body2" color="text.secondary">Next.js 14+ (App Router)</Typography>
              <Typography variant="body2" color="text.secondary">Material UI (MUI Terbaru)</Typography>
              <Typography variant="body2" color="text.secondary">Prisma ORM (PostgreSQL)</Typography>
              <Typography variant="body2" color="text.secondary">Supabase Auth & Storage</Typography>
              <Typography variant="body2" color="text.secondary">Row Level Security (RLS)</Typography>
            </Stack>
          </Grid>

          {/* Dashboard Quick Access */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Akses Admin
            </Typography>
            <Stack spacing={1.2}>
              <Link
                component="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardTab('overview');
                }}
                color="primary"
                underline="hover"
                sx={{ textAlign: 'left', fontSize: '0.88rem', fontWeight: 600 }}
              >
                → Ringkasan Dashboard (Overview)
              </Link>
              <Link
                component="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardTab('pricing');
                }}
                color="primary"
                underline="hover"
                sx={{ textAlign: 'left', fontSize: '0.88rem', fontWeight: 600 }}
              >
                → Atur Pricelist & Spec (5 Tiers)
              </Link>
              <Link
                component="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardTab('leads');
                }}
                color="text.secondary"
                underline="hover"
                sx={{ textAlign: 'left', fontSize: '0.88rem' }}
              >
                Kelola Pesan Masuk (Leads)
              </Link>
              <Link
                component="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardTab('portfolio');
                }}
                color="text.secondary"
                underline="hover"
                sx={{ textAlign: 'left', fontSize: '0.88rem' }}
              >
                Manajemen Portofolio (CMS)
              </Link>
              <Link
                component="button"
                onClick={() => {
                  setActiveView('dashboard');
                  setDashboardTab('projects');
                }}
                color="text.secondary"
                underline="hover"
                sx={{ textAlign: 'left', fontSize: '0.88rem' }}
              >
                Progres Proyek & Deadline
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Sistem Informasi Web Developer. Dokumen Kebutuhan Sistem (RSD) Implemented.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
            <SecurityIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              Supabase Auth & Prisma Client Protected
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
