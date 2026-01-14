"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useChatAPIStore from "@/stores/developer-benchmark";
import { useRouter, usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClipboardList } from "lucide-react";
import { StatusAnimations } from "./status-animations";

export const modes = [
  "Chat",
  "Image Generation",
  "Audio Generation",
  "Video Generation",
] as const;

export type Mode = (typeof modes)[number];

export type Method = "Generate" | "Edit" | "STT" | "TTS" | "Queue" | "";

interface ModeSelectorProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
  selectedMethod: Method;
  onMethodChange: (method: Method) => void;
}

export function ModeSelector({
  selectedMode,
  onModeChange,
  selectedMethod,
  onMethodChange,
}: ModeSelectorProps) {
  const setImageMode = useChatAPIStore((state) => state.setImageMode);
  const setAudioMode = useChatAPIStore((state) => state.setAudioMode);
  const setVideoMode = useChatAPIStore((state) => state.setVideoMode);
  const setChatMode = useChatAPIStore((state) => state.setChatMode);
  const chatMode = useChatAPIStore((state) => state.chatMode);
  const videoQueue = useChatAPIStore((state) => state.videoQueue);
  const router = useRouter();
  const pathname = usePathname();

  // Calculate queue counts
  const processingCount = videoQueue.filter(
    (item) => item.status === "processing"
  ).length;
  const completedCount = videoQueue.filter(
    (item) => item.status === "completed"
  ).length;

  // Sync component state with current route
  useEffect(() => {
    // Set the appropriate mode based on the current route
    if (pathname.includes("image-api")) {
      onModeChange("Image Generation");
      onMethodChange("Generate");
      setImageMode("generate");
      setAudioMode(null);
      setVideoMode(null);
      setChatMode(null);
    } else if (pathname.includes("audio-api")) {
      onModeChange("Audio Generation");
      onMethodChange("Generate");
      setAudioMode("generate");
      setImageMode(null);
      setVideoMode(null);
      setChatMode(null);
    } else if (pathname.includes("video-api")) {
      onModeChange("Video Generation");
      onMethodChange("Generate");
      setVideoMode("generate");
      setImageMode(null);
      setAudioMode(null);
      setChatMode(null);
    } else if (pathname.includes("chat-api")) {
      onModeChange("Chat");
      onMethodChange("");
      setImageMode(null);
      setAudioMode(null);
      setVideoMode(null);
      setChatMode("completions");
    }
  }, [
    pathname,
    onModeChange,
    onMethodChange,
    setImageMode,
    setAudioMode,
    setVideoMode,
    setChatMode,
  ]);

  const handleModeChange = (value: string) => {
    const mode = value as Mode;

    // Update the selected mode
    onModeChange(mode);

    // Reset selected method when mode changes
    if (mode === "Image Generation") {
      onMethodChange("Generate");
      setImageMode("generate");
      setAudioMode(null);
      setVideoMode(null);
      setChatMode(null);
      // Navigate to image API route using dynamic route with template literals
      router.push(`/developer/workbench/image-api`);
    } else if (mode === "Audio Generation") {
      onMethodChange("TTS");
      setAudioMode("tts");
      setImageMode(null);
      setVideoMode(null);
      setChatMode(null);
      // Navigate to audio API route using dynamic route with template literals
      router.push(`/developer/workbench/audio-api`);
    } else if (mode === "Video Generation") {
      onMethodChange("Generate");
      setVideoMode("generate");
      setImageMode(null);
      setAudioMode(null);
      setChatMode(null);
      // Navigate to video API route using dynamic route with template literals
      router.push(`/developer/workbench/video-api`);
    } else {
      onMethodChange("");
      setImageMode(null);
      setAudioMode(null);
      setVideoMode(null);
      setChatMode("completions");
      // Navigate to chat API route using dynamic route with template literals
      router.push(`/developer/workbench/chat-api`);
    }
  };

  const handleMethodChange = (method: Method) => {
    onMethodChange(method);
    // Update store's imageMode when method changes for Image Generation
    if (selectedMode === "Image Generation") {
      setImageMode(
        method === "Generate" ? "generate" : method === "Edit" ? "edit" : null
      );
    }
    // Handle Audio Generation methods
    else if (selectedMode === "Audio Generation") {
      setAudioMode(
        method === "Generate"
          ? "generate"
          : method === "STT"
          ? "stt"
          : method === "TTS"
          ? "tts"
          : null
      );
    }
    // Add this block to handle Video Generation methods
    else if (selectedMode === "Video Generation") {
      setVideoMode(
        method === "Generate"
          ? "generate"
          : method === "Edit"
          ? "edit"
          : method === "Queue"
          ? "queue"
          : null
      );
    }
  };

  // Handle chat mode changes
  const handleChatModeChange = (
    mode: "completions" | "combination" | "summary" | "search"|"comparison"
  ) => {
    setChatMode(mode);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Try It Out: Select an API Mode</h3>
      <div className="flex items-center gap-2">
        <Select
          value={selectedMode}
          onValueChange={handleModeChange}
          defaultValue="Chat"
        >
          <SelectTrigger className="w-[180px] border-borderColorPrimary bg-background rounded-lg">
            <SelectValue placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Method selectors based on selected mode */}
        <div className="flex gap-1 w-full">
          {selectedMode === "Chat" && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        chatMode === "completions"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleChatModeChange("completions")}
                    >
                      Completions
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get individual responses from each selected model</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        chatMode === "combination"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleChatModeChange("combination")}
                    >
                      Combination
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get combined outputs from all selected models</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        chatMode === "comparison"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleChatModeChange("comparison")}
                    >
                      Comparison
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Get key differences and similarities across all
                      selected models
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        chatMode === "search"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleChatModeChange("search")}
                    >
                      Search
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Get web search results incorporated with model responses
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {selectedMode === "Image Generation" && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        selectedMethod === "Generate"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => {
                        handleMethodChange("Generate");
                      }}
                    >
                      Generate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Let the AI models create an image from scratch.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        selectedMethod === "Edit"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleMethodChange("Edit")}
                    >
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update or modify an image using your instructions.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {selectedMode === "Audio Generation" && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        selectedMethod === "STT"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleMethodChange("STT")}
                    >
                      STT
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Speech-to-Text</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        selectedMethod === "TTS"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleMethodChange("TTS")}
                    >
                      TTS
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Text-to-Speech</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                        selectedMethod === "Generate"
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                      )}
                      onClick={() => handleMethodChange("Generate")}
                    >
                      Generate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate audio from your text prompt.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {selectedMode === "Video Generation" && (
            <>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 h-8 border-borderColorPrimary opacity-50 cursor-not-allowed",
                    selectedMethod === "Edit"
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "bg-backgroundSecondary/30"
                  )}
                  disabled={true}
                  onClick={() => {}}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                    selectedMethod === "Generate"
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                  )}
                  onClick={() => handleMethodChange("Generate")}
                >
                  Generate
                </Button>
              </div>

              {/* Queue button and status animations positioned separately on the right */}
              <div className="flex-1 flex justify-end items-center gap-3">
                <Button
                  size="sm"
                  variant={selectedMethod === "Queue" ? "default" : "outline"}
                  className={cn(
                    "text-xs px-2 py-1 h-8 border-borderColorPrimary",
                    selectedMethod === "Queue"
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "bg-backgroundSecondary/30 hover:bg-backgroundSecondary/50"
                  )}
                  onClick={() => handleMethodChange("Queue")}
                >
                  <ClipboardList className="w-4 h-4 mr-1" />
                  Video Queue
                </Button>

                <div className="flex items-center gap-2">
                  {processingCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <StatusAnimations.InQueue count={processingCount} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {processingCount} video
                            {processingCount !== 1 ? "s" : ""} in processing
                            queue
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {completedCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <StatusAnimations.Done count={completedCount} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {completedCount} video
                            {completedCount !== 1 ? "s" : ""} completed
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
