'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { LeadsView } from '@/components/dashboard/LeadsView';
import { PortfolioCMSView } from '@/components/dashboard/PortfolioCMSView';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { PricingCMSView } from '@/components/dashboard/PricingCMSView';
import { DocumentsWorkflowView } from '@/components/dashboard/DocumentsWorkflowView';
import { UsersView } from '@/components/dashboard/UsersView';
import { CompanyContactView } from '@/components/dashboard/CompanyContactView';
import { TestimonialsCMSView } from '@/components/dashboard/TestimonialsCMSView';
import { TeamCMSView } from '@/components/dashboard/TeamCMSView';
import { PaymentsView } from '@/components/dashboard/PaymentsView';

export default function DashboardPage() {
  const { setActiveView, dashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
  }, [setActiveView]);

  return (
    <DashboardLayout>
      {dashboardTab === 'overview' && <OverviewView />}
      {dashboardTab === 'documents' && <DocumentsWorkflowView />}
      {dashboardTab === 'payments' && <PaymentsView />}
      {dashboardTab === 'leads' && <LeadsView />}
      {dashboardTab === 'users' && <UsersView />}
      {dashboardTab === 'portfolio' && <PortfolioCMSView />}
      {dashboardTab === 'projects' && <ProjectsView />}
      {dashboardTab === 'pricing' && <PricingCMSView />}
      {dashboardTab === 'contact' && <CompanyContactView />}
      {dashboardTab === 'testimonials' && <TestimonialsCMSView />}
      {dashboardTab === 'team' && <TeamCMSView />}
    </DashboardLayout>
  );
}
