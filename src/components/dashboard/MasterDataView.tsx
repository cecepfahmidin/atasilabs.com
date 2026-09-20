'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Code as CodeIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowForwardIcon,
  Storage as MasterDataIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export const MasterDataView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { setDashboardTab, portfolios, pricingTiers, companyContact, users } = useApp();

  const handleNavigate = (tab: 'users' | 'portfolio' | 'pricing' | 'contact', href: string) => {
    setDashboardTab(tab);
    router.push(href);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3.5,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: `1px solid ${theme.palette.divider}`,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Chip
            icon={<MasterDataIcon sx={{ fontSize: 16 }} />}
            label="PUSAT MASTER DATA"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Manajemen Master Data System
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, lineHeight: 1.6 }}>
          Pusat kendali master data Atasilabs. Kelola hak akses pengguna (User & RBAC), katalog portofolio, konfigurasi paket harga (Pricelist & Spesifikasi), serta informasi kontak resmi perusahaan.
        </Typography>
      </Paper>

      {/* Grid Cards */}
      <Grid container spacing={3}>
        {/* Card 1: Manajemen User & RBAC */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                borderColor: theme.palette.info.main,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(6, 182, 212, 0.12)',
                    color: '#06b6d4',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  label={`${users?.length || 0} Pengguna Aktif`}
                  color="info"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Manajemen User & RBAC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                Kelola kredensial akun pengguna, penetapan peran (CEO, CTO, CMO, Admin, Client, Freelancer, Dev), dan matriks perizinan sistem.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    7 Peran Role Akses (CEO, CTO, CMO, Admin, etc.)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Matriks Perizinan Granular Sistem
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Fitur Simulasi Cepat Ganti Peran
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigate('users', '/dashboard/users')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
              >
                Buka CMS User & RBAC
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card 2: Manajemen Portofolio */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CodeIcon sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  label={`${portfolios?.length || 0} Karya Aktif`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Manajemen Portofolio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                Kelola koleksi portofolio hasil karya pembuatan website, aplikasi SaaS, e-commerce, dan sistem enterprise Atasilabs.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Kategorisasi Teknologi & Stacks
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Upload Media Gambar & Showcase
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Sinkronisasi Landing Page
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigate('portfolio', '/dashboard/portfolio')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
              >
                Buka CMS Portofolio
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card 3: Atur Pricelist & Spec */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                borderColor: theme.palette.warning.main,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(245, 158, 11, 0.12)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <BoltIcon sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  label={`${pricingTiers?.length || 5} Paket Tier`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Atur Pricelist & Spec
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                Konfigurasi harga paket layanan (Tier 1 Starter s/d Tier 5 Elite), estimasi pengerjaan, kuota revisi, dan rincian spesifikasi teknis.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Penetapan Harga Paket Tier 1-5
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Fitur & Highlight Badge
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Sinkronisasi dengan HPP Matrix
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigate('pricing', '/dashboard/pricing')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
              >
                Buka CMS Pricelist
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card 4: Kontak Perusahaan */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                borderColor: theme.palette.success.main,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  label="Informasi Perusahaan"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Kontak Perusahaan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                Kelola alamat email support, nomor WhatsApp resmi, lokasi HQ, jam kerja, garansi NDA, dan tautan sosial media perusahaan.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    WhatsApp ({companyContact?.whatsapp || 'Resmi'})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Email Support ({companyContact?.email || 'atasilabs@gmail.com'})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Realtime Sync ke Landing Page
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigate('contact', '/dashboard/contact')}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
              >
                Buka CMS Kontak
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
