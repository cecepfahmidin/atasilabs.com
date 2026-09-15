'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DocumentsWorkflowView } from '@/components/dashboard/DocumentsWorkflowView';

export default function DocumentsDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('documents');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <DocumentsWorkflowView />
    </DashboardLayout>
  );
}
