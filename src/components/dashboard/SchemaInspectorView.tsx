'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  Stack,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PRISMA_SCHEMA_CODE } from '../../data/initialData';
import { useApp } from '../../context/AppContext';

export const SchemaInspectorView: React.FC = () => {
  const theme = useTheme();
  const { leads, portfolios, projects, showNotification } = useApp();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(PRISMA_SCHEMA_CODE);
    setCopied(true);
    showNotification('Skema Prisma berhasil disalin ke clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const rlsPolicies = [
    {
      table: 'Lead',
      policy: 'Anon Insert Only (Public)',
      command: 'INSERT',
      definition: 'Allows public visitors to submit inquiries from landing page without reading others data.',
      status: 'ACTIVE',
    },
    {
      table: 'Lead',
      policy: 'Admin Full Access (Authenticated)',
      command: 'ALL (SELECT, UPDATE, DELETE)',
      definition: 'auth.jwt() ->> "role" = "ADMIN" (Restricted to logged in developer dashboard).',
      status: 'ACTIVE',
    },
    {
      table: 'Portfolio',
      policy: 'Public Read Access (All)',
      command: 'SELECT',
      definition: 'Allows all visitors to view published portfolio cards on the landing page.',
      status: 'ACTIVE',
    },
    {
      table: 'Portfolio',
      policy: 'Admin Write Access (Authenticated)',
      command: 'INSERT, UPDATE, DELETE',
      definition: 'auth.uid() IS NOT NULL AND role = "ADMIN"',
      status: 'ACTIVE',
    },
    {
      table: 'ClientProject',
      policy: 'Strict Admin Access',
      command: 'ALL',
      definition: 'Restricted exclusively to developer panel session.',
      status: 'ACTIVE',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Skema Database Prisma & Supabase Security
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspeksi arsitektur database relasional PostgreSQL, definisi model Prisma ORM, dan kebijakan Row Level Security (RLS).
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={handleCopySchema}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {copied ? 'Tersalin!' : 'Salin schema.prisma'}
        </Button>
      </Box>

      {/* Overview Metric Badges */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Model Terdaftar', val: '4 Model (User, Portfolio, Lead, Project)' },
          { label: 'Record Portofolio', val: `${portfolios.length} Baris Data` },
          { label: 'Record Leads', val: `${leads.length} Kontak Masuk` },
          { label: 'Database Provider', val: 'Supabase PostgreSQL' },
        ].map((item, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                {item.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {item.val}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Switcher */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{
            px: 2,
            pt: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' },
          }}
        >
          <Tab icon={<CodeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="File schema.prisma" />
          <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Kebijakan RLS Supabase" />
          <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Data JSON Snapshot" />
        </Tabs>

        {/* Tab 0: Prisma Schema Code */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                prisma/schema.prisma
              </Typography>
              <Chip label="Prisma Client 5.x Ready" size="small" color="primary" variant="outlined" />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                backgroundColor: theme.palette.mode === 'dark' ? '#070a12' : '#0f172a',
                color: '#e2e8f0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <pre style={{ margin: 0 }}>{PRISMA_SCHEMA_CODE}</pre>
            </Paper>
          </Box>
        )}

        {/* Tab 1: Supabase RLS Policies */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Row Level Security (RLS)</strong> diaktifkan di Supabase untuk memastikan tabel <code>Lead</code> hanya dapat dimodifikasi oleh pengunjung melalui formulir (Insert), sedangkan hak akses penuh (Select/Update/Delete) hanya dimiliki oleh sesi admin terotentikasi.
            </Alert>

            <Stack spacing={2}>
              {rlsPolicies.map((pol, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Tabel: ${pol.table}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                      <Chip label={pol.command} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Box>
                    <Chip
                      label={pol.status}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {pol.policy}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pol.definition}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Tab 2: Live Data JSON */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Snapshot Data Terkini (State Client / LocalStorage)
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                backgroundColor: theme.palette.mode === 'dark' ? '#070a12' : '#0f172a',
                color: '#38bdf8',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
                maxHeight: 480,
                overflowY: 'auto',
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify({ totalLeads: leads.length, leads, totalPortfolios: portfolios.length, portfolios, totalProjects: projects.length, projects }, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
