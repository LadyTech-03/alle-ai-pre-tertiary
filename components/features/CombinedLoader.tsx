import { useMemo } from "react";
import { MultiStepLoaderInline } from "@/components/ui/multi-step-loader";

interface CombinedLoaderProps {
  modelNames: string[];
}

export function CombinedLoader({ modelNames }: CombinedLoaderProps) {
  const loadingStates = useMemo(
    () => [
      { text: `Combining ${modelNames.join(' & ')}` },
      { text: `${modelNames.join(' & ')} working together` },
      { text: `Creating a unified response` },
    ],
    [modelNames]
  );

  return (
    <div className="max-w-full mx-4 mt-1">
      <MultiStepLoaderInline
        loadingStates={loadingStates}
        loading={true}
        duration={1500}
        loop={true}
      />
    </div>
  );
}