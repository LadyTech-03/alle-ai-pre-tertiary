"use client";

import { useEffect, useState } from "react"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
 import { ThemeToggle } from "../ui/theme-toggle";
import { useRouter } from "next/navigation";
import { usePendingChatStateStore } from "@/stores";

export function PublicHeader() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { pending, setPending } = usePendingChatStateStore();


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    setPending({
      link: pathname,
    });
    router.push("/auth?mode=login");
  };

  const handleSignup = () => {
    setPending({
      link: pathname,
    });
    router.push("/auth?mode=register");
  };


  return (
    <>
      {/* Compact overlay on large screens: logo left, actions right */}
      <div className="hidden lg:block pointer-events-none">
        <div className="absolute top-4 left-4 z-40 pointer-events-auto">
          <Link href={"/"} className="inline-flex items-center gap-2">
          {mounted && (
            <Image 
            src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"}
            alt="Logo"
            width={100}
            height={30}
            className="rounded object-contain"
            priority
            />
          )}
          </Link>
        </div>
        <div className="absolute top-4 right-4 z-40 pointer-events-auto inline-flex items-center gap-2">
          <ThemeToggle />
            <Button onClick={()=>{handleLogin()}} variant="outline" size="sm">Login</Button>
            <Button onClick={()=>{handleSignup()}} size="sm">Sign up</Button>
        </div>
      </div>

      {/* Real header bar on md and smaller screens */}
      <div className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-12 flex items-center justify-between px-3">
          <Link href={"/"} className="inline-flex items-center gap-2">
            {mounted && (
            <Image 
            src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"}
            alt="Logo"
            width={100}
            height={30}
            className="rounded object-contain"
            priority
            />
            )}
          </Link>
          <div className="inline-flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={()=>{handleLogin()}} variant="ghost" size="sm">Login</Button>
            <Button onClick={()=>{handleSignup()}} size="sm">Sign up</Button>
          </div>
        </div>
      </div>
    </>
  );
}


