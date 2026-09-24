'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  DeleteOutlined as DeleteIcon,
  Search as SearchIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  AutoAwesome as AutoIcon,
  Inbox as InboxIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  ContentCopy as CopyIcon,
  WorkOutline as ProjectIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStatus } from '../../types';
import { computeBudgetFromService } from '../../lib/pricingUtils';

export const LeadsView: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const {
    leads,
    updateLeadStatus,
    deleteLead,
    markAllLeadsRead,
    unreadLeadsCount,
    addProject,
    setDashboardTab,
    pricingTiers,
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConvertToProject = async () => {
    if (!selectedLead) return;

    let numericBudget = 18500000;
    const digitsOnly = selectedLead.budget ? selectedLead.budget.replace(/\D/g, '') : '';
    if (digitsOnly && Number(digitsOnly) >= 100000) {
      numericBudget = Number(digitsOnly);
    } else {
      numericBudget = computeBudgetFromService(selectedLead.serviceType || '', pricingTiers).amount;
    }

    await addProject({
      clientName: selectedLead.name,
      clientEmail: selectedLead.email,
      clientCompany: selectedLead.company,
      title: selectedLead.serviceType || 'Pengembangan Web Custom',
      description: selectedLead.message,
      deadline: '2026-05-30',
      budget: numericBudget,
      progress: 10,
      status: 'PLANNING',
    });
    setSelectedLead(null);
    setDashboardTab('documents');
  };

  // Pipeline Statistics Calculations
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === 'NEW').length;
    const readCount = leads.filter((l) => l.status === 'READ').length;
    const archivedCount = leads.filter((l) => l.status === 'ARCHIVED').length;

    const pipelineValue = leads.reduce((acc, lead) => {
      const digitsOnly = lead.budget ? lead.budget.replace(/\D/g, '') : '';
      if (digitsOnly && Number(digitsOnly) >= 100000) {
        return acc + Number(digitsOnly);
      }
      return acc + computeBudgetFromService(lead.serviceType || '', pricingTiers).amount;
    }, 0);

    return { total, newCount, readCount, archivedCount, pipelineValue };
  }, [leads, pricingTiers]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesTab =
        filterTab === 'ALL' ||
        (filterTab === 'NEW' && lead.status === 'NEW') ||
        (filterTab === 'READ' && lead.status === 'READ') ||
        (filterTab === 'ARCHIVED' && lead.status === 'ARCHIVED');

      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.serviceType && lead.serviceType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lead.message.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [leads, filterTab, searchQuery]);

  const getStatusChip = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <Chip
            label="Baru"
            size="small"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              borderStyle: 'solid',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
            }}
          />
        );
      case 'READ':
        return (
          <Chip
            label="Dibaca"
            size="small"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              borderWidth: 1,
              borderStyle: 'solid',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
            }}
          />
        );
      case 'ARCHIVED':
      default:
        return (
          <Chip
            label="Diarsipkan"
            size="small"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.1)',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 24,
            }}
          />
        );
    }
  };

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    if (lead.status === 'NEW') {
      updateLeadStatus(lead.id, 'READ');
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Pengirim',
        flex: 1.3,
        minWidth: 210,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', height: '100%' }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '0.85rem',
                fontWeight: 700,
                bgcolor: getAvatarColor(params.row.name),
              }}
            >
              {params.row.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: params.row.status === 'NEW' ? 800 : 700,
                  fontSize: '0.86rem',
                  lineHeight: 1.2,
                  color: params.row.status === 'NEW' ? theme.palette.text.primary : theme.palette.text.secondary,
                }}
                noWrap
              >
                {params.row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }} noWrap display="block">
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'company',
        headerName: 'Instansi / Perusahaan',
        flex: 1,
        minWidth: 170,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Typography variant="body2" sx={{ fontSize: '0.84rem', color: theme.palette.text.secondary }} noWrap>
              {params.row.company || 'Pribadi / Perorangan'}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'serviceType',
        headerName: 'Layanan Diminati',
        flex: 1.2,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Chip
              label={params.row.serviceType || 'Konsultasi Umum'}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: '0.73rem',
                borderRadius: 1.5,
                borderColor: theme.palette.divider,
              }}
            />
          </Box>
        ),
      },
      {
        field: 'budget',
        headerName: 'Estimasi Anggaran',
        flex: 1,
        minWidth: 160,
        renderCell: (params: GridRenderCellParams) => {
          const budgetVal = params.row.budget || computeBudgetFromService(params.row.serviceType || '', pricingTiers).text;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.palette.success.main }} noWrap>
                {budgetVal}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            {getStatusChip(params.value as LeadStatus)}
          </Box>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Tanggal Masuk',
        width: 140,
        renderCell: (params: GridRenderCellParams) => {
          let formatted = params.row.createdAt;
          try {
            formatted = new Date(params.row.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          } catch {}
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }} noWrap>
                {formatted}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Aksi',
        width: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const isArchived = params.row.status === 'ARCHIVED';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
              <Tooltip title="Baca Detail & Konversi">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenDetail(params.row)}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isArchived ? 'Batal Arsipkan' : 'Arsipkan Lead'}>
                <IconButton
                  size="small"
                  onClick={() => updateLeadStatus(params.row.id, isArchived ? 'READ' : 'ARCHIVED')}
                  sx={{
                    bgcolor: isArchived
                      ? 'rgba(245, 158, 11, 0.12)'
                      : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                    color: isArchived ? '#f59e0b' : theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: isArchived ? 'rgba(245, 158, 11, 0.25)' : 'rgba(100, 116, 139, 0.15)',
                    },
                  }}
                >
                  {isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Hapus Lead">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setLeadToDelete(params.row.id)}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [theme.palette.mode, theme.palette.text, pricingTiers, updateLeadStatus]
  );


  return (
    <Box>
      {/* Top Header & Quick Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              letterSpacing: '-0.02em',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            }}
          >
            Manajemen Pesan & Lead Masuk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kelola inquiry prospek klien, tanggapi via email, dan konversi lead menjadi proyek aktif beserta 5 dokumen resmi.
          </Typography>
        </Box>

        {unreadLeadsCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={markAllLeadsRead}
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2,
              py: 0.8,
              borderColor: theme.palette.primary.main,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
            }}
          >
            Tandai Semua Dibaca ({unreadLeadsCount})
          </Button>
        )}
      </Box>

      {/* Metric Summary Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Card 1: Total Leads */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Inquiry
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <InboxIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {metrics.total}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Semua kontak masuk
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Unread Leads */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Lead Baru
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <EmailIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: metrics.newCount > 0 ? '#ef4444' : theme.palette.text.primary }}>
              {metrics.newCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Perlu perhatian & tanggapan
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: Ready for Conversion */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Telah Dibaca
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {metrics.readCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Siap dikonversi jadi proyek
            </Typography>
          </CardContent>
        </Card>

        {/* Card 4: Estimated Pipeline Value */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Potensi Pipeline
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <MoneyIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
              Rp {(metrics.pipelineValue / 1000000).toFixed(1)} Jt
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Estimasi nilai total budget
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter and Search Control Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Tabs
          value={filterTab}
          onChange={(e, val) => setFilterTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              py: 0.5,
              px: 2,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: 2,
            },
          }}
        >
          <Tab label={`Semua (${leads.length})`} value="ALL" />
          <Tab
            label={`Baru (${metrics.newCount})`}
            value="NEW"
            sx={{
              color: metrics.newCount > 0 ? '#ef4444 !important' : undefined,
            }}
          />
          <Tab label={`Dibaca (${metrics.readCount})`} value="READ" />
          <Tab label={`Arsip (${metrics.archivedCount})`} value="ARCHIVED" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Cari pengirim, email, instansi, pesan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            width: { xs: '100%', md: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
            },
          }}
        />
      </Paper>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: theme.palette.text.secondary,
            }}
          >
            <InboxIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Tidak ada pesan lead yang ditemukan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            {searchQuery
              ? `Tidak ditemukan pesan yang cocok dengan kata kunci "${searchQuery}". Coba ganti kata pencarian.`
              : 'Belum ada pesan masuk untuk kategori filter ini.'}
          </Typography>
        </Paper>
      )}

      {/* Desktop DataGrid View */}
      {mounted && isDesktop && filteredLeads.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 3.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={filteredLeads}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              rowHeight={64}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  cursor: 'pointer',
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Mobile Cards View */}
      {mounted && !isDesktop && filteredLeads.length > 0 && (
        <Stack spacing={2}>
          {filteredLeads.map((lead) => (
            <Paper
              key={lead.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.2s',
                '&:active': { transform: 'scale(0.99)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      bgcolor: getAvatarColor(lead.name),
                    }}
                  >
                    {lead.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {lead.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {lead.email}
                    </Typography>
                  </Box>
                </Box>
                {getStatusChip(lead.status)}
              </Box>

              <Stack
                spacing={1}
                sx={{
                  my: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Instansi:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{lead.company || 'Pribadi'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Layanan:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{lead.serviceType || 'Konsultasi'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Estimasi Budget:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {lead.budget || computeBudgetFromService(lead.serviceType || '', pricingTiers).text}
                  </Typography>
                </Box>
                <Box sx={{ pt: 0.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>Pesan:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{lead.message.length > 120 ? lead.message.slice(0, 120) + '...' : lead.message}"
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(lead.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<VisibilityIcon fontSize="small" />}
                    onClick={() => handleOpenDetail(lead)}
                    sx={{ borderRadius: 2, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700 }}
                  >
                    Detail & Konversi
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => updateLeadStatus(lead.id, lead.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED')}
                    title={lead.status === 'ARCHIVED' ? 'Batal Arsipkan' : 'Arsipkan Lead'}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      color: lead.status === 'ARCHIVED' ? '#f59e0b' : theme.palette.text.secondary,
                    }}
                  >
                    {lead.status === 'ARCHIVED' ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setLeadToDelete(lead.id)}
                    sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Enhanced Detail & Project Conversion Dialog Modal */}
      <Dialog
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              p: 1,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        {selectedLead && (
          <>
            <DialogTitle component="div" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    bgcolor: getAvatarColor(selectedLead.name),
                  }}
                >
                  {selectedLead.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Detail Pesan Inquiry Lead
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {selectedLead.id} &bull; Masuk: {new Date(selectedLead.createdAt).toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedLead(null)} size="small" sx={{ borderRadius: 2 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Sender Details Grid */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(248, 250, 252, 1)',
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      <EmailIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Pengirim & Email
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedLead.name}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        {selectedLead.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      <BusinessIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Instansi / Perusahaan
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedLead.company || 'Pribadi / Perorangan'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <AutoIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Layanan Diminati
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedLead.serviceType || 'Konsultasi Umum'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                      <MoneyIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Estimasi Anggaran Klien
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                        {selectedLead.budget || computeBudgetFromService(selectedLead.serviceType || '', pricingTiers).text}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Message Box Header & Copy Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Isi Pesan Inquiry:
                </Typography>
                <Button
                  size="small"
                  startIcon={<CopyIcon sx={{ fontSize: 14 }} />}
                  onClick={() => handleCopyMessage(selectedLead.message)}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  {copiedMessage ? 'Tersalin!' : 'Salin Pesan'}
                </Button>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  lineHeight: 1.7,
                  fontSize: '0.92rem',
                  whiteSpace: 'pre-line',
                  mb: 3,
                }}
              >
                {selectedLead.message}
              </Paper>

              {/* Status Selector Bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Status Status Pesan Saat Ini:
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={selectedLead.status === 'NEW' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => {
                      updateLeadStatus(selectedLead.id, 'NEW');
                      setSelectedLead({ ...selectedLead, status: 'NEW' });
                    }}
                    sx={{ fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Baru
                  </Button>
                  <Button
                    size="small"
                    variant={selectedLead.status === 'READ' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => {
                      updateLeadStatus(selectedLead.id, 'READ');
                      setSelectedLead({ ...selectedLead, status: 'READ' });
                    }}
                    sx={{ fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Dibaca
                  </Button>
                  <Button
                    size="small"
                    variant={selectedLead.status === 'ARCHIVED' ? 'contained' : 'outlined'}
                    color="inherit"
                    onClick={() => {
                      updateLeadStatus(selectedLead.id, 'ARCHIVED');
                      setSelectedLead({ ...selectedLead, status: 'ARCHIVED' });
                    }}
                    sx={{ fontSize: '0.75rem', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Arsipkan
                  </Button>
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setLeadToDelete(selectedLead.id);
                  setSelectedLead(null);
                }}
                sx={{ borderRadius: 2 }}
              >
                Hapus
              </Button>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button onClick={() => setSelectedLead(null)} color="inherit" sx={{ borderRadius: 2 }}>
                  Tutup
                </Button>
                {(() => {
                  const emailMatch = selectedLead.email ? selectedLead.email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) : null;
                  const recipientEmail = emailMatch ? emailMatch[0] : (selectedLead.email || '').trim();
                  const subjectText = `Tanggapan Inquiry Proyek Atasilabs (${selectedLead.serviceType || 'Web Development'})`;
                  const bodyText = `Halo ${selectedLead.name},\n\nTerima kasih telah menghubungi Atasilabs mengenai kebutuhan ${selectedLead.serviceType || 'pengembangan web'}.\n\nKami telah membaca detail kebutuhan Anda:\n"${selectedLead.message}"\n\nBerikut penawaran & rencana pengerjaan dari tim kami...`;
                  const mailtoHref = `mailto:${recipientEmail}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

                  return (
                    <Button
                      variant="outlined"
                      component="a"
                      href={mailtoHref}
                      startIcon={<SendIcon />}
                      sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                    >
                      Balas Email
                    </Button>
                  );
                })()}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ProjectIcon />}
                  onClick={handleConvertToProject}
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 800,
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  Jadikan Proyek & Auto-Gen 5 Dokumen
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Hapus Pesan Lead?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Pesan inquiry ini akan dihapus secara permanen dari basis data. Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeadToDelete(null)} color="inherit" sx={{ borderRadius: 2 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (leadToDelete) {
                deleteLead(leadToDelete);
                setLeadToDelete(null);
              }
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Hapus Sekarang
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
