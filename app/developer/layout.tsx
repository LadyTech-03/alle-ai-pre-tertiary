"use client";

import { DeveloperHeader } from "@/components/features/developer/developer-header";
import { useCreditsStore, usePaymentStore, useAutoReloadStore } from "@/stores";
import useChatAPIStore from "@/stores/developer-benchmark";
import { paymentApi } from "@/lib/api/payment";
import { useEffect } from "react";
import { DeveloperPageTitle } from "@/components/features/developer/base/developerPageTitle";
import { toast } from "sonner";
import { usePendingChatStateStore } from "@/stores";

export default function DeveloperLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { balance_fetched, setBalance, setFetching } = useCreditsStore();
    const { setPaymentMethods } = usePaymentStore();
    const { setSettings } = useAutoReloadStore();
    const videoToast = useChatAPIStore((state) => state.videoToast);

    const { pending, clearPending } = usePendingChatStateStore();

    useEffect(() => {
      if (pending) {
        clearPending();
      }
    }, []);

    // Video toast effect
    useEffect(() => {
      if (videoToast) {
        if (videoToast.type === "success") {
          toast.success(videoToast.message);
        } else {
          toast.error(videoToast.message);
        }
      }
    }, [videoToast]);

    useEffect(() => {
      const fetchCreditDetails = async () => {
        try {
          setFetching(true);
          
          // Fetch both credit details and default payment method in parallel
          const [creditResponse, defaultResponse] = await Promise.all([
            paymentApi.getCreditDetails(),
            paymentApi.getDefaultPaymentMethod().catch(() => ({ status: false, payment_method: null }))
          ]);
          
          // console.log(creditResponse, 'THIS IS THE CREDIT RESPONSE');
          // console.log(defaultResponse, 'THIS IS THE DEFAULT RESPONSE');
          
          // Set credit balance
          if (creditResponse.credit_balance) {
            const roundedBalance = Math.round(creditResponse.credit_balance * 100) / 100;
            setBalance(Number(roundedBalance));
            // console.log(roundedBalance, 'THIS IS THE CREDIT BALANCE')
          }
          
          // Add payment methods to store with default status
          if (Array.isArray(creditResponse.payment_methods)) {
            // Get the default payment method ID
            let defaultPaymentMethodId: string | null = null;
            if (defaultResponse.status && defaultResponse.payment_method) {
              defaultPaymentMethodId = defaultResponse.payment_method.id;
            }

            // Add all payment methods with correct default status
            const paymentMethods = creditResponse.payment_methods.map((method) => ({
              id: `pm_${method.id}`,
              c_id: method.id,
              type: 'card' as const,
              lastFour: method.last4,
              expiryDate: `${method.exp_month}/${method.exp_year}`,
              cardBrand: method.brand as any,
              isDefault: method.id === defaultPaymentMethodId
            }));
            
            setPaymentMethods(paymentMethods);
          }

          // Set auto-reload settings if available
          if (creditResponse.auto_reload) {
            setSettings({
              enabled: creditResponse.auto_reload.enabled,
              threshold: creditResponse.auto_reload.threshold,
              amount: creditResponse.auto_reload.amount,
              payment_method_id: creditResponse.auto_reload.payment_method_id
            });
          } else {
            setSettings(null);
          }
        } catch (error) {
          // console.error('Failed to fetch credit details:', error);
        } finally {
          setFetching(false);
        }
      };

      fetchCreditDetails();
    }, [setBalance, setFetching, setPaymentMethods, setSettings]);

    return (
      <div className="flex flex-col pt-14 min-h-screen ">
        <div>
          <DeveloperPageTitle />
        </div>
        <DeveloperHeader />
        {children}
      </div>
    );
  }