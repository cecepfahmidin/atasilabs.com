'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar,
  Stack,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const ContactSection: React.FC = () => {
  const theme = useTheme();
  const { addLead, selectedServiceForInquiry, setActiveView, setDashboardTab, pricingTiers } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    serviceType: '',
    budget: '',
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

  const serviceOptions = [
    ...pricingTiers.map((t) => `Paket Tier ${t.tierNumber}: ${t.name}`),
    'Full-Stack Web App (Next.js & Supabase)',
    'SaaS & Enterprise Dashboard UI (Material UI)',
    'E-Commerce Storefront & Payment Gateway',
    'Database Architecture & ORM Migration (Prisma)',
    'Code Audit & Performance Optimization',
    'Lainnya / Konsultasi Kustom',
  ];

  const budgetOptions = [
    '< Rp 15.000.000',
    'Rp 15.000.000 - Rp 30.000.000',
    'Rp 30.000.000 - Rp 60.000.000',
    'Rp 60.000.000+',
    'Fleksibel / Belum Ditentukan',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Mohon lengkapi Nama, Email, dan Pesan Proyek Anda.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const created = await addLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || undefined,
        serviceType: formData.serviceType || 'Konsultasi Umum',
        budget: formData.budget || 'Belum Ditentukan',
        message: formData.message.trim(),
      });

      setSubmittedLeadId(created.id);
      setFormData({
        name: '',
        email: '',
        company: '',
        serviceType: '',
        budget: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#ffffff',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Left Column: Contact Info & Value Prop */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ mb: 4 }}>
              <Chip
                label="FORMULIR INQUIRY PROYEK"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.75rem', letterSpacing: '0.05em' }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                  fontWeight: 800,
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                Mulai Diskusi & Konsultasi Teknis
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 4 }}>
                Punya rencana membangun aplikasi web, sistem enterprise dashboard, atau migrasi basis data? Kirimkan spesifikasi kebutuhan Anda dan dapatkan estimasi teknis dalam 1x24 jam.
              </Typography>
            </Box>

            {/* Direct Contact Cards */}
            <Stack spacing={2.5} sx={{ mb: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)',
                    color: theme.palette.primary.main,
                  }}
                >
                  <EmailIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Email Bisnis & Kolaborasi
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    cecepfahmidin@gmail.com
                  </Typography>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  }}
                >
                  <LocationOnIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Lokasi & Zona Waktu
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Jakarta / Bandung, Indonesia (GMT+7)
                  </Typography>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                  }}
                >
                  <ScheduleIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Kecepatan Tanggapan
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Maksimal 24 Jam Kerja
                  </Typography>
                </Box>
              </Paper>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
              <LockIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                Data disimpan aman di Supabase PostgreSQL dengan proteksi Row Level Security (RLS).
              </Typography>
            </Box>
          </Grid>

          {/* Right Column: Inquiry Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4.5 },
                borderRadius: 3.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 10px 30px rgba(0,0,0,0.3)'
                    : '0 10px 30px rgba(0,0,0,0.02)',
              }}
            >
              {submittedLeadId ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Pesan Berhasil Terkirim & Tersimpan!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
                    Data inquiry Anda telah berhasil masuk ke basis data <strong>Supabase</strong> pada tabel <strong>Lead</strong> dengan ID <code>{submittedLeadId}</code> melalui integrasi Prisma Client.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        setActiveView('dashboard');
                        setDashboardTab('leads');
                      }}
                    >
                      Lihat di Dashboard (Tabel Lead)
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSubmittedLeadId(null)}
                    >
                      Kirim Pesan Lain
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Formulir Inquiry Proyek
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Isi detail rencana proyek Anda untuk ditinjau oleh developer.
                  </Typography>

                  {errorMsg && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {errorMsg}
                    </Alert>
                  )}

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        label="Nama Lengkap"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        type="email"
                        label="Alamat Email"
                        placeholder="contoh@perusahaan.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Perusahaan / Instansi (Opsional)"
                        placeholder="PT Maju Bersama"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Kategori Layanan / Paket"
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        disabled={loading}
                      >
                        {formData.serviceType && !serviceOptions.includes(formData.serviceType) && (
                          <MenuItem value={formData.serviceType}>
                            {formData.serviceType}
                          </MenuItem>
                        )}
                        {serviceOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        select
                        fullWidth
                        label="Estimasi Anggaran Proyek"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        disabled={loading}
                      >
                        {budgetOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={4}
                        label="Detail Kebutuhan / Pesan Proyek"
                        placeholder="Jelaskan fitur yang diinginkan, target peluncuran, atau tautan referensi..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid size={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 700,
                          borderRadius: 2.5,
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                            : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                          color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
                          boxShadow: '0 6px 20px rgba(217, 119, 6, 0.28)',
                        }}
                      >
                        {loading ? 'Mengirim Data via Server Actions...' : 'Kirim Pesan (Simpan ke Lead Supabase)'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
