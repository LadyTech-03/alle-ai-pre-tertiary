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
    <div className="max-w-md mx-auto">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Image
          src={logoSrc}
          alt="alle-ai"
          width={120}
          height={120}
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENrLzA7YWNpPqRYXmWBgoaUaWpslmyChpmjj5qoj4+v/9j/"
          className="transition-opacity duration-300"
        />
      </div>

      {/* Heading */}
      <h1 className="text-center text-lg font-semibold mb-6 min-h-[28px]">
        {displayText}
        <span className="animate-blink">|</span>
      </h1>

      {/* Auth form container */}
      <div>
        <h2 className="text-muted-foreground mb-6 text-center">
          {authMode === 'login' && 'Login to your account'}
          {authMode === 'create-session' && 'Start Your Session'}
        </h2>

        <AnimatePresence mode="wait">
          {renderAuthContent()}
        </AnimatePresence>
      </div>
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