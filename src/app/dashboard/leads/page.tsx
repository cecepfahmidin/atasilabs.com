'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LeadsView } from '@/components/dashboard/LeadsView';

export default function LeadsDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('leads');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <LeadsView />
    </DashboardLayout>
  );
}
