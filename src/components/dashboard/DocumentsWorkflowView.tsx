'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import {
  INITIAL_CIF_DATA,
  INITIAL_RSD_DATA,
  INITIAL_MOU_DATA,
  INITIAL_SPK_DATA,
  INITIAL_BAST_DATA,
} from '../../data/initialDocuments';
import { DocumentTemplates } from './DocumentTemplates';
import { DocumentFormDialog } from './DocumentFormDialog';
import { SignatureDialog } from './SignatureDialog';
import { CIFData, RSDData, MoUData, SPKData, BASTData, DigitalSignatureData } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateAutoDocumentsForProject } from '../../lib/documentGenerator';

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
  const { projects, showNotification } = useApp();

  // Active Project Selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');

  // Document states
  const [activeDocType, setActiveDocType] = useState<'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST'>('CIF');
  const [cifData, setCifData] = useState<CIFData>(INITIAL_CIF_DATA[0]);
  const [rsdData, setRsdData] = useState<RSDData>(INITIAL_RSD_DATA[0]);
  const [mouData, setMouData] = useState<MoUData>(INITIAL_MOU_DATA[0]);
  const [spkData, setSpkData] = useState<SPKData>(INITIAL_SPK_DATA[0]);
  const [bastData, setBastData] = useState<BASTData>(INITIAL_BAST_DATA[0]);

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

      setCifData(projCustom.cif || autoDocs.cif);
      setRsdData(projCustom.rsd || autoDocs.rsd);
      setMouData(projCustom.mou || autoDocs.mou);
      setSpkData(projCustom.spk || autoDocs.spk);
      setBastData(projCustom.bast || autoDocs.bast);
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
    }
  };

  const handleSaveDocument = (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST', data: any) => {
    const docKey = type.toLowerCase();

    // 1. Update React State
    switch (type) {
      case 'CIF':
        setCifData(data);
        break;
      case 'RSD':
        setRsdData(data);
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
    }

    // 2. Persist to LocalStorage for selectedProjectId
    try {
      const allCustomDocs = getSavedCustomDocs();
      const projectDocs = allCustomDocs[selectedProjectId] || {};
      allCustomDocs[selectedProjectId] = {
        ...projectDocs,
        [docKey]: data,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(allCustomDocs));
    } catch (e) {
      console.error(e);
    }

    showNotification(`Dokumen ${type} berhasil diperbarui & disimpan!`, 'success');
  };

  const handleOpenSignatureDialog = (party: 'Pihak Pertama' | 'Pihak Kedua') => {
    setSigPartyTarget(party);
    setIsSigDialogOpen(true);
  };

  const handleSaveSignature = (sigData: DigitalSignatureData) => {
    const currentDoc = getActiveDocData();
    const updatedDoc = {
      ...currentDoc,
      [sigPartyTarget === 'Pihak Pertama' ? 'party1Signature' : 'party2Signature']: sigData,
    };
    handleSaveDocument(activeDocType, updatedDoc);
    showNotification(`Tanda Tangan Canvas & Audit Trail (${sigPartyTarget}) tersimpan di ${activeDocType}!`, 'success');
  };

  const getSignerDefaultInfo = () => {
    const doc = getActiveDocData() as any;
    if (sigPartyTarget === 'Pihak Pertama') {
      return {
        name: doc?.atasilabsPic || doc?.adminName || doc?.authorITLead || 'Cecep Fahmidin',
        role: doc?.atasilabsRole || 'Founder & CEO Atasilabs',
      };
    } else {
      return {
        name: doc?.clientPic || doc?.picName || doc?.freelancerName || 'Klien / Partner',
        role: doc?.clientRole || doc?.picRole || 'Direktur / Penanggung Jawab',
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

    try {
      const allCustomDocs = getSavedCustomDocs();
      delete allCustomDocs[selectedProjectId];
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(allCustomDocs));
    } catch (e) {
      console.error(e);
    }

    showNotification(`Seluruh dokumen untuk ${proj.clientName} dikembalikan ke standar otomatis!`, 'info');
  };

  const selectedProjObj = projects.find((p) => p.id === selectedProjectId);
  const signerInfo = getSignerDefaultInfo();

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
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<DrawIcon />}
                  onClick={() => handleOpenSignatureDialog('Pihak Pertama')}
                  sx={{ fontWeight: 700 }}
                >
                  Tanda Tangani ({activeDocType})
                </Button>
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
              </Box>
            </Grid>
          </Grid>

          {selectedProjObj && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.78rem', py: 0.5 }}>
              Dokumen saat ini untuk <strong>{selectedProjObj.clientName}</strong> ({selectedProjObj.title} — Budget: Rp {selectedProjObj.budget?.toLocaleString('id-ID')}). Seluruh tanda tangan digital & kustomisasi tersimpan permanen per proyek.
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Pilih Dokumen Administrasi:
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { id: 'CIF', label: '1. CIF (Client Intake)', color: '#3b82f6' },
              { id: 'RSD', label: '2. RSD (Technical Spec)', color: '#10b981' },
              { id: 'MOU', label: '3. MoU / Kontrak Klien', color: '#f59e0b' },
              { id: 'SPK', label: '4. SPK (Kontrak Freelancer)', color: '#8b5cf6' },
              { id: 'BAST', label: '5. BAST (Serah Terima)', color: '#ec4899' },
            ].map((doc) => (
              <Grid item xs={6} sm={2.4} key={doc.id}>
                <Button
                  fullWidth
                  variant={activeDocType === doc.id ? 'contained' : 'outlined'}
                  onClick={() => setActiveDocType(doc.id as any)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
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
