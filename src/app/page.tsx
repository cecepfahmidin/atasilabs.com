'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

// Landing Page Components
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { PortfolioSection } from '@/components/landing/PortfolioSection';
import { TechStackArchitectureSection } from '@/components/landing/TechStackArchitectureSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

// Dashboard Components
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { LeadsView } from '@/components/dashboard/LeadsView';
import { PortfolioCMSView } from '@/components/dashboard/PortfolioCMSView';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { PricingCMSView } from '@/components/dashboard/PricingCMSView';
import { SchemaInspectorView } from '@/components/dashboard/SchemaInspectorView';

export default function MainPage() {
  const { activeView, dashboardTab } = useApp();

  if (activeView === 'dashboard') {
    return (
      <DashboardLayout>
        {dashboardTab === 'overview' && <OverviewView />}
        {dashboardTab === 'leads' && <LeadsView />}
        {dashboardTab === 'portfolio' && <PortfolioCMSView />}
        {dashboardTab === 'projects' && <ProjectsView />}
        {dashboardTab === 'pricing' && <PricingCMSView />}
        {dashboardTab === 'schema' && <SchemaInspectorView />}
      </DashboardLayout>
    );
  }

  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <PortfolioSection />
        <TechStackArchitectureSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
