'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeamCMSView } from '@/components/dashboard/TeamCMSView';

export default function TeamDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('team');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <TeamCMSView />
    </DashboardLayout>
  );
}
