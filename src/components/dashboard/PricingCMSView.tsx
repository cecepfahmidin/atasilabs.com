'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  useTheme,
  Alert,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Bolt as BoltIcon,
  Schedule as ScheduleIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { PricingTier, PricingSpecItem } from '../../types';

export const PricingCMSView: React.FC = () => {
  const theme = useTheme();
  const { pricingTiers, updatePricingTier, resetPricingTiersToDefault, showNotification } = useApp();

  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    tagline: string;
    price: number;
    originalPrice: number;
    priceBilling: string;
    popular: boolean;
    highlightBadge: string;
    deliveryTime: string;
    revisionCount: string;
    idealFor: string;
    ctaText: string;
    features: string[];
    specs: PricingSpecItem[];
  }>({
    name: '',
    tagline: '',
    price: 0,
    originalPrice: 0,
    priceBilling: 'per proyek',
    popular: false,
    highlightBadge: '',
    deliveryTime: '',
    revisionCount: '',
    idealFor: '',
    ctaText: '',
    features: [],
    specs: [],
  });

  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleOpenEdit = (tier: PricingTier) => {
    setSelectedTier(tier);
    setFormData({
      name: tier.name,
      tagline: tier.tagline,
      price: tier.price,
      originalPrice: tier.originalPrice || 0,
      priceBilling: tier.priceBilling || 'per proyek',
      popular: !!tier.popular,
      highlightBadge: tier.highlightBadge || '',
      deliveryTime: tier.deliveryTime,
      revisionCount: tier.revisionCount,
      idealFor: tier.idealFor,
      ctaText: tier.ctaText,
      features: [...tier.features],
      specs: tier.specs.map((s) => ({ ...s })),
    });
    setNewFeatureInput('');
    setNewSpecLabel('');
    setNewSpecValue('');
    setIsEditDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureInput.trim()],
    }));
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
    }));
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleUpdateSpecValue = (index: number, value: string) => {
    setFormData((prev) => {
      const nextSpecs = [...prev.specs];
      nextSpecs[index] = { ...nextSpecs[index], value };
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  const handleSaveTier = () => {
    if (!selectedTier) return;
    updatePricingTier(selectedTier.id, {
      ...formData,
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0,
    });
    setIsEditDialogOpen(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Bar Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              }}
            >
              Manajemen Pricelist & Spesifikasi Paket
            </Typography>
            <Chip
              label="5 TIERS AKTIF"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 22,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.12)',
                color: theme.palette.primary.main,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Atur nominal harga, estimasi pengerjaan, kuota revisi, dan butir spesifikasi teknis dari Tier 1 (Starter) hingga Tier 5 (Elite). Perubahan langsung tersinkronisasi ke landing page secara realtime.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ResetIcon />}
          onClick={resetPricingTiersToDefault}
          sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}
        >
          Reset ke Nilai Standar
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.2)'}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(254, 243, 199, 0.4)',
          color: theme.palette.text.primary,
        }}
      >
        Setiap paket (Tier 1: Starter, Tier 2: Growth, Tier 3: Profesional, Tier 4: Enterprise, Tier 5: Elite) dapat dikonfigurasi harga, tag highlight, fitur utama, dan rincian spesifikasi teknisnya. Calon klien yang memilih paket di landing page akan otomatis terisi jenis paketnya di formulir kontak (Leads).
      </Alert>

      {/* Grid of 5 Tiers */}
      <Grid container spacing={3}>
        {pricingTiers.map((tier) => (
          <Grid key={tier.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                border: tier.popular
                  ? '2px solid #f59e0b'
                  : `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 12px 24px rgba(0,0,0,0.5)'
                      : '0 12px 24px rgba(0,0,0,0.06)',
                  borderColor: '#f59e0b',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        label={`TIER ${tier.tierNumber}`}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.68rem',
                          height: 22,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.12)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      />
                      {tier.popular && (
                        <Chip
                          label="REKOMENDASI (POPULAR)"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            height: 22,
                            backgroundColor: '#f59e0b',
                            color: '#181512',
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      {tier.name}
                    </Typography>
                  </Box>

                  {tier.highlightBadge && (
                    <Chip
                      label={tier.highlightBadge}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', borderColor: theme.palette.divider }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 38, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {tier.tagline}
                </Typography>

                {/* Price Pill */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(248, 250, 252, 1)',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      Harga Jual (Cust):
                    </Typography>
                    {tier.originalPrice && tier.originalPrice > tier.price ? (
                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'error.main', fontWeight: 700, fontSize: '0.78rem' }}>
                        Normal: {formatRupiah(tier.originalPrice)}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', my: 0.2 }}>
                    {formatRupiah(tier.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {tier.priceBilling} &bull; {tier.deliveryTime} &bull; {tier.revisionCount}
                  </Typography>
                </Box>

                {/* Features List Preview */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: 0.5 }}>
                  Fitur Utama ({tier.features.length}):
                </Typography>
                <Stack spacing={0.6} sx={{ mb: 2.5 }}>
                  {tier.features.slice(0, 4).map((f, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>
                        {f}
                      </Typography>
                    </Box>
                  ))}
                  {tier.features.length > 4 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', pl: 3 }}>
                      + {tier.features.length - 4} fitur lainnya...
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 1 }} />

                {/* Specs Preview */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, textTransform: 'uppercase', mt: 1, mb: 1, display: 'block', letterSpacing: 0.5 }}>
                  Spesifikasi Teknis ({tier.specs.length}):
                </Typography>
                <Grid container spacing={1} sx={{ mt: 'auto' }}>
                  {tier.specs.slice(0, 4).map((spec, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }} noWrap>
                          {spec.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.text.primary }} noWrap display="block">
                          {spec.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>

              {/* Card Actions Bottom Bar */}
              <CardActions sx={{ p: 2, pt: 1.5, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Terakhir Diperbarui
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={() => handleOpenEdit(tier)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    px: 2,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                    },
                  }}
                >
                  Edit Spesifikasi Tier
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Tier Modal Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main,
              }}
            >
              <BoltIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Edit Tier {selectedTier?.tierNumber}: {formData.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Konfigurasi harga, pengerjaan, fitur, dan spesifikasi teknis
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setIsEditDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Row 1: Name, Badge, & Popular Switch */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Nama Tier"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                size="small"
                helperText="Contoh: Starter, Growth, Profesional, Enterprise, Elite"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Label Promosi (Badge)"
                value={formData.highlightBadge}
                onChange={(e) => setFormData((prev) => ({ ...prev, highlightBadge: e.target.value }))}
                size="small"
                helperText="Contoh: Paling Populer ★, Solusi Bisnis, dll"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.popular}
                    onChange={(e) => setFormData((prev) => ({ ...prev, popular: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Tandai Sebagai Rekomendasi Utama"
              />
            </Grid>

            {/* Row 2: Price, Original Price & Billing */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Harga Jual Promo (IDR)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  },
                }}
                helperText={`Terformat: ${formatRupiah(formData.price || 0)}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Harga Normal / Dicoret (IDR)"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  },
                }}
                helperText={`Terformat: ${formatRupiah(formData.originalPrice || 0)}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Keterangan Penagihan"
                value={formData.priceBilling}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceBilling: e.target.value }))}
                size="small"
                helperText="Contoh: per proyek, mulai dari"
              />
            </Grid>

            {/* Row 3: Tagline */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Tagline / Deskripsi Singkat"
                value={formData.tagline}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                size="small"
                multiline
                rows={2}
              />
            </Grid>

            {/* Row 4: Timeline & Revision & Target */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Estimasi Pengerjaan"
                value={formData.deliveryTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                size="small"
                helperText="Contoh: 5 - 7 Hari, 2 - 3 Minggu"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Ketentuan Revisi"
                value={formData.revisionCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, revisionCount: e.target.value }))}
                size="small"
                helperText="Contoh: 3x Revisi, Unlimited"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Teks Tombol Aksi (CTA)"
                value={formData.ctaText}
                onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Ideal Untuk (Target Segment)"
                value={formData.idealFor}
                onChange={(e) => setFormData((prev) => ({ ...prev, idealFor: e.target.value }))}
                size="small"
                helperText="Contoh: Profil perusahaan, startup MVP, atau sistem ERP skala besar"
              />
            </Grid>

            {/* Section: Fitur-Fitur Paket */}
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Daftar Fitur & Deliverable Paket
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tambahkan butir fitur baru (misal: 'Integrasi Payment Gateway Xendit')"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button variant="contained" color="primary" onClick={handleAddFeature} startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap' }}>
                  Tambah
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.features.map((feature, idx) => (
                  <Chip
                    key={idx}
                    label={feature}
                    onDelete={() => handleRemoveFeature(idx)}
                    deleteIcon={<DeleteIcon fontSize="small" />}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Section: Spesifikasi Teknis (Specs) */}
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Spesifikasi Teknis (Arsitektur, Database, dsb)
              </Typography>

              {/* Add New Spec Input */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nama Spesifikasi (cth: Database)"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nilai Spesifikasi (cth: PostgreSQL Supabase + RLS)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleAddSpec}
                    startIcon={<AddIcon />}
                    sx={{ height: '100%' }}
                  >
                    Tambah
                  </Button>
                </Grid>
              </Grid>

              {/* Existing Specs List with In-place edit */}
              <Stack spacing={1}>
                {formData.specs.map((spec, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ minWidth: 160, fontWeight: 700, fontSize: '0.85rem' }}>
                      {spec.label}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpecValue(idx, e.target.value)}
                    />
                    <IconButton size="small" color="error" onClick={() => handleRemoveSpec(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setIsEditDialogOpen(false)} color="inherit">
            Batal
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTier}
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
            }}
          >
            Simpan Perubahan Tier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
