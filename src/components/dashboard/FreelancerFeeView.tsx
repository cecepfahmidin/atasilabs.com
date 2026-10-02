'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Alert,
  Stack,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Payments as PaymentsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Calculate as CalculateIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  HourglassTop as PendingIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { getFreelancerFeeForTier } from '../../lib/pricingUtils';
import { ProjectPaymentRecord } from '../../types';

export const FreelancerFeeView: React.FC = () => {
  const theme = useTheme();
  const { projects, currentUser, updateProject, showNotification } = useApp();

  const isFreelancerRole = currentUser?.role === 'FREELANCER' || currentUser?.role === 'DEVELOPER';
  const canRecordPayment = !isFreelancerRole; // CEO, CTO, ADMIN can record payments to freelancer

  // Filter assigned projects
  const assignedProjects = useMemo(() => {
    if (!currentUser) return [];
    if (!isFreelancerRole) return projects; // Management views all projects

    const nameLower = currentUser.name?.toLowerCase() || '';

    return projects.filter((p) => {
      if (!p.freelancerName) return false;
      const fnLower = p.freelancerName.toLowerCase();
      return (
        (nameLower && fnLower.includes(nameLower)) ||
        (p.freelancerId && p.freelancerId === currentUser.id) ||
        fnLower.includes('rian') ||
        fnLower.includes('freelancer')
      );
    });
  }, [projects, currentUser, isFreelancerRole]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  // State for expanded project payment history
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // State for Payment Dialog Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payTargetProjectId, setPayTargetProjectId] = useState<string>('');
  const [payFormData, setPayFormData] = useState({
    amount: '',
    stage: 'DP 40% SPK Signed',
    notes: '',
    status: 'VERIFIED' as 'VERIFIED' | 'PENDING',
    proofUrl: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Calculate Fee & Payment KPI Metrics
  const feeMetrics = useMemo(() => {
    let grandTotalFee = 0;
    let grandTotalPaid = 0;
    let grandRemainingBalance = 0;
    let grandHarusDibayarNow = 0;

    const list = assignedProjects.map((proj) => {
      const tierKey = proj.tierNumber || 3;
      const totalFee = proj.freelancerFee && proj.freelancerFee > 0 ? proj.freelancerFee : getFreelancerFeeForTier(tierKey);

      // Compute total payments recorded for this freelancer
      const verifiedPayments = (proj.freelancerPayments || []).filter((p) => p.status === 'VERIFIED');
      const alreadyPaid = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) || proj.freelancerTotalPaid || 0;

      const remainingBalance = Math.max(0, totalFee - alreadyPaid);

      // Calculate "Harus Dibayar Sekarang" based on SOP stage & progress
      let requiredTarget = 0;
      if (proj.progress === 100 || proj.status === 'COMPLETED') {
        requiredTarget = totalFee; // 100% full fee due
      } else if (proj.progress > 0 || proj.status === 'IN_PROGRESS') {
        requiredTarget = Math.round(totalFee * 0.4); // 40% DP due
      }

      const harusDibayarNow = Math.max(0, Math.min(remainingBalance, requiredTarget - alreadyPaid));

      grandTotalFee += totalFee;
      grandTotalPaid += alreadyPaid;
      grandRemainingBalance += remainingBalance;
      grandHarusDibayarNow += harusDibayarNow;

      return {
        ...proj,
        totalFee,
        alreadyPaid,
        remainingBalance,
        harusDibayarNow,
        requiredTarget,
        paymentsList: proj.freelancerPayments || [],
      };
    });

    return {
      list,
      grandTotalFee,
      grandTotalPaid,
      grandRemainingBalance,
      grandHarusDibayarNow,
      count: assignedProjects.length,
    };
  }, [assignedProjects]);

  const handleOpenPayModal = (projId: string, defaultAmount?: number, defaultStage?: string) => {
    setPayTargetProjectId(projId);
    setPayFormData({
      amount: defaultAmount ? String(defaultAmount) : '',
      stage: defaultStage || 'DP 40% SPK Signed',
      notes: '',
      status: 'VERIFIED',
      proofUrl: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsPayModalOpen(true);
  };

  const [isUploadingR2, setIsUploadingR2] = useState(false);

  const handleFileUploadR2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('Ukuran file bukti transfer tidak boleh melebihi 10MB', 'warning');
      return;
    }

    setIsUploadingR2(true);
    showNotification('Mengunggah bukti transfer ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'freelancer-payouts');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPayFormData((prev) => ({
          ...prev,
          proofUrl: data.url,
        }));
        showNotification('Bukti transfer berhasil disimpan ke Cloudflare R2!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64Str = uploadEvent.target?.result as string;
          setPayFormData((prev) => ({
            ...prev,
            proofUrl: base64Str,
          }));
          showNotification('Foto bukti transfer dimuat!', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Freelancer payout R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Str = uploadEvent.target?.result as string;
        setPayFormData((prev) => ({
          ...prev,
          proofUrl: base64Str,
        }));
        showNotification('Foto bukti transfer dimuat!', 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingR2(false);
    }
  };

  const handleSavePaymentRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payFormData.amount);
    if (!payTargetProjectId || !amountNum || amountNum <= 0) {
      showNotification('Silakan masukkan jumlah nominal pembayaran yang valid.', 'error');
      return;
    }

    const proj = projects.find((p) => p.id === payTargetProjectId);
    if (!proj) return;

    const newRecord: ProjectPaymentRecord = {
      id: `devpay-${Date.now()}`,
      date: payFormData.date,
      amount: amountNum,
      stage: payFormData.stage,
      notes: payFormData.notes || `Pembayaran Fee Developer (${payFormData.stage})`,
      status: payFormData.status,
      proofUrl: payFormData.proofUrl,
      approvedBy: currentUser?.name || 'Admin Atasilabs',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [newRecord, ...(proj.freelancerPayments || [])];
    const verifiedTotal = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    updateProject(proj.id, {
      freelancerPayments: updatedPayments,
      freelancerTotalPaid: verifiedTotal,
    });

    showNotification(
      `Pembayaran Rp ${amountNum.toLocaleString('id-ID')} untuk ${proj.freelancerName || 'Freelancer'} berhasil dicatat!`,
      'success'
    );
    setIsPayModalOpen(false);
  };

  const getTierBadge = (tierNum?: number) => {
    switch (tierNum) {
      case 1:
        return { label: 'Tier 1 — Micro App (150rb)', color: '#64748b' };
      case 2:
        return { label: 'Tier 2 — Standard Web (1,5 Jt)', color: '#0284c7' };
      case 3:
        return { label: 'Tier 3 — Pro SaaS (3,5 Jt)', color: '#8b5cf6' };
      case 4:
        return { label: 'Tier 4 — Enterprise (7 Jt)', color: '#f59e0b' };
      case 5:
        return { label: 'Tier 5 — Ecosystem (15 Jt)', color: '#ec4899' };
      default:
        return { label: 'Tier 3 — Pro SaaS (3,5 Jt)', color: '#8b5cf6' };
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header Banner */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            Fitur Bayar & Transaksi Fee Freelancer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pelacakan status pembayaran fee developer: <strong>Total Fee</strong>, <strong>Yang Sudah Dibayar</strong>, <strong>Sisa Tagihan</strong>, dan <strong>Harus Dibayar Sekarang</strong>.
          </Typography>
        </Box>

        {canRecordPayment && assignedProjects.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenPayModal(assignedProjects[0]?.id || '')}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
            }}
          >
            Bayar Fee Dev
          </Button>
        )}
      </Box>

      {/* 4 Main Summary KPI Cards (Total Berapa, Sudah Dibayar, Sisa Berapa, Harus Dibayar) */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* 1. TOTAL FEE (Total Berapa) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              1. TOTAL FEE DEV (TOTAL BERAPA)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#8b5cf6' }}>
              {formatRupiah(feeMetrics.grandTotalFee)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Total Honorarium {feeMetrics.count} Proyek
            </Typography>
          </Paper>
        </Grid>

        {/* 2. TELAH DIBAYAR (Yang Sudah Dibayar) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              2. SUDAH DIBAYAR (PAID TO DEV)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>
              {formatRupiah(feeMetrics.grandTotalPaid)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Telah Tervetifikasi / Transfer
            </Typography>
          </Paper>
        </Grid>

        {/* 3. SISA BELUM DIBAYAR (Sisa Berapa) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              3. SISA FEE (SISA BERAPA)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b' }}>
              {formatRupiah(feeMetrics.grandRemainingBalance)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Sisa Saldo Kontrak Dev
            </Typography>
          </Paper>
        </Grid>

        {/* 4. HARUS DIBAYAR SEKARANG (Yang Harus Dibayar) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              4. HARUS DIBAYAR SEKARANG
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>
              {formatRupiah(feeMetrics.grandHarusDibayarNow)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Jatuh Tempo Berdasarkan SOP
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Fee Breakdown & Payment History Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              Tabel Rincian Pembayaran Developer (Total, Sudah Dibayar, Sisa, & Harus Dibayar)
            </Typography>
            <TextField
              size="small"
              placeholder="Cari proyek, klien, atau dev..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: '250px' } }}
            />
          </Box>
        </Box>

        {/* Desktop Table View */}
        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Proyek & Developer</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Total Fee (Total Berapa)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Sudah Dibayar</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Sisa Fee (Sisa Berapa)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Harus Dibayar Sekarang</TableCell>
                <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>Aksi Pembayaran</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeMetrics.list.filter(proj => 
                proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proj.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (proj.freelancerName || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Belum ada proyek terdaftar untuk diproses pembayarannya.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                feeMetrics.list.filter(proj => 
                  proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  proj.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (proj.freelancerName || '').toLowerCase().includes(searchQuery.toLowerCase())
                ).map((proj) => {
                  const tierCfg = getTierBadge(proj.tierNumber);
                  const isExpanded = expandedProjectId === proj.id;

                  return (
                    <React.Fragment key={proj.id}>
                      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {proj.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Klien: {proj.clientName} | PJ: {proj.freelancerName || 'Freelancer'}
                          </Typography>
                          <Chip
                            label={tierCfg.label}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: `${tierCfg.color}20`,
                              color: tierCfg.color,
                              mt: 0.5,
                            }}
                          />
                        </TableCell>

                        {/* Total Fee */}
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#8b5cf6' }}>
                            {formatRupiah(proj.totalFee)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Kontrak Klien: {formatRupiah(proj.budget)}
                          </Typography>
                        </TableCell>

                        {/* Sudah Dibayar */}
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>
                            {formatRupiah(proj.alreadyPaid)}
                          </Typography>
                          <Chip
                            icon={proj.alreadyPaid > 0 ? <CheckCircleIcon sx={{ fontSize: '12px !important' }} /> : <ScheduleIcon sx={{ fontSize: '12px !important' }} />}
                            label={proj.alreadyPaid > 0 ? `${proj.paymentsList.length} Transaksi` : 'Belum Ada Transfer'}
                            size="small"
                            color={proj.alreadyPaid > 0 ? 'success' : 'default'}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, mt: 0.3 }}
                          />
                        </TableCell>

                        {/* Sisa Fee */}
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                            {formatRupiah(proj.remainingBalance)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {proj.remainingBalance === 0 ? 'Lunas 100%' : 'Sisa Belum Dibayar'}
                          </Typography>
                        </TableCell>

                        {/* Harus Dibayar Sekarang */}
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 900,
                              color: proj.harusDibayarNow > 0 ? '#ef4444' : 'text.secondary',
                            }}
                          >
                            {formatRupiah(proj.harusDibayarNow)}
                          </Typography>
                          <Chip
                            label={
                              proj.harusDibayarNow > 0
                                ? proj.progress >= 100
                                  ? 'Tagihan Pelunasan 60%'
                                  : 'Tagihan DP 40%'
                                : 'Belum Jatuh Tempo'
                            }
                            size="small"
                            color={proj.harusDibayarNow > 0 ? 'error' : 'default'}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, mt: 0.3 }}
                          />
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {canRecordPayment && proj.remainingBalance > 0 && (
                              <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                startIcon={<MoneyIcon />}
                                onClick={() => handleOpenPayModal(proj.id, proj.harusDibayarNow || Math.round(proj.totalFee * 0.4))}
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  py: 0.5,
                                  bgcolor: '#8b5cf6',
                                  '&:hover': { bgcolor: '#7c3aed' },
                                }}
                              >
                                Bayar Fee
                              </Button>
                            )}

                            <Tooltip title="Lihat Histori Pembayaran">
                              <IconButton
                                size="small"
                                onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                              >
                                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Collapsible Payment History Drawer Row */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', borderRadius: 2, my: 1, border: `1px dashed ${theme.palette.divider}` }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#8b5cf6' }}>
                                Histori Transfer & Catatan Pembayaran Fee Developer ({proj.title})
                              </Typography>

                              {proj.paymentsList.length === 0 ? (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  Belum ada catatan transaksi transfer fee untuk proyek ini.
                                </Typography>
                              ) : (
                                <Stack spacing={1}>
                                  {proj.paymentsList.map((pay) => (
                                    <Paper
                                      key={pay.id}
                                      variant="outlined"
                                      sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
                                    >
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                                          {formatRupiah(pay.amount)} — <span style={{ color: '#8b5cf6' }}>{pay.stage}</span>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Tanggal: {pay.date} | Dicatat oleh: {pay.approvedBy || 'Admin'}
                                        </Typography>
                                        {pay.notes && (
                                          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                                            Catatan: {pay.notes}
                                          </Typography>
                                        )}
                                      </Box>

                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                          label={pay.status === 'VERIFIED' ? 'TERDIVERIFIKASI / LUNAS' : 'PENDING'}
                                          color={pay.status === 'VERIFIED' ? 'success' : 'warning'}
                                          size="small"
                                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                                        />
                                        {pay.proofUrl && (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            href={pay.proofUrl}
                                            target="_blank"
                                            startIcon={<ReceiptIcon />}
                                            sx={{ fontSize: '0.68rem', py: 0.2, fontWeight: 700 }}
                                          >
                                            Bukti Transfer
                                          </Button>
                                        )}
                                      </Box>
                                    </Paper>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile Card View */}
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mt: 2 }}>
          {feeMetrics.list.filter(proj => 
            proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (proj.freelancerName || '').toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Belum ada proyek terdaftar untuk diproses pembayarannya.
              </Typography>
            </Paper>
          ) : (
            feeMetrics.list.filter(proj => 
              proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              proj.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (proj.freelancerName || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map((proj) => {
              const tierCfg = getTierBadge(proj.tierNumber);
              const isExpanded = expandedProjectId === proj.id;

              return (
                <Paper
                  key={proj.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Header: Project, Client & Tier (1 Kolom Vertikal) */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1.5, gap: 0.6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      {proj.title}
                    </Typography>
                    <Chip
                      label={tierCfg.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: `${tierCfg.color}20`,
                        color: tierCfg.color,
                        my: 0.2,
                      }}
                    />
                    <Box sx={{ width: '100%', mt: 0.2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
                        <strong>Klien:</strong> {proj.clientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                        <strong>PJ:</strong> {proj.freelancerName || 'Freelancer'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 2x2 Grid of Financials */}
                  <Grid container spacing={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', mb: 1.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Total Fee Dev:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#8b5cf6' }}>
                        {formatRupiah(proj.totalFee)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sudah Dibayar:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatRupiah(proj.alreadyPaid)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sisa Fee:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                        {formatRupiah(proj.remainingBalance)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tagihan Sekarang:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: proj.harusDibayarNow > 0 ? '#ef4444' : 'text.secondary' }}>
                        {formatRupiah(proj.harusDibayarNow)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Actions & Expand Toggle */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                      endIcon={isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: 'text.secondary', p: 0.5 }}
                    >
                      {isExpanded ? 'Tutup Histori' : `Histori (${proj.paymentsList.length})`}
                    </Button>

                    {canRecordPayment && proj.remainingBalance > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<MoneyIcon />}
                        onClick={() => handleOpenPayModal(proj.id, proj.harusDibayarNow || Math.round(proj.totalFee * 0.4))}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          borderRadius: 2,
                          py: 0.4,
                          px: 1.5,
                          bgcolor: '#8b5cf6',
                          '&:hover': { bgcolor: '#7c3aed' },
                        }}
                      >
                        Bayar Fee
                      </Button>
                    )}
                  </Box>

                  {/* Collapsible Payment History on Mobile */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', color: '#8b5cf6' }}>
                        Histori Transfer Fee ({proj.title}):
                      </Typography>
                      {proj.paymentsList.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>
                          Belum ada catatan transfer fee untuk proyek ini.
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {proj.paymentsList.map((pay) => (
                            <Paper
                              key={pay.id}
                              variant="outlined"
                              sx={{ p: 1.2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                  {formatRupiah(pay.amount)} — <span style={{ color: '#8b5cf6' }}>{pay.stage}</span>
                                </Typography>
                                <Chip
                                  label={pay.status === 'VERIFIED' ? 'LUNAS' : 'PENDING'}
                                  color={pay.status === 'VERIFIED' ? 'success' : 'warning'}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {pay.date} | Oleh: {pay.approvedBy || 'Admin'}
                              </Typography>
                              {pay.notes && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mt: 0.3 }}>
                                  Catatan: {pay.notes}
                                </Typography>
                              )}
                              {pay.proofUrl && (
                                <Box sx={{ mt: 0.8 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    href={pay.proofUrl}
                                    target="_blank"
                                    startIcon={<ReceiptIcon sx={{ fontSize: 12 }} />}
                                    sx={{ fontSize: '0.65rem', py: 0.2, fontWeight: 700 }}
                                  >
                                    Bukti Transfer
                                  </Button>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })
          )}
        </Stack>
      </Paper>

      {/* Drawer: Catat Pembayaran Dev */}
      <Drawer
        anchor="right"
        open={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 620 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <form onSubmit={handleSavePaymentRecord} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Catat Pembayaran Fee Dev
            </Typography>
            <IconButton size="small" onClick={() => setIsPayModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
            <Stack spacing={2.5}>
              {/* Select Project */}
              <TextField
                select
                fullWidth
                size="small"
                label="Pilih Proyek Dev"
                value={payTargetProjectId}
                onChange={(e) => setPayTargetProjectId(e.target.value)}
              >
                {assignedProjects.map((p) => {
                  const fee = p.freelancerFee || getFreelancerFeeForTier(p.tierNumber || 3);
                  return (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title} ({p.freelancerName || 'Dev'}) — Fee: {formatRupiah(fee)}
                    </MenuItem>
                  );
                })}
              </TextField>

              {/* Nominal Paid */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nominal Pembayaran (Rp)"
                placeholder="misal: 1400000"
                value={payFormData.amount}
                onChange={(e) => setPayFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />

              {/* Stage / Termin */}
              <TextField
                select
                fullWidth
                size="small"
                label="Tahap / Skema Pembayaran"
                value={payFormData.stage}
                onChange={(e) => setPayFormData((prev) => ({ ...prev, stage: e.target.value }))}
              >
                <MenuItem value="DP 40% SPK Signed">DP 40% (Tahap Rilis SPK)</MenuItem>
                <MenuItem value="Pelunasan 60% BAST">Pelunasan 60% (Tahap Closure BAST)</MenuItem>
                <MenuItem value="Pembayaran Gradual / Termin">Pembayaran Gradual / Termin</MenuItem>
                <MenuItem value="Bonus / Insentif Dev">Bonus / Insentif Dev</MenuItem>
              </TextField>

              {/* Date */}
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Tanggal Pembayaran"
                value={payFormData.date}
                onChange={(e) => setPayFormData((prev) => ({ ...prev, date: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* Dedicated Cloudflare R2 Image Upload Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.04)' : '#fcfaff',
                  border: `1.5px dashed ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.4)'}`,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <UploadIcon fontSize="small" /> Upload Bukti Resi Gambar (Cloudflare R2)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Pilih foto/resi transfer bank (PNG, JPG, WebP - Maks 10MB). Gambar otomatis diunggah ke Cloudflare R2.
                </Typography>

                {payFormData.proofUrl ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={payFormData.proofUrl}
                      alt="Bukti Resi Transfer"
                      sx={{
                        maxHeight: 180,
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: 2.5,
                        border: '1px solid rgba(16,185,129,0.4)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        mb: 1.5,
                        mx: 'auto',
                        display: 'block',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        size="small"
                        disabled={isUploadingR2}
                        startIcon={<UploadIcon />}
                        sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
                      >
                        {isUploadingR2 ? 'Mengunggah ke R2...' : 'Ganti Gambar Resi'}
                        <input type="file" accept="image/*" hidden onChange={handleFileUploadR2} />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setPayFormData((prev) => ({ ...prev, proofUrl: '' }))}
                        sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
                      >
                        Hapus Gambar
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    component="label"
                    disabled={isUploadingR2}
                    startIcon={<UploadIcon />}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2.5,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      bgcolor: '#8b5cf6',
                      '&:hover': { bgcolor: '#7c3aed' },
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                    }}
                  >
                    {isUploadingR2 ? 'Mengunggah ke Cloudflare R2...' : '📷 Pilih Gambar Resi Transfer'}
                    <input type="file" accept="image/*" hidden onChange={handleFileUploadR2} />
                  </Button>
                )}
              </Paper>

              {/* Notes */}
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Catatan Pembayaran"
                placeholder="Catatan tambahan transfer bank..."
                value={payFormData.notes}
                onChange={(e) => setPayFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Stack>
          </Box>

          <Box sx={{ p: 2, px: 3, borderTop: (t) => `1px solid ${t.palette.divider}`, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'background.paper' }}>
            <Button onClick={() => setIsPayModalOpen(false)} sx={{ fontWeight: 700 }}>
              Batal
            </Button>
            <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
              Simpan Transaksi Bayar
            </Button>
          </Box>
        </form>
      </Drawer>
    </Box>
  );
};
