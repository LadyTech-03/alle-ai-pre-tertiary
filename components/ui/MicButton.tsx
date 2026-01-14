import { Button } from "@/components/ui/button";
import { AudioLines , MicOff, Mic } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  className?: string;
}

export function MicButton({ isListening, onClick, className }: MicButtonProps) {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={pathname.startsWith('/audio') ? 'outline': 'default'}
              size="icon"
              className={`flex-shrink-0 rounded-full ${pathname.startsWith('/audio')? 'border border-borderColorPrimary' : 'border-none'} h-9 w-9 focus-visible:outline-none transition-all duration-300 ${
                isListening 
                  ? 'bg-green-500/10 dark:bg-green-900/20' 
                  : ''
              } ${className}`}
              onClick={onClick}
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></span>
                  <MicOff  className="h-4 w-4 animate-pulse text-white" />
                  <span className="absolute inset-0 rounded-full border-2 border-borderColorPrimary animate-pulse"></span>
                </>
              ) : (
                <Mic  className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{isListening ? "Stop speaking" : "Start speaking"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}