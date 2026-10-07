'use client';

import React, { useState, useMemo } from 'react';
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
  Drawer,
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
  InputAdornment,
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
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  RestartAlt as ResetIcon,
  FilterList as FilterListIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { CardSkeletonGrid } from '../common/SkeletonLoader';
import { ClientProject, ProjectStatus, IPWStage } from '../../types';
import { IPW_STAGES_CONFIG, IPW_STAGES_LIST, getStageFromProgress } from '../../lib/ipwStages';

export const ProjectsView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const {
    projects: rawProjects,
    users,
    currentUser,
    pricingTiers,
    isLoadingData,
    addProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
    setDashboardTab,
    setSelectedDocumentProjectId,
    setSelectedDocumentType,
  } = useApp();

  const isClientRole = currentUser?.role === 'CLIENT';
  const isFreelancerRole = currentUser?.role === 'FREELANCER';
  const isReadOnly = isClientRole || isFreelancerRole;
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ALL');

  const baseProjects = useMemo(() => {
    if (isClientRole) {
      const emailLower = currentUser?.email?.toLowerCase();
      const compLower = currentUser?.company?.toLowerCase();
      const nameLower = currentUser?.name?.toLowerCase();

      return rawProjects.filter((p) => {
        const matchesClient =
          (emailLower && p.clientEmail?.toLowerCase() === emailLower) ||
          (compLower && p.clientName?.toLowerCase().includes(compLower)) ||
          (nameLower && p.clientName?.toLowerCase().includes(nameLower));

        return matchesClient && !p.isArchived && p.status !== 'ARCHIVED';
      });
    }

    if (isFreelancerRole) {
      if (!currentUser) return [];
      const nameLower = currentUser.name.toLowerCase();
      return rawProjects.filter(
        (p) =>
          (p.freelancerName && p.freelancerName.toLowerCase().includes(nameLower)) ||
          (p.freelancerId && p.freelancerId === currentUser.id)
      );
    }

    return rawProjects;
  }, [rawProjects, currentUser, isClientRole, isFreelancerRole]);

  const counts = useMemo(() => {
    const active = baseProjects.filter((p) => !p.isArchived && p.status !== 'ARCHIVED' && p.progress < 100).length;
    const completed = baseProjects.filter((p) => !p.isArchived && (p.progress === 100 || p.status === 'COMPLETED')).length;
    const archived = baseProjects.filter((p) => p.isArchived || p.status === 'ARCHIVED').length;
    const all = baseProjects.length;
    return { active, completed, archived, all };
  }, [baseProjects]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [freelancerFilter, setFreelancerFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');

  // List of eligible freelancers & PJs for filter dropdown
  const eligibleFreelancers = useMemo(() => {
    const list = users.filter((u) => u.role === 'FREELANCER' || u.role === 'DEVELOPER' || u.role === 'CTO' || u.role === 'ADMIN');
    const userNames = new Set(list.map((u) => u.name));
    baseProjects.forEach((p) => {
      if (p.freelancerName && p.freelancerName.trim()) {
        userNames.add(p.freelancerName.trim());
      }
    });
    return Array.from(userNames).sort();
  }, [users, baseProjects]);

  const projects = useMemo(() => {
    let result = baseProjects;

    // 1. Status Filter Pills
    if (filterStatus === 'ACTIVE') {
      result = result.filter((p) => !p.isArchived && p.status !== 'ARCHIVED' && p.progress < 100);
    } else if (filterStatus === 'COMPLETED') {
      result = result.filter((p) => !p.isArchived && (p.progress === 100 || p.status === 'COMPLETED'));
    } else if (filterStatus === 'ARCHIVED') {
      result = result.filter((p) => p.isArchived || p.status === 'ARCHIVED');
    }

    // 2. Search Query (Title, Client Name, Client Email, Company, Freelancer, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = p.title?.toLowerCase() || '';
        const client = p.clientName?.toLowerCase() || '';
        const email = p.clientEmail?.toLowerCase() || '';
        const company = p.clientCompany?.toLowerCase() || '';
        const freelancer = p.freelancerName?.toLowerCase() || '';
        const desc = p.description?.toLowerCase() || '';
        return (
          title.includes(q) ||
          client.includes(q) ||
          email.includes(q) ||
          company.includes(q) ||
          freelancer.includes(q) ||
          desc.includes(q)
        );
      });
    }

    // 3. Stage Filter (IPW 1-6)
    if (stageFilter !== 'ALL') {
      result = result.filter((p) => {
        const stageCfg = getStageFromProgress(p.progress, p.ipwStage);
        return stageCfg.stage === stageFilter;
      });
    }

    // 4. Tier Filter
    if (tierFilter !== 'ALL') {
      const targetTier = parseInt(tierFilter, 10);
      result = result.filter((p) => p.tierNumber === targetTier);
    }

    // 5. Freelancer / PJ Filter
    if (freelancerFilter === 'UNASSIGNED') {
      result = result.filter((p) => !p.freelancerName || p.freelancerName.trim() === '');
    } else if (freelancerFilter !== 'ALL') {
      result = result.filter((p) => {
        if (!p.freelancerName) return false;
        return (
          p.freelancerName.toLowerCase() === freelancerFilter.toLowerCase() ||
          p.freelancerName.toLowerCase().includes(freelancerFilter.toLowerCase()) ||
          p.freelancerId === freelancerFilter
        );
      });
    }

    // 6. Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'DEADLINE_ASC') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'DEADLINE_DESC') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      if (sortBy === 'PROGRESS_DESC') {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === 'PROGRESS_ASC') {
        return (a.progress || 0) - (b.progress || 0);
      }
      if (sortBy === 'BUDGET_DESC') {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (sortBy === 'BUDGET_ASC') {
        return (a.budget || 0) - (b.budget || 0);
      }
      // Default: NEWEST
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [baseProjects, filterStatus, searchQuery, stageFilter, tierFilter, freelancerFilter, sortBy]);

  const isFilterActive =
    Boolean(searchQuery.trim()) ||
    stageFilter !== 'ALL' ||
    tierFilter !== 'ALL' ||
    freelancerFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStageFilter('ALL');
    setTierFilter('ALL');
    setFreelancerFilter('ALL');
    setSortBy('NEWEST');
  };

  const handleToggleArchive = (proj: ClientProject) => {
    const nextArchived = !proj.isArchived;
    updateProject(proj.id, {
      isArchived: nextArchived,
      status: nextArchived ? 'ARCHIVED' : proj.progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
    });
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ClientProject | null>(null);
  const [projToDelete, setProjToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    title: '',
    description: '',
    deadline: '',
    budget: 25000000,
    tierNumber: 3 as 1 | 2 | 3 | 4 | 5,
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
    const defaultTier = pricingTiers[1] || pricingTiers[0];
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      title: '',
      description: '',
      deadline: '2024-05-30',
      budget: defaultTier ? defaultTier.price : 25000000,
      tierNumber: (defaultTier ? defaultTier.tierNumber : 2) as 1 | 2 | 3 | 4 | 5,
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
    const matchedTier = pricingTiers.find((t) => t.price === proj.budget) || pricingTiers.find((t) => t.tierNumber === proj.tierNumber);
    setFormData({
      clientName: proj.clientName,
      clientEmail: proj.clientEmail,
      clientPhone: proj.clientPhone || '',
      title: proj.title,
      description: proj.description,
      deadline: proj.deadline,
      budget: proj.budget,
      tierNumber: (matchedTier ? matchedTier.tierNumber : (proj.tierNumber || 1)) as 1 | 2 | 3 | 4 | 5,
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

    const payload = {
      ...formData,
      budget: Number(formData.budget) || 0,
      tierNumber: formData.tierNumber,
    };

    if (editingProj) {
      updateProject(editingProj.id, payload);
    } else {
      addProject(payload as any);
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
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              }}
            >
              Klien & Proyek
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pelacakan progres proyek berdasarkan Tahapan Operasional Atasilabs.
          </Typography>
        </Box>

        {!isReadOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              borderRadius: 2.5,
              px: { xs: 2, md: 3 },
              py: { xs: 0.6, md: 1 },
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              fontWeight: 700,
              textTransform: 'none',
              width: { xs: '100%', md: 'auto' },
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            Tambah Proyek Baru
          </Button>
        )}
      </Box>

      {/* Filter Status Pills */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, max-content)' }, gap: 1, mb: { xs: 2.5, sm: 3.5 } }}>
        <Chip
          label={`Semua Proyek (${counts.all})`}
          color={filterStatus === 'ALL' ? 'primary' : 'default'}
          variant={filterStatus === 'ALL' ? 'filled' : 'outlined'}
          onClick={() => setFilterStatus('ALL')}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2, cursor: 'pointer', py: 0.5, fontSize: { xs: '0.72rem', sm: '0.8rem' }, height: { xs: 32, sm: 34 } }}
        />
        <Chip
          label={`Proyek Aktif (${counts.active})`}
          color={filterStatus === 'ACTIVE' ? 'info' : 'default'}
          variant={filterStatus === 'ACTIVE' ? 'filled' : 'outlined'}
          onClick={() => setFilterStatus('ACTIVE')}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2, cursor: 'pointer', py: 0.5, fontSize: { xs: '0.72rem', sm: '0.8rem' }, height: { xs: 32, sm: 34 } }}
        />
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: { xs: '14px !important', sm: '16px !important' } }} />}
          label={`Proyek Selesai (${counts.completed})`}
          color={filterStatus === 'COMPLETED' ? 'success' : 'default'}
          variant={filterStatus === 'COMPLETED' ? 'filled' : 'outlined'}
          onClick={() => setFilterStatus('COMPLETED')}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2, cursor: 'pointer', py: 0.5, fontSize: { xs: '0.72rem', sm: '0.8rem' }, height: { xs: 32, sm: 34 } }}
        />
        <Chip
          icon={<ArchiveIcon sx={{ fontSize: { xs: '14px !important', sm: '16px !important' } }} />}
          label={`Arsip Proyek (${counts.archived})`}
          color={filterStatus === 'ARCHIVED' ? 'warning' : 'default'}
          variant={filterStatus === 'ARCHIVED' ? 'filled' : 'outlined'}
          onClick={() => setFilterStatus('ARCHIVED')}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2, cursor: 'pointer', py: 0.5, fontSize: { xs: '0.72rem', sm: '0.8rem' }, height: { xs: 32, sm: 34 } }}
        />
      </Box>

      {/* Search & Comprehensive Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          mb: { xs: 2.5, sm: 3.5 },
          borderRadius: { xs: 2.5, sm: 3 },
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Row 1: Search Input + Result Count & Reset Button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Search TextField */}
          <TextField
            fullWidth
            size="small"
            placeholder="Cari judul proyek, nama klien, kontak, atau PJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} edge="end" aria-label="Hapus kata kunci pencarian">
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              maxWidth: { sm: 420 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#ffffff',
                fontSize: { xs: '0.82rem', sm: '0.88rem' },
              },
            }}
          />

          {/* Result Count Badge & Reset Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Chip
              size="small"
              label={`${projects.length} Proyek`}
              color={projects.length > 0 ? 'default' : 'warning'}
              sx={{ fontWeight: 700, borderRadius: 2, fontSize: { xs: '0.72rem', sm: '0.75rem' } }}
            />

            {isFilterActive && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
                onClick={handleResetFilters}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  py: 0.4,
                  px: 1.5,
                }}
              >
                Reset Filter
              </Button>
            )}
          </Box>
        </Box>

        {/* Row 2: 4-Column Responsive Filter Selectors (2 cols on mobile, 4 on desktop) */}
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          {/* Tahapan Operasional (IPW) */}
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tahapan IPW"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              slotProps={{
                select: {
                  sx: {
                    borderRadius: 2,
                    fontSize: { xs: '0.72rem', sm: '0.82rem' },
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : '#ffffff',
                    '& .MuiSelect-select': {
                      py: { xs: 0.9, sm: 1.1 },
                      pr: '22px !important',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                },
                inputLabel: {
                  sx: { fontSize: { xs: '0.75rem', sm: '0.85rem' } },
                },
              }}
            >
              <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>Semua Tahapan (1-6)</MenuItem>
              {IPW_STAGES_LIST.map((stg) => (
                <MenuItem key={stg.stage} value={stg.stage} sx={{ fontSize: '0.82rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: stg.hexColor,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem' }} noWrap>
                      {stg.shortName}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Paket Tier */}
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Paket Tier"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              slotProps={{
                select: {
                  sx: {
                    borderRadius: 2,
                    fontSize: { xs: '0.72rem', sm: '0.82rem' },
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : '#ffffff',
                    '& .MuiSelect-select': {
                      py: { xs: 0.9, sm: 1.1 },
                      pr: '22px !important',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                },
                inputLabel: {
                  sx: { fontSize: { xs: '0.75rem', sm: '0.85rem' } },
                },
              }}
            >
              <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>Semua Paket Tier</MenuItem>
              {[1, 2, 3, 4, 5].map((tierNum) => {
                const tierInfo = pricingTiers.find((t) => t.tierNumber === tierNum);
                return (
                  <MenuItem key={tierNum} value={tierNum.toString()} sx={{ fontSize: '0.82rem' }}>
                    Tier {tierNum}{tierInfo?.name ? `: ${tierInfo.name}` : ''}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>

          {/* Penanggung Jawab (PJ) */}
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="PJ / PIC"
              value={freelancerFilter}
              onChange={(e) => setFreelancerFilter(e.target.value)}
              slotProps={{
                select: {
                  sx: {
                    borderRadius: 2,
                    fontSize: { xs: '0.72rem', sm: '0.82rem' },
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : '#ffffff',
                    '& .MuiSelect-select': {
                      py: { xs: 0.9, sm: 1.1 },
                      pr: '22px !important',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                },
                inputLabel: {
                  sx: { fontSize: { xs: '0.75rem', sm: '0.85rem' } },
                },
              }}
            >
              <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>Semua PJ / PIC</MenuItem>
              <MenuItem value="UNASSIGNED" sx={{ fontSize: '0.82rem' }}>
                <em>Belum Ditugaskan</em>
              </MenuItem>
              {eligibleFreelancers.map((name) => (
                <MenuItem key={name} value={name} sx={{ fontSize: '0.82rem' }}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Urutkan Berdasarkan */}
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Urutkan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              slotProps={{
                select: {
                  sx: {
                    borderRadius: 2,
                    fontSize: { xs: '0.72rem', sm: '0.82rem' },
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : '#ffffff',
                    '& .MuiSelect-select': {
                      py: { xs: 0.9, sm: 1.1 },
                      pr: '22px !important',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                },
                inputLabel: {
                  sx: { fontSize: { xs: '0.75rem', sm: '0.85rem' } },
                },
              }}
            >
              <MenuItem value="NEWEST" sx={{ fontSize: '0.82rem' }}>Terbaru Ditambahkan</MenuItem>
              <MenuItem value="DEADLINE_ASC" sx={{ fontSize: '0.82rem' }}>Deadline Terdekat</MenuItem>
              <MenuItem value="DEADLINE_DESC" sx={{ fontSize: '0.82rem' }}>Deadline Terjauh</MenuItem>
              <MenuItem value="PROGRESS_DESC" sx={{ fontSize: '0.82rem' }}>Progres Tertinggi</MenuItem>
              <MenuItem value="PROGRESS_ASC" sx={{ fontSize: '0.82rem' }}>Progres Terendah</MenuItem>
              <MenuItem value="BUDGET_DESC" sx={{ fontSize: '0.82rem' }}>Nilai Kontrak Tertinggi</MenuItem>
              <MenuItem value="BUDGET_ASC" sx={{ fontSize: '0.82rem' }}>Nilai Kontrak Terendah</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Row 3: Active Filter Badges */}
        {isFilterActive && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.75, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mr: 0.5, fontSize: '0.72rem' }}>
              Filter Aktif:
            </Typography>

            {searchQuery.trim() && (
              <Chip
                size="small"
                label={`Cari: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontSize: '0.72rem' }}
              />
            )}

            {stageFilter !== 'ALL' && (
              <Chip
                size="small"
                label={`Tahap: ${IPW_STAGES_CONFIG[stageFilter as IPWStage]?.shortName || stageFilter}`}
                onDelete={() => setStageFilter('ALL')}
                color="info"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontSize: '0.72rem' }}
              />
            )}

            {tierFilter !== 'ALL' && (
              <Chip
                size="small"
                label={`Tier ${tierFilter}`}
                onDelete={() => setTierFilter('ALL')}
                color="default"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontSize: '0.72rem' }}
              />
            )}

            {freelancerFilter !== 'ALL' && (
              <Chip
                size="small"
                label={`PJ: ${freelancerFilter === 'UNASSIGNED' ? 'Belum Ada' : freelancerFilter}`}
                onDelete={() => setFreelancerFilter('ALL')}
                color="warning"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontSize: '0.72rem' }}
              />
            )}

            {sortBy !== 'NEWEST' && (
              <Chip
                size="small"
                label={`Urut: ${
                  sortBy === 'DEADLINE_ASC'
                    ? 'Deadline Terdekat'
                    : sortBy === 'DEADLINE_DESC'
                      ? 'Deadline Terjauh'
                      : sortBy === 'PROGRESS_DESC'
                        ? 'Progres Tertinggi'
                        : sortBy === 'PROGRESS_ASC'
                          ? 'Progres Terendah'
                          : sortBy === 'BUDGET_DESC'
                            ? 'Kontrak Tertinggi'
                            : 'Kontrak Terendah'
                }`}
                onDelete={() => setSortBy('NEWEST')}
                color="default"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontSize: '0.72rem' }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Loading Skeleton */}
      {isLoadingData ? (
        <CardSkeletonGrid count={4} xs={12} md={6} />
      ) : (
        <>
          {/* Empty State */}
          {projects.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3.5,
                border: `1px dashed ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
              }}
            >
              <ArchiveIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {isFilterActive ? 'Tidak Ada Proyek yang Cocok' : 'Tidak ada proyek dalam kategori ini'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: isFilterActive ? 2.5 : 0 }}>
                {isFilterActive
                  ? 'Tidak ditemukan proyek yang cocok dengan kata kunci pencarian atau filter yang Anda terapkan.'
                  : filterStatus === 'ARCHIVED'
                    ? 'Belum ada proyek yang diarsipkan.'
                    : filterStatus === 'COMPLETED'
                      ? 'Belum ada proyek yang telah menyelesaikan tahap 6 (100% Closure).'
                      : 'Belum ada proyek terdaftar.'}
              </Typography>
              {isFilterActive && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ResetIcon />}
                  onClick={handleResetFilters}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Reset Semua Filter & Pencarian
                </Button>
              )}
            </Paper>
          )}

          {/* Projects Grid Cards */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                      p: { xs: 1.75, sm: 3 },
                      borderRadius: { xs: 2.5, sm: 3.5 },
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
                      <Box sx={{ pr: 1, flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8, flexWrap: 'wrap' }}>
                          <Chip
                            label={currentStageCfg.shortName}
                            size="small"
                            sx={{
                              backgroundColor: `${currentStageCfg.hexColor}20`,
                              color: currentStageCfg.hexColor,
                              fontWeight: 800,
                              fontSize: { xs: '0.68rem', sm: '0.72rem' },
                              border: `1px solid ${currentStageCfg.hexColor}40`,
                            }}
                          />
                          {proj.isArchived && (
                            <Chip
                              icon={<ArchiveIcon sx={{ fontSize: '12px !important' }} />}
                              label="Diarsipkan"
                              size="small"
                              color="warning"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                          )}
                          {!proj.isArchived && (proj.progress === 100 || proj.status === 'COMPLETED') && (
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                              label="Selesai (Closure)"
                              size="small"
                              color="success"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            ID: #{proj.id.slice(-4)}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.25rem' }, lineHeight: 1.3, wordBreak: 'break-word' }}>
                          {proj.title}
                        </Typography>
                      </Box>

                      {/* CircularProgress Indicator */}
                      <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0, ml: 1 }}>
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

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
                      {proj.description}
                    </Typography>

                    {/* 6 IPW Stages Visual Progress Stepper */}
                    <Box
                      sx={{
                        p: { xs: 1.25, sm: 2 },
                        mb: 2.5,
                        borderRadius: 2.5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 0.3, sm: 0 }, mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: currentStageCfg.hexColor, fontSize: { xs: '0.72rem', sm: '0.75rem' } }}>
                          {currentStageCfg.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.68rem', sm: '0.7rem' } }}>
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
                                  onClick={() => !isReadOnly && handleStageButtonClick(proj.id, stg.stage)}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    cursor: isReadOnly ? 'default' : 'pointer',
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

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.7rem', sm: '0.72rem' } }}>
                        {currentStageCfg.description}
                      </Typography>
                    </Box>

                    {/* Client, Budget & Freelancer Information (Enlarged Layout) */}
                    <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: 2.5 }}>
                      <Grid size={{ xs: 6, sm: 6 }}>
                        <Box
                          sx={{
                            p: { xs: 1.2, sm: 1.5 },
                            borderRadius: 2.5,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            height: '100%',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.68rem', sm: '0.72rem' }, fontWeight: 600 }}>
                            Klien / Perusahaan
                          </Typography>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.88rem' }, mt: 0.3 }}>
                            {proj.clientName}
                          </Typography>
                          {proj.clientPhone && (
                            <Box
                              component="a"
                              href={`https://wa.me/${proj.clientPhone.replace(/\D/g, '').startsWith('0') ? '62' + proj.clientPhone.replace(/\D/g, '').slice(1) : proj.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${proj.clientName}, terkait pengerjaan proyek "${proj.title}" di Atasilabs...`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.3,
                                textDecoration: 'none',
                                color: '#25D366',
                                fontWeight: 700,
                                fontSize: '0.73rem',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 13 }} />
                              {proj.clientPhone}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 6 }}>
                        <Box
                          sx={{
                            p: { xs: 1.2, sm: 1.5 },
                            borderRadius: 2.5,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            height: '100%',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.68rem', sm: '0.72rem' }, fontWeight: 600 }}>
                            Nilai Kontrak Proyek
                          </Typography>
                          <Typography variant="subtitle2" color="primary" noWrap sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.88rem' }, mt: 0.3 }}>
                            {formatRupiah(proj.budget)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={12}>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.2 },
                            px: { xs: 1.2, sm: 1.5 },
                            borderRadius: 2.5,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 1.5 },
                            minWidth: 0,
                          }}
                        >
                          {/* Photo Avatar of PJ */}
                          <Tooltip title={assignedUser ? `Penanggung Jawab: ${assignedUser.name} (${assignedUser.role})` : 'Belum Ada PJ'} arrow placement="top">
                            <Avatar
                              src={assignedUser?.avatarUrl}
                              sx={{
                                width: { xs: 32, sm: 36 },
                                height: { xs: 32, sm: 36 },
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
                            disabled={isReadOnly}
                            value={proj.freelancerName || ''}
                            onChange={(e) => handleFreelancerChangeOnCard(proj.id, e.target.value)}
                            sx={{
                              minWidth: 0,
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                            slotProps={{
                              select: {
                                displayEmpty: true,
                                renderValue: (selected: any) => {
                                  const text = (selected as string) || '-- Pilih PJ / Developer --';
                                  return (
                                    <Box
                                      component="span"
                                      sx={{
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontStyle: selected ? 'normal' : 'italic',
                                      }}
                                    >
                                      {text}
                                    </Box>
                                  );
                                },
                                sx: {
                                  fontSize: { xs: '0.72rem', sm: '0.85rem' },
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  backgroundColor: theme.palette.background.paper,
                                  color: proj.freelancerName ? (theme.palette.mode === 'dark' ? '#fbbf24' : '#b45309') : theme.palette.text.secondary,
                                  '& .MuiSelect-select': {
                                    py: { xs: 0.75, sm: 0.85 },
                                    pl: { xs: 1.2, sm: 1.5 },
                                    pr: '36px !important', // Ruang aman agar teks tidak menabrak panah dropdown
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                  },
                                  '& .MuiSelect-icon': {
                                    right: { xs: '6px', sm: '8px' },
                                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="">
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
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
                                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
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
                            {Boolean(proj.freelancerName) &&
                              !users.some((u) => `${u.name} (${u.role})` === proj.freelancerName || u.name === proj.freelancerName) ? (
                              <MenuItem value={proj.freelancerName}>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                                  {proj.freelancerName}
                                </Typography>
                              </MenuItem>
                            ) : null}
                          </TextField>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 1-Click Stage Switcher Bar */}
                    {!isReadOnly && (
                      <Box sx={{ mb: 2.5, mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1, fontSize: { xs: '0.72rem', sm: '0.75rem' } }}>
                          Pindah Tahap Operasional 6-Stage (1-Click):
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: { xs: 0.6, sm: 0.8 },
                          }}
                        >
                          {IPW_STAGES_LIST.map((stg) => {
                            const isActive = currentStageCfg.stage === stg.stage;
                            return (
                              <Button
                                key={stg.stage}
                                size="small"
                                variant={isActive ? 'contained' : 'outlined'}
                                onClick={() => handleStageButtonClick(proj.id, stg.stage)}
                                sx={{
                                  borderRadius: 1.8,
                                  py: { xs: 0.5, sm: 0.4 },
                                  px: { xs: 0.4, sm: 0.8 },
                                  fontSize: { xs: '0.68rem', sm: '0.75rem', md: '0.7rem' },
                                  width: '100%',
                                  justifyContent: 'center',
                                  textAlign: 'center',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  minWidth: 0,
                                  whiteSpace: 'nowrap',
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
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* Bottom Card Actions */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1, sm: 0 } }}>
                      <Button
                        size="small"
                        startIcon={<DescriptionIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
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
                          fontSize: { xs: '0.75rem', sm: '0.78rem' },
                          textTransform: 'none',
                          color: currentStageCfg.hexColor,
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'space-between', sm: 'center' },
                          py: { xs: 0.6, sm: 0.5 },
                          border: { xs: `1px solid ${currentStageCfg.hexColor}40`, sm: 'none' },
                          borderRadius: { xs: 2, sm: 1 },
                        }}
                      >
                        Buka Dokumen ({currentStageCfg.documentAssigned.split(' ')[0]})
                      </Button>

                      {!isReadOnly && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-start' }, mt: { xs: 0.5, sm: 0 } }}>
                          <Tooltip title={proj.isArchived ? 'Pulihkan dari Arsip' : 'Arsipkan Proyek Selesai'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleArchive(proj)}
                              color={proj.isArchived ? 'warning' : proj.progress === 100 ? 'success' : 'default'}
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1.8,
                                py: { xs: 0.6, sm: 0.5 },
                                flex: { xs: 1, sm: 'none' },
                              }}
                            >
                              {proj.isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small" onClick={() => handleOpenEdit(proj)} color="primary" title="Edit Proyek" sx={{ flex: { xs: 1, sm: 'none' }, border: { xs: `1px solid ${theme.palette.primary.main}40`, sm: 'none' }, borderRadius: 1.8, py: { xs: 0.6, sm: 0.5 } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setProjToDelete(proj.id)} color="error" title="Hapus Proyek" sx={{ flex: { xs: 1, sm: 'none' }, border: { xs: `1px solid ${theme.palette.error.main}40`, sm: 'none' }, borderRadius: 1.8, py: { xs: 0.6, sm: 0.5 } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Add / Edit Project Drawer */}
      <Drawer
        anchor="right"
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 620 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {editingProj ? 'Edit Proyek & Tahap IPW 6-Stage' : 'Tambah Proyek Klien Baru (6-Stage IPW)'}
            </Typography>
            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nomor WhatsApp Klien"
                  placeholder="081234567890"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
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

              {/* Select Tier Paket Proyek */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Pilih Tier Paket Proyek"
                  value={formData.tierNumber || 1}
                  onChange={(e) => {
                    const selTierNum = Number(e.target.value) as 1 | 2 | 3 | 4 | 5;
                    const selTier = pricingTiers.find((t) => t.tierNumber === selTierNum);
                    setFormData((prev) => ({
                      ...prev,
                      tierNumber: selTierNum,
                      budget: selTier ? selTier.price : prev.budget,
                    }));
                  }}
                  helperText="Memilih tier otomatis mengisi harga standar paket"
                >
                  {pricingTiers.map((tier) => (
                    <MenuItem key={tier.id} value={tier.tierNumber}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Tier {tier.tierNumber}: {tier.name}
                        </Typography>
                        <Chip
                          label={formatRupiah(tier.price)}
                          size="small"
                          color={tier.popular ? 'primary' : 'default'}
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, ml: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Nilai Kontrak Proyek (IDR) Input */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  required
                  label="Nilai Kontrak (IDR)"
                  value={formData.budget}
                  onChange={(e) => {
                    const newBudget = Number(e.target.value);
                    const matchedTier = pricingTiers.find((t) => t.price === newBudget);
                    setFormData((prev) => ({
                      ...prev,
                      budget: newBudget,
                      tierNumber: matchedTier ? (matchedTier.tierNumber as 1 | 2 | 3 | 4 | 5) : prev.tierNumber,
                    }));
                  }}
                  helperText={`Nominal Terpakai: ${formatRupiah(formData.budget || 0)}`}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="Nama Freelancer / Mitra Penanggung Jawab"
                  value={formData.freelancerName || ''}
                  onChange={(e) => setFormData({ ...formData, freelancerName: e.target.value })}
                  helperText="Pilih mitra freelancer / developer penanggung jawab proyek dari daftar pengguna"
                >
                  <MenuItem value="">
                    <em>-- Belum Ditugaskan --</em>
                  </MenuItem>
                  {users
                    .filter((u) => u && (u.role === 'FREELANCER' || u.role === 'DEVELOPER' || u.role === 'CTO' || u.role === 'ADMIN'))
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
                  {Boolean(formData.freelancerName) &&
                    !users.some((u) => `${u.name} (${u.role})` === formData.freelancerName || u.name === formData.freelancerName) ? (
                    <MenuItem value={formData.freelancerName}>
                      {formData.freelancerName}
                    </MenuItem>
                  ) : null}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 }, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'flex-end', gap: 1.5, bgcolor: theme.palette.background.paper }}>
            <Button onClick={() => setIsDialogOpen(false)} color="inherit" sx={{ fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: { xs: 0.8, sm: 0.6 },
                fontWeight: 700,
                width: { xs: '100%', sm: 'auto' },
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
              }}
            >
              {editingProj ? 'Simpan Perubahan' : 'Tambah Proyek'}
            </Button>
          </Box>
        </Box>
      </Drawer>

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
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setProjToDelete(null)} color="inherit" sx={{ fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}>
            Hapus Proyek
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
