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
import { CIFData, RSDData, MoUData, SPKData, BASTData } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateAutoDocumentsForProject } from '../../lib/documentGenerator';

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

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Auto-generate documents whenever selected project changes
  useEffect(() => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (proj) {
      const autoDocs = generateAutoDocumentsForProject(proj);
      setCifData(autoDocs.cif);
      setRsdData(autoDocs.rsd);
      setMouData(autoDocs.mou);
      setSpkData(autoDocs.spk);
      setBastData(autoDocs.bast);
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
    showNotification(`Dokumen ${type} berhasil diperbarui!`, 'success');
  };

  const selectedProjObj = projects.find((p) => p.id === selectedProjectId);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Hub Dokumen & Generator Administrasi Proyek
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            icon={<AutoIcon sx={{ fontSize: '16px !important' }} />}
            label="Otomatisasi Dokumen Legal & Teknis"
            color="success"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Setiap proyek terdaftar otomatis meng-generate 5 paket dokumen legal (CIF, RSD, MoU, SPK, BAST).
          </Typography>
        </Box>
      </Box>

      {/* Main Document Generator Container */}
      <Box>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
          {/* Project Selection Banner */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6} textAlign={{ sm: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setIsFormOpen(true)}
                sx={{ fontWeight: 700, mt: { xs: 1, sm: 2.5 } }}
              >
                Kustomisasi / Edit Form ({activeDocType})
              </Button>
            </Grid>
          </Grid>

          {selectedProjObj && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.78rem', py: 0.5 }}>
              Dokumen saat ini dihasilkan secara otomatis untuk <strong>{selectedProjObj.clientName}</strong> ({selectedProjObj.title} — Budget: Rp {selectedProjObj.budget?.toLocaleString('id-ID')}).
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
        <DocumentTemplates type={activeDocType} data={getActiveDocData()} />

        {/* Form Dialog Generator */}
        <DocumentFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          type={activeDocType}
          initialData={getActiveDocData()}
          onSave={handleSaveDocument}
        />
      </Box>
    </Box>
  );
};
