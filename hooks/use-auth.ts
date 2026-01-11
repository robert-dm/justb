'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface UseAuthOptions {
  requireAuth?: boolean;
  requireProvider?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    requireAuth = false,
    requireProvider = false,
    redirectTo = '/login',
  } = options;

  const router = useRouter();
  const {
    user,
    token,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    clearError,
  } = useAuthStore();

  const isAuthenticated = !!token;
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    if (!isInitialized) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requireProvider && !isProvider) {
      router.push('/');
      return;
    }
  }, [isInitialized, isAuthenticated, isProvider, requireAuth, requireProvider, redirectTo, router]);

  return {
    user,
    token,
    isLoading,
    isInitialized,
    isAuthenticated,
    isProvider,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    clearError,
  };
}

// Convenience hooks
export function useRequireAuth(redirectTo = '/login') {
  return useAuth({ requireAuth: true, redirectTo });
}

export function useRequireProvider(redirectTo = '/') {
  return useAuth({ requireAuth: true, requireProvider: true, redirectTo });
}
