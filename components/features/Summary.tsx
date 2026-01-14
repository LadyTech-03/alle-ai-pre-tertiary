'use client';

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface SummaryProps {
  isGenerating?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function Summary({ isGenerating = false, isActive = false, onClick }: SummaryProps) {
  const { resolvedTheme } = useTheme();

  if (isGenerating){
    // console.log('Generating the summray')
  }
  // console.log('testing')

  return (
    <AnimatePresence mode="wait">
      {isGenerating ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-start gap-2 py-2 px-[5%]
          bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient
          "
        >
          <Loader className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Comparing model responses</span>
        </motion.div>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex justify-start py-2 px-[5%]"
        >
          <div className="relative">
            {/* Animated gradient background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ 
                duration: 2,
                times: [0, 0.5, 1],
                repeat: 2
              }}
              className={cn(
                "absolute inset-0 rounded-md blur-xl",
                resolvedTheme === 'dark' 
                  ? "bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30"
                  : "bg-gradient-to-r from-blue-400 via-purple-500/20 to-blue-400"
              )}
            />
            
            {/* Button with pulsing border */}
            <Button
              variant="outline"
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-sm transition-all",
                "border-2",
                isActive ? "border-primary bg-primary/10" : "hover:border-primary/50",
              )}
              onClick={onClick}
            >
              <Image
                src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-mini.webp" : "/svgs/logo-desktop-mini-dark.webp"}
                alt="Summary"
                width={16}
                height={16}
                className="rounded-full"
              />
              <span>Comparison</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}