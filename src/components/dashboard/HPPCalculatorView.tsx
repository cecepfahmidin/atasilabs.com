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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { INITIAL_HPP_MATRIX } from '../../data/initialDocuments';
import { HPPItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface AllocationItem {
  key: string;
  label: string;
  percent: number;
  nominal: number;
  color: string;
}

const DEFAULT_SOP_PERCENTAGES = {
  marketing: 17.5,
  operational: 5.0,
  businessDev: 10.0,
  mitigation: 5.0,
  zakat: 2.5,
};

const LOCAL_STORAGE_KEY_HPP = 'atasilabs_hpp_matrix_custom';

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

  // Allocation state (% or Rp values)
  const [percentages, setPercentages] = useState(DEFAULT_SOP_PERCENTAGES);
  const [nominals, setNominals] = useState({
    marketing: 2450000,
    operational: 700000,
    businessDev: 1400000,
    mitigation: 700000,
    zakat: 350000,
  });

  // Active HPP calculation
  const selectedTierHPP = activeHppMatrix.find((item) => item.tierNumber === selectedTierNumber) || activeHppMatrix[2];
  const activeHppValue = customHppInput !== null ? customHppInput : selectedTierHPP.totalHPP;

  const simulatedGrossProfit = Math.max(0, customPriceInput - activeHppValue);
  const simulatedGrossMargin = customPriceInput > 0 ? ((simulatedGrossProfit / customPriceInput) * 100).toFixed(1) : '0';

  // Compute actual allocations based on mode
  const computedAllocations: AllocationItem[] = [
    {
      key: 'marketing',
      label: 'Pemasaran / CMO',
      percent: allocationMode === 'percent'
        ? percentages.marketing
        : (simulatedGrossProfit > 0 ? Number(((nominals.marketing / simulatedGrossProfit) * 100).toFixed(2)) : 0),
      nominal: allocationMode === 'percent'
        ? Math.round(simulatedGrossProfit * (percentages.marketing / 100))
        : nominals.marketing,
      color: '#3b82f6',
    },
    {
      key: 'operational',
      label: 'Operasional Kantor',
      percent: allocationMode === 'percent'
        ? percentages.operational
        : (simulatedGrossProfit > 0 ? Number(((nominals.operational / simulatedGrossProfit) * 100).toFixed(2)) : 0),
      nominal: allocationMode === 'percent'
        ? Math.round(simulatedGrossProfit * (percentages.operational / 100))
        : nominals.operational,
      color: '#10b981',
    },
    {
      key: 'businessDev',
      label: 'Pengembangan Usaha',
      percent: allocationMode === 'percent'
        ? percentages.businessDev
        : (simulatedGrossProfit > 0 ? Number(((nominals.businessDev / simulatedGrossProfit) * 100).toFixed(2)) : 0),
      nominal: allocationMode === 'percent'
        ? Math.round(simulatedGrossProfit * (percentages.businessDev / 100))
        : nominals.businessDev,
      color: '#f59e0b',
    },
    {
      key: 'mitigation',
      label: 'Dana Mitigasi/Taktis',
      percent: allocationMode === 'percent'
        ? percentages.mitigation
        : (simulatedGrossProfit > 0 ? Number(((nominals.mitigation / simulatedGrossProfit) * 100).toFixed(2)) : 0),
      nominal: allocationMode === 'percent'
        ? Math.round(simulatedGrossProfit * (percentages.mitigation / 100))
        : nominals.mitigation,
      color: '#8b5cf6',
    },
    {
      key: 'zakat',
      label: 'Zakat / Sosial',
      percent: allocationMode === 'percent'
        ? percentages.zakat
        : (simulatedGrossProfit > 0 ? Number(((nominals.zakat / simulatedGrossProfit) * 100).toFixed(2)) : 0),
      nominal: allocationMode === 'percent'
        ? Math.round(simulatedGrossProfit * (percentages.zakat / 100))
        : nominals.zakat,
      color: '#ec4899',
    },
  ];

  const totalAllocatedNominal = computedAllocations.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalAllocatedPercent = computedAllocations.reduce((acc, curr) => acc + curr.percent, 0);
  const netRetainedProfit = Math.max(0, simulatedGrossProfit - totalAllocatedNominal);
  const netRetainedProfitPercent = simulatedGrossProfit > 0 ? Number(((netRetainedProfit / simulatedGrossProfit) * 100).toFixed(1)) : 0;

  // Handle Mode Change & sync computed values
  const handleModeChange = (_: any, newMode: 'percent' | 'nominal' | null) => {
    if (!newMode) return;
    if (newMode === 'nominal') {
      const syncedNominals = {
        marketing: Math.round(simulatedGrossProfit * (percentages.marketing / 100)),
        operational: Math.round(simulatedGrossProfit * (percentages.operational / 100)),
        businessDev: Math.round(simulatedGrossProfit * (percentages.businessDev / 100)),
        mitigation: Math.round(simulatedGrossProfit * (percentages.mitigation / 100)),
        zakat: Math.round(simulatedGrossProfit * (percentages.zakat / 100)),
      };
      setNominals(syncedNominals);
    } else {
      if (simulatedGrossProfit > 0) {
        setPercentages({
          marketing: Number(((nominals.marketing / simulatedGrossProfit) * 100).toFixed(2)),
          operational: Number(((nominals.operational / simulatedGrossProfit) * 100).toFixed(2)),
          businessDev: Number(((nominals.businessDev / simulatedGrossProfit) * 100).toFixed(2)),
          mitigation: Number(((nominals.mitigation / simulatedGrossProfit) * 100).toFixed(2)),
          zakat: Number(((nominals.zakat / simulatedGrossProfit) * 100).toFixed(2)),
        });
      }
    }
    setAllocationMode(newMode);
  };

  // Reset to SOP Default
  const handleResetToDefaultSOP = () => {
    setAllocationMode('percent');
    setPercentages(DEFAULT_SOP_PERCENTAGES);
    const defaultNominals = {
      marketing: Math.round(simulatedGrossProfit * (DEFAULT_SOP_PERCENTAGES.marketing / 100)),
      operational: Math.round(simulatedGrossProfit * (DEFAULT_SOP_PERCENTAGES.operational / 100)),
      businessDev: Math.round(simulatedGrossProfit * (DEFAULT_SOP_PERCENTAGES.businessDev / 100)),
      mitigation: Math.round(simulatedGrossProfit * (DEFAULT_SOP_PERCENTAGES.mitigation / 100)),
      zakat: Math.round(simulatedGrossProfit * (DEFAULT_SOP_PERCENTAGES.zakat / 100)),
    };
    setNominals(defaultNominals);
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Pembagian Alokasi Laba Kotor:
                </Typography>
              </Box>

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

            {/* Dynamic Inputs List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
              {computedAllocations.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: 1.5,
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {item.label}
                    </Typography>
                  </Box>

                  {/* Dynamic Editable Input based on Mode */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
                    {allocationMode === 'percent' ? (
                      <TextField
                        size="small"
                        type="number"
                        value={percentages[item.key as keyof typeof percentages]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPercentages((prev) => ({ ...prev, [item.key]: val }));
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ width: 95, '& input': { py: 0.5, px: 1, fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={nominals[item.key as keyof typeof nominals]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNominals((prev) => ({ ...prev, [item.key]: val }));
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                        }}
                        sx={{ width: 135, '& input': { py: 0.5, px: 1, fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    )}

                    {/* Calculated Output Display */}
                    <Box sx={{ textAlign: 'right', minWidth: 105 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.82rem' }}>
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        ({item.percent.toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Total Allocation & Retained Profit Summary */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total Alokasi Ditentukan:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Rp {totalAllocatedNominal.toLocaleString('id-ID')} ({totalAllocatedPercent.toFixed(1)}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, totalAllocatedPercent)}
                sx={{ height: 6, borderRadius: 3, mb: 1.5, bgcolor: theme.palette.divider }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Sisa Laba Bersih Ditahan (Atasilabs):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                  Rp {netRetainedProfit.toLocaleString('id-ID')} ({netRetainedProfitPercent.toFixed(1)}%)
                </Typography>
              </Box>
            </Paper>

            {/* Reset SOP Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
              <Button
                size="small"
                variant="text"
                startIcon={<ResetIcon />}
                onClick={handleResetToDefaultSOP}
                sx={{ fontSize: '0.75rem', textTransform: 'none', color: 'text.secondary' }}
              >
                Reset ke Standar Persentase SOP Atasilabs (17.5%, 5%, 10%, 5%, 2.5%)
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
