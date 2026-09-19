'use client';

import React from 'react';

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

export default function MainPage() {
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
