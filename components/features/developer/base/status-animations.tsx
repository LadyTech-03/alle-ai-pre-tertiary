"use client";

import { motion } from "framer-motion";

interface StatusAnimationProps {
  count?: number;
}

export const StatusAnimations = {
  InQueue: function InQueueAnimation({ count }: StatusAnimationProps) {
    return (
      <div className="relative flex items-center gap-1">
        {/* Core dot */}
        <div className="relative flex items-center justify-center h-5 w-5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />

          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-amber-400"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />

          {/* Second pulsing ring with delay for smoother effect */}
          <motion.div
            className="absolute inset-0 rounded-full border border-amber-400"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{
              duration: 1.5,
              delay: 0.75,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
        </div>
        {count !== undefined && (
          <span className="text-xs font-medium text-amber-500">{count}</span>
        )}
      </div>
    );
  },

  Done: function DoneAnimation({ count }: StatusAnimationProps) {
    return (
      <div className="relative flex items-center gap-1">
        <div className="relative flex items-center justify-center h-5 w-5">
          <motion.div
            className="h-2 w-2 rounded-full bg-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />

          <motion.div
            className="absolute inset-0 rounded-full border border-green-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
          />
        </div>
        {count !== undefined && (
          <span className="text-xs font-medium text-green-500">{count}</span>
        )}
      </div>
    );
  },
};
