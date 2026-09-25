import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export const CardSkeletonGrid: React.FC<{ count?: number; xs?: number; md?: number }> = ({
  count = 3,
  xs = 12,
  md = 4,
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid item xs={xs} md={md} key={idx}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Skeleton variant="rectangular" height={180} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            <CardContent>
              <Skeleton variant="text" width="60%" height={28} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Skeleton variant="text" width="90%" height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.05)', my: 1 }} />
              <Skeleton variant="text" width="40%" height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const TableRowSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <Box
          key={rIdx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2,
            px: 2,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              variant="text"
              width={`${100 / columns}%`}
              height={24}
              animation="wave"
              sx={{ bgcolor: 'rgba(255,255,255,0.06)' }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="rectangular" width="70%" height={48} animation="wave" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Skeleton variant="text" width="50%" height={24} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
      <Skeleton variant="text" width="30%" height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
    </Box>
  );
};
