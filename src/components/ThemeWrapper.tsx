'use client';

import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import { createAppTheme } from '@/theme/theme';
import { useApp } from '@/context/AppContext';
import { LoginDialog } from '@/components/auth/LoginDialog';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode, notification, closeNotification } = useApp();
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
