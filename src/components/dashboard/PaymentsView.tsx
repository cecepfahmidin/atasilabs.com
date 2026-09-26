'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Payments as PaymentsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  HourglassTop as PendingIcon,
  CalendarToday as CalendarIcon,
  WorkOutline as ProjectIcon,
  AttachMoney as MoneyIcon,
  AutoAwesome as AutoIcon,
  VerifiedUser as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, ProjectPaymentRecord } from '../../types';

export const PaymentsView: React.FC = () => {
  const theme = useTheme();
  const {
    projects,
    currentUser,
    updateProject,
    showNotification,
  } = useApp();

  const isClientRole = currentUser?.role === 'CLIENT';

  // Filter available projects for current user
  const availableProjects = useMemo(() => {
    if (isClientRole) {
      const emailLower = currentUser?.email?.toLowerCase();
      const compLower = currentUser?.company?.toLowerCase();
      const nameLower = currentUser?.name?.toLowerCase();

      return projects.filter((p) => {
        const matchesClient =
          (emailLower && p.clientEmail?.toLowerCase() === emailLower) ||
          (compLower && p.clientName?.toLowerCase().includes(compLower)) ||
          (nameLower && p.clientName?.toLowerCase().includes(nameLower));

        return matchesClient && !p.isArchived && p.status !== 'ARCHIVED';
      });
    }
    return projects;
  }, [projects, currentUser, isClientRole]);

  // Selected Project State (Default to 'ALL' for Admin/Staff, or first project for Client)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return isClientRole ? (availableProjects[0]?.id || '') : 'ALL';
  });

  React.useEffect(() => {
    if (availableProjects.length > 0) {
      if (!isClientRole && selectedProjectId === 'ALL') return;
      if (!selectedProjectId || (!isClientRole && selectedProjectId !== 'ALL' && !availableProjects.some((p) => p.id === selectedProjectId))) {
        setSelectedProjectId(isClientRole ? availableProjects[0].id : 'ALL');
      }
    }
  }, [availableProjects, selectedProjectId, isClientRole]);

  const isAllProjects = selectedProjectId === 'ALL' || (!selectedProjectId && !isClientRole);

  const selectedProject: ClientProject | undefined = isAllProjects
    ? availableProjects[0]
    : availableProjects.find((p) => p.id === selectedProjectId) || availableProjects[0];

  // Count pending approval payments across all available projects
  const totalPendingPaymentsCount = useMemo(() => {
    let count = 0;
    availableProjects.forEach((proj) => {
      (proj.payments || []).forEach((pay) => {
        if (pay.status === 'PENDING') count++;
      });
    });
    return count;
  }, [availableProjects]);

  // Total count of all transactions
  const allPaymentsCount = useMemo(() => {
    let count = 0;
    availableProjects.forEach((proj) => {
      count += (proj.payments || []).length;
    });
    return count;
  }, [availableProjects]);

  // Aggregated or single project payments list enriched with project title & client name
  const paymentsListWithProject = useMemo(() => {
    const list: (ProjectPaymentRecord & { projectId: string; projectTitle: string; clientName: string })[] = [];

    if (isAllProjects) {
      availableProjects.forEach((proj) => {
        (proj.payments || []).forEach((pay) => {
          list.push({
            ...pay,
            projectId: proj.id,
            projectTitle: proj.title,
            clientName: proj.clientName,
          });
        });
      });
      return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    }

    if (selectedProject) {
      (selectedProject.payments || []).forEach((pay) => {
        list.push({
          ...pay,
          projectId: selectedProject.id,
          projectTitle: selectedProject.title,
          clientName: selectedProject.clientName,
        });
      });
    }

    return list;
  }, [isAllProjects, availableProjects, selectedProject]);

  // Payment Form Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    stage: 'DP Tahap 1 (30%)',
    notes: '',
    status: isClientRole ? ('PENDING' as const) : ('VERIFIED' as const),
    proofUrl: '',
    targetProjId: '',
  });

  // Proof Modal State for viewing proof image
  const [proofPreviewModal, setProofPreviewModal] = useState<{
    open: boolean;
    payment?: ProjectPaymentRecord & { projectTitle?: string; clientName?: string };
  }>({
    open: false,
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Financial summary metrics
  const totalBudget = useMemo(() => {
    if (isAllProjects) {
      return availableProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    }
    return selectedProject?.budget || 0;
  }, [isAllProjects, availableProjects, selectedProject]);

  const verifiedPaymentsSum = useMemo(() => {
    return paymentsListWithProject
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsListWithProject]);

  const totalPaidAmount = verifiedPaymentsSum;
  const remainingBalance = Math.max(0, totalBudget - totalPaidAmount);
  const paymentProgressPct = totalBudget > 0 ? Math.min(100, Math.round((totalPaidAmount / totalBudget) * 100)) : 0;

  const handleOpenPaymentDialog = () => {
    const targetProj = selectedProject || availableProjects[0];
    const targetBudget = targetProj?.budget || 15000000;
    const defaultStage = 'DP Tahap 1 (30%)';
    const defaultAmount = Math.round(targetBudget * 0.3);

    setPaymentFormData({
      date: new Date().toISOString().split('T')[0],
      amount: defaultAmount,
      stage: defaultStage,
      notes: 'Transfer Bank BRI a.n. PT AULIA INDOLAND GRUP',
      status: isClientRole ? 'PENDING' : 'VERIFIED',
      proofUrl: '',
      targetProjId: targetProj?.id || '',
    });
    setPaymentDialogOpen(true);
  };

  // Handle file upload preview to Base64 Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Ukuran file resi bukti transfer tidak boleh melebihi 5MB', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Str = uploadEvent.target?.result as string;
        setPaymentFormData((prev) => ({
          ...prev,
          proofUrl: base64Str,
        }));
        showNotification('Foto resi bukti transfer berhasil diunggah!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePaymentRecord = () => {
    const targetId = paymentFormData.targetProjId || selectedProject?.id || availableProjects[0]?.id;
    const targetProj = availableProjects.find((p) => p.id === targetId);

    if (!targetProj) {
      showNotification('Harap pilih proyek target untuk pencatatan pembayaran', 'warning');
      return;
    }
    if (!paymentFormData.amount || paymentFormData.amount <= 0) {
      showNotification('Harap masukkan nominal pembayaran yang valid (lebih dari 0)', 'warning');
      return;
    }

    const initialStatus = isClientRole ? 'PENDING' : paymentFormData.status;

    const newRecord: ProjectPaymentRecord = {
      id: `pay-${Date.now()}`,
      date: paymentFormData.date,
      amount: Number(paymentFormData.amount),
      stage: paymentFormData.stage,
      notes: paymentFormData.notes,
      status: initialStatus,
      proofUrl: paymentFormData.proofUrl || undefined,
      approvedBy: initialStatus === 'VERIFIED' ? (currentUser?.name || 'Admin') : undefined,
      approvedAt: initialStatus === 'VERIFIED' ? new Date().toLocaleString('id-ID') : undefined,
      createdAt: new Date().toISOString(),
    };

    const currentPayments = targetProj.payments || [];
    const updatedPayments = [newRecord, ...currentPayments];
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(targetProj.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    setPaymentDialogOpen(false);
    if (initialStatus === 'PENDING') {
      showNotification(`Bukti pembayaran ${formatRupiah(paymentFormData.amount)} berhasil diunggah. Menunggu approval Admin!`, 'info');
    } else {
      showNotification(`Catatan pembayaran ${formatRupiah(paymentFormData.amount)} berhasil disimpan & disetujui!`, 'success');
    }
  };

  // Admin Approval Action: Approve
  const handleApprovePayment = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const adminName = currentUser?.name || 'Admin Atasilabs';
    const nowStr = new Date().toLocaleString('id-ID');

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'VERIFIED' as const,
          approvedBy: adminName,
          approvedAt: nowStr,
        };
      }
      return p;
    });

    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification(`Status Pembayaran DISUJUJU oleh Admin (${projToUpdate.clientName})!`, 'success');
  };

  // Admin Approval Action: Reject
  const handleRejectPayment = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'FAILED' as const,
        };
      }
      return p;
    });

    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Status Pembayaran DITOLAK / INVALID.', 'warning');
  };

  const handleDeletePaymentRecord = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.filter((p) => p.id !== payId);
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Catatan pembayaran berhasil dihapus', 'info');
  };

  if (availableProjects.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 3.5,
          border: `1px dashed ${theme.palette.divider}`,
          mt: 2,
        }}
      >
        <PaymentsIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Belum Ada Proyek Aktif untuk Manajemen Pembayaran
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Silakan buat atau pilih proyek aktif terlebih dahulu untuk mencatat rincian transaksi pembayaran.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alert Banner for Pending Admin Approvals */}
      {!isClientRole && totalPendingPaymentsCount > 0 && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button color="inherit" size="small" variant="outlined" onClick={() => setSelectedProjectId('ALL')} sx={{ fontWeight: 800, borderColor: '#fff', color: '#fff' }}>
              Lihat Semua ({totalPendingPaymentsCount})
            </Button>
          }
          sx={{ mb: 3, borderRadius: 3, fontWeight: 700, boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
        >
          🔔 TERDETEKSI <strong>{totalPendingPaymentsCount} PEMBAYARAN BARU DARI KLIEN</strong> MENUNGGU VERIFIKASI & APPROVAL ADMIN!
        </Alert>
      )}

      {/* Title Header (Matching Dokumentasi view) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Manajemen & Input Pembayaran Proyek
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '16px !important' }} />}
            label="Verifikasi & Transaksi Real-time"
            color="success"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Pencatatan termin pembayaran, upload resi transfer, & verifikasi otomatis status pelunasan proyek.
          </Typography>
        </Box>
      </Box>

      {/* Main Payment Container Card (Matching Dokumentasi view) */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3.5,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Project Selection Banner */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              Pilih Proyek Klien (Laporan Pembayaran):
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {!isClientRole && (
                <MenuItem value="ALL">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      🌟 Semua Proyek & Transaksi Klien ({allPaymentsCount})
                    </Typography>
                    {totalPendingPaymentsCount > 0 && (
                      <Chip label={`${totalPendingPaymentsCount} PENDING`} size="small" color="warning" sx={{ fontWeight: 800, ml: 1, height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                </MenuItem>
              )}
              {availableProjects.map((p) => {
                const pPending = (p.payments || []).filter((pay) => pay.status === 'PENDING').length;
                return (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {p.clientName} — {p.title} ({formatRupiah(p.budget)})
                        </Typography>
                      </Box>
                      {pPending > 0 && (
                        <Chip label={`${pPending} ⏳`} size="small" color="warning" sx={{ fontWeight: 800, ml: 1, height: 18, fontSize: '0.6rem' }} />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }} textAlign={{ sm: 'right' }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' }, flexWrap: 'wrap', mt: { xs: 1, sm: 2.5 } }}>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<AddIcon />}
                onClick={handleOpenPaymentDialog}
                sx={{ fontWeight: 800, borderRadius: 2.5, px: 2.5, py: 1 }}
              >
                Catat Pembayaran Baru
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Info Alert Box (Matching Dokumentasi view) */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2, mb: 3, fontSize: '0.84rem' }}>
          {isAllProjects ? (
            <>Menampilkan gabungan laporan pembayaran untuk <strong>{availableProjects.length} Proyek Klien Aktif</strong>. Seluruh catatan transaksi & resi tersimpan permanen per proyek.</>
          ) : (
            <>Pembayaran saat ini untuk <strong>{selectedProject?.clientName}</strong> ({selectedProject?.title} — Budget: <strong>{formatRupiah(selectedProject?.budget || 0)}</strong>). Seluruh catatan transaksi & resi tersimpan permanen per proyek.</>
          )}
        </Alert>

        {/* 3 Financial Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.8 }}>
                {isAllProjects ? 'TOTAL KONTRAK SEMUA PROYEK' : 'TOTAL NILAI KONTRAK'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {formatRupiah(totalBudget)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.8, color: '#10b981' }}>
                TOTAL TERBAYAR ({paymentProgressPct}%)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                {formatRupiah(totalPaidAmount)}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                borderColor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.8, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                SISA PELUNASAN KONTRAK
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                {remainingBalance > 0 ? formatRupiah(remainingBalance) : 'LUNAS 100% ✅'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Transactions Table */}
        <TableContainer component={Box} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
                {isAllProjects && <TableCell sx={{ fontWeight: 800 }}>Proyek & Klien</TableCell>}
                <TableCell sx={{ fontWeight: 800 }}>Tahap / Termin Pembayaran</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Nominal (IDR)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Bukti Pembayaran</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Catatan & Ref Transfer</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status Approval Admin</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Aksi / Verifikasi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentsListWithProject.length > 0 ? (
                paymentsListWithProject.map((pay) => (
                  <TableRow key={`${pay.projectId}-${pay.id}`} hover sx={{ bgcolor: pay.status === 'PENDING' ? (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.05)' : '#fffbe6') : 'transparent' }}>
                    <TableCell sx={{ fontWeight: 700 }}>{pay.date}</TableCell>
                    {isAllProjects && (
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                          {pay.projectTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {pay.clientName}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip label={pay.stage} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                      {formatRupiah(pay.amount)}
                    </TableCell>
                    <TableCell>
                      {pay.proofUrl ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                          sx={{ fontSize: '0.72rem', py: 0.3, fontWeight: 700 }}
                        >
                          Lihat Bukti Resi
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Tanpa Bukti Resi
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {pay.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {pay.status === 'VERIFIED' && (
                        <Tooltip title={pay.approvedBy ? `Disetujui oleh ${pay.approvedBy} (${pay.approvedAt || pay.date})` : 'Disetujui Admin'}>
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                            label="DISUJUI ADMIN ✅"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                          />
                        </Tooltip>
                      )}
                      {pay.status === 'PENDING' && (
                        <Tooltip title="Menunggu verifikasi persetujuan (approval) oleh Tim Admin Atasilabs">
                          <Chip
                            icon={<PendingIcon sx={{ fontSize: '14px !important' }} />}
                            label="MENUNGGU APPROVAL ⏳"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                          />
                        </Tooltip>
                      )}
                      {pay.status === 'FAILED' && (
                        <Chip
                          icon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
                          label="DITOLAK ❌"
                          size="small"
                          color="error"
                          sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.8} justifyContent="flex-end" alignItems="center">
                        {/* Admin Action Buttons for PENDING payments */}
                        {!isClientRole && pay.status === 'PENDING' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleApprovePayment(pay.id, pay.projectId)}
                              sx={{ fontSize: '0.7rem', py: 0.3, px: 1.2, fontWeight: 800 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleRejectPayment(pay.id, pay.projectId)}
                              sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 700 }}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDeletePaymentRecord(pay.id, pay.projectId)} title="Hapus transaksi">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAllProjects ? 8 : 7} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.9rem' }}>
                    Belum ada riwayat transaksi pembayaran yang dicatat. Klik <strong>"Catat Pembayaran Baru"</strong> di atas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Form Dialog Modal Input Pembayaran (Style LeadsView) */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
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
        <DialogTitle component="div" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'primary.main',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              }}
            >
              <PaymentsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {isClientRole ? 'Upload Bukti Transfer Pembayaran' : 'Catat & Input Pembayaran Proyek'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isClientRole ? 'Kirimkan bukti transfer untuk verifikasi tim admin' : 'Kelola transaksi penerimaan transfer & termin pembayaran proyek'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setPaymentDialogOpen(false)} size="small" sx={{ borderRadius: 2 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontSize: '0.84rem' }}>
            {isClientRole ? (
              <>Upload bukti transfer pembayaran untuk proyek <strong>{selectedProject?.title}</strong>. Pembayaran akan diverifikasi & di-approve oleh Tim Admin Atasilabs.</>
            ) : (
              <>Catat pembayaran untuk proyek. Total Kontrak: <strong>{formatRupiah(totalBudget)}</strong>.</>
            )}
          </Alert>

          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Target Proyek Klien"
                value={paymentFormData.targetProjId}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, targetProjId: e.target.value }))}
              >
                {availableProjects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title} — {p.clientName} ({formatRupiah(p.budget)})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Tanggal Pembayaran / Transfer"
                InputLabelProps={{ shrink: true }}
                value={paymentFormData.date}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tahap / Termin Pembayaran"
                value={paymentFormData.stage}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, stage: e.target.value }))}
              >
                <MenuItem value="DP Tahap 1 (30%)">DP Tahap 1 (30%) - Penandatanganan MoU</MenuItem>
                <MenuItem value="Termin Progress Tahap 2 (30%)">Termin Progress Tahap 2 (30%) - Desain / Mid Dev</MenuItem>
                <MenuItem value="Pelunasan Tahap 3 (40%)">Pelunasan Tahap 3 (40%) - Sebelum Live Deployment</MenuItem>
                <MenuItem value="DP Tahap 1 (50%)">DP Tahap 1 (50%) - Tier 1-2</MenuItem>
                <MenuItem value="Pelunasan Tahap 2 (50%)">Pelunasan Tahap 2 (50%) - Tier 1-2</MenuItem>
                <MenuItem value="Pembayaran Tambahan / Add-on">Pembayaran Tambahan / Add-on</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: isClientRole ? 12 : 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Nominal Pembayaran (IDR)"
                value={paymentFormData.amount || ''}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                helperText={`Terbilang: Rp ${(paymentFormData.amount || 0).toLocaleString('id-ID')}`}
                required
              />
            </Grid>

            {!isClientRole && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Status Verifikasi / Approval Admin"
                  value={paymentFormData.status}
                  onChange={(e) => setPaymentFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="VERIFIED">TERVERIFIKASI / DISUTUJU (LUNAS)</MenuItem>
                  <MenuItem value="PENDING">PENDING (Menunggu Verifikasi Admin)</MenuItem>
                  <MenuItem value="FAILED">GAGAL / DITOLAK</MenuItem>
                </TextField>
              </Grid>
            )}

            {/* Upload Bukti Pembayaran Box (Style LeadsView) */}
            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1.5px dashed ${theme.palette.divider}`,
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <UploadIcon color="primary" fontSize="small" /> Unggah Bukti Transfer / Resi Pembayaran
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Format file PNG/JPG (Maks 5MB). Diperlukan untuk verifikasi admin.
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.8, textTransform: 'none' }}
                >
                  Pilih Foto Resi Bukti Transfer
                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>

                {paymentFormData.proofUrl && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)', display: 'inline-block', maxWidth: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'block', mb: 1 }}>
                      ✓ Pratinjau Resi Terunggah:
                    </Typography>
                    <Box
                      component="img"
                      src={paymentFormData.proofUrl}
                      alt="Pratinjau Bukti Pembayaran"
                      sx={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, mx: 'auto' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Catatan & Referensi Bank (No. Rekening / Ref Transfer)"
                placeholder="Contoh: Transfer Bank BRI Ref #88219 a.n. PT AULIA INDOLAND GRUP"
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, gap: 1.5 }}>
          <Button onClick={() => setPaymentDialogOpen(false)} variant="outlined" color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5, px: 2.5, textTransform: 'none' }}>
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={handleSavePaymentRecord} sx={{ fontWeight: 800, borderRadius: 2.5, px: 3.5, py: 1, textTransform: 'none' }}>
            {isClientRole ? 'Kirim Bukti Pembayaran' : 'Simpan Pembayaran'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rincian & Resi Pembayaran Modal (Exact LeadsView Detail Modal Layout) */}
      <Dialog
        open={proofPreviewModal.open}
        onClose={() => setProofPreviewModal({ open: false })}
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
        {proofPreviewModal.payment && (
          <>
            <DialogTitle component="div" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: 'primary.main',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Rincian & Bukti Resi Pembayaran Proyek
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID Transaksi: #{proofPreviewModal.payment.id} &bull; Tanggal: {proofPreviewModal.payment.date}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setProofPreviewModal({ open: false })} size="small" sx={{ borderRadius: 2 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Payment Details 4-Card Grid (Matching LeadsView Detail Sender Grid) */}
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
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      <ProjectIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Proyek & Klien
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {proofPreviewModal.payment.projectTitle || selectedProject?.title || 'Proyek Klien'}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        {proofPreviewModal.payment.clientName || selectedProject?.clientName || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <MoneyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Nominal Transaksi
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                        {formatRupiah(proofPreviewModal.payment.amount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      <CalendarIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tanggal Pembayaran
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {proofPreviewModal.payment.date}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                      <AutoIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tahap / Termin
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {proofPreviewModal.payment.stage}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Resi Image Box (Matching LeadsView Message Box) */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  📷 Lampiran Bukti Transfer / Resi:
                </Typography>
                {proofPreviewModal.payment.proofUrl && (
                  <Button
                    size="small"
                    component="a"
                    href={proofPreviewModal.payment.proofUrl}
                    target="_blank"
                    startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: '0.75rem', textTransform: 'none', fontWeight: 700 }}
                  >
                    Buka Ukuran Penuh
                  </Button>
                )}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                {proofPreviewModal.payment.proofUrl ? (
                  <Box
                    component="img"
                    src={proofPreviewModal.payment.proofUrl}
                    alt="Resi Bukti Pembayaran"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 380,
                      objectFit: 'contain',
                      borderRadius: 2.5,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, fontStyle: 'italic' }}>
                    Lampiran resi gambar tidak diunggah untuk transaksi ini.
                  </Typography>
                )}
              </Paper>

              {/* Status & Notes Bar (Matching LeadsView Status Selector Bar) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ maxWidth: '60%' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>
                    Catatan & Referensi Bank:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {proofPreviewModal.payment.notes || 'Tidak ada catatan tambahan.'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Status Approval:
                  </Typography>
                  <Chip
                    label={
                      proofPreviewModal.payment.status === 'VERIFIED'
                        ? 'VERIFIED / LUNAS'
                        : proofPreviewModal.payment.status === 'FAILED'
                        ? 'GAGAL / DITOLAK'
                        : 'PENDING VERIFIKASI'
                    }
                    size="small"
                    color={
                      proofPreviewModal.payment.status === 'VERIFIED'
                        ? 'success'
                        : proofPreviewModal.payment.status === 'FAILED'
                        ? 'error'
                        : 'warning'
                    }
                    sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setProofPreviewModal({ open: false })} variant="contained" color="primary" sx={{ borderRadius: 2.5, fontWeight: 800, px: 3, textTransform: 'none' }}>
                Tutup Rincian
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
