"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown  } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useSidebarStore } from "@/stores";


interface ScrollToBottomProps {
  className?: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  content?: any;
}

export function ScrollToBottom({ className, scrollAreaRef, content }: ScrollToBottomProps) {
  const [showButton, setShowButton] = useState(false);
  const userScrolledRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const { isOpen } = useSidebarStore();
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const scrollToBottom = () => {
    const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      const scrollHeight = (scrollViewport as HTMLElement).scrollHeight;
      (scrollViewport as HTMLElement).scrollTo({
        top: scrollHeight,
        behavior: "smooth"
      });
    }
  };

  // Handle scroll events
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollViewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollViewport as HTMLElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // Detect if scroll was initiated by user
      if (Math.abs(scrollTop - lastScrollTopRef.current) > 0) {
        userScrolledRef.current = true;
        setShowButton(true); // Show button when user starts scrolling
        // Reset after 2 seconds of no scrolling
        setTimeout(() => {
          userScrolledRef.current = false;
          setShowButton(false); // Hide button after scrolling stops
        }, 3000);
      }
      
      lastScrollTopRef.current = scrollTop;
      setShowButton(!isNearBottom && userScrolledRef.current);
    };

    scrollViewport.addEventListener('scroll', handleScroll);
    
    return () => scrollViewport.removeEventListener('scroll', handleScroll);
  }, [scrollAreaRef]);

  // Auto-scroll on initial load and content changes
  useEffect(() => {
    // Don't auto-scroll if user has manually scrolled or if initial scroll is done
    if (userScrolledRef.current || initialScrollDone) return;

    const timeoutId = setTimeout(() => {
      const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        const { scrollHeight, clientHeight } = scrollViewport as HTMLElement;
        if (scrollHeight > clientHeight) {
          scrollToBottom();
          setInitialScrollDone(true); // Mark initial scroll as done
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [content]);

  // Reset user scroll flag when clicking the scroll button
  const handleManualScrollToBottom = () => {
    userScrolledRef.current = false;
    scrollToBottom();
  };

  if (!showButton) return null;

  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        ` bg-foreground border border-borderColorPrimary fixed bottom-36 ${isOpen ? "right-[43%]" : "right-[50%]"} rounded-full shadow-md opacity-90 hover:opacity-100 transition-all duration-300`,
        className
      )}
      onClick={handleManualScrollToBottom}
    >
      <ArrowDown  className="h-4 w-4" />
    </Button>
  );
}