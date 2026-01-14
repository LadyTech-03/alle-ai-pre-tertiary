"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const ProcessingAnimation = () => {
  // Shared duration for synchronization
  const animationDuration = 1.2; // 2 seconds instead of 3, making it faster

  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="relative mb-4">
        {/* Pulsing background effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: animationDuration,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(90deg, var(--primary-300), var(--primary-500))",
            filter: "blur(8px)",
          }}
        />

        {/* Spinning loader */}
        <motion.div
          className="relative flex items-center justify-center w-12 h-12 bg-background rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: animationDuration, // Now matches the dots timing
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Loader2 className="w-6 h-6 text-primary" />
        </motion.div>
      </div>

      {/* Text and bouncing dots */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Processing Request
        </h3>
        <div className="flex justify-center">
          <motion.div
            className="flex space-x-1.5 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Bouncing dots - now synchronized */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: animationDuration, // Same duration as spinner
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * (animationDuration / 6), // Proportional delay
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
