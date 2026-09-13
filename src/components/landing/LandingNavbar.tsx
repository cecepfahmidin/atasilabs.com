'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  useTheme,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Send as SendIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  Layers as LayersIcon,
  Email as EmailIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

export const LandingNavbar: React.FC = () => {
  const theme = useTheme();
  const { themeMode, toggleTheme, setActiveView, unreadLeadsCount, currentUser, setIsLoginModalOpen } = useApp();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '#hero', icon: <TerminalIcon fontSize="small" /> },
    { label: 'Layanan', href: '#services', icon: <LayersIcon fontSize="small" /> },
    { label: 'Pricelist', href: '#pricing', icon: <BoltIcon fontSize="small" /> },
    { label: 'Portofolio', href: '#portfolio', icon: <CodeIcon fontSize="small" /> },
    { label: 'Arsitektur', href: '#architecture', icon: <TerminalIcon fontSize="small" /> },
    { label: 'Kontak', href: '#contact', icon: <EmailIcon fontSize="small" /> },
  ];

  const handleNavClick = (href: string) => {
    setMobileDrawerOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDashboard = () => {
    if (currentUser) {
      setActiveView('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          transition: 'all 0.2s ease',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72 }}>
            {/* Logo */}
            <Box
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <AtasiLabsLogo height={38} />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  display: { xs: 'none', lg: 'block' },
                  pl: 1,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                }}
              >
                Web Dev & Project Management
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {navLinks.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.92rem',
                    px: 1.8,
                    py: 0.8,
                    borderRadius: 2,
                    '&:hover': {
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Actions: Theme Toggle & Dashboard CTA */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {/* Theme Toggle Button */}
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                aria-label="Ganti mode terang/gelap"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  p: 0.9,
                  borderRadius: 2,
                }}
              >
                {themeMode === 'dark' ? (
                  <LightIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                ) : (
                  <DarkIcon sx={{ color: '#475569', fontSize: 20 }} />
                )}
              </IconButton>

              {/* Consultation / Contact Quick CTA (Desktop) */}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleNavClick('#contact')}
                startIcon={<SendIcon sx={{ fontSize: 16 }} />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  fontSize: '0.88rem',
                  py: 0.9,
                }}
              >
                Konsultasi
              </Button>

              {/* Dashboard Admin Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDashboard}
                startIcon={
                  <Badge
                    badgeContent={unreadLeadsCount}
                    color="error"
                    invisible={unreadLeadsCount === 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: 10,
                        height: 16,
                        minWidth: 16,
                        top: 2,
                        right: 2,
                      },
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 18 }} />
                  </Badge>
                }
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                  color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 0.9,
                  px: 2,
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                }}
              >
                Dashboard
              </Button>

              {/* Mobile Hamburger Menu */}
              <IconButton
                color="inherit"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' }, ml: 0.5 }}
                aria-label="Buka navigasi menu"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              p: 2.5,
              backgroundColor: theme.palette.background.paper,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AtasiLabsLogo height={32} />
          </Box>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ mb: 2 }}>
          {navLinks.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.href)}
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                <Box sx={{ mr: 1.5, color: theme.palette.primary.main, display: 'flex' }}>
                  {item.icon}
                </Box>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<DashboardIcon />}
            onClick={() => {
              setMobileDrawerOpen(false);
              handleOpenDashboard();
            }}
          >
            Buka Panel Dashboard {unreadLeadsCount > 0 ? `(${unreadLeadsCount} Baru)` : ''}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setMobileDrawerOpen(false);
              handleNavClick('#contact');
            }}
            startIcon={<SendIcon />}
          >
            Konsultasi Proyek
          </Button>
        </Box>
      </Drawer>
    </>
  );
};
