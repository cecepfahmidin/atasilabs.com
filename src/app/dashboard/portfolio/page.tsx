'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PortfolioCMSView } from '@/components/dashboard/PortfolioCMSView';

export default function PortfolioDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('portfolio');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <PortfolioCMSView />
    </DashboardLayout>
  );
}
