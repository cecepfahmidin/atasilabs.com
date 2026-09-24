'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as SecurityIcon,
  Launch as LaunchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Gesture as DrawIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Check as CheckIcon,
  Computer as DeviceIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoIcon,
  TaskAlt as TaskAltIcon,
  HelpOutline as HelpIcon,
  Payments as PaymentsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  HourglassTop as PendingIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { ClientProject, DigitalSignatureData, DocumentType, ProjectPaymentRecord } from '../../types';
import { IPW_STAGES_LIST, IPW_STAGES_CONFIG, getStageFromProgress } from '../../lib/ipwStages';
import { generateAutoDocumentsForProject } from '../../lib/documentGenerator';
import { SignatureDialog } from './SignatureDialog';

export const ClientDashboardView: React.FC = () => {
  const theme = useTheme();
  const {
    projects,
    currentUser,
    setDashboardTab,
    setSelectedDocumentProjectId,
    setSelectedDocumentType,
    showNotification,
    updateProject,
  } = useApp();

  const isClientRole = currentUser?.role === 'CLIENT';

  // Filter projects available to the client
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

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    availableProjects[0]?.id || ''
  );

  React.useEffect(() => {
    if (availableProjects.length > 0) {
      if (!selectedProjectId || !availableProjects.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(availableProjects[0].id);
      }
    }
  }, [availableProjects, selectedProjectId]);

  const selectedProject: ClientProject | undefined =
    availableProjects.find((p) => p.id === selectedProjectId) || availableProjects[0];

  // Signature Dialog State
  const [signatureModal, setSignatureModal] = useState<{
    open: boolean;
    docType: DocumentType;
    docTitle: string;
  }>({
    open: false,
    docType: 'MOU',
    docTitle: 'Memorandum of Understanding (MoU)',
  });

  // Payment Dialog & Records State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    stage: 'DP Tahap 1 (30%)',
    notes: '',
    status: isClientRole ? ('PENDING' as const) : ('VERIFIED' as const),
    proofUrl: '',
  });

  // Proof Modal State for viewing proof image
  const [proofPreviewModal, setProofPreviewModal] = useState<{
    open: boolean;
    payment?: ProjectPaymentRecord;
  }>({
    open: false,
  });

  const totalBudget = selectedProject?.budget || 0;
  const paymentsList = selectedProject?.payments || [];

  const verifiedPaymentsSum = useMemo(() => {
    return paymentsList
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsList]);

  const totalPaidAmount = paymentsList.length > 0 ? verifiedPaymentsSum : (selectedProject?.totalPaid || 0);
  const remainingBalance = Math.max(0, totalBudget - totalPaidAmount);
  const paymentProgressPct = totalBudget > 0 ? Math.min(100, Math.round((totalPaidAmount / totalBudget) * 100)) : 0;

  const handleOpenPaymentDialog = () => {
    let defaultStage = 'DP Tahap 1 (30%)';
    let defaultAmount = Math.round(totalBudget * 0.3);

    if (totalPaidAmount > 0 && remainingBalance > 0) {
      if (totalPaidAmount >= Math.round(totalBudget * 0.5)) {
        defaultStage = 'Pelunasan Tahap 3 (40%)';
        defaultAmount = remainingBalance;
      } else {
        defaultStage = 'Termin Progress Tahap 2 (30%)';
        defaultAmount = Math.min(remainingBalance, Math.round(totalBudget * 0.3));
      }
    }

    const initialStatus = isClientRole ? 'PENDING' : 'VERIFIED';
    setPaymentFormData({
      date: new Date().toISOString().split('T')[0],
      amount: defaultAmount,
      stage: defaultStage,
      notes: 'Transfer Bank BRI a.n. PT AULIA INDOLAND GRUP',
      status: initialStatus,
      proofUrl: '',
    });
    setPaymentDialogOpen(true);
  };

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
    if (!selectedProject) return;
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

    const updatedPayments = [newRecord, ...paymentsList];
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(selectedProject.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    setPaymentDialogOpen(false);
    if (initialStatus === 'PENDING') {
      showNotification(`Bukti pembayaran ${formatRupiah(paymentFormData.amount)} dikirim. Menunggu approval Admin!`, 'info');
    } else {
      showNotification(`Catatan pembayaran ${formatRupiah(paymentFormData.amount)} berhasil disimpan!`, 'success');
    }
  };

  const handleApprovePayment = (payId: string) => {
    if (!selectedProject) return;
    const adminName = currentUser?.name || 'Admin Atasilabs';
    const nowStr = new Date().toLocaleString('id-ID');

    const updatedPayments = paymentsList.map((p) => {
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

    updateProject(selectedProject.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Status Pembayaran BERHASIL DI-APPROVE & disetujui oleh Admin!', 'success');
  };

  const handleRejectPayment = (payId: string) => {
    if (!selectedProject) return;

    const updatedPayments = paymentsList.map((p) => {
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

    updateProject(selectedProject.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Status Pembayaran DITOLAK / INVALID.', 'warning');
  };

  const handleDeletePaymentRecord = (payId: string) => {
    if (!selectedProject) return;
    const updatedPayments = paymentsList.filter((p) => p.id !== payId);
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(selectedProject.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Catatan pembayaran berhasil dihapus', 'info');
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  if (availableProjects.length === 0 || !selectedProject) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 3.5,
          border: `1px dashed ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
          mt: 2,
        }}
      >
        <AssignmentIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Selamat Datang di Portal Klien Atasilabs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
          Saat ini belum ada proyek aktif yang sedang berjalan untuk akun <strong>{currentUser?.email}</strong>.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tim PM / CTO Atasilabs akan mengaitkan proyek Anda ke alur SOP 6-Stage IPW (Discovery ➔ Spec ➔ Kontrak ➔ SPK ➔ Eksekusi ➔ BAST).
        </Typography>
      </Paper>
    );
  }

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Generate Document set for the selected project
  const docs = useMemo(() => {
    return generateAutoDocumentsForProject(selectedProject);
  }, [selectedProject, refreshTrigger]);

  const stageCfg = getStageFromProgress(selectedProject.progress, selectedProject.ipwStage);
  const activeStepIndex = IPW_STAGES_LIST.findIndex((s) => s.stage === stageCfg.stage);

  const [selectedStageStep, setSelectedStageStep] = useState<number | null>(null);
  const currentDisplayedIndex = selectedStageStep !== null ? selectedStageStep : (activeStepIndex >= 0 ? activeStepIndex : 0);
  const currentDisplayedStageCfg = IPW_STAGES_LIST[currentDisplayedIndex] || stageCfg;

  const getStageRealStatus = (index: number) => {
    const isPast = index < activeStepIndex;
    const isCurrent = index === activeStepIndex;

    switch (index) {
      case 0:
        return {
          statusText: docs.cif ? 'SELESAI (CIF Terbit & Terisi)' : 'DALAM PROSES INTAKE',
          chipColor: 'success' as const,
          docName: 'CIF (Customer Information Form)',
          isDone: true,
        };
      case 1:
        return {
          statusText: selectedProject.progress >= 30 ? 'SELESAI (Spesifikasi Fitur Disetujui)' : isCurrent ? 'SEDANG BERJALAN (Review Technical Specs)' : 'BELUM DIMULAI',
          chipColor: selectedProject.progress >= 30 ? ('success' as const) : isCurrent ? ('warning' as const) : ('default' as const),
          docName: 'RSD (Requirement Spec Document)',
          isDone: selectedProject.progress >= 30,
        };
      case 2:
        return {
          statusText: docs.mou?.party2Signature ? 'SELESAI (MoU Ditandatangani & DP Verified)' : isCurrent ? 'SEDANG BERJALAN (Menunggu TTD MoU)' : 'BELUM DIMULAI',
          chipColor: docs.mou?.party2Signature ? ('success' as const) : isCurrent ? ('warning' as const) : ('default' as const),
          docName: 'MoU (Memorandum of Understanding)',
          isDone: !!docs.mou?.party2Signature,
        };
      case 3:
        return {
          statusText: selectedProject.freelancerName || selectedProject.progress >= 60 ? `SELESAI (SPK Released: ${selectedProject.freelancerName || 'Tim Dev Atasilabs'})` : isCurrent ? 'SEDANG BERJALAN (Pendelegasian Tim)' : 'BELUM DIMULAI',
          chipColor: selectedProject.progress >= 60 ? ('success' as const) : isCurrent ? ('info' as const) : ('default' as const),
          docName: 'SPK (Surat Perintah Kerja)',
          isDone: selectedProject.progress >= 60,
        };
      case 4:
        return {
          statusText: selectedProject.progress >= 85 ? 'SELESAI (Checklist UAT & Staging Validated)' : isCurrent ? 'SEDANG BERJALAN (Sprint Coding & Testing)' : 'BELUM DIMULAI',
          chipColor: selectedProject.progress >= 85 ? ('success' as const) : isCurrent ? ('secondary' as const) : ('default' as const),
          docName: 'QA (Quality Assurance & Checklist UAT)',
          isDone: selectedProject.progress >= 85,
        };
      case 5:
        return {
          statusText: docs.bast?.party2Signature || selectedProject.progress >= 100 ? 'SELESAI (BAST Signed & Web Published)' : isCurrent ? 'SEDANG BERJALAN (Review Serah Terima BAST)' : 'BELUM DIMULAI',
          chipColor: docs.bast?.party2Signature || selectedProject.progress >= 100 ? ('success' as const) : isCurrent ? ('warning' as const) : ('default' as const),
          docName: 'BAST (Berita Acara Serah Terima)',
          isDone: !!docs.bast?.party2Signature || selectedProject.progress >= 100,
        };
      default:
        return {
          statusText: isPast ? 'SELESAI' : 'BELUM DIMULAI',
          chipColor: isPast ? ('success' as const) : ('default' as const),
          docName: '-',
          isDone: isPast,
        };
    }
  };

  const displayedRealStatus = getStageRealStatus(currentDisplayedIndex);

  const handleOpenDoc = (docType: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST') => {
    setSelectedDocumentProjectId(selectedProject.id);
    setSelectedDocumentType(docType);
    setDashboardTab('documents');
  };

  const handleSignDocument = (docType: DocumentType, docTitle: string) => {
    setSignatureModal({
      open: true,
      docType,
      docTitle,
    });
  };

  // Realtime Document Update Listener
  useEffect(() => {
    const handleDocUpdateEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.projectId === selectedProject?.id) {
        setRefreshTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener('atasilabs_document_updated', handleDocUpdateEvent);
    return () => {
      window.removeEventListener('atasilabs_document_updated', handleDocUpdateEvent);
    };
  }, [selectedProject?.id]);

  const handleSaveSignature = (sigData: DigitalSignatureData) => {
    const storageKey = 'atasilabs_custom_project_documents';
    try {
      const savedDocs = localStorage.getItem(storageKey);
      const allCustom = savedDocs ? JSON.parse(savedDocs) : {};
      const projCustom = allCustom[selectedProject.id] || {};
      const currentAuto = generateAutoDocumentsForProject(selectedProject);

      const docTypeKey = signatureModal.docType.toLowerCase() as 'cif' | 'rsd' | 'mou' | 'spk' | 'bast' | 'qa';
      const targetDoc = projCustom[docTypeKey] || currentAuto[docTypeKey];

      const newName = sigData.auditTrail?.signedBy || currentUser?.name || selectedProject.clientName;
      const newRole = sigData.auditTrail?.signerRole || currentUser?.company || 'Klien / Pihak Kedua';

      const updatedDoc = {
        ...targetDoc,
        party2Signature: sigData,
        clientPic: newName,
        clientRole: newRole,
        updatedAt: new Date().toISOString(),
      };

      const updatedProjectDocs = {
        ...projCustom,
        [docTypeKey]: updatedDoc,
      };

      allCustom[selectedProject.id] = updatedProjectDocs;

      localStorage.setItem(storageKey, JSON.stringify(allCustom));

      // ⚡ Dual Sync to Database API & Supabase Realtime Broadcast
      fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject.id, data: updatedProjectDocs }),
      }).catch((e) => console.error('Document DB save error:', e));

      try {
        supabase.channel('public_realtime_db_changes').send({
          type: 'broadcast',
          event: 'DOCUMENT_UPDATE',
          payload: { projectId: selectedProject.id, data: updatedProjectDocs },
        });
      } catch (bErr) {}

      showNotification(`Tanda tangan digital ${signatureModal.docTitle} berhasil tersimpan & diverifikasi!`, 'success');
      setSignatureModal((prev) => ({ ...prev, open: false }));
      setRefreshTrigger((prev) => prev + 1);
    } catch (e) {
      console.error(e);
      showNotification('Gagal menyimpan tanda tangan digital.', 'error');
    }
  };

  // Status documents check
  const documentList = [
    {
      type: 'CIF' as DocumentType,
      code: 'CIF',
      title: 'Client Intake Form (CIF)',
      desc: 'Spesifikasi awal kebutuhan, target launching, dan paket layanan',
      data: docs.cif,
      party2Signed: !!docs.cif?.party2Signature,
    },
    {
      type: 'RSD' as DocumentType,
      code: 'RSD',
      title: 'Requirement Specification Document (RSD)',
      desc: 'Spesifikasi teknis, daftar fitur fungsional, dan arsitektur',
      data: docs.rsd,
      party2Signed: !!docs.rsd?.party2Signature,
    },
    {
      type: 'MOU' as DocumentType,
      code: 'MOU',
      title: 'Memorandum of Understanding (MoU)',
      desc: 'Surat perjanjian kerja sama, nilai investasi, dan skema pembayaran',
      data: docs.mou,
      party2Signed: !!docs.mou?.party2Signature,
      requiresSignature: true,
    },
    {
      type: 'QA' as DocumentType,
      code: 'QA',
      title: 'Quality Assurance & UAT Checklist Report',
      desc: 'Laporan pengujian fitur, security RLS policies, dan kriteria UAT',
      data: docs.qa,
      party2Signed: !!docs.qa?.party2Signature,
    },
    {
      type: 'BAST' as DocumentType,
      code: 'BAST',
      title: 'Berita Acara Serah Terima (BAST)',
      desc: 'Dokumen serah terima aset digital, link staging, dan akses admin',
      data: docs.bast,
      party2Signed: !!docs.bast?.party2Signature,
      requiresSignature: true,
    },
  ];

  const signatureRequiredDocs = documentList.filter((d) => d.requiresSignature);
  const signedDocs = signatureRequiredDocs.filter((d) => d.party2Signed);
  const pendingDocs = signatureRequiredDocs.filter((d) => !d.party2Signed);
  const pendingSignatureDoc = documentList.find((d) => d.requiresSignature && !d.party2Signed);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Client Welcome Banner & Project Selector */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3.5,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
                label="PORTAL RESMI KLIEN ATASILABS (UU ITE VERIFIED)"
                size="small"
                color="success"
                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
              />
              {!isClientRole && (
                <Chip
                  label="Mode Preview Admin"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                />
              )}
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              Selamat Datang, {currentUser?.name || selectedProject.clientName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
              Pantau progres pengerjaan proyek, cetak salinan resmi dokumen legal (CIF, RSD, MoU, BAST), dan lakukan penandatanganan elektronik berkeabsahan hukum.
            </Typography>
          </Box>

          {/* Project Switcher Dropdown */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              minWidth: 260,
              maxWidth: '100%',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              PILIH PROYEK AKTIF KLIEN:
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {availableProjects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {p.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {p.clientName} ({p.progress}% | {p.status})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Paper>
        </Box>
      </Paper>

      {/* Action Required Banner: Document Signature Callout */}
      {pendingSignatureDoc && (
        <Alert
          severity="warning"
          icon={<DrawIcon color="warning" />}
          sx={{
            borderRadius: 3.5,
            mb: 3.5,
            border: '1px solid rgba(245, 158, 11, 0.4)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(251, 191, 36, 0.15)',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.main' }}>
                ✍️ TINDAKAN DIPERLUKAN: Tanda Tangan Dokumen {pendingSignatureDoc.code} Online
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                Dokumen <strong>{pendingSignatureDoc.title}</strong> membutuhkan verifikasi tanda tangan digital dari Anda (Pihak Kedua). Penandatanganan dilakukan aman di browser dengan audit trail UU ITE.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              startIcon={<DrawIcon />}
              onClick={() => handleSignDocument(pendingSignatureDoc.type, pendingSignatureDoc.title)}
              sx={{ fontWeight: 800, borderRadius: 2.5, px: 2.5 }}
            >
              Tanda Tangan {pendingSignatureDoc.code} Sekarang
            </Button>
          </Box>
        </Alert>
      )}

      {/* Overview Metrics Cards for Selected Project */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                Progres Pengerjaan
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)' }}>
                <TrendingUpIcon sx={{ color: '#10b981' }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#10b981' }}>
              {selectedProject.progress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={selectedProject.progress}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(16, 185, 129, 0.2)', mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Tahap: {stageCfg.label}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                Nilai Investasi & Pembayaran
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.15)' }}>
                <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: theme.palette.primary.main }}>
              {formatRupiah(totalBudget)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
              <strong>Terbayar:</strong> {formatRupiah(totalPaidAmount)} ({paymentProgressPct}%)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.2, color: remainingBalance > 0 ? 'warning.main' : 'success.main' }}>
              <strong>Sisa:</strong> {remainingBalance > 0 ? formatRupiah(remainingBalance) : 'LUNAS ✅'}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                Status Tanda Tangan Dokumen
              </Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: signedDocs.length === signatureRequiredDocs.length ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                }}
              >
                <DescriptionIcon
                  sx={{
                    color: signedDocs.length === signatureRequiredDocs.length ? '#10b981' : '#f59e0b',
                  }}
                />
              </Box>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 0.5,
                color: signedDocs.length === signatureRequiredDocs.length ? '#10b981' : '#f59e0b',
              }}
            >
              {signedDocs.length} / {signatureRequiredDocs.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 0.5, lineHeight: 1.3 }}>
              <strong>Sudah TTD:</strong> {signedDocs.map((d) => d.code).join(', ') || 'Belum ada'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                display: 'block',
                mt: 0.3,
                lineHeight: 1.3,
                color: pendingDocs.length > 0 ? '#f59e0b' : '#10b981',
              }}
            >
              <strong>Wajib TTD:</strong> {pendingDocs.map((d) => d.code).join(', ') || 'Lengkap ✅'}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                Target Launching & Garansi
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.15)' }}>
                <ScheduleIcon sx={{ color: '#8b5cf6' }} />
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              {selectedProject.deadline}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
              Garansi Maintenance: 30-90 Hari
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Two-Column Content */}
      <Grid container spacing={3}>
        {/* Left Column: IPW 6-Stage Stepper & Document List */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* IPW 6-Stage Progress Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Alur Pengerjaan IPW 6-Stage Framework
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`Tahap Aktif Proyek: ${stageCfg.shortName}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800, height: 24 }}
                />
                <Chip
                  label={`${selectedProject.progress}% Selesai`}
                  color={selectedProject.progress >= 100 ? 'success' : 'info'}
                  size="small"
                  sx={{ fontWeight: 800, height: 24 }}
                />
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sistem otomatisasi alur kerja real untuk proyek <strong>{selectedProject.title}</strong> dari asesmen awal hingga penyerahan BAST. Klik pada tiap tahap untuk melihat rincian real.
            </Typography>

            <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ pt: 1, pb: 2 }}>
              {IPW_STAGES_LIST.map((stepItem, index) => {
                const isCompleted = index < activeStepIndex;
                const isCurrent = index === activeStepIndex;
                const isSelected = index === (selectedStageStep !== null ? selectedStageStep : activeStepIndex);
                const stepRealStatus = getStageRealStatus(index);

                return (
                  <Step key={stepItem.stage} completed={isCompleted} onClick={() => setSelectedStageStep(index)} style={{ cursor: 'pointer' }}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          fontSize: isSelected ? 30 : isCurrent ? 28 : 24,
                          color: isCurrent
                            ? theme.palette.primary.main
                            : isCompleted
                            ? '#10b981 !important'
                            : undefined,
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isCurrent || isSelected ? 800 : isCompleted ? 700 : 500,
                          fontSize: '0.72rem',
                          color: isSelected ? theme.palette.primary.main : isCurrent ? 'text.primary' : 'text.secondary',
                          display: 'block',
                        }}
                      >
                        Stage {index + 1}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isCurrent || isSelected ? 700 : 500,
                          fontSize: '0.68rem',
                          color: stepRealStatus.isDone ? '#10b981' : isCurrent ? theme.palette.primary.main : 'text.secondary',
                        }}
                      >
                        {stepItem.shortName}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {/* Real Active Stage Details Card */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.92rem' }}>
                  📋 Rincian Real Stage {currentDisplayedIndex + 1}: {currentDisplayedStageCfg.label}
                </Typography>
                <Chip
                  label={`Status: ${displayedRealStatus.statusText}`}
                  color={displayedRealStatus.chipColor}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    Dokumen Berkas SOP Terkait:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {displayedRealStatus.docName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    Target Milestone Stage:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {currentDisplayedStageCfg.progressPercent}% (Progres Real Proyek: {selectedProject.progress}%)
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'text.secondary' }}>
                {currentDisplayedStageCfg.description}
              </Typography>
            </Box>
          </Paper>

          {/* Legal Documents & E-Signature Hub */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Dokumen Legal & Tanda Tangan Elektronik
                </Typography>
              </Box>
              <Chip
                icon={<SecurityIcon sx={{ fontSize: '12px !important' }} />}
                label="UU ITE Validated"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Seluruh dokumen resmi terbit secara otomatis sesuai data proyek Anda. Anda dapat mencetak PDF A4 ber-kop resmi atau menandatangani secara digital.
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Kode & Nama Dokumen</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status Tanda Tangan Klien</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentList.map((docItem) => (
                    <TableRow key={docItem.type} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {docItem.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {docItem.desc}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {docItem.party2Signed ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                            label="Ditandatangani (Sah)"
                            size="small"
                            color="success"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800 }}
                          />
                        ) : docItem.requiresSignature ? (
                          <Chip
                            icon={<DrawIcon sx={{ fontSize: '12px !important' }} />}
                            label="Perlu Tanda Tangan Online"
                            size="small"
                            color="warning"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800 }}
                          />
                        ) : (
                          <Chip
                            label="Dokumen Informasi / SOP"
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenDoc(docItem.type as any)}
                            sx={{ fontSize: '0.72rem', py: 0.3 }}
                          >
                            Cetak / Baca PDF
                          </Button>
                          {docItem.requiresSignature && (
                            <Button
                              size="small"
                              variant={docItem.party2Signed ? 'outlined' : 'contained'}
                              color={docItem.party2Signed ? 'success' : 'warning'}
                              startIcon={<DrawIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleSignDocument(docItem.type, docItem.title)}
                              sx={{ fontSize: '0.72rem', py: 0.3, fontWeight: 700 }}
                            >
                              {docItem.party2Signed ? 'Ubah Tanda Tangan' : 'Tanda Tangan'}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Rincian & Input Pembayaran Proyek */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Rincian & Catatan Transaksi Pembayaran
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenPaymentDialog}
                sx={{ fontWeight: 700, borderRadius: 2.5 }}
              >
                + Catat Pembayaran Baru
              </Button>
            </Box>

            {/* Financial Overview Chips Bar */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    TOTAL NILAI KONTRAK
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {formatRupiah(totalBudget)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#10b981' }}>
                    TOTAL TERBAYAR ({paymentProgressPct}%)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                    {formatRupiah(totalPaidAmount)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)', borderColor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                    SISA PELUNASAN KONTRAK
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                    {remainingBalance > 0 ? formatRupiah(remainingBalance) : 'LUNAS 100% ✅'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Payment Transactions Table */}
            <TableContainer component={Box} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tahap / Termin Pembayaran</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Nominal (IDR)</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Bukti Resi</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Catatan & Ref Transfer</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status Approval</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Aksi / Verifikasi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsList.length > 0 ? (
                    paymentsList.map((pay) => (
                      <TableRow key={pay.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{pay.date}</TableCell>
                        <TableCell>
                          <Chip label={pay.stage} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#10b981' }}>
                          {formatRupiah(pay.amount)}
                        </TableCell>
                        <TableCell>
                          {pay.proofUrl ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                              onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                              sx={{ fontSize: '0.7rem', py: 0.2, fontWeight: 700 }}
                            >
                              Lihat Resi
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Tanpa Resi
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          {pay.notes || '-'}
                        </TableCell>
                        <TableCell>
                          {pay.status === 'VERIFIED' && (
                            <Tooltip title={pay.approvedBy ? `Disetujui oleh ${pay.approvedBy} (${pay.approvedAt || pay.date})` : 'Disetujui Admin'}>
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
                                label="DISUJUJU ✅"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                              />
                            </Tooltip>
                          )}
                          {pay.status === 'PENDING' && (
                            <Tooltip title="Menunggu persetujuan (approval) Admin">
                              <Chip
                                icon={<PendingIcon sx={{ fontSize: '13px !important' }} />}
                                label="PENDING ⏳"
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                              />
                            </Tooltip>
                          )}
                          {pay.status === 'FAILED' && (
                            <Chip
                              icon={<CancelIcon sx={{ fontSize: '13px !important' }} />}
                              label="DITOLAK ❌"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                            {!isClientRole && pay.status === 'PENDING' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                                  onClick={() => handleApprovePayment(pay.id)}
                                  sx={{ fontSize: '0.68rem', py: 0.2, px: 1, fontWeight: 800 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<CancelIcon sx={{ fontSize: 12 }} />}
                                  onClick={() => handleRejectPayment(pay.id)}
                                  sx={{ fontSize: '0.68rem', py: 0.2, px: 0.8, fontWeight: 700 }}
                                >
                                  Tolak
                                </Button>
                              </>
                            )}
                            <IconButton size="small" color="error" onClick={() => handleDeletePaymentRecord(pay.id)} title="Hapus">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Belum ada riwayat transaksi pembayaran yang dicatat. Klik "+ Catat Pembayaran Baru" di atas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Access Control Info, Deliverable Links, Support */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Deliverables & Assets Links */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LaunchIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                Akses Live Staging & Penyerahan
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem' }}>
              Tautan lingkungan pengujian (staging) dan penyerahan aset digital sesuai BAST.
            </Typography>

            <Stack spacing={1.5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Staging App Preview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    URL pengujian aplikasi real-time
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                  href={docs.bast?.mainUrl || docs.qa?.stagingUrl || 'https://staging.atasilabs.com'}
                  target="_blank"
                  sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                >
                  Buka App
                </Button>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Akses Penyerahan Aset Digital & Garansi Maintenance
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Support & Direct Contact Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              💬 Butuh Bantuan atau Diskusi Proyek?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2 }}>
              Tim Project Architect Atasilabs siap melayani Anda melalui WhatsApp atau email resmi.
            </Typography>

            <Stack spacing={1}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                href="https://wa.me/628216361428?text=Halo%20Atasilabs,%20saya%20ingin%20bertanya%20mengenai%20proyek%20saya"
                target="_blank"
                sx={{ fontWeight: 700, borderRadius: 2.5 }}
              >
                Chat Direct WhatsApp Lead
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<EmailIcon />}
                href="mailto:atasilabs@gmail.com"
                sx={{ fontWeight: 700, borderRadius: 2.5 }}
              >
                Kirim Email Dukungan
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Form Dialog Input Pembayaran */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
              Masukkan rincian pembayaran untuk proyek <strong>{selectedProject.title}</strong> ({selectedProject.clientName}). Total Kontrak: <strong>{formatRupiah(totalBudget)}</strong>.
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
          <Button variant="contained" color="primary" onClick={handleSavePaymentRecord} sx={{ fontWeight: 700, borderRadius: 2 }}>
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

      {/* Signature Dialog Modal */}
      <SignatureDialog
        open={signatureModal.open}
        onClose={() => setSignatureModal((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveSignature}
        signerTitle={`Tanda Tangan Digital ${signatureModal.docTitle}`}
        defaultSignerName={currentUser?.name || selectedProject.clientName}
        defaultSignerRole={currentUser?.company || 'Klien / Pihak Kedua'}
        partyType="Pihak Kedua"
        isSignerNameLocked={true}
      />
    </Box>
  );
};
