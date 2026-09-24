'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Paper,
  Stack,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CIFData, RSDData, MoUData, SPKData, BASTData, RSDFeatureItem, RSDTechComponent, RSDMilestone, QAData, QATestItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { getPriceForTier, getFreelancerFeeForTier, inferTierFromFee, getDynamicHppMatrix } from '../../lib/pricingUtils';
import { numberToWordsIDR } from '../../lib/documentGenerator';
import { parseIndonesianDateParts } from './DocumentTemplates';

interface DocumentFormDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA';
  initialData: CIFData | RSDData | MoUData | SPKData | BASTData | QAData;
  onSave: (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA', data: any) => void;
}

export const DocumentFormDialog: React.FC<DocumentFormDialogProps> = ({
  open,
  onClose,
  type,
  initialData,
  onSave,
}) => {
  const { users, pricingTiers } = useApp();
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (open) {
      setFormData(initialData);
    }
  }, [open, type, initialData?.id]);

  // Dynamic user option maps derived strictly from registered users in AppContext
  const internalTeamOptionsMap = new Map<string, { name: string; role: string; label: string }>();
  const freelancerOptionsMap = new Map<string, { name: string; role: string; label: string }>();

  (users || []).forEach((u) => {
    const labelStr = `${u.name} (${u.role})`;
    if (['CEO', 'CTO', 'CMO', 'ADMIN', 'DEVELOPER'].includes(u.role)) {
      internalTeamOptionsMap.set(u.name, { name: u.name, role: u.role, label: labelStr });
    }
    if (['FREELANCER', 'DEVELOPER', 'CTO'].includes(u.role)) {
      freelancerOptionsMap.set(u.name, { name: u.name, role: u.role, label: labelStr });
    }
  });

  // Preserve existing custom document field values if set
  if (formData?.adminName && !internalTeamOptionsMap.has(formData.adminName)) {
    internalTeamOptionsMap.set(formData.adminName, { name: formData.adminName, role: 'ADMIN', label: formData.adminName });
  }
  if (formData?.authorITLead && !internalTeamOptionsMap.has(formData.authorITLead)) {
    internalTeamOptionsMap.set(formData.authorITLead, { name: formData.authorITLead, role: 'CTO', label: formData.authorITLead });
  }
  if (formData?.atasilabsPic && !internalTeamOptionsMap.has(formData.atasilabsPic)) {
    internalTeamOptionsMap.set(formData.atasilabsPic, { name: formData.atasilabsPic, role: 'CEO', label: formData.atasilabsPic });
  }
  if (formData?.qaLeadName && !internalTeamOptionsMap.has(formData.qaLeadName)) {
    internalTeamOptionsMap.set(formData.qaLeadName, { name: formData.qaLeadName, role: 'QA', label: formData.qaLeadName });
  }
  if (formData?.freelancerName && !freelancerOptionsMap.has(formData.freelancerName)) {
    freelancerOptionsMap.set(formData.freelancerName, { name: formData.freelancerName, role: 'FREELANCER', label: formData.freelancerName });
  }
  if (formData?.testerName && !freelancerOptionsMap.has(formData.testerName) && !internalTeamOptionsMap.has(formData.testerName)) {
    freelancerOptionsMap.set(formData.testerName, { name: formData.testerName, role: 'TESTER', label: formData.testerName });
  }

  const executiveAdminOptions = Array.from(internalTeamOptionsMap.values());
  const freelancerOptions = Array.from(freelancerOptionsMap.values());
  const combinedTeamOptions = Array.from(
    new Map([...internalTeamOptionsMap.entries(), ...freelancerOptionsMap.entries()]).values()
  );

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      if (field === 'date' || field === 'issueDate') {
        const { dayName } = parseIndonesianDateParts(value);
        if (dayName && dayName !== '............') {
          updated.dayName = dayName;
        }
      }
      return updated;
    });
  };

  const handleTierSelectChange = (newTier: string) => {
    const autoPrice = getPriceForTier(newTier, pricingTiers);
    const isTier1_2 = newTier.includes('Tier 1') || newTier.includes('Tier 2');
    setFormData((prev: any) => ({
      ...prev,
      tier: newTier,
      estimatedBudget: autoPrice,
      paymentScheme: isTier1_2
        ? { dpPercent: 50, midPercent: 0, finalPercent: 50 }
        : { dpPercent: 30, midPercent: 30, finalPercent: 40 },
    }));
  };

  const handleSpkTierChange = (newTier: string) => {
    const fee = getFreelancerFeeForTier(newTier);
    const dpPct = formData?.dpPercent || 40;
    const dpNom = Math.round(fee * (dpPct / 100));
    const finalNom = fee - dpNom;

    setFormData((prev: any) => ({
      ...prev,
      tier: newTier,
      totalNominal: fee,
      totalNominalTerbilang: numberToWordsIDR(fee),
      dpNominal: dpNom,
      finalNominal: finalNom,
    }));
  };

  const handleSpkFeeNominalChange = (nominal: number) => {
    const dpPct = formData?.dpPercent || 40;
    const dpNom = Math.round(nominal * (dpPct / 100));
    const finalNom = nominal - dpNom;

    setFormData((prev: any) => ({
      ...prev,
      totalNominal: nominal,
      totalNominalTerbilang: numberToWordsIDR(nominal),
      dpNominal: dpNom,
      finalNominal: finalNom,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Dynamic RSD Feature Item Management
  const handleAddRsdFeature = () => {
    const featCount = (formData.functionalFeatures?.length || 0) + 1;
    const newFeat: RSDFeatureItem = {
      id: `f-${Date.now()}`,
      featureCode: `ATL-${String(featCount).padStart(3, '0')}`,
      moduleArea: 'Modul Baru',
      nameAndDesc: 'Nama & Deskripsi Spesifikasi Fitur',
      roleAccess: 'All User',
      priority: 'High',
    };
    setFormData((prev: any) => ({
      ...prev,
      functionalFeatures: [...(prev.functionalFeatures || []), newFeat],
    }));
  };

  const handleUpdateRsdFeature = (index: number, field: string, val: any) => {
    setFormData((prev: any) => {
      const updated = [...(prev.functionalFeatures || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, functionalFeatures: updated };
    });
  };

  const handleDeleteRsdFeature = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      functionalFeatures: (prev.functionalFeatures || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Dynamic RSD Tech Stack Component Management
  const handleAddRsdTechStack = () => {
    const newStack: RSDTechComponent = {
      component: 'Infrastructure / Cloud',
      techFramework: 'Vercel PaaS / Supabase Cloud',
      versionSpec: 'Enterprise Cloud',
      reason: 'Deployment global serverless & auto-scaling',
    };
    setFormData((prev: any) => ({
      ...prev,
      techStack: [...(prev.techStack || []), newStack],
    }));
  };

  const handleUpdateRsdTechStack = (index: number, field: string, val: any) => {
    setFormData((prev: any) => {
      const updated = [...(prev.techStack || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, techStack: updated };
    });
  };

  const handleDeleteRsdTechStack = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      techStack: (prev.techStack || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Dynamic RSD Milestone Management
  const handleAddRsdMilestone = () => {
    const count = (formData.milestones?.length || 0) + 1;
    const newMs: RSDMilestone = {
      name: `Sprints ${count}`,
      scope: 'Rincian pekerjaan & deliverable',
      durationDays: 5,
      targetDate: new Date().toISOString().split('T')[0],
    };
    setFormData((prev: any) => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMs],
    }));
  };

  const handleUpdateRsdMilestone = (index: number, field: string, val: any) => {
    setFormData((prev: any) => {
      const updated = [...(prev.milestones || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, milestones: updated };
    });
  };

  const handleDeleteRsdMilestone = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      milestones: (prev.milestones || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Dynamic QA Test Item Management
  const handleAddQaTestItem = () => {
    const count = (formData.testItems?.length || 0) + 1;
    const newItem: QATestItem = {
      id: `tc-${Date.now()}`,
      category: `RSD [ATL-${String(count).padStart(3, '0')}] - Modul Baru`,
      testCase: 'Skenario Pengujian Fitur',
      expectedResult: 'Fungsi berjalan normal',
      status: 'PASSED',
      notes: 'Catatan QA',
    };
    setFormData((prev: any) => ({
      ...prev,
      testItems: [...(prev.testItems || []), newItem],
    }));
  };

  const handleUpdateQaTestItem = (index: number, field: string, val: any) => {
    setFormData((prev: any) => {
      const updated = [...(prev.testItems || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, testItems: updated };
    });
  };

  const handleDeleteQaTestItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      testItems: (prev.testItems || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Dynamic CIF Note Row Management
  const handleAddCifNoteRow = () => {
    setFormData((prev: any) => ({
      ...prev,
      additionalNotesTable: [
        ...(prev.additionalNotesTable || []),
        { prihal: 'Prihal / Topik', catatan: 'Rincian Catatan' },
      ],
    }));
  };

  const handleUpdateCifNoteRow = (index: number, field: 'prihal' | 'catatan', val: string) => {
    setFormData((prev: any) => {
      const updated = [...(prev.additionalNotesTable || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, additionalNotesTable: updated };
    });
  };

  const handleDeleteCifNoteRow = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalNotesTable: (prev.additionalNotesTable || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleUpdateReferenceWebsite = (index: number, val: string) => {
    setFormData((prev: any) => {
      const refs = [...(prev.referenceWebsites || ['', '', ''])];
      refs[index] = val;
      return { ...prev, referenceWebsites: refs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={type} color="primary" size="small" sx={{ fontWeight: 800 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Form Generator & Editor Dokumen {type}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} id="doc-generator-form" sx={{ py: 1 }}>
          {/* CIF Form Fields */}
          {type === 'CIF' && (
            <Grid container spacing={2}>
              {/* Header Meta */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="No. Dokumen CIF"
                  value={formData?.docNumber || ''}
                  onChange={(e) => handleChange('docNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Nama Admin / Penanggung Jawab"
                  value={formData?.adminName || ''}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  required
                >
                  {executiveAdminOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal Dokumen"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sumber Informasi Lead"
                  value={formData?.infoSource || ''}
                  onChange={(e) => handleChange('infoSource', e.target.value)}
                />
              </Grid>

              {/* SECTION 1 */}
              <Grid item xs={12}><Divider><Chip label="1. Informasi Umum Klien & Proyek" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Klien / Perusahaan"
                  value={formData?.clientName || ''}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Penanggung Jawab (PIC)*"
                  value={formData?.picName || ''}
                  onChange={(e) => handleChange('picName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Kontak (Email / WhatsApp)"
                  value={formData?.contact || ''}
                  onChange={(e) => handleChange('contact', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bidang Usaha / Industri"
                  value={formData?.industry || ''}
                  onChange={(e) => handleChange('industry', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Website Klien (jika ada)"
                  value={formData?.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Lokasi / Tempat Usaha Klien"
                  value={formData?.businessLocation || ''}
                  onChange={(e) => handleChange('businessLocation', e.target.value)}
                />
              </Grid>

              {/* SECTION 2 */}
              <Grid item xs={12}><Divider><Chip label="2. Profil Proyek & Tujuan Bisnis" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Ringkasan Proyek"
                  value={formData?.projectSummary || ''}
                  onChange={(e) => handleChange('projectSummary', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Tujuan Utama Pembuatan Website (Primary Goals)"
                  value={formData?.primaryGoals || ''}
                  onChange={(e) => handleChange('primaryGoals', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Target Audiens / Pengguna Website (Demografi & Perilaku)"
                  value={formData?.targetAudience || ''}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                />
              </Grid>

              {/* SECTION 3 */}
              <Grid item xs={12}><Divider><Chip label="3. Ruang Lingkup & Fitur Website" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipe Website / Tier"
                  value={formData?.tier || 'Tier 3: Profesional'}
                  onChange={(e) => handleTierSelectChange(e.target.value)}
                >
                  <MenuItem value="Tier 1: Starter">Tier 1: Starter</MenuItem>
                  <MenuItem value="Tier 2: Growth">Tier 2: Growth</MenuItem>
                  <MenuItem value="Tier 3: Profesional">Tier 3: Profesional</MenuItem>
                  <MenuItem value="Tier 4: Enterprise">Tier 4: Enterprise</MenuItem>
                  <MenuItem value="Tier 5: Elite">Tier 5: Elite</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teknologi & Framework"
                  value={formData?.techFramework || ''}
                  onChange={(e) => handleChange('techFramework', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Struktur Halaman (Sitemap)"
                  value={formData?.pageStructure || ''}
                  onChange={(e) => handleChange('pageStructure', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Fitur Utama yang Diminta"
                  value={formData?.mainFeatures || ''}
                  onChange={(e) => handleChange('mainFeatures', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Scope Lain – Lain"
                  value={formData?.scopeOthers || ''}
                  onChange={(e) => handleChange('scopeOthers', e.target.value)}
                />
              </Grid>

              {/* SECTION 4 */}
              <Grid item xs={12}><Divider><Chip label="4. Desain & Branding" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Aset Branding Klien:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!formData?.brandingAssets?.logo}
                        onChange={(e) => handleNestedChange('brandingAssets', 'logo', e.target.checked)}
                      />
                    }
                    label="Logo"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!formData?.brandingAssets?.color}
                        onChange={(e) => handleNestedChange('brandingAssets', 'color', e.target.checked)}
                      />
                    }
                    label="Warna"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!formData?.brandingAssets?.officialFont}
                        onChange={(e) => handleNestedChange('brandingAssets', 'officialFont', e.target.checked)}
                      />
                    }
                    label="Font Resmi"
                  />
                  <TextField
                    size="small"
                    placeholder="Lainnya ....."
                    value={formData?.brandingAssets?.others || ''}
                    onChange={(e) => handleNestedChange('brandingAssets', 'others', e.target.value)}
                    sx={{ width: 220 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Gaya Visual (Style/Vibe):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={typeof formData?.visualStyle === 'object' ? !!formData?.visualStyle?.modern : String(formData?.visualStyle || '').includes('Modern')}
                        onChange={(e) => {
                          const currentObj = typeof formData?.visualStyle === 'object' ? formData?.visualStyle : {};
                          handleChange('visualStyle', { ...currentObj, modern: e.target.checked });
                        }}
                      />
                    }
                    label="Modern/Minimalis"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={typeof formData?.visualStyle === 'object' ? !!formData?.visualStyle?.professional : String(formData?.visualStyle || '').includes('Profesional')}
                        onChange={(e) => {
                          const currentObj = typeof formData?.visualStyle === 'object' ? formData?.visualStyle : {};
                          handleChange('visualStyle', { ...currentObj, professional: e.target.checked });
                        }}
                      />
                    }
                    label="Profesional/Korporasi"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={typeof formData?.visualStyle === 'object' ? !!formData?.visualStyle?.elegant : String(formData?.visualStyle || '').includes('Elegant')}
                        onChange={(e) => {
                          const currentObj = typeof formData?.visualStyle === 'object' ? formData?.visualStyle : {};
                          handleChange('visualStyle', { ...currentObj, elegant: e.target.checked });
                        }}
                      />
                    }
                    label="Elegant/Mewah"
                  />
                  <TextField
                    size="small"
                    placeholder="Lainnya ....."
                    value={typeof formData?.visualStyle === 'object' ? (formData?.visualStyle?.others || '') : ''}
                    onChange={(e) => {
                      const currentObj = typeof formData?.visualStyle === 'object' ? formData?.visualStyle : {};
                      handleChange('visualStyle', { ...currentObj, others: e.target.value });
                    }}
                    sx={{ width: 220 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  Referensi Website (menyukai):
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="(1) Referensi Web 1"
                      value={formData?.referenceWebsites?.[0] || ''}
                      onChange={(e) => handleUpdateReferenceWebsite(0, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="(2) Referensi Web 2"
                      value={formData?.referenceWebsites?.[1] || ''}
                      onChange={(e) => handleUpdateReferenceWebsite(1, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="(3) Referensi Web 3"
                      value={formData?.referenceWebsites?.[2] || ''}
                      onChange={(e) => handleUpdateReferenceWebsite(2, e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* SECTION 5 */}
              <Grid item xs={12}><Divider><Chip label="5. Materi & Aset Konten" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Ketersediaan Konten Umum"
                  value={formData?.contentAvailability?.general || 'Disediakan Developer'}
                  onChange={(e) => handleNestedChange('contentAvailability', 'general', e.target.value)}
                >
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
                  <MenuItem value="Disediakan Developer">Disediakan Developer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Teks / Copywriting"
                  value={formData?.contentAvailability?.copywriting || 'Disediakan Developer'}
                  onChange={(e) => handleNestedChange('contentAvailability', 'copywriting', e.target.value)}
                >
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
                  <MenuItem value="Disediakan Developer">Disediakan Developer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Gambar / Foto / Produk"
                  value={formData?.contentAvailability?.images || 'Disediakan Developer'}
                  onChange={(e) => handleNestedChange('contentAvailability', 'images', e.target.value)}
                >
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
                  <MenuItem value="Disediakan Developer">Disediakan Developer</MenuItem>
                </TextField>
              </Grid>

              {/* SECTION 6 */}
              <Grid item xs={12}><Divider><Chip label="6. Estimasi Waktu, Anggaran & Persetujuan" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Estimasi Biaya Proyek Total (IDR)"
                  value={formData?.estimatedBudget || 0}
                  onChange={(e) => handleChange('estimatedBudget', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Biaya Tambahan (IDR)"
                  value={formData?.additionalCosts || 0}
                  onChange={(e) => handleChange('additionalCosts', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="DP %"
                  value={formData?.paymentScheme?.dpPercent ?? 30}
                  onChange={(e) => handleNestedChange('paymentScheme', 'dpPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Mid Project %"
                  value={formData?.paymentScheme?.midPercent ?? 30}
                  onChange={(e) => handleNestedChange('paymentScheme', 'midPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Pelunasan %"
                  value={formData?.paymentScheme?.finalPercent ?? 40}
                  onChange={(e) => handleNestedChange('paymentScheme', 'finalPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Target Launch Date (Selesai)"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.targetLaunchDate || ''}
                  onChange={(e) => handleChange('targetLaunchDate', e.target.value)}
                />
              </Grid>

              {/* SECTION 7 */}
              <Grid item xs={12}><Divider><Chip label="7. Catatan Tambahan & Persetujuan" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Tabel Catatan (Prihal & Catatan):
                  </Typography>
                  <Button size="small" variant="outlined" onClick={handleAddCifNoteRow}>
                    + Tambah Baris Catatan
                  </Button>
                </Box>
                {formData?.additionalNotesTable?.map((row: any, idx: number) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      label="Prihal"
                      value={row.prihal || ''}
                      onChange={(e) => handleUpdateCifNoteRow(idx, 'prihal', e.target.value)}
                      sx={{ width: '35%' }}
                    />
                    <TextField
                      size="small"
                      label="Catatan"
                      value={row.catatan || ''}
                      onChange={(e) => handleUpdateCifNoteRow(idx, 'catatan', e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton size="small" color="error" onClick={() => handleDeleteCifNoteRow(idx)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Catatan Tambahan Umum"
                  value={formData?.additionalNotes || ''}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* RSD Form Fields */}
          {type === 'RSD' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Kode Dokumen RSD"
                  value={formData?.docCode || ''}
                  onChange={(e) => handleChange('docCode', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Klien / Perusahaan"
                  value={formData?.clientName || ''}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Penanggung Jawab (PIC Klien)"
                  value={formData?.clientPic || ''}
                  onChange={(e) => handleChange('clientPic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Kontak Klien (Email / WA)"
                  value={formData?.clientContact || ''}
                  onChange={(e) => handleChange('clientContact', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Author / IT Lead (CTO / Tech Lead)"
                  value={formData?.authorITLead || ''}
                  onChange={(e) => handleChange('authorITLead', e.target.value)}
                >
                  {executiveAdminOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal Terbit"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.issueDate || ''}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Domain Proyek / Tempat Pengujian"
                  value={formData?.domain || ''}
                  onChange={(e) => handleChange('domain', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Klaster / Tier"
                  value={formData?.tier || ''}
                  onChange={(e) => handleChange('tier', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Konteks & Scope Dokumen RSD" size="small" sx={{ fontWeight: 700 }} /></Divider></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Konteks Bisnis Klien"
                  value={formData?.businessContext || ''}
                  onChange={(e) => handleChange('businessContext', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Ringkasan Solusi Teknis"
                  value={formData?.solutionSummary || ''}
                  onChange={(e) => handleChange('solutionSummary', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Tujuan Utama Proyek (Project Goals)"
                  value={formData?.projectGoals || ''}
                  onChange={(e) => handleChange('projectGoals', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="In Scope"
                  value={formData?.inScope || ''}
                  onChange={(e) => handleChange('inScope', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Out of Scope"
                  value={formData?.outOfScope || ''}
                  onChange={(e) => handleChange('outOfScope', e.target.value)}
                />
              </Grid>

              {/* Dynamic RSD Tech Stack Editor (Section 4) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="4. Arsitektur Teknologi & Tech Stack (Termasuk Infrastructure/Cloud)" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={handleAddRsdTechStack}
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Tambah Component Tech Stack
                  </Button>
                </Box>

                <Stack spacing={1.5}>
                  {(formData.techStack || []).map((stack: RSDTechComponent, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Komponen"
                            value={stack.component || ''}
                            onChange={(e) => handleUpdateRsdTechStack(idx, 'component', e.target.value)}
                            placeholder="Frontend Web, Cloud, DB, dll"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Teknologi & Framework"
                            value={stack.techFramework || ''}
                            onChange={(e) => handleUpdateRsdTechStack(idx, 'techFramework', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2.5}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Versi / Spesifikasi"
                            value={stack.versionSpec || ''}
                            onChange={(e) => handleUpdateRsdTechStack(idx, 'versionSpec', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={10} sm={2.5}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Alasan Pemilihan"
                            value={stack.reason || ''}
                            onChange={(e) => handleUpdateRsdTechStack(idx, 'reason', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={2} sm={1} textAlign="right">
                          <IconButton size="small" color="error" onClick={() => handleDeleteRsdTechStack(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </Grid>

              {/* Dynamic RSD Features Editor (Section 5) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="5. Spesifikasi Fitur Fungsional (ATL-xxx)" color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRsdFeature}
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Tambah Fitur ATL-xxx
                  </Button>
                </Box>

                <Stack spacing={1.5}>
                  {(formData.functionalFeatures || []).map((feat: RSDFeatureItem, idx: number) => (
                    <Paper key={feat.id || idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={6} sm={2}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Kode"
                            value={feat.featureCode || ''}
                            onChange={(e) => handleUpdateRsdFeature(idx, 'featureCode', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Modul"
                            value={feat.moduleArea || ''}
                            onChange={(e) => handleUpdateRsdFeature(idx, 'moduleArea', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            minRows={3}
                            label="Deskripsi Fitur"
                            value={feat.nameAndDesc || ''}
                            onChange={(e) => handleUpdateRsdFeature(idx, 'nameAndDesc', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            label="Prioritas"
                            value={feat.priority || 'High'}
                            onChange={(e) => handleUpdateRsdFeature(idx, 'priority', e.target.value)}
                          >
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={6} sm={1} textAlign="right">
                          <IconButton size="small" color="error" onClick={() => handleDeleteRsdFeature(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </Grid>

              {/* Dynamic RSD Non-Functional Requirements (Section 6) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="6. Kebutuhan Non-Fungsional (NFR)" size="small" sx={{ fontWeight: 700 }} />
                </Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Keamanan (Security)"
                  value={formData?.nonFunctional?.security || ''}
                  onChange={(e) => handleNestedChange('nonFunctional', 'security', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Performa (Performance)"
                  value={formData?.nonFunctional?.performance || ''}
                  onChange={(e) => handleNestedChange('nonFunctional', 'performance', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Ketersediaan (Availability)"
                  value={formData?.nonFunctional?.availability || ''}
                  onChange={(e) => handleNestedChange('nonFunctional', 'availability', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Kompatibilitas (Compatibility)"
                  value={formData?.nonFunctional?.compatibility || ''}
                  onChange={(e) => handleNestedChange('nonFunctional', 'compatibility', e.target.value)}
                />
              </Grid>

              {/* Dynamic RSD Milestones Editor (Section 7) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="7. Estimasi Tahapan Pengerjaan (Sprint Milestone)" color="info" size="small" sx={{ fontWeight: 700 }} />
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    startIcon={<AddIcon />}
                    onClick={handleAddRsdMilestone}
                    sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Tambah Sprint Milestone
                  </Button>
                </Box>

                <Stack spacing={1.5}>
                  {(formData.milestones || []).map((ms: RSDMilestone, idx: number) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Nama Sprint"
                            value={ms.name || ''}
                            onChange={(e) => handleUpdateRsdMilestone(idx, 'name', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Pekerjaan / Output"
                            value={ms.scope || ''}
                            onChange={(e) => handleUpdateRsdMilestone(idx, 'scope', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            label="Durasi (Hari)"
                            value={ms.durationDays || 0}
                            onChange={(e) => handleUpdateRsdMilestone(idx, 'durationDays', Number(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            size="small"
                            fullWidth
                            type="date"
                            label="Target Deadline"
                            InputLabelProps={{ shrink: true }}
                            value={ms.targetDate || ''}
                            onChange={(e) => handleUpdateRsdMilestone(idx, 'targetDate', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={1} textAlign="right">
                          <IconButton size="small" color="error" onClick={() => handleDeleteRsdMilestone(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* MoU Form Fields */}
          {type === 'MOU' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nomor Dokumen MoU"
                  value={formData?.docNumber || ''}
                  onChange={(e) => handleChange('docNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal MoU"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="PIC Atasilabs (CEO / Management)"
                  value={formData?.atasilabsPic || ''}
                  onChange={(e) => handleChange('atasilabsPic', e.target.value)}
                >
                  {executiveAdminOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Jabatan PIC Atasilabs"
                  value={formData?.atasilabsRole || ''}
                  onChange={(e) => handleChange('atasilabsRole', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Data Klien & Investasi Kontrak" size="small" /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Perusahaan Klien (Pihak 2)"
                  value={formData?.clientCompany || ''}
                  onChange={(e) => handleChange('clientCompany', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Alamat Klien"
                  value={formData?.clientAddress || ''}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIC Klien"
                  value={formData?.clientPic || ''}
                  onChange={(e) => handleChange('clientPic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Jabatan PIC Klien"
                  value={formData?.clientRole || ''}
                  onChange={(e) => handleChange('clientRole', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Kategori Tier MoU"
                  value={formData?.tierCategory || 'Tier 3-5'}
                  onChange={(e) => handleChange('tierCategory', e.target.value)}
                >
                  <MenuItem value="Tier 1-2">Tier 1-2 (50% DP / 50% Pelunasan)</MenuItem>
                  <MenuItem value="Tier 3-5">Tier 3-5 (30% DP / 30% Progress / 40% Pelunasan)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Total Nilai Investasi (IDR)"
                  value={formData?.totalInvestment || 0}
                  onChange={(e) => handleChange('totalInvestment', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Total Investasi (Terbilang)"
                  value={formData?.totalInvestmentTerbilang || ''}
                  onChange={(e) => handleChange('totalInvestmentTerbilang', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Masa Garansi (Hari)"
                  value={formData?.warrantyDays || 30}
                  onChange={(e) => handleChange('warrantyDays', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Batas Revisi (Hari)"
                  value={formData?.revisionLimitDays || 14}
                  onChange={(e) => handleChange('revisionLimitDays', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Bank"
                  value={formData?.bankAccount?.bankName || 'Bank BRI'}
                  onChange={(e) => handleNestedChange('bankAccount', 'bankName', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* SPK Form Fields */}
          {type === 'SPK' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="No. SPK"
                  value={formData?.spkNumber || ''}
                  onChange={(e) => handleChange('spkNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal SPK"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Target Deadline Pekerjaan"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.deadlineDate || ''}
                  onChange={(e) => handleChange('deadlineDate', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Data Freelancer Partner (Pihak 2)" size="small" /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Nama Freelancer Partner"
                  value={formData?.freelancerName || ''}
                  onChange={(e) => handleChange('freelancerName', e.target.value)}
                  required
                >
                  {freelancerOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="NIK Freelancer"
                  value={formData?.freelancerNik || ''}
                  onChange={(e) => handleChange('freelancerNik', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="No. WhatsApp Freelancer"
                  value={formData?.freelancerWhatsapp || ''}
                  onChange={(e) => handleChange('freelancerWhatsapp', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Status / Peran Developer"
                  value={formData?.freelancerStatus || ''}
                  onChange={(e) => handleChange('freelancerStatus', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Informasi Bank & No Rekening Freelancer"
                  value={formData?.freelancerBankInfo || ''}
                  onChange={(e) => handleChange('freelancerBankInfo', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Nominal Fee Freelancer & Terbilang" size="small" /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Total Fee Freelancer (IDR)"
                  value={formData?.totalNominal || 0}
                  onChange={(e) => handleSpkFeeNominalChange(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total Fee Terbilang (Otomatis)"
                  value={formData?.totalNominalTerbilang || numberToWordsIDR(formData?.totalNominal || 0)}
                  onChange={(e) => handleChange('totalNominalTerbilang', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* BAST Form Fields */}
          {type === 'BAST' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="No. BAST"
                  value={formData?.bastNumber || ''}
                  onChange={(e) => handleChange('bastNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal Serah Terima"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Pihak Klien & Lokasi" size="small" /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Perusahaan Klien"
                  value={formData?.clientCompany || ''}
                  onChange={(e) => handleChange('clientCompany', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIC Klien / Jabatan"
                  value={formData?.clientPic || ''}
                  onChange={(e) => handleChange('clientPic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Alamat Perusahaan Klien"
                  value={formData?.clientAddress || ''}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Akses Aset Digital & Kredensial" size="small" /></Divider></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL Utama Website Live"
                  value={formData?.mainUrl || ''}
                  onChange={(e) => handleChange('mainUrl', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Akses Source Code Repository (Git)"
                  value={formData?.sourceCodeAccess || ''}
                  onChange={(e) => handleChange('sourceCodeAccess', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  label="Akses Panel Admin / Credentials"
                  value={formData?.adminPanelAccess || ''}
                  onChange={(e) => handleChange('adminPanelAccess', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Jumlah Hari Masa Garansi"
                  value={formData?.warrantyDays || 30}
                  onChange={(e) => handleChange('warrantyDays', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Kota Lokasi Penandatanganan"
                  value={formData?.locationCity || 'Subang'}
                  onChange={(e) => handleChange('locationCity', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {type === 'QA' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nomor Dokumen QA"
                  value={formData?.docNumber || ''}
                  onChange={(e) => handleChange('docNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal Pengujian"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData?.issueDate || ''}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="QA Lead / Tech Lead"
                  value={formData?.qaLeadName || ''}
                  onChange={(e) => handleChange('qaLeadName', e.target.value)}
                >
                  {executiveAdminOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Nama Tester / Developer"
                  value={formData?.testerName || ''}
                  onChange={(e) => handleChange('testerName', e.target.value)}
                >
                  {combinedTeamOptions.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIC UAT Klien"
                  value={formData?.clientPic || ''}
                  onChange={(e) => handleChange('clientPic', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL Staging Test"
                  value={formData?.stagingUrl || ''}
                  onChange={(e) => handleChange('stagingUrl', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status Hasil Pengujian Akhir"
                  value={formData?.overallStatus || 'PASSED'}
                  onChange={(e) => handleChange('overallStatus', e.target.value)}
                >
                  <MenuItem value="PASSED">PASSED (Lulus Seluruh Pengujian)</MenuItem>
                  <MenuItem value="NEEDS_REVISION">NEEDS_REVISION (Butuh Perbaikan Skenario)</MenuItem>
                  <MenuItem value="APPROVED">APPROVED (Disetujui Klien)</MenuItem>
                  <MenuItem value="FAILED">FAILED (Gagal / Ada Blocker)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Ringkasan Laporan QA & Acuan RSD"
                  value={formData?.summary || ''}
                  onChange={(e) => handleChange('summary', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider>
                  <Chip label="Daftar Checklist & Skenario Testing QA (Acuan RSD)" color="secondary" size="small" />
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Skenario Pengujian ({(formData.testItems || []).length} Item Test)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={handleAddQaTestItem}
                    sx={{ fontWeight: 700 }}
                  >
                    Tambah Test Case QA
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {(formData.testItems || []).map((item: QATestItem, idx: number) => (
                    <Paper key={item.id || idx} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.01)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip label={`Test Case #${idx + 1}`} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 800 }} />
                        <IconButton size="small" color="error" onClick={() => handleDeleteQaTestItem(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Kategori & Ref RSD (e.g. RSD [ATL-001])"
                            value={item.category || ''}
                            onChange={(e) => handleUpdateQaTestItem(idx, 'category', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Status Item"
                            value={item.status || 'PASSED'}
                            onChange={(e) => handleUpdateQaTestItem(idx, 'status', e.target.value)}
                          >
                            <MenuItem value="PASSED">PASSED (Lulus)</MenuItem>
                            <MenuItem value="FAILED">FAILED (Gagal)</MenuItem>
                            <MenuItem value="PENDING">PENDING (Belum Diuji)</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Skenario / Test Case"
                            value={item.testCase || ''}
                            onChange={(e) => handleUpdateQaTestItem(idx, 'testCase', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Hasil Yang Diharapkan (Expected)"
                            value={item.expectedResult || ''}
                            onChange={(e) => handleUpdateQaTestItem(idx, 'expectedResult', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Catatan / Info Tambahan"
                            value={item.notes || ''}
                            onChange={(e) => handleUpdateQaTestItem(idx, 'notes', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Batal
        </Button>
        <Button type="submit" form="doc-generator-form" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
          Simpan & Update Dokumen {type}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
