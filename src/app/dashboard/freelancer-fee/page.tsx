'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FreelancerFeeView } from '@/components/dashboard/FreelancerFeeView';

export default function FreelancerFeePage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('freelancer-fee');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <FreelancerFeeView />
    </DashboardLayout>
  );
}
