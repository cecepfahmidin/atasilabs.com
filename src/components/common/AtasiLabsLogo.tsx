import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface AtasiLabsLogoProps extends Omit<BoxProps, 'children'> {
  height?: number | string;
  variant?: 'full' | 'icon' | 'text';
}

export const AtasiLabsLogo: React.FC<AtasiLabsLogoProps> = ({
  height = 36,
  variant = 'full',
  sx,
  ...props
}) => {
  if (variant === 'icon') {
    return (
      <Box
        component="svg"
        viewBox="0 0 135 154.09"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        sx={{
          height,
          width: 'auto',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 8px rgba(252, 218, 10, 0.3))',
          ...sx,
        }}
        {...props}
      >
        <path
          d="M102.02,126.3c-4.79-.14-9.98-2.72-13.19-8.26-5.25-9.07-14.81-10.16-23.35-7.51-3.56,1.11-5.7,3.97-7.53,7.03-3.76,6.3-10.56,9.63-17.69,8.62-7.05-1-12.91-6.35-14.57-13.45-1.05-4.49-.33-8.76,1.93-12.79,9.47-16.95,18.92-33.91,28.38-50.87,1.58-2.83,3.05-5.73,5.57-7.93,6.45-5.62,15.8-5.91,22.44-.64,6.87,5.46,8.78,14.47,4.54,22.25-4.85,8.9-9.85,17.71-14.79,26.56-.51.91-.99,1.83-1.53,2.72-1.97,3.23-2.01,6.45.3,9.46,2.35,3.06,5.62,3.52,9.16,2.67,3.25-.78,5.63-2.77,7.58-5.45,6.1-8.37,17.4-9.95,25.32-3.61,5.85,4.69,8.1,12.5,5.6,19.5-2.53,7.1-9.03,11.69-18.17,11.69Z"
          fill="#fcda0a"
          stroke="#231f20"
          strokeMiterlimit="10"
          strokeWidth="5px"
        />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src="/atasilabs-logo.svg"
      alt="AtasiLabs Studio Logo"
      sx={{
        height,
        width: 'auto',
        maxWidth: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 8px rgba(252, 218, 10, 0.2))',
        ...sx,
      }}
      {...props}
    />
  );
};
