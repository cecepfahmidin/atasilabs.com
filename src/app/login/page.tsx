'use client';

import React from 'react';
import { AnimatedInteractiveLoginCard } from '../../components/auth/AnimatedInteractiveLoginCard';

export default function LoginPage() {
  return <AnimatedInteractiveLoginCard onSuccessRedirect="/dashboard" />;
}
