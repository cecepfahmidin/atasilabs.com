'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AnimatedInteractiveLoginCard } from '../../components/auth/AnimatedInteractiveLoginCard';

function LoginContent() {
  const { currentUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget =
    searchParams.get('redirect') ||
    (typeof window !== 'undefined' ? localStorage.getItem('webdev_sys_last_dashboard_path') : null) ||
    '/dashboard';

  useEffect(() => {
    if (currentUser) {
      try {
        router.replace(redirectTarget);
      } catch {
        window.location.href = redirectTarget;
      }
    }
  }, [currentUser, router, redirectTarget]);

  if (currentUser) {
    return null;
  }

  return <AnimatedInteractiveLoginCard onSuccessRedirect={redirectTarget} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

