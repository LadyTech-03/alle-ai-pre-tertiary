'use client'

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface NavbarProps {
  linkText: string;
  linkUrl?: string;
}

export default function Navbar({ linkText, linkUrl }: NavbarProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background mb-6 sm:mb-0 mx-auto flex justify-between md:justify-around items-center p-2 z-10">
      <div className="text-xl font-bold">
        {mounted && (
          <a href="https://app.alle-ai.com">
            <Image 
            src={theme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"} 
            alt="Alle-AI Logo" 
            width={125} 
            height={125} />
          </a>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <ThemeToggle />
        <a href="https://app.alle-ai.com" className="text-muted-foreground hover:underline">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative w-8 h-8 p-1 rounded-full text-muted-foreground border border-borderColorPrimary select-none"
          >
            <Home className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </nav>
  );
}