'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { LeadsView } from '@/components/dashboard/LeadsView';
import { PortfolioCMSView } from '@/components/dashboard/PortfolioCMSView';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { PricingCMSView } from '@/components/dashboard/PricingCMSView';
import { SchemaInspectorView } from '@/components/dashboard/SchemaInspectorView';
import { DocumentsWorkflowView } from '@/components/dashboard/DocumentsWorkflowView';
import { UsersView } from '@/components/dashboard/UsersView';

export default function DashboardPage() {
  const { setActiveView, dashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
  }, [setActiveView]);

  return (
    <DashboardLayout>
      {dashboardTab === 'overview' && <OverviewView />}
      {dashboardTab === 'documents' && <DocumentsWorkflowView />}
      {dashboardTab === 'leads' && <LeadsView />}
      {dashboardTab === 'users' && <UsersView />}
      {dashboardTab === 'portfolio' && <PortfolioCMSView />}
      {dashboardTab === 'projects' && <ProjectsView />}
      {dashboardTab === 'pricing' && <PricingCMSView />}
      {dashboardTab === 'schema' && <SchemaInspectorView />}
    </DashboardLayout>
  );
}
