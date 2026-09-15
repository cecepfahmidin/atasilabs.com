'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Storage as StorageIcon,
  Bolt as BoltIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ExitToApp as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RestartAlt as ResetIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';
import { ROLE_CONFIGS, hasPermission } from '../../lib/rbac';
import { UserRole } from '../../types';

const DRAWER_WIDTH = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    themeMode,
    toggleTheme,
    dashboardTab,
    setDashboardTab,
    setActiveView,
    currentUser,
    logout,
    unreadLeadsCount,
    resetAllDataToDefaults,
    users,
    switchUserRole,
    hasRolePermission,
  } = useApp();

  const userRole = currentUser?.role || 'ADMIN';
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.ADMIN;

  const rawMenuItems = [
    {
      id: 'overview',
      label: 'Halaman Ringkasan',
      href: '/dashboard',
      icon: <DashboardIcon />,
      badge: 0,
    },
    {
      id: 'projects',
      label: 'Klien & Proyek Aktif',
      href: '/dashboard/projects',
      icon: <AssignmentIcon />,
      badge: 0,
    },
    {
      id: 'documents',
      label: 'Dokumen & Generator',
      href: '/dashboard/documents',
      icon: <DescriptionIcon />,
      badge: 0,
    },
    {
      id: 'hpp',
      label: 'Kalkulator HPP & Financial Matrix',
      href: '/dashboard/hpp',
      icon: <CalculateIcon />,
      badge: 0,
    },
    {
      id: 'leads',
      label: 'Pesan Masuk (Leads)',
      href: '/dashboard/leads',
      icon: <EmailIcon />,
      badge: unreadLeadsCount,
    },
    {
      id: 'users',
      label: 'Manajemen User & RBAC',
      href: '/dashboard/users',
      icon: <PeopleIcon />,
      badge: 0,
    },
    {
      id: 'portfolio',
      label: 'Manajemen Portofolio',
      href: '/dashboard/portfolio',
      icon: <CodeIcon />,
      badge: 0,
    },
    {
      id: 'pricing',
      label: 'Atur Pricelist & Spec',
      href: '/dashboard/pricing',
      icon: <BoltIcon />,
      badge: 0,
    },
    {
      id: 'schema',
      label: 'Skema Prisma & RLS',
      href: '/dashboard/schema',
      icon: <StorageIcon />,
      badge: 0,
    },
  ];

  const menuItems = rawMenuItems.filter((item) => hasRolePermission(userRole, item.id));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Brand Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1, py: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AtasiLabsLogo height={32} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            label="ADMIN CMS"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.12)',
              color: theme.palette.primary.main,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
            Next.js & Supabase
          </Typography>
        </Box>
      </Box>

      {/* Return to Landing Page Button */}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => setActiveView('landing')}
        sx={{
          mb: 2.5,
          borderRadius: 2,
          justifyContent: 'flex-start',
          color: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
          fontSize: '0.8rem',
          py: 0.8,
        }}
      >
        Kembali ke Laman Depan
      </Button>

      {/* Navigation List */}
      <List sx={{ px: 0, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isSelected =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ||
            dashboardTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  setDashboardTab(item.id as any);
                  router.push(item.href);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.8,
                  backgroundColor: isSelected
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.16)'
                      : 'rgba(217, 119, 6, 0.12)'
                    : 'transparent',
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.88rem',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
                {item.badge > 0 && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Database State Reset Helper */}
      <Box sx={{ px: 1, mb: 2 }}>
        <Button
          fullWidth
          size="small"
          startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
          onClick={resetAllDataToDefaults}
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
            justifyContent: 'flex-start',
            textTransform: 'none',
          }}
        >
          Reset Sampel Database
        </Button>
      </Box>

      {/* User Footer Profile Card */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2.5,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <Avatar
          src={currentUser?.avatarUrl}
          sx={{ width: 34, height: 34, bgcolor: roleConfig.hexColor }}
        >
          {currentUser?.name?.[0] || 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
              {currentUser?.name || 'Administrator'}
            </Typography>
          </Box>
          <Chip
            label={roleConfig.label}
            size="small"
            color={roleConfig.badgeColor as any}
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, mt: 0.2 }}
          />
        </Box>
        <IconButton size="small" onClick={logout} title="Logout">
          <LogoutIcon fontSize="small" sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(9, 9, 11, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              {menuItems.find((m) => m.id === dashboardTab)?.label || 'Dashboard'}
            </Typography>
          </Box>

          {/* Right Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
              label="Supabase Connected"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
              }}
            />

            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{ border: `1px solid ${theme.palette.divider}`, p: 0.8, borderRadius: 2 }}
            >
              {themeMode === 'dark' ? (
                <LightIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
              ) : (
                <DarkIcon sx={{ color: '#475569', fontSize: 18 }} />
              )}
            </IconButton>

            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('landing')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              Laman Depan
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer Component */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
