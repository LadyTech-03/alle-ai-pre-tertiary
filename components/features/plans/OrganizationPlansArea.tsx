"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader, Users, Building2, Shield, Zap } from "lucide-react";
import { toast } from "sonner"


const OrganizationPlansArea = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [teamSize, setTeamSize] = useState(50);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  ;

  const calculatePrice = (basePrice: number) => {
    const pricePerUser = basePrice;
    const total = Math.round((teamSize * pricePerUser) / 10) * 10; // Round to nearest 10
    return isYearly ? total * 10 : total; // 17% discount for yearly
  };

  const handleContactSales = () => {
    toast.message('Contact Sales', {
      description: 'Our team will reach out to you shortly!',
    })
  };

  const plans = [
    {
      name: "Business",
      basePrice: 20,
      description: "Perfect for growing organizations that need powerful AI capabilities.",
      features: [
        "Unlimited AI conversations",
        `Up to ${teamSize} team members`,
        "Advanced analytics dashboard",
        "Priority support",
        "Custom AI model integration",
        "Team collaboration features",
        "Usage monitoring & controls",
      ],
      icon: <Building2 className="w-6 h-6 text-primary" />,
      highlighted: false,
    },
    {
      name: "Enterprise",
      description: "Fully customizable solution with advanced security and control.",
      features: [
        "Everything in Business",
        "Unlimited team members",
        "Custom AI model training",
        "24/7 dedicated support",
        "SSO & advanced security",
        "API access",
        "Custom integrations",
        "Dedicated success manager",
      ],
      icon: <Shield className="w-6 h-6 text-primary" />,
      highlighted: true,
      custom: true,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center space-y-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Organization Plans</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Scale your AI capabilities across your entire organization with our flexible team pricing.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={cn("text-sm", !isYearly && "text-primary")}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", isYearly && "text-primary")}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              17% discount
            </Badge>
          </div>
        </div>

        {/* Team Size Slider for Business Plan */}
        <div className="max-w-md mx-auto space-y-4 bg-secondary/20 p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">Team Size</span>
            </div>
            <span className="font-bold">{teamSize} users</span>
          </div>
          <Slider
            value={[teamSize]}
            onValueChange={(value) => setTeamSize(value[0])}
            min={10}
            max={1000}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            layout
            className={cn(
              "relative p-8 rounded-xl border",
              plan.highlighted
                ? "bg-[#130f0f] text-white"
                : "border-borderColorPrimary"
            )}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {plan.icon}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>
                
                {!plan.custom && plan.basePrice !== undefined && (
                  <motion.div
                    key={`${plan.name}-${isYearly ? "yearly" : "monthly"}-${teamSize}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-1"
                  >
                    <span className="text-4xl font-bold">
                      £{calculatePrice(plan.basePrice)}
                    </span>
                    <span className="text-muted-foreground mb-1">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </motion.div>
                )}

                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={cn(
                      "h-5 w-5",
                      plan.highlighted ? "text-primary" : "text-primary"
                    )} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full",
                  plan.highlighted
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                )}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={plan.custom ? handleContactSales : undefined}
              >
                {plan.custom ? "Contact Sales" : "Get Started"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Need a custom solution?</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Looking for something different?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Contact our sales team for custom pricing, features, and requirements.
          </p>
          <Button variant="link" className="text-primary" onClick={handleContactSales}>
            Talk to Sales →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPlansArea;