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
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CIFData, RSDData, MoUData, SPKData, BASTData, RSDFeatureItem } from '../../types';

interface DocumentFormDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST';
  initialData: CIFData | RSDData | MoUData | SPKData | BASTData;
  onSave: (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST', data: any) => void;
}

export const DocumentFormDialog: React.FC<DocumentFormDialogProps> = ({
  open,
  onClose,
  type,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={type} color="primary" size="small" sx={{ fontWeight: 800 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Form Generator Dokumen {type}
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
                  fullWidth
                  size="small"
                  label="Nama Admin / Sales"
                  value={formData?.adminName || ''}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Tanggal"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Sumber Informasi"
                  value={formData?.infoSource || ''}
                  onChange={(e) => handleChange('infoSource', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Informasi Klien & Proyek" size="small" /></Divider></Grid>

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
                  label="Penanggung Jawab (PIC)"
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
                  label="Lokasi Tempat Usaha Klien"
                  value={formData?.businessLocation || ''}
                  onChange={(e) => handleChange('businessLocation', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Scope & Anggaran" size="small" /></Divider></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Ringkasan Proyek"
                  value={formData?.projectSummary || ''}
                  onChange={(e) => handleChange('projectSummary', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tujuan Utama Pembuatan Website"
                  value={formData?.primaryGoals || ''}
                  onChange={(e) => handleChange('primaryGoals', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipe Website / Tier"
                  value={formData?.tier || 'Tier 3: Profesional'}
                  onChange={(e) => handleChange('tier', e.target.value)}
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
                  type="number"
                  label="Estimasi Biaya Proyek (IDR)"
                  value={formData?.estimatedBudget || 0}
                  onChange={(e) => handleChange('estimatedBudget', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="DP %"
                  value={formData?.paymentScheme?.dpPercent || 30}
                  onChange={(e) => handleNestedChange('paymentScheme', 'dpPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Mid %"
                  value={formData?.paymentScheme?.midPercent || 30}
                  onChange={(e) => handleNestedChange('paymentScheme', 'midPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Pelunasan %"
                  value={formData?.paymentScheme?.finalPercent || 40}
                  onChange={(e) => handleNestedChange('paymentScheme', 'finalPercent', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Target Launch Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData?.targetLaunchDate || ''}
                  onChange={(e) => handleChange('targetLaunchDate', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Gaya Visual (Style/Vibe)"
                  value={formData?.visualStyle || 'Profesional/Korporasi'}
                  onChange={(e) => handleChange('visualStyle', e.target.value)}
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
                  label="Nama Klien"
                  value={formData?.clientName || ''}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Author / IT Lead"
                  value={formData?.authorITLead || ''}
                  onChange={(e) => handleChange('authorITLead', e.target.value)}
                />
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
                  label="Domain Proyek"
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

              <Grid item xs={12}><Divider><Chip label="Konteks & Scope" size="small" /></Divider></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
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
                  rows={2}
                  size="small"
                  label="Ringkasan Solusi Teknis"
                  value={formData?.solutionSummary || ''}
                  onChange={(e) => handleChange('solutionSummary', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
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
                  rows={2}
                  size="small"
                  label="Out of Scope"
                  value={formData?.outOfScope || ''}
                  onChange={(e) => handleChange('outOfScope', e.target.value)}
                />
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
                  fullWidth
                  size="small"
                  label="PIC Atasilabs"
                  value={formData?.atasilabsPic || ''}
                  onChange={(e) => handleChange('atasilabsPic', e.target.value)}
                />
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

              <Grid item xs={12}><Divider><Chip label="Data Klien & Investasi" size="small" /></Divider></Grid>

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
                  size="small"
                  label="Total Investasi (Terbilang)"
                  value={formData?.totalInvestmentTerbilang || ''}
                  onChange={(e) => handleChange('totalInvestmentTerbilang', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* SPK Form Fields */}
          {type === 'SPK' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="No. SPK"
                  value={formData?.spkNumber || ''}
                  onChange={(e) => handleChange('spkNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12}><Divider><Chip label="Data Freelancer (Pihak 2)" size="small" /></Divider></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nama Freelancer Partner"
                  value={formData?.freelancerName || ''}
                  onChange={(e) => handleChange('freelancerName', e.target.value)}
                  required
                />
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
                  label="Informasi Bank & No Rekening"
                  value={formData?.freelancerBankInfo || ''}
                  onChange={(e) => handleChange('freelancerBankInfo', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Total Fee Freelancer (IDR)"
                  value={formData?.totalNominal || 0}
                  onChange={(e) => handleChange('totalNominal', Number(e.target.value))}
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

              <Grid item xs={12}><Divider><Chip label="Akses & Kredensial" size="small" /></Divider></Grid>

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
                  size="small"
                  label="Akses Source Code Repository"
                  value={formData?.sourceCodeAccess || ''}
                  onChange={(e) => handleChange('sourceCodeAccess', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Batal
        </Button>
        <Button type="submit" form="doc-generator-form" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
          Hasilkan / Simpan Dokumen {type}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
