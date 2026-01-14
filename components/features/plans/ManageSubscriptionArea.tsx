"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, CreditCard, Gem, Loader, ReceiptText, XCircle, MoreHorizontal } from "lucide-react";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
import { paymentApi } from "@/lib/api/payment";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CardPaymentMethodModal } from "@/components/ui/modals";
import { TransactionHistoryModal } from "@/components/ui/transaction-history";
import { PaymentMethodsModal } from "@/components/ui/modals/payment-methods-modal";
import { feedbackApi } from "@/lib/api/feedback";

type PlanKey = "free" | "standard" | "plus" | "custom" | "pro";

const PLAN_DISPLAY_NAMES: Record<PlanKey, string> = {
  free: "Free",
  standard: "Standard",
  plus: "Plus",
  custom: "Alle-AI Custom",
  pro: "Pro"
};

function parsePlanFromStore(planFromStore: string | undefined): {
  key: PlanKey;
  cycle: "monthly" | "yearly";
} {
  if (!planFromStore) return { key: "free", cycle: "monthly" };
  const normalized = planFromStore.toLowerCase();
  const key: PlanKey = normalized.includes("plus")
    ? "plus"
    : normalized.includes("standard")
    ? "standard"
    : normalized.includes("custom")
    ? "custom"
    : normalized.includes("pro")
    ? "pro"
    : "free";
  const cycle: "monthly" | "yearly" = normalized.includes("year") ? "yearly" : "monthly";
  return { key, cycle };
}

export default function ManageSubscriptionArea() {
  const router = useRouter();
  const { user, token, plan, setAuth, refreshPlan } = useAuthStore();
  const current = parsePlanFromStore(typeof plan === "string" ? plan : undefined);
  const [isYearly, setIsYearly] = useState(current.cycle === "yearly");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [cancelNowOpen, setCancelNowOpen] = useState(false);
  const [cancelEndOpen, setCancelEndOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResultOpen, setCancelResultOpen] = useState(false);
  const [cancelResult, setCancelResult] = useState<{
    success: boolean;
    message: string;
    endsAt?: string | null;
    immediate: boolean;
  } | null>(null);
  const [prorationLoading, setProrationLoading] = useState(false);
  const [prorationError, setProrationError] = useState<string | null>(null);
  const [proration, setProration] = useState<{
    amount_due: number;
    prorated_credit: number;
    prorated_charge: number;
    next_billing_date: string;
  } | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [requiresAction, setRequiresAction] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [switchedSubscription, setSwitchedSubscription] = useState<{
    name: string;
    stripe_status: string;
    price_id: string;
    plan: string;
    trial_ends_at?: string | null;
    ends_at?: string | null;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  }>>([]);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [settingDefaultPaymentMethodId, setSettingDefaultPaymentMethodId] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [loadingBillingDate, setLoadingBillingDate] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);

  const formatMoney = (value: number) => `£ ${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const niceDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
  const formatPlanLabel = (key: string) => {
    const lower = key.toLowerCase();
    const cycle = lower.includes('year') ? 'Yearly' : 'Monthly';
    const planKey = (lower.includes('plus') ? 'plus' : lower.includes('standard') ? 'standard' : lower.includes('pro') ? 'pro' : lower.includes('custom') ? 'custom' : 'free') as PlanKey;
    return `${PLAN_DISPLAY_NAMES[planKey]} (${cycle})`;
  };
  const cardBrandLabel = (brand?: string) => brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';
  const selectedPaymentMethod = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return undefined;
    return paymentMethods.find(m => m.id === selectedPaymentMethodId) || paymentMethods[0];
  }, [paymentMethods, selectedPaymentMethodId]);

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Fetch next billing date when subscription_cancel_at is null
  useEffect(() => {
    const fetchNextBillingDate = async () => {
      if (!user?.subscription_cancel_at && current.key !== 'free' && !loadingBillingDate) {
        try {
          setLoadingBillingDate(true);
          const response = await authApi.getNextBillingDate();
          // console.log(response, 'next billing date')
          if (response.status && response.next_billing_date) {
            setNextBillingDate(response.next_billing_date);
          }
        } catch (error: any) {
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to get next billing date');
        } finally {
          setLoadingBillingDate(false);
        }
      }
    };

    fetchNextBillingDate();
  }, []);

  const plans = useMemo(
    () => [
      {
        name: "Free",
        key: "free" as PlanKey,
        price: 0,
        description: "For small teams or individuals optimizing basic web queries.",
        about:
          "Interact with up to 2 AI models in a single conversation to gain diverse insights and perspectives.",
        features: ["Text", "Image", "2 AI Models/conversation", "Limited model Usage"],
        highlighted: false,
      },
      {
        name: "Standard",
        key: "standard" as PlanKey,
        price: isYearly ? 200 : 20,
        description: "Enhanced AI capabilities and additional features.",
        about:
          "Interact with up to 3 AI models per conversation for even more diverse insights, plus access to Fact-checking, Audio, and Video generation models.",
        features: ["Everything in Free", "Up to 3 AI models", "Fact-checking", "Audio", "Video"],
        highlighted: false,
      },
      {
        name: "Plus",
        key: "plus" as PlanKey,
        price: isYearly ? 300 : 30,
        description: "Advanced AI interactions, and comprehensive flexibility.",
        about:
          "Access up to 5 AI models per conversation, with unlimited tokens and the ability to use all available AI models for maximum flexibility.",
        features: [
          "Everything in Standard",
          "Up to 5 AI models",
          "Access all AI models",
          "Early access to new features",
        ],
        highlighted: true,
      },
      {
        name: "Pro",
        key: "pro" as PlanKey,
        price: isYearly ? 1600 : 160,
        description: "Everything in Plus with full flexibility to use any feature without limits.",
        about:
          "Our most capable plan with maximum flexibility and priority access.",
        features: [
          "Everything in Plus",
          "Max usage limits",
          "Dedicated Team support",
          "17% yearly discount",
        ],
        highlighted: false,
      },
    ],
    [isYearly]
  );

  // Helper function to determine button text based on price comparison
  const getPlanButtonText = (planKey: PlanKey, planPrice: number, isCurrent: boolean) => {
    if (isCurrent) return "Your Current Plan";
    
    // Find current plan's price
    const currentPlan = plans.find(p => p.key === current.key);
    const currentPrice = currentPlan?.price || 0;
    
    // Compare prices to determine upgrade/downgrade
    if (planPrice > currentPrice) {
      return `Upgrade to ${PLAN_DISPLAY_NAMES[planKey]}`;
    } else if (planPrice < currentPrice) {
      return `Downgrade to ${PLAN_DISPLAY_NAMES[planKey]}`;
    } else {
      return "Switch Plan";
    }
  };

  const currentPlanDisplayName = PLAN_DISPLAY_NAMES[current.key];
  const currentPlanFullName = useMemo(() => {
    const p = (plan || '').toLowerCase();
    if (!p) return currentPlanDisplayName;
    if (p.includes('pro')) {
      return (
        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
          Pro
        </span>
      );
    }
    if (p.includes('custom')) {
      const core = p.replace('custom_', '').replace('_monthly', '').replace('_yearly', '');
      const parts = core.split('_').filter(Boolean);
      const ordered = ['chat','image','audio','video'];
      const orderedSelected = ordered.filter(x => parts.includes(x));
      if (orderedSelected.length > 0) {
        return `Alle-AI Custom (${orderedSelected.join(' + ')})`;
      }
      return 'Alle-AI Custom';
    }
    return currentPlanDisplayName;
  }, [plan, currentPlanDisplayName]);
  const openConfirmForPlan = async (planKey: PlanKey) => {
    setSelectedPlan(planKey);
    setSwitchSuccess(false);
    setSwitchedSubscription(null);
    setSwitchError(null);
    setRequiresAction(false);
    setProration(null);
    setProrationError(null);
    setPaymentMethods([]);
    setPaymentError(null);
    setPaymentLoading(false);
    setShowPaymentMethods(false);
    setSelectedPaymentMethodId(null);
    setConfirmOpen(true);

    if (planKey === 'custom') return;
    try {
      setProrationLoading(true);
      setPaymentLoading(true);
      const target = planKey === 'free' ? 'free' : `${planKey}_${isYearly ? 'yearly' : 'monthly'}`;
      const [prorationResult, paymentResult] = await Promise.allSettled([
        authApi.getProrationDetails({
          plan: target,
          invoice_now: true,
          prorate: true,
          anchor_now: false,
        }),
        paymentApi.getCreditDetails(),
      ]);

      if (prorationResult.status === 'fulfilled') {
        const response = prorationResult.value as any;
        if (response.status) {
          setProration(response.proration);
        } else {
          setProrationError(response.message || 'Failed to fetch proration details');
        }
      } else {
        setProrationError(prorationResult.reason?.message || 'Failed to fetch proration details');
      }

      if (paymentResult.status === 'fulfilled') {
        const p = paymentResult.value as any;
        if (Array.isArray(p?.payment_methods)) {
          // Get the default payment method
          let defaultPaymentMethodId: string | null = null;
          try {
            const defaultResponse = await paymentApi.getDefaultPaymentMethod();
            // console.log('default response from get default payment method on manage subscription area', defaultResponse);
            if (defaultResponse.status && defaultResponse.payment_method) {
              defaultPaymentMethodId = defaultResponse.payment_method.id;
            }
          } catch (error) {
            // console.error('Failed to fetch default payment method:', error);
          }

          setPaymentMethods(p.payment_methods);
          // Set the default payment method as selected, or first one if no default found
          const selectedId = defaultPaymentMethodId || p.payment_methods[0]?.id || null;
          setSelectedPaymentMethodId(selectedId);
        } else {
          setPaymentMethods([]);
        }
      } else {
        setPaymentError(paymentResult.reason?.message || 'Failed to fetch payment method');
      }
    } catch (error: any) {
      setProrationError(error.response.data.error || error.response.data.message || 'Failed to fetch proration details');
      setPaymentError(error.response.data.error || error.response.data.message || 'Failed to fetch payment method');
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to fetch proration details');
    } finally {
      setProrationLoading(false);
      setPaymentLoading(false);
    }
  };

  const reloadPaymentMethods = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      const p: any = await paymentApi.getCreditDetails();
      if (Array.isArray(p?.payment_methods)) {
        // Get the default payment method
        let defaultPaymentMethodId: string | null = null;
        try {
          const defaultResponse = await paymentApi.getDefaultPaymentMethod();
          if (defaultResponse.status && defaultResponse.payment_method) {
            defaultPaymentMethodId = defaultResponse.payment_method.id;
          }
        } catch (error) {
          // console.error('Failed to fetch default payment method:', error);
        }

        setPaymentMethods(p.payment_methods);
        // Set the default payment method as selected, or first one if no default found
        const selectedId = defaultPaymentMethodId || p.payment_methods[0]?.id || null;
        setSelectedPaymentMethodId(selectedId);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: any) {
      setPaymentError(error.response.data.error || error.response.data.message || 'Failed to fetch payment method');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      setSettingDefaultPaymentMethodId(paymentMethodId);
      setPaymentError(null);
      // console.log('setting default payment method on manage subscription area', paymentMethodId);
      const resp: any = await paymentApi.setDefaultPaymentMethod(paymentMethodId);
      // console.log('response from set default payment method on manage subscription area', resp);
      if (resp?.status) {
        setSelectedPaymentMethodId(paymentMethodId);
        toast.success('Default payment method updated');
        setShowPaymentMethods(false);
      } else {
        toast.error('Failed to set default payment method');
      }
    } catch (error: any) {
      setPaymentError(error.response.data.error || error.response.data.message || 'Failed to set default payment method');
      // toast.error(msg);
    } finally {
      setSettingDefaultPaymentMethodId(null);
    }
  };

  const handleKeepSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await authApi.keepSubscription();
      if (response.status) {
        toast.success("Subscription cancellation has been reversed. You'll continue enjoying your plan without interruption!");
        setCancelEndOpen(false);
        try {
          await refreshPlan();
        } catch {}
        return;
      }
      toast.error(response.message || 'Something went wrong');
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Something went wrong');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelSubscription = async (mode: 'now' | 'end') => {
    setIsCancelling(true);
    try {

      if (cancellationReason) {
        try {
          await feedbackApi.submitCancellationFeedback({
            reason: cancellationReason
          });
        } catch (error) {
          // console.error('Failed to submit feedback:', error);
          // Continue with cancellation even if feedback fails
        }
      }

      
      const response = await authApi.cancelSubscription({ immediately: mode === 'now' });
      if (response.status) {
        const endsAt = response.ends_at ?? null;
        const message = response.message || (mode === 'now' ? 'Subscription cancelled immediately.' : 'Subscription will cancel at the end of the billing period.');
        toast.success(message + (endsAt && mode === 'end' ? ` Ends on ${niceDate(endsAt)}.` : ''));
        setCancelResult({ success: true, message, endsAt, immediate: mode === 'now' });
        setCancelResultOpen(true);
        try {
          await refreshPlan();
        } catch {}
        return;
      }
      const errMsg = response.message || 'Failed to cancel subscription';
      // toast.error(errMsg);
      setCancelResult({ success: false, message: errMsg, endsAt: null, immediate: mode === 'now' });
      setCancelResultOpen(true);
    } catch (error: any) {
      // console.log('error in handleCancelSubscription', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to cancel subscription';
      // toast.error(errMsg);
      setCancelResult({ success: false, message: errMsg, endsAt: null, immediate: mode === 'now' });
      setCancelResultOpen(true);
    } finally {
      setIsCancelling(false);
      setCancelNowOpen(false);
      setCancelEndOpen(false);

      setShowFeedbackForm(false);
      setCancellationReason('');
      setFeedbackSubmitted(false);
    }
  };
  

  const handleSwitch = async (planName: PlanKey) => {
    if (planName === 'custom') {
      router.push('/plans/custom');
      return;
    }

    setProcessingPlan(planName);
    try {
      // Build switch plan string, e.g., "plus_yearly", "pro_monthly", or "free"
      const target = planName === 'free' ? 'free' : `${planName}_${isYearly ? 'yearly' : 'monthly'}`;
      const response = await authApi.switchSubscription({
        plan: target,
        invoice_now: true,
        prorate: true,
        anchor_now: false,
      });

      if (response.status) {
        setSwitchSuccess(true);
          // Subtle, modern confetti bursts
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

          if (!audioRef.current) {
            audioRef.current = new Audio("/audio/success.mp3");
          }

          audioRef.current.currentTime = 0; // reset to start
          audioRef.current.play();

        setSwitchedSubscription(response.subscription || null);
        try {
          await refreshPlan();
        } catch {}
      } else {
        setSwitchError(response.last_payment_error || response.message || 'Failed to switch subscription');
        setRequiresAction(!!response.requires_action);
      }
    } catch (error: any) {
      // console.log(error, 'error for failed switching');
      setSwitchError(error?.response?.data?.last_payment_error || error?.response?.data?.message || 'Failed to switch subscription');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 overflow-auto">
      <div className="space-y-4 sm:space-y-6 mb-8">
        <div className="flex items-center">
      <Button
        variant="link"
        className="text-sm"
        onClick={() => router.push('/chat')}
      >
        ← Back
      </Button>
        <h1 className="text-xl sm:text-3xl font-bold">Manage Subscription</h1>
        </div>
        {/* <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
          View your current plan and switch anytime. Changes take effect immediately after checkout.
        </p> */}
      </div>

      {/* Current plan card */}
      <div className="relative mb-8">
        <div className="rounded-xl border border-borderColorPrimary p-4 sm:p-6 bg-backgroundSecondary">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="sm:h-5 sm:w-5 h-4 w-4 text-primary" />
                <h2 className="text-sm sm:text-lg font-semibold">Your Current Plan</h2>
              </div>
              {current.key !== 'free' && (
                <>
                  {/* Desktop View - Show both buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowPaymentMethodsModal(true)}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Manage Payment Methods
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowInvoiceModal(true)}
                      className="flex items-center gap-2"
                    >
                      <ReceiptText className="h-4 w-4" />
                      View Invoice
                    </Button>
                  </div>
                  
                  {/* Mobile View - Show dropdown menu */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-backgroundSecondary">
                        <DropdownMenuItem 
                          onClick={() => setShowPaymentMethodsModal(true)}
                          className="flex items-center gap-2"
                        >
                          <span>Manage Payment Methods</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setShowInvoiceModal(true)}
                          className="flex items-center gap-2"
                        >
                          <span>View Invoice</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2">
              <div 
                className={cn(
                  "flex items-center gap-2 text-2xl sm:text-3xl font-bold",
                  current.key === "free" && "text-foreground",
                  current.key === "standard" && "bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 dark:from-gray-100 dark:via-gray-400 dark:to-gray-200 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                  current.key === "plus" && "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                  current.key === "pro" || current.key === "custom" && "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                )}>
                  <span>{currentPlanFullName}</span>
                  <Badge variant="default" className="text-xs font-semibold rounded-sm p-1 h-4">{current.cycle === "yearly" ? "Billed yearly" : current.cycle === "monthly" ? 'Billed monthly' : 'forever'}</Badge>
              </div>

              {/* Billing Information */}
              {user?.subscription_cancel_at ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 cursor-pointer">
                  <div className="text-xs sm:text-sm">
                    Your Subscription ends at:{' '}
                    <span className="text-sm font-bold text-primary">{niceDate(user.subscription_cancel_at)}</span>
                  </div>
                  {isCancelling ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader className="h-3 w-3 animate-spin" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground hover:text-primary italic underline" onClick={() => handleKeepSubscription()}>
                      Keep Subscription
                    </span>
                  )}
                </div>
              ) : current.key !== 'free' ? (
                <div className="space-y-1">
                  {loadingBillingDate ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Getting billing info
                      <Loader className="h-3 w-3 animate-spin" />
                    </div>
                  ) : nextBillingDate ? (
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm ">
                        Your next billing date is:{' '} 
                        <span className="text-sm font-bold text-primary">{niceDate(nextBillingDate)}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Free plan - no billing
                </div>
              )}
            </div>
            {plan && current.key === 'custom' && (
              <Link href="/plans/custom" className="text-sm text-muted-foreground underline hover:text-primary hover:italic">
                Switch to other custom plans
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Plan billing toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative inline-flex h-10 items-center justify-center rounded-lg border border-borderColorPrimary bg-backgroundSecondary p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "relative inline-flex h-8 items-center justify-center rounded-md px-6 text-sm font-medium transition-all duration-150",
              !isYearly
                ? "bg-black dark:bg-background text-white shadow-sm border border-muted-foreground/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "relative inline-flex h-8 items-center justify-center rounded-md px-6 text-sm font-medium transition-all duration-150",
              isYearly
                ? "bg-black dark:bg-background text-white dark:text-foreground shadow-sm border border-muted-foreground/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
          </button>
        </div>
          <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "relative overflow-hidden",
                  "text-primary font-medium text-xs",
                  "px-1 py-1 border-none",
                  "flex items-center gap-1.5"
                )}
              >
                <span className="text-green-500 font-bold">Save 17%</span>
              </Badge>
          </motion.div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = p.key === current.key && (
            (isYearly && current.cycle === 'yearly') || (!isYearly && current.cycle === 'monthly')
          );
          return (
            <motion.div
              key={p.key}
              layout
              className={cn(
                "relative p-6 rounded-lg border h-full",
                p.highlighted ? "relative p-6 rounded-xl overflow-hidden bg-gradient-to-r from-black via-neutral-900 to-black bg-[length:200%_200%] animate-black text-white" 
                : "border-borderColorPrimary"
              )}
            >
              <div className="relative space-y-4 min-h-[25rem]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-xl sm:text-2xl font-bold",
                      p.key === "free" && "text-foreground",
                      p.key === "standard" && "bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 dark:from-gray-100 dark:via-gray-400 dark:to-gray-200 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                      p.key === "plus" && "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                      p.key === "pro" && "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                    )}>{p.name}</h3>
                  </div>
                  <motion.div
                    key={`${p.key}-${isYearly ? "yearly" : "monthly"}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-end gap-1"
                  >
                    <span className="text-3xl font-bold">
                      £{typeof p.price === "number" ? (p.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : p.price}
                    </span>
                    {p.name !== "Free" && (
                      <>
                        /{isYearly ? <span className="font-bold">year</span> : <span className="font-bold">month</span>}
                      </>
                    )}
                  </motion.div>
                </div>

                <p className="text-sm text-muted-foreground pb-4">{p.description}</p>

                <ul className="space-y-4 mb-8">
                  {p.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.8rem]">
                      <Check className={cn("h-4 w-4 text-primary", p.highlighted && "text-[#fafafa]")} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full absolute bottom-0 overflow-hidden",
                    p.highlighted && "bg-[#fafafa] text-[#171717] hover:bg-[#F8F8F8]"
                  )}
                  variant={p.highlighted ? "default" : "outline"}
                  onClick={() => {
                    if (isCurrent) return;
                    if (p.key === "pro") {
                      openConfirmForPlan('pro');
                      return;
                    }
                    openConfirmForPlan(p.key);
                  }}
                  disabled={processingPlan !== null || isCurrent}
                >
                  {processingPlan === p.key ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    getPlanButtonText(p.key, p.price, isCurrent)
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Plans CTA */}
      <div className="mt-6">
        <div className="rounded-xl border border-borderColorPrimary p-6 bg-backgroundSecondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Need specific features?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Build a custom plan by selecting just the capabilities you need. Perfect for specialized workflows.
            </p>
          </div>
          <Button onClick={() => router.push('/plans/custom')} variant="outline" className="shrink-0 dark:bg-white dark:hover:bg-white dark:text-black dark:hover:text-black hover:bg-black hover:text-white bg-black text-white">
            Customize Your Plan
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-center sm:justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="min-w-[220px] text-red-500">
              Cancel Subscription
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-backgroundSecondary ">
            <DropdownMenuItem onClick={() => setCancelNowOpen(true)}>Immediately</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCancelEndOpen(true)}>
              End of billing cycle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-center mt-8 sm:mt-12 text-sm text-muted-foreground">
        For Team & Enterprise plans{" "}
        <a 
          href="mailto:contact@alle-ai.com?subject=Team%20%26%20Enterprise%20Plans%20Inquiry&body=Hello%20Alle-AI%20Team%2C%0A%0AI%20am%20interested%20in%20learning%20more%20about%20your%20Team%20and%20Enterprise%20plans.%0A%0APlease%20provide%20me%20with%20information%20about%3A%0A-%20Team%20plan%20features%20and%20pricing%0A-%20Enterprise%20plan%20features%20and%20pricing%0A-%20Custom%20solutions%20for%20our%20organization%0A-%20Volume%20discounts%20and%20special%20arrangements%0A%0AOur%20organization%20details%3A%0A-%20Company%20name%3A%20%5BYour%20Company%20Name%5D%0A-%20Team%20size%3A%20%5BNumber%20of%20users%5D%0A-%20Current%20use%20case%3A%20%5BDescribe%20your%20needs%5D%0A-%20Budget%20range%3A%20%5BYour%20budget%20range%5D%0A-%20Timeline%3A%20%5BWhen%20do%20you%20need%20to%20implement%5D%0A%0APlease%20let%20me%20know%20if%20you%20need%20any%20additional%20information.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D%0A%5BYour%20Email%5D%0A%5BYour%20Phone%20Number%5D"
          className="text-primary hover:underline"
        >
          Contact us
        </a>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => {
        setConfirmOpen(open);
        if (!open) {
          setProration(null);
          setProrationError(null);
          setProrationLoading(false);
          setSwitchSuccess(false);
          setSwitchError(null);
          setRequiresAction(false);
          setSwitchedSubscription(null);
          setSelectedPlan(null);
          setPaymentMethods([]);
          setPaymentError(null);
          setPaymentLoading(false);
          setShowPaymentMethods(false);
          setSelectedPaymentMethodId(null);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-backgroundSecondary px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Gem className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-semibold">
                  {selectedPlan ? PLAN_DISPLAY_NAMES[selectedPlan] : "Plan"} {isYearly ? "(Yearly)" : "(Monthly)"}
                </DialogTitle>
                {!switchSuccess && (
                <DialogDescription>
                    {prorationError && (
                      <span className="text-red-500 text-sm">{prorationError}</span>
                    )}
                </DialogDescription>
                )}
              </div>
            </div>
          </div>
          {!switchSuccess ? (
            <>
              {!showPaymentMethods ? (
                <>
                  <div className="px-6 py-5 space-y-4">
                    {prorationLoading && (
                      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                        Getting proration details
                        <Loader className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {!prorationLoading && proration && (
                      <div className="space-y-4">
                        {/* Payment Method Card */}
                        {paymentMethods.length > 0 && selectedPaymentMethod ? (
                          <div className="rounded-lg border border-borderColorPrimary bg-backgroundSecondary/60 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                                  {/* <div className="text-xs font-bold text-primary">
                                    {cardBrandLabel(selectedPaymentMethod.brand).charAt(0)}
                                  </div> */}
                                  <div className="text-muted-foreground">
                                  <CreditCard className="w-5 h-5 text-green-400"/>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {cardBrandLabel(selectedPaymentMethod.brand)} •••• {selectedPaymentMethod.last4}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Expires {selectedPaymentMethod.exp_month}/{selectedPaymentMethod.exp_year}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="link" 
                                className="text-xs px-0 h-auto" 
                                onClick={() => setShowPaymentMethods(true)}
                              >
                                Change Payment Method
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-borderColorPrimary bg-backgroundSecondary/60 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-muted/20 flex items-center justify-center">
                                  <div className="text-muted-foreground">
                                    <CreditCard className="w-5 h-5 text-green-400"/>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground">
                                    No payment method
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="link" 
                                className="text-xs px-0 h-auto" 
                                onClick={() => setShowAddPaymentMethodModal(true)}
                              >
                                Add Payment Method
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="rounded-lg border border-borderColorPrimary bg-backgroundSecondary/60">
                          <div className="p-4 border-b border-borderColorPrimary">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">Summary</div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between text-sm">
                              <div>
                                <div className="font-medium">Remaining amount on {currentPlanDisplayName} Plan</div>
                                <div className="text-xs text-muted-foreground">Pro‑rated credit applied</div>
                              </div>
                              <div className="font-medium">{formatMoney(proration.prorated_credit)}</div>
                            </div>
                            <div className="flex items-start justify-between text-sm">
                              <div>
                                <div className="font-medium">{selectedPlan ? PLAN_DISPLAY_NAMES[selectedPlan]: "Plan"} Plan from today</div>
                                <div className="text-xs text-muted-foreground">Pro‑rated charge until next billing date</div>
                              </div>
                              <div className="font-medium">{formatMoney(proration.prorated_charge)}</div>
                            </div>
                            <div className="pt-2 border-t border-borderColorPrimary flex items-center justify-between text-sm">
                              <div className="font-semibold">Amount due today</div>
                              <div className="font-semibold">{formatMoney(proration.amount_due)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Next billing date</span>
                          <span>{niceDate(proration.next_billing_date)}</span>
                        </div>
                        {proration.amount_due < 0 && (
                          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 mt-3">
                            <div className="text-xs text-green-600 font-medium">
                            Your remaining balance of (<span className="font-semibold">{formatMoney(proration.amount_due)}</span>) will be applied to your next billing cycle.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {switchError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-medium text-red-600">Payment failed</div>
                            <div className="text-sm text-red-500">{switchError}</div>
                            {requiresAction && (
                              <div className="text-xs text-muted-foreground">Please update your payment method to complete the switch.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {!prorationLoading && !proration && !prorationError && (
                      <p className="text-sm text-muted-foreground">Review and confirm to continue.</p>
                    )}
                    {prorationError && (
                      <p className="text-sm text-red-500">{prorationError}</p>
                    )}
                  </div>
                  <DialogFooter className="px-6 pb-6">
                    <div className="flex w-full items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={processingPlan !== null}>
                        Cancel
                      </Button>
                      <Button
                        variant={proration?.amount_due && proration.amount_due < 0 ? 'success' : 'default'}
                        onClick={() => selectedPlan && handleSwitch(selectedPlan)}
                        disabled={processingPlan !== null || !selectedPlan || prorationLoading || (!!prorationError) || paymentMethods.length === 0}
                      >
                        {processingPlan ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : switchError ? (
                          `Try again ${formatMoney(proration?.amount_due || 0)}`
                        ) : proration ? (
                          proration.amount_due < 0 ? (
                            'Continue'
                          ) : (
                            `Pay ${formatMoney(proration.amount_due)}`
                          )
                        ) : (
                          'Confirm'
                        )}
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="px-6 py-5 space-y-4">
                    <div className="text-sm font-medium">Select a payment method</div>
                    {paymentLoading && (
                      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                        Loading payment methods
                        <Loader className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {!paymentLoading && paymentError && (
                      <div className="text-sm text-red-500">{paymentError}</div>
                    )}
                    {!paymentLoading && !paymentError && (
                      <RadioGroup value={selectedPaymentMethodId || ""} onValueChange={handleSetDefaultPayment}>
                        <div className="space-y-2">
                          {paymentMethods.map((m) => (
                            <Label key={m.id} className="flex items-center justify-between rounded-lg border border-borderColorPrimary bg-backgroundSecondary/60 p-3 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={m.id} />
                                <div className="text-sm">
                                  <div className="font-medium">{cardBrandLabel(m.brand)} •••• {m.last4}</div>
                                  <div className="text-xs text-muted-foreground">Expires {m.exp_month}/{m.exp_year}</div>
                                </div>
                              </div>
                              {settingDefaultPaymentMethodId === m.id && (
                                <Loader className="h-4 w-4 animate-spin" />
                              )}
                            </Label>
                          ))}
                          {paymentMethods.length === 0 && (
                            <div className="text-sm text-muted-foreground">No payment methods.</div>
                          )}
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                  <DialogFooter className="px-6 pb-6">
                    <div className="flex w-full items-center justify-between">
                      <Button variant="link" className="px-0" onClick={() => setShowPaymentMethods(false)}>
                        Back
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={processingPlan !== null}>
                          Cancel
                        </Button>
                        <Button className="ml-2" onClick={() => setShowAddPaymentMethodModal(true)}>
                          Use a new method
                        </Button>
                      </div>
                    </div>
                  </DialogFooter>
                </>
              )}
            </>
          ) : (
            <>
              <div className="px-6 py-8 space-y-3 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-lg font-semibold">Subscription updated</div>
                <div className="text-sm text-muted-foreground">
                  {switchedSubscription?.plan ? (
                    <span>New plan: {formatPlanLabel(switchedSubscription.plan)}</span>
                  ) : (
                    <span>You&apos;re all set.</span>
                  )}
                </div>
              </div>
              <DialogFooter className="px-6 pb-6">
                <Button onClick={() => setConfirmOpen(false)}>Done</Button>
          </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Now Modal */}
      <Dialog open={cancelNowOpen} onOpenChange={(open) => {
        setCancelNowOpen(open);
        if (!open) {
          setShowFeedbackForm(false);
          setCancellationReason('');
          setFeedbackSubmitted(false);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-backgroundSecondary px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-red-500/10 flex items-center justify-center">
                <Gem className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-semibold">Cancel Now</DialogTitle>
              </div>
            </div>
          </div>
          
          {!showFeedbackForm ? (
            <>
              <div className="px-6 py-6 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for choosing Alle-AI, we&apos;re sorry to see you go. Before you cancel, please specify your reason of cancellation below.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <RadioGroup value={cancellationReason} onValueChange={setCancellationReason}>
                    <div className="space-y-2">
                      {[
                        'Too expensive',
                        'Found another tool', 
                        'Lack of functionality',
                        'Purchased accidentally',
                        'Other (Please specify)'
                      ].map((reason) => (
                        <div key={reason} className="group">
                          <Label 
                            htmlFor={reason} 
                            className="flex items-center space-x-3 p-3 rounded-lg border border-borderColorPrimary/50 hover:border-borderColorPrimary hover:bg-backgroundSecondary/50 cursor-pointer transition-all duration-200"
                          >
                            <RadioGroupItem value={reason} id={reason} className="text-primary" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {reason}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  {cancellationReason === 'Other (Please specify)' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4"
                    >
                      <input
                        type="text"
                        placeholder="Please specify your reason..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-borderColorPrimary rounded-lg bg-background transition-all duration-200 placeholder:text-muted-foreground"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="px-6 pb-6 pt-0">
                <div className="flex w-full gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCancelNowOpen(false)}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowFeedbackForm(true)}
                    disabled={!cancellationReason}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="px-6 py-6 space-y-4">
                <div className="">
                  <div className="flex items-start space-x-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        If you proceed, remaining time in your current period may be forfeited. You will lose access to paid features right away.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="px-6 pb-6 pt-0">
                <div className="flex w-full gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFeedbackForm(false)} 
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="destructive" 
                    onClick={() => handleCancelSubscription('now')} 
                    disabled={isCancelling}
                  >
                    {isCancelling ? <Loader className="h-4 w-4 animate-spin" /> : 'Proceed'}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Cancel End Modal - Similar structure but with different content */}
      <Dialog open={cancelEndOpen} onOpenChange={(open) => {
        setCancelEndOpen(open);
        if (!open) {
          setShowFeedbackForm(false);
          setCancellationReason('');
          setFeedbackSubmitted(false);
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-backgroundSecondary px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-red-500/10 flex items-center justify-center">
                <Gem className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-semibold">Cancel at End of Billing Cycle</DialogTitle>
              </div>
            </div>
          </div>
          
          {!showFeedbackForm ? (
            <>
              <div className="px-6 py-6 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for choosing Alle-AI, we&apos;re sorry to see you go. Before you cancel, please specify your reason of cancellation below.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <RadioGroup value={cancellationReason} onValueChange={setCancellationReason}>
                    <div className="space-y-2">
                      {[
                        'Too expensive',
                        'Found another tool', 
                        'Lack of functionality',
                        'Purchased accidentally',
                        'Other (Please specify)'
                      ].map((reason) => (
                        <div key={reason} className="group">
                          <Label 
                            htmlFor={reason} 
                            className="flex items-center space-x-3 p-3 rounded-lg border border-borderColorPrimary/50 hover:border-borderColorPrimary hover:bg-backgroundSecondary/50 cursor-pointer transition-all duration-200"
                          >
                            <RadioGroupItem value={reason} id={reason} className="text-primary" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {reason}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  {cancellationReason === 'Other (Please specify)' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4"
                    >
                      <input
                        type="text"
                        placeholder="Please specify your reason..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-borderColorPrimary rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="px-6 pb-6 pt-0">
                <div className="flex w-full gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCancelEndOpen(false)}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowFeedbackForm(true)}
                    disabled={!cancellationReason}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="px-6 py-5 space-y-4">
                {user?.subscription_cancel_at ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-base text-muted-foreground mb-2">
                        Your subscription is already scheduled to end on:
                      </p>
                      <div className="text-lg sm:text-xl font-bold text-amber-600">
                        {niceDate(user.subscription_cancel_at)}
                      </div>
                    </div>
                    <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        You&apos;ll continue to have access to all paid features until this date. 
                        Click &quot;Keep Subscription&quot; below to reactivate and continue your plan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="">
                    <div className="flex items-start space-x-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You will keep access to paid features until the end of your current period. After that, your subscription will be cancelled automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="px-6 pb-6 pt-0">
                {user?.subscription_cancel_at ? (
                  <div className="w-full space-y-3">
                    <Button onClick={() => handleKeepSubscription()} className="w-full" disabled={isCancelling}>
                      {isCancelling ? <Loader className="h-4 w-4 animate-spin" /> : 'Keep Subscription'}
                    </Button>
                    <Button variant="link" onClick={() => setCancelEndOpen(false)} className="w-full text-muted-foreground">
                      Close
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFeedbackForm(false)} 
                      disabled={isCancelling}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-1" 
                      variant="destructive" 
                      onClick={() => handleCancelSubscription('end')} 
                      disabled={isCancelling}
                    >
                      {isCancelling ? <Loader className="h-4 w-4 animate-spin" /> : 'Proceed'}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={cancelResultOpen} onOpenChange={(open) => {
        setCancelResultOpen(open);
        if (!open) setCancelResult(null);
      }}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="px-6 py-8 space-y-4 text-center">
            <div className={cn("h-14 w-14 rounded-full mx-auto flex items-center justify-center",
              cancelResult?.success ? 'bg-green-500/10' : 'bg-red-500/10'
            )}>
              {cancelResult?.success ? (
                <Check className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
            <div className="text-lg font-semibold">
              {cancelResult?.success ? (
                cancelResult.immediate ? 'Subscription cancelled' : 'Cancellation scheduled'
              ) : (
                'Cancellation failed'
              )}
            </div>
            <div className={cn("text-sm",
              cancelResult?.success ? 'text-muted-foreground' : 'text-red-500'
            )}>
              {cancelResult?.message}
            </div>
            {cancelResult?.success && !cancelResult.immediate && cancelResult.endsAt && (
              <div className="text-xs text-muted-foreground">You will retain access until {niceDate(cancelResult.endsAt)}.</div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button onClick={() => setCancelResultOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CardPaymentMethodModal
        isOpen={showAddPaymentMethodModal}
        onClose={() => {
          setShowAddPaymentMethodModal(false);
          reloadPaymentMethods();
        }}
        mode="add"
      />
      <TransactionHistoryModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
      <PaymentMethodsModal
        isOpen={showPaymentMethodsModal}
        onClose={() => setShowPaymentMethodsModal(false)}
      />
    </div>
  );
}

