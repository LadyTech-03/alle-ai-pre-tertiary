"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-6 h-6 ", className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6 ", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  const rowHeight = 30; // px per step slot

  return (
    <div className="relative w-full h-full">
      {loadingStates.map((loadingState, index) => {
        const offset = (index - value) * rowHeight;
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.3, 0.15);

        return (
          <motion.div
            key={index}
            className={cn("absolute left-0 right-0 top-1/2 -translate-y-1/2 text-left flex gap-2 items-center justify-start px-0")}
            animate={{ y: offset, opacity, scale: distance === 0 ? 1 : 0.99 }}
            transition={{ duration: 0.7 }}
          >
            <div>
              {index > value && (
                <CheckIcon className={cn(
                  "text-xs text-muted-foreground opacity-50 h-4 w-4",
                )} />
              )}
              {index <= value && (
                <CheckFilled
                  className={cn(
                    "text-xs text-muted-foreground opacity-50 h-4 w-4",
                    value === index && "text-foreground opacity-100 w-4 h-4"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-xs sm:text-sm text-muted-foreground opacity-50",
                value === index && "text-foreground opacity-100 w-fit  "
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 3000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl"
        >
          <div className="h-96  relative">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>

          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Inline variant: renders only the steps without full-screen overlay
export const MultiStepLoaderInline = ({
  loadingStates,
  loading = true,
  duration = 2000,
  loop = true,
  className,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  className?: string;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  if (!loading) return null;

  return (
    <div className={cn("w-full relative overflow-hidden", className)}>
      {/* Fixed-height viewport with gradient fade on top/bottom */}
      <div className="relative h-20 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0),rgba(0,0,0,1)_15%,rgba(0,0,0,1)_85%,rgba(0,0,0,0))]">
        <LoaderCore value={currentState} loadingStates={loadingStates} />
      </div>
    </div>
  );
};
