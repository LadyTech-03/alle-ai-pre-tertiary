"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { LoadingScreen } from "@/components/features/auth/LoadingScreen";
import { usePathname } from "next/navigation";

type RequirePlanGuardProps = {
  children: React.ReactNode;
};

export function RequirePlanGuard({ children }: RequirePlanGuardProps) {
  const router = useRouter();
  const { token, refreshPlan, plan } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();


  useEffect(() => {
    let isUnmounted = false;

    const verify = async () => {
      const onDone = () => {
        if (!isUnmounted) setIsChecking(false);
      };

      const isPlans = pathname.startsWith('/plans');
      const isManage = pathname.startsWith('/manage-subscription');

      // Public Plans page: allow unauthenticated users to view; redirect authed with plan
      if (isPlans) {
        if (!token) {
          onDone();
          return;
        }
        try {
          const result = await refreshPlan();
          // const { plan } = useAuthStore.getState();
          const plan = result?.plan ?? null;

          if (!plan){
            onDone();
            return;
          }

          if (plan.toLowerCase().includes('free')) {
            router.replace('/auth');
            return;
          }
          router.replace('/manage-subscription');

        } catch (_) {
          // ignore errors; show plans
        }
        onDone();
        return;
      }

      // Manage Subscription: require authenticated with plan
      if (isManage) {
        if (!token) {
          router.replace('/auth');
          return;
        }
        try {
          // await refreshPlan();
          // const { plan } = useAuthStore.getState();

          const { plan } = (await refreshPlan()) ?? { plan: null };
          if (!plan || plan.toLowerCase().includes('free')) {
            router.replace('/auth');
            return;
          }

        } catch (_) {
          router.replace('/auth');
          return;
        }
        onDone();
        return;
      }

      // Default: require auth and plan
      if (!token) {
        router.replace('/auth');
        return;
      }
      try {
        // await refreshPlan();
        // const { plan } = useAuthStore.getState();
        const { plan } = (await refreshPlan()) ?? { plan: null };
        if (!plan) {
          router.replace('/auth');
          return;
        }
      } catch (_) {
        router.replace('/auth');
        return;
      }
      onDone();
    };

    verify();
    return () => {
      isUnmounted = true;
    };
  }, [plan]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

