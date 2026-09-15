'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProjectsView } from '@/components/dashboard/ProjectsView';

export default function ProjectsDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('projects');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <ProjectsView />
    </DashboardLayout>
  );
}
