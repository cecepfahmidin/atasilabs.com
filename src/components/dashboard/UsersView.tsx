'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Grid,
  useTheme,
  Divider,
  Switch,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  SupervisorAccount as CLevelIcon,
  GroupWork as GroupIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  RestartAlt as ResetIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ROLE_CONFIGS, hasPermission } from '../../lib/rbac';
import { supabase } from '../../lib/supabase';

const PRESET_AVATARS = [
  { label: 'CEO Irfan', url: '/team/ceo.jpg' },
  { label: 'CTO Cecep', url: '/team/cto.jpg' },
  { label: 'CMO Dian', url: '/team/cmo.jpg' },
];

export const UsersView: React.FC = () => {
  const theme = useTheme();
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    switchUserRole,
    updateRolePermission,
    resetRolePermissionsToDefault,
    hasRolePermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { showNotification } = useApp();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    company: string;
    status: 'ACTIVE' | 'INACTIVE';
    avatarUrl: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    phone: '',
    company: '',
    status: 'ACTIVE',
    avatarUrl: '',
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran file foto maksimal 5 MB', 'warning');
      return;
    }

    setUploadingAvatar(true);
    showNotification('Mengunggah foto profil ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
        showNotification('Foto profil berhasil disimpan ke Cloudflare R2!', 'success');
      } else {
        // Fallback to local DataURL if R2 is initializing
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
            showNotification('Foto profil berhasil dimuat!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Avatar R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
          showNotification('Foto profil berhasil dimuat!', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      phone: '',
      company: '',
      status: 'ACTIVE',
      avatarUrl: '',
    });
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      phone: user.phone || '',
      company: user.company || '',
      status: user.status || 'ACTIVE',
      avatarUrl: user.avatarUrl || '',
    });
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        
        // If updating current user's password in Supabase Auth session
        if (formData.password && currentUser?.email === editingUser.email) {
          const { error } = await supabase.auth.updateUser({
            password: formData.password,
          });
          if (error) {
            console.warn('Supabase Auth password sync note:', error.message);
          } else {
            showNotification('Kata sandi pengguna di Supabase Auth & RBAC berhasil diperbarui!', 'success');
          }
        } else if (formData.password) {
          showNotification('Kata sandi pengguna & data RBAC berhasil diperbarui!', 'success');
        }
      } else {
        await addUser(formData);
        if (formData.password) {
          showNotification('Pengguna & kata sandi baru berhasil dibuat!', 'success');
        }
      }
    } catch (err: any) {
      console.error(err);
    }
    setOpenDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini dari sistem?')) {
      await deleteUser(id);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const cLevelCount = users.filter((u) => ['CEO', 'CTO', 'CMO'].includes(u.role)).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const externalCount = users.filter((u) => ['CLIENT', 'FREELANCER'].includes(u.role)).length;

  return (
    <Box sx={{ pb: 6 }}>

      {/* Header Title */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            Manajemen Pengguna & Role-Based Access Control (RBAC)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pengaturan peran CEO, CTO, CMO, Admin Operasional, Klien Enterprise, dan Mitra Developer.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
          }}
        >
          Tambah Pengguna Baru
        </Button>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL PENGGUNA
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {totalUsers}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', width: 44, height: 44 }}>
                <GroupIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  C-LEVEL EXECUTIVES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#f59e0b' }}>
                  {cLevelCount}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', width: 44, height: 44 }}>
                <CLevelIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ADMIN OPERASIONAL
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#06b6d4' }}>
                  {adminCount}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', width: 44, height: 44 }}>
                <ShieldIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  KLIEN & FREELANCER
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#10b981' }}>
                  {externalCount}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', width: 44, height: 44 }}>
                <PersonIcon />
              </Avatar>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' } }}
        >
          <Tab value="users" label={`Daftar Pengguna (${filteredUsers.length})`} />
          <Tab value="matrix" label="Matriks Hak Akses (RBAC Matrix)" />
        </Tabs>
      </Box>

      {activeTab === 'users' && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
          {/* Filters & Search Header */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
            <TextField
              size="small"
              placeholder="Cari nama, email, atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Filter Role:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <MenuItem value="ALL">Semua Peran</MenuItem>
                  <MenuItem value="CEO">CEO (Chief Executive)</MenuItem>
                  <MenuItem value="CTO">CTO (Chief Tech)</MenuItem>
                  <MenuItem value="CMO">CMO (Chief Marketing)</MenuItem>
                  <MenuItem value="ADMIN">Admin Operasional</MenuItem>
                  <MenuItem value="CLIENT">Klien Enterprise</MenuItem>
                  <MenuItem value="FREELANCER">Mitra Developer</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* User Table */}
          {/* Desktop Table View */}
          <TableContainer sx={{ width: '100%', overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Pengguna & Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role RBAC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Organisasi / Perusahaan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kontak Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.ADMIN;
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <TableRow key={u.id} hover sx={{ backgroundColor: isSelf ? (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(254, 243, 199, 0.4)') : 'transparent' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={u.avatarUrl} sx={{ width: 38, height: 38, bgcolor: roleCfg.hexColor }}>
                              {u.name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {u.name} {isSelf && <Chip label="Anda" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem', ml: 0.5 }} />}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {u.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Tooltip title={roleCfg.description} arrow placement="top">
                            <Chip
                              label={roleCfg.label}
                              size="small"
                              color={roleCfg.badgeColor as any}
                              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                            />
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {u.company || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {u.phone || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={u.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                            size="small"
                            color={u.status === 'ACTIVE' ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenEdit(u)} color="primary" title="Edit Pengguna">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(u.id)} color="error" title="Hapus Pengguna">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Stack spacing={2} sx={{ p: 2, display: { xs: 'flex', md: 'none' } }}>
            {filteredUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Tidak ada pengguna yang cocok dengan kriteria pencarian.
              </Typography>
            ) : (
              filteredUsers.map((u) => {
                const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.ADMIN;
                const isSelf = currentUser?.id === u.id;
                return (
                  <Paper
                    key={u.id}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: isSelf
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(254, 243, 199, 0.5)'
                        : theme.palette.background.paper,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={u.avatarUrl} sx={{ width: 42, height: 42, bgcolor: roleCfg.hexColor }}>
                          {u.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {u.name} {isSelf && <Chip label="Anda" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem', ml: 0.5 }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={roleCfg.label}
                        size="small"
                        color={roleCfg.badgeColor as any}
                        sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Stack spacing={0.5} sx={{ my: 1.5, p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Organisasi: <strong>{u.company || '-'}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Telepon/WA: <strong>{u.phone || '-'}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: <strong style={{ color: u.status === 'ACTIVE' ? '#10b981' : '#64748b' }}>{u.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</strong>
                      </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenEdit(u)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => handleDelete(u.id)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Hapus
                      </Button>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Card>
      )}

      {activeTab === 'matrix' && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Matriks Hak Akses Peran Dinamis (Dynamic RBAC Permission Matrix)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ubah hak akses masing-masing peran (CEO, CTO, CMO, Admin, Client, Freelancer) secara dinamis & real-time dengan mengeklik sakelar di bawah.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<ResetIcon />}
              onClick={resetRolePermissionsToDefault}
              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 0.8 }}
            >
              Reset ke Matriks Default
            </Button>
          </Box>

          <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              <strong>Pengaturan Dinamis Real-Time:</strong> Setiap kali sakelar diubah, sistem akan langsung memperbarui menu navigasi dan proteksi halaman untuk peran terkait secara otomatis tanpa perlu *restart* server.
            </Typography>
          </Alert>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Modul / Fitur Sistem</TableCell>
                  {(['CEO', 'CTO', 'CMO', 'ADMIN', 'CLIENT', 'FREELANCER'] as UserRole[]).map((r) => (
                    <TableCell key={r} align="center" sx={{ fontWeight: 800, py: 1.5 }}>
                      <Chip label={r} size="small" color={ROLE_CONFIGS[r].badgeColor as any} sx={{ fontWeight: 800 }} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { key: 'overview', label: 'Dashboard Overview & Executive Metrics' },
                  { key: 'leads', label: 'Pesan Masuk & Inbound Leads (CMO / Admin)' },
                  { key: 'projects', label: 'Manajemen Proyek & Tracking Progress' },
                  { key: 'documents', label: 'Pusat Dokumen & SOP IPW (CIF, RSD, MoU, SPK, BAST)' },
                  { key: 'hppFinancials', label: 'Kalkulator HPP & Matrix Profit Margin (CEO, CTO, Admin)' },
                  { key: 'freelancerFees', label: 'Fee Pengerjaan Freelancer 40/60 (CEO, CTO, Admin, Freelancer)' },
                  { key: 'clientPricingMoU', label: 'Skema Investasi & MoU Kontrak Klien' },
                  { key: 'portfolio', label: 'CMS Portofolio & Showcases' },
                  { key: 'pricing', label: 'Pengaturan Pricelist Paket & Spec' },
                  { key: 'users', label: 'Manajemen User & Pengaturan RBAC' },
                ].map((item) => (
                  <TableRow key={item.key} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.label}</TableCell>
                    {(['CEO', 'CTO', 'CMO', 'ADMIN', 'CLIENT', 'FREELANCER'] as UserRole[]).map((r) => {
                      const isAllowed = hasRolePermission(r, item.key);
                      return (
                        <TableCell key={r} align="center">
                          <Tooltip title={`Role ${r}: ${isAllowed ? 'DIIZINKAN' : 'DIBLOKIR'} untuk ${item.label}`} arrow placement="top">
                            <Switch
                              size="small"
                              checked={isAllowed}
                              onChange={(e) => updateRolePermission(r, item.key, e.target.checked)}
                              color={ROLE_CONFIGS[r].badgeColor === 'default' ? 'primary' : (ROLE_CONFIGS[r].badgeColor as any)}
                            />
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Legend Note */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Catatan Keamanan: Perubahan sakelar di atas akan langsung tersimpan di *browser storage* sehingga simulasi uji akses RBAC selalu konsisten.
            </Typography>
          </Alert>
        </Card>
      )}

      {/* Add / Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingUser ? 'Edit Data Pengguna & Role RBAC' : 'Tambah Pengguna Sistem Baru'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Avatar Photo Management Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px dashed', borderColor: 'divider' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={formData.avatarUrl}
                  sx={{ width: 84, height: 84, border: '3px solid', borderColor: 'primary.main', boxShadow: 3, mb: 1 }}
                >
                  {formData.name ? formData.name[0]?.toUpperCase() : 'U'}
                </Avatar>
                <label htmlFor="avatar-file-input">
                  <IconButton
                    component="span"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: -4,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                    title="Upload Foto Profil Baru"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </label>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, textAlign: 'center' }}>
                Klik ikon kamera untuk upload foto profil langsung ke Cloudflare R2 (PNG/JPG, Maks 5MB)
              </Typography>

              <Box sx={{ width: '100%', mb: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL Link Foto Profil (Atau Paste Link)"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </Box>

              {/* Sample Preset Avatars */}
              <Box sx={{ width: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1, color: 'text.secondary' }}>
                  Atau Pilih Foto Sample Preset:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_AVATARS.map((preset, i) => (
                    <Tooltip key={i} title={preset.label} arrow placement="top">
                      <Avatar
                        src={preset.url}
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        sx={{
                          width: 34,
                          height: 34,
                          cursor: 'pointer',
                          border: formData.avatarUrl === preset.url ? '2px solid #d97706' : '1px solid rgba(0,0,0,0.2)',
                          transform: formData.avatarUrl === preset.url ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'scale(1.15)' },
                        }}
                      />
                    </Tooltip>
                  ))}
                  {formData.avatarUrl && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                      sx={{ fontSize: '0.68rem', textTransform: 'none', ml: 'auto' }}
                    >
                      Hapus Foto
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            <TextField
              label="Nama Lengkap"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Cecep Fahmidin, S.Kom"
              required
            />

            <TextField
              label="Alamat Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@atasilabs.com"
              required
            />

            <TextField
              label={editingUser ? "Kata Sandi Baru (Password)" : "Kata Sandi (Password)"}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah kata sandi" : "Masukkan kata sandi pengguna (min 6 karakter)"}
              helperText={editingUser ? "Isi field ini untuk memperbarui kata sandi pengguna di Supabase Auth & Sistem" : "Kata sandi yang digunakan pengguna untuk autentikasi login"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Role Akses (RBAC Role)</InputLabel>
              <Select
                value={formData.role}
                label="Role Akses (RBAC Role)"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <MenuItem value="CEO">CEO (Chief Executive Officer)</MenuItem>
                <MenuItem value="CTO">CTO (Chief Technology Officer)</MenuItem>
                <MenuItem value="CMO">CMO (Chief Marketing Officer)</MenuItem>
                <MenuItem value="ADMIN">ADMIN (System Administrator)</MenuItem>
                <MenuItem value="CLIENT">CLIENT (Klien Enterprise)</MenuItem>
                <MenuItem value="FREELANCER">FREELANCER (Mitra Developer)</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="warning" icon={<ShieldIcon fontSize="small" />} sx={{ py: 0.5 }}>
              <Typography variant="caption">
                <strong>Deskripsi Role ({formData.role}):</strong> {ROLE_CONFIGS[formData.role]?.description}
              </Typography>
            </Alert>

            <TextField
              label="Nama Perusahaan / Divisi"
              fullWidth
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="PT Aulia Indoland Grup / Nama Perusahaan Klien"
            />

            <TextField
              label="Nomor Telepon / WhatsApp"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
            />

            <FormControl fullWidth>
              <InputLabel>Status Akun</InputLabel>
              <Select
                value={formData.status}
                label="Status Akun"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="ACTIVE">Aktif (Dapat Login & Akses System)</MenuItem>
                <MenuItem value="INACTIVE">Nonaktif (Akses Diblokir)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}>
            {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
