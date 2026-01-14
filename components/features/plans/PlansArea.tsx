"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader } from "lucide-react";
import { toast } from "sonner"

import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import OrganizationPlansArea from "./OrganizationPlansArea";
import { useAuthStore, usePendingChatStateStore } from "@/stores";
import { useTheme } from "next-themes";

const PlansArea = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showOrgPlans, setShowOrgPlans] = useState(false);
  ;
  const router = useRouter();
  const { user, token, plan, setAuth, isAuthenticated } = useAuthStore();
  const { pending } = usePendingChatStateStore();
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const getRandomDelay = () => Math.random() * 8;




  const handleProPlan = async () => {
    const planName = 'pro';
    setProcessingPlan('Pro');
    try {
      const response = await authApi.checkout({
        plan: planName,
        billing_cycle: isYearly ? 'yearly' : 'monthly',
      });

      if (response.status && response.to) {
        // Pro is a paid plan; send to checkout URL
        router.push(response.to);
        setProcessingPlan(null);
      } else {
        toast.error(response.message || 'Checkout failed');
      }
    } catch (error: any) {
      setProcessingPlan(null);
      // toast.error(`${error.response?.data?.error || error.response?.data?.message || 'An error occurred. Please try again.'}`);
      
    }
  };

  const handleCheckout = async (planName: string) => {
    if (planName.toLowerCase() === 'pro') {
      handleProPlan();
      return;
    }

    setProcessingPlan(planName);

    try {
      const normalized = planName.toLowerCase() as 'free' | 'standard' | 'plus';
      const response = await authApi.checkout({
        plan: normalized,
        billing_cycle: isYearly ? 'yearly' : 'monthly',
      });

      if (response.status && response.to) {
        if (planName.toLowerCase() === 'free') {
          setAuth(user!, token!, 'free');
           if(pending && pending.link) {
            router.push(pending.link || '/chat');
          } else {
            router.push(response.to);
          }
        } else {
          window.location.href = response.to;
        }
        setProcessingPlan(null);
      } else {
        throw new Error(response.message || 'Checkout failed');
      }
    } catch (error: any) {
      toast.error(`${error.response?.data?.error || error.response?.data?.message || "An error occurred. Please try again."}`)
      setProcessingPlan(null);

    }
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      description:
        "For small teams or individuals optimizing basic web queries.",
      about:
        "Interact with up to 2 AI models in a single conversation to gain diverse insights and perspectives.",
      features: [
        "Text",
        "Image",
        "2 AI Models/conversation",
        "Limited model Usage",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Standard",
      price: isYearly ? 200 : 20,
      description: "Enhanced AI capabilities and additional features.",
      about:
        "Interact with up to 3 AI models per conversation for even more diverse insights, plus access to Fact-checking, Audio, and Video generation models.",
      features: [
        "Everything in Free",
        "Up to 3 AI models",
        "Fact-checking",
        "Audio",
        "Video",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Plus",
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
      buttonText: "Get Started",
      highlighted: true,
    },
    {
      name: "Pro",
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
      buttonText: "Get Started",
      highlighted: false,
    },
  ];

  if (showOrgPlans) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          className="absolute left-4 top-4 text-sm"
          onClick={() => setShowOrgPlans(false)}
        >
          ← Back to Plans
        </Button>
        <OrganizationPlansArea />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 overflow-auto">
      <div className="text-center space-y-2 sm:space-y-8 mb-12">
        <h1 className="text-xl sm:text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm">
          Select the perfect plan for your needs. All plans include access to our core features, with additional capabilities as you scale.
        </p>

        {/* Plan billing toggle */}
        <div className="flex items-center justify-center gap-4">
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
                  ? "bg-black dark:bg-background text-white shadow-sm border border-muted-foreground/10"
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
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            layout
            className={cn(
              "relative p-6 rounded-lg border h-full",
              plan.highlighted
                ? "relative p-6 rounded-xl overflow-hidden bg-gradient-to-r from-black via-neutral-900 to-black bg-[length:200%_200%] animate-black text-white"
                : "border-borderColorPrimary"
            )}
          >
            {/* {plan.highlighted && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 opacity-60 bg-[length:200%_200%] animate-gold"></div>
            )} */}
            <div className="relative space-y-4 min-h-[25rem]">
              <div>
                <h3 className={cn(
                  "text-xl sm:text-2xl font-bold",
                  plan.name === "Free" && "text-foreground",
                  plan.name === "Standard" && "bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 dark:from-gray-100 dark:via-gray-400 dark:to-gray-200 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                  plan.name === "Plus" && "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
                  plan.name === "Pro" && "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                )}>{plan.name}</h3>
                <motion.div
                  key={`${plan.name}-${isYearly ? "yearly" : "monthly"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-3xl font-bold">
                    £
                    {typeof plan.price === "number" ? plan.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : plan.price}
                  </span>
                  {plan.name !== "Free" && (
                    <>
                      /{isYearly ? <span className="font-bold">year</span> : <span className="font-bold">month</span>}
                    </>
                  )}
                </motion.div>
                {plan.name === "Free" && (
                  <div className="mt-1 relative">
                    <span className="animate-gradient bg-clip-text text-transparent bg-[length:200%_auto] bg-gradient-to-r from-gray-700 via-gray-200 to-gray-700 text-xs font-medium">
                      No credit card required
                    </span>
                  </div>
                )}
              </div>

              <p className={`text-sm text-muted-foreground pb-4`}>
                {plan.description}
              </p>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[0.8rem]"
                  >
                    <Check
                        className={`h-4 w-4 text-primary ${
                          plan.highlighted ? "text-[#fafafa]" : ""
                        }`}
                      />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full absolute bottom-0 overflow-hidden ${
                  plan.highlighted
                    ? "bg-[#fafafa] text-[#171717] hover:bg-[#F8F8F8]"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => 
                  plan.name.toLowerCase() === 'pro' 
                    ? handleProPlan() 
                    : handleCheckout(plan.name)
                }
                disabled={processingPlan !== null}
              >
                {processingPlan === plan.name ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  plan.name === "Pro+plan" ? (
                    <>
                      <span className="relative z-10">{plan.buttonText}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                        style={{ zIndex: 1 }}
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </>
                  ) : (
                    plan.buttonText
                  )
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Plans CTA */}
      <div className="mt-8">
        <div className="rounded-xl border border-borderColorPrimary p-6 bg-backgroundSecondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Need specific features?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Build a custom plan by selecting just the capabilities you need. Perfect for specialized workflows.
            </p>
          </div>
          <Button onClick={() => router.push('/plans/custom')} variant="outline" className="shrink-0">
            Customize Your Plan
          </Button>
        </div>
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
    </div>
  );
};

export default PlansArea;