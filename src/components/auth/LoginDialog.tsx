'use client';

import React from 'react';
import { Dialog, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { AnimatedInteractiveLoginCard } from './AnimatedInteractiveLoginCard';

export const LoginDialog: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen } = useApp();

  return (
    <Dialog
      open={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            overflow: 'hidden',
            backgroundColor: '#131518',
            p: 0,
            m: { xs: 1, sm: 2 },
            maxHeight: '92vh',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          size="small"
          onClick={() => setIsLoginModalOpen(false)}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 40,
            color: '#9ca3af',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <AnimatedInteractiveLoginCard
          isModal={true}
          onCloseModal={() => setIsLoginModalOpen(false)}
          onSuccessRedirect="/dashboard"
        />
      </Box>
    </Dialog>
  );
};
