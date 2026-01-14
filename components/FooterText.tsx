"use client"

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";


export function FooterText({ className }: { className?: string }) {
  const [textIndex, setTextIndex] = useState(0);
  const pathname = usePathname();


  const texts = [
    "Alle-AI: Your all-in-one AI Platform",
    "Alle-AI: Combine and compare AI models",
    "Alle-AI: Explore innovative AI solutions",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((current) => (current + 1) % texts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`overflow-hidden mt-2 ${className}`}>
        <AnimatePresence mode="wait">
        <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center text-[0.6rem] sm:text-xs w-full text-muted-foreground"
        >
            {texts[textIndex]}
        </motion.p>
        </AnimatePresence>
    </div>
  );
}
