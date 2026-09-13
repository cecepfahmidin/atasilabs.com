'use client';

import React, { useState } from 'react';
import Grid from '@mui/material/Grid2';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  HelpOutlined as HelpIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Bolt as BoltIcon,
  CompareArrows as CompareIcon,
  Security as SecurityIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { PricingTier } from '../../types';

export const PricingSection: React.FC = () => {
  const theme = useTheme();
  const { pricingTiers, setSelectedServiceForInquiry } = useApp();
  const [showComparison, setShowComparison] = useState(false);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleSelectTier = (tier: PricingTier) => {
    // Pre-fill contact form
    const serviceName = `Paket Tier ${tier.tierNumber}: ${tier.name} (${formatRupiah(tier.price)})`;
    setSelectedServiceForInquiry(serviceName);

    // Scroll smoothly to contact section
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract all distinct spec labels for comparison table
  const specLabels = [
    'Halaman / Tampilan',
    'Teknologi Frontend',
    'UI Framework',
    'Database & Auth',
    'CMS Dashboard',
    'Garansi Bug',
  ];

  return (
    <Box
      id="pricing"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(245, 158, 11, 0.02)',
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 }, maxWidth: 840, mx: 'auto' }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mb: 1.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2,
                py: 0.6,
                borderRadius: '9999px',
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.2)'}`,
              }}
            >
              <BoltIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: theme.palette.primary.main,
                  textTransform: 'uppercase',
                }}
              >
                Pricelist Dinamis & Transparan
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              mb: 2,
              fontSize: { xs: '1.85rem', sm: '2.5rem', md: '2.85rem' },
            }}
          >
            Investasi Terencana untuk Setiap Tahap Bisnis
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
            Dari landing page ringkas hingga sistem berskala enterprise dengan kustomisasi penuh. Seluruh harga, spesifikasi teknis, dan lingkup pekerjaan dapat dikonfigurasi secara langsung melalui Admin CMS.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Tampilkan Matriks Spesifikasi Teknis Lengkap
                </Typography>
              }
            />
          </Stack>
        </Box>

        {/* Pricing Cards Grid (5 Tiers) */}
        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          {pricingTiers.map((tier) => {
            const isPopular = tier.popular;

            return (
              <Grid key={tier.id} size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3.5,
                    p: { xs: 2.5, md: 3 },
                    position: 'relative',
                    border: isPopular
                      ? `2px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    backgroundColor: isPopular
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(245, 158, 11, 0.06)'
                        : 'rgba(255, 251, 235, 0.95)'
                      : theme.palette.background.paper,
                    boxShadow: isPopular
                      ? theme.palette.mode === 'dark'
                        ? '0 12px 30px rgba(0,0,0,0.45)'
                        : '0 16px 36px rgba(217, 119, 6, 0.12)'
                      : 'none',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: theme.palette.primary.main,
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 16px 36px rgba(0,0,0,0.6)'
                          : '0 18px 36px rgba(217, 119, 6, 0.15)',
                    },
                  }}
                >
                  {/* Top Badge */}
                  {tier.highlightBadge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Chip
                        label={tier.highlightBadge}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: 24,
                          background: isPopular
                            ? theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                              : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                            : theme.palette.mode === 'dark'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(217, 119, 6, 0.15)',
                          color: isPopular
                            ? theme.palette.mode === 'dark'
                              ? '#181512'
                              : '#ffffff'
                            : theme.palette.primary.main,
                          boxShadow: isPopular ? '0 4px 12px rgba(217, 119, 6, 0.35)' : 'none',
                        }}
                      />
                    </Box>
                  )}

                  {/* Tier Number & Name */}
                  <Box sx={{ mt: tier.highlightBadge ? 1 : 0, mb: 1.5 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.primary.main,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Tier {tier.tierNumber}
                      </Typography>
                      <Chip
                        icon={<ScheduleIcon sx={{ fontSize: '13px !important' }} />}
                        label={tier.deliveryTime}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        }}
                      />
                    </Stack>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {tier.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      minHeight: 40,
                      mb: 2,
                    }}
                  >
                    {tier.tagline}
                  </Typography>

                  {/* Price Tag */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.025)',
                      border: `1px solid ${theme.palette.divider}`,
                      mb: 2.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      Estimasi Biaya
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        color: isPopular ? theme.palette.primary.main : 'inherit',
                      }}
                    >
                      {formatRupiah(tier.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {tier.priceBilling} • {tier.revisionCount}
                    </Typography>
                  </Box>

                  {/* Feature Checklist */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: theme.palette.text.secondary,
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Fitur & Deliverable:
                  </Typography>

                  <List dense disablePadding sx={{ mb: 2.5, flexGrow: 1 }}>
                    {tier.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.4, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 22, mt: 0.3 }}>
                          <CheckIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.78rem',
                                lineHeight: 1.4,
                                fontWeight: 500,
                              }}
                            >
                              {feature}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ mb: 2 }} />

                  {/* Specs Quick Pill */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.8, fontSize: '0.7rem' }}>
                      Kesesuaian:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {tier.idealFor}
                    </Typography>
                  </Box>

                  {/* CTA Button */}
                  <Button
                    fullWidth
                    variant={isPopular ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleSelectTier(tier)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 'auto',
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      boxShadow: isPopular ? '0 4px 14px rgba(217, 119, 6, 0.3)' : 'none',
                      background: isPopular
                        ? theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                          : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                        : undefined,
                      color: isPopular
                        ? theme.palette.mode === 'dark'
                          ? '#181512'
                          : '#ffffff'
                        : undefined,
                    }}
                  >
                    {tier.ctaText}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Detailed Comparison Table (Toggled) */}
        {showComparison && (
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3.5 },
                borderRadius: 3.5,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Matriks Perbandingan Spesifikasi Teknis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Spesifikasi teknis arsitektur, runtime, basis data, dan layanan pasca-rilis yang diatur secara sentral di Admin CMS.
              </Typography>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 160 }}>
                        Spesifikasi Teknis
                      </TableCell>
                      {pricingTiers.map((tier) => (
                        <TableCell
                          key={tier.id}
                          align="center"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            minWidth: 140,
                            backgroundColor: tier.popular
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(254, 243, 199, 0.5)'
                              : undefined,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                            Tier {tier.tierNumber}: {tier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {formatRupiah(tier.price)}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specLabels.map((specLabel, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {specLabel}
                        </TableCell>
                        {pricingTiers.map((tier) => {
                          const matchedSpec = tier.specs.find((s) => s.label === specLabel);
                          return (
                            <TableCell
                              key={tier.id}
                              align="center"
                              sx={{
                                fontSize: '0.78rem',
                                backgroundColor: tier.popular
                                  ? theme.palette.mode === 'dark'
                                    ? 'rgba(245, 158, 11, 0.04)'
                                    : 'rgba(254, 243, 199, 0.25)'
                                  : undefined,
                              }}
                            >
                              {matchedSpec ? matchedSpec.value : '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {/* Delivery & Revisions row */}
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Estimasi Pengerjaan</TableCell>
                      {pricingTiers.map((tier) => (
                        <TableCell key={tier.id} align="center" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {tier.deliveryTime}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Kebijakan Revisi</TableCell>
                      {pricingTiers.map((tier) => (
                        <TableCell key={tier.id} align="center" sx={{ fontSize: '0.78rem' }}>
                          {tier.revisionCount}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Assurance Cards Footer */}
        <Box sx={{ mt: 5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)',
                    color: theme.palette.primary.main,
                  }}
                >
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Transparansi Kontrak & NDA
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Perjanjian kerja formal, jaminan hak cipta kode sumber 100%, dan klausul kerahasiaan data.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }}
                >
                  <BoltIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Pembayaran Bertahap (Milestone)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Skema termin bertahap (DP 30%, Progress 40%, Serah Terima 30%) menjaga keamanan kedua pihak.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                  }}
                >
                  <SupportIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Kustomisasi Fleksibel Admin
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Butuh modul khusus diluar tier? Hubungi kami untuk penyesuaian spesifikasi & budget proyek.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
