'use client';

import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import { createAppTheme } from '@/theme/theme';
import { useApp } from '@/context/AppContext';
import { LoginDialog } from '@/components/auth/LoginDialog';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode, activeView, notification, closeNotification } = useApp();
  const effectiveMode = activeView === 'landing' ? 'dark' : themeMode;
  const theme = useMemo(() => createAppTheme(effectiveMode), [effectiveMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: activeView === 'landing' ? '#0A0A0A' : 'transparent' }}>
        {children}

        {/* Global Login Dialog */}
        <LoginDialog />

        {/* Global Toast Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={closeNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: 2.5,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
