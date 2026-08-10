'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/onboarding'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync user profile if token exists
  useCurrentUser();

  // Query user workspaces to check if onboarding is needed
  const { data: workspaces, isSuccess: isWorkspacesLoaded } = useWorkspaces();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/');
      return;
    }

    if (isAuthenticated && pathname === '/onboarding') {
      router.push('/');
    }
  }, [isAuthenticated, isInitialized, isWorkspacesLoaded, pathname, router, workspaces]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
