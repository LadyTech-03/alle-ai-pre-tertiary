"use client"

import { useEffect, ReactNode, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { LoadingScreen } from './LoadingScreen';
import { authApi, User } from '@/lib/api/auth';
import { useConversationStore } from '@/stores/models';
import { toast } from 'sonner';


interface RouteGuardProps {
  children: ReactNode;
}

const authRoutes = ['/auth'];

const publicRoutes = [
  '/model-glossary',
  '/privacy-policy',
  '/terms-of-service',
  '/faq',
  '/release-notes',
  '/reset-password',
  '/docs',
  '/changelog',
  '/about',
  '/404',
  '/chat/share',
  '/image/share',
];

// Create a separate component for the route guard logic
function RouteGuardInner({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const { setConversationId, setPromptId, setGenerationType } = useConversationStore();

  // Treat share routes as public: skip auth checks here
  const isShareRoute = (
    pathname.startsWith('/chat/shares/') ||
    pathname.startsWith('/image/shares/') ||
    pathname.startsWith('/audio/shares/') ||
    pathname.startsWith('/video/shares/') ||
    pathname.startsWith('/share/')
  );

  // Helper function to check if current path is a public route
  const isPublicRoute = (path: string): boolean => {
    // Check exact matches first
    if (publicRoutes.includes(path)) {
      return true;
    }
    
    // Check for nested routes under public paths
    return publicRoutes.some(route => 
      // Check if the current path starts with a public route prefix
      // but make sure we're checking complete segments (using /)
      path.startsWith(route + '/')
    );
  };

  useEffect(() => {
    // Skip verification entirely for public share routes
    if (isShareRoute && !isAuthenticated && !token) {
      setAuthState('authorized');
      return;
    }

    const checkAuth = async () => {


      const callback = searchParams.get('callback');
      const tokenFromUrl = searchParams.get('token');

      if (callback === 'google' && tokenFromUrl) {
        setAuth({} as User, tokenFromUrl);
        setIsLoading(true);
  
        try {
          const response = await authApi.getUser();
          // console.log(response, 'google auth response')
          setAuth(response.data.user, tokenFromUrl, response.plan);
  
          if (!response.plan) {
            router.replace('/plans');
          } else {
            router.replace('/chat');
          }
        } catch (error: any) {
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load your data');

          clearAuth();
          router.replace('/');
        } finally {
          setIsLoading(false);
        }
  
        return;
      }
      
      // Special case: If we're on the auth page with verify-email mode
      if (pathname === '/auth' && searchParams.get('mode') === 'verify-email') {
        setAuthState('authorized');
        return;
      }

      // CASE 1: No token - only allow access to auth routes and public routes
      if (!token) {
        if (!authRoutes.includes(pathname) && !isPublicRoute(pathname)) {
          // Save current path before redirecting to auth
          // console.log('redirecting to auth');
          router.replace('/auth');
          return;
        }
        setAuthState('authorized');
        return;
      }

      // CASE 2: Has token and trying to access other routes aside auth
      // if (token && !authRoutes.includes(pathname)) {
      //   console.log('Token exits fast refresh');
      //   storeCurrentPath();
      //   const returnUrl = sessionStorage.getItem('returnUrl');
      //   if (returnUrl) {
      //     sessionStorage.removeItem('returnUrl');
      //     setGenerationType('load');
          
      //     router.replace(returnUrl);
      //     setAuthState('authorized');
      //     return;
      //   }
      // }
              
      // CASE 4: Has token and accessing protected/public routes
      setAuthState('authorized');
    };

    setAuthState('checking');
    checkAuth();
  // }, [pathname, token, searchParams]);
  }, [token, searchParams]);

  useEffect(()=>{
    const storeCurrentPath = () => {
      if (pathname !== '/auth') {
        sessionStorage.setItem('returnUrl', pathname + window.location.search);
        // console.log(pathname + window.location.search,'this is the resolved return url');
      }
    };

    // CASE 2: Has token and trying to access other routes aside auth
      if (token && !authRoutes.includes(pathname)) {
          // console.log('Token exits fast refresh');
          storeCurrentPath();
          const returnUrl = sessionStorage.getItem('returnUrl');
          if (returnUrl) {
            sessionStorage.removeItem('returnUrl');
            // console.log('redirecting to return url', returnUrl);
            if(returnUrl.includes('chat/shares')) {
              setGenerationType('share');
            } else {
              setGenerationType('load');
            }
            
            router.replace(returnUrl);
            
            return;
          }
          setAuthState('authorized');
          return;
      }

  },[token])

  // Show loading screen while checking auth or during explicit loading states
  if (isLoading || authState === 'checking') {
    return <LoadingScreen />;
  }

  // Don't render anything if not authorized
  if (authState !== 'authorized') {
    return null;
  }

  return <>{children}</>;
}

// Main component wrapped in Suspense
export function RouteGuard({ children }: RouteGuardProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouteGuardInner>{children}</RouteGuardInner>
    </Suspense>
  );
}

//I think the suspense is causing the loading issues