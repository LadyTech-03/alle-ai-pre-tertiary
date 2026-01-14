import React from 'react';
import { cn } from '@/lib/utils';
import { Gem } from 'lucide-react';

interface UpgradePillProps {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const UpgradePill: React.FC<UpgradePillProps> = ({ 
  className, 
  onClick,
  children = "Upgrade"
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center",
        "px-3 py-1.5 rounded-full",
        "text-xs font-medium text-slate-800 dark:text-white",
        "transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-95",
        "shadow-lg hover:shadow-xl",
        "overflow-hidden",
        "cursor-pointer",
        "border border-slate-300/50 dark:border-white/20",
        
        // Premium gradient background - adaptive for light/dark mode
        "bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200",
        "dark:bg-gradient-to-r dark:from-blue-600 dark:via-purple-600 dark:to-pink-600",
        "bg-[length:200%_200%]",
        "animate-gradient",

        // "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200",
        // "dark:bg-gradient-to-r dark:from-slate-700 dark:via-slate-600 dark:to-slate-700",
        // "bg-[length:200%_200%]",
        // "animate-gradient",
        
        // Shiny overlay effect
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "dark:before:bg-gradient-to-r dark:before:from-transparent dark:before:via-white/30 dark:before:to-transparent",
        "before:translate-x-[-100%] before:transition-transform before:duration-700",
        "hover:before:translate-x-[100%]",
        
        // Inner glow effect
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-slate-200/20 after:via-slate-100/30 after:to-slate-200/20",
        "dark:after:bg-gradient-to-r dark:after:from-white/10 dark:after:via-white/20 dark:after:to-white/10",
        "after:rounded-full after:opacity-0 after:transition-opacity after:duration-300",
        "hover:after:opacity-100",
        
        // Text styling
        "relative z-10",
        "text-shadow-sm",
        "drop-shadow-sm",
        
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/30 to-transparent dark:via-white/20 animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <span className="relative z-20 flex items-center gap-1">
        <Gem className="w-3 h-3" />
        {children}
      </span>
    </button>
  );
};

export default UpgradePill;
