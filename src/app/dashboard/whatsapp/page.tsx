'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WhatsAppAdminView } from '@/components/dashboard/WhatsAppAdminView';

export default function WhatsAppDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('whatsapp');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <WhatsAppAdminView />
    </DashboardLayout>
  );
}
