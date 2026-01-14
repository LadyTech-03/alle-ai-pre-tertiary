"use client"

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image';
import { useContentStore, useSelectedModelsStore, useGeneratedImagesStore, useLikedMediaStore, useAuthStore } from "@/stores";
import { Copy, Download, Share2, Heart, Plus, RefreshCcw, X, Loader, ThumbsDown } from "lucide-react";
import { toast } from "sonner"
import { usePathname, useRouter } from 'next/navigation';
import { Model } from "@/lib/api/models";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromptModal, ShareDialog } from "@/components/ui/modals";
import { FeedbackTooltip } from "@/components/ui/modals/dislike-feedback-tooltip";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";


import { Skeleton as AntdSkeleton} from 'antd';
import { Button } from '@/components/ui/button';
import { chatApi, LikeState } from '@/lib/api/chat';
import { useConversationStore } from '@/stores/models';
import { useModelsStore } from '@/stores/models';
import { useParams } from 'next/navigation';
import { useHistoryStore } from '@/stores';
import { is } from 'date-fns/locale';

interface SelectedImage {
  modelId: string;
  imageUrl: string;
  liked?: boolean;
}

const RetryImageGeneration = ({ modelInfo, onRetry, isRetrying }: { 
  modelInfo: { name: string; icon: string; }; 
  onRetry: () => void;
  isRetrying?: boolean; 
}) => {
  return (
    <div onClick={onRetry} className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-lg overflow-hidden border border-red-500 hover:bg-backgroundSecondary cursor-pointer">
      {/* Model Info Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 p-2 rounded-lg">
        <Image 
          src={modelInfo.icon ? modelInfo.icon : '/images/images/default.webp'} 
          alt={modelInfo.name} 
          width={32}
          height={32}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-white text-sm font-medium">
          {modelInfo.name}
        </span>
      </div>

      {/* Simple centered retry button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Button 
          onClick={onRetry}
          variant="secondary" 
          className="gap-2 text-red-500"
          disabled={isRetrying}
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

interface ImageResponse {
  modelId: string;
  imageUrl: string;
  liked: boolean;
  id?: number;
  model: { uid: string; }; 
  body: string; 
}

interface GeneratedImage {
  modelId: string;
  imageUrl: string;
  liked: boolean | null;
  id: number;
  originalImageUrl: string;
}

const PromptDisplay = ({ text, maxLength }: { text: string; maxLength: number }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const displayText = expanded ? text : text.substring(0, maxLength)
  
  return (
    <div className="flex flex-col">
      <div className="text-base">
        {displayText}
        <button
          onClick={toggleExpand}
          className="text-sm italic text-muted-foreground hover:text-primary/80 mt-1 ml-2 self-start"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      </div>
    </div>
  );
};

const ImageArea = () => {
  const { content, setContent } = useContentStore();
  const { selectedModels, inactiveModels, setTempSelectedModels, saveSelectedModels, setLoadingLatest } = useSelectedModelsStore();
  const { conversationId, promptId, generationType, setConversationId } = useConversationStore();
  const { imageModels } = useModelsStore();
  const { user, plan, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const loadConversationId = typeof params.chatId === 'string' ? params.chatId : typeof params.shareId === 'string' ? params.shareId : undefined;
  

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [retryingModels, setRetryingModels] = useState<string[]>([]);
  const [imageModelsLoaded, setImageModelsLoaded] = useState(false);
  const { addLikedMedia, removeLikedMedia } = useLikedMediaStore();
  
  const [conversationModels, setConversationModels] = useState<string[]>([]);
  const [previousSelectedModels, setPreviousSelectedModels] = useState<string[]>([]);
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [likingImage, setLikingImage] = useState(false);
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const dislikeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { getHistoryItemById } = useHistoryStore();
  const [sharedPrompt, setSharedPrompt] = useState('');

    // Determine generation type synchronously based on pathname
  const currentGenerationType = pathname.startsWith('/image/shares') || pathname.startsWith('/shares') ? 'share' : generationType;


    // Helper: set models and inactive states from shared conversation (expects response.model_instances)
    const extractModelUidsFromSharedConversation = (response: any) => {
      if (currentGenerationType !== 'share' || !isAuthenticated) return;
      
      const modelUids = response.model_instances.map((model: Model) => model.model_uid);
      // console.log(modelUids, 'the model uids');
  
      const store = useSelectedModelsStore.getState();
  
      if (modelUids.length > 0) {
      //   // First, set the selected models
        setTempSelectedModels(modelUids);
        saveSelectedModels('image');
        
        // Create a new array for inactive models based on the response,
        const inactiveModels = response.model_instances
          .filter((model: { active: number; model_uid: string }) => 
            model.active === 0 && modelUids.includes(model.model_uid))
          .map((model: { model_uid: string }) => model.model_uid);
        
        store.setInactiveModels(inactiveModels);
        setLoadingLatest(false);
  
      } else {
        setTempSelectedModels([]);
        saveSelectedModels('image');
        setLoadingLatest(false);
      }
  
    };

  useEffect(() => {
    const generateImage = async (modelId: string) => {
      if (!conversationId || !promptId) return;
      if(isAuthenticated) return;
      
      try {
        const response = await chatApi.generateResponse({
          conversation: conversationId,
          model: modelId,
          is_new: true,
          prompt: promptId
        });

        if (response.status && response.data) {
          // Add the new image as soon as it's generated
          setGeneratedImages(prev => [...prev, {
            modelId: response.data.model_uid,
            // imageUrl: response.data.response,
            imageUrl: `/api/watermark?imageUrl=${encodeURIComponent(response.data.response)}`,
            originalImageUrl: response.data.response,
            liked: null,
            id: response.data.id
          }]);
        } else {
          setErrors(prev => ({
            ...prev,
            [modelId]: response.message || 'Failed to generate image'
          }));
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [modelId]: 'Failed to generate image'
        }));
      } finally {
        setLoadingModels(prev => prev.filter(id => id !== modelId));
      }
    };

    const handleInitialResponse = async () => {
      if (!conversationId || !promptId) return;
      if(isAuthenticated) return;

      setConversationModels(selectedModels.image);
      setPreviousSelectedModels(selectedModels.image);
      
      const activeModels = selectedModels.image.filter(
        modelId => !inactiveModels.includes(modelId)
      );
      
      // console.log('Active Models after filter:', activeModels);
      
      setLoadingModels(activeModels);
      setGeneratedImages([]);
      setErrors({});

      // console.log('About to start image generation for models:', activeModels);
      
      activeModels.forEach(modelId => {
        generateImage(modelId);
      });
    };

    const loadConversation = async () => {
      if (!loadConversationId) {
        toast.error('Conversation does not exist');
        router.replace('/chat');
        // console.log('No conversation ID found in the URL parameters');
        return;
      }
      
      setConversationId(loadConversationId);     
      setIsLoadingConversation(true);
      if(isAuthenticated) {
        setLoadingLatest(true);
      }
      
      try {
        if(currentGenerationType === 'share') {
          const response = await chatApi.getShareConversation(loadConversationId);
          handleLoadConversation(response);
          // @ts-ignore
          setSharedPrompt(response.content[0].prompt);
        } else {
          const response = await chatApi.getConversationContent('image', loadConversationId);
          handleLoadConversation(response);
        if (response && response[0]?.prompt) {
          // setContent("image", "input", response[0].prompt);
          setSharedPrompt(response[0].prompt);
          
          // Set page title after content is loaded
          const historyItem = getHistoryItemById(loadConversationId);
          if (historyItem && historyItem.title) {
            document.title = `${historyItem.title.substring(0, 50)} - Alle-AI`;
          } else if (response[0].prompt) {
            // Fallback: Use first 50 characters of prompt as title
            const truncatedPrompt = response[0].prompt.substring(0, 50);
            document.title = `${truncatedPrompt} - Alle-AI`;
          }
        }
      }
        // response.forEach(promptData => {
        //   const loadedImages: GeneratedImage[] = promptData.responses.map(resp => ({
        //     modelId: resp.model.uid,
        //     // imageUrl: resp.body,
        //     imageUrl: `/api/watermark?imageUrl=${encodeURIComponent(resp.body)}`,
        //     originalImageUrl: resp.body,
        //     liked: resp.liked === true ? true : resp.liked === false ? false : null,
        //     id: Number(resp.id)
        //   }));
          
        //   setGeneratedImages(prev => [...prev, ...loadedImages]);
        // });
        setIsLoadingConversation(false);
      } catch (error) {
        console.error('Error loading conversationn:', error);
        setIsLoadingConversation(false);
        router.replace('/image');
        // toast.error('Failed to load conversation');
      }
    };

    if (generationType === 'new') {
      handleInitialResponse();
    } else if(generationType === 'load' || currentGenerationType === 'share'){
      loadConversation();
    }
  }, []);

  const handleLoadConversation = (loadedConversation: any[] | any) => {
    extractModelUidsFromSharedConversation(loadedConversation);
    const LoadedConversationContent = loadedConversation.content ?? loadedConversation; 
    LoadedConversationContent.forEach((promptData: any) => {
      const loadedImages: GeneratedImage[] = promptData.responses.map((resp: ImageResponse) => ({
        modelId: resp.model.uid,
        // imageUrl: resp.body,
        imageUrl: `/api/watermark?imageUrl=${encodeURIComponent(resp.body)}`,
        originalImageUrl: resp.body,
        liked: resp.liked === true ? true : resp.liked === false ? false : null,
        id: Number(resp.id)
      }));
      
      setGeneratedImages(prev => [...prev, ...loadedImages]);
    });
  }

  useEffect(() => {
    // Check if chat models are loaded
    if (imageModels && imageModels.length > 0) {
      // console.log(imageModels, 'here are the image models')
      setImageModelsLoaded(true);
    }
  }, [imageModels]);

  useEffect(()=>{
    if (conversationId && generationType === 'load' && imageModelsLoaded) {
      getConversationModels(conversationId);
    }
  },[conversationId, generationType, imageModelsLoaded])

    useEffect(() => {
      if(selectedModels.image.length > 0 && conversationModels.length > 0){
        setPreviousSelectedModels(selectedModels.image);
          if (JSON.stringify(conversationModels) !== JSON.stringify(selectedModels.image)) {
            setPromptConfig({
              title: "Change Models",
              message: "Selecting new models will start a new conversation. Do you want to continue?",
              type: "warning",
              actions: [
                {
                  label: "Cancel",
                  onClick: () => {
                    setTempSelectedModels(previousSelectedModels);
                    saveSelectedModels('image');
                    setShowPrompt(false);
                  },
                  variant: "default"
                },
                {
                  label: "Proceed",
                  onClick: () => {
                    router.replace(`/image`);
                  },
                  variant: "default"
                }
              ]
            });
            setShowPrompt(true);
  
          }
      }
    }, [selectedModels]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharingImage, setSharingImage] = useState<{ url: string; modelName: string } | null>(null);

  const getConversationModels = (conversationId: string) => {
    chatApi.getModelsForConversation(conversationId)
      .then(response => {
        // console.log('Models used in conversation:', response);
        const modelUids = response.map((model: any) => model.model_uid);

        // Get the store actions
        const store = useSelectedModelsStore.getState();
        
        // Filter models to only include those that exist in available chat models
        const availableImageModelUids = imageModels.map(model => model.model_uid);
        const validModelUids = modelUids.filter((uid: string) => availableImageModelUids.includes(uid));
        
        // Only set models that are available in the system
        if (validModelUids.length > 0) {
          setConversationModels(validModelUids);
          setTempSelectedModels(validModelUids);
          saveSelectedModels('image');
          
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
          saveSelectedModels('image');
        }
      })
      .catch(error => {
        // console.error('Error fetching models for conversation:', error);
      })
      .finally(() => {
        setLoadingLatest(false);
      });
  };


  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleLike = async (modelId: string, imageId: number) => {
    const image = selectedImage?.modelId === modelId ? 
      selectedImage : 
      generatedImages.find(img => img.modelId === modelId);
      
    const modelInfo = getModelInfo(modelId);
    
    // Determine the new state based on current state
    let newLikedState: LikeState;
    if (image?.liked === true) {
      // If currently liked, set to none (null)
      newLikedState = 'none';
    } else {
      // If currently disliked or null, set to liked
      newLikedState = 'liked';
    }
    
    setLikingImage(true);
    
    try {
      const response = await chatApi.updateLikeState(imageId.toString(), newLikedState);
      
      if (response.status) {
        // Update both generatedImages and selectedImage if open
        setGeneratedImages(prev => prev.map(img =>
          img.modelId === modelId ? { 
            ...img, 
            liked: newLikedState === 'liked' ? true : null 
          } as GeneratedImage : img
        ));
  
        // Update selectedImage if it's the same image
        if (selectedImage?.modelId === modelId) {
          setSelectedImage(prev => prev ? { 
            ...prev, 
            liked: newLikedState === 'liked' ? true : null 
          } : null);
        }
  
        // Show appropriate toast message
        if (newLikedState === 'liked') {
          toast.success(`${modelInfo?.name} image liked`);
        } else if (newLikedState === 'none') {
          // toast.success(`${modelInfo?.name} image unliked`);
        }
        setLikingImage(false);
      } else {
        toast.error('Ooops! something went wrong')
      }
    } catch (error) {
      // console.error('Error updating like state:', error);
      setLikingImage(false);
      // toast.error('Ooops! something went wrong')
    }
  };

  const handleDislike = async (modelId: string, imageId: number) => {
    const image = selectedImage?.modelId === modelId ? 
      selectedImage : 
      generatedImages.find(img => img.modelId === modelId);
      
    const modelInfo = getModelInfo(modelId);
    
    // Determine the new state based on current state
    let newDislikedState: LikeState;
    if (image?.liked === false) {
      // If currently disliked, set to none (null)
      newDislikedState = 'none';
    } else {
      // If currently liked or null, set to disliked
      newDislikedState = 'disliked';
    }
    
    setLikingImage(true);
    
    try {
      const response = await chatApi.updateLikeState(imageId.toString(), newDislikedState);
      
      if (response.status) {
        // Update both generatedImages and selectedImage if open
        setGeneratedImages(prev => prev.map(img =>
          img.modelId === modelId ? { 
            ...img, 
            liked: newDislikedState === 'disliked' ? false : null 
          } as GeneratedImage : img
        ));
  
        // Update selectedImage if it's the same image
        if (selectedImage?.modelId === modelId) {
          setSelectedImage(prev => prev ? { 
            ...prev, 
            liked: newDislikedState === 'disliked' ? false : null 
          } : null);
        }
  
        // If we're setting to disliked and hasDislikeFeedback is false, show tooltip
        if (newDislikedState === 'disliked' && !response.hasDislikeFeedback) {
          setActiveImageId(imageId.toString());
          setShowFeedbackTooltip(true);
        }
        
        // Show appropriate toast message
        if (newDislikedState === 'disliked') {
          toast.success(`${modelInfo?.name} image disliked`);
        } else if (newDislikedState === 'none') {
          // toast.success(`${modelInfo?.name} image undisliked`);
        }
        setLikingImage(false);
      } else {
        toast.error('Ooops! something went wrong')
      }
    } catch (error) {
      // console.error('Error updating dislike state:', error);
      setLikingImage(false);
      // toast.error('Ooops! something went wrong')
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.image.input);
    toast.success('Copied');
  };

const handleDownload = async (imageUrl: string, modelName: string) => {
  const loadingToast = toast.loading(`Downloading ${modelName} image`);
  setDownloadingImage(true);

  try {
    // Fetch image data
    // const response = await fetch(imageUrl, { mode: "cors" });
    const response = await fetch("/api/watermark/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, modelName }),
    });
    const blob = await response.blob();

    const filename = imageUrl.split('/').pop() || `Alle-AI-${modelName}-generated-image.png`;

    // Create a link for the blob
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(link.href);

    toast.dismiss(loadingToast);
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error("Failed to download image");
    // console.error("Download error:", error);
  } finally {
    setDownloadingImage(false);
  }
};



  const handleShareClick = (imageUrl: string, modelName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSharingImage({ url: imageUrl, modelName });
    setIsShareDialogOpen(true);
  };

  const getModelInfo = (modelId: string) => {
    const model = imageModels.find(model => model.model_uid === modelId);
    return model ? {
      name: model.model_name,
      icon: model.model_image || '',
      provider: model.model_provider,
      type: model.model_plan
    } : null;
  };

  const handleRetry = async (modelId: string) => {
    if (!conversationId || !promptId) return;

    // Add model to loading state to show skeleton
    setLoadingModels(prev => [...prev, modelId]);
    setErrors(prev => ({ ...prev, [modelId]: '' }));
    setGeneratedImages(prev => prev.filter(img => img.modelId !== modelId));

    try {
      const response = await chatApi.generateResponse({
        conversation: conversationId,
        model: modelId,
        is_new: false,
        prompt: promptId
      });

      if (response.status && response.data) {
        setGeneratedImages(prev => [...prev, {
          modelId: response.data.model_uid,
          // imageUrl: response.data.response,
          imageUrl: `/api/watermark?imageUrl=${encodeURIComponent(response.data.response)}`,
          originalImageUrl: response.data.response,
          liked: null,
          id: response.data.id
        }]);
      } else {
        setErrors(prev => ({
          ...prev,
          [modelId]: response.message || 'Failed to generate image'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [modelId]: 'Failed to generate image'
      }));
    } finally {
      // Remove model from loading state
      setLoadingModels(prev => prev.filter(id => id !== modelId));
    }
  };

  const ImageSkeleton = ({ modelId }: { modelId: string }) => {
    const modelInfo = getModelInfo(modelId);
    // console.log('modelInfo', modelInfo);

    return (
      <div className="relative w-80 h-80 lg:w-96 lg:h-96">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/5 p-2 rounded-lg">
          {modelInfo ? (
            <>
              <Image 
                src={modelInfo.icon ? modelInfo.icon : '/images/images/default.webp'} 
                alt={modelInfo.name} 
                width={32}
                height={32}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-white text-sm font-medium">
                {modelInfo.name}
              </span>
            </>
          ) : (
            <>
              <AntdSkeleton.Avatar active size="small" className="w-6 h-6" />
              <AntdSkeleton.Button active size="small" className="!w-24 !min-w-0" />
            </>
          )}
        </div>

        <AntdSkeleton.Image 
          active={true} 
          className="!w-full !h-full !aspect-square"
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex justify-end gap-3">
            {[1, 2, 3].map((i) => (
              <AntdSkeleton.Button 
                key={`${modelId}-btn-${i}`}
                active 
                size="small" 
                className="!w-9 !h-9 !min-w-0 !rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center p-4">
      
      <div className={`w-full max-w-3xl ${currentGenerationType === 'share' ? 'mb-10' : ''}`}>
        {/* Only show the prompt section when not loading conversation */}
        {((!isLoadingConversation && content.image.input) || currentGenerationType === 'share') && (
          <div className="flex items-start justify-around mb-8">
            <div className="">
              {sharedPrompt.length > 200 ? (
                <PromptDisplay text={sharedPrompt} maxLength={200} />
              ) : (
                <span className="text-base">{sharedPrompt}</span>
              )}
            </div>
            <div className="relative">
              <button
                onClick={handleCopy}
                className="flex items-center px-4 py-2 bg-background hover:bg-backgroundSecondary hover:border-borderColorPrimary text-foreground rounded-md transition-all duration-200"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Show loading state only when loading conversation */}
        {isLoadingConversation && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div> */}
              {/* <p className="text-sm text-muted-foreground">Loading content...</p> */}
              <Loader className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 max-[700px]:grid-cols-1 gap-y-4 lg:gap-x-6 justify-items-center">
          {generationType === 'new' ? (
            // For new generations, use selectedModels filter
            selectedModels.image
              .filter(modelId => !inactiveModels.includes(modelId))
              .map((modelId) => {
                const image = generatedImages.find(img => img.modelId === modelId);
                const isLoading = loadingModels.includes(modelId);
                const error = errors[modelId];
                const modelInfo = getModelInfo(modelId);
                // console.log(selectedModels.image, 'the image selected models');
                // console.log(generationType, 'This is the generation type');
                // console.log(isLoading, 'This is isLoading');
                // console.log(loadingModels, 'This is the loading models');

                if (isLoading) {
                  // console.log('isLoading Images', isLoading);
                  return <ImageSkeleton key={modelId} modelId={modelId} />;
                }

                if (error) {
                  return (
                    <RetryImageGeneration
                      key={modelId}
                      modelInfo={modelInfo!}
                      onRetry={() => handleRetry(modelId)}
                      isRetrying={isLoading}
                    />
                  );
                }

                if (!image || !modelInfo) return null;

                return (
                  <div key={image.id} className="relative group">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/10 p-2 rounded-lg select-none">
                      <Image 
                        src={modelInfo.icon ? modelInfo.icon : '/images/images/default.webp'} 
                        alt={modelInfo.name} 
                        width={32}
                        height={32}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-white text-sm font-medium">
                        {modelInfo.name}
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-lg">
                      <Image 
                        // src={image.imageUrl ? image.imageUrl : '/images/failed_placeholder.webp'}
                        src={plan !== 'free' ? (image.originalImageUrl ? image.originalImageUrl : '/images/failed_placeholder.webp') : (image.imageUrl ? image.imageUrl : '/images/failed_placeholder.webp')}
                        alt={`Generated by ${modelInfo?.name}`}
                        width={400}
                        height={400}
                        className="w-80 h-80 lg:w-96 lg:h-96 rounded-lg transition-transform duration-300 group-hover:scale-105 hover:cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex justify-end gap-2 sm:gap-3">
                          {isAuthenticated && (
                            <>
                              <Button 
                                size="icon0"
                                disabled={likingImage}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(image.modelId, image.id);
                                }}
                                className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                              >
                                  <Heart 
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${image.liked ? 'text-red-500 fill-red-500' : 'text-white'}`}
                                  />
                              </Button>
                              <Button 
                                ref={(el) => dislikeButtonRefs.current[image.id.toString()] = el}
                                size="icon0"
                                disabled={likingImage}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDislike(image.modelId, image.id);
                                }}
                                className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                              >
                                <ThumbsDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white ${image.liked === false ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                            </>
                          )}

                          <Button 
                            size="icon0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image.originalImageUrl, modelInfo?.name || 'generated');
                            }} 
                            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                            disabled={downloadingImage}
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </Button>
                          <Button 
                            size="icon0"
                            onClick={(e) => handleShareClick(image.imageUrl, modelInfo?.name || 'generated', e)}
                            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                          >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            // For loaded conversations, render all images directly
            generatedImages.map((image) => {
              const modelInfo = getModelInfo(image.modelId);
              
              return (
                <div key={image.id} className="relative group">
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 p-2 rounded-lg select-none">
                    <Image 
                      src={modelInfo?.icon ? modelInfo.icon : '/images/images/default.webp'} 
                      alt={modelInfo?.name || ''} 
                      width={32}
                      height={32}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white text-sm font-medium">
                      {modelInfo?.name}
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-lg">
                    <Image 
                      // src={image.imageUrl ? image.imageUrl : '/images/failed_placeholder.webp'}
                        src={plan !== 'free' ? (image.originalImageUrl ? image.originalImageUrl : '/images/failed_placeholder.webp') : (image.imageUrl ? image.imageUrl : '/images/failed_placeholder.webp')}
                      alt={`Generated by ${modelInfo?.name}`}
                      width={400}
                      height={400}
                      className="w-80 h-80 lg:w-96 lg:h-96 rounded-lg transition-transform duration-300 group-hover:scale-105 hover:cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        {isAuthenticated && (
                          <>
                            <Button 
                              size="icon0"
                              disabled={likingImage}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(image.modelId, image.id);
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                            >
                              <Heart 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${image.liked ? 'text-red-500 fill-red-500' : 'text-white'}`}
                              />
                            </Button>
                            <Button 
                              ref={(el) => dislikeButtonRefs.current[image.id.toString()] = el}
                              size="icon0"
                              disabled={likingImage}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDislike(image.modelId, image.id);
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                            >
                              <ThumbsDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white ${image.liked === false ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </>
                        )}

                        <Button 
                          size="icon0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(image.originalImageUrl, modelInfo?.name || 'generated');
                          }} 
                          className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </Button>
                        <Button 
                          size="icon0"
                          onClick={(e) => handleShareClick(image.imageUrl, modelInfo?.name || 'generated', e)}
                          className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                        >
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleModalClose()}>
          <DialogContent 
            className="w-[90vw] h-[90vw] max-w-2xl max-h-[60vh] md:max-w-4xl md:max-h-[90vh] md:w-[80vh] md:h-[80vh] lg:w-[90vh] lg:h-[90vh] p-0 overflow-hidden border-none flex items-center justify-center"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Generated image</DialogTitle>
            </DialogHeader>
            
            {selectedImage && (
              <div className="relative w-full h-full group">
                {/* Image - Ensures it scales correctly */}
                <Image
                  // src={selectedImage.imageUrl ? selectedImage.imageUrl : '/images/images/default.webp'}
                  src={plan !== 'free' ? (selectedImage.originalImageUrl ? selectedImage.originalImageUrl : '/images/images/default.webp') : (selectedImage.imageUrl ? selectedImage.imageUrl : '/images/images/default.webp')}
                  alt={`Generated by ${getModelInfo(selectedImage.modelId)?.name}`}
                  fill
                  className="object-contain"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Top info */}
                  <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-3">
                    <Image 
                      src={getModelInfo(selectedImage.modelId)?.icon || ''}
                      alt={getModelInfo(selectedImage.modelId)?.name || ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-lg text-white">
                        {getModelInfo(selectedImage.modelId)?.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {getModelInfo(selectedImage.modelId)?.provider}
                      </p>
                    </div>
                  </div>

                  {/* Bottom controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-white/90 mb-3 sm:mb-4 max-w-[80%] text-sm sm:text-base">{content.image.input}</p>
                    <div className="flex gap-1">
                      <Button 
                        size="icon0"
                        disabled={likingImage}
                        onClick={() => handleLike(selectedImage.modelId, selectedImage.id)}
                        className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                      >
                        <Heart 
                          className={`w-3 h-3 sm:w-4 sm:h-4 text-white${selectedImage.liked ? 'text-red-500 fill-red-500' : ''}`}
                        />
                      </Button>
                      <Button 
                        ref={(el) => dislikeButtonRefs.current[selectedImage.id.toString()] = el}
                        size="icon0"
                        disabled={likingImage}
                        onClick={() => handleDislike(selectedImage.modelId, selectedImage.id)}
                        className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                      >
                        <ThumbsDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white ${selectedImage.liked === false ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button 
                        size="icon0"
                        onClick={() => handleDownload(selectedImage.originalImageUrl, getModelInfo(selectedImage.modelId)?.name || 'generated')}
                        className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                      >
                        {downloadingImage ? (
                          <Loader className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                        ) : (
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        )}
                      </Button>
                      <Button 
                        size="icon0"
                        onClick={() => handleShareClick(selectedImage.originalImageUrl, getModelInfo(selectedImage.modelId)?.name || 'generated')}
                        className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none"
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
            {/* Marquee banner for shared conversations */}
      {/* {currentGenerationType === 'share' && (
        <div className="fixed bottom-0 sm:bottom-10 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-8 text-white font-medium text-sm">
              ✨ These images were generated on Alle-AI — Compare multiple AI models in one place!
            </span>
            <span className="mx-8 text-white font-medium text-sm">
              🚀 Sign up now to generate images with DALL-E, Midjourney, Stable Diffusion & more simultaneously!
            </span>
            <span className="mx-8 text-white font-medium text-sm">
              ⚡ Join Alle-AI — The smartest way to use AI
            </span>
            <span className="mx-8 text-white font-medium text-sm">
              ✨ These images were generated on Alle-AI — Compare multiple AI models in one place!
            </span>
            <span className="mx-8 text-white font-medium text-sm">
              🚀 Sign up now to generate images with DALL-E, Midjourney, Stable Diffusion & more simultaneously!
            </span>
            <span className="mx-8 text-white font-medium text-sm">
              ⚡ Join Alle-AI — The smartest way to use AI
            </span>
          </div>
        </div>
      )} */}

      {sharingImage && (
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false);
            setSharingImage(null);
          }}
          imageUrl={sharingImage.url}
          modelName={sharingImage.modelName}
          showPreview={true}
        />
      )}

      <PromptModal 
        isOpen={showPrompt} 
        onClose={() => {
          setTempSelectedModels(previousSelectedModels);
          saveSelectedModels('image');
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
    {activeImageId && (
      <FeedbackTooltip
        responseId={activeImageId}
        isOpen={showFeedbackTooltip}
        onClose={() => {
          setShowFeedbackTooltip(false);
          setActiveImageId(null);
        }}
        triggerRef={{ current: dislikeButtonRefs.current[activeImageId] }}
        onFeedbackSubmitted={() => {
          // Feedback was submitted successfully
        }}
        onDislikeStateChange={(responseId, state, hasDislikeFeedback) => {
          // Update the image state if needed
          const imageId = parseInt(responseId);
          setGeneratedImages(prev => prev.map(img =>
            img.id === imageId ? { ...img, liked: state === 'disliked' ? false : null } : img
          ));
          
          // Update selectedImage if it's the same image
          if (selectedImage?.id === imageId) {
            setSelectedImage(prev => prev ? { ...prev, liked: state === 'disliked' ? false : null } : null);
          }
        }}
      />
    )}

    </div>
  );
};

export default ImageArea;