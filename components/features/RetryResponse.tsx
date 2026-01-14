import { RefreshCw } from "lucide-react";
import Image from "next/image";

const RetryResponse = ({ model, onRetry }: { 
    model: { model_name: string; model_image: string; }; 
    onRetry: () => void; 
  }) => {
    return (
      <div 
        className="flex flex-col items-start p-4 rounded-md border border-red-500/50 bg-background hover:bg-secondary/80 transition-colors cursor-pointer group"
        onClick={onRetry}
      >
        <div className="flex items-center justify-center w-full space-x-2">
          <div className="relative flex items-center gap-2">
            <Image
              src={model.model_image}
              alt={model.model_name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap overflow-auto scrollbar-none">
              {model.model_name}
            </span>
          </div>
        </div>
        <div className="w-full mt-3 flex items-center justify-center gap-2 text-red-500">
          <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
          <span className="text-sm">Click to retry</span>
        </div>
      </div>
    );
  };

  export default RetryResponse;