'use client';

import { ReactNode } from 'react';
import { useRequireSetup } from '@/hooks/useRequireSetup';
import { LoadingScreen } from '@/components/LoadingSpinner';

interface SetupGuardProps {
  children: ReactNode;
}

/**
 * Component that ensures user has completed initial setup
 * Shows loading while checking, redirects to /start-game if not complete
 */
export function SetupGuard({ children }: SetupGuardProps) {
  const { isChecking, hasCompletedSetup } = useRequireSetup();

  if (isChecking) {
    return <LoadingScreen />;
  }

  if (!hasCompletedSetup) {
    // Will redirect, show loading
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
