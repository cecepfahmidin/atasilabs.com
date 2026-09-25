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
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  useTheme,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as CLevelIcon,
  RestartAlt as ResetIcon,
  Launch as LaunchIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ROLE_CONFIGS } from '../../lib/rbac';

const PRESET_AVATARS = [
  { label: 'Avatar Preset 1', url: '/team/ceo.jpg' },
  { label: 'Avatar Preset 2', url: '/team/cto.jpg' },
  { label: 'Avatar Preset 3', url: '/team/cmo.jpg' },
];

export const TeamCMSView: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { users, addUser, updateUser, deleteUser, showNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    company: string;
    status: 'ACTIVE' | 'INACTIVE';
    avatarUrl: string;
    bio: string;
    tagline: string;
    titleBadge: string;
    roleTitle: string;
  }>({
    name: '',
    email: '',
    role: 'CEO',
    phone: '',
    company: '',
    status: 'ACTIVE',
    avatarUrl: '',
    bio: '',
    tagline: '',
    titleBadge: 'CEO & FOUNDER',
    roleTitle: 'CHIEF EXECUTIVE OFFICER',
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Filter team members (all staff/management roles excluding CLIENT)
  const teamMembers = users.filter((u) => u.role && u.role.toUpperCase() !== 'CLIENT');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran foto profil maksimal 5 MB', 'warning');
      return;
    }

    setUploadingAvatar(true);
    showNotification('Mengunggah foto profil ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'team');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
        showNotification('Foto profil tim berhasil disimpan ke Cloudflare R2!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
            showNotification('Foto profil tim dimuat!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Team R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
          showNotification('Foto profil tim dimuat!', 'success');
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
      role: 'CEO',
      phone: '',
      company: 'Atasilabs Leadership',
      status: 'ACTIVE',
      avatarUrl: '/team/ceo.jpg',
      bio: 'Memastikan seluruh operasional studio, standar layanan, dan komitmen garansi kepuasan berjalan dengan presisi tinggi.',
      tagline: 'Visi Strategis & Layanan Klien',
      titleBadge: 'CEO & FOUNDER',
      roleTitle: 'CHIEF EXECUTIVE OFFICER',
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    let defaultBio = u.bio || '';
    let defaultTagline = u.tagline || '';
    let defaultBadge = u.titleBadge || '';
    let defaultRoleTitle = u.roleTitle || '';

    if (!defaultBio) {
      if (u.role === 'CEO') defaultBio = 'Memastikan seluruh operasional studio, standar layanan, dan komitmen garansi kepuasan berjalan dengan presisi dan transparansi tinggi.';
      else if (u.role === 'CTO') defaultBio = 'Mengawasi arsitektur Next.js, optimasi kecepatan loading, keandalan cloud hosting, serta arsitektur sistem keamanan data.';
      else if (u.role === 'CMO') defaultBio = 'Merancang desain antarmuka (UI/UX) yang memukau, ramah pengguna (user-friendly), serta strategi konversi pertumbuhan bisnis.';
      else defaultBio = 'Anggota tim manajemen dan eksekusi proyek Atasilabs.';
    }

    if (!defaultTagline) {
      if (u.role === 'CEO') defaultTagline = 'Visi Strategis & Layanan Klien';
      else if (u.role === 'CTO') defaultTagline = 'Arsitektur Software & Keamanan';
      else if (u.role === 'CMO') defaultTagline = 'Strategi Digital, UI/UX & Growth';
      else defaultTagline = 'Tim Profesional Atasilabs';
    }

    if (!defaultBadge) {
      if (u.role === 'CEO') defaultBadge = 'CEO & FOUNDER';
      else if (u.role === 'CTO') defaultBadge = 'CTO & LEAD ARCHITECT';
      else if (u.role === 'CMO') defaultBadge = 'CMO & HEAD OF UI/UX';
      else defaultBadge = `${u.role} EXECUTIVE`;
    }

    if (!defaultRoleTitle) {
      if (u.role === 'CEO') defaultRoleTitle = 'CHIEF EXECUTIVE OFFICER';
      else if (u.role === 'CTO') defaultRoleTitle = 'CHIEF TECHNOLOGY OFFICER';
      else if (u.role === 'CMO') defaultRoleTitle = 'CHIEF MARKETING OFFICER';
      else defaultRoleTitle = `${u.role} EXECUTIVE`;
    }

    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      company: u.company || '',
      status: u.status || 'ACTIVE',
      avatarUrl: u.avatarUrl || '',
      bio: defaultBio,
      tagline: defaultTagline,
      titleBadge: defaultBadge,
      roleTitle: defaultRoleTitle,
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      showNotification('Nama lengkap dan alamat email wajib diisi', 'warning');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        showNotification(`Profil eksekutif ${formData.name} berhasil diperbarui!`, 'success');
      } else {
        await addUser(formData);
        showNotification(`Anggota tim ${formData.name} berhasil ditambahkan!`, 'success');
      }
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      showNotification('Gagal menyimpan profil tim', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus profil eksekutif ini?')) {
      await deleteUser(id);
      showNotification('Profil eksekutif berhasil dihapus', 'info');
    }
  };

  const filteredTeam = teamMembers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.company && t.company.toLowerCase().includes(q))
    );
  });

  return (
    <Box sx={{ pb: 6 }}>
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
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            }}
          >
            Manajemen Tim & Leadership Executive
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pusat kendali profil eksekutif C-Level (CEO, CTO, CMO). Kelola foto profil avatar (Cloudflare R2), biografi eksekutif, badge judul jabatan, dan status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<LaunchIcon />}
            onClick={() => router.push('/#team')}
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              whiteSpace: 'nowrap',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Pratinjau Landing
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              color: theme.palette.mode === 'dark' ? '#181512' : '#ffffff',
            }}
          >
            Tambah Eksekutif Baru
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Cari eksekutif berdasarkan nama, email, atau jabatan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 450, width: '100%' }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Menampilkan {filteredTeam.length} Eksekutif & Tim
        </Typography>
      </Box>

      {/* Grid of Team Executive Cards */}
      <Grid container spacing={3}>
        {filteredTeam.map((item) => {
          const roleConfig = ROLE_CONFIGS[item.role] || ROLE_CONFIGS.ADMIN;
          const displayAvatar = item.avatarUrl || (item.role === 'CEO' ? '/team/ceo.jpg' : item.role === 'CTO' ? '/team/cto.jpg' : '/team/cmo.jpg');
          const badgeText = item.titleBadge || (item.role === 'CEO' ? 'CEO & FOUNDER' : item.role === 'CTO' ? 'CTO & LEAD ARCHITECT' : item.role === 'CMO' ? 'CMO & HEAD OF UI/UX' : roleConfig.label);

          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  bgcolor: theme.palette.mode === 'dark' ? '#111111' : '#ffffff',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.25s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: roleConfig.hexColor,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 220,
                    bgcolor: '#161616',
                    overflow: 'hidden',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <img
                    src={displayAvatar}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                    }}
                  />
                  <Chip
                    label={badgeText}
                    size="small"
                    color={roleConfig.badgeColor as any}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: roleConfig.hexColor, letterSpacing: 1 }}>
                    [{item.role}] {item.roleTitle || roleConfig.label}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {item.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {item.company || 'Atasilabs Tech Division'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
                    {item.bio || (item.role === 'CEO'
                      ? 'Memastikan seluruh operasional studio, standar layanan, dan komitmen garansi kepuasan klien berjalan dengan presisi tinggi.'
                      : item.role === 'CTO'
                      ? 'Mengawasi arsitektur Next.js, optimasi kecepatan loading, keandalan cloud hosting, serta arsitektur sistem keamanan data.'
                      : 'Merancang desain antarmuka (UI/UX) yang memukau, ramah pengguna, serta strategi konversi pertumbuhan bisnis.')}
                  </Typography>

                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Chip
                      label={item.status === 'ACTIVE' ? 'STATUS: AKTIF' : 'STATUS: NONAKTIF'}
                      size="small"
                      color={item.status === 'ACTIVE' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary" title="Edit Profil Eksekutif">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id)} color="error" title="Hapus Profil">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit / Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CLevelIcon color="primary" />
          {editingUser ? `Edit Profil Eksekutif: ${editingUser.name}` : 'Tambah Eksekutif Baru'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {/* Left Column: Form Controls */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Photo R2 Upload Box */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2.5,
                    bgcolor: 'action.hover',
                    borderRadius: 2.5,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={formData.avatarUrl}
                      sx={{
                        width: 90,
                        height: 90,
                        border: '3px solid',
                        borderColor: ROLE_CONFIGS[formData.role]?.hexColor || 'primary.main',
                        boxShadow: 3,
                        mb: 1,
                      }}
                    >
                      {formData.name ? formData.name[0] : 'E'}
                    </Avatar>
                    <label htmlFor="team-avatar-file">
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
                        title="Upload Foto Profil ke Cloudflare R2"
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </label>
                    <input
                      type="file"
                      id="team-avatar-file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                    Unggah foto eksekutif langsung ke Cloudflare R2 Bucket (Maks 5MB)
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    label="URL Foto Profile Avatar (Atau Paste Link)"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />

                  {/* Preset Avatars */}
                  <Box sx={{ width: '100%', mt: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: 'text.secondary' }}>
                      Atau pilih sampel foto default:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {PRESET_AVATARS.map((p, idx) => (
                        <Tooltip key={idx} title={p.label} arrow placement="top">
                          <Avatar
                            src={p.url}
                            onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                            sx={{
                              width: 34,
                              height: 34,
                              cursor: 'pointer',
                              border: formData.avatarUrl === p.url ? '2px solid #f59e0b' : '1px solid rgba(0,0,0,0.1)',
                              transform: formData.avatarUrl === p.url ? 'scale(1.15)' : 'scale(1)',
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nama Lengkap Eksekutif & Gelar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Contoh: Nama Lengkap & Gelar"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Peran / Role C-Level</InputLabel>
                      <Select
                        value={formData.role}
                        label="Peran / Role C-Level"
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      >
                        <MenuItem value="CEO">CEO (Chief Executive Officer)</MenuItem>
                        <MenuItem value="CTO">CTO (Chief Technology Officer)</MenuItem>
                        <MenuItem value="CMO">CMO (Chief Marketing Officer)</MenuItem>
                        <MenuItem value="ADMIN">ADMIN (System Administrator)</MenuItem>
                        <MenuItem value="DEVELOPER">DEVELOPER (In-House Dev)</MenuItem>
                        <MenuItem value="FREELANCER">FREELANCER (Mitra Developer)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Badge Judul Jabatan (Tampil di Foto)"
                  value={formData.titleBadge}
                  onChange={(e) => setFormData({ ...formData, titleBadge: e.target.value })}
                  placeholder="Contoh: CMO & HEAD OF UI/UX, CEO & FOUNDER, CTO & LEAD ARCHITECT"
                  helperText="Badge judul ini akan tampil di bagian atas foto eksekutif pada landing page"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Resmi"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nomor Telepon / WhatsApp"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Organisasi / Divisi Perusahaan"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Contoh: PT Aulia Indoland Grup (Atasilabs)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Tagline Subtitle Peran"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Contoh: Visi Strategis & Manajemen Layanan Klien"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Biografi & Tanggung Jawab Utama (Bio)"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Penjelasan ringkas peranan eksekutif dalam menjamin kepuasan dan kualitas proyek..."
                />
              </Box>
            </Grid>

            {/* Right Column: Realtime Card Preview */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, color: '#f59e0b', display: 'block', mb: 1 }}>
                  PRATINJAU REALTIME CARD LANDING PAGE
                </Typography>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #2D2D2D',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ height: 200, bgcolor: '#161616', position: 'relative' }}>
                    <img
                      src={formData.avatarUrl || '/team/ceo.jpg'}
                      alt={formData.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                    <Chip
                      label={formData.titleBadge || ROLE_CONFIGS[formData.role]?.label || formData.role}
                      size="small"
                      color={ROLE_CONFIGS[formData.role]?.badgeColor as any}
                      sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Box>

                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888888', fontWeight: 800, letterSpacing: 1 }}>
                      [{formData.role}] CHIEF EXECUTIVE
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5F0' }}>
                      {formData.name || 'Nama Eksekutif'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FFD600', fontWeight: 700 }}>
                      {formData.company || formData.tagline || 'Atasilabs Leadership'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888888', fontSize: '0.82rem', lineHeight: 1.6, mt: 0.5 }}>
                      {formData.bio || 'Biografi ringkas tanggung jawab eksekutif...'}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{
              fontWeight: 800,
              px: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            }}
          >
            {editingUser ? 'Simpan Perubahan' : 'Tambah Eksekutif'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamCMSView;

