"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const aiLogos = [
  { src: "/models/deepseek.webp", alt: "OpenAI" },
  { src: "/models/gpt-4o.webp", alt: "Anthropic" },
  { src: "/models/gemini.webp", alt: "Gemini" },
  // ... you can reduce the number of logos for a smaller version
].slice(0, 6); // Using fewer logos for the smaller component

const getLogoSizes = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: { main: 40, orbit: 20, orbit_distance: 100 },
    md: { main: 60, orbit: 30, orbit_distance: 150 },
    lg: { main: 80, orbit: 40, orbit_distance: 200 },
  };
  return sizes[size];
};

// Adjusted positions based on size
const getFixedPositions = (distance: number) => [
  { x: distance, y: 0 },
  { x: -distance, y: 0 },
  { x: 0, y: distance },
  { x: 0, y: -distance },
  { x: distance * 0.7, y: distance * 0.7 },
  { x: -distance * 0.7, y: -distance * 0.7 },
];

export function AlleAILoader({ size = 'md', showText = false, className = '' }: LogoLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/svgs/logo-desktop-mini.webp");
  const logoSizes = getLogoSizes(size);
  const positions = getFixedPositions(logoSizes.orbit_distance);

  useEffect(() => {
    setMounted(true);
    setLogoSrc(resolvedTheme === "dark" 
      ? "/svgs/logo-desktop-mini.webp" 
      : "/svgs/logo-desktop-mini-dark.webp"
    );
  }, [resolvedTheme]);

  if (!mounted) return null;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
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
          width={logoSizes.main}
          height={logoSizes.main}
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
              x: positions[index].x,
              y: positions[index].y,
            }}
            animate={{
              opacity: 1,
              scale: [0, 1, 0],
              x: 0,
              y: 0,
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
              width={logoSizes.orbit}
              height={logoSizes.orbit}
              className="rounded-full shadow-lg"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {showText && (
        <motion.p
          className="absolute -bottom-8 text-muted-foreground text-sm"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading...
        </motion.p>
      )}
    </div>
  );
}