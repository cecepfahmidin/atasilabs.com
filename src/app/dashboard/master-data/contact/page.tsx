'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CompanyContactView } from '@/components/dashboard/CompanyContactView';

export default function MasterDataContactDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('contact');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <CompanyContactView />
    </DashboardLayout>
  );
}
