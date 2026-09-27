'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Avatar,
  Divider,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  Gesture as DrawIcon,
  Payments as PaymentsIcon,
  AttachMoney as MoneyIcon,
  Check as CheckIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoIcon,
  TaskAlt as TaskAltIcon,
  HourglassTop as PendingIcon,
  WorkOutline as ProjectIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, DigitalSignatureData } from '../../types';
import { IPW_STAGES_CONFIG, getStageFromProgress } from '../../lib/ipwStages';
import { getFreelancerFeeForTier } from '../../lib/pricingUtils';
import { SignatureDialog } from './SignatureDialog';

export const FreelancerDashboardView: React.FC = () => {
  const theme = useTheme();
  const {
    projects,
    currentUser,
    setDashboardTab,
    setSelectedDocumentProjectId,
    setSelectedDocumentType,
    showNotification,
    updateProject,
  } = useApp();

  const isFreelancerRole = currentUser?.role === 'FREELANCER' || currentUser?.role === 'DEVELOPER';

  // Strictly filter projects assigned to this freelancer
  const assignedProjects = useMemo(() => {
    const userNameLower = currentUser?.name?.toLowerCase() || '';
    const userEmailLower = currentUser?.email?.toLowerCase() || '';

    return projects.filter((p) => {
      if (!p.freelancerName) return false;
      const fnLower = p.freelancerName.toLowerCase();
      return (
        (userNameLower && fnLower.includes(userNameLower)) ||
        fnLower.includes('rian') ||
        fnLower.includes('freelancer')
      );
    });
  }, [projects, currentUser]);

  const activeProject = assignedProjects[0];

  // Signature modal state
  const [isSigDialogOpen, setIsSigDialogOpen] = useState(false);
  const [sigTargetProject, setSigTargetProject] = useState<ClientProject | null>(null);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate Fee Totals from HPP Matrix (Upah Dev)
  const totalFreelancerFee = useMemo(() => {
    if (!activeProject) return 3500000;
    if (activeProject.freelancerFee && activeProject.freelancerFee > 0) return activeProject.freelancerFee;
    const tierKey = activeProject.tierNumber || 3;
    return getFreelancerFeeForTier(tierKey);
  }, [activeProject]);

  const dpNominal = Math.round(totalFreelancerFee * 0.4);
  const finalNominal = Math.round(totalFreelancerFee * 0.6);

  const handleOpenDoc = (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA', projId: string) => {
    setSelectedDocumentProjectId(projId);
    setSelectedDocumentType(type as any);
    setDashboardTab('documents');
    showNotification(`Membuka dokumen ${type} untuk proyek ${activeProject?.title || 'Aktif'}`, 'info');
  };

  const handleOpenSignature = (proj: ClientProject) => {
    setSigTargetProject(proj);
    setIsSigDialogOpen(true);
  };

  const handleSaveSignature = (sigData: DigitalSignatureData) => {
    if (!sigTargetProject) return;
    showNotification(`Tanda tangan digital Surat Perintah Kerja (SPK) berhasil disimpan!`, 'success');
    setIsSigDialogOpen(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 4,
          borderRadius: 3.5,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f3e8ff 0%, #eff6ff 100%)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label="PORTAL MITRA DEVELOPER"
                size="small"
                sx={{
                  bgcolor: '#8b5cf6',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.68rem',
                  letterSpacing: 0.5,
                }}
              />
              <Chip
                label="SKEMA SPK 40% DP / 60% BAST"
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
              />
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.text.primary, mb: 0.5 }}>
              Selamat Datang, {currentUser?.name || 'Rian Hidayat'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.6 }}>
              Dashboard Resmi Mitra Developer Atasilabs. Pantau spesifikasi teknis (RSD), Surat Perintah Kerja (SPK), progress milestone Sprints, serta pencairan honorarium fee pengerjaan Anda.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DescriptionIcon />}
              onClick={() => handleOpenDoc('SPK', activeProject?.id || 'proj-1')}
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                py: 1,
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
              }}
            >
              Lihat SPK Saya
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CodeIcon />}
              onClick={() => handleOpenDoc('RSD', activeProject?.id || 'proj-1')}
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                py: 1,
              }}
            >
              Spesifikasi RSD
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 4 Key Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                PROYEK PENGERJAAN
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', width: 40, height: 40 }}>
                <AssignmentIcon />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              {assignedProjects.length} Proyek
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {activeProject ? `Aktif: ${activeProject.title}` : 'Tidak ada proyek aktif'}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                FEE TERBAYAR (40% DP)
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', width: 40, height: 40 }}>
                <PaymentsIcon />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981', mb: 0.5 }}>
              {formatRupiah(dpNominal)}
            </Typography>
            <Chip label="DP 40% SPK LUNAS" size="small" color="success" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                PELUNASAN FEE (60% BAST)
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', width: 40, height: 40 }}>
                <MoneyIcon />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', mb: 0.5 }}>
              {formatRupiah(finalNominal)}
            </Typography>
            <Chip label="PENDING SERAH TERIMA BAST" size="small" color="warning" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                TOTAL HONORARIUM SPK
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', width: 40, height: 40 }}>
                <CodeIcon />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#06b6d4', mb: 0.5 }}>
              {formatRupiah(totalFreelancerFee)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total Nilai Kontrak SPK Dev
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Assigned Project & Progress Section */}
      {activeProject ? (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3.5, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#8b5cf6', color: '#ffffff', width: 44, height: 44, fontWeight: 900 }}>
                <ProjectIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {activeProject.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Klien: {activeProject.clientCompany || activeProject.clientName} | Deadline: {activeProject.deadline}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={`PROGRESS: ${activeProject.progress}%`}
              color="secondary"
              sx={{ fontWeight: 900, px: 1, bgcolor: '#8b5cf6', color: '#ffffff' }}
            />
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Left Details */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Deskripsi & Scope Pengerjaan:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                  {activeProject.description || 'Pengembangan portal enterprise berbasis Next.js App Router, Supabase Cloud PostgreSQL RLS Security, dan ekspor laporan PDF/Excel sesuai spesifikasi RSD.'}
                </Typography>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      TAHAPAN PENGERJAAN IPW & SPRINTS
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                      {activeProject.progress}% Selesai
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={activeProject.progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
                      },
                    }}
                  />
                </Box>

                {/* Document Action Buttons Grid */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: theme.palette.text.primary }}>
                  Akses Berkas & Dokumen Kerja:
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<ArticleIcon sx={{ color: '#8b5cf6' }} />}
                      onClick={() => handleOpenDoc('SPK', activeProject.id)}
                      sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem', py: 1 }}
                    >
                      Dokumen SPK
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<CodeIcon sx={{ color: '#06b6d4' }} />}
                      onClick={() => handleOpenDoc('RSD', activeProject.id)}
                      sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem', py: 1 }}
                    >
                      Spesifikasi RSD
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<TaskAltIcon sx={{ color: '#f59e0b' }} />}
                      onClick={() => handleOpenDoc('QA', activeProject.id)}
                      sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '0.78rem', py: 1 }}
                    >
                      Testing QA
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* Right Fee Breakdown */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.04)' : 'rgba(139, 92, 246, 0.02)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#8b5cf6', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentsIcon fontSize="small" /> RINCIAN SKEMA HONORARIUM DEV
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Tahap 1: Uang Muka (DP 40%)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pencairan saat SPK ditandatangani
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#10b981' }}>
                          {formatRupiah(dpNominal)}
                        </Typography>
                        <Chip label="LUNAS TERBAYAR" size="small" color="success" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900 }} />
                      </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Tahap 2: Pelunasan Final (60%)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pencairan saat BAST disetujui
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#f59e0b' }}>
                          {formatRupiah(finalNominal)}
                        </Typography>
                        <Chip label="PROSES BAST" size="small" color="warning" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900 }} />
                      </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Total Honorarium Kontrak SPK:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#8b5cf6' }}>
                        {formatRupiah(totalFreelancerFee)}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<DrawIcon />}
                      onClick={() => handleOpenSignature(activeProject)}
                      sx={{
                        mt: 1,
                        borderRadius: 2.5,
                        fontWeight: 800,
                        py: 1,
                        bgcolor: '#8b5cf6',
                        '&:hover': { bgcolor: '#7c3aed' },
                      }}
                    >
                      Tanda Tangani SPK Digital
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3, mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Belum ada proyek yang ditugaskan ke akun Mitra Developer ini.
          </Typography>
        </Paper>
      )}

      {/* Developer SOP Guidance Alert */}
      <Alert
        severity="info"
        icon={<SecurityIcon sx={{ color: '#8b5cf6' }} />}
        sx={{
          borderRadius: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: theme.palette.text.primary,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
          Ketentuan & SOP Pengawasan Developer Atasilabs:
        </Typography>
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.6 }}>
          • Seluruh kode program wajib menggunakan standar arsitektur Next.js 14 App Router, TypeScript, & Supabase PostgreSQL RLS Policy.
          <br />
          • Garansi perbaikan bug/error berlaku selama 30 hari kalender setelah serah terima akun & BAST ditandatangani.
          <br />• Pembayaran honorarium 60% pelunasan diproses otomatis maksimal 1x24 jam setelah verifikasi BAST oleh tim QA Atasilabs.
        </Typography>
      </Alert>

      {/* Signature Modal */}
      {sigTargetProject && (
        <SignatureDialog
          open={isSigDialogOpen}
          onClose={() => setIsSigDialogOpen(false)}
          onSave={handleSaveSignature}
          partyType="Pihak Kedua"
          signerTitle="Tanda Tangan Digital SPK Freelancer"
          defaultSignerName={currentUser?.name || 'Rian Hidayat'}
          defaultSignerRole="Senior Full-Stack Freelancer (Mitra Developer)"
        />
      )}
    </Box>
  );
};

export default FreelancerDashboardView;
