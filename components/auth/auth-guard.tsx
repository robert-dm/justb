'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProvider?: boolean;
}

export function AuthGuard({ children, requireProvider = false }: AuthGuardProps) {
  const router = useRouter();
  const { user, token, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (requireProvider && user?.role !== 'provider') {
      router.push('/');
      return;
    }
  }, [token, user, isInitialized, requireProvider, router]);

  // Show nothing while checking auth
  if (!isInitialized || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Check provider requirement
  if (requireProvider && user?.role !== 'provider') {
    return null;
  }

  return <>{children}</>;
}
