'use client';

import React, { useState, useEffect } from 'react';
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
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Bolt as BoltIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Calculate as CalculateIcon,
  Storage as MasterDataIcon,
  Phone as PhoneIcon,
  RateReview as RateReviewIcon,
  SupervisorAccount as CLevelIcon,
  ExpandLess,
  ExpandMore,
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
    users,
    switchUserRole,
    hasRolePermission,
  } = useApp();

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthChecking && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthChecking, router]);

  const activeUser = users.find(
    (u) =>
      u.id === currentUser?.id ||
      (u.email && currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (u.role === currentUser?.role && ['CEO', 'CTO', 'CMO'].includes(u.role))
  ) || currentUser;

  const userRole = activeUser?.role || currentUser?.role || 'CLIENT';
  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.CLIENT;

  // Route Protection for CLIENT role
  useEffect(() => {
    if (userRole === 'CLIENT') {
      const restrictedTabs = ['hpp', 'master-data', 'users', 'team', 'portfolio', 'pricing', 'contact', 'testimonials', 'leads'];
      const isRestrictedPath =
        pathname?.includes('/dashboard/hpp') ||
        pathname?.includes('/dashboard/master-data') ||
        pathname?.includes('/dashboard/users') ||
        pathname?.includes('/dashboard/team') ||
        pathname?.includes('/dashboard/portfolio') ||
        pathname?.includes('/dashboard/pricing') ||
        pathname?.includes('/dashboard/contact') ||
        pathname?.includes('/dashboard/testimonials') ||
        pathname?.includes('/dashboard/leads');

      if (restrictedTabs.includes(dashboardTab) || isRestrictedPath) {
        setDashboardTab('overview');
        router.push('/dashboard');
      }
    }
  }, [userRole, dashboardTab, pathname, router, setDashboardTab]);

  const [masterDataOpen, setMasterDataOpen] = useState(() => {
    return (
      pathname?.includes('/dashboard/portfolio') ||
      pathname?.includes('/dashboard/pricing') ||
      pathname?.includes('/dashboard/contact') ||
      pathname?.includes('/dashboard/testimonials') ||
      pathname?.includes('/dashboard/team') ||
      pathname?.includes('/dashboard/users') ||
      pathname?.includes('/dashboard/master-data') ||
      ['portfolio', 'pricing', 'contact', 'testimonials', 'team', 'users', 'master-data'].includes(dashboardTab)
    );
  });

  if (isAuthChecking || !currentUser) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          gap: 2,
        }}
      >
        <CircularProgress size={36} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Memverifikasi Akses Sesi Dashboard...
        </Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
      label: 'Dokumentasi',
      href: '/dashboard/documents',
      icon: <DescriptionIcon />,
      badge: 0,
    },
    {
      id: 'hpp',
      label: 'HPP Matriks',
      href: '/dashboard/hpp',
      icon: <CalculateIcon />,
      badge: 0,
    },
    {
      id: 'leads',
      label: 'Pesan Masuk',
      href: '/dashboard/leads',
      icon: <EmailIcon />,
      badge: unreadLeadsCount,
    },
    {
      id: 'master-data',
      label: 'Master Data',
      href: '/dashboard/master-data',
      icon: <MasterDataIcon />,
      badge: 0,
      children: [
        {
          id: 'users',
          label: 'Manajemen User',
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
          id: 'contact',
          label: 'Kontak Perusahaan',
          href: '/dashboard/contact',
          icon: <PhoneIcon />,
          badge: 0,
        },
        {
          id: 'team',
          label: 'Tim Manajemen',
          href: '/dashboard/team',
          icon: <CLevelIcon />,
          badge: 0,
        },
        {
          id: 'testimonials',
          label: 'Manajemen Testimoni',
          href: '/dashboard/testimonials',
          icon: <RateReviewIcon />,
          badge: 0,
        },
      ],
    },
  ];

  const menuItems = rawMenuItems
    .filter((item) => {
      if (userRole === 'CLIENT' && (item.id === 'hpp' || item.id === 'master-data' || item.id === 'leads')) {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const permittedChildren = item.children.filter((child) => hasRolePermission(userRole, child.id));
        if (permittedChildren.length === 0) return null;
        return { ...item, children: permittedChildren };
      }
      return hasRolePermission(userRole, item.id) ? item : null;
    })
    .filter(Boolean) as typeof rawMenuItems;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  let activeTitle = 'Dashboard';
  if (dashboardTab === 'portfolio') activeTitle = 'Master Data - Manajemen Portofolio';
  else if (dashboardTab === 'pricing') activeTitle = 'Master Data - Atur Pricelist & Spec';
  else if (dashboardTab === 'contact') activeTitle = 'Master Data - Kontak Perusahaan';
  else if (dashboardTab === 'testimonials') activeTitle = 'Master Data - Manajemen Testimoni Klien';
  else if (dashboardTab === 'team') activeTitle = 'Master Data - Tim Manajemen & Leadership';
  else if (dashboardTab === 'users') activeTitle = 'Master Data - Manajemen User & RBAC';
  else if (dashboardTab === 'master-data') activeTitle = 'Pusat Master Data';
  else {
    const flat = rawMenuItems.flatMap((m) => (m.children ? [m, ...m.children] : [m]));
    const found = flat.find((m) => m.id === dashboardTab);
    if (found) activeTitle = found.label;
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Brand Header */}
      <Box
        onClick={() => {
          setActiveView('landing');
          router.push('/');
        }}
        title="Kembali ke Halaman Depan"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          px: 1,
          py: 1.5,
          mb: 1.5,
          cursor: 'pointer',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            opacity: 0.85,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AtasiLabsLogo height={32} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.73rem', fontStyle: 'italic', letterSpacing: '0.02em', mt: 0.5, px: 0.5 }}>
          Build your digital future
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 0, flexGrow: 1 }}>
        {menuItems.map((item) => {
          if (item.children && item.children.length > 0) {
            const permittedChildren = item.children.filter((child) => hasRolePermission(userRole, child.id));
            if (permittedChildren.length === 0) return null;

            const isChildActive = permittedChildren.some(
              (child) => pathname === child.href || dashboardTab === child.id
            );
            const isParentActive = pathname === item.href || dashboardTab === 'master-data' || isChildActive;

            return (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isParentActive}
                    onClick={() => {
                      setMasterDataOpen((prev) => !prev);
                      setDashboardTab('master-data' as any);
                      router.push('/dashboard/master-data');
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 1.8,
                      backgroundColor: isParentActive
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(245, 158, 11, 0.16)'
                          : 'rgba(217, 119, 6, 0.12)'
                        : 'transparent',
                      color: isParentActive ? theme.palette.primary.main : theme.palette.text.secondary,
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
                        color: isParentActive ? theme.palette.primary.main : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: '0.88rem',
                            fontWeight: isParentActive ? 700 : 500,
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                    {masterDataOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={masterDataOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2.5 }}>
                    {permittedChildren.map((child) => {
                      const isChildSelected = pathname === child.href || dashboardTab === child.id;
                      return (
                        <ListItem key={child.id} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            selected={isChildSelected}
                            onClick={() => {
                              setDashboardTab(child.id as any);
                              router.push(child.href);
                              if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: 2,
                              py: 0.8,
                              px: 1.5,
                              backgroundColor: isChildSelected
                                ? theme.palette.mode === 'dark'
                                  ? 'rgba(245, 158, 11, 0.22)'
                                  : 'rgba(217, 119, 6, 0.16)'
                                : 'transparent',
                              color: isChildSelected ? theme.palette.primary.main : theme.palette.text.secondary,
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
                                minWidth: 30,
                                color: isChildSelected ? theme.palette.primary.main : 'inherit',
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontSize: '0.82rem',
                                    fontWeight: isChildSelected ? 700 : 500,
                                  }}
                                >
                                  {child.label}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

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
          cursor: 'pointer',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
          },
        }}
        onClick={() => setDashboardTab('users')}
        title="Klik untuk kelola profil & ganti foto avatar user"
      >
        <Avatar
          src={activeUser?.avatarUrl || currentUser?.avatarUrl}
          sx={{ width: 34, height: 34, bgcolor: roleConfig.hexColor, border: '1.5px solid', borderColor: 'primary.main' }}
        >
          {(activeUser?.name || currentUser?.name)?.[0] || 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
              {activeUser?.name || currentUser?.name || 'Administrator'}
            </Typography>
          </Box>
          <Chip
            label={roleConfig.label}
            size="small"
            color={roleConfig.badgeColor as any}
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, mt: 0.2 }}
          />
        </Box>

        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout / Keluar">
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
              {activeTitle}
            </Typography>
          </Box>

          {/* Right Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{ border: `1px solid ${theme.palette.divider}`, p: 0.8, borderRadius: 2 }}
              title="Ganti Mode Tema (Terang/Gelap)"
            >
              {themeMode === 'dark' ? (
                <LightIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
              ) : (
                <DarkIcon sx={{ color: '#475569', fontSize: 18 }} />
              )}
            </IconButton>

            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.8,
                py: 0.5,
              }}
            >
              Keluar
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
