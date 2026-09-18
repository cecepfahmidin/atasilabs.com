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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  Alert,
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
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStatus } from '../../types';
import { computeBudgetFromService } from '../../lib/pricingUtils';

export const LeadsView: React.FC = () => {
  const theme = useTheme();
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

    const newProj = await addProject({
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
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
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
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)',
              color: theme.palette.primary.main,
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
              backgroundColor: 'rgba(100, 116, 139, 0.12)',
              color: '#64748b',
              fontWeight: 700,
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Pengirim',
        flex: 1.2,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.86rem', lineHeight: 1.2 }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
              {params.row.email}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'company',
        headerName: 'Instansi / Perusahaan',
        flex: 1,
        minWidth: 160,
        valueGetter: (value, row) => row.company || 'Pribadi / Perorangan',
      },
      {
        field: 'serviceType',
        headerName: 'Layanan Diminati',
        flex: 1.2,
        minWidth: 180,
        valueGetter: (value, row) => row.serviceType || 'Konsultasi Umum',
      },
      {
        field: 'budget',
        headerName: 'Anggaran',
        flex: 1,
        minWidth: 150,
        valueGetter: (value, row) => row.budget || 'Fleksibel',
      },
      {
        field: 'status',
        headerName: 'Status Pesan',
        width: 120,
        renderCell: (params: GridRenderCellParams) => getStatusChip(params.value as LeadStatus),
      },
      {
        field: 'createdAt',
        headerName: 'Tanggal Masuk',
        width: 130,
        valueGetter: (value, row) => {
          try {
            return new Date(row.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          } catch {
            return row.createdAt;
          }
        },
      },
      {
        field: 'actions',
        headerName: 'Aksi',
        width: 110,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenDetail(params.row)}
              title="Baca Detail Pesan"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setLeadToDelete(params.row.id)}
              title="Hapus Pesan"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [theme.palette.mode, theme.palette.primary.main]
  );

  return (
    <Box>
      {/* Header & Controls */}
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
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Manajemen Pesan Masuk (Leads)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tabel kontak inquiry yang tersimpan di basis data Supabase (Tabel Lead) melalui Next.js Server Actions.
          </Typography>
        </Box>

        {unreadLeadsCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={markAllLeadsRead}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Tandai Semua Dibaca ({unreadLeadsCount})
          </Button>
        )}
      </Box>

      {/* Filter and Search Bar Paper */}
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
              fontWeight: 600,
              fontSize: '0.86rem',
              textTransform: 'none',
              borderRadius: 2,
            },
          }}
        >
          <Tab label={`Semua (${leads.length})`} value="ALL" />
          <Tab
            label={`Baru (${leads.filter((l) => l.status === 'NEW').length})`}
            value="NEW"
          />
          <Tab
            label={`Dibaca (${leads.filter((l) => l.status === 'READ').length})`}
            value="READ"
          />
          <Tab
            label={`Arsip (${leads.filter((l) => l.status === 'ARCHIVED').length})`}
            value="ARCHIVED"
          />
        </Tabs>

        <TextField
          size="small"
          placeholder="Cari pengirim, email, pesan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', md: 280 } }}
        />
      </Paper>

      {/* DataGrid Container */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ height: 500, width: '100%' }}>
          {mounted ? (
            <DataGrid
              rows={filteredLeads}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                },
              }}
            />
          ) : null}
        </Box>
      </Paper>

      {/* Detail Dialog Modal (as specified in RSD) */}
      <Dialog
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
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
        {selectedLead && (
          <>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                  Detail Pesan Masuk
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {selectedLead.id}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedLead(null)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              {/* Sender Info Card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 2.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedLead.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedLead.email}
                </Typography>

                <Stack spacing={0.8} sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                      <strong>Instansi:</strong> {selectedLead.company || 'Pribadi / Perorangan'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                      <strong>Layanan Diminati:</strong> {selectedLead.serviceType || 'Konsultasi Umum'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                      <strong>Estimasi Anggaran:</strong> {selectedLead.budget || 'Fleksibel'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                      <strong>Tanggal:</strong> {new Date(selectedLead.createdAt).toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Message Content */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Pesan / Kebutuhan Proyek:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
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

              {/* Status Switcher (as specified in RSD) */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Ubah Status Pesan:
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
                    sx={{ fontSize: '0.75rem' }}
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
                    sx={{ fontSize: '0.75rem' }}
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
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Arsipkan
                  </Button>
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setLeadToDelete(selectedLead.id);
                  setSelectedLead(null);
                }}
              >
                Hapus
              </Button>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button onClick={() => setSelectedLead(null)} color="inherit">
                  Tutup
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AutoIcon />}
                  onClick={handleConvertToProject}
                >
                  Jadikan Proyek & Auto-Gen 5 Dokumen
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href={`mailto:${selectedLead.email}?subject=Tanggapan Konsultasi Proyek DevStudio&body=Halo ${selectedLead.name},%0D%0A%0D%0ATerima kasih telah menghubungi kami mengenai inquiry ${selectedLead.serviceType || 'proyek web'}...`}
                  startIcon={<SendIcon />}
                >
                  Balas Email
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
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Pesan Lead?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Pesan ini akan dihapus secara permanen dari tabel Lead di Supabase. Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeadToDelete(null)} color="inherit">
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
          >
            Hapus Sekarang
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
