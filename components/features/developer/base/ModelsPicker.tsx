"use client";

import { useState, useEffect } from "react";
import { modelsApi, ModelType } from "@/lib/api/models";
import {
  Check,
  ChevronsUpDown,
  Loader,
  RefreshCw,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useModelAPIStore, ModelOption } from "@/stores/developer-benchmark";

interface ModelSelectorProps {
  modelType: ModelType; // Required: 'chat', 'image', 'audio', 'video' etc.
  subType?: string; // Optional: more specific filter if needed
  selectedModels: string[]; // Currently selected model UIDs
  onSelectionChange: (models: string[]) => void; // Callback when selection changes
  maxSelections?: number; // Optional: limit number of selections
  width?: string; // Optional: customize width (default: "280px")
  placeholder?: string; // Optional: placeholder text (default: "Add models...")
  buttonClassName?: string; // Optional: additional class names for button
}

export default function ModelsPicker({
  modelType,
  subType,
  selectedModels,
  onSelectionChange,
  maxSelections,
  width = "280px",
  placeholder = "Add models...",
  buttonClassName = "",
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [modelLoadError, setModelLoadError] = useState<boolean>(false);
  const [modelsOpen, setModelsOpen] = useState<boolean>(false);

  // Get store methods
  const { getModels, setModels: storeSetModels } = useModelAPIStore();

  // Fetch models on component mount or when modelType/subType changes
  useEffect(() => {
    loadModels();
  }, [modelType, subType]);

  const loadModels = async () => {
    // First check if models already exist in the store
    const cachedModels = getModels(modelType, subType);

    // If we have models in the store, use them and skip API call
    if (cachedModels.length > 0) {
      setModels(cachedModels);
      setIsLoadingModels(false);
      return;
    }

    // If no cached models, fetch from API
    await fetchModels();
  };

  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelLoadError(false);

    try {
      const modelData = await modelsApi.getModels(modelType);

      // Transform API model data to the format needed for dropdown
      const modelOptions: ModelOption[] = modelData.map((model) => ({
        value: model.model_uid,
        label: model.model_name,
        model_category: model.model_category,
        valid_inputs: model.valid_inputs,
      }));

      // Store all models in the cache
      storeSetModels(modelType, modelOptions);

      // If subType provided, filter for UI display
      //  for image models
      if (modelType === "image") {
        if (subType) {
          const displayModels = modelOptions.filter((model) =>
            model.valid_inputs?.includes(subType)
          );
          setModels(displayModels);
          setIsLoadingModels(false);
          return;
        }
      }
      const displayModels = subType
        ? modelOptions.filter((model) => model.model_category === subType)
        : modelOptions;

      setModels(displayModels);
      setIsLoadingModels(false);
    } catch (error) {
      setModelLoadError(true);
      setIsLoadingModels(false);
    }
  };

  // Handle model selection/deselection
  const handleSelect = (modelValue: string) => {
    onSelectionChange(
      selectedModels.includes(modelValue)
        ? selectedModels.filter((item) => item !== modelValue)
        : maxSelections && selectedModels.length >= maxSelections
        ? [...selectedModels.slice(1), modelValue] // Replace oldest selection if max reached
        : [...selectedModels, modelValue]
    );
  };

  return (
    <div className="flex flex-col">
      <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={modelsOpen}
            className={cn(
              "justify-between border-borderColorPrimary bg-background",
              buttonClassName
            )}
            style={{ width }}
          >
            {selectedModels.length > 0
              ? `${selectedModels.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={`p-0 bg-backgroundSecondary border-borderColorPrimary`}
          style={{ width }}
        >
          <Command className="bg-backgroundSecondary">
            <CommandInput
              className="h-8 border-borderColorPrimary"
              placeholder="Search models..."
            />
            <div className="relative">
              <ScrollArea
                className="overflow-auto"
                style={{
                  maxHeight: "300px",
                  minHeight: "100px",
                  height: "auto",
                }}
              >
                {/* Selected models section at the top */}
                {selectedModels.map((modelId) => {
                  const model = models.find((m) => m.value === modelId);
                  if (!model) return null;

                  return (
                    <CommandItem
                      key={`selected-${model.value}`}
                      value={`selected-${model.value}`}
                      className="hover:bg-backgroundPrimary/10 transition-colors duration-150 px-2 py-1.5"
                      onSelect={() => handleSelect(model.value)}
                    >
                      <div className="flex items-center w-full">
                        <Check className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="truncate text-sm">{model.label}</span>
                      </div>
                    </CommandItem>
                  );
                })}

                {/* Unselected models */}
                <CommandGroup className="pt-1">
                  {isLoadingModels ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : modelLoadError ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground mb-2">
                        Failed to load models
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchModels}
                        className="bg-primary/10 hover:bg-primary/20 text-primary"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : models.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No models available
                    </div>
                  ) : (
                    // Filter out already selected models
                    models
                      .filter((model) => !selectedModels.includes(model.value))
                      .map((model) => (
                        <CommandItem
                          key={model.value}
                          value={model.value}
                          className="hover:bg-hoverColorPrimary transition-colors duration-150 px-2 py-1.5"
                          onSelect={() => handleSelect(model.value)}
                        >
                          <div className="flex items-center w-full">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0 transition-opacity opacity-0"
                              )}
                            />
                            <span className="truncate text-sm">
                              {model.label}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                  )}
                </CommandGroup>
              </ScrollArea>
            </div>
            <div className="border-t border-borderColorPrimary p-2 sticky bottom-0 bg-backgroundSecondary z-10">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 bg-primary/10 hover:bg-primary/20 text-primary"
                        onClick={() => setModelsOpen(false)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Apply selections</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500"
                        onClick={() => onSelectionChange([])}
                        disabled={selectedModels.length === 0}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all selections</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
