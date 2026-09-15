'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { HPPCalculatorView } from '@/components/dashboard/HPPCalculatorView';

export default function HPPDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('hpp');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <HPPCalculatorView />
    </DashboardLayout>
  );
}
