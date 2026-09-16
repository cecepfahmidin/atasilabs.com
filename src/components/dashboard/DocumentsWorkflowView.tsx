'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  AutoAwesome as AutoIcon,
  RestartAlt as ResetIcon,
  Gesture as DrawIcon,
  VerifiedUser as SecurityIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import {
  INITIAL_CIF_DATA,
  INITIAL_RSD_DATA,
  INITIAL_MOU_DATA,
  INITIAL_SPK_DATA,
  INITIAL_BAST_DATA,
  INITIAL_QA_DATA,
} from '../../data/initialDocuments';
import { DocumentTemplates } from './DocumentTemplates';
import { DocumentFormDialog } from './DocumentFormDialog';
import { SignatureDialog } from './SignatureDialog';
import { CIFData, RSDData, MoUData, SPKData, BASTData, DigitalSignatureData, QAData } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateAutoDocumentsForProject, generateQAFromRSD } from '../../lib/documentGenerator';

import { useSearchParams } from 'next/navigation';

const LOCAL_STORAGE_KEY_CUSTOM_DOCS = 'atasilabs_custom_project_documents';

const getSavedCustomDocs = (): Record<string, any> => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
};

export const DocumentsWorkflowView: React.FC = () => {
  const {
    projects: rawProjects,
    currentUser,
    showNotification,
    selectedDocumentProjectId,
    setSelectedDocumentProjectId,
    selectedDocumentType,
    setSelectedDocumentType,
  } = useApp();

  const isClientRole = currentUser?.role === 'CLIENT';

  const projects = useMemo(() => {
    const filteredProjects = isClientRole
      ? rawProjects.filter(
          (p) =>
            p.clientEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
            p.clientName?.toLowerCase().includes(currentUser?.company?.toLowerCase() || '___')
        )
      : rawProjects;
    return filteredProjects.length > 0 ? filteredProjects : rawProjects;
  }, [rawProjects, currentUser, isClientRole]);

  const searchParams = useSearchParams();

  // Active Project Selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    selectedDocumentProjectId || projects[0]?.id || 'proj-1'
  );

  // Document states
  const [activeDocType, setActiveDocType] = useState<'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA'>(
    selectedDocumentType || 'CIF'
  );

  // Sync project selection from search params or AppContext
  useEffect(() => {
    const qProjId = searchParams.get('projectId');
    const qDocType = searchParams.get('docType');

    if (qProjId && projects.some((p) => p.id === qProjId)) {
      setSelectedProjectId((prev) => (prev !== qProjId ? qProjId : prev));
      setSelectedDocumentProjectId(qProjId);
    } else if (selectedDocumentProjectId && projects.some((p) => p.id === selectedDocumentProjectId)) {
      setSelectedProjectId((prev) => (prev !== selectedDocumentProjectId ? selectedDocumentProjectId : prev));
    }

    if (qDocType) {
      const upper = qDocType.toUpperCase();
      if (['CIF', 'RSD', 'MOU', 'SPK', 'BAST', 'QA'].includes(upper)) {
        setActiveDocType((prev) => (prev !== upper ? (upper as any) : prev));
        setSelectedDocumentType(upper as any);
      }
    } else if (selectedDocumentType) {
      setActiveDocType((prev) => (prev !== selectedDocumentType ? (selectedDocumentType as any) : prev));
    }
  }, [searchParams, projects, selectedDocumentProjectId, selectedDocumentType, setSelectedDocumentProjectId, setSelectedDocumentType]);
  const [cifData, setCifData] = useState<CIFData>(INITIAL_CIF_DATA[0]);
  const [rsdData, setRsdData] = useState<RSDData>(INITIAL_RSD_DATA[0]);
  const [mouData, setMouData] = useState<MoUData>(INITIAL_MOU_DATA[0]);
  const [spkData, setSpkData] = useState<SPKData>(INITIAL_SPK_DATA[0]);
  const [bastData, setBastData] = useState<BASTData>(INITIAL_BAST_DATA[0]);
  const [qaData, setQaData] = useState<QAData>(INITIAL_QA_DATA[0]);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSigDialogOpen, setIsSigDialogOpen] = useState(false);
  const [sigPartyTarget, setSigPartyTarget] = useState<'Pihak Pertama' | 'Pihak Kedua'>('Pihak Pertama');

  // Load documents for selected project (check LocalStorage first, fallback to Auto-Gen)
  useEffect(() => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (proj) {
      const autoDocs = generateAutoDocumentsForProject(proj);
      const allCustom = getSavedCustomDocs();
      const projCustom = allCustom[selectedProjectId] || {};

      const activeRsd = projCustom.rsd || autoDocs.rsd;
      const syncedQa = generateQAFromRSD(activeRsd, proj, projCustom.qa || autoDocs.qa);

      setCifData(projCustom.cif || autoDocs.cif);
      setRsdData(activeRsd);
      setMouData(projCustom.mou || autoDocs.mou);
      setSpkData(projCustom.spk || autoDocs.spk);
      setBastData(projCustom.bast || autoDocs.bast);
      setQaData(syncedQa);
    }
  }, [selectedProjectId, projects]);

  // Active document for preview
  const getActiveDocData = () => {
    switch (activeDocType) {
      case 'CIF':
        return cifData;
      case 'RSD':
        return rsdData;
      case 'MOU':
        return mouData;
      case 'SPK':
        return spkData;
      case 'BAST':
        return bastData;
      case 'QA':
        return qaData;
    }
  };

  const handleSaveDocument = (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA', data: any) => {
    const docKey = type.toLowerCase();
    const proj = projects.find((p) => p.id === selectedProjectId);

    // 1. Update React State
    switch (type) {
      case 'CIF':
        setCifData(data);
        break;
      case 'RSD':
        setRsdData(data);
        if (proj) {
          const syncedQa = generateQAFromRSD(data, proj, qaData);
          setQaData(syncedQa);
        }
        break;
      case 'MOU':
        setMouData(data);
        break;
      case 'SPK':
        setSpkData(data);
        break;
      case 'BAST':
        setBastData(data);
        break;
      case 'QA':
        setQaData(data);
        break;
    }

    // 2. Persist to LocalStorage for selectedProjectId
    try {
      const allCustomDocs = getSavedCustomDocs();
      const projectDocs = allCustomDocs[selectedProjectId] || {};
      const updatedDocs = {
        ...projectDocs,
        [docKey]: data,
      };

      if (type === 'RSD' && proj) {
        updatedDocs.qa = generateQAFromRSD(data, proj, qaData);
      }

      allCustomDocs[selectedProjectId] = updatedDocs;
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(allCustomDocs));
    } catch (e) {
      console.error(e);
    }

    showNotification(`Dokumen ${type} berhasil diperbarui & disimpan!`, 'success');
  };

  const handleSyncQAFromRSD = () => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    const freshQa = generateQAFromRSD(rsdData, proj);
    setQaData(freshQa);

    try {
      const allCustomDocs = getSavedCustomDocs();
      const projectDocs = allCustomDocs[selectedProjectId] || {};
      allCustomDocs[selectedProjectId] = {
        ...projectDocs,
        qa: freshQa,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(allCustomDocs));
    } catch (e) {
      console.error(e);
    }

    showNotification(`Dokumen QA berhasil di-sync ulang 100% dari spesifikasi RSD (${rsdData.functionalFeatures?.length || 0} fitur)!`, 'success');
  };

  const handleOpenSignatureDialog = (party: 'Pihak Pertama' | 'Pihak Kedua') => {
    setSigPartyTarget(party);
    setIsSigDialogOpen(true);
  };

  const handleSaveSignature = (sigData: DigitalSignatureData) => {
    const currentDoc = getActiveDocData() as any;
    if (!currentDoc) return;

    const isParty1 = sigPartyTarget === 'Pihak Pertama';
    const updatedDoc: any = {
      ...currentDoc,
      [isParty1 ? 'party1Signature' : 'party2Signature']: sigData,
    };

    const newName = sigData.auditTrail?.signedBy;
    const newRole = sigData.auditTrail?.signerRole;

    if (newName) {
      if (activeDocType === 'MOU' || activeDocType === 'BAST') {
        if (isParty1) {
          updatedDoc.atasilabsPic = newName;
          if (newRole) updatedDoc.atasilabsRole = newRole;
        } else {
          updatedDoc.clientPic = newName;
          if (newRole) updatedDoc.clientRole = newRole;
        }
      } else if (activeDocType === 'SPK') {
        if (isParty1) {
          updatedDoc.atasilabsPic = newName;
          if (newRole) updatedDoc.atasilabsRole = newRole;
        } else {
          updatedDoc.freelancerName = newName;
        }
      } else if (activeDocType === 'CIF') {
        if (isParty1) updatedDoc.adminName = newName;
        else updatedDoc.picName = newName;
      } else if (activeDocType === 'RSD') {
        if (isParty1) updatedDoc.authorITLead = newName;
        else updatedDoc.freelancerName = newName;
      } else if (activeDocType === 'QA') {
        if (isParty1) updatedDoc.qaLeadName = newName;
        else updatedDoc.clientPic = newName;
      }
    }

    handleSaveDocument(activeDocType, updatedDoc);
    showNotification(`Tanda Tangan Canvas & Audit Trail (${sigPartyTarget}) tersimpan di ${activeDocType}!`, 'success');
  };

  const getSignerDefaultInfo = () => {
    const doc = getActiveDocData() as any;
    if (sigPartyTarget === 'Pihak Pertama') {
      return {
        name: doc?.party1Signature?.auditTrail?.signedBy || doc?.atasilabsPic || doc?.adminName || doc?.authorITLead || doc?.qaLeadName || 'Cecep Fahmidin',
        role: doc?.party1Signature?.auditTrail?.signerRole || doc?.atasilabsRole || (activeDocType === 'QA' ? 'QA Lead / Tech Lead' : 'Founder & CEO Atasilabs'),
      };
    } else {
      return {
        name: doc?.party2Signature?.auditTrail?.signedBy || doc?.clientPic || doc?.picName || doc?.freelancerName || doc?.testerName || 'Klien / Partner',
        role: doc?.party2Signature?.auditTrail?.signerRole || doc?.clientRole || doc?.picRole || 'Direktur / Penanggung Jawab',
      };
    }
  };

  const handleResetDocumentToDefault = () => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    const autoDocs = generateAutoDocumentsForProject(proj);
    setCifData(autoDocs.cif);
    setRsdData(autoDocs.rsd);
    setMouData(autoDocs.mou);
    setSpkData(autoDocs.spk);
    setBastData(autoDocs.bast);
    setQaData(autoDocs.qa);

    try {
      const allCustomDocs = getSavedCustomDocs();
      delete allCustomDocs[selectedProjectId];
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(allCustomDocs));
    } catch (e) {
      console.error(e);
    }

    showNotification(`Seluruh dokumen untuk ${proj.clientName} dikembalikan ke standar otomatis!`, 'info');
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedProjObj = projects.find((p) => p.id === selectedProjectId);
  const signerInfo = getSignerDefaultInfo();

  if (!isMounted) {
    return (
      <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Memuat Dokumen & Administrasi Proyek...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Hub Dokumen & Generator Administrasi Proyek
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '16px !important' }} />}
            label="Tanda Tangan Digital (Canvas & Audit Trail)"
            color="success"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Mendukung coretan tanda tangan visual + stempel waktu, IP address, & verifikasi metadata UU ITE.
          </Typography>
        </Box>
      </Box>

      {/* Main Document Generator Container */}
      <Box>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          {/* Project Selection Banner */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                Pilih Proyek Klien (Dokumen Auto-Gen):
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((proj) => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.clientName} — {proj.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={7} textAlign={{ sm: 'right' }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' }, flexWrap: 'wrap', mt: { xs: 1, sm: 2.5 } }}>
                {!isClientRole && activeDocType === 'QA' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncQAFromRSD}
                    sx={{ fontWeight: 700 }}
                  >
                    Sync dari RSD
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<DrawIcon />}
                  onClick={() => handleOpenSignatureDialog(isClientRole ? 'Pihak Kedua' : 'Pihak Pertama')}
                  sx={{ fontWeight: 700 }}
                >
                  {isClientRole ? `Tanda Tangan Klien (${activeDocType})` : `Tanda Tangani (${activeDocType})`}
                </Button>
                {!isClientRole && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<ResetIcon />}
                    onClick={handleResetDocumentToDefault}
                    sx={{ fontWeight: 700 }}
                  >
                    Reset Dokumen
                  </Button>
                )}
                {!isClientRole && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setIsFormOpen(true)}
                    sx={{ fontWeight: 700 }}
                  >
                    Edit Form ({activeDocType})
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {selectedProjObj && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.78rem', py: 0.5 }}>
              Dokumen saat ini untuk <strong>{selectedProjObj.clientName}</strong> ({selectedProjObj.title} — Budget: Rp {selectedProjObj.budget?.toLocaleString('id-ID')}). Seluruh tanda tangan digital & kustomisasi tersimpan permanen per proyek.
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Pilih Dokumen Administrasi Operasional (SOP 6-Stage IPW):
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { id: 'CIF', label: '1. CIF Intake', color: '#64748b' },
              { id: 'RSD', label: '2. RSD Spec', color: '#06b6d4' },
              { id: 'MOU', label: '3. MoU Kontrak', color: '#f59e0b' },
              { id: 'SPK', label: '4. SPK Freelancer', color: '#3b82f6', internalOnly: true },
              { id: 'QA', label: '5. QA & UAT', color: '#ec4899' },
              { id: 'BAST', label: '6. BAST Selesai', color: '#10b981' },
            ]
              .filter((doc) => !isClientRole || !doc.internalOnly)
              .map((doc) => (
              <Grid item xs={6} sm={2} key={doc.id}>
                <Button
                  fullWidth
                  variant={activeDocType === doc.id ? 'contained' : 'outlined'}
                  onClick={() => {
                    setActiveDocType(doc.id as any);
                    setSelectedDocumentType(doc.id as any);
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    py: 1,
                    borderColor: doc.color,
                    bgcolor: activeDocType === doc.id ? doc.color : 'transparent',
                    color: activeDocType === doc.id ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: doc.color,
                      color: '#fff',
                    },
                  }}
                >
                  {doc.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Document Preview Component */}
        <DocumentTemplates
          type={activeDocType}
          data={getActiveDocData()}
          onSignParty1={() => handleOpenSignatureDialog('Pihak Pertama')}
          onSignParty2={() => handleOpenSignatureDialog('Pihak Kedua')}
          onUpdateQA={(updatedQA) => handleSaveDocument('QA', updatedQA)}
        />

        {/* Form Dialog Generator */}
        <DocumentFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          type={activeDocType}
          initialData={getActiveDocData()}
          onSave={handleSaveDocument}
        />

        {/* Signature Canvas & Audit Trail Dialog */}
        <SignatureDialog
          open={isSigDialogOpen}
          onClose={() => setIsSigDialogOpen(false)}
          onSave={handleSaveSignature}
          signerTitle={`Tanda Tangan Dokumen ${activeDocType}`}
          defaultSignerName={signerInfo.name}
          defaultSignerRole={signerInfo.role}
          partyType={sigPartyTarget}
        />
      </Box>
    </Box>
  );
};
