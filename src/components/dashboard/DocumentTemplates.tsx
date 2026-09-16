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
  Tooltip,
} from '@mui/material';
import { Print as PrintIcon, ContentCopy as CopyIcon, Gesture as DrawIcon, VerifiedUser as VerifiedIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { CIFData, RSDData, MoUData, SPKData, BASTData, DigitalSignatureData, QAData } from '../../types';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';
import { useApp } from '../../context/AppContext';

interface DocumentTemplateProps {
  type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST' | 'QA';
  data: CIFData | RSDData | MoUData | SPKData | BASTData | QAData;
  onPrint?: () => void;
  onSignParty1?: () => void;
  onSignParty2?: () => void;
  onUpdateQA?: (updatedQa: QAData) => void;
}

export const DocumentTemplates: React.FC<DocumentTemplateProps> = ({
  type,
  data,
  onPrint,
  onSignParty1,
  onSignParty2,
  onUpdateQA,
}) => {
  const { showNotification, currentUser } = useApp();
  const isClientRole = currentUser?.role === 'CLIENT';

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

  // Shared Signature Block & Audit Trail Footer
  const DocumentSignatureFooter = ({
    locationCity = 'Subang',
    dateStr = '',
    party1Title = 'PIHAK PERTAMA',
    party1Sub = 'ATASILABS',
    party1Name = '',
    party1Role = '',
    party1Sig,
    onSignParty1Cb,
    party2Title = 'PIHAK KEDUA',
    party2Sub = '',
    party2Name = '',
    party2Role = '',
    party2Sig,
    onSignParty2Cb,
    isSingleSigner = false,
  }: {
    locationCity?: string;
    dateStr?: string;
    party1Title?: string;
    party1Sub?: string;
    party1Name?: string;
    party1Role?: string;
    party1Sig?: DigitalSignatureData;
    onSignParty1Cb?: () => void;
    party2Title?: string;
    party2Sub?: string;
    party2Name?: string;
    party2Role?: string;
    party2Sig?: DigitalSignatureData;
    onSignParty2Cb?: () => void;
    isSingleSigner?: boolean;
  }) => {
    const finalParty1Name = party1Sig?.auditTrail?.signedBy || party1Name;
    const finalParty1Role = party1Sig?.auditTrail?.signerRole || party1Role;
    const finalParty2Name = party2Sig?.auditTrail?.signedBy || party2Name;
    const finalParty2Role = party2Sig?.auditTrail?.signerRole || party2Role;

    return (
      <Box className="signature-block avoid-break" sx={{ mt: 5, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
        <Typography variant="caption" display="block" textAlign="right" sx={{ mb: 1.5, color: 'text.secondary' }}>
          {locationCity}, {dateStr}
        </Typography>

        <Grid container spacing={3} justifyContent={isSingleSigner ? 'flex-end' : 'space-between'}>
          <Grid item xs={6} sm={isSingleSigner ? 5 : 6} textAlign="center">
            <Typography variant="caption" display="block" color="text.secondary">{party1Title}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{party1Sub}</Typography>

            {/* Canvas Signature Image */}
            {party1Sig?.signatureBase64 ? (
              <Box
                component="img"
                src={party1Sig.signatureBase64}
                alt="Tanda Tangan Pihak 1"
                sx={{ height: 60, maxWidth: 180, objectFit: 'contain', mx: 'auto', my: 0.5, display: 'block' }}
              />
            ) : (
              <Box sx={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!isClientRole && onSignParty1Cb && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    className="no-print"
                    startIcon={<DrawIcon sx={{ fontSize: 13 }} />}
                    onClick={onSignParty1Cb}
                    sx={{ fontSize: '0.68rem', py: 0.2, fontWeight: 700 }}
                  >
                    Tanda Tangani
                  </Button>
                )}
              </Box>
            )}

            <Typography variant="body2" sx={{ fontWeight: 700, borderTop: '1px solid rgba(0,0,0,0.3)', pt: 0.5, display: 'inline-block', px: 1 }}>
              ({finalParty1Name || '....................'})
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">{finalParty1Role}</Typography>
          </Grid>

          {!isSingleSigner && (
            <Grid item xs={6} sm={6} textAlign="center">
              <Typography variant="caption" display="block" color="text.secondary">{party2Title}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{party2Sub}</Typography>

              {/* Canvas Signature Image */}
              {party2Sig?.signatureBase64 ? (
                <Box
                  component="img"
                  src={party2Sig.signatureBase64}
                  alt="Tanda Tangan Pihak 2"
                  sx={{ height: 60, maxWidth: 180, objectFit: 'contain', mx: 'auto', my: 0.5, display: 'block' }}
                />
              ) : (
                <Box sx={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {onSignParty2Cb && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      className="no-print"
                      startIcon={<DrawIcon sx={{ fontSize: 13 }} />}
                      onClick={onSignParty2Cb}
                      sx={{ fontSize: '0.68rem', py: 0.2, fontWeight: 700 }}
                    >
                      Tanda Tangani
                    </Button>
                  )}
                </Box>
              )}

              <Typography variant="body2" sx={{ fontWeight: 700, borderTop: '1px solid rgba(0,0,0,0.3)', pt: 0.5, display: 'inline-block', px: 1 }}>
                ({finalParty2Name || '....................'})
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">{finalParty2Role}</Typography>
            </Grid>
          )}
        </Grid>

      {/* Electronic Audit Trail Verification Badge */}
      {(party1Sig?.auditTrail || party2Sig?.auditTrail) && (
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 1.5,
            borderRadius: 2,
            borderColor: '#10b981',
            bgcolor: 'rgba(16, 185, 129, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <VerifiedIcon sx={{ color: '#10b981', fontSize: 30, flexShrink: 0 }} />
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block', textTransform: 'uppercase', letterSpacing: 0.3 }}>
              VERIFIKASI TANDA TANGAN ELEKTRONIK & AUDIT TRAIL (UU ITE PASAL 11)
            </Typography>
            {party1Sig?.auditTrail && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                • <strong>{party1Title} ({party1Sig.auditTrail.signedBy}):</strong> Waktu: {party1Sig.auditTrail.signedAt} | IP: {party1Sig.auditTrail.ipAddress} | Ref Hash: {party1Sig.auditTrail.documentHash}
              </Typography>
            )}
            {party2Sig?.auditTrail && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
                • <strong>{party2Title} ({party2Sig.auditTrail.signedBy}):</strong> Waktu: {party2Sig.auditTrail.signedAt} | IP: {party2Sig.auditTrail.ipAddress} | Ref Hash: {party2Sig.auditTrail.documentHash}
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
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

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {!isClientRole && onSignParty1 && (
            <Button variant="outlined" color="primary" size="small" startIcon={<DrawIcon />} onClick={onSignParty1} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 1 (Atasilabs)
            </Button>
          )}
          {onSignParty2 && (
            <Button variant="outlined" color="secondary" size="small" startIcon={<DrawIcon />} onClick={onSignParty2} sx={{ fontWeight: 700 }}>
              Tanda Tangan Klien
            </Button>
          )}
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
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Tanggal Dokumen</TableCell>
                <TableCell>: {cif.date}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Klaster / Tier</TableCell>
                <TableCell>: {cif.tier}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 1. Informasi Utama Klien */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          1. INFORMASI UTAMA KLIEN
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Nama Perusahaan / Bisnis</TableCell>
                <TableCell>{cif.clientName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Industri / Sektor Bisnis</TableCell>
                <TableCell>{cif.industry}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Alamat Perusahaan</TableCell>
                <TableCell>{cif.businessLocation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Penanggung Jawab (PIC Utama)</TableCell>
                <TableCell>{cif.picName} — {cif.contact}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 2. Tujuan & Lingkup Proyek */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          2. TUJUAN & LINGKUP PROYEK
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>Tujuan Utama Pembuatan Website:</Typography>
          <Typography variant="body2" paragraph>{cif.primaryGoals}</Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>Target Pengguna (Audience):</Typography>
          <Typography variant="body2">{cif.targetAudience}</Typography>
        </Paper>

        {/* 3. Kebutuhan Fitur & Struktur */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          3. KEBUTUHAN FITUR & STRUKTUR HALAMAN
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Struktur Halaman</TableCell>
                <TableCell>{cif.pageStructure}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Fitur Utama</TableCell>
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
        <DocumentSignatureFooter
          locationCity="Subang"
          dateStr={cif.date}
          party1Title="Admin / Sales"
          party1Sub="ATASILABS"
          party1Name={cif.adminName}
          party1Role="Representatif Atasilabs"
          party1Sig={cif.party1Signature}
          onSignParty1Cb={onSignParty1}
          isSingleSigner={true}
        />
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

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {!isClientRole && onSignParty1 && (
            <Button variant="outlined" color="primary" size="small" startIcon={<DrawIcon />} onClick={onSignParty1} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 1 (Atasilabs)
            </Button>
          )}
          {onSignParty2 && (
            <Button variant="outlined" color="secondary" size="small" startIcon={<DrawIcon />} onClick={onSignParty2} sx={{ fontWeight: 700 }}>
              Tanda Tangan Klien
            </Button>
          )}
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
          <Typography variant="body2">{rsd.solutionSummary}</Typography>
        </Paper>

        {/* 2. Ruang Lingkup Pekerjaan */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          2. RUANG LINGKUP PEKERJAAN (SCOPE OF WORK)
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Dalam Scope (In-Scope)</TableCell>
                <TableCell>{rsd.inScope}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Luar Scope (Out-of-Scope)</TableCell>
                <TableCell color="error.main">{rsd.outOfScope}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 3. Arsitektur Teknologi */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1 }}>
          3. ARSITEKTUR TEKNOLOGI & STACK
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Komponen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teknologi & Framework</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Versi / Spesifikasi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Alasan Pemilihan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rsd.techStack?.map((stack, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 600 }}>{stack.component}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{stack.techFramework}</TableCell>
                  <TableCell>{stack.versionSpec}</TableCell>
                  <TableCell>{stack.reason}</TableCell>
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
        <DocumentSignatureFooter
          locationCity="Subang"
          dateStr={rsd.issueDate}
          party1Title="Disusun Oleh"
          party1Sub="ATASILABS"
          party1Name={rsd.authorITLead}
          party1Role="IT Lead / Software Architect"
          party1Sig={rsd.party1Signature}
          onSignParty1Cb={onSignParty1}
          isSingleSigner={true}
        />
      </Paper>
    );
  }

  // Render MoU Contract
  if (type === 'MOU') {
    const mou = data as MoUData;
    const party1Name = mou.party1Signature?.auditTrail?.signedBy || mou.atasilabsPic;
    const party1Role = mou.party1Signature?.auditTrail?.signerRole || mou.atasilabsRole;
    const party2Name = mou.party2Signature?.auditTrail?.signedBy || mou.clientPic;
    const party2Role = mou.party2Signature?.auditTrail?.signerRole || mou.clientRole;

    const copySummary = `[MEMORANDUM OF UNDERSTANDING (MoU)]\nNomor: ${mou.docNumber}\nPihak 1: ATASILABS (${party1Name})\nPihak 2: ${mou.clientCompany} (${party2Name})\nTotal Investasi: Rp ${mou.totalInvestment?.toLocaleString('id-ID')} (${mou.totalInvestmentTerbilang})\nBank: ${mou.bankAccount?.bankName} - ${mou.bankAccount?.accountNumber} a.n. ${mou.bankAccount?.accountHolder}`;

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

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {!isClientRole && onSignParty1 && (
            <Button variant="outlined" color="primary" size="small" startIcon={<DrawIcon />} onClick={onSignParty1} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 1 (AtasiLabs)
            </Button>
          )}
          {onSignParty2 && (
            <Button variant="outlined" color="secondary" size="small" startIcon={<DrawIcon />} onClick={onSignParty2} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 2 (Klien)
            </Button>
          )}
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
            1. <strong>ATASILABS</strong>, penyedia layanan pengembangan teknologi dan produk digital, berkedudukan di Subang, Jawa Barat, diwakili oleh <strong>{party1Name}</strong> ({party1Role}) yang selanjutnya disebut <strong>PIHAK PERTAMA</strong>.
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>{mou.clientCompany}</strong>, berkedudukan di {mou.clientAddress}, diwakili oleh <strong>{party2Name}</strong> ({party2Role}) yang selanjutnya disebut <strong>PIHAK KEDUA</strong>.
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
          <Typography variant="caption" display="block" sx={{ fontWeight: 700, mb: 0.5 }}>
            Rekening Resmi Pembayaran:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {mou.bankAccount?.bankName} — {mou.bankAccount?.accountNumber} a.n. {mou.bankAccount?.accountHolder}
          </Typography>
        </Paper>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          PASAL 3: KETENTUAN GARANSI & PEMELIHARAAN
        </Typography>
        <Typography variant="body2" paragraph>
          PIHAK PERTAMA memberikan garansi perbaikan bug/error selama <strong>{mou.warrantyDays || 30} hari kalender</strong> setelah penyerahan hasil pengerjaan & kredensial secara lengkap.
        </Typography>

        {/* Signature */}
        <DocumentSignatureFooter
          locationCity="Subang"
          dateStr={mou.date}
          party1Title="PIHAK PERTAMA"
          party1Sub="ATASILABS"
          party1Name={party1Name}
          party1Role={party1Role}
          party1Sig={mou.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="PIHAK KEDUA"
          party2Sub={mou.clientCompany}
          party2Name={party2Name}
          party2Role={party2Role}
          party2Sig={mou.party2Signature}
          onSignParty2Cb={onSignParty2}
        />
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

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {!isClientRole && onSignParty1 && (
            <Button variant="outlined" color="primary" size="small" startIcon={<DrawIcon />} onClick={onSignParty1} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 1 (AtasiLabs)
            </Button>
          )}
          {onSignParty2 && (
            <Button variant="outlined" color="secondary" size="small" startIcon={<DrawIcon />} onClick={onSignParty2} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 2 (Freelancer)
            </Button>
          )}
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
        <DocumentSignatureFooter
          locationCity="Subang"
          dateStr={spk.date}
          party1Title="PIHAK PERTAMA"
          party1Sub="ATASILABS"
          party1Name={spk.atasilabsPic}
          party1Role={spk.atasilabsRole}
          party1Sig={spk.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="PIHAK KEDUA"
          party2Sub="Freelancer Partner"
          party2Name={spk.freelancerName}
          party2Role={`NIK: ${spk.freelancerNik}`}
          party2Sig={spk.party2Signature}
          onSignParty2Cb={onSignParty2}
        />
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

        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {!isClientRole && onSignParty1 && (
            <Button variant="outlined" color="primary" size="small" startIcon={<DrawIcon />} onClick={onSignParty1} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 1 (AtasiLabs)
            </Button>
          )}
          {onSignParty2 && (
            <Button variant="outlined" color="secondary" size="small" startIcon={<DrawIcon />} onClick={onSignParty2} sx={{ fontWeight: 700 }}>
              Tanda Tangan Pihak 2 (Klien)
            </Button>
          )}
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
        <DocumentSignatureFooter
          locationCity={bast.locationCity || 'Subang'}
          dateStr={bast.date}
          party1Title="PIHAK PERTAMA"
          party1Sub="ATASILABS"
          party1Name={bast.atasilabsPic}
          party1Role={bast.atasilabsRole}
          party1Sig={bast.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="PIHAK KEDUA"
          party2Sub={bast.clientCompany}
          party2Name={bast.clientPic}
          party2Role={bast.clientRole}
          party2Sig={bast.party2Signature}
          onSignParty2Cb={onSignParty2}
        />
      </Paper>
    );
  }

  if (type === 'QA') {
    const qa = data as QAData;
    const copySummary = `[LAPORAN QA & CHECKLIST UAT]\nNo: ${qa.docNumber}\nProyek: ${qa.projectTitle}\nKlien: ${qa.clientName}\nStatus Akhir: ${qa.overallStatus}\nStaging: ${qa.stagingUrl}`;

    const toggleOverallStatus = () => {
      if (!onUpdateQA) return;
      const nextMap: Record<string, QAData['overallStatus']> = {
        PASSED: 'NEEDS_REVISION',
        NEEDS_REVISION: 'APPROVED',
        APPROVED: 'FAILED',
        FAILED: 'PASSED',
      };
      const newStatus = nextMap[qa.overallStatus] || 'PASSED';
      onUpdateQA({ ...qa, overallStatus: newStatus, updatedAt: new Date().toISOString() });
    };

    const toggleTestItemStatus = (index: number) => {
      if (!onUpdateQA) return;
      const currentItems = [...(qa.testItems || [])];
      const item = currentItems[index];
      if (!item) return;

      const nextStatusMap: Record<string, 'PASSED' | 'FAILED' | 'PENDING'> = {
        PASSED: 'FAILED',
        FAILED: 'PENDING',
        PENDING: 'PASSED',
      };
      const newStatus = nextStatusMap[item.status] || 'PASSED';
      currentItems[index] = { ...item, status: newStatus };
      onUpdateQA({ ...qa, testItems: currentItems, updatedAt: new Date().toISOString() });
    };

    const setAllTestItemsPassed = () => {
      if (!onUpdateQA) return;
      const updated = (qa.testItems || []).map((ti) => ({ ...ti, status: 'PASSED' as const }));
      onUpdateQA({ ...qa, testItems: updated, overallStatus: 'PASSED', updatedAt: new Date().toISOString() });
    };

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}
      >
        {/* Document Actions Bar (Hidden on Print) */}
        <Box
          className="no-print"
          sx={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="DOKUMEN RESMI SOP TAHAP 5 — QA & CHECKLIST UAT" color="secondary" sx={{ fontWeight: 800 }} />
            {onUpdateQA && (
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<CheckIcon />}
                onClick={setAllTestItemsPassed}
                sx={{ fontSize: '0.72rem', fontWeight: 700 }}
              >
                Set Semua Passed
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon />}
              onClick={() => handleCopyText(copySummary)}
            >
              Salin Teks QA
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ fontWeight: 700 }}
            >
              Cetak PDF / Print
            </Button>
          </Box>
        </Box>

        {/* Header Letterhead Component Standard Atasilabs */}
        <Letterhead title="DOKUMEN QUALITY ASSURANCE & CHECKLIST UAT" />

        <Typography variant="caption" display="block" textAlign="center" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
          Nomor: {qa.docNumber} | Tanggal Pengujian: {qa.issueDate}
        </Typography>

        {/* Summary Info */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30%', bgcolor: 'action.hover' }}>Nama Proyek</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{qa.projectTitle}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Klien / Instansi</TableCell>
                <TableCell>{qa.clientName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>QA Lead & Tester</TableCell>
                <TableCell>{qa.qaLeadName} / {qa.testerName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>PIC UAT Klien</TableCell>
                <TableCell>{qa.clientPic}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>URL Staging Test</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>{qa.stagingUrl}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Status Pengujian Akhir</TableCell>
                <TableCell>
                  <Tooltip title={onUpdateQA ? 'Klik untuk toggle status pengujian akhir' : ''}>
                    <Chip
                      label={`STATUS AKHIR: ${qa.overallStatus}`}
                      size="small"
                      color={
                        qa.overallStatus === 'PASSED' || qa.overallStatus === 'APPROVED'
                          ? 'success'
                          : qa.overallStatus === 'FAILED'
                          ? 'error'
                          : 'warning'
                      }
                      onClick={onUpdateQA && !isClientRole ? toggleOverallStatus : undefined}
                      sx={{ fontWeight: 800, cursor: onUpdateQA && !isClientRole ? 'pointer' : 'default' }}
                    />
                  </Tooltip>
                  {onUpdateQA && !isClientRole && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.68rem' }} className="no-print">
                      (Klik chip untuk ubah status)
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Ringkasan Scope QA */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mt: 3, mb: 1 }}>
          RINGKASAN SKENARIO PENGUJIAN & PATOKAN SPESIFIKASI RSD
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.01)' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
            {qa.summary}
          </Typography>
        </Paper>

        {/* Test Items Table */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706', mb: 1.5 }}>
          DAFTAR CHECKLIST TESTING & VALIDASI FITUR ACUAN RSD
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: '5%' }}>No</TableCell>
                <TableCell sx={{ fontWeight: 800, width: '25%' }}>Kategori & Ref RSD</TableCell>
                <TableCell sx={{ fontWeight: 800, width: '30%' }}>Test Case & Skenario</TableCell>
                <TableCell sx={{ fontWeight: 800, width: '25%' }}>Hasil Diharapkan</TableCell>
                <TableCell sx={{ fontWeight: 800, width: '15%' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(qa.testItems || []).map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {item.category}
                    {item.notes && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {item.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.testCase}</TableCell>
                  <TableCell>{item.expectedResult}</TableCell>
                  <TableCell>
                    <Tooltip title={onUpdateQA && !isClientRole ? 'Klik untuk toggle status (PASSED -> FAILED -> PENDING)' : ''}>
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === 'PASSED'
                            ? 'success'
                            : item.status === 'FAILED'
                            ? 'error'
                            : 'warning'
                        }
                        onClick={onUpdateQA && !isClientRole ? () => toggleTestItemStatus(idx) : undefined}
                        sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem', cursor: onUpdateQA && !isClientRole ? 'pointer' : 'default' }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Signature */}
        <DocumentSignatureFooter
          locationCity="Subang / Online"
          dateStr={qa.issueDate}
          party1Title="QA LEAD & DEVELOPER"
          party1Sub="ATASILABS"
          party1Name={qa.qaLeadName}
          party1Role="QA Lead & Tech Director"
          party1Sig={qa.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="PIC UAT KLIEN"
          party2Sub={qa.clientName}
          party2Name={qa.clientPic}
          party2Role="Penanggung Jawab UAT Klien"
          party2Sig={qa.party2Signature}
          onSignParty2Cb={onSignParty2}
        />
      </Paper>
    );
  }

  return null;
};
