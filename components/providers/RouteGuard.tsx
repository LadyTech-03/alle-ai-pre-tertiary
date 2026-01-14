"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { publicRoutes, privateRoutes } from './authTest';
import { usePageTitle } from '@/hooks/use-page-title';
import { NotFoundPage } from '@/components/features/not-found/404';
import { useAuth } from './authTest';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [isValidRoute, setIsValidRoute] = useState(true);
  const { isSubscribed } = useAuth();
  
  usePageTitle();

  useEffect(() => {
    const matchRoute = (route: string): boolean => {
      if (route === pathname) return true;
      if (route.endsWith('/*') && pathname.startsWith(route.slice(0, -2))) return true;
      return false;
    };

    const isPrivateRoute = privateRoutes.some(route => matchRoute(route));

    // Route exists but is private and user isn't subscribed
    if (isPrivateRoute && !isSubscribed) {
      router.replace('/');
      return;
    }

    // Valid route and authorized
    setIsValidRoute(true);
    setAuthorized(true);
  }, [pathname, router, isSubscribed]);

  // Show nothing while checking authorization
  if (!authorized) {
    return null;
  }

  // Show 404 for invalid routes
  if (!isValidRoute) {
    return (
      <NotFoundPage 
        title="Page Not Found"
        description="Oops! Looks like you've wandered off the beaten path. Let's get you back on track!"
        showHomeButton={true}
      />
    );
  }

  return <>{children}</>;
}