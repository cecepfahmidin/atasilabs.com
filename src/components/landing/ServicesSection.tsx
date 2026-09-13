'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Code as CodeIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { SERVICES_DATA } from '../../data/initialData';
import { useApp } from '../../context/AppContext';

export const ServicesSection: React.FC = () => {
  const theme = useTheme();
  const { setSelectedServiceForInquiry } = useApp();

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Code':
        return <CodeIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />;
      case 'LayoutDashboard':
        return <DashboardIcon fontSize="medium" sx={{ color: '#0ea5e9' }} />;
      case 'Database':
        return <StorageIcon fontSize="medium" sx={{ color: '#10b981' }} />;
      case 'CloudUpload':
        return <CloudUploadIcon fontSize="medium" sx={{ color: '#8b5cf6' }} />;
      case 'ShieldCheck':
        return <ShieldIcon fontSize="medium" sx={{ color: '#f59e0b' }} />;
      case 'Gauge':
      default:
        return <SpeedIcon fontSize="medium" sx={{ color: '#ec4899' }} />;
    }
  };

  const handleInquireService = (title: string) => {
    setSelectedServiceForInquiry(title);
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      id="services"
      sx={{
        py: { xs: 8, md: 12 },
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#f8fafc',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 }, maxWidth: 720, mx: 'auto' }}>
          <Chip
            label="SPESIFIKASI LAYANAN"
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
            Layanan Pengembangan Web & Arsitektur Sistem
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            Solusi komprehensif mulai dari desain UI/UX, logika Server Actions Next.js, pemodelan skema Prisma ORM, hingga deployment cloud dengan tingkat keandalan tinggi.
          </Typography>
        </Box>

        {/* Services Grid */}
        <Grid container spacing={3.5}>
          {SERVICES_DATA.map((service) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5,
                  borderRadius: 3.5,
                  transition: 'all 0.25s ease-in-out',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 16px 30px rgba(0,0,0,0.5)'
                        : '0 16px 30px rgba(217, 119, 6, 0.1)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  {/* Icon and Title */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        backgroundColor:
                          theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getServiceIcon(service.iconName)}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.4 }}>
                        {service.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ fontWeight: 600, letterSpacing: '0.01em', display: 'block' }}
                      >
                        {service.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5, lineHeight: 1.65, minHeight: 48 }}
                  >
                    {service.description}
                  </Typography>

                  {/* Feature Checklist */}
                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                    {service.features.map((feat, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {feat}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* Tech Tags */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {service.techTags.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          height: 22,
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.04)',
                          color: theme.palette.text.secondary,
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={() => handleInquireService(service.title)}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      py: 0.9,
                      textTransform: 'none',
                    }}
                  >
                    Konsultasi Layanan Ini
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
