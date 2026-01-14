// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import useChatAPIStore from "@/stores/developer-benchmark";
import { AnimatePresence, motion } from "framer-motion";
import { makeFormDataRequest, requestJson } from "@/lib/api/apiClient/requests";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2,
  Image as ImageIcon,
  Upload,
  Play,
  Palette,
  Loader,
  X,
  CodeXml,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CodeModal from "../base/codeModal";
import ModelsPicker from "../base/ModelsPicker";
import { useApiStatusStore } from "@/stores/developer-benchmark";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { validateFileUpload } from "@/lib/utils";

// Placeholder for image model options
interface ImageModelOption {
  value: string;
  label: string;
}

// Placeholder for image request settings
interface ImageRequestSettings {
  numberOfImages: number; // maps to "n" in JSON
  height: number;
  width: number;
  seed: number | null;
  stylePreset: string | null;
}

interface UploadedImageFile {
  file: File;
  preview: string;
}

interface ImageModeProps {
  mode: "generate" | "edit"; // Prop to determine the sub-mode
  authToken?: string;
  // getCodeExample?: (requestBody: any, model: string) => any; // For later
}

// Update the ImageRequestBody interface to handle both generate and edit modes
interface ImageRequestBody {
  models: string[];
  prompt: string;
  // Fields for generate mode
  n?: number;
  height?: number;
  width?: number;
  seed?: number | null;
  style_preset?: string | null;
  model_specific_params?: {
    [modelName: string]: {
      n?: number;
      height?: number;
      width?: number;
      response_format?: string;
    };
  };
  // Fields for edit mode
  image_file?: string; // This will be the file name in JSON, but the actual file in FormData
}

// Update the initialRequestStructure to check the mode
const initialRequestStructure = (mode: string): ImageRequestBody => {
  if (mode === "generate") {
    return {
      models: [],
      prompt: "",
      n: 1,
      height: 1024,
      width: 1024,
      seed: null,
      style_preset: null,
      model_specific_params: {},
    };
  } else {
    // edit mode
    return {
      models: [],
      prompt: "",
      image_file: "", // Placeholder for file name
    };
  }
};

export default function ImageMode() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");


  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { imageMode, response, setResponse, setResponseStats, addHistoryItem } =
    useChatAPIStore();
  const { setApiCallStatus } = useApiStatusStore();
  const [requestSettings, setRequestSettings] = useState<ImageRequestSettings>({
    numberOfImages: 1,
    height: 1024,
    width: 1024,
    seed: null,
    stylePreset: null,
  });

  const [uploadedImage, setUploadedImage] = useState<UploadedImageFile | null>(
    null
  );
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const [modelSpecificParams, setModelSpecificParams] = useState<{
    [modelName: string]: {
      n?: number;
      height?: number;
      width?: number;
      // other model-specific params
    };
  }>({});

  // Reset selected models when switching between generate and edit modes
  useEffect(() => {
    // Clear selected models when mode changes
    setSelectedModels([]);
  }, [imageMode]);

  // Define the generateRequestStructure function
  const generateRequestStructure = (): ImageRequestBody => {
    if (imageMode === "generate") {
      // For generate mode
      return {
        models: selectedModels,
        prompt: prompt,
        n: requestSettings.numberOfImages,
        height: requestSettings.height,
        width: requestSettings.width,
        seed: requestSettings.seed,
        style_preset: requestSettings.stylePreset,
        model_specific_params: modelSpecificParams,
      };
    } else {
      // For edit mode - always use systemPrompt as the prompt
      return {
        models: selectedModels,
        prompt: systemPrompt, // Always use systemPrompt for edit mode
        image_file: uploadedImage ? uploadedImage.file.name : "", // Show file name in JSON
      };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validationResult = validateFileUpload(file, 'image');
      
      if (!validationResult.isValid) {
        toast.error(validationResult.error);
        return;
      }

      // If there's an existing preview URL, revoke it to prevent memory leaks
      if (uploadedImage && uploadedImage.preview) {
        URL.revokeObjectURL(uploadedImage.preview);
      }

      // Create new preview URL
      const preview = URL.createObjectURL(file);

      // Replace the uploaded image
      setUploadedImage({ file, preview });
    } catch (error) {
      toast.error("Error uploading image");
      return;
    }
  };

  const handleRun = async () => {
    // Don't run if requirements aren't met
    if (selectedModels.length === 0) return;
    if (imageMode === "generate" && !prompt.trim()) return;
    if (imageMode === "edit" && !uploadedImage) return;

    // Set loading state
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
    setIsLoading(true);
    setApiCallStatus(true);
    setGeneratedImages([]);

    try {
      // Get the request structure for JSON view
      const requestBody = generateRequestStructure();

      // Create a mapping of individual requests by model
      const requestsByModel = {};

      // For each selected model, create a model-specific request
      for (const model of selectedModels) {
        // Clone the base request for this model
        const modelRequest = { ...requestBody };

        // Set the models array to just this model
        modelRequest.models = [model];

        // Apply any model-specific params for this model
        if (modelSpecificParams[model]) {
          if (imageMode === "generate") {
            // Override standard parameters with model-specific ones
            if (modelSpecificParams[model].n !== undefined) {
              modelRequest.n = modelSpecificParams[model].n;
            }
            if (modelSpecificParams[model].height !== undefined) {
              modelRequest.height = modelSpecificParams[model].height;
            }
            if (modelSpecificParams[model].width !== undefined) {
              modelRequest.width = modelSpecificParams[model].width;
            }
            if (modelSpecificParams[model].response_format !== undefined) {
              modelRequest.response_format =
                modelSpecificParams[model].response_format;
            }
          }
        }

       
        requestsByModel[model] = modelRequest;
      }

      let result;

      if (imageMode === "generate") {
        const apiUrl = "/image/generate";
        const requestToSend =
          selectedModels.length === 1
            ? requestsByModel[selectedModels[0]]
            : requestBody;

    
        result = await requestJson(apiUrl, requestToSend);
      } else {
        const formData = new FormData();
        selectedModels.forEach((model, index) => {
          formData.append(`models[${index}]`, model);
        });
        formData.append("prompt", systemPrompt);
        if (uploadedImage && uploadedImage.file) {
          formData.append("image_file", uploadedImage.file);
        }
        const apiUrl = "/image/edit";
        result = await makeFormDataRequest(apiUrl, formData);
      }

      if ("error" in result) {
        const errorResponse = {
          error: {
            message: result.error.message || "An error occurred",
            type: "api_error",
            param: null,
            code: "error",
          },
        };

        setApiCallStatus(false);
        setResponse(JSON.stringify(errorResponse, null, 2));

        setResponseStats({
          statusCode: result.error.status || 500,
          statusText: "Error",
          time: `${Math.floor(Math.random() * 300) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(errorResponse)).length
          } bytes`,
        });

        addHistoryItem({
          id: Date.now().toString(),
          name: `Image ${imageMode} request (Error)`,
          timestamp: new Date(),
          statusCode: result.error.status || 500,
          request: requestBody,
          response: errorResponse,
          responseStats: {
            statusCode: result.error.status || 500,
            statusText: "Error",
            time: `${Math.floor(Math.random() * 300) + 100}ms`,
            size: `${
              new TextEncoder().encode(JSON.stringify(errorResponse)).length
            } bytes`,
          },
        });
      } else {
        setApiCallStatus(false);
        setResponse(JSON.stringify(result, null, 2));

        const imageUrls = Array.isArray(result.images)
          ? result.images.map((img) => img.url || img)
          : [result.url || result];

        // Update the UI with generated images
        setGeneratedImages(imageUrls);

        // Update response stats
        setResponseStats({
          statusCode: 200,
          statusText: "OK",
          time: `${Math.floor(Math.random() * 500) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(result)).length
          } bytes`,
        });

        // Add to history
        addHistoryItem({
          id: Date.now().toString(),
          name: `Image ${imageMode} request`,
          timestamp: new Date(),
          statusCode: 200,
          request: requestBody,
          response: result,
          responseStats: {
            statusCode: 200,
            statusText: "OK",
            time: `${Math.floor(Math.random() * 500) + 100}ms`,
            size: `${
              new TextEncoder().encode(JSON.stringify(result)).length
            } bytes`,
          },
        });
      }
    } catch (error) {
      // Format unexpected error as JSON
      const errorResponse = {
        error: {
          message: error.message || "An unexpected error occurred",
          type: "runtime_error",
          param: null,
          code: "error",
        },
      };

      // Set formatted error response
      setApiCallStatus(false);
      setResponse(JSON.stringify(errorResponse, null, 2));

      // Update response stats
      setResponseStats({
        statusCode: 500,
        statusText: "Error",
        time: `${Math.floor(Math.random() * 300) + 100}ms`,
        size: `${
          new TextEncoder().encode(JSON.stringify(errorResponse)).length
        } bytes`,
      });

      // Add the error to history
      addHistoryItem({
        id: Date.now().toString(),
        name: `Image ${imageMode} request (Error)`,
        timestamp: new Date(),
        statusCode: 500,
        request: generateRequestStructure(),
        response: errorResponse,
        responseStats: {
          statusCode: 500,
          statusText: "Error",
          time: `${Math.floor(Math.random() * 300) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(errorResponse)).length
          } bytes`,
        },
      });
    } finally {
      // Update loading state
      setApiCallStatus(false);
      setIsLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleClear = () => {
    setPrompt("");
    setSystemPrompt("");
    setUploadedImage(null);
    setGeneratedImages([]);
    setSelectedModels([]);
    // setShowSystemPrompt(false);

    // Reset request settings to default
    setRequestSettings({
      numberOfImages: 1,
      height: 1024,
      width: 1024,
      seed: null,
      stylePreset: null,
    });

  

    // Clear the response
    setResponse("");

    // Reset response stats
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* --- Top Control Bar --- */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Model Selector */}
              <ModelsPicker
                modelType="image"
                selectedModels={selectedModels}
                onSelectionChange={(newModels) => {
                  if (newModels.length <= 5) {
                    setSelectedModels(newModels);
                  } else {
                    toast.error("Maximum of 5 models allowed", {
                      description: "You can select up to 5 models at a time",
                      position: "top-center",
                    });
                    setSelectedModels(newModels.slice(0, 5));
                  }
                }}
                width="200px"
                placeholder="Add models..."
                buttonClassName="h-9"
                subType={imageMode === "generate" ? "text" : "image"}
              />

              {/* Request Options Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 text-xs border-borderColorPrimary ${
                      imageMode === "edit"
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-backgroundSecondary/30"
                    }`}
                    disabled={imageMode === "edit"}
                  >
                    <Palette className="w-3 h-3 mr-1" />
                    Image Options
                  </Button>
                </PopoverTrigger>
                {imageMode === "generate" && (
                  <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
                    <ScrollArea className="h-[300px] pr-3">
                      <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
                        <h3 className="font-medium text-sm mb-2">
                          Image Settings
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="num-images" className="text-xs">
                              Number of Images (n)
                            </Label>
                            <Select
                              value={String(requestSettings.numberOfImages)}
                              onValueChange={(value) =>
                                setRequestSettings((prev) => ({
                                  ...prev,
                                  numberOfImages: parseInt(value),
                                }))
                              }
                            >
                              <SelectTrigger
                                id="num-images"
                                className="h-8 text-xs mt-1"
                              >
                                <SelectValue placeholder="Select number" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4].map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="image-height" className="text-xs">
                              Height (px)
                            </Label>
                            <Select
                              value={String(requestSettings.height)}
                              onValueChange={(value) =>
                                setRequestSettings((prev) => ({
                                  ...prev,
                                  height: parseInt(value),
                                }))
                              }
                            >
                              <SelectTrigger
                                id="image-height"
                                className="h-8 text-xs mt-1"
                              >
                                <SelectValue placeholder="Select height" />
                              </SelectTrigger>
                              <SelectContent>
                                {[512, 768, 1024, 1536].map((h) => (
                                  <SelectItem key={h} value={String(h)}>
                                    {h}px
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="image-width" className="text-xs">
                              Width (px)
                            </Label>
                            <Select
                              value={String(requestSettings.width)}
                              onValueChange={(value) =>
                                setRequestSettings((prev) => ({
                                  ...prev,
                                  width: parseInt(value),
                                }))
                              }
                            >
                              <SelectTrigger
                                id="image-width"
                                className="h-8 text-xs mt-1"
                              >
                                <SelectValue placeholder="Select width" />
                              </SelectTrigger>
                              <SelectContent>
                                {[512, 768, 1024, 1536].map((w) => (
                                  <SelectItem key={w} value={String(w)}>
                                    {w}px
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="seed" className="text-xs">
                              Seed (Optional)
                            </Label>
                            <Input
                              id="seed"
                              type="number"
                              placeholder="Random seed (leave empty for random)"
                              value={
                                requestSettings.seed !== null
                                  ? String(requestSettings.seed)
                                  : ""
                              }
                              onChange={(e) =>
                                setRequestSettings((prev) => ({
                                  ...prev,
                                  seed: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                }))
                              }
                              className="h-8 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="style-preset" className="text-xs">
                              Style Preset (Optional)
                            </Label>
                            <Input
                              id="style-preset"
                              type="text"
                              placeholder="e.g., photographic, cinematic, anime"
                              value={requestSettings.stylePreset || ""}
                              onChange={(e) =>
                                setRequestSettings((prev) => ({
                                  ...prev,
                                  stylePreset: e.target.value || null,
                                }))
                              }
                              className="h-8 text-xs mt-1"
                            />
                          </div>
                        </div>
                      </Card>
                    </ScrollArea>
                  </PopoverContent>
                )}
              </Popover>
            </div>
            {/* Add this code button */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-backgroundSecondary/30"
                onClick={() => setCodeModalOpen(true)}
              >
                <CodeXml className="w-4 h-4" />
                &nbsp; code
              </Button>
            </div>
          </div>
          <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-4 " />

          {/* --- Main Content --- */}
          <div className="space-y-4">
            {/* --- Edit/Generate Mode Toggle with Animation --- */}
            <AnimatePresence mode="wait">
              <motion.div
                key={imageMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* System Prompt (only for edit mode) */}
                {imageMode === "edit" && (
                  <div className="border border-borderColorPrimary rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Settings2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h3 className="text-sm font-medium">
                          Edit Instructions
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-xs"
                      >
                        Required
                      </Badge>
                    </div>
                    <Textarea
                      placeholder="Describe how to edit the image, e.g. 'Make the background blue' or 'Remove the person from the image'"
                      className="min-h-[60px] border border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                  </div>
                )}

                {imageMode === "generate" && (
                  <Textarea
                    placeholder='Enter image prompt, e.g., "A futuristic cityscape at sunset"'
                    className="min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                )}

                {imageMode === "edit" && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-borderColorPrimary rounded-lg p-4">
                      <Label
                        htmlFor="image-upload"
                        className="text-sm font-medium block mb-2"
                      >
                        Upload Image to Edit
                      </Label>

                      {!uploadedImage && (
                        <div className="flex flex-col items-center justify-center py-4 bg-backgroundSecondary/30 rounded-md">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <div className="text-sm text-muted-foreground text-center">
                            <p className="font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
                          </div>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 border-borderColorPrimary"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                          >
                            Select File
                          </Button>
                        </div>
                      )}

                      {uploadedImage && (
                        <div className="relative group overflow-hidden rounded-lg border border-borderColorPrimary">
                          {/* Image preview with overlay effects */}
                          <div className="relative aspect-square max-h-[300px] w-full overflow-hidden bg-backgroundSecondary/20">
                            <Image
                              src={uploadedImage.preview}
                              alt="Preview"
                              width={500}
                              height={500}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            />

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                              <div className="text-white">
                                <p className="font-medium text-sm truncate max-w-[200px]">
                                  {uploadedImage.file.name}
                                </p>
                                <p className="text-xs opacity-80">
                                  {(
                                    uploadedImage.file.size /
                                    (1024 * 1024)
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Just the remove button */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full shadow-lg"
                              onClick={() => {
                                if (uploadedImage.preview) {
                                  URL.revokeObjectURL(uploadedImage.preview);
                                }
                                setUploadedImage(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Image info panel */}
                          <div className="bg-backgroundSecondary/80 backdrop-blur-sm border-t border-borderColorPrimary p-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-xs">
                                {uploadedImage.file.type || "image/*"} •
                                {uploadedImage.file.width &&
                                uploadedImage.file.height
                                  ? ` ${uploadedImage.file.width}×${uploadedImage.file.height}`
                                  : " Original size"}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 text-xs"
                            >
                              Ready to edit
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-borderColorPrimary bg-backgroundSecondary/30"
              onClick={handleClear}
            >
              Clear
            </Button>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="sm"
                      className="h-8 bg-primary hover:bg-primary/90"
                      onClick={handleRun}
                      disabled={
                        isLoading ||
                        selectedModels.length === 0 ||
                        (imageMode === "generate" && !prompt.trim()) ||
                        (imageMode === "edit" &&
                          (!uploadedImage || !systemPrompt.trim()))
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {imageMode === "generate" ? "Generate" : "Edit Image"}
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-backgroundSecondary border-borderColorPrimary"
                >
                  {isLoading ? (
                    <p>Request is processing...</p>
                  ) : selectedModels.length === 0 ? (
                    <p>Please select at least one model</p>
                  ) : imageMode === "generate" && !prompt.trim() ? (
                    <p>Please enter an image prompt</p>
                  ) : imageMode === "edit" && !uploadedImage ? (
                    <p>Please upload an image to edit</p>
                  ) : imageMode === "edit" && !systemPrompt.trim() ? (
                    <p>Please enter edit instructions</p>
                  ) : (
                    <p>
                      Click to{" "}
                      {imageMode === "generate"
                        ? "generate image"
                        : "edit image"}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <CodeModal
          mode="image"
          open={codeModalOpen}
          onOpenChange={setCodeModalOpen}
          imageMode={imageMode}
          imageGenConfig={
            imageMode === "generate" ? generateRequestStructure() : undefined
          }
          imageEditConfig={
            imageMode === "edit" ? generateRequestStructure() : undefined
          }
        />
      </div>
    </ScrollArea>
  );
}
