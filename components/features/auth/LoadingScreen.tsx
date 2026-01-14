"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"
import { Loader } from "lucide-react";

const aiLogos = [
  { src: "/models/deepseek.webp", alt: "OpenAI" },
  { src: "/models/gpt-4o.webp", alt: "Anthropic" },
  { src: "/models/gemini.webp", alt: "Gemini" },
  { src: "/models/stability-ai.webp", alt: "Stability AI" },
  { src: "/models/mistral-ai.webp", alt: "Mistral" },
  { src: "/models/perplexity-ai.webp", alt: "Perplexity" },
  { src: "/models/claude-3.webp", alt: "Claude" },
  { src: "/models/meta.webp", alt: "Meta" },
  { src: "/models/grok.webp", alt: "Grok" },
  { src: "/models/kling.webp", alt: "Kling" },
  { src: "/models/luma.webp", alt: "Luma" },
  { src: "/models/midjourney.webp", alt: "Midjourney" },
  { src: "/models/amazon.webp", alt: "Titan" },
  { src: "/models/copilot.webp", alt: "Copilot" },
  { src: "/models/microsoft.webp", alt: "Microsoft" },
  // Add more AI company logos as needed
];

// Fixed positions for consistent hydration
const fixedPositions = [
  { x: 200, y: 200 },
  { x: -200, y: 200 },
  { x: 200, y: -200 },
  { x: -200, y: -200 },
  { x: 300, y: 0 },
  { x: -300, y: 0 },
  { x: 0, y: 300 },
  { x: 0, y: -300 },
  { x: 150, y: 150 },
  { x: -200, y: 200 },
  { x: 200, y: -200 },
  { x: 300, y: 0 },
  { x: 0, y: -300 },
  { x: -200, y: 200 },
  { x: 200, y: -200 },
];


export function LoadingScreen() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/svgs/logo-desktop-mini.webp");

  const pathname = usePathname();

  // Get the current pathname and determine which loading message to show
  const getLoadingMessage = (pathname: string): string => {
    switch (true) {
      case pathname.startsWith("/auth"):
        return "Authenticating your account";
      case pathname.startsWith("/plans"):
        return "Fetching available plans";
      case pathname.startsWith("/manage-subscription"):
        return "Fetching subscription info";
      case pathname.startsWith("/developer"):
        return "Loading developer workspace";
      case pathname.startsWith("/chat"):
        return "Loading Chat interface";
      case pathname.startsWith("/image"):
        return "Loading Image interface";
      case pathname.startsWith("/audio"):
        return "Loading Audio interface";
      case pathname.startsWith("/audio"):
        return "Loading Video interface";
      default:
        return "Loading your workspace";
    }
  }

  const useLoadingMessage = (): string => {
    const pathname = usePathname();
    return getLoadingMessage(pathname);
  }

  const loadingMessage = useLoadingMessage();


  useEffect(() => {
    setMounted(true);
    setLogoSrc(resolvedTheme === "dark" 
      ? "/svgs/logo-desktop-mini.webp" 
      : "/svgs/logo-desktop-mini-dark.webp"
    );
  }, [resolvedTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* Main Logo */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src={logoSrc}
          alt="Alle-AI"
          width={80}
          height={80}
          className="relative z-10"
        />
      </motion.div>

      {/* Orbiting AI Logos */}
      <AnimatePresence>
        {aiLogos.map((logo, index) => (
          <motion.div
            key={logo.alt}
            className="absolute"
            initial={{
              opacity: 0,
              scale: 0,
              x: fixedPositions[index].x,
              y: fixedPositions[index].y,
            }}
            animate={{
              opacity: 1,
              scale: [0, 1, 0],
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 3,
              delay: index * 0.5,
              repeat: Infinity,
              repeatDelay: aiLogos.length * 0.5,
            }}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={40}
              height={40}
              className="rounded-full shadow-lg"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Optional loading text */}
      <motion.p
        className="md:text-xl absolute bottom-10 text-muted-foreground flex items-center gap-2"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Loading Message */}
        {loadingMessage}
        <Loader className="w-4 h-4 text-muted-foreground animate-spin" />
      </motion.p>
    </div>
  );
}