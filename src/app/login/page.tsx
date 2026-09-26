'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AnimatedInteractiveLoginCard } from '../../components/auth/AnimatedInteractiveLoginCard';

export default function LoginPage() {
  const { currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      try {
        router.replace('/dashboard');
      } catch {
        window.location.href = '/dashboard';
      }
    }
  }, [currentUser, router]);

  if (currentUser) {
    return null;
  }

  return <AnimatedInteractiveLoginCard onSuccessRedirect="/dashboard" />;
}
