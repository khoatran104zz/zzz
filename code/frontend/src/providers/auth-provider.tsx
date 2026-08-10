'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/onboarding'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Sync user profile if token exists
  const { isLoading, isError, isFetching } = useCurrentUser();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (isError) {
      clearAuth();
    }
  }, [isError, clearAuth]);

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/');
      return;
    }

    if (isAuthenticated && pathname === '/onboarding') {
      router.replace('/');
    }
  }, [isAuthenticated, hasHydrated, isPublicRoute, pathname, router]);

  // If client hydration has not finished, show initial loading state
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user claims to be authenticated, but we are actively verifying the token with backend,
  // show loading indicator instead of flashing the dashboard UI!
  if (isAuthenticated && !isPublicRoute && (isLoading || isFetching)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-text-primary font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-text-secondary">Đang xác thực phiên làm việc...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated on a protected route, show spinner while redirecting to /login
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
