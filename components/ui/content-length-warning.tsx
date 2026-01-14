"use client";

import { useState } from "react";
import { AlertTriangle, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";

interface ContentLengthWarningProps {
  percentage?: number;
  className?: string;
  type?: 'length' | 'incompatible-models';
  message?: string;
  models?: string[];
}

export function ContentLengthWarning({ 
  percentage, 
  className,
  type = 'length',
  message,
  models = []
}: ContentLengthWarningProps) {
  // Calculate excess percentage
  const excessPercentage = percentage ? Math.round(percentage - 100) : 0;
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);

  return (
  <>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-1"
    >
      <div 
        className={cn(
          "flex items-center justify-center gap-1.5 p-3 rounded-3xl text-[14px] backdrop-blur-sm w-full",
          // type === 'length' ? (
          //   percentage && percentage > 100 
          //     ? " text-amber-800" 
          //     : " text-amber-800"
          // ) : "text-amber-800",
          className
        )}
      >
        {/* <AlertTriangle className="h-4 w-4 flex-shrink-0" /> */}
        <span className="text-center text-orange-500">
          {type === 'length' ? (
            <>
              Context length exceeded by <span className="font-medium">{excessPercentage}%</span>. 
              Please reduce your content to continue.
            </>
          ) : (
            <>
              <span>{models.length > 1 ? 'These models' : 'This model'} </span>
              {models.length > 0 && (
                <span className="font-bold text-orange-500">({models.join(', ')}) </span>
              )}
              <span>
                {message || "Does not support image uploads"}
              </span>
            </>
          )}
        </span>
        {/* {type !== 'length' && (
          <Button 
          onClick={() => setModelSelectionModalOpen(true)}
          size="sm" 
          className="rounded-full text-xs"
          >
            Switch Models
          </Button>
        )} */}
      </div>
    </motion.div>
    <ModelSelectionModal
      isOpen={modelSelectionModalOpen}
      onClose={() => setModelSelectionModalOpen(false)}
    />
  </>
  );
}