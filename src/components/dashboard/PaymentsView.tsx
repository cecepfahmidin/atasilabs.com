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

      {/* Project Switcher Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              Manajemen & Input Pembayaran Proyek
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload bukti transfer resi bank dan verifikasi status persetujuan (approval) admin secara transparan.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 1,
              px: 2,
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              minWidth: 320,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              TAMPILAN TRANSARSI PROYEK:
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
                          {p.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {p.clientName} ({formatRupiah(p.budget)})
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
          </Paper>
        </Box>
      </Paper>

      {/* Rincian & Catatan Transaksi Pembayaran Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Title Header & Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.12)' }}>
              <PaymentsIcon color="primary" sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
                Rincian & Catatan Transaksi Pembayaran
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isAllProjects ? (
                  <>Menampilkan Gabungan Transaksi dari <strong>{availableProjects.length} Proyek Klien Active</strong></>
                ) : (
                  <>Proyek: <strong>{selectedProject?.title}</strong> — Klien: <strong>{selectedProject?.clientName}</strong></>
                )}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<AddIcon />}
            onClick={handleOpenPaymentDialog}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 2.5, py: 1 }}
          >
            + Catat Pembayaran Baru
          </Button>
        </Box>

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
                    Belum ada riwayat transaksi pembayaran yang dicatat. Klik <strong>"+ Catat Pembayaran Baru"</strong> di atas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Form Dialog Modal Input Pembayaran */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Form Input Pembayaran Proyek
            </Typography>
          </Box>
          <IconButton onClick={() => setPaymentDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
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

            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.84rem' }}>
              {isClientRole ? (
                <>Upload bukti transfer pembayaran untuk proyek <strong>{selectedProject?.title}</strong>. Pembayaran akan diverifikasi & di-approve oleh Tim Admin Atasilabs.</>
              ) : (
                <>Catat pembayaran untuk proyek. Total Kontrak: <strong>{formatRupiah(totalBudget)}</strong>.</>
              )}
            </Alert>

            <TextField
              fullWidth
              size="small"
              type="date"
              label="Tanggal Pembayaran / Transfer"
              InputLabelProps={{ shrink: true }}
              value={paymentFormData.date}
              onChange={(e) => setPaymentFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Nominal Pembayaran (IDR)"
              value={paymentFormData.amount || ''}
              onChange={(e) => setPaymentFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
              helperText={`Terbilang: Rp ${(paymentFormData.amount || 0).toLocaleString('id-ID')}`}
              required
            />

            <TextField
              select
              fullWidth
              size="small"
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

            {/* Upload Bukti Pembayaran / Resi Input */}
            <Box sx={{ border: `1px dashed ${theme.palette.divider}`, borderRadius: 2.5, p: 2, textAlign: 'center', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                📷 Unggah Bukti Transfer / Resi Pembayaran
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Format file PNG/JPG (Maks 5MB). Diperlukan untuk verifikasi admin.
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Pilih Foto Resi Bukti Transfer
                <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
              </Button>

              {paymentFormData.proofUrl && (
                <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'block', mb: 0.5 }}>
                    ✓ Pratinjau Resi Terunggah:
                  </Typography>
                  <Box
                    component="img"
                    src={paymentFormData.proofUrl}
                    alt="Pratinjau Bukti Pembayaran"
                    sx={{ height: 100, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, border: '1px solid #cbd5e1', mx: 'auto' }}
                  />
                </Box>
              )}
            </Box>

            {!isClientRole && (
              <TextField
                select
                fullWidth
                size="small"
                label="Status Verifikasi / Approval Admin"
                value={paymentFormData.status}
                onChange={(e) => setPaymentFormData((prev: any) => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="VERIFIED">TERVERIFIKASI / DISUJUJU (LUNAS)</MenuItem>
                <MenuItem value="PENDING">PENDING (Menunggu Verification Admin)</MenuItem>
                <MenuItem value="FAILED">GAGAL / DITOLAK</MenuItem>
              </TextField>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Catatan & Referensi Bank (No. Rekening / Ref Transfer)"
              placeholder="Contoh: Transfer Bank BRI Ref #88219 a.n. PT AULIA INDOLAND GRUP"
              value={paymentFormData.notes}
              onChange={(e) => setPaymentFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialogOpen(false)} color="inherit">
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={handleSavePaymentRecord} sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}>
            {isClientRole ? 'Kirim Bukti Pembayaran' : 'Simpan Pembayaran'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Pratinjau Resi Bukti Transfer */}
      <Dialog
        open={proofPreviewModal.open}
        onClose={() => setProofPreviewModal({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Bukti Transfer & Resi Pembayaran
            </Typography>
          </Box>
          <IconButton onClick={() => setProofPreviewModal({ open: false })} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center', py: 3 }}>
          {proofPreviewModal.payment?.proofUrl ? (
            <Box
              component="img"
              src={proofPreviewModal.payment.proofUrl}
              alt="Resi Bukti Pembayaran"
              sx={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
          ) : (
            <Typography color="text.secondary">Bukti resi gambar tidak tersedia.</Typography>
          )}

          <Box sx={{ mt: 2, textAlign: 'left', p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              Detail Transaksi:
            </Typography>
            {proofPreviewModal.payment?.projectTitle && (
              <Typography variant="body2"><strong>Proyek & Klien:</strong> {proofPreviewModal.payment.projectTitle} ({proofPreviewModal.payment.clientName})</Typography>
            )}
            <Typography variant="body2"><strong>Tanggal:</strong> {proofPreviewModal.payment?.date}</Typography>
            <Typography variant="body2"><strong>Tahap:</strong> {proofPreviewModal.payment?.stage}</Typography>
            <Typography variant="body2"><strong>Nominal:</strong> {formatRupiah(proofPreviewModal.payment?.amount || 0)}</Typography>
            <Typography variant="body2"><strong>Catatan/Ref:</strong> {proofPreviewModal.payment?.notes || '-'}</Typography>
            {proofPreviewModal.payment?.approvedBy && (
              <Typography variant="body2" sx={{ color: '#10b981', mt: 0.5, fontWeight: 700 }}>
                ✓ Disetujui oleh {proofPreviewModal.payment.approvedBy} pada {proofPreviewModal.payment.approvedAt}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProofPreviewModal({ open: false })} variant="contained">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
