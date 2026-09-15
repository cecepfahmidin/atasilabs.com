'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  OpenInNew as OpenInNewIcon,
  GitHub as GitHubIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  FilterList as FilterListIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Portfolio } from '../../types';
import { useApp } from '../../context/AppContext';

export const PortfolioSection: React.FC = () => {
  const theme = useTheme();
  const { portfolios } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeCaseStudy, setActiveCaseStudy] = useState<Portfolio | null>(null);

  const categories = ['Semua', 'Full-Stack', 'Dashboard SaaS', 'E-Commerce', 'Mobile-Web'];

  const filteredPortfolios = portfolios.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    return item.category === selectedCategory;
  });

  return (
    <Box
      id="portfolio"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 740, mx: 'auto' }}>
          <Chip
            label="PORTFOLIO & CASE STUDIES"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.75rem', letterSpacing: '0.05em' }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Koleksi Portofolio & Solusi Rekayasa Sistem
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            Studi kasus nyata implementasi arsitektur Next.js, Material UI, Prisma ORM, dan Supabase untuk klien bisnis dan startup.
          </Typography>
        </Box>

        {/* Category Filter Chips */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 5 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => setSelectedCategory(cat)}
              color={selectedCategory === cat ? 'primary' : 'default'}
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              sx={{
                px: 1,
                py: 2.2,
                borderRadius: 2.5,
                fontWeight: 600,
                fontSize: '0.88rem',
                borderColor: selectedCategory === cat ? 'primary.main' : theme.palette.divider,
                backgroundColor:
                  selectedCategory === cat
                    ? undefined
                    : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.03)'
                    : '#fff',
              }}
            />
          ))}
        </Box>

        {/* Portfolio Cards Grid */}
        <Grid container spacing={3.5}>
          {filteredPortfolios.map((item) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 18px 36px rgba(0,0,0,0.5)'
                        : '0 18px 36px rgba(217, 119, 6, 0.1)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {/* Image Media with Badges */}
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="210"
                    image={item.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    sx={{
                      transition: 'transform 0.4s ease',
                      '&:hover': { transform: 'scale(1.04)' },
                      backgroundColor: '#18181b',
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                    {item.featured && (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: '13px !important', color: '#fbbf24 !important' }} />}
                        label="Featured"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(245, 158, 11, 0.9)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1, fontSize: '1.1rem' }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, minHeight: 44 }}>
                    {item.description}
                  </Typography>

                  {/* Tech Stack Chips (as requested in RSD) */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mb: 1 }}>
                    {item.techStack.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          height: 24,
                          fontWeight: 500,
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'rgba(217, 119, 6, 0.08)',
                          color: theme.palette.primary.main,
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.2)'}`,
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    size="small"
                    startIcon={<InfoIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setActiveCaseStudy(item)}
                    sx={{ fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    Studi Kasus
                  </Button>

                  <Box sx={{ display: 'flex', gap: 0.8 }}>
                    {item.repoUrl && (
                      <IconButton
                        size="small"
                        component="a"
                        href={item.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Lihat GitHub Repository"
                        sx={{ border: `1px solid ${theme.palette.divider}` }}
                      >
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    )}
                    {item.liveUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        component="a"
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '0.8rem', py: 0.6, px: 1.5 }}
                      >
                        Demo
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Case Study Detail Modal (Dialog) */}
      <Dialog
        open={Boolean(activeCaseStudy)}
        onClose={() => setActiveCaseStudy(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              backgroundColor: theme.palette.background.paper,
              p: 1,
            },
          },
        }}
      >
        {activeCaseStudy && (
          <>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Chip
                  label={activeCaseStudy.category}
                  size="small"
                  color="primary"
                  sx={{ mb: 0.8, fontWeight: 600, fontSize: '0.72rem' }}
                />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                  {activeCaseStudy.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveCaseStudy(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Box
                component="img"
                src={activeCaseStudy.imageUrl}
                alt={activeCaseStudy.title}
                sx={{
                  width: '100%',
                  maxHeight: 340,
                  objectFit: 'cover',
                  borderRadius: 2.5,
                  mb: 3,
                }}
              />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Ringkasan Arsitektur & Latar Belakang
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                {activeCaseStudy.fullDescription || activeCaseStudy.description}
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }}>
                Tumpukan Teknologi (Tech Stack)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {activeCaseStudy.techStack.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Integrasi Database & Serverless
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Data disinkronkan melalui <strong>Prisma ORM</strong> untuk validasi type-safety query, diproteksi dengan <strong>Supabase Row Level Security (RLS)</strong>, dan aset media tersimpan aman di <strong>Supabase Storage</strong>.
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveCaseStudy(null)} color="inherit">
                Tutup
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeCaseStudy.repoUrl && (
                  <Button
                    variant="outlined"
                    component="a"
                    href={activeCaseStudy.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    startIcon={<GitHubIcon />}
                  >
                    GitHub Code
                  </Button>
                )}
                {activeCaseStudy.liveUrl && (
                  <Button
                    variant="contained"
                    component="a"
                    href={activeCaseStudy.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<OpenInNewIcon />}
                  >
                    Kunjungi Live Demo
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
