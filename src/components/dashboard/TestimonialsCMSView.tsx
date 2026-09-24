'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Alert,
  useTheme,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RateReview as TestimonialIcon,
  FormatQuote as QuoteIcon,
  Star as StarIcon,
  RestartAlt as ResetIcon,
  Launch as LaunchIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Testimonial } from '../../types';

const PRESET_AVATARS = [
  { label: 'CEO Irfan', url: '/team/ceo.jpg' },
  { label: 'CTO Cecep', url: '/team/cto.jpg' },
  { label: 'CMO Dian', url: '/team/cmo.jpg' },
];

const ACCENT_COLORS = [
  { label: 'Kuning Atasilabs (#FFD600)', hex: '#FFD600' },
  { label: 'Biru Cyan (#06B6D4)', hex: '#06B6D4' },
  { label: 'Biru Electric (#3B82F6)', hex: '#3B82F6' },
  { label: 'Hijau Emerald (#10B981)', hex: '#10B981' },
  { label: 'Ungu Purple (#8B5CF6)', hex: '#8B5CF6' },
  { label: 'Merah Coral (#F43F5E)', hex: '#F43F5E' },
];

export const TestimonialsCMSView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetTestimonialsToDefault,
    showNotification,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTesti, setEditingTesti] = useState<Testimonial | null>(null);

  const [formData, setFormData] = useState<Omit<Testimonial, 'id'>>({
    name: '',
    role: '',
    company: '',
    quote: '',
    avatarUrl: '',
    accentColor: '#FFD600',
    bgColor: '#161616',
    featured: true,
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran foto maksimal 5 MB', 'warning');
      return;
    }

    setUploadingAvatar(true);
    showNotification('Mengunggah foto ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'testimonials');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
        showNotification('Foto testimoni disimpan ke Cloudflare R2!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
            showNotification('Foto testimoni berhasil dimuat!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Avatar R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
          showNotification('Foto testimoni berhasil dimuat!', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTesti(null);
    setFormData({
      name: '',
      role: '',
      company: '',
      quote: '',
      avatarUrl: '/team/ceo.jpg',
      accentColor: '#FFD600',
      bgColor: '#161616',
      featured: true,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (testi: Testimonial) => {
    setEditingTesti(testi);
    setFormData({
      name: testi.name,
      role: testi.role,
      company: testi.company || '',
      quote: testi.quote,
      avatarUrl: testi.avatarUrl || '',
      accentColor: testi.accentColor || '#FFD600',
      bgColor: testi.bgColor || '#161616',
      featured: testi.featured !== false,
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.quote || !formData.role) {
      showNotification('Nama, Jabatan, dan Isi Kutipan Ulasan wajib diisi', 'warning');
      return;
    }

    try {
      if (editingTesti) {
        await updateTestimonial(editingTesti.id, formData);
        showNotification('Testimoni berhasil diperbarui!', 'success');
      } else {
        await addTestimonial(formData);
        showNotification('Testimoni baru berhasil ditambahkan!', 'success');
      }
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      showNotification('Gagal menyimpan testimoni', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus testimoni klien ini?')) {
      await deleteTestimonial(id);
      showNotification('Testimoni berhasil dihapus', 'info');
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan testimoni ke data bawaan sistem?')) {
      resetTestimonialsToDefault();
      showNotification('Testimoni dikembalikan ke konfigurasi awal', 'success');
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.role.toLowerCase().includes(query) ||
      (t.company && t.company.toLowerCase().includes(query)) ||
      t.quote.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
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
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            }}
          >
            Manajemen Testimoni & Review Klien
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kelola apresiasi, kutipan ulasan, rating, dan metadata profil klien yang dipublikasikan pada section testimoni landing page.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<LaunchIcon />}
            onClick={() => router.push('/#testimonials')}
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              whiteSpace: 'nowrap',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Pratinjau Landing
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
            }}
          >
            Tambah Testimoni Baru
          </Button>
        </Stack>
      </Box>

      {/* Control Bar: Search */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Cari testimoni berdasarkan nama, jabatan, perusahaan, atau kutipan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 450, width: '100%' }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Menampilkan {filteredTestimonials.length} dari {testimonials.length} Testimoni
        </Typography>
      </Box>

      {/* Testimonials Grid Cards */}
      <Grid container spacing={3}>
        {filteredTestimonials.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <QuoteIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Belum ada data testimoni yang cocok
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredTestimonials.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#ffffff',
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `5px solid ${item.accentColor || '#FFD600'}`,
                  transition: 'all 0.25s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {[...Array(5)].map((_, idx) => (
                        <StarIcon key={idx} sx={{ fontSize: 18, color: item.accentColor || '#FFD600' }} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={item.featured !== false ? 'Featured / Tampil' : 'Draft / Sembunyi'}
                        size="small"
                        color={item.featured !== false ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.65,
                      color: theme.palette.text.primary,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      p: 2,
                      borderRadius: 2,
                      borderLeft: `2px solid ${item.accentColor || '#FFD600'}`,
                    }}
                  >
                    "{item.quote}"
                  </Typography>

                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={item.avatarUrl}
                        sx={{
                          width: 44,
                          height: 44,
                          border: `2px solid ${item.accentColor || '#FFD600'}`,
                        }}
                      >
                        {item.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                          {item.role} {item.company && `• ${item.company}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary" title="Edit Testimoni">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id)} color="error" title="Hapus Testimoni">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuoteIcon sx={{ color: '#FFD600' }} />
          {editingTesti ? 'Edit Data Testimoni Klien' : 'Tambah Testimoni Klien Baru'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {/* Left Column: Form Fields */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Avatar Photo Section */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 2.5,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={formData.avatarUrl}
                      sx={{
                        width: 76,
                        height: 76,
                        border: `3px solid ${formData.accentColor || '#FFD600'}`,
                        boxShadow: 3,
                        mb: 1,
                      }}
                    >
                      {formData.name ? formData.name[0]?.toUpperCase() : 'T'}
                    </Avatar>
                    <label htmlFor="testi-avatar-file">
                      <IconButton
                        component="span"
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: -4,
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                        title="Upload Foto Klien ke Cloudflare R2"
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </label>
                    <input
                      type="file"
                      id="testi-avatar-file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                    Upload foto klien langsung ke R2 Cloudflare (Maks 5MB)
                  </Typography>

                  {/* Preset Avatars */}
                  <Box sx={{ width: '100%', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: 'text.secondary' }}>
                      Atau pilih foto sampel:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {PRESET_AVATARS.map((p, idx) => (
                        <Tooltip key={idx} title={p.label} arrow placement="top">
                          <Avatar
                            src={p.url}
                            onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                            sx={{
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              border: formData.avatarUrl === p.url ? '2px solid #FFD600' : '1px solid rgba(0,0,0,0.1)',
                              transform: formData.avatarUrl === p.url ? 'scale(1.15)' : 'scale(1)',
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nama Lengkap Klien"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Contoh: Andi Pratama"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Jabatan / Posisi"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      placeholder="Contoh: CEO & Co-Founder"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nama Perusahaan / Startup"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Contoh: FinTech Asia Pte Ltd"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Isi Kutipan Ulasan (Quote)"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  required
                  placeholder="Tulis ulasan impresif mengenai kecepatan pengerjaan, kualitas codebase, atau layanan Atasilabs..."
                  helperText="Format teks ulasan yang tampil pada card testimoni landing page"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Warna Aksen Highlight</InputLabel>
                      <Select
                        value={formData.accentColor || '#FFD600'}
                        label="Warna Aksen Highlight"
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      >
                        {ACCENT_COLORS.map((c) => (
                          <MenuItem key={c.hex} value={c.hex}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.hex }} />
                              {c.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.featured !== false}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          color="warning"
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Tampilkan di Landing Page</Typography>}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Column: Live Card Preview */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, color: '#FFD600', display: 'block', mb: 1 }}>
                  PRATINJAU REALTIME TAMPILAN
                </Typography>

                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: '#121212',
                    color: '#ffffff',
                    border: '1px solid #282828',
                    borderLeft: `5px solid ${formData.accentColor || '#FFD600'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 18, color: formData.accentColor || '#FFD600' }} />
                    ))}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#dddddd',
                      bgcolor: 'rgba(255,255,255,0.04)',
                      p: 2,
                      borderRadius: 2,
                      borderLeft: `2px solid ${formData.accentColor || '#FFD600'}`,
                    }}
                  >
                    "{formData.quote || 'Kutipan ulasan klien akan tampil secara realtime di sini...'}"
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1 }}>
                    <Avatar
                      src={formData.avatarUrl}
                      sx={{ width: 44, height: 44, border: `2px solid ${formData.accentColor || '#FFD600'}` }}
                    >
                      {formData.name ? formData.name[0] : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                        {formData.name || 'Nama Klien'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        {formData.role || 'Jabatan'} {formData.company && `• ${formData.company}`}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{
              fontWeight: 800,
              px: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FFD600 0%, #d97706 100%)',
              color: '#000000',
            }}
          >
            {editingTesti ? 'Simpan Perubahan' : 'Tambah Testimoni'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestimonialsCMSView;
