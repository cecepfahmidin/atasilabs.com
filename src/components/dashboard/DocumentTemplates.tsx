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
import { numberToWordsIDR } from '../../lib/documentGenerator';

export function parseIndonesianDateParts(dateStr?: string) {
  if (!dateStr) {
    return {
      dayName: '............',
      dayNum: '........',
      monthName: '........',
      yearNum: '202...',
      formattedDate: '../../20..',
    };
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return {
      dayName: '............',
      dayNum: '........',
      monthName: '........',
      yearNum: '202...',
      formattedDate: dateStr,
    };
  }

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[d.getDay()];
  const dayNum = String(d.getDate());
  const monthName = months[d.getMonth()];
  const yearNum = String(d.getFullYear());
  const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

  return { dayName, dayNum, monthName, yearNum, formattedDate };
}

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
  const { showNotification, currentUser, users } = useApp();
  const isClientRole = currentUser?.role === 'CLIENT';

  const getDynamicSignerRole = (name?: string, fallbackRole?: string): string => {
    if (name && users && users.length > 0) {
      const matched = users.find((u) => u.name.trim().toLowerCase() === name.trim().toLowerCase());
      if (matched) {
        switch (matched.role) {
          case 'CEO':
            return 'Chief Executive Officer (CEO)';
          case 'CTO':
            return 'Chief Technology Officer (CTO)';
          case 'CMO':
            return 'Chief Marketing Officer (CMO)';
          case 'ADMIN':
            return 'System Administrator (ADMIN)';
          case 'DEVELOPER':
            return 'In-House Developer (DEVELOPER)';
          case 'FREELANCER':
            return 'Mitra / Freelance Developer (FREELANCER)';
          case 'CLIENT':
            return 'Klien / Enterprise Customer (CLIENT)';
          default:
            return matched.role;
        }
      }
    }
    return fallbackRole || 'Penanggung Jawab';
  };

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
    const finalParty1Role = party1Sig?.auditTrail?.signerRole || getDynamicSignerRole(finalParty1Name, party1Role);
    const finalParty2Name = party2Sig?.auditTrail?.signedBy || party2Name;
    const finalParty2Role = party2Sig?.auditTrail?.signerRole || getDynamicSignerRole(finalParty2Name, party2Role);

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

            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline', textUnderlineOffset: '3px', pt: 0.5, display: 'inline-block', px: 1 }}>
              {finalParty1Name || '....................'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mt: 0.3 }}>{finalParty1Role}</Typography>
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

              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline', textUnderlineOffset: '3px', pt: 0.5, display: 'inline-block', px: 1 }}>
                {finalParty2Name || '....................'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mt: 0.3 }}>{finalParty2Role}</Typography>
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
            Website: www.atasilabs.com | Email: atasilabs@gmail.com
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

    // Helper for visual style rendering
    const vsObj = typeof cif.visualStyle === 'object' && cif.visualStyle !== null ? cif.visualStyle : {
      modern: typeof cif.visualStyle === 'string' && cif.visualStyle.includes('Modern'),
      professional: typeof cif.visualStyle === 'string' && cif.visualStyle.includes('Profesional'),
      elegant: typeof cif.visualStyle === 'string' && cif.visualStyle.includes('Elegant'),
      others: typeof cif.visualStyle === 'string' && !cif.visualStyle.includes('Modern') && !cif.visualStyle.includes('Profesional') && !cif.visualStyle.includes('Elegant') ? cif.visualStyle : '',
    };

    const headerYellow = '#f1ab00';
    const headerGreen = '#a8d08d';

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: 0,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
        }}
      >
        {/* Full-bleed Header Image (public/header.png) */}
        <Box sx={{ width: '100%', m: 0, p: 0, lineHeight: 0, position: 'relative', zIndex: 0 }}>
          <Box
            component="img"
            src="/header.png"
            alt="Header Dokumen CIF Atasilabs"
            sx={{
              width: '100%',
              display: 'block',
              height: 'auto',
            }}
            onError={(e: any) => {
              if (e.target.parentElement) {
                e.target.parentElement.style.display = 'none';
              }
            }}
          />
        </Box>

        {/* Document Content Body overlay */}
        <Box
          className="doc-content-body"
          sx={{
            position: 'relative',
            zIndex: 1,
            p: { xs: 2.5, sm: 4 },
            pt: 1.5,
          }}
        >
          {/* Top Header Title & Metadata Table */}
          <Box
            className="doc-header-top"
            sx={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
              pb: 1,
              borderBottom: '1px solid #e2e8f0',
              mt: { xs: '-100px', sm: '-145px', md: '-170px' },
            }}
          >
            <Box sx={{ pt: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.2 }}>
                Client Intake Form (CIF)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mt: 0.5 }}>
                Standard Operating Procedure (SOP) Internal
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <TableContainer component={Box} sx={{ border: '1px solid #000', borderRadius: 0, display: 'inline-block' }}>
                <Table size="small" sx={{ width: 'auto', '& .MuiTableCell-root': { py: 0.3, px: 1, fontSize: '0.75rem', border: '1px solid #000' } }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Nama Admin</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>: {cif.adminName || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Tanggal</TableCell>
                      <TableCell>: {cif.date || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Sumber Informasi</TableCell>
                      <TableCell>: {cif.infoSource || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

        {/* RINGKASAN EKSEKUTIF */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', mb: 0.5 }}>
            RINGKASAN EKSEKUTIF
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Dokumen ini digunakan oleh tim admin (sales) untuk mencatat, mengorganisir dan menyetujui ringkasan kebutuhan proyek pengembangan website, aplikasi maupun produk digital berdasarkan hasil diskusi awal dengan klien.
          </Typography>
        </Box>

        {/* 1. INFORMASI UMUM KLIEN DAN PROYEK */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            1. INFORMASI UMUM KLIEN DAN PROYEK
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '32%', bgcolor: '#ffffff' }}>Nama Klien/Perusahaan</TableCell>
                  <TableCell>{cif.clientName || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Penanggung Jawab (PIC)*</TableCell>
                  <TableCell>{cif.picName || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Kontak (Email/Whatsapp)</TableCell>
                  <TableCell>{cif.contact || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Bidang Usaha/Industri</TableCell>
                  <TableCell>{cif.industry || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Website (jika ada)</TableCell>
                  <TableCell>{cif.websiteUrl || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Lokasi/Tempat Usaha Klien</TableCell>
                  <TableCell>{cif.businessLocation || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#475569', mt: 0.5, display: 'block' }}>
            *Jika perusahaan memiliki struktur manajemen yang kompleks
          </Typography>
        </Box>

        {/* 2. PROFIL PROYEK & TUJUAN BISNIS */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            2. PROFIL PROYEK & TUJUAN BISNIS
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Ringkasan Proyek
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {cif.projectSummary || '-'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Tujuan Utama Pembuatan Website (Primary Goals)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {cif.primaryGoals || '-'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Target Audiens / Pengguna Website
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {cif.targetAudience || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#475569', mt: 0.5, display: 'block' }}>
            Note: Demografi (usia, profesi, lokasi) & Perilaku (apa yang di cari saat berkunjung ke website)
          </Typography>
        </Box>

        {/* 3. RUANG LINGKUP & FITUR WEBSITE */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            3. RUANG LINGKUP & FITUR WEBSITE
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Rincian Spesifikasi & Kebutuhan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tipe Website/Tier</TableCell>
                  <TableCell>{cif.tier || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Struktur Halaman</TableCell>
                  <TableCell>{cif.pageStructure || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fitur Utama</TableCell>
                  <TableCell>{cif.mainFeatures || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Teknologi & Framework</TableCell>
                  <TableCell>{cif.techFramework || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Lain – Lain</TableCell>
                  <TableCell>{cif.scopeOthers || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 4. DESAIN & BRANDING */}
        <Box className="section-block" sx={{ mb: 2.5, pt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            4. DESAIN & BRANDING
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Rincian Spesifikasi & Kebutuhan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Aset Branding Klien</TableCell>
                  <TableCell>
                    ({cif.brandingAssets?.logo ? ' ✓ ' : '   '}) Logo, ({cif.brandingAssets?.color ? ' ✓ ' : '   '}) Warna, ({cif.brandingAssets?.officialFont ? ' ✓ ' : '   '}) Font Resmi, ({cif.brandingAssets?.others ? ' ✓ ' : '   '}) Lainnya {cif.brandingAssets?.others ? `: ${cif.brandingAssets.others}` : '.....'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Gaya Visual (Style/Vibe)</TableCell>
                  <TableCell>
                    ({vsObj.modern ? ' ✓ ' : '   '}) Modern/Minimalis, ({vsObj.professional ? ' ✓ ' : '   '}) Profesional/Korporasi, ({vsObj.elegant ? ' ✓ ' : '   '}) Elegant/Mewah, ({vsObj.others ? ' ✓ ' : '   '}) Lainnya {vsObj.others ? `: ${vsObj.others}` : '....'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, verticalAlign: 'top', pt: 0.6 }}>Referensi Website (menyukai)</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}>(1) {cif.referenceWebsites?.[0] || '....................................................................................'}</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}>(2) {cif.referenceWebsites?.[1] || '....................................................................................'}</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}>(3) {cif.referenceWebsites?.[2] || '....................................................................................'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 5. MATERI & ASET KONTEN */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            5. MATERI & ASET KONTEN
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Penanggung Jawab / Catatan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Ketersediaan Konten</TableCell>
                  <TableCell>
                    ({cif.contentAvailability?.general === 'Tersedia' ? ' ✓ ' : '   '}) Tersedia, ({cif.contentAvailability?.general === 'Tidak Tersedia' ? ' ✓ ' : '   '}) Tidak Tersedia, ({cif.contentAvailability?.general === 'Disediakan Developer' ? ' ✓ ' : '   '}) Disediakan Developer
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Teks/Copywriting</TableCell>
                  <TableCell>
                    ({cif.contentAvailability?.copywriting === 'Tersedia' ? ' ✓ ' : '   '}) Tersedia, ({cif.contentAvailability?.copywriting === 'Tidak Tersedia' ? ' ✓ ' : '   '}) Tidak Tersedia, ({cif.contentAvailability?.copywriting === 'Disediakan Developer' ? ' ✓ ' : '   '}) Disediakan Developer
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Gambar/Foto/Produk</TableCell>
                  <TableCell>
                    ({cif.contentAvailability?.images === 'Tersedia' ? ' ✓ ' : '   '}) Tersedia, ({cif.contentAvailability?.images === 'Tidak Tersedia' ? ' ✓ ' : '   '}) Tidak Tersedia, ({cif.contentAvailability?.images === 'Disediakan Developer' ? ' ✓ ' : '   '}) Disediakan Developer
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 6. ESTIMASI WAKTU, ANGGARAN & PERSETUJUAN */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            6. ESTIMASI WAKTU, ANGGARAN & PERSETUJUAN
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Penanggung Jawab / Catatan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Estimasi Biaya Proyek</TableCell>
                  <TableCell>
                    Tier: {cif.tier || '....'} {cif.additionalCosts ? `/ Biaya Tambahan: Rp ${cif.additionalCosts.toLocaleString('id-ID')}` : '/ Biaya Tambahan: Rp 0'} (Total: Rp {cif.estimatedBudget?.toLocaleString('id-ID') || 0})
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Skema Pembayaran</TableCell>
                  <TableCell>
                    DP( {cif.paymentScheme?.dpPercent ?? 30}% ), Mid Project ( {cif.paymentScheme?.midPercent ?? 30}% ), Pelunasan( {cif.paymentScheme?.finalPercent ?? 40}% )
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Target Selesai (Launch Date)</TableCell>
                  <TableCell>Tanggal: {cif.targetLaunchDate || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 7. CATATAN TAMBAHAN & PERSETUJUAN */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            7. CATATAN TAMBAHAN & PERSETUJUAN
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerGreen }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Prihal</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Catatan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cif.additionalNotesTable && cif.additionalNotesTable.length > 0 ? (
                  cif.additionalNotesTable.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 700 }}>{row.prihal || '-'}</TableCell>
                      <TableCell>{row.catatan || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Catatan Khusus</TableCell>
                    <TableCell>{cif.additionalNotes || '-'}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Signature Footer matching Formal Indonesian Official Document Standards */}
        <Box sx={{ mt: 5, pt: 2, display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
          <Box sx={{ minWidth: 260 }}>
            {/* Tempat & Tanggal Penandatanganan */}
            <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, fontSize: '0.85rem' }}>
              Subang, {cif.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>

            {/* 1. JABATAN & INSTANSI DI ATAS */}
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Hormat kami,
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em', mb: 1 }}>
              ATASILABS
            </Typography>

            {/* 2. TANDATANGAN DI TENGAH */}
            {cif.party1Signature?.signatureBase64 ? (
              <Box sx={{ my: 1, p: 1, border: '1px dashed #cbd5e1', borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                <Box
                  component="img"
                  src={cif.party1Signature.signatureBase64}
                  alt="Tanda Tangan Admin"
                  sx={{ maxHeight: 65, maxWidth: 190, mx: 'auto', display: 'block', objectFit: 'contain' }}
                />
                {cif.party1Signature.auditTrail?.signedAt && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, fontStyle: 'italic' }}>
                    Signed: {cif.party1Signature.auditTrail.signedAt}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  ( Tanda Tangan Digital )
                </Typography>
              </Box>
            )}

            {/* 3. NAMA LENGKAP & JABATAN DI BAWAH (KAIDAH RESMI NASKAH DINAS) */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                mt: 1.5,
                fontSize: '0.925rem',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {cif.party1Signature?.auditTrail?.signedBy || cif.adminName || 'Irfan Aulia Ulumudin'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: '#475569', mt: 0.5, fontSize: '0.78rem' }}>
              {cif.party1Signature?.auditTrail?.signerRole || getDynamicSignerRole(cif.party1Signature?.auditTrail?.signedBy || cif.adminName, 'Founder & CEO Atasilabs')}
            </Typography>
          </Box>
        </Box>
        </Box>
      </Paper>
    );
  }

  // Render Requirement Specification Document (RSD)
  if (type === 'RSD') {
    const rsd = data as RSDData;
    const headerYellow = '#f1ab00';
    const headerGreen = '#a8d08d';

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
        }}
      >
        {/* Custom PDF Kop & Top Header Table */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 1, borderBottom: '2px solid #000' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo.svg" alt="Atasilabs Logo" sx={{ height: 36, width: 'auto' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                atasilabs
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block' }}>
                Standard Operating Procedure (SOP) Internal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
              Requirement Specification Document (RSD)
            </Typography>
            <Box sx={{ mt: 0.5, display: 'inline-block' }}>
              <Table size="small" sx={{ width: 'auto', borderCollapse: 'collapse', border: '1px solid #000', '& .MuiTableCell-root': { py: 0.3, px: 1, fontSize: '0.75rem', border: '1px solid #000' } }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Kode RSD</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>: {rsd.docCode || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Tanggal Terbit</TableCell>
                    <TableCell>: {rsd.issueDate || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Disusun Oleh</TableCell>
                    <TableCell>: {rsd.authorITLead || 'Cecep Fahmidin (IT Lead)'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>

        {/* RINGKASAN EKSEKUTIF */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', mb: 0.5 }}>
            RINGKASAN EKSEKUTIF
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Dokumen ini disusun oleh tim IT Lead / System Architect untuk mendokumentasikan spesifikasi teknis, arsitektur sistem, ruang lingkup pekerjaan (scope), serta fitur fungsional proyek pengembangan website/produk digital berdasarkan kebutuhan klien.
          </Typography>
        </Box>

        {/* 1. INFORMASI UMUM PROYEK & KLIEN */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            1. INFORMASI UMUM PROYEK & KLIEN
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '32%', bgcolor: '#ffffff' }}>Nama Klien / Perusahaan</TableCell>
                  <TableCell>{rsd.clientName || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Penanggung Jawab (PIC)*</TableCell>
                  <TableCell>{rsd.clientPic || (rsd.clientName ? `${rsd.clientName} (PIC Utama)` : '-')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Kontak (Email / Whatsapp)</TableCell>
                  <TableCell>{rsd.clientContact || rsd.emailPass || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Domain / Tempat Pengujian</TableCell>
                  <TableCell>{rsd.domain || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#ffffff' }}>Tim Developer / IT Lead</TableCell>
                  <TableCell>{rsd.authorITLead || rsd.freelancerName || 'Cecep Fahmidin (IT Lead Atasilabs)'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 2. LATAR BELAKANG & TUJUAN PROYEK */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            2. LATAR BELAKANG & TUJUAN PROYEK
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Konteks Bisnis Klien (Background)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {rsd.businessContext || '-'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Penyelesaian Kebutuhan (Solution Summary)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {rsd.solutionSummary || '-'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: headerGreen, color: '#000', pt: 0.6, pb: 0.5, px: 1.5 }}>
                    Target Utama Proyek (Primary Goals)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pt: 0.6, pb: 0.5, px: 1.5, verticalAlign: 'middle' }}>
                    {rsd.projectGoals || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 3. RUANG LINGKUP PEKERJAAN (SCOPE OF WORK) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            3. RUANG LINGKUP PEKERJAAN (SCOPE OF WORK)
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Rincian Spesifikasi Scope</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Dalam Scope (In-Scope)</TableCell>
                  <TableCell>{rsd.inScope || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Luar Scope (Out-of-Scope)</TableCell>
                  <TableCell>{rsd.outOfScope || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 4. ARSITEKTUR TEKNOLOGI & STACK */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            4. ARSITEKTUR TEKNOLOGI & STACK
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '22%', color: '#000' }}>Komponen</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '28%', color: '#000' }}>Teknologi & Framework</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '20%', color: '#000' }}>Versi / Spesifikasi</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Alasan Pemilihan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rsd.techStack && rsd.techStack.length > 0 ? (
                  rsd.techStack.map((stack, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 700 }}>{stack.component || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{stack.techFramework || '-'}</TableCell>
                      <TableCell>{stack.versionSpec || '-'}</TableCell>
                      <TableCell>{stack.reason || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ fontStyle: 'italic', color: '#64748b' }}>
                      Belum ada spesifikasi tech stack yang ditambahkan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 5. SPESIFIKASI FITUR FUNGSIONAL (ATL-xxx) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            5. SPESIFIKASI FITUR FUNGSIONAL (ATL-xxx)
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '15%', color: '#000' }}>ID Fitur</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '22%', color: '#000' }}>Modul / Area</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Nama Fitur & Deskripsi</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '18%', color: '#000' }}>Hak Akses (Role)</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '15%', color: '#000' }}>Prioritas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rsd.functionalFeatures && rsd.functionalFeatures.length > 0 ? (
                  rsd.functionalFeatures.map((feat) => (
                    <TableRow key={feat.id || feat.featureCode}>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{feat.featureCode || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{feat.moduleArea || '-'}</TableCell>
                      <TableCell>{feat.nameAndDesc || '-'}</TableCell>
                      <TableCell>{feat.roleAccess || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {feat.priority || 'High'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ fontStyle: 'italic', color: '#64748b' }}>
                      Belum ada fitur fungsional yang ditambahkan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 6. KEBUTUHAN NON-FUNGSIONAL (NFR) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            6. KEBUTUHAN NON-FUNGSIONAL (NFR)
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerYellow }}>
                  <TableCell sx={{ fontWeight: 800, width: '32%', color: '#000' }}>Kategori NFR</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Kriteria Performa & Keamanan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Keamanan (Security)</TableCell>
                  <TableCell>{rsd.nonFunctional?.security || 'Enkripsi HTTPS & Supabase RLS Policies'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Performa (Performance)</TableCell>
                  <TableCell>{rsd.nonFunctional?.performance || 'Waktu respon API ≤ 2 detik, load time halaman ≤ 3 detik'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Ketersediaan (Availability)</TableCell>
                  <TableCell>{rsd.nonFunctional?.availability || 'Target uptime server minimal 99.5%'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Kompatibilitas (Compatibility)</TableCell>
                  <TableCell>{rsd.nonFunctional?.compatibility || 'Fully responsive pada Chrome, Firefox, Safari, & Edge (Mobile/Desktop)'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 7. ESTIMASI TAHAPAN PENGERJAAN (SPRINT MILESTONE) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#000', mb: 0.5 }}>
            7. ESTIMASI TAHAPAN PENGERJAAN (SPRINT MILESTONE)
          </Typography>
          <Box sx={{ border: 'none', p: 0, m: 0 }}>
            <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '0 !important', padding: '0 !important', '& .MuiTableCell-root': { pt: 0.6, pb: 0.5, px: 1.5, border: '1px solid #000', fontSize: '0.85rem', lineHeight: 1.35, verticalAlign: 'middle' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerGreen }}>
                  <TableCell sx={{ fontWeight: 800, width: '25%', color: '#000' }}>Tahapan / Sprints</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#000' }}>Pekerjaan / Output</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '20%', color: '#000' }}>Estimasi Durasi</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '22%', color: '#000' }}>Target Deadline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rsd.milestones && rsd.milestones.length > 0 ? (
                  rsd.milestones.map((ms, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 700 }}>{ms.name || `Milestone ${idx + 1}`}</TableCell>
                      <TableCell>{ms.scope || '-'}</TableCell>
                      <TableCell>{ms.durationDays ? `${ms.durationDays} Hari` : '-'}</TableCell>
                      <TableCell>Tanggal: {ms.targetDate || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Sprints 1</TableCell>
                      <TableCell>Discovery & Setup Baseline Database Schema</TableCell>
                      <TableCell>5 Hari</TableCell>
                      <TableCell>Tanggal: {rsd.issueDate || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Sprints 2</TableCell>
                      <TableCell>Development Frontend Layout & Component UI</TableCell>
                      <TableCell>7 Hari</TableCell>
                      <TableCell>Tanggal: {rsd.issueDate || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Sprints 3</TableCell>
                      <TableCell>Backend API Integration & Auth RLS Policies</TableCell>
                      <TableCell>10 Hari</TableCell>
                      <TableCell>Tanggal: {rsd.issueDate || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Sprints 4</TableCell>
                      <TableCell>QA Testing, Security Audit & Final Deployment</TableCell>
                      <TableCell>5 Hari</TableCell>
                      <TableCell>Tanggal: {rsd.issueDate || '-'}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Signature Footer matching Formal Indonesian Official Document Standards */}
        <Box sx={{ mt: 5, pt: 2, display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
          <Box sx={{ minWidth: 260 }}>
            {/* Tempat & Tanggal Penandatanganan */}
            <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, fontSize: '0.85rem' }}>
              Subang, {rsd.issueDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>

            {/* 1. JABATAN & INSTANSI DI ATAS */}
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Disusun oleh,
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em', mb: 1 }}>
              ATASILABS
            </Typography>

            {/* 2. TANDATANGAN DI TENGAH */}
            {rsd.party1Signature?.signatureBase64 ? (
              <Box sx={{ my: 1, p: 1, border: '1px dashed #cbd5e1', borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                <Box
                  component="img"
                  src={rsd.party1Signature.signatureBase64}
                  alt="Tanda Tangan IT Lead"
                  sx={{ maxHeight: 65, maxWidth: 190, mx: 'auto', display: 'block', objectFit: 'contain' }}
                />
                {rsd.party1Signature.auditTrail?.signedAt && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, fontStyle: 'italic' }}>
                    Signed: {rsd.party1Signature.auditTrail.signedAt}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  ( Tanda Tangan Digital )
                </Typography>
              </Box>
            )}

            {/* 3. NAMA LENGKAP & JABATAN DI BAWAH (KAIDAH RESMI NASKAH DINAS) */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                mt: 1.5,
                fontSize: '0.925rem',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {rsd.party1Signature?.auditTrail?.signedBy || rsd.authorITLead || 'Cecep Fahmidin'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: '#475569', mt: 0.5, fontSize: '0.78rem' }}>
              {rsd.party1Signature?.auditTrail?.signerRole || getDynamicSignerRole(rsd.party1Signature?.auditTrail?.signedBy || rsd.authorITLead, 'IT Lead / Software Architect')}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Render MoU Contract
  if (type === 'MOU') {
    const mou = data as MoUData;
    const party1Name = mou.party1Signature?.auditTrail?.signedBy || mou.atasilabsPic || 'Irfan Aulia Ulumudin';
    const party1Role = mou.party1Signature?.auditTrail?.signerRole || getDynamicSignerRole(party1Name, mou.atasilabsRole || 'Founder & CEO Atasilabs');
    const party2Name = mou.party2Signature?.auditTrail?.signedBy || mou.clientPic || 'PIC Klien';
    const party2Role = mou.party2Signature?.auditTrail?.signerRole || getDynamicSignerRole(party2Name, mou.clientRole || 'Direktur / Penanggung Jawab Klien');

    const isTier1_2 = mou.tierCategory === 'Tier 1-2' || (mou.paymentScheme?.midPercent === 0 || !mou.paymentScheme?.midPercent);
    const copySummary = `[MEMORANDUM OF UNDERSTANDING (MoU)]\nNomor: ${mou.docNumber}\nPihak 1: ATASILABS (${party1Name} - ${party1Role})\nPihak 2: ${mou.clientCompany} (${party2Name} - ${party2Role})\nTier: ${mou.tierCategory}\nTotal Investasi: Rp ${mou.totalInvestment?.toLocaleString('id-ID')} (${mou.totalInvestmentTerbilang})\nBank: ${mou.bankAccount?.bankName} - ${mou.bankAccount?.accountNumber} a.n. ${mou.bankAccount?.accountHolder}`;

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
        }}
      >
        {/* Header Kop PDF MoU */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 1, borderBottom: '2px solid #000' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo.svg" alt="Atasilabs Logo" sx={{ height: 36, width: 'auto' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                atasilabs
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block' }}>
                Standard Operating Procedure (SOP) Internal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
              MEMORANDUM OF UNDERSTANDING (MoU)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block' }}>
              KERJASAMA PEMBUATAN WEBSITE DAN PENGEMBANGAN DIGITAL
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block', mt: 0.3 }}>
              Nomor: {mou.docNumber || '....../MoU/ATL/....../202....'}
            </Typography>
          </Box>
        </Box>



        {/* Pembukaan Dokumen MoU */}
        <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, lineHeight: 1.6 }}>
          Pada hari ini, <strong>{mou.dayName || '.....'}</strong>, Tanggal <strong>{mou.date}</strong>, telah terjadi kesepakatan kerjasama, diantara:
        </Typography>

        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
            1. <strong>ATASILABS</strong>, sebuah entitas penyedia layanan pengembangan teknologi dan produk digital, berkedudukan di Subang, Jawa Barat, dalam hal ini diwakili oleh <strong>{party1Name}</strong> selaku <strong>{party1Role}</strong> yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.5 }}>
            2. <strong>{mou.clientCompany || '(Nama Perusahaan/Klien)'}</strong>, berkedudukan di {mou.clientAddress || '(Alamat Klien)'}, dalam hal ini diwakili oleh <strong>{party2Name}</strong> selaku <strong>{party2Role}</strong>, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
          PIHAK PERTAMA dan PIHAK KEDUA secara Bersama – sama selanjutnya disebut sebagai <strong>“PARA PIHAK”</strong>. PARA PIHAK terlebih dahulu menerangkan hal-hal berikut:
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            • Bahwa PIHAK PERTAMA adalah pihak yang memiliki keahlian, pengalaman dan sumberdaya dalam pengembangan website, aplikasi serta produk digital.
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            • Bahwa PIHAK KEDUA membutuhkan jasa dan layanan pengembangan website untuk menunjang kegiatan operasional dan/atau bisnis PIHAK KEDUA.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.6 }}>
          Berdasarkan pertimbangan tersebut di atas, PARA PIHAK sepakat untuk membuat dan menyepakati Memorandum of Understanding (MoU) dengan ketentuan dan syarat sebagai berikut:
        </Typography>

        {/* PASAL 1 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 1: RUANG LINGKUP PEKERJAAN
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
            PIHAK PERTAMA sepakat untuk menyediakan jasa pengembangan website kepada PIHAK KEDUA yang termasuk dalam kategori <strong>{mou.tierCategory}</strong> mencakup rincian pekerjaan sebagai berikut:
          </Typography>
          <Box sx={{ pl: 2.5 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Perancangan, pengembangan dan integrasi database</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Pengujian sistem (testing & quality assurance) sebelum peluncuran</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Pelatihan singkat (user training) pengelolaan admin website</Typography>
          </Box>
        </Box>

        {/* PASAL 2 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 2: SPESIFIKASI DAN JADWAL PEKERJAAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
              1. Detail spesifikasi teknis dan batas waktu pengerjaan (timeline) diatur secara spesifik dalam dokumen lampiran/proposal penawaran yang menjadi satu kesatuan dengan MoU ini.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              2. Keterlambatan penyelesaian pekerjaan yang diakibatkan karena keterlambatan dalam penyerahan data, materi konten, akses, keputusan klien atau perubahan scope dapat menjadi dasar penyesuaian waktu penyelesaian.
            </Typography>
          </Box>
        </Box>

        {/* PASAL 3 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 3: BIAYA DAN SKEMA PEMBAYARAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 1 }}>
              1. Total nilai investasi pekerjaan pembuatan website ini disepakati sebesar <strong>Rp {mou.totalInvestment?.toLocaleString('id-ID') || '0'} ({mou.totalInvestmentTerbilang || '-'})</strong> dengan skema pembayaran berikut:
            </Typography>
            {isTier1_2 ? (
              <Box sx={{ pl: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
                  a. Pembayaran Tahap 1 (uang muka) ditetapkan 50% dari total harga yang telah disepakati sebesar <strong>Rp {mou.paymentScheme?.dpNominal?.toLocaleString('id-ID') || 0}</strong> yang dibayarkan pada saat penandatanganan MoU ini.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  b. Pembayaran Tahap 2 (pelunasan) ditetapkan 50% dari total harga yang telah disepakati sebesar <strong>Rp {mou.paymentScheme?.finalNominal?.toLocaleString('id-ID') || 0}</strong> yang dibayarkan setelah pekerjaan selesai diuji coba dan sebelum penyerahan hak akses utama/deployment live.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ pl: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
                  a. Pembayaran Tahap 1 (uang muka) ditetapkan 30% dari total harga yang telah disepakati sebesar <strong>Rp {mou.paymentScheme?.dpNominal?.toLocaleString('id-ID') || 0}</strong> yang dibayarkan pada saat penandatanganan MoU ini.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
                  b. Pembayaran Tahap 2 (progress development) ditetapkan 30% dari total harga yang telah disepakati sebesar <strong>Rp {mou.paymentScheme?.midNominal?.toLocaleString('id-ID') || 0}</strong> yang dibayarkan setelah desain disetujui dan sistem memasuki tahap akhir.
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  c. Pembayaran Tahap 3 (pelunasan) ditetapkan 40% dari total harga yang telah disepakati sebesar <strong>Rp {mou.paymentScheme?.finalNominal?.toLocaleString('id-ID') || 0}</strong> yang dibayarkan setelah pekerjaan selesai diuji coba dan sebelum penyerahan hak akses utama/deployment live.
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
              2. Pembayaran oleh PIHAK KEDUA kepada PIHAK PERTAMA dilaksanakan melalui Rekening PIHAK PERTAMA, sebagai berikut:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, mx: 2, my: 1, bgcolor: '#f8fafc', borderColor: '#cbd5e1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {mou.bankAccount?.bankName || 'BRI'} &nbsp;&nbsp;|&nbsp;&nbsp; No. Rekening: {mou.bankAccount?.accountNumber || '4388-01-00025-56-7'} &nbsp;&nbsp;|&nbsp;&nbsp; a.n. {mou.bankAccount?.accountHolder || 'PT AULIA INDOLAND GRUP'}
              </Typography>
            </Paper>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              3. Pembayaran melalui transfer dianggap sah apabila dana yang bersangkutan efektif diterima oleh PIHAK PERTAMA. PIHAK KEDUA akan dibuatkan tanda terima oleh PIHAK PERTAMA yang merupakan bagian tidak terpisahkan dari perjanjian ini.
            </Typography>
          </Box>
        </Box>

        {/* PASAL 4 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 4: KEWAJIBAN PARA PIHAK
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>1. Kewajiban PIHAK PERTAMA:</Typography>
            <Box sx={{ pl: 2, mb: 1 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Mengerjakan dan menyelesaikan pembuatan website sesuai dengan spesifikasi dan jadwal yang telah disepakati.</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Memberikan laporan perkembangan (progress report) secara berkala kepada PIHAK KEDUA.</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Memberikan garansi perbaikan bug/error selama {mou.warrantyDays || 30} (tiga puluh) hari setelah penyerahan hasil pengerjaan.</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>2. Kewajiban PIHAK KEDUA:</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Menyediakan data, materi konten (teks, gambar, logo, video) dan kredensial yang dibutuhkan tepat waktu.</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Melakukan pembayaran tepat waktu sesuai kesepakatan.</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>• Melakukan peninjauan (review) dan memberikan masukan/persetujuan atas hasil pengerjaan dengan tepat waktu.</Typography>
            </Box>
          </Box>
        </Box>

        {/* PASAL 5 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 5: PROSEDUR REVISI DAN PERUBAHAN PEKERJAAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK KEDUA berhak meminta revisi atas hasil pekerjaan yang tidak sesuai dengan brief, desain atau spesifikasi yang telah disepakati.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Revisi yang masih termasuk ruang lingkup pekerjaan tidak dikenakan biaya tambahan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Batas revisi yang termasuk dalam pekerjaan sebanyak {mou.revisionLimitDays || 3} kali revisi.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Perubahan permintaan dari PIHAK KEDUA yang menambah atau mengubah ruang lingkup pekerjaan dapat dikenakan biaya tambahan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Persetujuan melalui dokumen, email dan/atau WhatsApp dapat dianggap sebagai persetujuan tertulis sepanjang dapat dibuktikan dan memuat kesepakatan yang jelas.</Typography>
          </Box>
        </Box>

        {/* PASAL 6 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 6: SERAH TERIMA DAN MASA GARANSI
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK PERTAMA wajib menyerahkan website/produk digital termasuk didalamnya source code dan akses kepada PIHAK KEDUA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Serah terima pekerjaan dilakukan setelah fitur sesuai dengan spesifikasi teknis yang telah disepakati oleh PARA PIHAK.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Garansi tidak mencakup:</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>a. Perubahan fitur atau desain baru</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>b. Kerusakan akibat perubahan kode oleh pihak lain</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>c. Gangguan hosting, domain, server atau layanan pihak ketiga yang diluar kendali PIHAK PERTAMA</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>d. Pekerjaan tambahan setelah masa garansi dapat dikenakan biaya sesuai kesepakatan</Typography>
            </Box>
          </Box>
        </Box>

        {/* PASAL 7 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 7: HAK KEKAYAAN INTELEKTUAL (HKI)
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Seluruh Hak Kekayaan Intelektual atas konten, merek dagang dan data milik PIHAK KEDUA tetap sepenuhnya menjadi milik PIHAK KEDUA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Setelah pelunasan biaya pekerjaan selesai dilakukan oleh PIHAK KEDUA, hak penggunaan dan akses kode program (source code) website yang dibuat secara khusus diserahkan sepenuhnya kepada PIHAK KEDUA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. PIHAK PERTAMA berhak mencantumkan hasil karya website ini ke dalam portofolio bisnis AtasiLabs kecuali ada perjanjian tertulis lain dari PIHAK KEDUA.</Typography>
          </Box>
        </Box>

        {/* PASAL 8 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 8: KERAHASIAAN INFORMASI
          </Typography>
          <Typography variant="body2" sx={{ pl: 1, lineHeight: 1.5 }}>
            PARA PIHAK sepakat untuk menjaga kerahasiaan seluruh data, informasi bisnis, dokumen teknis dan kredensial akses yang diperoleh selama proses kerjasama ini serta tidak menyebarluaskannya kepada pihak ketiga tanpa persetujuan tertulis dari pihak pemilik informasi.
          </Typography>
        </Box>

        {/* PASAL 9 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 9: JANGKA WAKTU DAN PEMBATALAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Memorandum of Understanding (MoU) ini berlaku sejak ditandatangani hingga seluruh pengerjaan dan kewajiban selesai oleh PARA PIHAK.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Apabila terjadi pembatalan sepihak oleh PIHAK KEDUA tanpa adanya kelalaian dari PIHAK PERTAMA, maka uang muka (DP) yang telah dibayarkan tidak dapat dikembalikan.</Typography>
          </Box>
        </Box>

        {/* PASAL 10 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 10: FORCE MAJEURE
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Force Majeure adalah keadaan diluar kendali Para Pihak yang secara langsung menghambat pelaksanaan kewajiban, seperti bencana alam, perang, kerusuhan, gangguan infrastruktur dan kebijakan pemerintah yang mempunyai akibat langsung terhadap tertundanya penyelesaian pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Para Pihak akan melakukan musyawarah untuk menentukan penyesuaian jadwal, metode penyelesaian atau tindakan lain yang diperlukan.</Typography>
          </Box>
        </Box>

        {/* PASAL 11 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 11: PENYELESAIAN PERSELISIHAN
          </Typography>
          <Typography variant="body2" sx={{ pl: 1, lineHeight: 1.5 }}>
            Apabila terjadi perselisihan dikemudian hari yang timbul akibat pelaksanaan MoU ini, PARA PIHAK sepakat untuk menyelesaikannya secara musyawarah untuk mufakat. Apabila musyawarah tidak mencapai kesepakatan, maka akan diselesaikan melalui jalur hukum yang berlaku.
          </Typography>
        </Box>

        {/* PASAL 12 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 12: PENUTUP
          </Typography>
          <Typography variant="body2" sx={{ pl: 1, lineHeight: 1.5 }}>
            Demikian Memorandum of Understanding (MoU) ini dibuat dalam bentuk dokumen elektronik yang memiliki kekuatan hukum sesuai ketentuan yang berlaku untuk digunakan sebagaimana mestinya.
          </Typography>
        </Box>

        {/* Signature Footer matching Formal Indonesian Official Document Standards */}
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
    const party1Name = spk.party1Signature?.auditTrail?.signedBy || spk.atasilabsPic || 'Cecep Fahmidin';
    const party1Role = spk.party1Signature?.auditTrail?.signerRole || getDynamicSignerRole(party1Name, spk.atasilabsRole || 'CTO / IT Lead Atasilabs');
    const party2Name = spk.party2Signature?.auditTrail?.signedBy || spk.freelancerName || 'Freelancer Partner';
    const party2Role = spk.party2Signature?.auditTrail?.signerRole || getDynamicSignerRole(party2Name, `Mitra Developer (NIK: ${spk.freelancerNik || '-'})`);

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
        }}
      >
        {/* Header Kop PDF SPK */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 1, borderBottom: '2px solid #000' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo.svg" alt="Atasilabs Logo" sx={{ height: 36, width: 'auto' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                atasilabs
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block' }}>
                Standard Operating Procedure (SOP) Internal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
              SURAT PERINTAH KERJA (SPK)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block', mt: 0.3 }}>
              No. SPK: {spk.spkNumber || '....../SPK-ATL/....../20...'}
            </Typography>
          </Box>
        </Box>

        {/* Pembukaan SPK */}
        <Typography variant="body2" sx={{ color: '#334155', mb: 2, lineHeight: 1.6 }}>
          Pada hari ini, Tanggal <strong>{spk.date}</strong>, telah dibuat Surat Perintah Kerja (SPK), diantara:
        </Typography>

        {/* Identitas Pihak 1 & Pihak 2 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 1.5, height: '100%', bgcolor: '#f8fafc', borderColor: '#cbd5e1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.8, textTransform: 'uppercase' }}>
                PIHAK PERTAMA (Atasilabs)
              </Typography>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.3, px: 0.8, fontSize: '0.8rem', border: 'none' } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ fontWeight: 700, width: '38%' }}>Nama Perusahaan</TableCell><TableCell>: ATASILABS</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Penanggung Jawab</TableCell><TableCell>: {party1Name}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Jabatan</TableCell><TableCell>: {party1Role}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Alamat</TableCell><TableCell>: {spk.atasilabsAddress || 'Jl. Cinangsi, RT 003 RW 001, Subang'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>No. WhatsApp</TableCell><TableCell>: {spk.atasilabsWhatsapp || '0812-3456-7890'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Email Perusahaan</TableCell><TableCell>: {spk.atasilabsEmail || 'atasilabs@gmail.com'}</TableCell></TableRow>
                </TableBody>
              </Table>
              <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 1, color: '#475569' }}>
                Dalam hal ini bertindak atas nama Atasilabs, selanjutnya disebut <strong>PIHAK PERTAMA</strong>.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 1.5, height: '100%', bgcolor: '#f8fafc', borderColor: '#cbd5e1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.8, textTransform: 'uppercase' }}>
                PIHAK KEDUA (Freelancer)
              </Typography>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.3, px: 0.8, fontSize: '0.8rem', border: 'none' } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ fontWeight: 700, width: '38%' }}>Nama Freelancer</TableCell><TableCell>: {party2Name}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>NIK</TableCell><TableCell>: {spk.freelancerNik || '-'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Alamat</TableCell><TableCell>: {spk.freelancerAddress || '-'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>No. WhatsApp</TableCell><TableCell>: {spk.freelancerWhatsapp || '-'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Email</TableCell><TableCell>: {spk.freelancerEmail || '-'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Status / Peran</TableCell><TableCell>: {spk.freelancerStatus || 'Freelancer Partner'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 700 }}>Bank / No Rek</TableCell><TableCell>: {spk.freelancerBankInfo || '-'}</TableCell></TableRow>
                </TableBody>
              </Table>
              <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 1, color: '#475569' }}>
                Dalam hal ini sebagai Freelancer, selanjutnya disebut <strong>PIHAK KEDUA</strong>.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
          PIHAK PERTAMA dan PIHAK KEDUA secara bersama sama disebut <strong>“Para Pihak”</strong>. Para Pihak sepakat untuk mengadakan Surat Perintah Kerja (SPK) yang terdiri dari 14 (empat belas) Pasal, sebagai berikut:
        </Typography>

        {/* PASAL 1 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 1: DASAR DAN MAKSUD PERINTAH KERJA
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK PERTAMA merupakan pihak yang menerima pesanan pembuatan website dari klien.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. PIHAK PERTAMA memberikan perintah kerja kepada PIHAK KEDUA untuk melaksanakan pekerjaan pembuatan dan/atau pengembangan website sesuai dengan spesifikasi, ketentuan dan target serta hanya berlaku untuk satu proyek pembuatan website.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. PIHAK KEDUA menyatakan bersedia menerima dan melaksanakan pekerjaan secara professional, tepat waktu dan bertanggung jawab.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Surat Perintah Kerja ini merupakan dokumen perintah kerja antara PIHAK PERTAMA dan PIHAK KEDUA, dan bukan merupakan perjanjian langsung antara PIHAK KEDUA dengan klien PIHAK PERTAMA.</Typography>
          </Box>
        </Box>

        {/* PASAL 2 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 2: RUANG LINGKUP PEKERJAAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Mempelajari brief dan spesifikasi website.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Membuat dan/atau mengembangkan website sesuai dengan petunjuk teknis dalam Requirement Specification Document (RSD).</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Mengimplementasikan halaman, fitur dan teknologi yang disepakati.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Melakukan pengujian, perbaikan bug dan deployment apabila termasuk pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Menyerahkan source code, file dan akses sesuai ketentuan dalam Surat Perintah Kerja.</Typography>
          </Box>
        </Box>

        {/* PASAL 3 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 3: JANGKA WAKTU PELAKSANAAN PEKERJAAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK KEDUA wajib menyelesaikan pekerjaan pada Tanggal <strong>{spk.deadlineDate || '-'}</strong> sesuai jadwal yang disepakati.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. PIHAK KEDUA wajib memberikan laporan progres pekerjaan secara berkala melalui grup resmi Atasilabs.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Keterlambatan akibat keterlambatan materi, akses, keputusan klien atau perubahan scope dapat menjadi dasar penyesuaian waktu penyelesaian.</Typography>
          </Box>
        </Box>

        {/* PASAL 4 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 4: NILAI PEKERJAAN DAN PEMBAYARAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 1 }}>
              1. Total nilai pekerjaan sebesar <strong>Rp {spk.totalNominal?.toLocaleString('id-ID') || 0} ({spk.totalNominalTerbilang || '-'})</strong>.
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
              2. Pembayaran dilakukan dengan ketentuan:
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, maxWidth: 600 }}>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.4, px: 1.5, fontSize: '0.8rem', border: '1px solid #cbd5e1' } }}>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Tahap</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: '20%' }}>Persentase</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: '35%' }}>Nominal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>SPK ditandatangani</TableCell>
                    <TableCell>{spk.dpPercent || 40}%</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rp {spk.dpNominal?.toLocaleString('id-ID') || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pelunasan setelah pekerjaan selesai dan diterima Atasilabs</TableCell>
                    <TableCell>{spk.finalPercent || 60}%</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rp {spk.finalNominal?.toLocaleString('id-ID') || 0}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>100%</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>Rp {spk.totalNominal?.toLocaleString('id-ID') || 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Pelunasan kepada PIHAK KEDUA dilakukan setelah pekerjaan sesuai dengan spesifikasi dan hasil pekerjaan diserahkan kepada PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. PIHAK PERTAMA berhak menunda pembayaran atas bagian pekerjaan yang belum memenuhi ketentuan dalam Surat Perintah Kerja ini.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Pekerjaan tambahan dibayar berdasarkan persetujuan tertulis.</Typography>
          </Box>
        </Box>

        {/* PASAL 5 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 5: KEWAJIBAN PIHAK PERTAMA
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Memberikan brief, spesifikasi dan informasi yang diperlukan untuk pelaksanaan pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Menyediakan grup komunikasi resmi untuk koordinasi teknis pelaksanaan pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Melakukan pemeriksaan terhadap hasil pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Membayar nilai pekerjaan sesuai dengan kesepakatan setelah kewajiban PIHAK KEDUA terpenuhi.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Memberitahukan perubahan kebutuhan klien yang berpengaruh terhadap ruang lingkup pekerjaan.</Typography>
          </Box>
        </Box>

        {/* PASAL 6 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 6: KEWAJIBAN PIHAK KEDUA
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Melaksanakan pekerjaan secara professional, teliti dan bertanggung jawab.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Mengikuti brief, spesifikasi dan instruksi kerja yang diberikan PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Memberitahukan kendala teknis maupun nonteknis yang berpotensi menghambat pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Memberikan laporan perkembangan pekerjaan secara berkala.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Tidak mengalihkan pekerjaan kepada freelancer atau pihak ketiga lain tanpa persetujuan PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>6. Menjaga kerahasiaan dan keamanan seluruh akun, akses, source code, data dan informasi proyek.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>7. Melakukan perbaikan bug yang menjadi tanggung jawabnya selama masa garansi.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>8. Menyerahkan hasil pekerjaan sesuai dengan ketentuan dalam Surat Perintah Kerja.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>9. Mengembalikan dan/atau menghapus data dan akses proyek setelah pekerjaan berakhir sesuai instruksi PIHAK PERTAMA.</Typography>
          </Box>
        </Box>

        {/* PASAL 7 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 7: HAK KEKAYAAN INTELEKTUAL DAN SOURCE CODE
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Seluruh hasil pekerjaan yang dibuat secara khusus untuk proyek ini dan telah dibayar lunas oleh PIHAK PERTAMA menjadi hak PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Hasil pekerjaan sebagaimana yang dimaksud pada ayat (1), meliputi: a. File desain, b. Source code, c. Struktur database, d. Dokumentasi, e. Konfigurasi, f. File pendukung, dan g. Hasil pekerjaan lain yang secara khusus dibuat untuk proyek.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. PIHAK KEDUA dilarang menjual kembali, mendistribusikan, memberikan dan/atau menggunakan ulang hasil pekerjaan untuk pihak lain tanpa persetujuan PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. PIHAK KEDUA menjamin bahwa hasil pekerjaan yang dibuat tidak secara sengaja melanggar Hak Kekayaan Intelektual pihak lain.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Apabila terdapat tuntutan pihak ketiga akibat pelanggaran yang disebabkan oleh tindakan atau kelalaian PIHAK KEDUA, PIHAK KEDUA wajib bertanggung jawab sesuai dengan ketentuan hukum yang berlaku.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>6. PIHAK KEDUA dilarang menahan, menghapus, menyembunyikan dan/atau mengunci akses source code maupun hasil pekerjaan yang telah menjadi hak PIHAK PERTAMA secara tidak sah.</Typography>
          </Box>
        </Box>

        {/* PASAL 8 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 8: KOMUNIKASI DAN HUBUNGAN DENGAN KLIEN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK KEDUA diperbolehkan berkomunikasi langsung dengan klien untuk keperluan teknis proyek sepanjang dilakukan melalui grup resmi atau media yang disetujui oleh PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. PIHAK KEDUA wajib menjaga sikap profesional, sopan dan tidak memberikan pernyataan yang dapat merugikan reputasi Atasilabs.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. PIHAK KEDUA wajib memberikan respon terhadap setiap pertanyaan, permintaan informasi atau kendala dari klien yang berkaitan dengan aspek teknis proyek paling lambat 60 (enam puluh) menit sejak pesan diterima dalam jam kerja yang disepakati oleh PARA PIHAK.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Setiap perubahan scope, fitur, biaya atau jadwal yang berasal dari klien wajib dikonfirmasi kepada PIHAK PERTAMA sebelum dilaksanakan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. PIHAK KEDUA dilarang membahas harga, menerima pembayaran atau membuat kesepakatan komersial langsung dengan klien tanpa persetujuan PIHAK PERTAMA.</Typography>
          </Box>
        </Box>

        {/* PASAL 9 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 9: PROSEDUR REVISI DAN PERUBAHAN PEKERJAAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK PERTAMA berhak meminta revisi atas hasil pekerjaan yang tidak sesuai dengan brief, desain atau spesifikasi yang telah disepakati.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Revisi yang masih termasuk ruang lingkup pekerjaan wajib dilakukan tanpa biaya tambahan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Batas revisi desain atau tampilan yang termasuk dalam pekerjaan maksimal sebanyak 3 (tiga) kali putaran revisi.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Revisi akibat kesalahan atau ketidaksesuaian hasil pekerjaan PIHAK KEDUA tidak dihitung sebagai kuota revisi.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Perubahan permintaan klien yang menambah atau mengubah ruang lingkup dapat dikenakan biaya tambahan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>6. Setiap pekerjaan tambahan wajib disetujui secara tertulis, mengenai: a. Deskripsi pekerjaan, b. Biaya tambahan, c. Perubahan waktu pengerjaan, dan d. Ketentuan pembayaran.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>7. Persetujuan melalui email dan/atau WhatsApp dapat dianggap sebagai persetujuan tertulis sepanjang dapat dibuktikan dan memuat kesepakatan yang jelas.</Typography>
          </Box>
        </Box>

        {/* PASAL 10 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 10: PENGUJIAN, SERAH TERIMA DAN MASA GARANSI
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. PIHAK KEDUA wajib menyerahkan website/produk digital untuk dilakukan pemeriksaan oleh PIHAK PERTAMA.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Apabila ditemukan bug atau ketidaksesuaian yang menjadi tanggung jawab PIHAK KEDUA, PIHAK KEDUA wajib melakukan perbaikan maksimal 7 (tujuh) hari kerja sejak pemberitahuan diterima.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Serah terima pekerjaan dilakukan setelah: a. Fitur sesuai spesifikasi, b. Bug yang menjadi tanggung jawab PIHAK KEDUA yang telah diperbaiki, c. Menyerahkan file, source code dan akses yang menjadi bagian dari pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. Garansi tidak mencakup: a. Perubahan fitur atau desain baru, b. Kerusakan akibat perubahan kode oleh pihak lain, c. Gangguan hosting, domain, server atau layanan pihak ketiga diluar kendali PIHAK KEDUA, d. Pekerjaan tambahan setelah masa garansi dapat dikenakan biaya sesuai kesepakatan.</Typography>
          </Box>
        </Box>

        {/* PASAL 11 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 11: SANKSI DAN WANPRESTASI
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Wanprestasi meliputi keterlambatan tanpa alasan, tidak menyelesaikan pekerjaan, tidak memperbaiki bug, pengalihan pekerjaan tanpa izin atau tindakan lain yang melanggar Surat Perintah Kerja.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. PIHAK PERTAMA dapat memberikan teguran tertulis dan kesempatan perbaikan selama 3 (tiga) hari kerja.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>3. Denda keterlambatan ditetapkan sebesar {spk.penaltyPerDayPercent || 0.5}% dari nilai pekerjaan per hari, maksimal {spk.maxPenaltyPercent || 10}% dari nilai pekerjaan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>4. PIHAK PERTAMA dapat memotong pembayaran yang belum dibayarkan untuk denda keterlambatan.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>5. Denda tidak dapat dikenakan apabila keterlambatan disebabkan PIHAK PERTAMA, klien, perubahan scope atau force majeure.</Typography>
          </Box>
        </Box>

        {/* PASAL 12 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 12: PENYELESAIAN PERSELISIHAN
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Setiap perselisihan akan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Apabila dalam waktu 30 (tiga puluh) hari kalender sejak dimulainya musyawarah tidak tercapai penyelesaian, Para Pihak sepakat untuk menyelesaikan perselisihan melalui jalur hukum sesuai ketentuan peraturan perundang – undangan yang berlaku.</Typography>
          </Box>
        </Box>

        {/* PASAL 13 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 13: FORCE MAJEURE
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>1. Force majeure adalah keadaan di luar kendali Para Pihak yang secara langsung menghambat pelaksanaan kewajiban, seperti bencana alam, perang, kerusuhan, gangguan infrastruktur besar atau peristiwa lain.</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>2. Para Pihak akan melakukan musyawarah untuk menentukan penyesuaian jadwal, metode penyelesaian atau tindakan lain yang diperlukan.</Typography>
          </Box>
        </Box>

        {/* PASAL 14 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            PASAL 14: PENUTUP
          </Typography>
          <Typography variant="body2" sx={{ pl: 1, lineHeight: 1.5 }}>
            Demikian Surat Perintah Kerja ini dibuat, Para Pihak telah membaca, memahami dan menyetujui seluruh ketentuan dalam Surat Perintah Kerja ini dan mulai berlaku sejak ditandatangani Para Pihak.
          </Typography>
        </Box>

        {/* Signature Footer matching Formal Indonesian Official Document Standards */}
        <DocumentSignatureFooter
          locationCity="Subang"
          dateStr={spk.date}
          party1Title="Pihak Pertama"
          party1Sub="ATASILABS"
          party1Name={party1Name}
          party1Role={party1Role}
          party1Sig={spk.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="Pihak Kedua"
          party2Sub="Freelancer Partner"
          party2Name={party2Name}
          party2Role={party2Role}
          party2Sig={spk.party2Signature}
          onSignParty2Cb={onSignParty2}
        />
      </Paper>
    );
  }

  // Render BAST (Berita Acara Serah Terima)
  if (type === 'BAST') {
    const bast = data as BASTData;
    const { dayName, dayNum, monthName, yearNum, formattedDate } = parseIndonesianDateParts(bast.date);
    const party1Name = bast.party1Signature?.auditTrail?.signedBy || bast.atasilabsPic || 'Cecep Fahmidin';
    const party1Role = bast.party1Signature?.auditTrail?.signerRole || getDynamicSignerRole(party1Name, bast.atasilabsRole || 'CEO / IT Lead Atasilabs');
    const party2Name = bast.party2Signature?.auditTrail?.signedBy || bast.clientPic || 'PIC Klien';
    const party2Role = bast.party2Signature?.auditTrail?.signerRole || getDynamicSignerRole(party2Name, bast.clientRole || 'Direktur / Klien');
    const warrantyWords = numberToWordsIDR(bast.warrantyDays || 30).replace(/ Rupiah$/i, '');

    return (
      <Paper
        elevation={0}
        className="printable-document"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
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
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Cetak / Simpan PDF (A4)
          </Button>
        </Box>

        {/* Title & Number */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, textDecoration: 'underline', color: '#000', mb: 0.2 }}>
            BERITA ACARA SERAH TERIMA (BAST)
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            KERJASAMA PEMBUATAN WEBSITE DAN PENGEMBANGAN DIGITAL
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
            Nomor: {bast.bastNumber || '....../BAST/ATL/....../202...'}
          </Typography>
        </Box>

        {/* Pembukaan */}
        <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1.5 }}>
          Pada hari ini, <strong>{dayName}</strong>, Tanggal <strong>{dayNum}</strong>, Bulan <strong>{monthName}</strong> Tahun <strong>{yearNum}</strong> ({formattedDate}) telah dilaksanakan serah terima pembuatan website/produk digital, diantara:
        </Typography>

        <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 2, '& li': { mb: 1, fontSize: '0.875rem', lineHeight: 1.5 } }}>
          <li>
            <strong>ATASILABS</strong>, sebuah entitas penyedia layanan pengembangan teknologi dan produk digital, berkedudukan di {bast.atasilabsAddress || 'Jl. Cinangsi, RT 003 RW 001, Subang - Jawa Barat'}, dalam hal ini diwakili oleh <strong>{party1Name}</strong> selaku <strong>{party1Role}</strong> yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>
          </li>
          <li>
            <strong>{bast.clientCompany || 'Nama Perusahaan Klien'}</strong>, berkedudukan di {bast.clientAddress || 'Subang, Jawa Barat'}, dalam hal ini diwakili oleh <strong>{party2Name}</strong> selaku <strong>{party2Role}</strong>, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>
          </li>
        </Box>

        <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 2 }}>
          Para Pihak sepakat dan menyatakan ketentuan Berita Acara Serah Terima, sebagai berikut:
        </Typography>

        {/* Section 1 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            1. Penyelesaian Pekerjaan
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              PIHAK PERTAMA telah menyelesaikan 100% pekerjaan pembuatan website/produk digital sesuai dengan spesifikasi teknis dan kesepakatan awal. PIHAK KEDUA telah melakukan pengujian (<em>testing</em>) dan menerima hasil pekerjaan dalam kondisi baik dan berfungsi sebagaimana mestinya.
            </Typography>
          </Box>
        </Box>

        {/* Section 2 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            2. Penyerahan Akses dan Hak Milik Aset
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 1 }}>
              PIHAK PERTAMA menyerahkan seluruh hak akses operasional kepada PIHAK KEDUA, mencakup:
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, maxWidth: 650 }}>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1.5, fontSize: '0.85rem', border: '1px solid #000' } }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '28%', bgcolor: '#f8fafc' }}>URL Utama</TableCell>
                    <TableCell sx={{ width: '2%', fontWeight: 700, textAlign: 'center' }}>:</TableCell>
                    <TableCell sx={{ color: '#1d4ed8', fontWeight: 600 }}>{bast.mainUrl || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Akses Source Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>:</TableCell>
                    <TableCell>{bast.sourceCodeAccess || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>Akses Panel Admin</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>:</TableCell>
                    <TableCell>{bast.adminPanelAccess || '-'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Section 3 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', mb: 0.5 }}>
            3. Masa garansi & Ketentuan Pemeliharaan
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, '& li': { mb: 0.8, fontSize: '0.875rem', lineHeight: 1.5 } }}>
            <li>
              PIHAK PERTAMA memberikan masa garansi selama <strong>{bast.warrantyDays || 30} ({warrantyWords})</strong> hari kalender sejak Berita Acara Serah terima (BAST) ditandatangani
            </li>
            <li>
              Garansi Mencakup perbaikan kesalahan teknis (<em>bug, error</em> atau sistem tidak berjalan sesuai spesifikasi awal)
            </li>
            <li>
              Permintaan garansi disampaikan melalui kanal komunikasi resmi yang disepakati. PIHAK PERTAMA akan menindaklanjuti laporan paling lambat 1x24 jam setelah laporan diterima dengan waktu penyelesaian menyesuaikan tingkat permasalahan
            </li>
            <li>
              Garansi tidak berlaku untuk penambahan fitur baru diluar ruang lingkup (<em>scope</em>) awal atau kerusakan akibat kelalaian/intervensi pihak ketiga (seperti kebocoran kredensial, serangan siber atau modifikasi mandiri pada kode program)
            </li>
          </Box>
        </Box>

        {/* Penutup */}
        <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 3 }}>
          Demikian Berita Acara Serah Terima (BAST) ini dibuat dalam bentuk dokumen elektronik yang memiliki kekuatan hukum sesuai ketentuan yang berlaku untuk digunakan sebagaimana mestinya.
        </Typography>

        {/* Signature Footer */}
        <DocumentSignatureFooter
          locationCity={bast.locationCity || 'Subang'}
          dateStr={bast.date}
          party1Title="Pihak Pertama"
          party1Sub="ATASILABS"
          party1Name={party1Name}
          party1Role={party1Role}
          party1Sig={bast.party1Signature}
          onSignParty1Cb={onSignParty1}
          party2Title="Pihak Kedua"
          party2Sub={bast.clientCompany || 'Nama Perusahaan Klien'}
          party2Name={party2Name}
          party2Role={party2Role}
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
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiTypography-colorTextSecondary': { color: '#475569 !important' },
          '& .MuiTableCell-root': { color: '#0f172a' },
        }}
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
