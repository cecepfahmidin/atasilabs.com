'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PaymentsView } from '@/components/dashboard/PaymentsView';

export default function PaymentsDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('payments');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <PaymentsView />
    </DashboardLayout>
  );
}
