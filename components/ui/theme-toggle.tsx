'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show the toggle after mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getTooltipText = () => {
    if (theme === 'light') {
      return 'Light';
    } else if (theme === 'dark') {
      return 'Dark';
    } else {
      return 'System';
    }
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="hidden md:flex w-8 h-8 p-1 text-muted-foreground rounded-full border border-borderColorPrimary"
          >
            <Sun 
              className={`h-[1.2rem] w-[1.2rem] transition-all ${
                theme === 'dark' ? 'scale-0 -rotate-90' : 
                theme === 'system' ? 'scale-0 rotate-90' : 
                'rotate-0 scale-100'
              }`}
            />
            <Moon 
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
                theme === 'dark' ? 'rotate-0 scale-100' : 
                theme === 'system' ? 'scale-0 rotate-90' : 
                'rotate-90 scale-0'
              }`}
            />
            <Monitor 
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
                theme === 'system' ? 'rotate-0 scale-100' : 
                'rotate-90 scale-0'
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}