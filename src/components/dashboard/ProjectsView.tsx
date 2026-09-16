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
  useTheme,
  Alert,
  Tooltip,
  Divider,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
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
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, ProjectStatus, IPWStage } from '../../types';
import { IPW_STAGES_CONFIG, IPW_STAGES_LIST, getStageFromProgress } from '../../lib/ipwStages';

export const ProjectsView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const {
    projects,
    users,
    addProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
    setDashboardTab,
    setSelectedDocumentProjectId,
    setSelectedDocumentType,
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
    progress: 15,
    status: 'PLANNING' as ProjectStatus,
    ipwStage: 'STAGE_1_DISCOVERY' as IPWStage,
    freelancerName: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
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
      progress: 15,
      status: 'PLANNING',
      ipwStage: 'STAGE_1_DISCOVERY',
      freelancerName: '',
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (proj: ClientProject) => {
    setEditingProj(proj);
    const stageCfg = getStageFromProgress(proj.progress, proj.ipwStage);
    setFormData({
      clientName: proj.clientName,
      clientEmail: proj.clientEmail,
      title: proj.title,
      description: proj.description,
      deadline: proj.deadline,
      budget: proj.budget,
      progress: proj.progress,
      status: proj.status,
      ipwStage: stageCfg.stage,
      freelancerName: proj.freelancerName || '',
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleStageSelectInForm = (selectedStage: IPWStage) => {
    const stageCfg = IPW_STAGES_CONFIG[selectedStage];
    if (stageCfg) {
      setFormData((prev) => ({
        ...prev,
        ipwStage: selectedStage,
        progress: stageCfg.progressPercent,
        status: stageCfg.defaultStatus,
      }));
    }
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

  const handleConfirmDelete = () => {
    if (projToDelete) {
      deleteProject(projToDelete);
      setProjToDelete(null);
    }
  };

  const handleStageButtonClick = (projId: string, targetStage: IPWStage) => {
    const stageCfg = IPW_STAGES_CONFIG[targetStage];
    if (stageCfg) {
      updateProject(projId, {
        progress: stageCfg.progressPercent,
        ipwStage: targetStage,
        status: stageCfg.defaultStatus,
      });
    }
  };

  const handleFreelancerChangeOnCard = (projId: string, freelancerName: string) => {
    updateProject(projId, { freelancerName });
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { md: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LayersIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Klien & Proyek Aktif (Alur SOP 6-Tahap IPW)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pelacakan progres proyek berdasarkan 6 Tahap SOP Operasional Atasilabs: Discovery (CIF) ➔ Spec (RSD) ➔ Kontrak (MoU) ➔ SPK ➔ Eksekusi ➔ Closure (BAST).
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
            color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          Tambah Proyek Baru
        </Button>
      </Box>

      {/* Projects Grid Cards */}
      <Grid container spacing={3}>
        {projects.map((proj) => {
          const currentStageCfg = getStageFromProgress(proj.progress, proj.ipwStage);
          const assignedUser = users.find(
            (u) => `${u.name} (${u.role})` === proj.freelancerName || u.name === proj.freelancerName
          );

          return (
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
                    borderColor: currentStageCfg.hexColor,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Header with CircularProgress & Stage Chip */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ pr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, flexWrap: 'wrap' }}>
                      <Chip
                        label={currentStageCfg.shortName}
                        size="small"
                        sx={{
                          backgroundColor: `${currentStageCfg.hexColor}20`,
                          color: currentStageCfg.hexColor,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          border: `1px solid ${currentStageCfg.hexColor}40`,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        ID: #{proj.id.slice(-4)}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                      {proj.title}
                    </Typography>
                  </Box>

                  {/* CircularProgress Indicator */}
                  <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                    <CircularProgress
                      variant="determinate"
                      value={proj.progress}
                      size={54}
                      thickness={4.5}
                      sx={{ color: currentStageCfg.hexColor }}
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
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>
                        {proj.progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  {proj.description}
                </Typography>

                {/* 6 IPW Stages Visual Progress Stepper */}
                <Box
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: currentStageCfg.hexColor }}>
                      {currentStageCfg.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Dokumen SOP: <strong>{currentStageCfg.documentAssigned.split(' ')[0]}</strong>
                    </Typography>
                  </Box>

                  {/* 6 Stage Chips Indicator */}
                  <Grid container spacing={0.8} sx={{ mb: 1.5 }}>
                    {IPW_STAGES_LIST.map((stg) => {
                      const isCompleted = proj.progress >= stg.progressPercent;
                      const isCurrent = currentStageCfg.stage === stg.stage;
                      return (
                        <Grid size={2} key={stg.stage}>
                          <Tooltip title={`${stg.label} (${stg.progressPercent}%)`} arrow placement="top">
                            <Box
                              onClick={() => handleStageButtonClick(proj.id, stg.stage)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: isCurrent
                                  ? stg.hexColor
                                  : isCompleted
                                  ? `${stg.hexColor}80`
                                  : theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'rgba(0,0,0,0.1)',
                                border: isCurrent ? `2px solid ${theme.palette.common.white}` : 'none',
                                boxShadow: isCurrent ? `0 0 8px ${stg.hexColor}` : 'none',
                              }}
                            />
                          </Tooltip>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                    {currentStageCfg.description}
                  </Typography>
                </Box>

                {/* Client, Budget & Freelancer Information (Enlarged Layout) */}
                <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        height: '100%',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Klien / Perusahaan
                      </Typography>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', mt: 0.3 }}>
                        {proj.clientName}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        height: '100%',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Nilai Kontrak Proyek
                      </Typography>
                      <Typography variant="subtitle2" color="primary" noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', mt: 0.3 }}>
                        {formatRupiah(proj.budget)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={12}>
                    <Box
                      sx={{
                        p: 1.2,
                        px: 1.5,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      {/* Photo Avatar of PJ */}
                      <Tooltip title={assignedUser ? `Penanggung Jawab: ${assignedUser.name} (${assignedUser.role})` : 'Belum Ada PJ'} arrow placement="top">
                        <Avatar
                          src={assignedUser?.avatarUrl}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: assignedUser ? 'primary.main' : 'action.disabledBackground',
                            border: '2px solid',
                            borderColor: assignedUser ? 'primary.main' : 'divider',
                            boxShadow: assignedUser ? 1 : 0,
                            flexShrink: 0,
                            fontSize: '0.85rem',
                            fontWeight: 800,
                          }}
                        >
                          {assignedUser ? assignedUser.name[0]?.toUpperCase() : '?'}
                        </Avatar>
                      </Tooltip>

                      {/* Dropdown 1-Click */}
                      <TextField
                        select
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={proj.freelancerName || ''}
                        onChange={(e) => handleFreelancerChangeOnCard(proj.id, e.target.value)}
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            sx: {
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              borderRadius: 2,
                              backgroundColor: theme.palette.background.paper,
                              color: proj.freelancerName ? (theme.palette.mode === 'dark' ? '#fbbf24' : '#b45309') : theme.palette.text.secondary,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            -- Pilih PJ / Developer --
                          </Typography>
                        </MenuItem>
                        {users
                          .filter((u) => u.role === 'FREELANCER' || u.role === 'DEVELOPER' || u.role === 'CTO' || u.role === 'ADMIN')
                          .map((u) => {
                            const displayVal = `${u.name} (${u.role})`;
                            return (
                              <MenuItem key={u.id} value={displayVal}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 0.3 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                    {u.name}
                                  </Typography>
                                  <Chip
                                    label={u.role}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      backgroundColor: u.role === 'FREELANCER' ? '#f59e0b' : '#3b82f6',
                                      color: '#ffffff',
                                      ml: 1,
                                    }}
                                  />
                                </Box>
                              </MenuItem>
                            );
                          })}
                        {proj.freelancerName &&
                          !users.some((u) => `${u.name} (${u.role})` === proj.freelancerName || u.name === proj.freelancerName) && (
                            <MenuItem value={proj.freelancerName}>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                {proj.freelancerName}
                              </Typography>
                            </MenuItem>
                          )}
                      </TextField>
                    </Box>
                  </Grid>
                </Grid>

                {/* 1-Click Stage Switcher Bar */}
                <Box sx={{ mb: 2.5, mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    Pindah Tahap Operasional 6-Stage (1-Click):
                  </Typography>
                  <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', gap: 0.6 }}>
                    {IPW_STAGES_LIST.map((stg) => {
                      const isActive = currentStageCfg.stage === stg.stage;
                      return (
                        <Button
                          key={stg.stage}
                          size="small"
                          variant={isActive ? 'contained' : 'outlined'}
                          onClick={() => handleStageButtonClick(proj.id, stg.stage)}
                          sx={{
                            borderRadius: 1.5,
                            py: 0.3,
                            px: 0.8,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'none',
                            minWidth: 0,
                            borderColor: stg.hexColor,
                            color: isActive ? '#ffffff' : stg.hexColor,
                            backgroundColor: isActive ? stg.hexColor : 'transparent',
                            '&:hover': {
                              backgroundColor: stg.hexColor,
                              color: '#ffffff',
                            },
                          }}
                        >
                          T{stg.stageNumber}: {stg.documentAssigned.split(' ')[0]}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Bottom Card Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<DescriptionIcon fontSize="small" />}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => {
                      const docAssigned = currentStageCfg.documentAssigned.toUpperCase();
                      let docCode: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' = 'CIF';
                      if (docAssigned.includes('CIF')) docCode = 'CIF';
                      else if (docAssigned.includes('RSD')) docCode = 'RSD';
                      else if (docAssigned.includes('MOU')) docCode = 'MOU';
                      else if (docAssigned.includes('SPK')) docCode = 'SPK';
                      else if (docAssigned.includes('BAST')) docCode = 'BAST';

                      setSelectedDocumentProjectId(proj.id);
                      setSelectedDocumentType(docCode);
                      setDashboardTab('documents');
                      router.push(`/dashboard/documents?projectId=${proj.id}&docType=${docCode}`);
                    }}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textTransform: 'none',
                      color: currentStageCfg.hexColor,
                    }}
                  >
                    Buka Dokumen ({currentStageCfg.documentAssigned.split(' ')[0]})
                  </Button>

                  <Box>
                    <IconButton size="small" onClick={() => handleOpenEdit(proj)} color="primary" title="Edit Proyek">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setProjToDelete(proj.id)} color="error" title="Hapus Proyek">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Add / Edit Project Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              {editingProj ? 'Edit Proyek & Tahap IPW 6-Stage' : 'Tambah Proyek Klien Baru (6-Stage IPW)'}
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
                  placeholder="Contoh: Redesign & Migrasi Portal B2B Mitra"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>

              {/* 6-Stage Selector Dropdown */}
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Tahap SOP Operasional (6 IPW Stages)"
                  value={formData.ipwStage}
                  onChange={(e) => handleStageSelectInForm(e.target.value as IPWStage)}
                  helperText="Memilih tahap otomatis memperbarui persentase progres dan dokumen SOP acuan."
                >
                  {IPW_STAGES_LIST.map((stg) => (
                    <MenuItem key={stg.stage} value={stg.stage}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Tahap ${stg.stageNumber}`}
                          size="small"
                          sx={{ backgroundColor: stg.hexColor, color: '#fff', fontWeight: 800, height: 20 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {stg.label} ({stg.progressPercent}%)
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
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
                  label="Nilai Kontrak (IDR)"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="Nama Freelancer / Mitra Penanggung Jawab"
                  value={formData.freelancerName}
                  onChange={(e) => setFormData({ ...formData, freelancerName: e.target.value })}
                  helperText="Pilih mitra freelancer / developer penanggung jawab proyek dari daftar pengguna"
                >
                  <MenuItem value="">
                    <em>-- Belum Ditugaskan --</em>
                  </MenuItem>
                  {users
                    .filter((u) => u.role === 'FREELANCER' || u.role === 'DEVELOPER' || u.role === 'CTO' || u.role === 'ADMIN')
                    .map((u) => {
                      const displayVal = `${u.name} (${u.role})`;
                      return (
                        <MenuItem key={u.id} value={displayVal}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {u.name}
                            </Typography>
                            <Chip
                              label={u.role}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                backgroundColor: u.role === 'FREELANCER' ? '#f59e0b' : '#3b82f6',
                                color: '#ffffff',
                                ml: 1,
                              }}
                            />
                          </Box>
                        </MenuItem>
                      );
                    })}
                  {formData.freelancerName &&
                    !users.some((u) => `${u.name} (${u.role})` === formData.freelancerName || u.name === formData.freelancerName) && (
                      <MenuItem value={formData.freelancerName}>
                        {formData.freelancerName}
                      </MenuItem>
                    )}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setIsDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
              }}
            >
              {editingProj ? 'Simpan Perubahan' : 'Tambah Proyek'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(projToDelete)}
        onClose={() => setProjToDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Hapus Proyek?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Apakah Anda yakin ingin menghapus proyek ini dari sistem? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProjToDelete(null)} color="inherit" sx={{ fontWeight: 600 }}>
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: 2 }}>
            Hapus Proyek
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
