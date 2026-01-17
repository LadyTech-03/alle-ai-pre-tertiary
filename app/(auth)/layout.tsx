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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything while checking auth
  if (authState === "checking" || authState === "redirect") {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-backgroundSecondary flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Image
              src={"https://alle-ai-file-server.s3.us-east-1.amazonaws.com/profiles/P18kD3Ua2AUtbdaPTROaYZQm5xNfG1km4q7dTNXH.webp"}
              alt="Logo"
              width={100}
              height={100}
              className=""
            />
            <span className="text-2xl font-bold">GHANA SCHOOL</span>
          </div>
        </div>

        {/* Description at bottom */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold">ALLE-AI EDU</h2>
          <p className="text-lg text-muted-foreground">
           Educational licensing for universities and academic institutions that need reliable AI
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <span className="text-sm">Compare multiple AI models side-by-side</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <span className="text-sm">Fact-check and verify AI responses</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <span className="text-sm">Eliminate AI hallucinations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 xs:p-10 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <Image
              src={mounted && resolvedTheme === 'dark'
                ? "/svgs/logo-desktop-full.webp"
                : "/svgs/logo-desktop-dark-full.webp"}
              alt="Logo"
              width={160}
              height={45}
              className="h-8 w-auto"
            />
          </div>

          {/* Form */}
          {children}
        </div>
      </div>
    </div>
  );
}
