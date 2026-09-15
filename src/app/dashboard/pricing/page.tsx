'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PricingCMSView } from '@/components/dashboard/PricingCMSView';

export default function PricingDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('pricing');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <PricingCMSView />
    </DashboardLayout>
  );
}
