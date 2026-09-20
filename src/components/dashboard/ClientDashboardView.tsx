'use client';

import React, { useState, useMemo } from 'react';
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
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, DigitalSignatureData, DocumentType } from '../../types';
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

      allCustom[selectedProject.id] = {
        ...projCustom,
        [docTypeKey]: updatedDoc,
      };

      localStorage.setItem(storageKey, JSON.stringify(allCustom));
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
                Nilai Investasi Kontrak (MoU)
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.15)' }}>
                <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: theme.palette.primary.main }}>
              {formatRupiah(selectedProject.budget)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 1 }}>
              Kategori: Tier {selectedProject.tierNumber || 3}
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
                Kelengkapan Dokumen Legal
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.15)' }}>
                <DescriptionIcon sx={{ color: '#3b82f6' }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#3b82f6' }}>
              5 / 5
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mt: 1 }}>
              CIF, RSD, MoU, QA Report, BAST Ready
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Alur Pengerjaan IPW 6-Stage Framework
                </Typography>
              </Box>
              <Chip
                label={`Tahap Aktif: ${stageCfg.label}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 800, height: 22 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sistem otomatisasi alur kerja studio dari asesmen awal hingga penyerahan aset digital bergaransi.
            </Typography>

            <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ pt: 1, pb: 2 }}>
              {IPW_STAGES_LIST.map((stepItem, index) => {
                const isCompleted = index < activeStepIndex;
                const isCurrent = index === activeStepIndex;
                return (
                  <Step key={stepItem.stage} completed={isCompleted}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          fontSize: isCurrent ? 28 : 24,
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
                          fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                          fontSize: '0.72rem',
                          color: isCurrent ? 'text.primary' : 'text.secondary',
                          display: 'block',
                        }}
                      >
                        Stage {index + 1}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isCurrent ? 700 : 500,
                          fontSize: '0.68rem',
                          color: isCurrent ? theme.palette.primary.main : 'text.secondary',
                        }}
                      >
                        {stepItem.shortName}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                📋 Rincian Tahap Aktif saat ini: {stageCfg.label}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                {stageCfg.description}
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
                    Source Code & Repositori
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {docs.bast?.sourceCodeAccess || 'Diberikan saat BAST disetujui'}
                  </Typography>
                </Box>
                <Chip label="Protected" size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
              </Paper>
            </Stack>
          </Paper>

          {/* Client Access Rights Transparency Matrix */}
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
              <SecurityIcon color="success" />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                Matriks Hak Akses Klien
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem' }}>
              Transparansi hak akses portal klien sesuai peran otentikasi RBAC.
            </Typography>

            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Monitor Progres & Milestone IPW Real-time
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Akses & Cetak Dokumen Legal (CIF, RSD, MoU, BAST)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Penandatanganan Digital Sah Berkeabsahan Hukum
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Akses Penyerahan Aset Digital & Garansi Maintenance
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.7 }}>
                <LockIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontStyle: 'italic' }}>
                  Restriksi Privasi Internal (Biaya HPP & Fee Developer)
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

      {/* Signature Dialog Modal */}
      <SignatureDialog
        open={signatureModal.open}
        onClose={() => setSignatureModal((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveSignature}
        signerTitle={`Tanda Tangan Digital ${signatureModal.docTitle}`}
        defaultSignerName={currentUser?.name || selectedProject.clientName}
        defaultSignerRole={currentUser?.company || 'Klien / Pihak Kedua'}
        partyType="Pihak Kedua"
      />
    </Box>
  );
};
