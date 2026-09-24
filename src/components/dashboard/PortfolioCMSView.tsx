'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  InputAdornment,
  useTheme,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  OpenInNew as OpenInNewIcon,
  GitHub as GitHubIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { Portfolio } from '../../types';

export const PortfolioCMSView: React.FC = () => {
  const theme = useTheme();
  const { portfolios, addPortfolio, updatePortfolio, deletePortfolio } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: 'Full-Stack' as Portfolio['category'],
    imageUrl: '',
    liveUrl: '',
    repoUrl: '',
    featured: false,
  });

  const [techInput, setTechInput] = useState('');
  const [techStackList, setTechStackList] = useState<string[]>([]);
  const [uploadSimulating, setUploadSimulating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sampleImages = [
    { label: 'SaaS Dashboard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' },
    { label: 'E-Commerce Store', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Healthcare Portal', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Code Sandbox / LMS', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Fintech App', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Real Estate Discovery', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      category: 'Full-Stack',
      imageUrl: sampleImages[0].url,
      liveUrl: 'https://demo.devstudio.id',
      repoUrl: 'https://github.com/cecepfahmidin/project',
      featured: false,
    });
    setTechStackList(['Next.js', 'Material UI', 'Prisma', 'Supabase']);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      fullDescription: item.fullDescription || '',
      category: item.category,
      imageUrl: item.imageUrl,
      liveUrl: item.liveUrl || '',
      repoUrl: item.repoUrl || '',
      featured: Boolean(item.featured),
    });
    setTechStackList(item.techStack);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleAddTech = () => {
    if (techInput.trim() && !techStackList.includes(techInput.trim())) {
      setTechStackList([...techStackList, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tag: string) => {
    setTechStackList(techStackList.filter((t) => t !== tag));
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadSimulating(true);
    // Simulate Supabase Storage upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
        setUploadSimulating(false);
      };
      reader.readAsDataURL(file);
    }, 600);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Judul dan Deskripsi proyek wajib diisi.');
      return;
    }

    if (techStackList.length === 0) {
      setFormError('Tambahkan minimal 1 tag teknologi.');
      return;
    }

    if (editingItem) {
      updatePortfolio(editingItem.id, {
        ...formData,
        techStack: techStackList,
      });
    } else {
      addPortfolio({
        ...formData,
        techStack: techStackList,
      });
    }

    setIsDialogOpen(false);
  };

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
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            }}
          >
            Manajemen Portofolio & Studi Kasus (CMS)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pengelolaan aset dan metadata portofolio yang disinkronkan ke Supabase Storage & Prisma ORM.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2.5,
            fontWeight: 700,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
            color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
          }}
        >
          Tambah Portofolio Baru
        </Button>
      </Box>

      {/* Portfolio Grid */}
      <Grid container spacing={3}>
        {portfolios.map((item) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 12px 24px rgba(0,0,0,0.5)'
                      : '0 12px 24px rgba(0,0,0,0.06)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={item.imageUrl}
                alt={item.title}
                sx={{ backgroundColor: '#18181b' }}
              />

              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={item.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                  />
                  {item.featured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        color: '#f59e0b',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 22,
                      }}
                    />
                  )}
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5, minHeight: 40 }}>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {item.techStack.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => handleOpenEdit(item)}
                    sx={{ fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setItemToDelete(item.id)}
                    sx={{ fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Hapus
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {item.repoUrl && (
                    <IconButton
                      size="small"
                      component="a"
                      href={item.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <GitHubIcon fontSize="small" />
                    </IconButton>
                  )}
                  {item.liveUrl && (
                    <IconButton
                      size="small"
                      component="a"
                      href={item.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      color="primary"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Portfolio Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              backgroundColor: theme.palette.background.paper,
            },
          },
        }}
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              {editingItem ? 'Edit Data Portofolio' : 'Tambah Portofolio Baru'}
            </Typography>
            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  required
                  label="Judul Portofolio"
                  placeholder="Contoh: Modern SaaS Logistics Dashboard"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Kategori"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <MenuItem value="Full-Stack">Full-Stack</MenuItem>
                  <MenuItem value="Dashboard SaaS">Dashboard SaaS</MenuItem>
                  <MenuItem value="E-Commerce">E-Commerce</MenuItem>
                  <MenuItem value="Mobile-Web">Mobile-Web</MenuItem>
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  required
                  label="Deskripsi Singkat"
                  placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Deskripsi Lengkap / Studi Kasus"
                  placeholder="Jelaskan tantangan arsitektur, solusi teknis, dan hasil pengujian performa..."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                />
              </Grid>

              {/* Supabase Storage Media Upload / Selector */}
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Aset Gambar Portofolio (Supabase Storage)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Unggah gambar dari perangkat lokal atau pilih template prasetel developer
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploadSimulating}
                      sx={{ borderRadius: 2 }}
                    >
                      {uploadSimulating ? 'Mengunggah ke Supabase...' : 'Unggah File'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleSimulateUpload}
                      />
                    </Button>
                  </Box>

                  {/* Preset Quick Selectors */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {sampleImages.map((img, idx) => (
                      <Chip
                        key={idx}
                        label={img.label}
                        size="small"
                        clickable
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        color={formData.imageUrl === img.url ? 'primary' : 'default'}
                        variant={formData.imageUrl === img.url ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>

                  {/* Direct Image URL input */}
                  <TextField
                    fullWidth
                    size="small"
                    label="URL Gambar Publik"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />

                  {formData.imageUrl && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={formData.imageUrl}
                        alt="Preview"
                        sx={{
                          width: 80,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Pratinjau gambar aktif dari bucket: <code>portfolio-assets</code>
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Tech Stack Chips Editor */}
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Tag Tumpukan Teknologi (Tech Stack)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Tambah tag (misal: Next.js, Prisma, Tailwind)"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button variant="outlined" onClick={handleAddTech}>
                    Tambah
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {techStackList.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTech(tag)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Live and Repo URLs */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="URL Live Demo"
                  placeholder="https://demo-app.devstudio.id"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="URL GitHub Repository"
                  placeholder="https://github.com/username/repo"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Tampilkan sebagai Proyek Unggulan (Featured Project di Laman Depan)"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
            <Button onClick={() => setIsDialogOpen(false)} color="inherit">
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 3, fontWeight: 700, borderRadius: 2 }}
            >
              {editingItem ? 'Simpan Perubahan' : 'Terbitkan Portofolio'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Portofolio?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Proyek ini akan dihapus dari tabel Portfolio Prisma. Data tidak dapat dipulihkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setItemToDelete(null)} color="inherit">
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (itemToDelete) {
                deletePortfolio(itemToDelete);
                setItemToDelete(null);
              }
            }}
          >
            Hapus Portofolio
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
