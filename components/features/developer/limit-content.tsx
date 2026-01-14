"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Gauge, ArrowRight, Zap, Shield } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Tier 1",
    badge: "BRONZE",
    description: "Perfect for testing and small projects",
    limits: {
      requests: 10,
      inputTokens: 20000,
      outputTokens: 4000,
    }
  },
  {
    name: "Tier 2",
    badge: "SILVER",
    description: "Ideal for growing applications",
    limits: {
      requests: 60,
      inputTokens: 100000,
      outputTokens: 20000,
    }
  },
  {
    name: "Tier 3",
    badge: "GOLD",
    description: "For high-performance applications",
    limits: {
      requests: 120,
      inputTokens: 200000,
      outputTokens: 40000,
    }
  }
];

export function Limits() {
  return (
    <TooltipProvider>
      <div className="w-full max-w-[1200px]">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">Rate Limits</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rate limits help us ensure consistent API performance and availability. Each tier comes with its own set of limits that apply across all models.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid gap-6 mb-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-borderColorPrimary bg-backgroundSecondary p-6">
                <div className="flex flex-col gap-6">
                  {/* Tier Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{tier.name}</h3>
                        <Badge
                            variant={tier.badge.toLowerCase() as "bronze" | "silver" | "gold"}
                            className={cn(
                              "border-0 font-semibold px-3 py-1 rounded-full",
                            )}
                          >
                            {tier.badge}
                          </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Limits Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Requests per minute */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gauge className="h-4 w-4" />
                        Requests/min
                        <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Maximum number of API requests allowed per minute
                          </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>

                      </div>
                      <p className="text-2xl font-semibold text-foreground">
                        {tier.limits.requests}
                      </p>
                    </div>

                    {/* Input Tokens */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        Input Tokens/min
                        <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Maximum number of input tokens allowed per minute
                          </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-2xl font-semibold text-foreground">
                        {tier.limits.inputTokens.toLocaleString()}
                      </p>
                    </div>

                    {/* Output Tokens */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        Output Tokens/min
                        <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Maximum number of output tokens allowed per minute
                          </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-2xl font-semibold text-foreground">
                        {tier.limits.outputTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Limits Section */}
        <Card className="border-borderColorPrimary bg-backgroundSecondary p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Need higher limits?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our team to discuss custom rate limits for your specific needs.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}