import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuickLoader({ size = "md", className }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-center justify-center space-x-2">
        <div className="relative">
          <div>
            <Loader className={cn(
            "animate-spin text-muted-foreground",
            size === "sm" && "w-6 h-6",
            size === "md" && "w-8 h-8",
            size === "lg" && "w-12 h-12"
          )}/>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">
        Setting up your conversation...
      </p>
    </div>
  );
}