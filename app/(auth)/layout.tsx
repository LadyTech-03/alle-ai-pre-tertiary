"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useAuthStore, usePendingChatStateStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
import { LoadingScreen } from "@/components/features/auth/LoadingScreen";
import useChatAPIStore from "@/stores/developer-benchmark";
import { toast } from "sonner";
import { useOrgSessionStore } from "@/stores";
// Define the slides interface
interface Slide {
  id: number;
  component: React.ReactNode;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { token, setAuth, clearAuth } = useAuthStore();
  const [authState, setAuthState] = useState<
    "checking" | "show-auth" | "redirect"
  >("checking");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const { userId, setUserId } = useChatAPIStore();
  const { pending } = usePendingChatStateStore();
  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Get code from URL
      const searchParams = new URLSearchParams(window.location.search);
      const exchange_token = searchParams.get('aiptotp');
      const orgId = searchParams.get('org_id');

      // If code exists, exchange it for token
      if (exchange_token && orgId) {
        try {
          const response = await authApi.exchangeCode(exchange_token, orgId);
          console.log(response, 'What I`ve done');
          return
          // if (response.status && response.data.token) {
          //   setAuth(response.data.user, response.data.token, response.data.plan);

          //   // Set Organization ID if present
          //   if (orgId) {
          //     useOrgSessionStore.getState().setOrgId(orgId);
          //   }

          //   // Clean URL
          //   const url = new URL(window.location.href);
          //   url.searchParams.delete('aiptotp');
          //   url.searchParams.delete('org_id');
          //   window.history.replaceState({}, '', url.toString());

          //   router.push("/auth?mode=create-session");
          //   setAuthState("show-auth");
          //   return;
          // }
        } catch (error) {
          console.error("Code exchange failed:", error);
          clearAuth();
          window.location.href = "https://app.alle-ai.com";
          return;
        }
      }

      // 2. Fallback to existing token in store
      if (token) {
        try {
          const response = await authApi.getUser();
          setAuth(response.data.user, token, response.plan);

          if (response.status) {
            router.push("/auth?mode=create-session");
            setAuthState("show-auth");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          clearAuth();
          window.location.href = "https://app.alle-ai.com";
        }
      } else {
        // No code and no token
        router.push('/')
        setAuthState("show-auth");

        // window.location.href = "https://app.alle-ai.com";
      }
    };

    checkAuth();
  }, [token]);

  // Don't render anything while checking auth
  if (authState === "checking" || authState === "redirect") {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth Forms */}
      <div className="w-full p-6 xs:p-10 md:mt-10">
        {children}
      </div>
    </div>
  );
}
