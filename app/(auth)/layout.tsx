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
      if (token) {
        try {
          const response = await authApi.getUser();
          setAuth(response.data.user, token, response.plan);
          if(response.status){
            router.push("/auth?mode=create-session");
            setAuthState("show-auth");
          }
        } catch (error: any) {
          clearAuth();
          redirect("https://app.alle.ai.com");
        }
      } else {
        setAuthState("show-auth");
      }
    };

    checkAuth();
  }, []);

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
