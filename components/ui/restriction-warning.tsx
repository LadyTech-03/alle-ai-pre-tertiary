"use client"

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PlansModal } from "./modals";

interface RestrictionWarningProps {
  message: string;
  comebackTime: string;
  className?: string;
}

export function RestrictionWarning({ 
  message,
  comebackTime,
  className
}: RestrictionWarningProps) {

  const [plansModalOpen, setPlansModalOpen] = useState(false);

  return (<>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div 
        className={cn(
          "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-2xl text-[14px] backdrop-blur-sm w-full text-orange-600 dark:text-orange-400",
        //   "bg-red-500/10 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50",
          // "bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
          className
        )}
      >
        {/* <Clock className="h-3 w-3 flex-shrink-0" /> */}
        <span className="text-center">
          {message} Try again at <span className="font-bold">{comebackTime}</span> or <span onClick={() => {setPlansModalOpen(true)}} className="cursor-pointer underline font-bold text-blue-500">UPGRADE</span>
        </span>
      </div>
    </motion.div>
    <PlansModal
      isOpen={plansModalOpen}
      onClose={() => setPlansModalOpen(false)}
    />
    </>
  );
} 