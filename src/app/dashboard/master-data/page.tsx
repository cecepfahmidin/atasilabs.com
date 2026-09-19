'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MasterDataView } from '@/components/dashboard/MasterDataView';

export default function MasterDataDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('master-data');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <MasterDataView />
    </DashboardLayout>
  );
}
