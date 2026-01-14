"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  Loader, 
  Plus, 
  Sparkles, 
  MessagesSquare, 
  Image as ImageIcon, 
  Music, 
  Video as VideoIcon,
  Component,
  XCircle,
  CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/lib/api/auth"
import { useConversationStore } from "@/stores/models";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores";
import confetti from "canvas-confetti";
import { CardPaymentMethodModal } from "@/components/ui/modals";
import { paymentApi } from "@/lib/api/payment";

// Define types for our features
interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  models?: {
    name: string;
    image: string;
  }[];
}

// Define the features with their details
const features: Feature[] = [
  {
    id: "chat",
    name: "Chat",
    description: "Compare multiple AI models in real-time conversations. Get diverse perspectives from models like GPT-4, Claude, and more.",
    price: 35,
    icon: <MessagesSquare className="h-5 w-5 text-green-500" />,
    models: [
      { name: "GPT-4.5", image: "/models/gpt-4o.webp" },
      { name: "Claude 3.5 Sonnet", image: "/models/claude-3.webp" },
      { name: "Deepseek V3", image: "/models/deepseek.webp" }
    ]
  },
  {
    id: "image",
    name: "Image",
    description: "Generate stunning images from text prompts. Create artwork, designs, and visualizations with leading AI image models.",
    price:45,
    icon: <ImageIcon className="h-5 w-5 text-purple-500" />,
    models: [
      { name: "DALL-E 3", image: "/models/gpt-4.webp" },
      { name: "Grok 2 Image", image: "/models/grok.webp" },
      { name: "Stable Diffusion", image: "/models/stability-ai.webp" }
    ]
  },
  {
    id: "audio",
    name: "Audio",
    description: "Generate and manipulate audio content with state-of-the-art AI models. Create voiceovers, music, and sound effects.",
    price: 30,
    icon: <Music className="h-5 w-5 text-blue-500" />,
    models: [
      { name: "GPT 4o mini TTS", image: "/models/gpt-4o.webp" },
      { name: "Scribe V1", image: "/models/elevenLabs1.png" },
      { name: "GPT 4o Transcribe", image: "/models/gpt-4o.webp" }
    ]
  },
  {
    id: "video",
    name: "Video",
    description: "Create and edit videos using AI. Generate video content, apply effects, and enhance existing footage.",
    price: 50,
    icon: <VideoIcon className="h-5 w-5 text-yellow-500" />,
    models: [
      { name: "Veo 2", image: "/models/google.webp" },
      { name: "Luma ray", image: "/models/luma.webp" },
      { name: "Nova reel", image: "/models/amazon.webp" }
    ]
  }
];

const FeatureCard = ({ 
  feature, 
  isSelected, 
  onToggle,
  isYearly
}: { 
  feature: Feature; 
  isSelected: boolean; 
  onToggle: () => void;
  isYearly: boolean;
}) => {
  // Calculate the display price based on billing cycle
  const displayPrice = isYearly 
    ? Math.round(feature.price * 10) // Apply 17% yearly discount
    : feature.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-xl overflow-hidden border transition-all duration-300",
        isSelected 
          ? "border-borderColorPrimary shadow-md bg-backgroundSecondary" 
          : "border-borderColorPrimary hover:border-primary/50 bg-background"
      )}
    >
      {/* Content container */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              isSelected ? "bg-primary/10" : "bg-primary/5"
            )}>
              {feature.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{feature.name}</h3>
              <div className="text-sm text-muted-foreground">
                {isYearly ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground/50 font-semibold">
                      £{feature.price * 12}
                    </span>
                    <span className="font-medium text-primary">
                      £{Math.round(feature.price * 10)}/year
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">£{feature.price}/mo</span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant={isSelected ? "default" : "outline"} 
            size="sm"
            onClick={onToggle}
            className={cn(
              "rounded-full h-9 px-3",
              isSelected ? "bg-primary text-primary-foreground" : "border-borderColorPrimary"
            )}
          >
            {isSelected ? (
              <span className="flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Selected
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </span>
            )}
          </Button>
        </div>
        
        {/* Description */}
        <p className="text-sm mb-4">
          {feature.description}
        </p>
        
        {/* Simplified Capabilities */}
        <div className="mt-2 mb-4">
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              {/* <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> */}
              {/* <span className="font-medium">Unlimited {feature.name} capabilities</span> */}
            </li>
          </ul>
        </div>
        
        {/* Models */}
        {feature.models && (
          <div className="mt-auto pt-3 border-t border-borderColorPrimary">
            <AnimatePresence>
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Some Featured Models
                </h4>
                <div className="flex flex-wrap gap-2">
                  {feature.models.map((model) => (
                    <div
                      key={model.name}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs border",
                        isSelected 
                          ? "bg-background border-primary/20" 
                          : "bg-background border-borderColorPrimary"
                      )}
                    >
                      <Image
                        src={model.image}
                        alt={model.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      {model.name}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CustomPlansArea = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(false); // for checkout
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [prorationLoading, setProrationLoading] = useState(false);
  const [prorationError, setProrationError] = useState<string | null>(null);
  const [proration, setProration] = useState<{
    amount_due: number;
    prorated_credit: number;
    prorated_charge: number;
    next_billing_date: string;
  } | null>(null);
  const [switchProcessing, setSwitchProcessing] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
const [requiresAction, setRequiresAction] = useState(false);
  const router = useRouter();
  const { setGenerationType } = useConversationStore();
  const { plan: currentPlan, refreshPlan } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  const [planLoading, setPlanLoading] = useState(true);


  const isCustomOrUnlimited = useMemo(() => {
    const p = (currentPlan || '').toLowerCase();
    return p.includes('custom') || p.includes('pro');
  }, [currentPlan]);

  // Fetch current plan from server on mount
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        setPlanLoading(true);
        await refreshPlan();
      } catch (error) {
        console.error('Failed to fetch current plan:', error);
      } finally {
        setPlanLoading(false);
      }
    };
    
    fetchCurrentPlan();
  }, [refreshPlan]);

  useEffect(() => {
    const p = (currentPlan || '').toLowerCase();
    if (!p) return;
    const cycle = p.includes('year') ? 'yearly' : 'monthly';
    setIsYearly(cycle === 'yearly');

    if (p.includes('pro')) {
      setSelectedFeatures(['chat', 'image', 'audio', 'video']);
      return;
    }
    if (p.includes('custom')) {
      // Expected format: custom_chat_image_monthly / custom_video_yearly etc.
      const core = p.replace('custom_', '').replace('_monthly', '').replace('_yearly', '');
      const parts = core.split('_').filter(Boolean);
      const valid = ['chat', 'image', 'audio', 'video'];
      const preselected = parts.filter((x) => valid.includes(x));
      if (preselected.length > 0) setSelectedFeatures(preselected);
    }
  }, [currentPlan]);


  // First, let's calculate the totals correctly
  const totalPrice = useMemo(() => {
    const basePrice = selectedFeatures.reduce((sum, featureId) => {
      const feature = features.find(f => f.id === featureId);
      return sum + (feature?.price || 0);
    }, 0);

    if (isYearly) {
      const originalYearlyPrice = basePrice * 12;
      const discountedYearlyPrice = basePrice * 10; // 17% discount
      const totalDiscount = originalYearlyPrice - discountedYearlyPrice;
      return {
        original: originalYearlyPrice,
        discounted: discountedYearlyPrice,
        discount: totalDiscount
      };
    }

    return {
      original: basePrice,
      discounted: basePrice,
      discount: 0
    };
  }, [selectedFeatures, isYearly]);

  // Generate plan name based on selected features
  const planName = useMemo(() => {
    if (selectedFeatures.length === 0) return "Alle-AI Custom";
    if (selectedFeatures.length === features.length) return (
      <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
        Alle-AI Pro
      </span>
    );
    
    // Define the canonical order
    const orderedFeatureIds = ["chat", "image", "audio", "video"];
    
    // Filter and sort selected features according to canonical order
    const orderedNames = orderedFeatureIds
      .filter(id => selectedFeatures.includes(id))
      .map(id => {
        const feature = features.find(f => f.id === id);
        return feature?.id;
      })
      .filter(Boolean);
    
    return `Alle-AI Custom (${orderedNames.join(" + ")})`;
  }, [selectedFeatures]);

  const planNameText = useMemo(() => {
    if (selectedFeatures.length === 0) return "Alle-AI Custom";
    if (selectedFeatures.length === features.length) return "Alle-AI Pro";
    const orderedFeatureIds = ["chat", "image", "audio", "video"] as const;
    const orderedNames = orderedFeatureIds.filter(id => selectedFeatures.includes(id));
    return `Alle-AI Custom (${orderedNames.join(" + ")})`;
  }, [selectedFeatures]);

  const formatMoney = (value: number) => `£ ${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const niceDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
  const cardBrandLabel = (brand?: string) => brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';
  const selectedPaymentMethod = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return undefined;
    return paymentMethods.find(m => m.id === selectedPaymentMethodId) || paymentMethods[0];
  }, [paymentMethods, selectedPaymentMethodId]);

  const currentPlanDisplayName = useMemo(() => {
    const p = (currentPlan || '').toLowerCase();
    if (!p) return 'Free';
    if (p.includes('pro')) return 'Pro';
    if (p.includes('plus')) return 'Plus';
    if (p.includes('standard')) return 'Standard';
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
    return 'Free';
  }, [currentPlan]);

  const buildTargetPlan = () => {
    const orderedFeatureIds = ["chat", "image", "audio", "video"] as const;
    const orderedFeatures = orderedFeatureIds.filter(id => selectedFeatures.includes(id));
    let base = "custom";
    if (orderedFeatures.length === orderedFeatureIds.length) {
      base = "pro";
    } else if (orderedFeatures.length > 0) {
      base = `custom_${orderedFeatures.join("_")}`;
    }
    const cycle = isYearly ? 'yearly' : 'monthly';
    return `${base}_${cycle}`;
  };

  const canonicalSelected = useMemo(() => {
    const ordered = ["chat", "image", "audio", "video"] as const;
    return ordered.filter((id) => selectedFeatures.includes(id));
  }, [selectedFeatures]);

  const currentCanonical = useMemo(() => {
    const p = (currentPlan || '').toLowerCase();
    const ordered = ["chat", "image", "audio", "video"] as const;
    if (!p || (!p.includes('custom') && !p.includes('pro'))) return [] as string[];
    if (p.includes('pro')) return Array.from(ordered);
    const core = p.replace('custom_', '').replace('_monthly', '').replace('_yearly', '');
    const parts = core.split('_').filter(Boolean);
    return ordered.filter((id) => parts.includes(id));
  }, [currentPlan]);

  const currentCycle = useMemo(() => ((currentPlan || '').toLowerCase().includes('year') ? 'yearly' : 'monthly'), [currentPlan]);
  const hasAnyPlan = useMemo(() => typeof currentPlan === 'string' && currentPlan.length > 0, [currentPlan]);
  const isSameConfig = useMemo(() => hasAnyPlan && isCustomOrUnlimited && isYearly === (currentCycle === 'yearly') && canonicalSelected.join(',') === currentCanonical.join(','), [hasAnyPlan, isCustomOrUnlimited, isYearly, currentCycle, canonicalSelected, currentCanonical]);

  // Calculate current plan price
  const currentPlanPrice = useMemo(() => {
    if (!currentCanonical || currentCanonical.length === 0) return 0;
    
    const basePrice = currentCanonical.reduce((sum, featureId) => {
      const feature = features.find(f => f.id === featureId);
      return sum + (feature?.price || 0);
    }, 0);

    // Apply yearly discount if current plan is yearly
    if (currentCycle === 'yearly') {
      return basePrice * 10; // 17% discount applied
    }
    
    return basePrice;
  }, [currentCanonical, currentCycle]);

  // Helper function to determine button text based on price comparison
  const getCustomPlanButtonText = () => {
    if (isSameConfig) return "Your Current Plan";
    if (!hasAnyPlan || currentPlan === 'free') return "Proceed to Checkout";
    
    // Compare current plan price with selected plan price
    const selectedPrice = totalPrice.discounted;
    
    if (selectedPrice > currentPlanPrice) {
      return `Upgrade to ${planName}`;
    } else if (selectedPrice < currentPlanPrice) {
      return `Downgrade to ${planName}`;
    } else {
      return "Switch Plan";
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleCheckout = async () => {
    if (selectedFeatures.length === 0) {
      return; // Don't proceed if no features are selected
    }

    setProcessingPlan(true);

    try {
      // Define the canonical order for consistency
      const orderedFeatureIds = ["chat", "image", "audio", "video"];
      // Filter and sort selected features according to canonical order
      const orderedFeatures = orderedFeatureIds
        .filter(id => selectedFeatures.includes(id));
      
      // Create the custom plan string (e.g., "custom_chat+video")
      let planName = "custom";
      if (orderedFeatures.length > 0) {
        if (orderedFeatures.length === orderedFeatureIds.length) {
          planName = "pro";
        } else {
          planName += "_" + orderedFeatures.join("_");
        }
      }

      // Import the auth API

      // Call the checkout API with the custom plan
      // console.log(planName, "this is the plan name and the cycle is", isYearly ? 'yearly' : 'monthly' )
      const response = await authApi.checkout({
        plan: planName as any, // Type assertion for the custom plan string
        billing_cycle: isYearly ? 'yearly' : 'monthly',
      });

      // Log the response for debugging
      // console.log("Checkout response:", response);

      if (response.status && response.to) {
        // Log the return URL instead of redirecting
        // console.log("Return URL:", response.to);
         window.location.href = response.to;
      } else {
        throw new Error(response.message || 'Checkout failed');
      }
    } catch (error: any) {
      // console.error("Checkout error:", error);
      // toast.error(error.response?.data?.error || error.response?.data?.message || 'Something went wrong');
      // You could add a toast notification here if you want to show the error to the user
    } finally {
      setProcessingPlan(false);
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
          console.error('Failed to fetch default payment method:', error);
        }

        setPaymentMethods(p.payment_methods);
        // Set the default payment method as selected, or first one if no default found
        const selectedId = defaultPaymentMethodId || p.payment_methods[0]?.id || null;
        setSelectedPaymentMethodId(selectedId);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: any) {
      // setPaymentError(error?.message || 'Failed to fetch payment method');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      setSettingDefaultPaymentMethodId(paymentMethodId);
      setPaymentError(null);
      const resp: any = await paymentApi.setDefaultPaymentMethod(paymentMethodId);
      if (resp?.status) {
        setSelectedPaymentMethodId(paymentMethodId);
        toast.success('Default payment method updated');
        setShowPaymentMethods(false);
      } else {
        toast.error('Failed to set default payment method');
      }
    } catch (error: any) {
      const msg = error?.message || 'Failed to set default payment method';
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setSettingDefaultPaymentMethodId(null);
    }
  };

  // Fetch proration and payment methods when confirm is opened (switch flow only)
  useEffect(() => {
    if (!confirmOpen) return;
    // Only when user already has a plan and is switching
    if (!hasAnyPlan || isSameConfig) return;
    let cancelled = false;
    (async () => {
      try {
        setProration(null);
        setProrationError(null);
        setProrationLoading(true);
        setPaymentLoading(true);
        setPaymentError(null);
        const target = buildTargetPlan();
        const [prorationResult, paymentResult] = await Promise.allSettled([
          authApi.getProrationDetails({
          plan: target,
          invoice_now: true,
          prorate: true,
          anchor_now: false,
          }),
          paymentApi.getCreditDetails(),
        ]);
        if (cancelled) return;
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
      } catch (e: any) {
        if (!cancelled) setProrationError(e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Failed to fetch proration details');
        toast.error(e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Failed to fetch proration details');
      } finally {
        if (!cancelled) setProrationLoading(false);
        if (!cancelled) setPaymentLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmOpen]);

  const handleSwitch = async () => {
    setSwitchProcessing(true);
    try {
      const target = buildTargetPlan();
      const response = await authApi.switchSubscription({
        plan: target,
        invoice_now: true,
        prorate: true,
        anchor_now: false,
      });
      if (response.status) {
        setSwitchSuccess(true);
        try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch {}
        if (!audioRef.current) {
          audioRef.current = new Audio("/audio/success.mp3");
        }

        audioRef.current.currentTime = 0; // reset to start
        audioRef.current.play();  
        try { await refreshPlan(); } catch {}
      } else {
        setSwitchError(response.last_payment_error || response.message || 'Failed to switch subscription');
        setRequiresAction(!!response.requires_action);
      }
    } catch (e: any) {
      setSwitchError(e?.response?.data?.last_payment_error || e?.response?.data?.message || e?.message || 'Failed to switch subscription');
    } finally {
      setSwitchProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isCustomOrUnlimited && (
        <div className="mb-6 rounded-xl border border-borderColorPrimary p-4 bg-backgroundSecondary">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Your Current Plan</div>
              <div className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">{currentPlanDisplayName}</div>
              <Badge variant="default" className="text-xs mt-1 font-semibold">{(currentCycle === 'yearly') ? 'Yearly' : 'Monthly'}</Badge>
            </div>
          </div>
        </div>
      )}
      <Button
        variant="link"
        className="mb-8"
        onClick={() => {
          setGenerationType('load');
          router.back()
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Feature selection */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create Your Custom Plan</h1>
            <p className="text-muted-foreground mt-2">
              Select the features you need and create a plan tailored to your requirements.
            </p>
          </div>

          <div className="flex items-center justify-start mb-6">
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
                    <span className="text-green-500">Save 17%</span>
                  </Badge>
              </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                isSelected={selectedFeatures.includes(feature.id)}
                onToggle={() => toggleFeature(feature.id)}
                isYearly={isYearly}
              />
            ))}
          </div>
        </div>

        {/* Right column - Summary and checkout */}
        <div className="lg:col-span-5">
          <motion.div 
            layout
            className={cn(
              "sticky top-8 rounded-xl border overflow-hidden transition-all duration-300",
              selectedFeatures.length > 0 
                ? "border-primary/20 shadow-lg bg-backgroundSecondary" 
                : "border-borderColorPrimary bg-backgroundSecondary"
            )}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your Custom Plan</h2>
                {selectedFeatures.length > 0 && (
                  <Badge className="bg-primary/20 text-primary border-0">
                    {selectedFeatures.length} {selectedFeatures.length === 1 ? 'feature' : 'features'}
                  </Badge>
                )}
              </div>

              {selectedFeatures.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Build Your Plan</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Select features from the left to create your custom Alle-AI plan
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6 mb-6">
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient mb-4">{planName}</h3>
                      <div className="bg-background/50 rounded-lg p-4 space-y-3 border border-borderColorPrimary">
                        {selectedFeatures.map(id => {
                          const feature = features.find(f => f.id === id);
                          if (!feature) return null;
                          
                          // Calculate the display price for each feature based on billing cycle
                          const featureDisplayPrice = isYearly 
                            ? Math.round(feature.price * 12) // Apply 17% yearly discount
                            : feature.price;
                          
                          return (
                            <div key={id}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    {feature.icon}
                                  </div>
                                  <span className="font-medium">{feature.name}</span>
                                </div>
                                {isYearly ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm line-through text-muted-foreground/50 font-semibold">
                                      £{feature.price * 12}
                                    </span>
                                    <span className="text-sm text-primary">
                                      £{Math.round(feature.price * 10)}/year
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm">£{feature.price}/month</span>
                                )}
                              </div>
                              <div className="pl-8 mt-1">
                                {/* <span className="text-xs text-muted-foreground">
                                  Unlimited capabilities
                                </span> */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Plan details section */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
                        Plan Details
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Max usage limits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Dedicated support team</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Early access to new features</span>
                        </li>
                        {isYearly && (
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>17% yearly discount</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-borderColorPrimary pt-4 mb-6">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      {isYearly ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground/50 font-semibold">
                            £{totalPrice.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold">£{totalPrice.original}/month</span>
                      )}
                    </div>
                    {isYearly && (
                      <div className="flex justify-between items-center text-sm text-green-500 mt-2">
                        <span>Yearly discount (17% on each)</span>
                        <span>-£{totalPrice.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-medium mt-3">
                      <span>Total Price</span>
                      {isYearly ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">£{totalPrice.discounted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year</span>
                        </div>
                      ) : (
                        <span className="font-semibold">£{totalPrice.original.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month</span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      if (hasAnyPlan && currentPlan !== 'free') {
                        if (isSameConfig) return; // already on this plan
                        // open switch modal
                        setSwitchSuccess(false);
                        setSwitchError(null);
                        setRequiresAction(false);
                        setConfirmOpen(true);
                        return;
                      }
                      void handleCheckout();
                    }}
                    disabled={processingPlan || planLoading || (hasAnyPlan && isSameConfig)}
                  >
                    {processingPlan || planLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      getCustomPlanButtonText()
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    You&apos;ll be charged £{totalPrice.discounted} {isYearly ? "annually" : "monthly"}. 
                    Cancel or change your plan anytime.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
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
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-backgroundSecondary px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-semibold">{planNameText} {isYearly ? '(Yearly)' : '(Monthly)'}</DialogTitle>
                {!switchSuccess && prorationError && (
                  <DialogDescription className="text-sm text-red-500">{prorationError}</DialogDescription>
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
                            <div className="font-medium">Remaining amount on {currentPlanDisplayName} plan</div>
                            <div className="text-xs text-muted-foreground">Pro‑rated credit applied</div>
                          </div>
                          <div className="font-medium">{formatMoney(proration.prorated_credit)}</div>
                        </div>
                        <div className="flex items-start justify-between text-sm">
                          <div>
                            <div className="font-medium">{planNameText} from today</div>
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
              </div>
            </div>
          </div>
                )}
                {!prorationLoading && !proration && !prorationError && (
                  <p className="text-sm text-muted-foreground">Review and confirm to continue.</p>
                )}
          </div>
          <DialogFooter className="px-6 pb-6">
                    <div className="flex w-full items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={switchProcessing}>
                  Cancel
                </Button>
                <Button 
                variant={proration?.amount_due && proration.amount_due < 0 ? 'success' : 'default'}
                onClick={() => void handleSwitch()} disabled={switchProcessing || !!prorationError || paymentMethods.length === 0}>
                  {switchProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : switchError ? (
                    proration ? `Try again ${formatMoney(proration.amount_due)}` : 'Try again'
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
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={switchProcessing}>
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
                <div className="text-sm text-muted-foreground">You&apos;re all set. Enjoy your new plan.</div>
              </div>
              <DialogFooter className="px-6 pb-6">
                <Button onClick={() => setConfirmOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          )}
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
    </div>
  );
};

export default CustomPlansArea; 