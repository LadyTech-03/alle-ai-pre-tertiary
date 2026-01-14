"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function PrivacyContent() {
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[1000px]"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-foreground mb-2">Privacy Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your data retention and feedback preferences.
        </p>
      </motion.div>

      {/* Data Retention Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="border-borderColorPrimary bg-backgroundSecondary p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Data retention</h2>
                <p className="text-sm text-muted-foreground">
                  Control how long your data is stored
                </p>
              </div>
              <Badge 
                variant="outline" 
                className="bg-primary/10 text-primary border-0"
              >
                30 days
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                The data retention period only applies to inputs and outputs sent via the Alle-AI API, 
                and not to Workbench or any other products.
              </p>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-1 text-primary" />
                <p>
                  If you'd like to inquire about changing your organization's data retention period, please{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="text-sm text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-primary hover:underline">
                terms of service
              </Link>
            </div>
          </div>
        </Card>

        {/* Feedback Section */}
        <Card className="border-borderColorPrimary bg-backgroundSecondary p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Feedback</h2>
                <p className="text-sm text-muted-foreground">
                  Help improve our models with your feedback
                </p>
              </div>
              <Switch
                checked={feedbackEnabled}
                onCheckedChange={setFeedbackEnabled}
              />
            </div>

            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                When enabled, reports include the full prompt, response, and feedback for future improvements to our platform.
                Your feedback helps us enhance the quality and reliability of our services.
              </p>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-1 text-primary" />
                <p>
                  All feedback data is handled in accordance with our privacy policy and data retention guidelines.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}