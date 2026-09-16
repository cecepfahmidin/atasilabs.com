'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Calculate as CalcIcon,
  MonetizationOn as MoneyIcon,
  PieChart as PieIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  RestartAlt as ResetIcon,
  Tune as TuneIcon,
  Percent as PercentIcon,
  AttachMoney as DollarIcon,
  Link as LinkIcon,
  Launch as LaunchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Sync as SyncIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { INITIAL_HPP_MATRIX } from '../../data/initialDocuments';
import { HPPItem } from '../../types';
import { useApp } from '../../context/AppContext';

export interface DynamicAllocationItem {
  id: string;
  label: string;
  percent: number;
  nominal: number;
  color: string;
}

const LOCAL_STORAGE_KEY_HPP = 'atasilabs_hpp_matrix_custom';
const LOCAL_STORAGE_KEY_ALLOCATIONS = 'atasilabs_profit_allocations_custom';

const DEFAULT_ALLOCATION_POINTS: DynamicAllocationItem[] = [
  { id: 'alloc-1', label: 'Pemasaran / CMO', percent: 17.5, nominal: 2450000, color: '#3b82f6' },
  { id: 'alloc-2', label: 'Operasional Kantor', percent: 5.0, nominal: 700000, color: '#10b981' },
  { id: 'alloc-3', label: 'Pengembangan Usaha', percent: 10.0, nominal: 1400000, color: '#f59e0b' },
  { id: 'alloc-4', label: 'Dana Mitigasi/Taktis', percent: 5.0, nominal: 700000, color: '#8b5cf6' },
  { id: 'alloc-5', label: 'Zakat / Sosial', percent: 2.5, nominal: 350000, color: '#ec4899' },
];

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#6366f1', '#ef4444', '#14b8a6', '#f97316', '#84cc16',
  '#06b6d4', '#d97706', '#059669', '#2563eb', '#db2777'
];

export const HPPCalculatorView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { pricingTiers, updatePricingTier, setDashboardTab, showNotification } = useApp();

  // Custom Editable HPP Items state with LocalStorage persistence
  const [customHppMatrix, setCustomHppMatrix] = useState<HPPItem[]>(INITIAL_HPP_MATRIX);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HPP);
      if (saved) {
        setCustomHppMatrix(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Create dynamic HPP matrix synchronized with live Pricelist & user edits
  const activeHppMatrix: HPPItem[] = customHppMatrix.map((baseTier) => {
    const linkedPricingTier = pricingTiers.find((pt) => pt.tierNumber === baseTier.tierNumber);
    const livePrice = linkedPricingTier ? linkedPricingTier.price : baseTier.sellingPrice;
    const computedTotalHPP =
      Number(baseTier.developerFee || 0) +
      Number(baseTier.domainHostingFee || 0) +
      Number(baseTier.qaDeploymentFee || 0);
    const liveGrossProfit = Math.max(0, livePrice - computedTotalHPP);
    const liveGrossMarginPercent = livePrice > 0 ? Number(((liveGrossProfit / livePrice) * 100).toFixed(1)) : 0;

    return {
      ...baseTier,
      sellingPrice: livePrice,
      totalHPP: computedTotalHPP,
      grossProfit: liveGrossProfit,
      grossProfitPercent: liveGrossMarginPercent,
    };
  });

  const [selectedTierNumber, setSelectedTierNumber] = useState<number>(3);
  const [customPriceInput, setCustomPriceInput] = useState<number>(18500000);
  const [customHppInput, setCustomHppInput] = useState<number | null>(null);

  // Modal Dialog Edit State
  const [editingTier, setEditingTier] = useState<HPPItem | null>(null);
  const [editForm, setEditForm] = useState({
    sellingPrice: 0,
    developerFee: 0,
    developerRole: '',
    domainHostingFee: 0,
    domainHostingSpec: '',
    qaDeploymentFee: 0,
    workingDays: '',
  });

  // Sync customPriceInput when selected tier changes or pricingTiers update
  useEffect(() => {
    const activeTier = activeHppMatrix.find((t) => t.tierNumber === selectedTierNumber);
    if (activeTier) {
      setCustomPriceInput(activeTier.sellingPrice);
    }
  }, [selectedTierNumber, pricingTiers, customHppMatrix]);

  // Allocation calculation mode: 'percent' or 'nominal'
  const [allocationMode, setAllocationMode] = useState<'percent' | 'nominal'>('percent');

  // Dynamic Profit Allocation Points with LocalStorage persistence
  const [allocationPoints, setAllocationPoints] = useState<DynamicAllocationItem[]>(DEFAULT_ALLOCATION_POINTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ALLOCATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllocationPoints(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveAllocationsToStorage = (updated: DynamicAllocationItem[]) => {
    setAllocationPoints(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ALLOCATIONS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Active HPP calculation
  const selectedTierHPP = activeHppMatrix.find((item) => item.tierNumber === selectedTierNumber) || activeHppMatrix[2];
  const activeHppValue = customHppInput !== null ? customHppInput : selectedTierHPP.totalHPP;

  const simulatedGrossProfit = Math.max(0, customPriceInput - activeHppValue);
  const simulatedGrossMargin = customPriceInput > 0 ? ((simulatedGrossProfit / customPriceInput) * 100).toFixed(1) : '0';

  // Compute actual allocations dynamically based on mode and simulated gross profit
  const computedAllocations = allocationPoints.map((item) => {
    let percent = item.percent;
    let nominal = item.nominal;

    if (allocationMode === 'percent') {
      nominal = Math.round(simulatedGrossProfit * (percent / 100));
    } else {
      percent = simulatedGrossProfit > 0 ? Number(((nominal / simulatedGrossProfit) * 100).toFixed(2)) : 0;
    }

    return {
      ...item,
      percent,
      nominal,
    };
  });

  const totalAllocatedNominal = computedAllocations.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalAllocatedPercent = computedAllocations.reduce((acc, curr) => acc + curr.percent, 0);
  const netRetainedProfit = Math.max(0, simulatedGrossProfit - totalAllocatedNominal);
  const netRetainedProfitPercent = simulatedGrossProfit > 0 ? Number(((netRetainedProfit / simulatedGrossProfit) * 100).toFixed(1)) : 0;

  // Add a new profit allocation point
  const handleAddAllocationPoint = () => {
    const newId = `alloc-${Date.now()}`;
    const nextColor = PRESET_COLORS[allocationPoints.length % PRESET_COLORS.length];
    const newPoint: DynamicAllocationItem = {
      id: newId,
      label: 'Point Alokasi Baru',
      percent: 5.0,
      nominal: Math.round(simulatedGrossProfit * 0.05),
      color: nextColor,
    };
    const updated = [...allocationPoints, newPoint];
    saveAllocationsToStorage(updated);
    showNotification('Point alokasi profit baru berhasil ditambahkan.', 'success');
  };

  // Delete a profit allocation point
  const handleDeleteAllocationPoint = (id: string) => {
    if (allocationPoints.length <= 1) {
      showNotification('Minimal harus ada 1 point alokasi profit.', 'warning');
      return;
    }
    const updated = allocationPoints.filter((p) => p.id !== id);
    saveAllocationsToStorage(updated);
    showNotification('Point alokasi profit berhasil dihapus.', 'info');
  };

  // Update allocation point label
  const handleUpdatePointLabel = (id: string, label: string) => {
    const updated = allocationPoints.map((p) => (p.id === id ? { ...p, label } : p));
    saveAllocationsToStorage(updated);
  };

  // Update allocation point percent
  const handleUpdatePointPercent = (id: string, percent: number) => {
    const updated = allocationPoints.map((p) => {
      if (p.id === id) {
        const nominal = Math.round(simulatedGrossProfit * (percent / 100));
        return { ...p, percent, nominal };
      }
      return p;
    });
    saveAllocationsToStorage(updated);
  };

  // Update allocation point nominal
  const handleUpdatePointNominal = (id: string, nominal: number) => {
    const updated = allocationPoints.map((p) => {
      if (p.id === id) {
        const percent = simulatedGrossProfit > 0 ? Number(((nominal / simulatedGrossProfit) * 100).toFixed(2)) : 0;
        return { ...p, nominal, percent };
      }
      return p;
    });
    saveAllocationsToStorage(updated);
  };

  // Update allocation point color
  const handleUpdatePointColor = (id: string, color: string) => {
    const updated = allocationPoints.map((p) => (p.id === id ? { ...p, color } : p));
    saveAllocationsToStorage(updated);
  };

  // Handle Mode Change & sync computed values
  const handleModeChange = (_: any, newMode: 'percent' | 'nominal' | null) => {
    if (!newMode) return;
    const updated = allocationPoints.map((p) => {
      if (newMode === 'nominal') {
        const nominal = Math.round(simulatedGrossProfit * (p.percent / 100));
        return { ...p, nominal };
      } else {
        const percent = simulatedGrossProfit > 0 ? Number(((p.nominal / simulatedGrossProfit) * 100).toFixed(2)) : 0;
        return { ...p, percent };
      }
    });
    saveAllocationsToStorage(updated);
    setAllocationMode(newMode);
  };

  // Reset to Default SOP
  const handleResetToDefaultSOP = () => {
    setAllocationMode('percent');
    const resetted = DEFAULT_ALLOCATION_POINTS.map((p) => ({
      ...p,
      nominal: Math.round(simulatedGrossProfit * (p.percent / 100)),
    }));
    saveAllocationsToStorage(resetted);
    showNotification('Point alokasi dikembalikan ke standar persentase SOP Atasilabs.', 'info');
  };

  const handleNavigateToPricing = () => {
    setDashboardTab('pricing');
    router.push('/dashboard/pricing');
  };

  // Edit HPP Tier Open
  const handleOpenEditDialog = (tier: HPPItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setEditingTier(tier);
    setEditForm({
      sellingPrice: tier.sellingPrice,
      developerFee: tier.developerFee,
      developerRole: tier.developerRole,
      domainHostingFee: tier.domainHostingFee,
      domainHostingSpec: tier.domainHostingSpec,
      qaDeploymentFee: tier.qaDeploymentFee,
      workingDays: tier.workingDays,
    });
  };

  // Save Edit HPP Tier (Updates local HPP matrix AND Master Pricelist in AppContext!)
  const handleSaveHPPItem = async () => {
    if (!editingTier) return;

    const updatedMatrix = customHppMatrix.map((t) => {
      if (t.tierNumber === editingTier.tierNumber) {
        const totalHPP = editForm.developerFee + editForm.domainHostingFee + editForm.qaDeploymentFee;
        const grossProfit = Math.max(0, editForm.sellingPrice - totalHPP);
        const grossProfitPercent = editForm.sellingPrice > 0 ? Number(((grossProfit / editForm.sellingPrice) * 100).toFixed(1)) : 0;
        return {
          ...t,
          sellingPrice: editForm.sellingPrice,
          developerFee: editForm.developerFee,
          developerRole: editForm.developerRole,
          domainHostingFee: editForm.domainHostingFee,
          domainHostingSpec: editForm.domainHostingSpec,
          qaDeploymentFee: editForm.qaDeploymentFee,
          workingDays: editForm.workingDays,
          totalHPP,
          grossProfit,
          grossProfitPercent,
        };
      }
      return t;
    });

    setCustomHppMatrix(updatedMatrix);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HPP, JSON.stringify(updatedMatrix));
    } catch (e) {
      console.error(e);
    }

    // Sync Pricelist in AppContext
    const matchingPt = pricingTiers.find((pt) => pt.tierNumber === editingTier.tierNumber);
    if (matchingPt) {
      await updatePricingTier(matchingPt.id, { price: editForm.sellingPrice });
    }

    if (selectedTierNumber === editingTier.tierNumber) {
      setCustomPriceInput(editForm.sellingPrice);
    }

    setEditingTier(null);
    showNotification(`HPP & Harga Jual Pricelist (${editingTier.tierName}) berhasil diperbarui!`, 'success');
  };

  // Quick Sync current simulator custom price to Pricelist
  const handleSyncSimulatorPriceToPricelist = async () => {
    const matchingPt = pricingTiers.find((pt) => pt.tierNumber === selectedTierNumber);
    if (matchingPt) {
      await updatePricingTier(matchingPt.id, { price: customPriceInput });
      showNotification(`Harga Jual Pricelist (${matchingPt.name}) diperbarui menjadi Rp ${customPriceInput.toLocaleString('id-ID')}`, 'success');
    }
  };

  // Reset HPP Matrix to default
  const handleResetHppMatrix = () => {
    setCustomHppMatrix(INITIAL_HPP_MATRIX);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_HPP);
    } catch (e) {
      console.error(e);
    }
    showNotification('Matriks HPP telah dikembalikan ke standar awal.', 'info');
  };

  const dialogCalculatedTotalHPP = editForm.developerFee + editForm.domainHostingFee + editForm.qaDeploymentFee;
  const dialogCalculatedGrossProfit = Math.max(0, editForm.sellingPrice - dialogCalculatedTotalHPP);
  const dialogCalculatedMargin = editForm.sellingPrice > 0 ? ((dialogCalculatedGrossProfit / editForm.sellingPrice) * 100).toFixed(1) : '0';

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalcIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Kalkulator HPP & Financial Matrix
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Matriks Standar HPP per Klaster di bagian atas dan simulasi kalkulasi interaktif di bagian bawah. Mengubah Harga Jual pada matriks akan otomatis memperbarui Pricelist.
          </Typography>
        </Box>

        {/* Link to Pricelist Banner */}
        <Chip
          icon={<LinkIcon sx={{ fontSize: '16px !important' }} />}
          label="Tersinkronasi Dua Arah dengan Master Pricelist"
          color="primary"
          variant="outlined"
          onClick={handleNavigateToPricing}
          onDelete={handleNavigateToPricing}
          deleteIcon={<LaunchIcon sx={{ fontSize: '14px !important' }} />}
          sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            py: 2,
            px: 1,
            borderRadius: 2,
            borderColor: theme.palette.primary.main,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.08)' },
          }}
        />
      </Box>

      {/* TOP SECTION: Matriks Standar HPP per Klaster */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalcIcon color="primary" /> Matriks Standar HPP per Klaster
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<ResetIcon fontSize="small" />}
              onClick={handleResetHppMatrix}
              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              Reset Matriks
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<LaunchIcon fontSize="small" />}
              onClick={handleNavigateToPricing}
              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              Lihat Pricelist
            </Button>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Klik baris klaster untuk memuat ke simulasi. Klik ikon pensil untuk merubah komponen HPP maupun <strong>Harga Jual</strong> (Pricelist otomatis ter-update).
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Klaster / Tier</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Upah Dev</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Server/Hosting</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>QA/Deploy</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Total HPP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Harga Jual (Pricelist)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Aksi Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeHppMatrix.map((tier) => {
                const isSelected = tier.tierNumber === selectedTierNumber && customHppInput === null;
                return (
                  <TableRow
                    key={tier.tierNumber}
                    hover
                    selected={isSelected}
                    onClick={() => {
                      setSelectedTierNumber(tier.tierNumber);
                      setCustomHppInput(null);
                    }}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(59, 130, 246, 0.15) !important'
                          : 'rgba(59, 130, 246, 0.08) !important'
                        : 'inherit',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isSelected && <Chip label="Aktif di Simulasi" size="small" color="primary" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />}
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {tier.tierName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" display="block" color="text.secondary">{tier.pageRange}</Typography>
                    </TableCell>
                    <TableCell>
                      Rp {tier.developerFee.toLocaleString('id-ID')}
                      <Typography variant="caption" display="block" color="text.secondary">{tier.developerRole}</Typography>
                    </TableCell>
                    <TableCell>
                      Rp {tier.domainHostingFee.toLocaleString('id-ID')}
                      <Typography variant="caption" display="block" color="text.secondary">{tier.domainHostingSpec}</Typography>
                    </TableCell>
                    <TableCell>Rp {tier.qaDeploymentFee.toLocaleString('id-ID')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>
                      Rp {tier.totalHPP.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                      Rp {tier.sellingPrice.toLocaleString('id-ID')}
                      <Chip label="Pricelist Sync" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Komponen HPP & Harga Jual Tier Ini">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => handleOpenEditDialog(tier, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Memperbarui <strong>Harga Jual</strong> pada tabel Matriks HPP di atas akan secara otomatis memperbarui nominal paket harga di modul <strong>Pricelist (`/dashboard/pricing`)</strong>.
          </Typography>
        </Alert>
      </Paper>

      {/* BOTTOM SECTION: Simulasi Kalkulasi HPP & Profit / Allocations */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon color="primary" /> Simulasi Kalkulasi HPP & Profit (Terpilih: {selectedTierHPP.tierName})
        </Typography>

        <Grid container spacing={3}>
          {/* Inputs Section */}
          <Grid item xs={12} md={6}>
            {/* Tier Selection Dropdown */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Pilih Klaster / Tier Proyek:
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<LaunchIcon sx={{ fontSize: 12 }} />}
                  onClick={handleNavigateToPricing}
                  sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', py: 0 }}
                >
                  Edit Pricelist
                </Button>
              </Box>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedTierNumber}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setSelectedTierNumber(num);
                  setCustomHppInput(null);
                }}
              >
                {activeHppMatrix.map((item) => (
                  <MenuItem key={item.tierNumber} value={item.tierNumber}>
                    {item.tierName} — Rp {item.sellingPrice.toLocaleString('id-ID')} (HPP: Rp {item.totalHPP.toLocaleString('id-ID')})
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Input Harga Jual & Custom HPP */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Harga Jual (IDR):
                  </Typography>
                  {customPriceInput !== selectedTierHPP.sellingPrice && (
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      startIcon={<SyncIcon sx={{ fontSize: 12 }} />}
                      onClick={handleSyncSimulatorPriceToPricelist}
                      sx={{ fontSize: '0.68rem', fontWeight: 700, py: 0, textTransform: 'none' }}
                    >
                      Sync ke Pricelist
                    </Button>
                  )}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(Number(e.target.value))}
                  helperText={`Standar Pricelist: Rp ${selectedTierHPP.sellingPrice.toLocaleString('id-ID')}`}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Total HPP Proyek (IDR):
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={activeHppValue}
                  onChange={(e) => setCustomHppInput(Number(e.target.value))}
                  helperText={customHppInput !== null ? 'Kustom HPP aktif' : `HPP Standar: Rp ${selectedTierHPP.totalHPP.toLocaleString('id-ID')}`}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            {/* Summary Cards */}
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                p: 2.5,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total HPP Proyek:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>
                    Rp {activeHppValue.toLocaleString('id-ID')}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Estimasi Laba Kotor:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                    Rp {simulatedGrossProfit.toLocaleString('id-ID')}
                  </Typography>
                  <Chip
                    label={`${simulatedGrossMargin}% Margin`}
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.68rem', fontWeight: 800, mt: 0.2 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Allocation Breakdown Section */}
          <Grid item xs={12} md={6}>
            {/* Dynamic Allocation Header & Mode Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Pembagian Alokasi Laba Kotor:
                </Typography>
                <Chip label={`${allocationPoints.length} Point`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ToggleButtonGroup
                  value={allocationMode}
                  exclusive
                  onChange={handleModeChange}
                  size="small"
                  sx={{ height: 28 }}
                >
                  <ToggleButton value="percent" sx={{ px: 1.2, py: 0, fontSize: '0.72rem', fontWeight: 700 }}>
                    <PercentIcon sx={{ fontSize: 14, mr: 0.5 }} /> Persentase (%)
                  </ToggleButton>
                  <ToggleButton value="nominal" sx={{ px: 1.2, py: 0, fontSize: '0.72rem', fontWeight: 700 }}>
                    <DollarIcon sx={{ fontSize: 14, mr: 0.5 }} /> Nominal (Rp)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Dynamic Inputs List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {computedAllocations.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: 1,
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Color Picker Indicator */}
                  <Tooltip title="Klik untuk ubah warna point">
                    <Box
                      component="label"
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        cursor: 'pointer',
                        display: 'inline-block',
                        flexShrink: 0,
                        border: '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                        position: 'relative',
                        '&:hover': { transform: 'scale(1.15)', transition: 'transform 0.15s' },
                      }}
                    >
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => handleUpdatePointColor(item.id, e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, cursor: 'pointer' }}
                      />
                    </Box>
                  </Tooltip>

                  {/* Editable Label Input */}
                  <TextField
                    size="small"
                    value={item.label}
                    onChange={(e) => handleUpdatePointLabel(item.id, e.target.value)}
                    placeholder="Nama Point Alokasi"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      flexGrow: 1,
                      minWidth: 120,
                      '& input': {
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        py: 0.3,
                        px: 0.8,
                        borderRadius: 1,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        '&:focus': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                      },
                    }}
                  />

                  {/* Dynamic Editable Value Input (% or Rp) based on Mode */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {allocationMode === 'percent' ? (
                      <TextField
                        size="small"
                        type="number"
                        value={item.percent}
                        onChange={(e) => handleUpdatePointPercent(item.id, Number(e.target.value))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ width: 90, '& input': { py: 0.5, px: 1, fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={item.nominal}
                        onChange={(e) => handleUpdatePointNominal(item.id, Number(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                        }}
                        sx={{ width: 130, '& input': { py: 0.5, px: 1, fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    )}

                    {/* Calculated Opposite Output Display */}
                    <Box sx={{ textAlign: 'right', minWidth: 95 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.8rem' }}>
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                        ({item.percent.toFixed(1)}%)
                      </Typography>
                    </Box>

                    {/* Delete Icon Button */}
                    <Tooltip title="Hapus Point Alokasi Ini">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAllocationPoint(item.id)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Add New Point Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddAllocationPoint}
                sx={{ fontSize: '0.75rem', fontWeight: 700, borderRadius: 2 }}
              >
                Tambah Point Alokasi Profit
              </Button>

              <Button
                size="small"
                variant="text"
                startIcon={<ResetIcon />}
                onClick={handleResetToDefaultSOP}
                sx={{ fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary' }}
              >
                Reset ke SOP Standard
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit HPP Component Dialog */}
      <Dialog
        open={Boolean(editingTier)}
        onClose={() => setEditingTier(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" /> Edit Komponen HPP & Harga Jual — {editingTier?.tierName}
          </Box>
          <IconButton size="small" onClick={() => setEditingTier(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2.5 }}>
          <Grid container spacing={2}>
            {/* Harga Jual Pricelist */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                Harga Jual Paket ke Klien (Update Pricelist):
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={editForm.sellingPrice}
                onChange={(e) => setEditForm({ ...editForm, sellingPrice: Number(e.target.value) })}
                helperText="Menyimpan nilai ini akan otomatis memperbarui Master Pricelist"
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
            </Grid>

            {/* Working Days */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Estimasi Waktu Pengerjaan:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.workingDays}
                onChange={(e) => setEditForm({ ...editForm, workingDays: e.target.value })}
                placeholder="Contoh: 7 Hari Kerja"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 1 }}>
                Rincian Biaya HPP (Harga Pokok Penjualan):
              </Typography>
            </Grid>

            {/* Upah Developer */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Upah Developer / Partner (IDR):
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={editForm.developerFee}
                onChange={(e) => setEditForm({ ...editForm, developerFee: Number(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Role / Keterangan Developer:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.developerRole}
                onChange={(e) => setEditForm({ ...editForm, developerRole: e.target.value })}
                placeholder="Contoh: 1 Mid-Level Dev (CMS & RBAC)"
              />
            </Grid>

            {/* Server / Hosting */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Biaya Server & Domain (IDR):
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={editForm.domainHostingFee}
                onChange={(e) => setEditForm({ ...editForm, domainHostingFee: Number(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Spesifikasi Hosting & Domain:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.domainHostingSpec}
                onChange={(e) => setEditForm({ ...editForm, domainHostingSpec: e.target.value })}
                placeholder="Contoh: Domain + VPS Cloud Server"
              />
            </Grid>

            {/* QA & Deployment */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Biaya QA & Deployment (IDR):
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={editForm.qaDeploymentFee}
                onChange={(e) => setEditForm({ ...editForm, qaDeploymentFee: Number(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
              />
            </Grid>
          </Grid>

          {/* Realtime Dialog Calculation Card */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${theme.palette.primary.main}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Total HPP Baru:</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'error.main' }}>
                  Rp {dialogCalculatedTotalHPP.toLocaleString('id-ID')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Harga Jual Baru:</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                  Rp {editForm.sellingPrice.toLocaleString('id-ID')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Estimasi Laba Kotor:</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'info.main' }}>
                  Rp {dialogCalculatedGrossProfit.toLocaleString('id-ID')} ({dialogCalculatedMargin}%)
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditingTier(null)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveHPPItem}
            sx={{ fontWeight: 700 }}
          >
            Simpan Perubahan HPP & Update Pricelist
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
