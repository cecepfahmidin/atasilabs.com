'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Launch as LaunchIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { CompanyContact } from '../../types';

export const CompanyContactView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { companyContact, updateCompanyContact, resetCompanyContactToDefault } = useApp();

  const [formData, setFormData] = useState<CompanyContact>(companyContact);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(companyContact);
    setIsDirty(false);
  }, [companyContact]);

  const handleChange = (field: keyof CompanyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanyContact(formData);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan data kontak ke konfigurasi awal?')) {
      resetCompanyContactToDefault();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
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
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Chip
                icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                label="MASTER DATA // KONTAK"
                color="primary"
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.75rem' }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
              Pengaturan Kontak Perusahaan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700 }}>
              Kelola alamat email support, nomor WhatsApp resmi, alamat HQ, jam kerja, dan pranala media sosial yang tampil secara dinamis pada landing page Atasilabs.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, shrink: 0 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ResetIcon />}
              onClick={handleReset}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Reset Default
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LaunchIcon />}
              onClick={() => router.push('/')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Pratinjau Landing
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Grid */}
      <form onSubmit={handleSave}>
        <Grid container spacing={3}>
          {/* Form Left Column */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" /> Identitas HQ & Deskripsi
              </Typography>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Perusahaan / Studio Title"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    required
                    helperText="Tampil pada judul utama direktori kontak"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tagline / Subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    helperText="Slogan / subtitle perusahaan"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Deskripsi Singkat Studio"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    helperText="Penjelasan ringkas layanan & konsultasi"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <PhoneIcon color="primary" /> Saluran Komunikasi & Kontak Direct
              </Typography>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Support Perusahaan"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nomor Telepon Kantor"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="WhatsApp Tampilan (Display Format)"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    required
                    helperText="Contoh: +62 821-6361-428"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="WhatsApp URL Raw Digits (Tanpa + atau spasi)"
                    value={formData.whatsappRaw}
                    onChange={(e) => handleChange('whatsappRaw', e.target.value)}
                    required
                    helperText="Contoh: 628216361428 (untuk link wa.me)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            wa.me/
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <LocationIcon color="primary" /> Lokasi HQ, Jam Kerja & Legal Notice
              </Typography>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lokasi Studio / HQ Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jam Operasional"
                    value={formData.workingHours}
                    onChange={(e) => handleChange('workingHours', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Garansi Non-Disclosure Agreement (NDA)"
                    value={formData.ndaNotice}
                    onChange={(e) => handleChange('ndaNotice', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <FacebookIcon color="primary" /> Tautan Media Sosial
              </Typography>
              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facebook URL"
                    value={formData.facebookUrl}
                    onChange={(e) => handleChange('facebookUrl', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FacebookIcon fontSize="small" sx={{ color: '#1877f2' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Instagram URL"
                    value={formData.instagramUrl}
                    onChange={(e) => handleChange('instagramUrl', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InstagramIcon fontSize="small" sx={{ color: '#e4405f' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Submit Save Button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!isDirty || saving}
                  startIcon={<SaveIcon />}
                  sx={{ fontWeight: 800, borderRadius: 2.5, px: 4, py: 1.25 }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan Kontak'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Realtime Card Preview */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#0f0f0f',
                  color: '#f5f5f0',
                  border: '1px solid #2d2d2d',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: '#ffd600', fontWeight: 800 }}>
                    PRATINJAU REALTIME LANDING PAGE
                  </Typography>
                  <Chip label="LIVE PREVIEW" color="warning" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                </Box>

                <Divider sx={{ borderColor: '#222' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#ffd600', fontWeight: 700, letterSpacing: 1 }}>
                    [CONTACT DIRECTORY]
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    {formData.companyName || 'ATASILABS HQ & STUDIO'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888888', lineHeight: 1.6 }}>
                    {formData.description || 'Deskripsi studio...'}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid #1d1d1d', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555555', letterSpacing: 1.5, fontWeight: 700 }}>
                      EMAIL SUPPORT
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                      {formData.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555555', letterSpacing: 1.5, fontWeight: 700 }}>
                      WHATSAPP / CONSULTATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffd600' }}>
                      {formData.whatsapp}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555555', letterSpacing: 1.5, fontWeight: 700 }}>
                      STUDIO LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#cccccc' }}>
                      {formData.address}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555555', letterSpacing: 1.5, fontWeight: 700 }}>
                      WORKING HOURS
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#cccccc' }}>
                      {formData.workingHours}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#141414', border: '1px solid #2d2d2d', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1rem' }}>🔒</Typography>
                  <Typography variant="caption" sx={{ color: '#888888', fontSize: '0.7rem', lineHeight: 1.4 }}>
                    {formData.ndaNotice}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CompanyContactView;
