"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { SessionForm } from "@/components/features/auth/SessionForm";
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/features/auth/LoadingScreen';
import { usePendingChatStateStore } from '@/stores';

import { sendGAEvent } from '@next/third-parties/google'


type AuthMode = 'login' | 'create-session';

// Heading texts moved outside component to avoid useEffect dependency warning
const headingTexts = [
  "Your All-in-One AI Platform",
  "Combine & Compare AI models",
  "Goodbye to AI Hallucinations",
  "Fact-Check AI Response",
];

// Create an inner component for the auth page logic
function AuthPageInner() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [mounted, setMounted] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { setPending } = usePendingChatStateStore();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    let currentChar = 0;

    const typeText = () => {
      if (currentChar <= headingTexts[currentTextIndex].length) {
        setDisplayText(headingTexts[currentTextIndex].slice(0, currentChar));
        currentChar++;
        timeout = setTimeout(typeText, 50); // Adjust typing speed here
      } else {
        // Wait before starting to erase
        timeout = setTimeout(eraseText, 5000);
      }
    };

    const eraseText = () => {
      if (currentChar > 0) {
        setDisplayText(headingTexts[currentTextIndex].slice(0, currentChar));
        currentChar--;
        timeout = setTimeout(eraseText, 30); // Adjust erasing speed here
      } else {
        // Move to next text
        setCurrentTextIndex((prev) => (prev + 1) % headingTexts.length);
      }
    };

    typeText();

    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  // Read mode from URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') as AuthMode | null;

    if (mode && ['login', 'create-session'].includes(mode)) {
      setAuthMode(mode);
    }
  }, []);

  const renderAuthContent = () => {
    switch (authMode) {
      case 'login':
        return <LoginForm />;
      case 'create-session':
        return <SessionForm />;
    }
  };

  // Modify the logo section
  const logoSrc = mounted && resolvedTheme === 'dark'
    ? "/svgs/logo-desktop-full.webp"
    : "/svgs/logo-desktop-dark-full.webp";

  // Preload both logo variants
  useEffect(() => {
    const preloadImages = () => {
      const lightLogo = new window.Image();
      const darkLogo = new window.Image();
      lightLogo.src = "/svgs/logo-desktop-full.webp";
      darkLogo.src = "/svgs/logo-desktop-dark-full.webp";
    };

    if (typeof window !== 'undefined') {
      preloadImages();
    }
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {renderAuthContent()}
      </AnimatePresence>
    </div>
  );
}

// Main component wrapped in Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthPageInner />
    </Suspense>
  );
}