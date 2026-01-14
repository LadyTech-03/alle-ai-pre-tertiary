// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { requestJson, makeFormDataRequest } from "@/lib/api/apiClient/requests";
import {
  Play,
  Loader,
  CodeXml,
} from "lucide-react";
import CodeModal from "../../base/codeModal";
import useChatAPIStore from "@/stores/developer-benchmark";
import { AnimatePresence, motion } from "framer-motion";
import ModelsPicker from "../../base/ModelsPicker";
import { useApiStatusStore } from "@/stores/developer-benchmark";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AudioUploader from "./audioUploader";
import AudioSettingsPopover from "./audioSettingsPopover";

// Types
interface AudioModelOption {
  value: string;
  label: string;
  modes: Array<"stt" | "tts" | "generate">;
}

interface AudioRequestSettings {
  sampleRate?: number;
  audioQuality?: "low" | "medium" | "high";
  duration?: number; 
  language?: string;
  voice?: string; 
}

interface UploadedAudioFile {
  file: File;
  duration: number;
  preview: string; 
}

interface AudioModeProps {
  mode: "stt" | "tts" | "generate";
  authToken?: string;
}

export default function AudioMode() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const { audioMode, response, setResponse, setResponseStats, addHistoryItem } =
    useChatAPIStore();
  const { setApiCallStatus } = useApiStatusStore();

  // Mode-specific states
  const [inputText, setInputText] = useState<string>("");
  const [uploadedAudio, setUploadedAudio] = useState<UploadedAudioFile | null>(
    null
  );
  const [generationPrompt, setGenerationPrompt] = useState<string>("");

  // Settings state
  const [requestSettings, setRequestSettings] = useState<AudioRequestSettings>({
    sampleRate: 44100,
    audioQuality: "high",
    duration: 30,
    language: "en",
    voice: "nova",
  });

  // Generation status state (similar to image.tsx)
  const [generationStatus, setGenerationStatus] = useState<{
    status: "idle" | "processing" | "complete";
    progress: number;
    currentStep: string;
  }>({
    status: "idle",
    progress: 0,
    currentStep: "",
  });

  // Add model-specific parameters
  const [modelSpecificParams, setModelSpecificParams] = useState<{
    [modelName: string]: {
      voice?: string;
      sampleRate?: number;
      audioQuality?: "low" | "medium" | "high";
      duration?: number;
    };
  }>({});

  // These state variables are now handled by the AudioPlayer component
  // We just keep waveformData for audio analysis
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Clear selected models when audio mode changes
  useEffect(() => {
    setSelectedModels([]);
  }, [audioMode]);

  const handleAudioUpload = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setUploadedAudio({
        file,
        preview,
        duration: 0,
      });

      await analyzeAudio(file);
    } catch (error) {
      return;
    }
  };

  const handleRun = async () => {
    // Don't run if requirements aren't met
    if (selectedModels.length === 0) return;
    if (audioMode === "stt" && !uploadedAudio) return;
    if (audioMode === "tts" && !inputText.trim()) return;

    // Set loading state
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
    setIsLoading(true);
    setApiCallStatus(true);
    try {
      const requestBody = generateRequestStructure();

      const requestsByModel = {};

      for (const model of selectedModels) {
        const modelRequest = { ...requestBody };

        modelRequest.models = [model];

        if (modelSpecificParams[model]) {
          if (audioMode === "tts") {
            if (modelSpecificParams[model].voice !== undefined) {
              modelRequest.voice = modelSpecificParams[model].voice;
            }
          } else if (audioMode === "generate") {
            if (modelSpecificParams[model].sampleRate !== undefined) {
              modelRequest.settings = {
                ...modelRequest.settings,
                sampleRate: modelSpecificParams[model].sampleRate,
              };
            }

            if (modelSpecificParams[model].audioQuality !== undefined) {
              modelRequest.settings = {
                ...modelRequest.settings,
                audioQuality: modelSpecificParams[model].audioQuality,
              };
            }

            if (modelSpecificParams[model].duration !== undefined) {
              modelRequest.settings = {
                ...modelRequest.settings,
                duration: modelSpecificParams[model].duration,
              };
            }
          }
        }

        requestsByModel[model] = modelRequest;
      }

      let result;
      let apiUrl;

      if (audioMode === "stt") {
        const formData = new FormData();

        selectedModels.forEach((model, index) => {
          formData.append(`models[${index}]`, model);
        });

        if (uploadedAudio && uploadedAudio.file) {
          formData.append("audio_file", uploadedAudio.file);
        }

        apiUrl = "/audio/stt";

        // Make the FormData request
        result = await makeFormDataRequest(apiUrl, formData);
      } else if (audioMode === "tts") {
        apiUrl = "/audio/tts";

        // If only one model is selected, use its specific request
        // Otherwise use the consolidated request
        const requestToSend =
          selectedModels.length === 1
            ? requestsByModel[selectedModels[0]]
            : requestBody;

        result = await requestJson(apiUrl, requestToSend);
      } else if (audioMode === "generate") {
        // For audio generation, use regular JSON request
        apiUrl = "/audio/generate";
        const requestToSend =
          selectedModels.length === 1
            ? requestsByModel[selectedModels[0]]
            : requestBody;

        result = await requestJson(apiUrl, requestToSend);
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
          name: `Audio ${audioMode} request (Error)`,
          timestamp: new Date(),
          statusCode: result.error.status || 500,
          request: requestBody, // Use the JSON display version for history
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
        // Set successful response
        setApiCallStatus(false);
        setResponse(JSON.stringify(result, null, 2));

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
          name: `Audio ${audioMode} request`,
          timestamp: new Date(),
          statusCode: 200,
          request: requestBody, // Use the JSON display version for history
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
        name: `Audio ${audioMode} request (Error)`,
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

  const handleClear = () => {
    setInputText("");
    setUploadedAudio(null);
    setGenerationPrompt("");
    setSelectedModels([]);
    setResponse("");
    setRequestSettings({
      sampleRate: 44100,
      audioQuality: "high",
      duration: 30,
      language: "en",
      voice: "nova",
    });
    setResponseStats({
      statusCode: "-",
      statusText: "-",
      time: "-",
      size: "-",
    });
  };

  // Define the generateRequestStructure function
  const generateRequestStructure = () => {
    if (audioMode === "stt") {
      // For STT mode - simple structure with models and file name
      return {
        models: selectedModels,
        audio_file: uploadedAudio ? uploadedAudio.file.name : "", // Just the filename for display in JSON
        model_specific_params: modelSpecificParams,
      };
    } else if (audioMode === "tts") {
      // For TTS mode, include model_specific_params
      return {
        models: selectedModels,
        prompt: inputText,
        voice: requestSettings.voice,
        model_specific_params: modelSpecificParams,
      };
    } else {
      // generate mode
      return {
        models: selectedModels,
        prompt: generationPrompt,
        model_specific_params: modelSpecificParams,
      };
    }
  };

  // Keep these utility functions for audio analysis
  const analyzeAudio = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const waveform = generateWaveformData(audioBuffer);
      setWaveformData(waveform);
      audioContext.close();
    } catch (error) {
      // console.error("Error analyzing audio:", error);
      return;
    }
  };

  const generateWaveformData = (audioBuffer: AudioBuffer) => {
    const samples = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(samples.length / 50); // Number of bars in waveform
    const waveform = [];

    for (let i = 0; i < 50; i++) {
      const start = blockSize * i;
      const end = start + blockSize;
      let sum = 0;

      for (let j = start; j < end; j++) {
        sum += Math.abs(samples[j]);
      }

      waveform.push(sum / blockSize);
    }

    // Normalize the waveform data
    const max = Math.max(...waveform);
    return waveform.map((value) => value / max);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Replace the model selector with ModelsPicker */}
              <ModelsPicker
                modelType="audio"
                selectedModels={selectedModels}
                onSelectionChange={(newModels) => {
                  if (newModels.length <= 1) {
                    setSelectedModels(newModels);
                  } else {
                    // Show toast message when trying to select more than one model
                    toast.error("Only one model can be selected", {
                      description: "Audio processing requires a single model",
                      position: "top-center",
                    });
                    // Keep only the first selected model
                    setSelectedModels(newModels.slice(0, 1));
                  }
                }}
                width="200px"
                placeholder="Add models..."
                buttonClassName="h-9"
                subType={audioMode === "generate" ? "ag" : audioMode}
              />

              {/* Replace Audio Options Button with AudioSettingsPopover component */}
              <AudioSettingsPopover 
                mode={audioMode}
                requestSettings={requestSettings}
                onSettingsChange={(newSettings) => setRequestSettings(newSettings)}
              />
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
          <div className="space-y-4">
            {/* Add animation for audioMode transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={audioMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Mode-specific content */}
                {audioMode === "stt" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium block mb-2">
                      Upload Audio for Transcription
                    </Label>
                    
                    {/* Replace the entire audio upload section with the AudioUploader component */}
                    <AudioUploader 
                      uploadedAudio={uploadedAudio}
                      onAudioUpload={handleAudioUpload}
                      onAudioRemove={() => setUploadedAudio(null)}
                    />
                  </div>
                )}

                {audioMode === "tts" && (
                  <div className="space-y-3">
                    <div className="border border-borderColorPrimary rounded-md p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Text to Convert
                          </Label>
                          <Textarea
                            placeholder="Enter the text you want to convert to speech..."
                            className="mt-2 min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {audioMode === "generate" && (
                  <div className="space-y-3">
                    <div className="border border-borderColorPrimary rounded-md p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Prompt</Label>
                          <Textarea
                            placeholder="Describe the audio you want to generate (e.g., 'Create an upbeat electronic music track with a strong bass line')"
                            className="mt-2 min-h-[150px] border-borderColorPrimary bg-backgroundSecondary/30 resize-none"
                            value={generationPrompt}
                            onChange={(e) =>
                              setGenerationPrompt(e.target.value)
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4"></div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

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
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {" "}
                    {/* Wrapper div to handle disabled state */}
                    <Button
                      size="sm"
                      className="h-8 bg-primary hover:bg-primary/90"
                      onClick={handleRun}
                      disabled={
                        isLoading ||
                        selectedModels.length === 0 ||
                        (audioMode === "stt" && !uploadedAudio) ||
                        (audioMode === "tts" && !inputText.trim()) ||
                        (audioMode === "generate" && !generationPrompt.trim())
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
                          {audioMode === "stt" ? "Transcribe" : "Generate"}
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
                    <p>Please select a model</p>
                  ) : audioMode === "stt" && !uploadedAudio ? (
                    <p>Please upload an audio file to transcribe</p>
                  ) : audioMode === "tts" && !inputText.trim() ? (
                    <p>Please enter text to convert to speech</p>
                  ) : audioMode === "generate" && !generationPrompt.trim() ? (
                    <p>Please enter a prompt to generate audio</p>
                  ) : (
                    <p>
                      Click to{" "}
                      {audioMode === "stt"
                        ? "transcribe audio"
                        : audioMode === "tts"
                        ? "convert text to speech"
                        : "generate audio"}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Progress indicator */}
          {isLoading && (
            <div className="mt-2 w-full">
              <div className="h-1 w-full bg-backgroundSecondary/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${generationStatus.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {generationStatus.currentStep}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CodeModal
        mode="audio"
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        audioMode={audioMode}
        ttsConfig={audioMode === "tts" ? generateRequestStructure() : undefined}
        sttConfig={audioMode === "stt" ? generateRequestStructure() : undefined}
        audioGenConfig={
          audioMode === "generate" ? generateRequestStructure() : undefined
        }
      />
    </ScrollArea>
  );
}
