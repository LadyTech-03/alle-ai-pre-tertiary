import { motion, AnimatePresence } from "framer-motion";
import { BadgeInfo } from "lucide-react";

interface LatencyWarningProps {
  isVisible: boolean;
  isWebSearch: boolean;
  feature: 'combine' | 'compare';
}

export function LatencyWarning({ isVisible, feature, isWebSearch }: LatencyWarningProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-2 w-full"
        >
          <div className="flex items-center justify-center text-orange-600 dark:text-orange-400 gap-1.5 px-2.5 py-1 rounded-lg text-[14px] bg-transparent backdrop-blur-sm w-full">
            <BadgeInfo className="h-4 w-4 flex-shrink-0" />
            {isWebSearch ? (
              <span className="text-center">
                Enabling Web search & {feature === 'combine' ? 'Combine' : 'Compare'} may slightly increase response time.
              </span>
            ) : (
              <span className="text-center">
                Combining models may slightly increase response time.
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 