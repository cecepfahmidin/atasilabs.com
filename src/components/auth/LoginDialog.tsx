'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';

export const LoginDialog: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useApp();

  const [email, setEmail] = useState('cecepfahmidin@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email tidak boleh kosong');
      return;
    }
    login(email.trim());
    setIsLoginModalOpen(false);
    router.push('/dashboard');
  };

  const handleQuickDemoLogin = () => {
    login('cecepfahmidin@gmail.com');
    setIsLoginModalOpen(false);
    router.push('/dashboard');
  };

  return (
    <Dialog
      open={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            p: 1,
            backgroundColor: theme.palette.background.paper,
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <AtasiLabsLogo variant="icon" height={32} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            Login AtasiLabs Auth
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => setIsLoginModalOpen(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleLoginSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
              label="PROTEKSI NEXT.JS MIDDLEWARE"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem', mb: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Akses rute <code>/dashboard/*</code> dilindungi oleh Supabase Auth session token.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="email"
            label="Email Admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2.5 }}
            required
          />

          <TextField
            fullWidth
            type="password"
            label="Kata Sandi (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            startIcon={<FingerprintIcon />}
            onClick={handleQuickDemoLogin}
            sx={{
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.86rem',
              mb: 1,
            }}
          >
            1-Klik Login Demo Admin
          </Button>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setIsLoginModalOpen(false)} color="inherit">
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ px: 3, fontWeight: 700, borderRadius: 2 }}
          >
            Masuk ke Dashboard
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
