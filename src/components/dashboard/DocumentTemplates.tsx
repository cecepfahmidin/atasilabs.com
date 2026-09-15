'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import { Print as PrintIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { CIFData, RSDData, MoUData, SPKData, BASTData } from '../../types';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';
import { useApp } from '../../context/AppContext';

interface DocumentTemplateProps {
  type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST';
  data: CIFData | RSDData | MoUData | SPKData | BASTData;
  onPrint?: () => void;
}

export const DocumentTemplates: React.FC<DocumentTemplateProps> = ({ type, data, onPrint }) => {
  const { showNotification } = useApp();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleCopyText = (summaryText: string) => {
    try {
      navigator.clipboard.writeText(summaryText);
      showNotification('Ringkasan teks dokumen berhasil disalin ke clipboard!', 'success');
    } catch {
      showNotification('Gagal menyalin teks ke clipboard', 'error');
    }
  };

  // Header Letterhead Component
  const Letterhead = ({ title }: { title: string }) => (
    <Box sx={{ mb: 3, pb: 2, borderBottom: '3px double #d97706' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <AtasiLabsLogo height={36} />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.72rem' }}>
            Jl. Cinangsi, RT 003 RW 001, Desa Cinangsi, Kec. Cibogo, Kab. Subang – Jawa Barat
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            Website: www.atasilabs.com | Email: cecepfahmidin@gmail.com
          </Typography>
        </Box>
        <Chip
          label="SOP INTERNAL ATASILABS"
          size="small"
          className="no-print"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            color: '#d97706',
          }}
        />
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#b45309' }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );

  // Render Client Intake Form (CIF)
  if (type === 'CIF') {
    const cif = data as CIFData;
    const copySummary = `[CLIENT INTAKE FORM (CIF)]\nNo: ${cif.docNumber}\nKlien: ${cif.clientName}\nPIC: ${cif.picName}\nKontak: ${cif.contact}\nTier: ${cif.tier}\nBudget: Rp ${cif.estimatedBudget?.toLocaleString('id-ID')}\nTarget Launch: ${cif.targetLaunchDate}`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: 'background.paper',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Letterhead title="CLIENT INTAKE FORM (CIF)" />

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={() => handleCopyText(copySummary)}>
            Salin Teks CIF
          </Button>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        {/* Admin Info Header */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '25%', bgcolor: 'action.hover' }}>Nama Admin</TableCell>
                <TableCell>: {cif.adminName}</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '25%', bgcolor: 'action.hover' }}>No. Dokumen</TableCell>
                <TableCell>: {cif.docNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Tanggal</TableCell>
                <TableCell>: {cif.date}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Sumber Informasi</TableCell>
                <TableCell>: {cif.infoSource}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 1. Informasi Umum Klien */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          1. INFORMASI UMUM KLIEN DAN PROYEK
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Nama Klien/Perusahaan</TableCell>
                <TableCell>{cif.clientName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Penanggung Jawab (PIC)</TableCell>
                <TableCell>{cif.picName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Kontak (Email/WhatsApp)</TableCell>
                <TableCell>{cif.contact}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Bidang Usaha/Industri</TableCell>
                <TableCell>{cif.industry}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Website (jika ada)</TableCell>
                <TableCell>{cif.websiteUrl || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Lokasi Tempat Usaha</TableCell>
                <TableCell>{cif.businessLocation}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 2. Profil Proyek & Tujuan Bisnis */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          2. PROFIL PROYEK & TUJUAN BISNIS
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Ringkasan Proyek</TableCell>
                <TableCell>{cif.projectSummary}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Tujuan Utama (Primary Goals)</TableCell>
                <TableCell>{cif.primaryGoals}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Target Audiens / Perilaku</TableCell>
                <TableCell>{cif.targetAudience}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 3. Ruang Lingkup & Fitur */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          3. RUANG LINGKUP & FITUR WEBSITE
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Tipe Website / Tier</TableCell>
                <TableCell><Chip label={cif.tier} color="primary" size="small" sx={{ fontWeight: 700 }} /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Struktur Halaman</TableCell>
                <TableCell>{cif.pageStructure}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Fitur Utama</TableCell>
                <TableCell>{cif.mainFeatures}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Teknologi & Framework</TableCell>
                <TableCell>{cif.techFramework}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 4. Desain & Branding */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          4. DESAIN & BRANDING
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Aset Branding Klien</TableCell>
                <TableCell>
                  Logo: {cif.brandingAssets?.logo ? '✓' : '✗'} | Warna: {cif.brandingAssets?.color ? '✓' : '✗'} | Font: {cif.brandingAssets?.officialFont ? '✓' : '✗'} ({cif.brandingAssets?.others || ''})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Gaya Visual (Style/Vibe)</TableCell>
                <TableCell>{cif.visualStyle}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Referensi Website</TableCell>
                <TableCell>
                  {cif.referenceWebsites?.map((ref, idx) => (
                    <Typography key={idx} variant="caption" display="block">• {ref}</Typography>
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 5. Estimasi Waktu & Anggaran */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          5. ESTIMASI WAKTU & ANGGARAN
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Estimasi Biaya Proyek</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                  Rp {cif.estimatedBudget?.toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Skema Pembayaran</TableCell>
                <TableCell>
                  DP: {cif.paymentScheme?.dpPercent}% | Mid-Project: {cif.paymentScheme?.midPercent || 0}% | Pelunasan: {cif.paymentScheme?.finalPercent}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Target Launch Date</TableCell>
                <TableCell>{cif.targetLaunchDate}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Signature Footer */}
        <Box className="signature-block avoid-break" sx={{ mt: 4, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={6} sm={4} textAlign="center">
              <Typography variant="caption" display="block">Subang, {cif.date}</Typography>
              <Typography variant="caption" display="block" sx={{ fontWeight: 700, mt: 0.5 }}>Admin/Sales ATASILABS</Typography>
              <Box sx={{ height: 50 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, borderTop: '1px solid black', pt: 0.5 }}>
                ({cif.adminName})
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }

  // Render Requirement Specification Document (RSD)
  if (type === 'RSD') {
    const rsd = data as RSDData;
    const copySummary = `[REQUIREMENT SPECIFICATION DOCUMENT (RSD)]\nKode: ${rsd.docCode}\nKlien: ${rsd.clientName}\nIT Lead: ${rsd.authorITLead}\nDomain: ${rsd.domain}\nTier: ${rsd.tier}`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: 'background.paper',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Letterhead title="REQUIREMENT SPECIFICATION DOCUMENT (RSD)" />

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={() => handleCopyText(copySummary)}>
            Salin Teks RSD
          </Button>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        {/* RSD Header Info */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '20%', bgcolor: 'action.hover' }}>Nama Klien</TableCell>
                <TableCell>{rsd.clientName}</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '20%', bgcolor: 'action.hover' }}>Author / IT Lead</TableCell>
                <TableCell>{rsd.authorITLead}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Tanggal Terbit</TableCell>
                <TableCell>{rsd.issueDate}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Kode Proyek</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{rsd.docCode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Domain</TableCell>
                <TableCell>{rsd.domain}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Klaster / Tier</TableCell>
                <TableCell>{rsd.tier}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 1. Latar Belakang & Tujuan */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          1. LATAR BELAKANG & TUJUAN
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>Konteks Bisnis Klien:</Typography>
          <Typography variant="body2" paragraph>{rsd.businessContext}</Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>Penyelesaian Kebutuhan:</Typography>
          <Typography variant="body2" paragraph>{rsd.solutionSummary}</Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>Tujuan Pembuatan Website:</Typography>
          <Typography variant="body2">{rsd.projectGoals}</Typography>
        </Paper>

        {/* 2. Scope */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          2. RUANG LINGKUP PROYEK (PROJECT SCOPE)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, borderColor: '#10b981' }}>
              <Chip label="IN SCOPE" color="success" size="small" sx={{ mb: 1, fontWeight: 700 }} />
              <Typography variant="body2">{rsd.inScope}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, borderColor: '#ef4444' }}>
              <Chip label="OUT OF SCOPE" color="error" size="small" sx={{ mb: 1, fontWeight: 700 }} />
              <Typography variant="body2">{rsd.outOfScope}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 3. Tech Stack */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          3. SPESIFIKASI TECH STACK & ARSITEKTUR
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Komponen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teknologi / Framework</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Versi / Spesifikasi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Alasan Pemilihan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rsd.techStack?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 600 }}>{item.component}</TableCell>
                  <TableCell>{item.techFramework}</TableCell>
                  <TableCell>{item.versionSpec}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 4. Fitur Fungsional */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          4. SPESIFIKASI FITUR FUNGSIONAL (ATL-xxx)
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID Fitur</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modul / Area</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nama Fitur & Deskripsi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hak Akses (Role)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prioritas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rsd.functionalFeatures?.map((feat) => (
                <TableRow key={feat.id}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{feat.featureCode}</TableCell>
                  <TableCell>{feat.moduleArea}</TableCell>
                  <TableCell>{feat.nameAndDesc}</TableCell>
                  <TableCell>{feat.roleAccess}</TableCell>
                  <TableCell>
                    <Chip
                      label={feat.priority}
                      size="small"
                      color={feat.priority === 'High' ? 'error' : feat.priority === 'Medium' ? 'warning' : 'default'}
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 5. Non-Functional Requirement */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          5. KEBUTUHAN NON-FUNGSIONAL (NFR)
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="caption" display="block">• <strong>Keamanan (Security):</strong> {rsd.nonFunctional?.security}</Typography>
          <Typography variant="caption" display="block">• <strong>Performa (Performance):</strong> {rsd.nonFunctional?.performance}</Typography>
          <Typography variant="caption" display="block">• <strong>Ketersediaan (Availability):</strong> {rsd.nonFunctional?.availability}</Typography>
          <Typography variant="caption" display="block">• <strong>Kompatibilitas (Compatibility):</strong> {rsd.nonFunctional?.compatibility}</Typography>
        </Paper>

        {/* Signature */}
        <Box className="signature-block avoid-break" sx={{ mt: 4, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item xs={6} sm={4} textAlign="center">
              <Typography variant="caption" display="block">Disusun Oleh,</Typography>
              <Box sx={{ height: 50 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, borderTop: '1px solid black', pt: 0.5 }}>
                ({rsd.authorITLead})
              </Typography>
              <Typography variant="caption" color="text.secondary">IT Lead / Software Architect Atasilabs</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }

  // Render MoU Contract
  if (type === 'MOU') {
    const mou = data as MoUData;
    const copySummary = `[MEMORANDUM OF UNDERSTANDING (MoU)]\nNomor: ${mou.docNumber}\nPihak 1: ATASILABS (${mou.atasilabsPic})\nPihak 2: ${mou.clientCompany} (${mou.clientPic})\nTotal Investasi: Rp ${mou.totalInvestment?.toLocaleString('id-ID')} (${mou.totalInvestmentTerbilang})\nBank: ${mou.bankAccount?.bankName} - ${mou.bankAccount?.accountNumber} a.n. ${mou.bankAccount?.accountHolder}`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: 'background.paper',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Letterhead title="MEMORANDUM OF UNDERSTANDING (MoU)" />

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={() => handleCopyText(copySummary)}>
            Salin Teks MoU
          </Button>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        <Typography variant="caption" display="block" textAlign="center" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
          Nomor Dokumen: {mou.docNumber}
        </Typography>

        <Typography variant="body2" paragraph>
          Pada hari ini, <strong>{mou.dayName || 'Selasa'}</strong>, Tanggal <strong>{mou.date}</strong>, telah terjadi kesepakatan kerjasama pembuatan website dan pengembangan digital diantara:
        </Typography>

        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" paragraph>
            1. <strong>ATASILABS</strong>, penyedia layanan pengembangan teknologi dan produk digital, berkedudukan di Subang, Jawa Barat, diwakili oleh <strong>{mou.atasilabsPic}</strong> ({mou.atasilabsRole}) yang selanjutnya disebut <strong>PIHAK PERTAMA</strong>.
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>{mou.clientCompany}</strong>, berkedudukan di {mou.clientAddress}, diwakili oleh <strong>{mou.clientPic}</strong> ({mou.clientRole}) yang selanjutnya disebut <strong>PIHAK KEDUA</strong>.
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          PASAL 1: RUANG LINGKUP PEKERJAAN
        </Typography>
        <Typography variant="body2" paragraph>
          PIHAK PERTAMA sepakat menyediakan jasa pembuatan website untuk kategori <strong>{mou.tierCategory}</strong> mencakup perancangan, pengembangan database, pengujian QA, dan pelatihan pengelolaan admin.
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          PASAL 2: BIAYA DAN SKEMA PEMBAYARAN
        </Typography>
        <Typography variant="body2" paragraph>
          Total nilai investasi disepakati sebesar <strong>Rp {mou.totalInvestment?.toLocaleString('id-ID')} ({mou.totalInvestmentTerbilang})</strong>.
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tahap Pembayaran</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Persentase</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nominal (IDR)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ketentuan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Tahap 1 (Uang Muka DP)</TableCell>
                <TableCell>{mou.paymentScheme?.dpPercent}%</TableCell>
                <TableCell>Rp {mou.paymentScheme?.dpNominal?.toLocaleString('id-ID')}</TableCell>
                <TableCell>Saat penandatanganan MoU ini</TableCell>
              </TableRow>
              {mou.paymentScheme?.midPercent ? (
                <TableRow>
                  <TableCell>Tahap 2 (Progress Development)</TableCell>
                  <TableCell>{mou.paymentScheme?.midPercent}%</TableCell>
                  <TableCell>Rp {mou.paymentScheme?.midNominal?.toLocaleString('id-ID')}</TableCell>
                  <TableCell>Setelah desain disetujui & sistem tahap akhir</TableCell>
                </TableRow>
              ) : null}
              <TableRow>
                <TableCell>Tahap Pelunasan</TableCell>
                <TableCell>{mou.paymentScheme?.finalPercent}%</TableCell>
                <TableCell>Rp {mou.paymentScheme?.finalNominal?.toLocaleString('id-ID')}</TableCell>
                <TableCell>Setelah pengujian & sebelum deployment live</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Rekening Pembayaran Resmi ATASILABS:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {mou.bankAccount?.bankName} — {mou.bankAccount?.accountNumber} a.n. {mou.bankAccount?.accountHolder}
          </Typography>
        </Paper>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          PASAL 3: SERAH TERIMA & MASA GARANSI
        </Typography>
        <Typography variant="body2" paragraph>
          PIHAK PERTAMA memberikan garansi perbaikan bug/error selama <strong>{mou.warrantyDays || 30} hari kalender</strong> setelah penyerahan hasil pengerjaan & kredensial secara lengkap.
        </Typography>

        {/* Signature */}
        <Box className="signature-block avoid-break" sx={{ mt: 5, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
          <Grid container spacing={3}>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">PIHAK PERTAMA</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ATASILABS</Typography>
              <Box sx={{ height: 60 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({mou.atasilabsPic})</Typography>
              <Typography variant="caption" color="text.secondary">{mou.atasilabsRole}</Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">PIHAK KEDUA</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{mou.clientCompany}</Typography>
              <Box sx={{ height: 60 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({mou.clientPic})</Typography>
              <Typography variant="caption" color="text.secondary">{mou.clientRole}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }

  // Render SPK (Surat Perintah Kerja Freelancer)
  if (type === 'SPK') {
    const spk = data as SPKData;
    const copySummary = `[SURAT PERINTAH KERJA (SPK)]\nNo: ${spk.spkNumber}\nPemberi Kerja: ATASILABS (${spk.atasilabsPic})\nFreelancer: ${spk.freelancerName} (NIK: ${spk.freelancerNik})\nTotal Fee: Rp ${spk.totalNominal?.toLocaleString('id-ID')} (${spk.totalNominalTerbilang})\nDP 40%: Rp ${spk.dpNominal?.toLocaleString('id-ID')} | Pelunasan 60%: Rp ${spk.finalNominal?.toLocaleString('id-ID')}\nDeadline: ${spk.deadlineDate}`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: 'background.paper',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Letterhead title="SURAT PERINTAH KERJA (SPK) FREELANCER" />

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={() => handleCopyText(copySummary)}>
            Salin Teks SPK
          </Button>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        <Typography variant="caption" display="block" textAlign="center" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
          No. SPK: {spk.spkNumber}
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '25%', bgcolor: 'action.hover' }}>Pemberi Kerja (Pihak 1)</TableCell>
                <TableCell>ATASILABS — {spk.atasilabsPic} ({spk.atasilabsRole})</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Penerima Kerja (Pihak 2)</TableCell>
                <TableCell>{spk.freelancerName} (NIK: {spk.freelancerNik}) — {spk.freelancerStatus}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Kontak & Bank Freelancer</TableCell>
                <TableCell>WA: {spk.freelancerWhatsapp} | {spk.freelancerBankInfo}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Target Deadline</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>{spk.deadlineDate}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          PASAL 4: NILAI PEKERJAAN DAN SKEMA PEMBAYARAN FREELANCER
        </Typography>
        <Typography variant="body2" paragraph>
          Total imbalan jasa pekerjaan sebesar <strong>Rp {spk.totalNominal?.toLocaleString('id-ID')} ({spk.totalNominalTerbilang})</strong>.
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tahap</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Persentase</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nominal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Uang Muka (DP) SPK Ditandatangani</TableCell>
                <TableCell>{spk.dpPercent}%</TableCell>
                <TableCell>Rp {spk.dpNominal?.toLocaleString('id-ID')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pelunasan Setelah Pekerjaan Selesai & Diterima Atasilabs</TableCell>
                <TableCell>{spk.finalPercent}%</TableCell>
                <TableCell>Rp {spk.finalNominal?.toLocaleString('id-ID')}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          PASAL 7 & 11: HKI, NDA, DAN SANKSI KETERLAMBATAN
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Hak Cipta:</strong> Seluruh source code & aset menjadi hak milik penuh ATASILABS. Freelancer dilarang menjual kembali kode program.<br />
          • <strong>Sanksi keterlambatan:</strong> Keterlambatan tanpa alasan force majeure dikenakan denda sebesar <strong>{spk.penaltyPerDayPercent}% per hari</strong> (maksimal {spk.maxPenaltyPercent}% dari nilai pekerjaan).
        </Typography>

        {/* Signature */}
        <Box className="signature-block avoid-break" sx={{ mt: 4, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
          <Grid container spacing={3}>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">Pihak Pertama</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ATASILABS</Typography>
              <Box sx={{ height: 50 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({spk.atasilabsPic})</Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">Pihak Kedua</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Freelancer Partner</Typography>
              <Box sx={{ height: 50 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({spk.freelancerName})</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }

  // Render BAST (Berita Acara Serah Terima)
  if (type === 'BAST') {
    const bast = data as BASTData;
    const copySummary = `[BERITA ACARA SERAH TERIMA (BAST)]\nNo: ${bast.bastNumber}\nTanggal: ${bast.date}\nPihak 1: ATASILABS (${bast.atasilabsPic})\nPihak 2: ${bast.clientCompany} (${bast.clientPic})\nURL Website: ${bast.mainUrl}\nRepo Code: ${bast.sourceCodeAccess}\nAdmin Credentials: ${bast.adminPanelAccess}\nGaransi: ${bast.warrantyDays} Hari`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: 'background.paper',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Letterhead title="BERITA ACARA SERAH TERIMA (BAST)" />

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={() => handleCopyText(copySummary)}>
            Salin Teks BAST
          </Button>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        <Typography variant="caption" display="block" textAlign="center" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
          Nomor: {bast.bastNumber}
        </Typography>

        <Typography variant="body2" paragraph>
          Pada hari ini, Tanggal <strong>{bast.date}</strong>, telah dilaksanakan serah terima 100% hasil pembuatan website/produk digital antara <strong>ATASILABS</strong> (Pihak Pertama) dan <strong>{bast.clientCompany}</strong> (Pihak Kedua).
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          PENYERAHAN AKSES & HAK MILIK ASET
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>URL Utama Website</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>{bast.mainUrl}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Akses Source Code Repo</TableCell>
                <TableCell>{bast.sourceCodeAccess}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Akses Panel Admin / CMS</TableCell>
                <TableCell>{bast.adminPanelAccess}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Masa Garansi Uptime & Bugfix</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{bast.warrantyDays} Hari Kalender sejak BAST ini ditandatangani</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Signature */}
        <Box className="signature-block avoid-break" sx={{ mt: 5, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
          <Typography variant="caption" display="block" textAlign="right" sx={{ mb: 1 }}>
            {bast.locationCity || 'Subang'}, {bast.date}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">Pihak Pertama</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>ATASILABS</Typography>
              <Box sx={{ height: 60 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({bast.atasilabsPic})</Typography>
              <Typography variant="caption" color="text.secondary">{bast.atasilabsRole}</Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Typography variant="caption" display="block">Pihak Kedua</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{bast.clientCompany}</Typography>
              <Box sx={{ height: 60 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>({bast.clientPic})</Typography>
              <Typography variant="caption" color="text.secondary">{bast.clientRole}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    );
  }

  return null;
};
