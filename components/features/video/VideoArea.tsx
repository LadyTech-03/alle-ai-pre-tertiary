"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useSelectedModelsStore, useLikedMediaStore, useContentStore } from "@/stores";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";
import { useModelsStore } from "@/stores/models";
import { 
  Plus, Copy, Info, Play, Pause, Volume2, VolumeX, Maximize2, Download, 
  Heart, Grid2x2, RectangleHorizontal, TvMinimalPlay, RectangleVertical, 
  Square, GalleryHorizontal, GalleryVerticalEnd, Clock8, ChevronLeft, 
  ChevronRight, Mic, MicOff, Upload, Film, Clock9, Clapperboard, Aperture, 
  Video, Loader, RefreshCcw, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/models";
import { chatApi } from "@/lib/api/chat";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VideoSkeleton } from "./video-skeleton";
import VideoResponse from "./video-response";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoGenerationStore } from "@/stores";
import { PromptModal } from "@/components/ui/modals";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";
import Image from "next/image";
import { useHistoryStore } from '@/stores';

// Define the interface for video responses from the API
interface GeneratedVideo {
  id: string;
  modelId: string;
  videoUrl: string;
  liked: boolean;
}

// Define structure for tracking generating videos
interface GeneratingVideo {
  // jobId: string;
  responseId: string;
}

// Define the conversation content structure
interface VideoConversationContent {
  prompt: string;
  prompt_id: number;
  responses: Array<{
    id: number | string;
    model: {
      uid: string;
      name: string;
      image: string;
      model_plan: string;
    };
    body: string;
    liked: boolean | null;
  }>;
}

// Add new interface for error state
interface VideoError {
  message: string;
  type: 'failed' | 'filter_error';
}

const VideoArea = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const { selectedModels, inactiveModels, setTempSelectedModels, saveSelectedModels, setLoadingLatest } = useSelectedModelsStore();
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, VideoError>>({});
  const [loading, setLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [retryingModels, setRetryingModels] = useState<string[]>([]);
  const { settings } = useVideoSettingsStore();
  const [prompt, setPrompt] = useState("");
  const { addLikedMedia, removeLikedMedia } = useLikedMediaStore();
  const { conversationId, promptId, generationType, setConversationId } = useConversationStore();
  const { content, setContent } = useContentStore();
  const [generatingVideos, setGeneratingVideos] = useState<Record<string, GeneratingVideo>>({});  // modelId -> {jobId, responseId}
  const { videoModels } = useModelsStore();
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [conversationModels, setConversationModels] = useState<string[]>([]);
  const [previousSelectedModels, setPreviousSelectedModels] = useState<string[]>([]);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const [videoModelsLoaded, setVideoModelsLoaded] = useState(false);
  const { getHistoryItemById } = useHistoryStore();


  const MAX_LINES = 6;

  // Add some logging when videos are updated
  useEffect(() => {
    if (videos.length > 0) {
      // console.log('Videos available:', videos);
    }
  }, [videos]);

  // Check status of generating videos
  useEffect(() => {
    if (Object.keys(generatingVideos).length === 0) return;
    
    // console.log('Polling for videos:', generatingVideos);
    
    const intervalId = setInterval(async () => {
      const updatedGeneratingVideos = { ...generatingVideos };
      let hasChanges = false;
      
      for (const [modelId, videoInfo] of Object.entries(generatingVideos)) {
        try {
          const response = await chatApi.checkVideoGenerationStatus(videoInfo.responseId);
          // console.log(`Status check for ${modelId}:`, response);
          
          if (response.data.status.toLowerCase() === "completed" && response.data.url) {
            // console.log(`Video for model ${modelId} is ready:`, response.data.url);
            
            setVideos(prev => {
              const exists = prev.some(v => v.modelId === modelId && v.id === videoInfo.responseId);
              if (exists) {
                // console.log('Video already exists in state, skipping');
                return prev;
              }
              
              // console.log('Adding new video to state');
              return [...prev, {
                id: videoInfo.responseId,
                modelId,
                videoUrl: response.data.url,
                liked: false
              }];
            });
            
            delete updatedGeneratingVideos[modelId];
            hasChanges = true;
            
            setLoadingModels(prev => prev.filter(id => id !== modelId));
          } else if (response.data.status.toLowerCase() === "failed" || response.data.status.toLowerCase() === "filter_error") {
            // console.log(`Video generation ${response.data.status} for model ${modelId}`);
            
            setErrors(prev => ({
              ...prev,
              [modelId]: {
                message: response.data.message || "Video generation failed. Please try again.",
                type: response.data.status.toLowerCase() === "filter_error" ? 'filter_error' : 'failed'
              }
            }));
            
            delete updatedGeneratingVideos[modelId];
            hasChanges = true;
            
            setLoadingModels(prev => prev.filter(id => id !== modelId));
          }
        } catch (error) {
          // console.error(`Error checking status for job ${modelId}:`, error);
        }
      }
      
      if (hasChanges) {
        setGeneratingVideos(updatedGeneratingVideos);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [generatingVideos]);

  useEffect(() => {
    if(selectedModels.video.length > 0 && conversationModels.length > 0){
      setPreviousSelectedModels(selectedModels.video);
        if (JSON.stringify(conversationModels) !== JSON.stringify(selectedModels.video)) {
          setPromptConfig({
            title: "Change Models",
            message: "Selecting new models will start a new conversation. Do you want to continue?",
            type: "warning",
            actions: [
              {
                label: "Cancel",
                onClick: () => {
                  setTempSelectedModels(previousSelectedModels);
                  saveSelectedModels('video');
                  setShowPrompt(false);
                },
                variant: "default"
              },
              {
                label: "Proceed",
                onClick: () => {
                  router.replace(`/video`);
                },
                variant: "default"
              }
            ]
          });
          setShowPrompt(true);

        }
    }
  }, [selectedModels]);

  // Handle generating videos for new
  const generateVideo = async (modelId: string) => {
    if (!conversationId || !promptId) return;

    try {
      const response = await chatApi.generateResponse({
        conversation: conversationId,
        model: modelId,
        is_new: true,
        prompt: promptId
      });

      // console.log('Response from Initial video generation (conversation_id, model_id, prompt):', response);
      
      if (response.status && response.data) {
        // Get response ID and job ID for tracking
        const responseId = response.data.id.toString();
        const jobId = response.data.response; // This is the job ID
        const modelInfo = videoModels.find(m => m.model_uid === modelId);

        useVideoGenerationStore.getState().addGeneratingVideo({
          id: responseId,
          modelId,
          modelName: modelInfo?.model_name || 'Unknown Model',
          modelImage: modelInfo?.model_image || '/images/images/default.webp',
          progress: 0,
          status: 'generating',
          conversationId,
          responseId,
          prompt: prompt || ''
        });
        
        // Add to the generating videos to start polling
        setGeneratingVideos(prev => ({
          ...prev,
          [modelId]: {
            jobId,
            responseId
          }
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [modelId]: {
            message: response.message || 'Failed to generate video',
            type: 'failed'
          }
        }));
        // Remove from loading
        setLoadingModels(prev => prev.filter(id => id !== modelId));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [modelId]: {
          message: 'Failed to generate video',
          type: 'failed'
        }
      }));
      // Remove from loading
      setLoadingModels(prev => prev.filter(id => id !== modelId));
    }
  };

  // Handle initial response for new generation
  const handleInitialResponse = async () => {
    if (!conversationId || !promptId) {
      return;
    }

    setConversationModels(selectedModels.video);
    setPreviousSelectedModels(selectedModels.video);
    
    const activeModels = selectedModels.video.filter(
      modelId => !inactiveModels.includes(modelId)
    );
    
    setLoadingModels(activeModels);
    setVideos([]);
    setErrors({});
    
    // Set the prompt from content store
    const promptContent = content.video?.input;
    if (promptContent) {
      setPrompt(promptContent);
    }
    
    activeModels.forEach(modelId => {
      generateVideo(modelId);
    });
  };

  // Load existing conversation content
  const loadConversation = async () => {
    if (!videoId) {
      toast.error('Conversation does not exist');
        router.replace('/chat');
        // console.log('No conversation ID found in the URL parameters');
        return;
    };
    
    setConversationId(videoId);     
    setIsLoadingConversation(true);
    setLoadingLatest(true);

    // const historyItem = getHistoryItemById(videoId);
    // if (historyItem && historyItem.title) {
    //   document.title = `${historyItem.title} - Alle-AI`;
    // }
    
    try {
      const response = await chatApi.getConversationContent('video', videoId);
      
      if (response && response.length > 0 && response[0].prompt) {
        setContent("video", "input", response[0].prompt);
        setPrompt(response[0].prompt);

        // Set page title after content is loaded
        const truncatedPrompt = response[0].prompt.substring(0, 50);
        document.title = `${truncatedPrompt} - Alle-AI`;
        
        // First, categorize all responses
        const completedVideos: GeneratedVideo[] = [];
        const pendingVideos: Record<string, GeneratingVideo> = {};
        
        // Process all responses and check their status
        for (const promptData of response) {
          if (promptData.responses && Array.isArray(promptData.responses)) {
            for (const resp of promptData.responses) {
              const responseId = resp.id.toString();
              const modelId = resp.model.uid;
              
              try {
                // Check status for each video
                const statusResponse = await chatApi.checkVideoGenerationStatus(responseId);
                // console.log('Status response:', statusResponse);
                
                if (statusResponse.data.status.toLowerCase() === "completed" && statusResponse.data.url) {
                  // Video is ready
                  completedVideos.push({
                    id: responseId,
                    modelId: modelId,
                    videoUrl: statusResponse.data.url,
                    liked: resp.liked || false
                  });
                } else if (statusResponse.data.status.toLowerCase() === "failed" || statusResponse.data.status.toLowerCase() === "filter_error") {
                  // Video generation failed
                  setErrors(prev => ({
                    ...prev,
                    [modelId]: {
                      message: statusResponse.data.message || "Video generation failed. Please try again.",
                      type: statusResponse.data.status.toLowerCase() === "filter_error" ? 'filter_error' : 'failed'
                    }
                  }));
                } else {
                  // Video is still generating
                  pendingVideos[modelId] = { responseId };
                }
              } catch (error) {
                // console.error(`Error checking status for video ${responseId}:`, error);
                // If we can't check status, assume it's pending
                pendingVideos[modelId] = { responseId };
              }
            }
          }
        }
        
        // Then update states in the correct order
        // 1. First set completed videos
        setVideos(completedVideos);
        
        // 2. Then set pending videos and their loading states
        if (Object.keys(pendingVideos).length > 0) {
          setGeneratingVideos(pendingVideos);
          setLoadingModels(Object.keys(pendingVideos));
        }
      } else {
        toast.error("Failed to load video");
      }
    } catch (error) {
      // toast.error("Failed to load video");
      // console.error("Error loading conversation:", error);
      router.replace('/video');
      setIsLoadingConversation(false);
      setLoading(false);
    }
  };

  // Determine what to do when the component mounts based on generationType
  useEffect(() => {
    if (generationType === 'new') {
      handleInitialResponse();
      setLoading(false);
    } else if (generationType === 'load') {
      loadConversation();
    }
  }, [generationType, conversationId, promptId]);

  // Update the useEffect to check if video models are loaded
  useEffect(() => {
    // Check if chat models are loaded
    if (videoModels && videoModels.length > 0) {
      setVideoModelsLoaded(true);
    }
  }, [videoModels]);

  // Get conversation models for loaded conversations
  useEffect(() => {
    if (conversationId && generationType === 'load' && videoModelsLoaded ) {
      getConversationModels(conversationId);
    }
  }, [conversationId, generationType, videoModelsLoaded]);

  const getConversationModels = (conversationId: string) => {
    chatApi.getModelsForConversation(conversationId)
      .then(response => {
        if (!response || !Array.isArray(response)) {
          // console.error('Failed to load conversation models', response);
          toast.error('Failed to load conversation models')
          return;
        }

        const modelUids = response.map((model: any) => model.model_uid);

        // Get the store actions
        const store = useSelectedModelsStore.getState();
        
        // Filter models to only include those that exist in available models
        const availableModelIds = videoModels.map(model => model.model_uid);
        const validModelUids = modelUids.filter((uid: string) => availableModelIds.includes(uid));
        
        // Only set models that are available in the system
        if (validModelUids.length > 0) {
          setConversationModels(validModelUids);
          setTempSelectedModels(validModelUids);
          saveSelectedModels('video');
          
          // Create a new array for inactive models based on the response
          const inactiveModels = response
            .filter((model: { active: number; model_uid: string }) => 
              model.active === 0 && validModelUids.includes(model.model_uid))
            .map((model: { model_uid: string }) => model.model_uid);
          
          store.setInactiveModels(inactiveModels);
        } else {
          setConversationModels([]);
          setTempSelectedModels([]);
          saveSelectedModels('video');
        }
      })
      .catch(error => {
        // console.error('Error fetching models for conversation:', error);
      })
      .finally(() => {
        setLoadingLatest(false);
      });
  };

  const handleLike = useCallback(async (video: GeneratedVideo) => {
    try {
    const newVideos = [...videos];
    const index = newVideos.findIndex(v => v.modelId === video.modelId);
      const modelInfo = videoModels.find(m => m.model_uid === video.modelId);
    const newLikedState = !video.liked;
      
      // Update local state first for responsive UI
    newVideos[index].liked = newLikedState;
    setVideos(newVideos);
      
      // Update like state on the server
      await chatApi.updateLikeState(video.id, newLikedState ? 'liked' : 'none');
    
    if (newLikedState) {
      // Add to liked media store
      // addLikedMedia({
      //   type: 'video',
      //   responseId: video.id.toString(),
      //   url: video.videoUrl,
      //     modelName: modelInfo?.model_name || '',
      //     modelIcon: modelInfo?.model_image || '',
      //   modelId: video.modelId,
      //   prompt: prompt,
      //   liked: true,
      // });

        toast.success(`${modelInfo?.model_name}'s video liked`);
    } else {
        // Remove from liked media store
      const likedItems = useLikedMediaStore.getState().getLikedMediaByType('video');
      const likedItem = likedItems.find(item => 
        item.modelId === video.modelId && 
        item.url === video.videoUrl
      );
        
      // if (likedItem) {
      //   removeLikedMedia(likedItem.id);
      // }

        toast.success(`${modelInfo?.model_name}'s video unliked`);
      }
    } catch (error) {
      // toast.error("Failed to update like status");
      // Revert the UI change on error
      const newVideos = [...videos];
      const index = newVideos.findIndex(v => v.modelId === video.modelId);
      newVideos[index].liked = !newVideos[index].liked;
      setVideos(newVideos);
    }
  }, [videos, prompt, videoModels]);

  const handleRetry = async (modelId: string) => {
    if (!conversationId || !promptId) return;

    // Add model to retrying state 
    setRetryingModels(prev => [...prev, modelId]);
    setErrors(prev => ({ ...prev, [modelId]: { message: '', type: 'failed' } }));
    setVideos(prev => prev.filter(video => video.modelId !== modelId));

    try {
      const response = await chatApi.generateResponse({
        conversation: conversationId,
        model: modelId,
        is_new: false,
        prompt: promptId
      });

      if (response.status && response.data) {
        // Get response ID and job ID for tracking
        const responseId = response.data.id.toString();
        const jobId = response.data.response; // This is the job ID
        
        // Add to the generating videos to start polling
        setGeneratingVideos(prev => ({
          ...prev,
          [modelId]: {
            jobId,
            responseId
          }
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [modelId]: {
            message: response.message || 'Failed to generate video',
            type: 'failed'
          }
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [modelId]: {
          message: 'Failed to generate video',
          type: 'failed'
        }
      }));
    } finally {
      // Remove model from retrying state
      setRetryingModels(prev => prev.filter(id => id !== modelId));
    }
  };

  const handleNext = useCallback((currentIndex: number) => {
    const filteredVideos = videos.filter(video => videoModels.find(m => m.model_uid === video.modelId));
    if (currentIndex < filteredVideos.length - 1) {
      return filteredVideos[currentIndex + 1];
    }
    return null;
  }, [videos, videoModels]);

  const handlePrevious = useCallback((currentIndex: number) => {
    const filteredVideos = videos.filter(video => videoModels.find(m => m.model_uid === video.modelId));
    if (currentIndex > 0) {
      return filteredVideos[currentIndex - 1];
    }
    return null;
  }, [videos, videoModels]);

  // Component to show retry option for failed videos
  const RetryVideoGeneration = ({ modelId }: { modelId: string }) => {
    const modelInfo = videoModels.find(m => m.model_uid === modelId);
    const isRetrying = retryingModels.includes(modelId);
    const error = errors[modelId];

    if (!modelInfo || !error) return null;

    return (
      <div className="relative rounded-lg overflow-hidden bg-backgroundSecondary border border-red-500 aspect-video">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 p-2 rounded-lg">
          <Image
            src={modelInfo.model_image || '/images/images/default.webp'} 
            alt={modelInfo.model_name} 
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-white text-sm font-medium">
            {modelInfo.model_name}
          </span>
        </div>

        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">{error.message}</p>
            {error.type === 'failed' && (
              <Button 
                onClick={() => handleRetry(modelId)}
                variant="outline" 
                className="gap-2 text-red-500"
                disabled={isRetrying}
              >
                {isRetrying ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show a message when there are no videos or an error
  const renderEmptyState = () => {
    if (isLoadingConversation) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
          <Loader className="h-4 w-4 animate-spin mb-4" />
          {/* <h3 className="text-xl font-medium mb-2">Loading videos</h3> */}
        </div>
      );
    }

    if (!loading && videos.length === 0 && Object.keys(errors).length === 0 && loadingModels.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Video className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No videos yet</h3>
          {/* <p className="text-muted-foreground max-w-md">Use the input field at the bottom to generate your first video.</p> */}
        </div>
      );
    }

    return null;
  };

  // Add debugging for VideoResponse rendering
  const debugVideoResponse = (video: GeneratedVideo, index?: number) => {
    // console.log('Rendering VideoResponse for:', video);
    // Check if the video model exists
    const modelInfo = videoModels.find(m => m.model_uid === video.modelId);
    // console.log('Model info:', modelInfo);
    
    // When in carousel mode, use proper navigation
    const hasNext = settings.display === "carousel" && index !== undefined && index < videos.length - 1;
    const hasPrevious = settings.display === "carousel" && index !== undefined && index > 0;
    
    const handleNext = () => {
      const nextButton = document.querySelector('.embla__next');
      if (nextButton) {
        nextButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    };
    
    const handlePrevious = () => {
      const prevButton = document.querySelector('.embla__prev');
      if (prevButton) {
        prevButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    };
    
    return (
      <div className="rounded-lg overflow-hidden max-h-full w-full">
        <VideoResponse 
          video={video} 
          onLike={() => handleLike(video)}
          onNext={hasNext ? handleNext : undefined}
          onPrevious={hasPrevious ? handlePrevious : undefined}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          videoModels={videoModels}
        />
      </div>
    );
  };

  // Add effect to check if content needs truncation
  useEffect(() => {
    if (promptRef.current) {
      const lineHeight = parseInt(getComputedStyle(promptRef.current).lineHeight);
      const contentHeight = promptRef.current.scrollHeight;
      const maxHeight = lineHeight * MAX_LINES;
      setNeedsTruncation(contentHeight > maxHeight);
    }
  }, [prompt]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Copied');
  };

  return (
    <div className="flex-1 overflow-hidden h-[calc(100vh-10rem)]">
      <ScrollArea className="h-full w-full">
        <div className="max-w-xl sm:max-w-2xl md:max-w-4xl mx-auto p-4 pb-20">
          {/* Show prompt if available */}
          {prompt && (
            <div className="flex items-center justify-center mb-8 p-4 bg-backgroundSecondary rounded-lg relative">
              <div className="flex-1 relative">
                <AnimatePresence initial={false}>
                  <motion.p 
                    ref={promptRef}
                    initial={{ height: "auto" }}
                    animate={{ height: isPromptExpanded ? "auto" : needsTruncation ? "7.5rem" : "auto" }}
                    exit={{ height: needsTruncation ? "7.5rem" : "auto" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`text-base whitespace-pre-wrap break-words overflow-hidden ${
                      !isPromptExpanded && needsTruncation ? 'line-clamp-3' : ''
                    }`}
                  >
                    {prompt}
                  </motion.p>
                </AnimatePresence>
                {needsTruncation && (
                  <motion.button
                    onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                    className="absolute -bottom-4 -left-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: isPromptExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                    {isPromptExpanded ? 'Show less' : 'Show more'}
                  </motion.button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-accent/50 ml-2 flex-shrink-0"
                onClick={handleCopyPrompt}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Only show empty state if no videos, no generating videos, and no errors */}
          {videos.length === 0 && Object.keys(generatingVideos).length === 0 && 
           Object.keys(errors).length === 0 && loadingModels.length === 0 && renderEmptyState()}

          {/* Combined display for videos, errors, and all loading states */}
          <div className={cn(
            "mb-10",
            settings.display === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
              : settings.display === "carousel"
                ? "w-full px-4" 
                : "space-y-6"
          )}>
            {settings.display === "carousel" && videos.length > 0 ? (
              <Carousel 
                className="w-full"
                opts={{
                  align: "center",
                  loop: false,
                  dragFree: false
                }}
              >
                <CarouselContent>
                  {videos.map((video, index) => (
                    <CarouselItem key={`video-${video.id}`} className="basis-full">
                      {debugVideoResponse(video, index)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Keeping the controls but making them invisible for programmatic navigation */}
                <div className="hidden">
                  <CarouselPrevious className="embla__prev" />
                  <CarouselNext className="embla__next" />
                </div>
              </Carousel>
            ) : (
              <>
                {/* Create a combined array of all model IDs in their original order */}
                {selectedModels.video
                  .filter(modelId => !inactiveModels.includes(modelId))
                  .map(modelId => {
                    // Check if this model has a completed video
                    const video = videos.find(v => v.modelId === modelId);
                    if (video) {
                      return (
                        <div key={`video-${video.id}`}>
                          {debugVideoResponse(video)}
                        </div>
                      );
                    }
                    
                    // Check if this model has an error
                    if (errors[modelId]) {
                      return <RetryVideoGeneration key={`error-${modelId}`} modelId={modelId} />;
                    }
                    
                    // Check if this model is in generating state
                    if (Object.keys(generatingVideos).includes(modelId)) {
                      return (
                        <VideoSkeleton 
                          key={`generating-${modelId}`} 
                          modelId={modelId} 
                          isGenerating={true}
                        />
                      );
                    }
                    
                    // Otherwise, show initial loading skeleton
                    if (loadingModels.includes(modelId)) {
                      return (
                        <VideoSkeleton 
                          key={`skeleton-${modelId}`} 
                          modelId={modelId} 
                          isGenerating={false}
                        />
                      );
                    }
                    
                    return null;
                  })
                  .filter(Boolean)}
              </>
            )}
          </div>

        </div>
      </ScrollArea>

      <PromptModal 
        isOpen={showPrompt} 
        onClose={() => {
          setTempSelectedModels(previousSelectedModels);
          saveSelectedModels('video');
          setShowPrompt(false);
        }}
        closeOnOutsideClick={false} // Disable closing when clicking outside
        {...promptConfig}
      />
      <ModelSelectionModal
        isOpen={modelSelectionModalOpen}
        onClose={() => setModelSelectionModalOpen(false)}
      />
    </div>
  );
};

export default VideoArea;