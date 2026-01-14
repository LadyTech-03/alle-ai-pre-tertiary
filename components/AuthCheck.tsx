import { authApi } from "@/lib/api/auth";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores";
import { useState } from "react";
import { toast } from "sonner";

export function useAuthCheck() {
    const [authState, setAuthState] = useState<'checking' | 'show-auth' | 'redirect'>('checking');
    const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
    const router = useRouter();
    const { token, setAuth } = useAuthStore();
  
    useEffect(() => {
      const checkAuth = async () => {
        if (token) {
          try {
            // console.log('Token exists, checking authentication...');
            const response = await authApi.getUser();
            // console.log('Auth check response:', response);
            
            // Update auth state with user data
            setAuth(response.data.user, token, response.plan);
            
            // Handle specific redirects from API
            if (response.data.to === 'verify-email') {
              // Stay on auth page but switch to verification mode
              setVerifyEmail(response.data.user.email);
              setAuthState('show-auth');
            } else if (response.data.to === 'chat' && response.plan) {
              // User is authenticated and has a plan, redirect to chat or return URL
              const returnUrl = sessionStorage.getItem('returnUrl');
              if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                router.replace(returnUrl);
              } else {
                router.replace('/chat');
              }
              setAuthState('redirect');
            } else if (!response.plan) {
              // User needs to select a plan
              router.replace('/plans');
              setAuthState('redirect');
            }
          } catch (error: any) {
            // toast.error(error.response.data.error || error.response.data.message || 'Failed to load your data');
            // console.error('Failed to load your data:', error);
            // Token is invalid, show auth page
            setAuthState('show-auth');
          }
        } else {
          // No token, show the auth page
          setAuthState('show-auth');
        }
      };
  
      checkAuth();
    }, []);
  
    return { authState, verifyEmail };
  }