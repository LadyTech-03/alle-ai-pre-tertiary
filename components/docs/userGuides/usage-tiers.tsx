"use client"
import React from "react";
import NavigationContainer from "@/components/NavigationContainer";
import Link from "next/link";
import { Check, X, Info, AlertCircle, CreditCard, Clock, Share2 } from "lucide-react";
import {
  Card,

} from "@/components/ui/card";
const usageTiers = [
  {
    tier: "Tier 0",
    spend: "$0",
    description: "Free trial access",
  },
  {
    tier: "Tier 1",
    spend: "$20",
    description: "Starter tier",
  },
  {
    tier: "Tier 2",
    spend: "$100",
    description: "For frequent users",
  },
  {
    tier: "Tier 3",
    spend: "$500",
    description: "For teams and devs",
  },
  {
    tier: "Tier 4",
    spend: "$1500",
    description: "Enterprise-grade",
  },
];

const modelRateLimits = {
  chat: {
    label: "Chat/Text Models",
    limits: {
      tier0: 10,
      tier1: 30,
      tier2: 60,
      tier3: 120,
      tier4: 200,
    },
  },
  image: {
    label: "Image Models",
    limits: {
      tier0: 2,
      tier1: 10,
      tier2: 30,
      tier3: 60,
      tier4: 100,
    },
  },
  audio: {
    label: "Audio Models",
    limits: {
      tier0: 2,
      tier1: 8,
      tier2: 20,
      tier3: 40,
      tier4: 80,
    },
  },
  video: {
    label: "Video Models",
    limits: {
      tier0: 1,
      tier1: 5,
      tier2: 15,
      tier3: 30,
      tier4: 60,
    },
  },
};
const featuresByTier = [
  {
    feature: "Unified Multi-Model Request",
    tiers: {
      tier0: true,
      tier1: true,
      tier2: true,
      tier3: true,
      tier4: true,
    },
  },
  {
    feature: "Batch Input (same input, all models)",
    tiers: {
      tier0: false,
      tier1: true,
      tier2: true,
      tier3: true,
      tier4: true,
    },
  },
  {
    feature: "Structured Response Format",
    tiers: {
      tier0: false,
      tier1: true,
      tier2: true,
      tier3: true,
      tier4: true,
    },
  },
  {
    feature: "Priority Routing",
    tiers: {
      tier0: false,
      tier1: false,
      tier2: true,
      tier3: true,
      tier4: true,
    },
  },
  {
    feature: "Model Comparison Tools",
    tiers: {
      tier0: false,
      tier1: false,
      tier2: true,
      tier3: true,
      tier4: true,
    },
  },
  {
    feature: "Early Access to New Integrations",
    tiers: {
      tier0: false,
      tier1: false,
      tier2: false,
      tier3: true,
      tier4: true,
    },
  },
];

const RateLimits = () => {
  // Helper function to convert modelRateLimits object into array format for table
  const getModelRateLimitsArray = () => {
    return Object.entries(modelRateLimits).map(([_, modelData]) => ({
      label: modelData.label,
      tier0: modelData.limits.tier0,
      tier1: modelData.limits.tier1,
      tier2: modelData.limits.tier2,
      tier3: modelData.limits.tier3,
      tier4: modelData.limits.tier4,
    }));
  };

  return (
    <div className="documentation-container">
      {/* intro */}
      <section id="tier-system-overview" className="mb-10">
        <p className="text-muted-foreground">
          To manage access and ensure fair usage, we use a tier-based system
          that determines your rate limits and feature availability. Your tier
          is based on your total credit purchases, and each tier unlocks higher
          request limits, additional features, and faster response handling. You
          can view or upgrade your current tier in your{" "}
          <span className=" font-bold capitalize text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ">
            <Link href={"#"}> API settings dashboard.</Link>
          </span>
        </p>
      </section>
      {/* usage tiers */}
      <section id="rate-limits-features" className="mb-10">
        <h2 className="font-bold text-2xl mb-4">Usage Tiers</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-accent">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Tier
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Total Spend ($)
              </th>
              <th className="p-2 text-left text-xs font-bold uppercase">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {usageTiers.map((tier) => (
              <tr
                key={tier.tier}
                className="border-b border-gray-300 dark:border-accent hover:bg-accent"
              >
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {tier.tier}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {tier.spend}
                </td>
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {tier.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex items-start gap-4">
          {/* Primary Info Card */}
          <Card className="flex-1 rounded-lg bg-background border border-borderColorPrimary p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                  Credit-Based Tier System
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your tier level is determined by your total credit purchases over time. Higher tiers unlock increased rate limits and additional features.
                </p>
              </div>
            </div>
          </Card>
          {/* Secondary Info Card */}
          <Card className="flex-1 rounded-lg bg-background border border-borderColorPrimary p-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
                  Flexible Upgrades
                </h4>
                <p className="text-sm text-muted-foreground">
                  Purchase credits at any time to increase your tier level. Tier benefits are applied automatically based on your total spending.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
      {/* model specific limits  */}

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Model-Specific Rate Limits</h2>
        <p className="text-muted-foreground mb-6">
          Each model type has specific rate limits (requests per minute) based
          on your usage tier. Higher tiers provide increased throughput for more
          demanding applications.
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-accent">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Model Type
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 0
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 1
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 2
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 3
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 4
              </th>
            </tr>
          </thead>
          <tbody>
            {getModelRateLimitsArray().map((model) => (
              <tr
                key={model.label}
                className="border-b border-gray-300 dark:border-accent hover:bg-accent"
              >
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {model.label}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {model.tier0} RPM
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {model.tier1} RPM
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {model.tier2} RPM
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {model.tier3} RPM
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {model.tier4} RPM
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Card className="mt-4 flex items-center space-x-2.5 rounded-md bg-background border border-borderColorPrimary p-3">
          <Clock className="h-4 w-4 text-muted-foreground font-bold" />
          <p className="text-sm text-muted-foreground font-bold">
            <span className="font-medium">RPM</span> = Requests Per Minute. Limits apply per model type.
          </p>
        </Card>
      </section>
      {/* features by tier */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Features by Tier</h2>
        <p className="text-muted-foreground mb-6">
          Each tier includes additional features to support your growing needs.
          Higher tiers unlock more advanced capabilities and tools.
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-accent">
              <th className="p-2 text-left text-xs font-bold uppercase">
                Feature
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 0
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 1
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 2
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 3
              </th>
              <th className="p-2 text-center text-xs font-bold uppercase">
                Tier 4
              </th>
            </tr>
          </thead>
          <tbody>
            {featuresByTier.map((feature) => (
              <tr
                key={feature.feature}
                className="border-b border-gray-300 dark:border-accent hover:bg-accent"
              >
                <td className="p-2 text-left text-xs text-muted-foreground">
                  {feature.feature}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {feature.tiers.tier0 ? (
                    <Check className="inline-block w-4 h-4 text-green-500" />
                  ) : (
                    <X className="inline-block w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {feature.tiers.tier1 ? (
                    <Check className="inline-block w-4 h-4 text-green-500" />
                  ) : (
                    <X className="inline-block w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {feature.tiers.tier2 ? (
                    <Check className="inline-block w-4 h-4 text-green-500" />
                  ) : (
                    <X className="inline-block w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {feature.tiers.tier3 ? (
                    <Check className="inline-block w-4 h-4 text-green-500" />
                  ) : (
                    <X className="inline-block w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center text-xs text-muted-foreground">
                  {feature.tiers.tier4 ? (
                    <Check className="inline-block w-4 h-4 text-green-500" />
                  ) : (
                    <X className="inline-block w-4 h-4 text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </section>
      <section className="mb-10 space-y-6">
        {/* External Models Card */}
        <Card className="rounded-lg bg-background border border-borderColorPrimary p-6">
          <div className="flex items-start space-x-4">
            <Share2 className="h-5 w-5 text-muted-foreground font-bold mt-1" />
            <div>
              <h3 className="font-semibold  mb-2">
                How We Handle External Models
              </h3>
              <p className="text-muted-foreground">
                We integrate models from multiple providers (e.g. OpenAI, Stability, ElevenLabs, etc.). 
                While we don't own these models, we enable you to interact with them seamlessly via our API. 
                Your usage may be subject to the underlying provider's availability and policies.
              </p>
            </div>
          </div>
        </Card>

        {/* Upgrade Info Card */}
        <div className="rounded-lg  bg-background border border-borderColorPrimary p-6">
          <div className="flex items-start space-x-4">
            <CreditCard className="h-5 w-5 text-muted-foreground font-bold mt-1" />
            <div>
              <h3 className="font-semibold  mb-2">
                How to Upgrade
              </h3>
              <p className="text-muted-foreground">
                You can upgrade your tier by purchasing API credits. Your tier is based on your total spend across all time. 
                To upgrade, go to <span className="font-medium">Billing {'>'} Purchase Credits</span> in your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <NavigationContainer
        previousTitle="Pricing"
        // previousDescription="Learn about fine-tunning inputs"
        preUrl="/docs/user-guides/prompts"
        nextTitle="Api Reference"
        // nextDesciption="Learn about error handlings"
        nextUrl="/docs/user-guides/error-codes"
      />
    </div>
  );
};

export default RateLimits;
