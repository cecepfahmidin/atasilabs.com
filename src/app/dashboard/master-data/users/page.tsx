'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { UsersView } from '@/components/dashboard/UsersView';

export default function MasterDataUsersDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('users');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <UsersView />
    </DashboardLayout>
  );
}
