'use client';

import React from 'react';
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
  IconButton,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Bolt as BoltIcon,
  Description as DescriptionIcon,
  Calculate as CalcIcon,
  AutoAwesome as AutoIcon,
  FolderSpecial as FolderIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientDashboardView } from './ClientDashboardView';

export const OverviewView: React.FC = () => {
  const theme = useTheme();
  const {
    leads,
    portfolios,
    projects,
    pricingTiers,
    setDashboardTab,
    unreadLeadsCount,
    currentUser,
  } = useApp();

  const [previewClientPortal, setPreviewClientPortal] = React.useState(false);

  // If user role is CLIENT or if admin activated preview mode, render ClientDashboardView
  if (currentUser?.role === 'CLIENT' || previewClientPortal) {
    return (
      <Box sx={{ width: '100%' }}>
        {currentUser?.role !== 'CLIENT' && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Alert severity="info" sx={{ flexGrow: 1, mr: 2, borderRadius: 2 }}>
              <strong>Mode Preview Admin:</strong> Anda sedang melihat tampilan Portal Klien.
            </Alert>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setPreviewClientPortal(false)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Kembali ke Studio Control Center
            </Button>
          </Box>
        )}
        <ClientDashboardView />
      </Box>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING' || p.status === 'REVIEW');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  const totalPipelineBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const statCards = [
    {
      title: 'Proyek Klien Berjalan',
      value: activeProjects.length,
      subtitle: `${completedProjects.length} proyek terselesaikan`,
      icon: <AssignmentIcon sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      tabTarget: 'projects',
    },
    {
      title: 'Dokumen Operasional (Auto)',
      value: projects.length * 5,
      subtitle: 'Paket CIF, RSD, MoU, SPK, BAST',
      icon: <DescriptionIcon sx={{ color: '#10b981' }} />,
      color: '#10b981',
      tabTarget: 'documents',
    },
    {
      title: 'Pesan Masuk',
      value: leads.length,
      subtitle: `${unreadLeadsCount} pesan baru perlu direspon`,
      icon: <EmailIcon sx={{ color: '#3b82f6' }} />,
      color: '#3b82f6',
      tabTarget: 'leads',
    },
    {
      title: 'Nilai Pipeline Proyek',
      value: formatRupiah(totalPipelineBudget),
      subtitle: 'Akumulasi total kontrak',
      icon: <TrendingUpIcon sx={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
      tabTarget: 'projects',
    },
  ];

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Baru' };
      case 'READ':
        return { bg: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)', color: theme.palette.primary.main, label: 'Dibaca' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', color: '#64748b', label: 'Diarsipkan' };
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome & Quick Action Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3.5,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Chip
              icon={<AutoIcon sx={{ fontSize: '14px !important' }} />}
              label="SISTEM OPERASIONAL DOKUMEN AUTOMATED"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.68rem',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.15)',
                color: theme.palette.primary.main,
                mb: 1,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              Selamat Datang di Studio Control Center Atasilabs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 700 }}>
              Pusat kendali manajemen proyek, otomatisasi 5 paket dokumen (CIF, RSD, MoU, SPK, BAST), kalkulator HPP, dan pengelolaan pesan prospek.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DescriptionIcon />}
              onClick={() => setDashboardTab('documents')}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Cetak / Kelola Dokumen
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<VisibilityIcon />}
              onClick={() => setPreviewClientPortal(true)}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Preview Portal Klien
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AssignmentIcon />}
              onClick={() => setDashboardTab('projects')}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Proyek Aktif
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Overview Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {statCards.map((card, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              onClick={() => setDashboardTab(card.tabTarget as any)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  borderColor: card.color,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.8rem' }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {card.subtitle}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Two-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Proyek Klien & Workflow Stage */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Proyek Klien Aktif & Status SOP Dokumen
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setDashboardTab('projects')}
                sx={{ fontWeight: 700, fontSize: '0.8rem' }}
              >
                Lihat Semua ({projects.length})
              </Button>
            </Box>

            {/* Desktop Table View */}
            <TableContainer sx={{ width: '100%', overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Klien / Proyek</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Progres</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nilai Kontrak</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status Dokumen</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.slice(0, 4).map((proj) => (
                    <TableRow key={proj.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {proj.clientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {proj.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={proj.progress}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{proj.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatRupiah(proj.budget)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                          label="5 Dokumen Ready"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setDashboardTab('documents')}
                          sx={{ fontSize: '0.72rem', py: 0.2 }}
                        >
                          Dokumen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Card View */}
            <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
              {projects.slice(0, 4).map((proj) => (
                <Paper
                  key={proj.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {proj.clientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {proj.title}
                      </Typography>
                    </Box>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                      label="5 Dokumen"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  </Box>

                  <Box sx={{ my: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Nilai Kontrak: <strong style={{ color: theme.palette.primary.main }}>{formatRupiah(proj.budget)}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {proj.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={proj.progress} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setDashboardTab('documents')}
                      sx={{ fontSize: '0.72rem', py: 0.3 }}
                    >
                      Buka Dokumen
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>

          {/* User Guide Card for Operations */}
          <Alert
            severity="info"
            icon={<AutoIcon color="info" />}
            sx={{
              borderRadius: 3,
              fontSize: '0.82rem',
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              💡 Panduan Operasional Cepat Atasilabs:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
              1. <strong>Pesan Masuk (Leads)</strong>: Terima pesan dari calon klien, klik <em>"Jadikan Proyek & Auto-Gen 5 Dokumen"</em>.<br />
              2. <strong>Dokumen & SOP Workflow</strong>: Pilih nama proyek klien dari dropdown untuk langsung mencetak dokumen resmi ber-kop (CIF, RSD, MoU, SPK, BAST) ke format PDF A4.<br />
              3. <strong>Kalkulator HPP</strong>: Hitung alokasi fee developer, server/domain, dan simulasi pembagian laba kotor per tier.
            </Typography>
          </Alert>
        </Grid>

        {/* Right Column: Inbound Leads & Quick Access */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Recent Leads Widget */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  Pesan Masuk Terbaru
                </Typography>
              </Box>
              {unreadLeadsCount > 0 && (
                <Chip label={`${unreadLeadsCount} Baru`} color="error" size="small" sx={{ fontWeight: 800, height: 20 }} />
              )}
            </Box>

            <Stack spacing={1.5}>
              {leads.slice(0, 3).map((lead) => {
                const statusStyle = getStatusChipColor(lead.status);
                return (
                  <Paper
                    key={lead.id}
                    variant="outlined"
                    onClick={() => setDashboardTab('leads')}
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {lead.name}
                      </Typography>
                      <Chip
                        label={statusStyle.label}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mb: 0.8 }}>
                      {lead.company || lead.email}
                    </Typography>
                    <Typography variant="body2" color="text.primary" noWrap sx={{ fontSize: '0.78rem', fontStyle: 'italic' }}>
                      "{lead.message}"
                    </Typography>
                  </Paper>
                );
              })}
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setDashboardTab('leads')}
              sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Buka Semua Inbox Leads
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
