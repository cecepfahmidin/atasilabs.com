'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TestimonialsCMSView } from '@/components/dashboard/TestimonialsCMSView';

export default function TestimonialsDashboardPage() {
  const { setActiveView, setDashboardTab } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardTab('testimonials');
  }, [setActiveView, setDashboardTab]);

  return (
    <DashboardLayout>
      <TestimonialsCMSView />
    </DashboardLayout>
  );
}
