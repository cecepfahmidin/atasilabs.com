'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

// Landing Page Components
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PixelDivider } from '@/components/landing/PixelDivider';
import { Logos } from '@/components/landing/Logos';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Bento } from '@/components/landing/Bento';
import { TechStackArchitectureSection } from '@/components/landing/TechStackArchitectureSection';
import { PortfolioSection } from '@/components/landing/PortfolioSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

// Dashboard Components
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { LeadsView } from '@/components/dashboard/LeadsView';
import { PortfolioCMSView } from '@/components/dashboard/PortfolioCMSView';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { PricingCMSView } from '@/components/dashboard/PricingCMSView';
import { DocumentsWorkflowView } from '@/components/dashboard/DocumentsWorkflowView';

export default function MainPage() {
  const { activeView, dashboardTab } = useApp();

  if (activeView === 'dashboard') {
    return (
      <DashboardLayout>
        {dashboardTab === 'overview' && <OverviewView />}
        {dashboardTab === 'documents' && <DocumentsWorkflowView />}
        {dashboardTab === 'leads' && <LeadsView />}
        {dashboardTab === 'portfolio' && <PortfolioCMSView />}
        {dashboardTab === 'projects' && <ProjectsView />}
        {dashboardTab === 'pricing' && <PricingCMSView />}
      </DashboardLayout>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F0] min-h-screen selection:bg-[#FFD600] selection:text-[#0A0A0A]">
      <LandingNavbar />
      <main className="flex flex-col w-full bg-[#0A0A0A] pt-[60px]">
        <HeroSection />
        <PixelDivider />
        <Logos />
        <ServicesSection />
        <HowItWorks />
        <Stats />
        <TestimonialsSection />
        <Bento />
        <TechStackArchitectureSection />
        <PortfolioSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
