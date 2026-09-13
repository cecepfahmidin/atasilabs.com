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
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const OverviewView: React.FC = () => {
  const theme = useTheme();
  const {
    leads,
    portfolios,
    projects,
    pricingTiers,
    setDashboardTab,
    unreadLeadsCount,
    updateLeadStatus,
  } = useApp();

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
      title: 'Total Pesan Masuk (Leads)',
      value: leads.length,
      subtitle: `${unreadLeadsCount} pesan baru belum dibaca`,
      icon: <EmailIcon sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      tabTarget: 'leads',
    },
    {
      title: 'Proyek Klien Berjalan',
      value: activeProjects.length,
      subtitle: `${completedProjects.length} proyek terselesaikan`,
      icon: <AssignmentIcon sx={{ color: '#10b981' }} />,
      color: '#10b981',
      tabTarget: 'projects',
    },
    {
      title: 'Portofolio Diterbitkan',
      value: portfolios.length,
      subtitle: 'Tersinkron di Supabase DB',
      icon: <CodeIcon sx={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      tabTarget: 'portfolio',
    },
    {
      title: 'Total Nilai Pipeline',
      value: formatRupiah(totalPipelineBudget),
      subtitle: 'Akumulasi kontrak proyek',
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
      case 'ARCHIVED':
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: 'Arsip' };
    }
  };

  return (
    <Box>
      {/* Top Welcome & Actions */}
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
            Ringkasan Sistem & Metrik Operasional
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Data dikueri secara langsung dari basis data PostgreSQL Supabase melalui Prisma ORM Client.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BoltIcon />}
            onClick={() => setDashboardTab('pricing')}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Atur Pricelist (5 Tiers)
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDashboardTab('portfolio')}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Tambah Portofolio
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={() => setDashboardTab('leads')}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Kelola Leads {unreadLeadsCount > 0 && `(${unreadLeadsCount})`}
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: 3.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: card.color,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2.5,
                    backgroundColor: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
                {card.value}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setDashboardTab(card.tabTarget as any)}
                  sx={{ minWidth: 'auto', p: 0.5, color: card.color }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Middle Split: Recent Leads & Active Projects */}
      <Grid container spacing={3.5}>
        {/* Left: Recent Leads / Messages */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Pesan Masuk Terbaru (Tabel Lead)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hasil submit dari formulir landing page
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setDashboardTab('leads')}
                sx={{ fontWeight: 600 }}
              >
                Buka Semua
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>PENGIRIM</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>LAYANAN</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>AKSI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.slice(0, 4).map((lead) => {
                    const statusConfig = getStatusChipColor(lead.status);
                    return (
                      <TableRow key={lead.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.86rem' }}>
                            {lead.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lead.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                            {lead.serviceType || 'Konsultasi'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              updateLeadStatus(lead.id, 'READ');
                              setDashboardTab('leads');
                            }}
                            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right: Active Project Progress Overview (LinearProgress) */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Progres Proyek Klien
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pelacakan deadline & deliverable kerja
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setDashboardTab('projects')}
                sx={{ fontWeight: 600 }}
              >
                Kelola
              </Button>
            </Box>

            <Stack spacing={2.5}>
              {projects.slice(0, 4).map((proj) => (
                <Box
                  key={proj.id}
                  sx={{
                    p: 1.8,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {proj.title}
                    </Typography>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                      {proj.progress}%
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2 }}>
                    Klien: {proj.clientName} • Deadline: {proj.deadline}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={proj.progress}
                    sx={{
                      height: 7,
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
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
