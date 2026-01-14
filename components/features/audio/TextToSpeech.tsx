"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Share2, ChevronDown, ChevronUp, Heart, Loader, ThumbsDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatApi } from '@/lib/api/chat';
import { useContentStore, useSelectedModelsStore, useHistoryStore, useLikedMediaStore, useSidebarStore } from "@/stores";
import { useConversationStore } from '@/stores/models';
import { useModelsStore } from '@/stores/models';
import { Skeleton } from "@/components/ui/skeleton";
import { PromptModal, ShareDialog } from "@/components/ui/modals";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";

import { FeedbackTooltip } from "@/components/ui/modals/dislike-feedback-tooltip";
import { useAudioTabStore } from '@/stores/audioTabStore';
import { useAudioCategorySelectionStore } from '@/stores/audioCategorySelectionStore';
import RenderPageContent from "@/components/RenderPageContent";

type ModelResult = {
  id: string;
  model: {
    name: string;
    avatar: string;
    provider: string;
  };
  audioUrl: string;
  liked?: boolean | null;
};

export default function TextToSpeechResult() {
  const params = useParams();
  const searchParams = useSearchParams();
  const loadConversationId = params.audioid as string;
  const text = searchParams.get('text') || 'Sample text for speech synthesis';
  const { selectedModels, inactiveModels, setTempSelectedModels, saveSelectedModels, setLoadingLatest } = useSelectedModelsStore();
  const { conversationId, promptId, setConversationId, generationType, setGenerationType } = useConversationStore();
  const { audioModels } = useModelsStore();
  const { content, setContent } = useContentStore();
  const { setActiveTab } = useAudioTabStore();
  const router = useRouter();
  const { setCategoryModel, getCategoryModel } = useAudioCategorySelectionStore();
  
  // Function to get model info from audioModels
  const getModelInfo = (modelId: string) => {
    const model = audioModels.find(model => model.model_uid === modelId);
    return model ? {
      name: model.model_name,
      avatar: model.model_image || '/images/default.webp',
      provider: model.model_provider
    } : null;
  };

  const [modelResult, setModelResult] = useState<ModelResult | null>(null);

  // Memoize the model info
  const currentModelInfo = useMemo(() => {
    if (generationType === 'load' && modelResult?.model) {
      // Use model info from the loaded conversation
      return {
        name: modelResult.model.name,
        avatar: modelResult.model.avatar,
        provider: modelResult.model.provider
      };
    }
    // Use selected model info for new conversations
    return getModelInfo(selectedModels.audio[0]);
  }, [selectedModels.audio, audioModels, generationType, modelResult]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharingAudio, setSharingAudio] = useState<{ url: string; modelName: string } | null>(null);
  const [audioModelsLoaded, setAudioModelsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { addLikedMedia, removeLikedMedia } = useLikedMediaStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const { isOpen } = useSidebarStore();


  const [conversationModels, setConversationModels] = useState<string[]>([]);
  const [previousSelectedModels, setPreviousSelectedModels] = useState<string[]>([]);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const [likingAudio, setLikingAudio] = useState(false);
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(false);
  const dislikeButtonRef = useRef<HTMLButtonElement>(null);
  const { getHistoryItemById } = useHistoryStore();

  const getConversationModels = (conversationId: string) => {
    chatApi.getModelsForConversation(conversationId)
      .then(response => {
        // console.log('Models used in conversation:', response);
        const modelUids = response.map((model: any) => model.model_uid);

        // Get the store actions
        const store = useSelectedModelsStore.getState();
        
        // Filter models to only include those that exist in available chat models
        const availableAudioModelUids = audioModels.map(model => model.model_uid);
        const validModelUids = modelUids.filter((uid: string) => availableAudioModelUids.includes(uid));
        
        // Only set models that are available in the system
        if (validModelUids.length > 0) {
          setConversationModels(validModelUids);
          setTempSelectedModels(validModelUids);
          saveSelectedModels('audio');
          
          // Create a new array for inactive models based on the response,
          // but only include models that are in our valid list
          const inactiveModels = response
            .filter((model: { active: number; model_uid: string }) => 
              model.active === 0 && validModelUids.includes(model.model_uid))
            .map((model: { model_uid: string }) => model.model_uid);
          
          store.setInactiveModels(inactiveModels);
        } else {
          setConversationModels([]);
          setTempSelectedModels([]);
          saveSelectedModels('audio');
        }
      })
      .catch(error => {
        // console.error('Error fetching models for conversation:', error);
      })
      .finally(() => {
        setLoadingLatest(false);
      });
  };

  useEffect(() => {
    if(selectedModels.audio.length > 0 && conversationModels.length > 0){
      setPreviousSelectedModels(selectedModels.audio);
        if (JSON.stringify(conversationModels) !== JSON.stringify(selectedModels.audio)) {
          setPromptConfig({
            title: "Change Models",
            message: "Selecting new models will start a new conversation. Do you want to continue?",
            type: "warning",
            actions: [
              {
                label: "Cancel",
                onClick: () => {
                  setTempSelectedModels(previousSelectedModels);
                  saveSelectedModels('audio');
                  setShowPrompt(false);
                },
                variant: "default"
              },
              {
                label: "Proceed",
                onClick: () => {
                  router.replace(`/audio`);
                },
                variant: "default"
              }
            ]
          });
          setShowPrompt(true);

        }
    }
  }, [selectedModels]);

  useEffect(() => {
    // Check if chat models are loaded
    if (audioModels && audioModels.length > 0) {
      // console.log(audioModels, 'here are the audio models')
      setAudioModelsLoaded(true);
    }
  }, [audioModels]);

  useEffect(()=>{
    if (conversationId && generationType === 'load' && audioModelsLoaded) {
      getConversationModels(conversationId);
    }
  },[conversationId, generationType, audioModelsLoaded])
  
  useEffect(() => {
    const handleInitialResponse = async () => {

      setConversationModels(selectedModels.audio);
      setPreviousSelectedModels(selectedModels.audio);

      setInitialPrompt(content.audio.input);
      const activeModels = selectedModels.audio.filter(modelId => !inactiveModels.includes(modelId));
      
      if (activeModels.length > 0) {
        const modelId = activeModels[0]; // Take the first model only
        try {
          const response = await chatApi.generateResponse({
            conversation: conversationId!,
            model: modelId,
            is_new: true,
            prompt: promptId!
          });
          
          if (response.status && response.data) {
            const modelInfo = getModelInfo(modelId);
            const result: ModelResult = {
              id: response.data.id.toString(),
              model: {
                name: modelInfo?.name || 'Unknown Model',
                avatar: modelInfo?.avatar || '/images/default.webp',
                provider: modelInfo?.provider || 'Unknown Provider'
              },
              audioUrl: response.data.response,
              liked: null,
            };
            
            setModelResult(result);
            setIsLoading(false);
          }
        } catch (error) {
          // console.error(`Error generating response for model ${modelId}:`, error);
          setIsLoading(false);
        }
      }
    };

    const loadConversation = async () => {
      if (!loadConversationId) {
        return;
      }
      
      setConversationId(loadConversationId);     
      setIsLoadingConversation(true);
      setLoadingLatest(true);
      setActiveTab('tts'); // Set active tab to 'tts' when loading conversation


      const historyItem = getHistoryItemById(loadConversationId);
      if (historyItem && historyItem.title) {
        document.title = `${historyItem.title} - Alle-AI`;
      }
      try {
        const response = await chatApi.getConversationContent('audio', loadConversationId);
        // console.log('Loaded conversation content:', response);
        
        if (response && response[0]) {
          // Set the initial prompt
          if (response[0].prompt) {
            setInitialPrompt(response[0].prompt);
          }

          // Get the first response (since TTS only has one response)
          const audioResponse = response[0].responses[0];
          if (audioResponse) {
            const result: ModelResult = {
              id: audioResponse.id.toString(),
              model: {
                name: audioResponse.model.name,
                avatar: audioResponse.model.image || '/images/default.webp',
                provider: audioResponse.model.provider
              },
              audioUrl: audioResponse.body,
              liked: audioResponse.liked === true ? true : audioResponse.liked === false ? false : null,
            };
            
            setModelResult(result);
            setCategoryModel('tts', audioResponse.model.uid);
            // After saving, set the selected model for the current tab from the store
            const storeModelId = getCategoryModel('tts');
            if (storeModelId) {
              setTempSelectedModels([storeModelId]);
            } else {
              setTempSelectedModels([]);
            }
            saveSelectedModels('audio');
          }
        }
      } catch (error) {
        // console.error('Error loading conversation:', error);
        router.replace('/audio');
        // toast.error('Failed to load conversation');
      } finally {
        setIsLoadingConversation(false);
        setIsLoading(false);
      }
    };

    if (generationType === 'new') {
      handleInitialResponse();
    } else if (generationType === 'load') {
      loadConversation();
    }
  }, []);

  // Update audio source when model result changes
  useEffect(() => {
    if (!audioRef.current || !modelResult) return;
    
    // Stop playback
    if (isPlaying) {
      setIsPlaying(false);
    }
    
    // Reset current time
    setCurrentTime(0);
    
    // Set new audio source
    // console.log('Setting audio URL:', modelResult.audioUrl);
    audioRef.current.src = modelResult.audioUrl;
    audioRef.current.load();
  }, [modelResult]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const audioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    // Event listeners
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', audioEnded);
    
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', audioEnded);
    };
  }, [audioRef, isLoading]);

  // Function to toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      // Show text when starting playback if it's not already visible
      if (!isTextVisible) {
        setIsTextVisible(true);
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  // Function to handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Function to toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    
    setIsMuted(!isMuted);
  };

  // Function to seek in the audio
  const seek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Function to format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Download audio function
  const downloadAudio = () => {
    const activeModel = modelResult;
    if (!activeModel) return;
    
    const modelName = activeModel.model.name;
    const audioUrl = activeModel.audioUrl;
    
    // Initiate download
    downloadAudioFile(audioUrl, modelName);
  };
  
  // Function to download audio file
  const downloadAudioFile = async (audioUrl: string, modelName: string) => {
    const loadingToast = toast.loading(`Downloading ${modelName} audio`);
    setDownloadingAudio(true);

    try {
      
      const response = await fetch(audioUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error('Failed to fetch audio file');
      }
      const blob = await response.blob();

      const filename = audioUrl.split('/').pop() || `Alle-AI-${modelName}-generated-audio.mp3`;

      // Create a link for the blob
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(link.href);

      toast.dismiss(loadingToast);
    } catch (error) {
      // console.error('Error downloading audio:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to download audio');
    } finally {
      setDownloadingAudio(false);
    }

  };

  // Share function
  const shareAudio = () => {
    const activeModel = modelResult;
    if (!activeModel) return;
    
    // Open share dialog
    setSharingAudio({
      url: activeModel.audioUrl,
      modelName: activeModel.model.name
    });
    setIsShareDialogOpen(true);
  };

  // Toggle favorite function
  const handleLike = async () => {
    if (!modelResult) return;
    
    // Determine the new state based on current state
    let newLikedState: 'liked' | 'none';
    if (isLiked) {
      // If currently liked, set to none (null)
      newLikedState = 'none';
    } else {
      // If currently disliked or null, set to liked
      newLikedState = 'liked';
    }
    
    setIsLiked(newLikedState === 'liked'); // Update UI immediately for responsiveness
    setIsDisliked(false); // Reset dislike state when liking
    setLikingAudio(true);
    
    try {
      // Make API call to update like state
      const response = await chatApi.updateLikeState(modelResult.id, newLikedState);
      
      if (response.status) {
        // Update modelResult state
        setModelResult(prev => prev ? { ...prev, liked: newLikedState === 'liked' ? true : null } : null);
        
        if (newLikedState === 'liked') {
          toast.success(`${modelResult.model.name} audio liked`);
        } else {
          toast.success(`${modelResult.model.name} audio unliked`);
        }
      } else {
        // Revert UI state if API call fails
        setIsLiked(!(newLikedState === 'liked'));
        toast.error('Something went wrong!');
      }
    } catch (error) {
      // Revert UI state on error
      setIsLiked(!(newLikedState === 'liked'));
      // console.error('Error updating like state:', error);
      // toast.error('Something went wrong!');
    } finally {
      setLikingAudio(false);
    }
  };

  // Toggle dislike function
  const handleDislike = async () => {
    if (!modelResult) return;
    
    // Determine the new state based on current state
    let newDislikedState: 'disliked' | 'none';
    if (isDisliked) {
      // If currently disliked, set to none (null)
      newDislikedState = 'none';
    } else {
      // If currently liked or null, set to disliked
      newDislikedState = 'disliked';
    }
    
    setIsDisliked(newDislikedState === 'disliked'); // Update UI immediately for responsiveness
    setIsLiked(false); // Reset like state when disliking
    setLikingAudio(true);
    
    try {
      // Make API call to update dislike state
      const response = await chatApi.updateLikeState(modelResult.id, newDislikedState);
      
      if (response.status) {
        // Update modelResult state
        setModelResult(prev => prev ? { ...prev, liked: newDislikedState === 'disliked' ? false : null } : null);
        
        // If we're setting to disliked and hasDislikeFeedback is false, show tooltip
        if (newDislikedState === 'disliked' && !response.hasDislikeFeedback) {
          setShowFeedbackTooltip(true);
        }
        
        if (newDislikedState === 'disliked') {
          toast.success(`${modelResult.model.name} audio disliked`);
        } else if (newDislikedState === 'none') {
          // toast.success(`${modelResult.model.name} audio undisliked`);
        }
      } else {
        // Revert UI state if API call fails
        setIsDisliked(!(newDislikedState === 'disliked'));
        toast.error('Something went wrong!');
      }
    } catch (error) {
      // Revert UI state on error
      setIsDisliked(!(newDislikedState === 'disliked'));
      // console.error('Error updating dislike state:', error);
      // toast.error('Something went wrong!');
    } finally {
      setLikingAudio(false);
    }
  };

  return (
    <div className={`container max-w-5xl mx-auto py-4 px-4 flex flex-col h-full ${isOpen ? "pl-40" : "pl-6"}`}>
      {isLoadingConversation ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-4 w-4 animate-spin" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Card className="overflow-hidden bg-backgroundSecondary border-borderColorPrimary mb-4">
              <div className="p-6">
                <div className="space-y-6">
                  {/* Model Info Banner */}
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      {isLoading ? (
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage 
                              src={currentModelInfo?.avatar || '/images/default.webp'} 
                              alt={currentModelInfo?.name || 'Loading'} 
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {currentModelInfo?.name?.slice(0, 2).toUpperCase() || 'LD'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm sm:text-lg leading-none">
                              {currentModelInfo?.name || 'No model selected'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {currentModelInfo?.provider || 'Select a model'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage 
                              src={currentModelInfo?.avatar || '/images/default.webp'} 
                              alt={currentModelInfo?.name || 'Loading'} 
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {currentModelInfo?.name?.slice(0, 2).toUpperCase() || 'LD'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm sm:text-lg leading-none">
                              {currentModelInfo?.name || 'No model selected'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {currentModelInfo?.provider || 'Select a model'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {isPlaying ? (
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-7 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                          <div className="w-1.5 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '900ms' }}></div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {modelResult ? 'Ready to play' : <Loader className="h-4 w-4 animate-spin" />}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Slider */}
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={seek}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Playback Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={togglePlayPause}
                        disabled={!modelResult}
                        className="h-10 w-10 rounded-full hover:bg-primary/90"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleMute}
                        disabled={!modelResult}
                        className="h-8 w-8 text-foreground/80 hover:bg-primary/10"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Slider
                        disabled={!modelResult}
                        value={[isMuted ? 0 : volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleLike}
                        disabled={!modelResult || likingAudio}
                        className={`h-8 w-8 text-foreground/80 hover:bg-primary/10 ${modelResult?.liked === true ? 'text-red-500 hover:text-red-600' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${modelResult?.liked === true ? 'fill-current' : ''}`} />
                      </Button>

                      <Button
                        ref={dislikeButtonRef}
                        size="icon"
                        variant="ghost"
                        onClick={handleDislike}
                        disabled={!modelResult || likingAudio}
                        className={`h-8 w-8 text-foreground/80 hover:bg-primary/10 ${modelResult?.liked === false ? 'text-red-500 hover:text-red-600' : ''}`}
                      >
                        <ThumbsDown className={`h-4 w-4 ${modelResult?.liked === false ? 'fill-current' : ''}`} />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={downloadAudio}
                        disabled={!modelResult || downloadingAudio}
                        className="h-8 w-8 text-foreground/80 hover:bg-primary/10"
                      >
                        {downloadingAudio ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={shareAudio}
                        disabled={!modelResult}
                        className="h-8 w-8 text-foreground/80 hover:bg-primary/10"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Text Toggle Button */}
          <Button 
            variant="outline" 
            onClick={() => setIsTextVisible(!isTextVisible)}
            className="w-full flex items-center justify-center gap-2 text-sm mb-4"
          >
            {isTextVisible ? (
              <>
                Hide Original Text <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Original Text <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
          
          {/* Text Section - Collapsible */}
          <AnimatePresence>
            {isTextVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="bg-backgroundSecondary border-borderColorPrimary flex-grow mb-4">
                  <div className="p-4">
                    <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent pr-2">
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {initialPrompt}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden audio element for playback */}
          <audio 
            ref={audioRef}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            onError={(e) => {
              console.error('Audio error:', e);
            }}
            preload="metadata"
          />
          
          {/* Share Dialog */}
          {sharingAudio && (
            <ShareDialog
              isOpen={isShareDialogOpen}
              onClose={() => {
                setIsShareDialogOpen(false);
                setSharingAudio(null);
              }}
              imageUrl={sharingAudio.url}
              modelName={sharingAudio.modelName}
            />
          )}
        </>
      )}

      <PromptModal 
        isOpen={showPrompt} 
        onClose={() => {
          setTempSelectedModels(previousSelectedModels);
          saveSelectedModels('audio');
          setShowPrompt(false);
        }}
        closeOnOutsideClick={false} // Disable closing when clicking outside
        {...promptConfig}
      />
      <ModelSelectionModal
        isOpen={modelSelectionModalOpen}
        onClose={() => setModelSelectionModalOpen(false)}
      />

      {/* Feedback Tooltip */}
      <FeedbackTooltip
        responseId={modelResult?.id || ''}
        isOpen={showFeedbackTooltip}
        onClose={() => setShowFeedbackTooltip(false)}
        triggerRef={dislikeButtonRef}
        onFeedbackSubmitted={() => {
          // Feedback was submitted successfully
        }}
        onDislikeStateChange={(responseId, state, hasDislikeFeedback) => {
          // Update the audio state if needed
          setModelResult(prev => prev ? { 
            ...prev, 
            liked: state === 'disliked' ? false : null 
          } : null);
        }}
      />
    </div>
  );
}