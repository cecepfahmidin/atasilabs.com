'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SchemaInspectorView } from '@/components/dashboard/SchemaInspectorView';

export default function SchemaDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('schema');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <SchemaInspectorView />
    </DashboardLayout>
  );
}
