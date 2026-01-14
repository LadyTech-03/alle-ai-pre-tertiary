// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
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
import { useApiStatusStore } from "@/stores/developer-benchmark";
import {
  Settings2,
  Upload,
  Play,
  Video as VideoIcon,
  ChevronsUpDown,
  Check,
  Loader,
  X,
  CodeXml,
  Film,
  Edit3,
  Clock,
  Camera,
} from "lucide-react";
import CodeModal from "../base/codeModal";
import useChatAPIStore from "@/stores/developer-benchmark";
import { requestJson } from "@/lib/api/apiClient/requests";
import ModelsPicker from "../base/ModelsPicker";
import VideoQueue from "../base/video-queue";
import { extractVideoRequestData } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface VideoModelOption {
  value: string;
  label: string;
  modes: Array<"generate" | "edit">;
}

interface VideoRequestSettings {
  duration: number;
  loop: boolean;
  aspect_ratio: string;
  fps: number;
  dimension: string;
  resolution: string;
  seed: number;
}

interface UploadedVideoFile {
  file: File;
  duration: number;
  preview: string;
}

interface VideoModeProps {
  mode: "generate" | "edit";
  authToken?: string;
}

export default function VideoMode() {
  // Common states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelsOpen, setModelsOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const { setApiCallStatus } = useApiStatusStore();
  const {
    response,
    setResponse,
    setResponseStats,
    addHistoryItem,
    addVideoQueueItem,
    videoQueue,
  } = useChatAPIStore();
  const videoMode = useChatAPIStore((state) => state.videoMode);

  const [generationPrompt, setGenerationPrompt] = useState<string>("");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoFile | null>(
    null
  );
  const [editInstructions, setEditInstructions] = useState<string>("");

  const [modelSpecificParams, setModelSpecificParams] = useState<{
    [modelName: string]: {
      duration?: number;
      aspect_ratio?: string;
      fps?: number;
      dimension?: string;
      resolution?: string;
      seed?: number;
    };
  }>({});

  const [requestSettings, setRequestSettings] = useState<VideoRequestSettings>({
    duration: 6,
    loop: false,
    aspect_ratio: "16:9",
    fps: 24,
    dimension: "1280x720",
    resolution: "720p",
    seed: 8,
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = URL.createObjectURL(file);
      setUploadedVideo({
        file,
        preview,
        duration: 0,
      });
    } catch (error) {
      return;
    }
  };

  const handleRun = async () => {
    if (
      selectedModels.length === 0 ||
      (videoMode === "generate" && !generationPrompt.trim()) ||
      (videoMode === "edit" && (!editInstructions.trim() || !uploadedVideo))
    ) {
      return;
    }

    const processingVideos = videoQueue.filter(
      (item) => item.status === "processing"
    );
    if (processingVideos.length >= 3) {
      toast.error(
        "Playground currently supports a maximum of 3 videos in the processing queue. Please wait for some videos to complete."
      );
      return;
    }
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
    setIsLoading(true);
    setApiCallStatus(true);

    try {
      // Get the request structure
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
          if (videoMode === "generate") {
            // Apply generate mode specific parameters
            if (modelSpecificParams[model].duration !== undefined) {
              modelRequest.duration = modelSpecificParams[model].duration;
            }
            if (modelSpecificParams[model].fps !== undefined) {
              modelRequest.fps = modelSpecificParams[model].fps;
            }
            if (modelSpecificParams[model].aspect_ratio !== undefined) {
              modelRequest.aspect_ratio =
                modelSpecificParams[model].aspect_ratio;
            }
            if (modelSpecificParams[model].dimension !== undefined) {
              modelRequest.dimension = modelSpecificParams[model].dimension;
            }
            if (modelSpecificParams[model].resolution !== undefined) {
              modelRequest.resolution = modelSpecificParams[model].resolution;
            }
            if (modelSpecificParams[model].seed !== undefined) {
              modelRequest.seed = modelSpecificParams[model].seed;
            }
          }
        }

        // Store this model's request
        requestsByModel[model] = modelRequest;
      }

      // TODO: Replace with actual API endpoint URL
      const apiUrl =
        videoMode === "generate" ? "/video/generate" : "/video/edit";

      // If only one model is selected, use its specific request
      // Otherwise use the consolidated request
      const requestToSend =
        selectedModels.length === 1
          ? requestsByModel[selectedModels[0]]
          : requestBody;

      // Make the API request
      const result = await requestJson(apiUrl, requestToSend);

      // Process the response
      if ("error" in result) {
        // Format error as JSON
        const errorResponse = {
          error: {
            message: result.error,
            type: "api_error",
            param: null,
            code: "error",
          },
        };

        // Set formatted error response
        setApiCallStatus(false);
        setResponse(JSON.stringify(errorResponse, null, 2));

        // Update response stats
        const responseStats = {
          statusCode: result.error.status || 500,
          statusText: "Error",
          time: `${Math.floor(Math.random() * 300) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(errorResponse)).length
          } bytes`,
        };
        setResponseStats(responseStats);

        // Add error to history
        addHistoryItem({
          id: Date.now().toString(),
          name: "Video generation request (Error)",
          timestamp: new Date(),
          statusCode: result.error.status || 500,
          request: requestBody,
          response: errorResponse,
          responseStats,
        });
      } else {
        // Set successful response
        setApiCallStatus(false);
        setResponse(JSON.stringify(result, null, 2));

        // Update response stats
        const responseStats = {
          statusCode: 200,
          statusText: "OK",
          time: `${Math.floor(Math.random() * 500) + 100}ms`,
          size: `${
            new TextEncoder().encode(JSON.stringify(result)).length
          } bytes`,
        };
        setResponseStats(responseStats);

        // Add successful request to history
        addHistoryItem({
          id: Date.now().toString(),
          name: "Video generation request",
          timestamp: new Date(),
          statusCode: 200,
          request: requestBody,
          response: result,
          responseStats,
        });

        // Extract video request data and add to queue
        try {
          // Extract the request data
          const requestData = extractVideoRequestData(result);

          // Create a queue item
          const queueItem = {
            id: Date.now().toString(),
            requestId: requestData.requestId,
            timestamp: new Date(),
            prompt:
              videoMode === "generate" ? generationPrompt : editInstructions,
            models: requestData.models,
            status: "processing",
            requestDetails: requestBody,
          };

          // Add to the queue
          addVideoQueueItem(queueItem);

          // Show toast notification
          toast.success(
            "Your video is being processed. You can check the status in Video Queue."
          );
        } catch (error) {
          return;
          // Continue without adding to queue - the response is still shown
        }
      }
    } catch (error) {
      // Handle unexpected errors
      const errorResponse = {
        error: {
          message: error.message || "An unexpected error occurred",
          type: "runtime_error",
          param: null,
          code: "error",
        },
      };
      setApiCallStatus(false);
      setResponse(JSON.stringify(errorResponse, null, 2));

      const responseStats = {
        statusCode: 500,
        statusText: "Error",
        time: `${Math.floor(Math.random() * 300) + 100}ms`,
        size: `${
          new TextEncoder().encode(JSON.stringify(errorResponse)).length
        } bytes`,
      };
      setResponseStats(responseStats);

      // Add unexpected error to history
      addHistoryItem({
        id: Date.now().toString(),
        name: "Video generation request (Error)",
        timestamp: new Date(),
        statusCode: 500,
        request: requestBody,
        response: errorResponse,
        responseStats,
      });
    } finally {
      setApiCallStatus(false);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSystemPrompt("");
    setUploadedVideo(null);
    setGenerationPrompt("");
    setEditInstructions("");
    setResponse("");
    setSelectedModels([]);
    setRequestSettings({
      duration: 6,
      loop: false,
      aspect_ratio: "16:9",
      fps: 24,
      dimension: "1280x720",
      resolution: "720p",
      seed: 8,
    });
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
  };

  // Generate JSON structure for the request
  const generateRequestStructure = () => {
    if (videoMode === "generate") {
      return {
        models: selectedModels,
        prompt: generationPrompt,
        duration: requestSettings.duration,
        loop: requestSettings.loop,
        aspect_ratio: requestSettings.aspect_ratio,
        fps: requestSettings.fps,
        dimension: requestSettings.dimension,
        resolution: requestSettings.resolution,
        seed: requestSettings.seed,
        model_specific_params: modelSpecificParams,
      };
    } else {
      // edit mode
      return {
        models: selectedModels,
        mode: videoMode,
        prompt: editInstructions,
        system_prompt: showSystemPrompt ? systemPrompt : undefined,
        ...(uploadedVideo && { video_file: "base64_video_placeholder" }),
        model_specific_params: modelSpecificParams,
      };
    }
  };

  // Use AnimatePresence for smooth mode transitions
  return (
    <AnimatePresence mode="wait">
      {videoMode === "queue" ? (
        <motion.div
          key="queue"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          <VideoQueue />
        </motion.div>
      ) : (
        <motion.div
          key="video-generator"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Top Control Bar */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {/* Replace Model Selector with ModelsPicker */}
                    <ModelsPicker
                      modelType="video"
                      selectedModels={selectedModels}
                      onSelectionChange={(newModels) => {
                        if (newModels.length <= 5) {
                          setSelectedModels(newModels);
                        } else {
                          // Show toast message when trying to select more than 5 models
                          toast.error("Maximum of 5 models allowed", {
                            description:
                              "You can select up to 5 models at a time",
                            position: "top-center",
                          });
                          // Still update but truncate to 5
                          setSelectedModels(newModels.slice(0, 5));
                        }
                      }}
                      width="200px"
                      placeholder="Add models..."
                      buttonClassName="h-9"
                    />

                    {/* Video Options Button */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-borderColorPrimary bg-backgroundSecondary/30"
                        >
                          <Film className="w-3 h-3 mr-1" />
                          Video Options
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
                        <ScrollArea className="h-[450px] pr-3">
                          <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
                            <h3 className="font-medium text-sm mb-2">
                              Video Settings
                            </h3>

                            {/* Duration */}
                            <div className="space-y-2">
                              <Label htmlFor="duration" className="text-xs">
                                Duration (seconds)
                              </Label>
                              <Select
                                value={String(requestSettings.duration)}
                                onValueChange={(value) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    duration: parseInt(value),
                                  }))
                                }
                              >
                                <SelectTrigger
                                  id="duration"
                                  className="h-8 text-xs mt-1"
                                >
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6">
                                    6 seconds (default)
                                  </SelectItem>
                                  <SelectItem value="3">3 seconds</SelectItem>
                                  <SelectItem value="2">2 seconds</SelectItem>
                                  <SelectItem value="1">1 second</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Max: 6 seconds (factors of 6 recommended)
                              </p>
                            </div>

                            {/* Loop */}
                            <div className="flex items-center justify-between">
                              <Label htmlFor="loop" className="text-xs">
                                Loop Video
                              </Label>
                              <Switch
                                id="loop"
                                checked={requestSettings.loop}
                                onCheckedChange={(checked) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    loop: checked,
                                  }))
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>

                            {/* Aspect Ratio */}
                            <div className="space-y-2">
                              <Label htmlFor="aspect-ratio" className="text-xs">
                                Aspect Ratio
                              </Label>
                              <Select
                                value={requestSettings.aspect_ratio}
                                onValueChange={(value) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    aspect_ratio: value,
                                  }))
                                }
                              >
                                <SelectTrigger
                                  id="aspect-ratio"
                                  className="h-8 text-xs mt-1"
                                >
                                  <SelectValue placeholder="Select aspect ratio" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="16:9">
                                    16:9 (Landscape)
                                  </SelectItem>
                                  <SelectItem value="9:16">
                                    9:16 (Portrait)
                                  </SelectItem>
                                  <SelectItem value="4:3">
                                    4:3 (Standard)
                                  </SelectItem>
                                  <SelectItem value="1:1">
                                    1:1 (Square)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* FPS */}
                            <div className="space-y-2">
                              <Label htmlFor="fps" className="text-xs">
                                Frame Rate (FPS)
                              </Label>
                              <Select
                                value={String(requestSettings.fps)}
                                onValueChange={(value) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    fps: parseInt(value),
                                  }))
                                }
                              >
                                <SelectTrigger
                                  id="fps"
                                  className="h-8 text-xs mt-1"
                                >
                                  <SelectValue placeholder="Select FPS" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="24">
                                    24 FPS (Cinematic)
                                  </SelectItem>
                                  <SelectItem value="30">
                                    30 FPS (Standard)
                                  </SelectItem>
                                  <SelectItem value="60">
                                    60 FPS (Smooth)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Resolution */}
                            <div className="space-y-2">
                              <Label htmlFor="resolution" className="text-xs">
                                Resolution
                              </Label>
                              <Select
                                value={requestSettings.resolution}
                                onValueChange={(value) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    resolution: value,
                                    // Update dimension based on resolution
                                    dimension:
                                      value === "720p"
                                        ? "1280x720"
                                        : "1920x1080",
                                  }))
                                }
                              >
                                <SelectTrigger
                                  id="resolution"
                                  className="h-8 text-xs mt-1"
                                >
                                  <SelectValue placeholder="Select resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="720p">
                                    720p (HD)
                                  </SelectItem>
                                  <SelectItem value="1080p">
                                    1080p (Full HD)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Seed */}
                            <div className="space-y-2">
                              <Label htmlFor="seed" className="text-xs">
                                Seed
                              </Label>
                              <Input
                                id="seed"
                                type="number"
                                placeholder="Enter a seed value"
                                value={requestSettings.seed}
                                onChange={(e) =>
                                  setRequestSettings((prev) => ({
                                    ...prev,
                                    seed: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="h-8 text-xs mt-1"
                              />
                              <p className="text-xs text-muted-foreground">
                                Fixed seed for reproducible results
                              </p>
                            </div>
                          </Card>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Code Button */}
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

                <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-4" />

                {/* Main Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={videoMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="space-y-4">
                      {/* System Prompt Section - Only show for edit mode */}
                      {videoMode === "edit" && (
                        <div className="border border-borderColorPrimary rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Settings2 className="h-4 w-4 mr-2 text-muted-foreground" />
                              <h3 className="text-sm font-medium">
                                System Prompt
                              </h3>
                            </div>
                            <Switch
                              checked={showSystemPrompt}
                              onCheckedChange={setShowSystemPrompt}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                          {showSystemPrompt && (
                            <Textarea
                              placeholder="Enter system instructions..."
                              className="min-h-[60px] border border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                              value={systemPrompt}
                              onChange={(e) => setSystemPrompt(e.target.value)}
                            />
                          )}
                        </div>
                      )}

                      {/* Add animation for generate/edit mode toggle */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={videoMode}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {/* Mode-specific content */}
                          {videoMode === "generate" ? (
                            <div className="space-y-3">
                              <div className="border border-borderColorPrimary rounded-md p-4">
                                <Label className="text-sm font-medium">
                                  Prompt
                                </Label>
                                <Textarea
                                  placeholder="Describe the video you want to generate (e.g., 'A cinematic shot of a sunset over a city skyline')"
                                  className="mt-2 min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                                  value={generationPrompt}
                                  onChange={(e) =>
                                    setGenerationPrompt(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Edit Instructions Prompt */}
                              <div className="border border-borderColorPrimary rounded-md p-4">
                                <Label className="text-sm font-medium">
                                  Edit Instructions
                                </Label>
                                <Textarea
                                  placeholder="Describe how you want to edit the video (e.g., 'Make the video more cinematic with a warm color grade')"
                                  className="mt-2 min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                                  value={editInstructions}
                                  onChange={(e) =>
                                    setEditInstructions(e.target.value)
                                  }
                                />
                              </div>

                              {/* Video Upload Section */}
                              <div className="border-2 border-dashed border-borderColorPrimary rounded-lg p-4">
                                <Label className="text-sm font-medium block mb-2">
                                  Upload Video to Edit
                                </Label>

                                {!uploadedVideo ? (
                                  <div className="flex flex-col items-center justify-center py-4 bg-backgroundSecondary/30 rounded-md">
                                    <Film className="h-8 w-8 text-muted-foreground mb-2" />
                                    <div className="text-sm text-muted-foreground text-center">
                                      <p className="font-medium">
                                        Click to upload or drag and drop
                                      </p>
                                      <p className="text-xs">
                                        MP4, WebM up to 100MB
                                      </p>
                                    </div>
                                    <Input
                                      id="video-upload"
                                      type="file"
                                      accept="video/*"
                                      onChange={handleVideoUpload}
                                      className="hidden"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-4 border-borderColorPrimary"
                                      onClick={() =>
                                        document
                                          .getElementById("video-upload")
                                          ?.click()
                                      }
                                    >
                                      Select Video
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative group">
                                    <div className="p-4 bg-backgroundSecondary/30 rounded-md">
                                      <video
                                        controls
                                        src={uploadedVideo.preview}
                                        className="w-full rounded-md"
                                      />
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {uploadedVideo.file.name}
                                      </p>
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => setUploadedVideo(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-borderColorPrimary bg-backgroundSecondary/30"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-primary hover:bg-primary/90"
                    onClick={handleRun}
                    disabled={
                      isLoading ||
                      selectedModels.length === 0 ||
                      !generationPrompt.trim() ||
                      (videoMode === "edit" &&
                        (!editInstructions.trim() || !uploadedVideo))
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        {videoMode === "generate" ? (
                          <Play className="mr-2 h-4 w-4" />
                        ) : (
                          <Edit3 className="mr-2 h-4 w-4" />
                        )}
                        {videoMode === "generate" ? "Generate" : "Apply Edits"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Modals */}
            <CodeModal
              mode="video"
              open={codeModalOpen}
              onOpenChange={setCodeModalOpen}
              videoMode={videoMode}
              videoGenConfig={
                videoMode === "generate"
                  ? generateRequestStructure()
                  : undefined
              }
              videoEditConfig={
                videoMode === "edit" ? generateRequestStructure() : undefined
              }
            />
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
