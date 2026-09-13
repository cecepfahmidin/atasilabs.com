'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
  CircularProgress,
  Slider,
  useTheme,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, ProjectStatus } from '../../types';

export const ProjectsView: React.FC = () => {
  const theme = useTheme();
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
  } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ClientProject | null>(null);
  const [projToDelete, setProjToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    title: '',
    description: '',
    deadline: '',
    budget: 25000000,
    progress: 0,
    status: 'PLANNING' as ProjectStatus,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusChip = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <Chip label="Perencanaan" size="small" sx={{ backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#64748b', fontWeight: 700, fontSize: '0.72rem' }} />;
      case 'IN_PROGRESS':
        return <Chip label="Pengerjaan" size="small" sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)', color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.72rem' }} />;
      case 'REVIEW':
        return <Chip label="Review Klien" size="small" sx={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontWeight: 700, fontSize: '0.72rem' }} />;
      case 'COMPLETED':
        return <Chip label="Selesai" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }} />;
    }
  };

  const handleOpenAdd = () => {
    setEditingProj(null);
    setFormData({
      clientName: '',
      clientEmail: '',
      title: '',
      description: '',
      deadline: '2024-05-30',
      budget: 25000000,
      progress: 10,
      status: 'PLANNING',
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (proj: ClientProject) => {
    setEditingProj(proj);
    setFormData({
      clientName: proj.clientName,
      clientEmail: proj.clientEmail,
      title: proj.title,
      description: proj.description,
      deadline: proj.deadline,
      budget: proj.budget,
      progress: proj.progress,
      status: proj.status,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientName.trim() || !formData.deadline) {
      setFormError('Nama Klien, Judul Proyek, dan Deadline wajib diisi.');
      return;
    }

    if (editingProj) {
      updateProject(editingProj.id, formData);
    } else {
      addProject(formData);
    }

    setIsDialogOpen(false);
  };

  return (
    <Box>
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
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Manajemen Klien & Proyek Aktif
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pelacakan milestone, tenggat waktu (deadline), dan visualisasi persentase kerja via MUI LinearProgress & CircularProgress.
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
          Tambah Proyek Baru
        </Button>
      </Box>

      {/* Projects Grid Cards */}
      <Grid container spacing={3}>
        {projects.map((proj) => (
          <Grid size={{ xs: 12, md: 6 }} key={proj.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {/* Header with CircularProgress indicator */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ pr: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                    {getStatusChip(proj.status)}
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ID: #{proj.id.slice(-4)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                    {proj.title}
                  </Typography>
                </Box>

                {/* CircularProgress Indicator */}
                <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                  <CircularProgress
                    variant="determinate"
                    value={proj.progress}
                    size={52}
                    thickness={4.5}
                    sx={{
                      color:
                        proj.progress === 100
                          ? '#10b981'
                          : proj.progress > 60
                          ? theme.palette.primary.main
                          : '#f59e0b',
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>
                      {proj.progress}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                {proj.description}
              </Typography>

              {/* Client & Budget Badges */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      Klien & Kontak
                    </Typography>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {proj.clientName}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      Nilai Kontrak
                    </Typography>
                    <Typography variant="subtitle2" color="primary" noWrap sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {formatRupiah(proj.budget)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Linear Progress Bar */}
              <Box sx={{ mb: 2.5, mt: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tenggat Waktu: {proj.deadline}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {proj.progress}% Terselesaikan
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={proj.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor:
                        proj.progress === 100
                          ? '#10b981'
                          : proj.progress > 60
                          ? theme.palette.primary.main
                          : '#f59e0b',
                    },
                  }}
                />
              </Box>

              {/* Quick Progress Buttons & Actions */}
              <Box
                sx={{
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Ubah Progres:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => updateProjectProgress(proj.id, proj.progress - 10)}
                    disabled={proj.progress <= 0}
                    sx={{ minWidth: 32, px: 0.8, py: 0.2, fontSize: '0.75rem' }}
                  >
                    -10%
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => updateProjectProgress(proj.id, proj.progress + 10)}
                    disabled={proj.progress >= 100}
                    sx={{ minWidth: 32, px: 0.8, py: 0.2, fontSize: '0.75rem' }}
                  >
                    +10%
                  </Button>
                  <Button
                    size="small"
                    variant={proj.progress === 100 ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => updateProjectProgress(proj.id, 100, 'COMPLETED')}
                    sx={{ px: 1, py: 0.2, fontSize: '0.75rem' }}
                  >
                    Selesai
                  </Button>
                </Stack>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleOpenEdit(proj)} title="Edit Proyek">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setProjToDelete(proj.id)} title="Hapus Proyek">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Project Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
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
              {editingProj ? 'Edit Proyek Klien' : 'Tambah Proyek Klien Baru'}
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
              <Grid size={12}>
                <TextField
                  fullWidth
                  required
                  label="Judul Proyek"
                  placeholder="Contoh: Redesign & Migrasi E-Commerce Headless"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Nama Klien / Perusahaan"
                  placeholder="PT Nusantara Tech"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Klien"
                  placeholder="klien@perusahaan.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Deskripsi Deliverable & Lingkup Kerja"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tenggat Waktu (Deadline)"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Nilai Anggaran / Kontrak (IDR)"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Status Tahapan"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="PLANNING">Perencanaan (Planning)</MenuItem>
                  <MenuItem value="IN_PROGRESS">Pengerjaan (In Progress)</MenuItem>
                  <MenuItem value="REVIEW">Review / Pengujian (Review)</MenuItem>
                  <MenuItem value="COMPLETED">Selesai (Completed)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Persentase Progres Kerja: {formData.progress}%
                </Typography>
                <Slider
                  value={formData.progress}
                  onChange={(e, val) => setFormData({ ...formData, progress: val as number })}
                  valueLabelDisplay="auto"
                  step={5}
                  min={0}
                  max={100}
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
              Simpan Proyek
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(projToDelete)}
        onClose={() => setProjToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Catatan Proyek?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Data proyek klien ini akan dihapus dari sistem manajemen.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProjToDelete(null)} color="inherit">
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (projToDelete) {
                deleteProject(projToDelete);
                setProjToDelete(null);
              }
            }}
          >
            Hapus Proyek
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
