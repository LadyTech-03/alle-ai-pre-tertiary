import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Components
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlleAILoader } from "@/components/features/AlleAILoader";
import { PlansModal, PromptModal } from "@/components/ui/modals";

// stores
import { useModelsStore } from '@/stores/models';
import { useSidebarStore, useSelectedModelsStore, useAuthStore} from "@/stores";
import { useAudioTabStore } from "@/stores/audioTabStore";
import { useAudioCategorySelectionStore } from "@/stores/audioCategorySelectionStore";

// APIs
import { modelsApi, Model } from '@/lib/api/models';

// Icons
import { CheckCircle2, Gem, Heart, Loader, Search, X } from "lucide-react";
import { FaMicrophone } from "react-icons/fa";
import { BiSolidFileBlank } from "react-icons/bi";
import { FaImage } from "react-icons/fa";
import { TiVideo } from "react-icons/ti";

// Overflow Marquee Component - auto-scrolls text that overflows its container
const OverflowMarquee = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && textRef.current) {
      const isTextOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow, text]);

  return (
    <div 
      ref={containerRef} 
      className={cn("overflow-hidden", className)}
    >
      <span 
        ref={textRef}
        className={cn(
          "inline-block whitespace-nowrap",
          isOverflowing && "animate-marquee"
        )}
        style={isOverflowing ? {
          paddingRight: '1rem',
        } : undefined}
      >
        {text}
        {isOverflowing && <span className="pl-8">{text}</span>}
      </span>
    </div>
  );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// type UserPlan = 'free' | 'standard' | 'plus';
type UserPlan = 'free' | 'standard' | 'plus' | 'custom' | 'pro';


export function ModelSelectionModal({ isOpen, onClose }: ModalProps) {
    const currentPage = useSidebarStore((state) => state.currentPage);
    const { selectedModels, tempSelectedModels, setTempSelectedModels, saveSelectedModels, getSelectedModelNames } = useSelectedModelsStore();
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null); // Track which model is being favorited
    const pathname = usePathname();
  
    const [plansModalOpen, setPlansModalOpen] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [showLessModelPrompt, setShowLessModelPrompt] = useState(false);
    const [promptConfig, setPromptConfig] = useState<any>(null);
    const { activeTab, setActiveTab } = useAudioTabStore();
    const { setCategoryModel } = useAudioCategorySelectionStore();
  
    
    // Store models for each audio tab separately
    const [ttsModels, setTtsModels] = useState<string[]>([]);
    const [sttModels, setSttModels] = useState<string[]>([]);
    const [agModels, setAgModels] = useState<string[]>([]);
    
    // const userPlan = useAuthStore((state) => state.plan) as UserPlan;
    const rawUserPlan = useAuthStore((state) => state.plan) as string;
  
    // Create a function to parse plan and check permissions
    const getPlanPermissions = useMemo(() => {
      // Default permissions
      const permissions = {
        baseUserPlan: 'free' as UserPlan,
        contentTypes: {
          chat: false,
          image: false,
          audio: false,
          video: false
        }
      };
      
      if (!rawUserPlan) return permissions;
      
      const planParts = rawUserPlan.split('_');
      
      // Set base user plan (first part of the plan name)
      permissions.baseUserPlan = planParts[0] as UserPlan;
  
        // For non-custom plans, we don't need to check content types
        if (permissions.baseUserPlan !== 'custom' && permissions.baseUserPlan !== 'pro') {
          return permissions;
        }
          
        // For custom plans, check which content types are included
        // Special case for unlimited
        if (rawUserPlan === 'custom_unlimited' || 
          rawUserPlan.includes('custom_chat_image_audio_video')) {
        permissions.contentTypes = {
          chat: true,
          image: true,
          audio: true,
          video: true
        };
      } else {
        // Check for specific content types
        permissions.contentTypes.chat = planParts.includes('chat');
        permissions.contentTypes.image = planParts.includes('image');
        permissions.contentTypes.audio = planParts.includes('audio');
        permissions.contentTypes.video = planParts.includes('video');
      }
  
      return permissions;
      }, [rawUserPlan]);
  
      const userPlan = getPlanPermissions.baseUserPlan;
  
    const { 
      chatModels, 
      imageModels, 
      audioModels, 
      videoModels,
      isLoading,
      error,
      setChatModels,
      setImageModels,
      setAudioModels,
      setVideoModels,
    } = useModelsStore();
  
    // Plan limits
    const MODEL_LIMITS: Record<UserPlan, number> = {
      free: 2,
      standard: 3,
      plus: 5,
      custom: 5,
      pro: 5,
    };
  
    const handleFavoriteToggle = async (e: React.MouseEvent, model: Model) => {
      e.stopPropagation(); // Prevent model selection when clicking favorite
      setFavoriteLoading(model.model_uid); // Set loading state for this model
  
      try {
        await modelsApi.toggleFavorite(model.model_uid, !model.favorite);
        
        // Update the models in the store with the new favorite state
        const updateModels = (models: Model[]) => 
          models.map(m => 
            m.model_uid === model.model_uid 
              ? { ...m, favorite: !m.favorite }
              : m
          );
  
        switch (currentPage) {
          case "chat":
            setChatModels(updateModels(chatModels));
            break;
          case "image":
            setImageModels(updateModels(imageModels));
            break;
          case "audio":
            setAudioModels(updateModels(audioModels));
            break;
          case "video":
            setVideoModels(updateModels(videoModels));
            break;
        }
      } catch (error) {
        // console.error('Failed to toggle favorite:', error);
        // toast.error('Failed to favorite model');
      } finally {
        setFavoriteLoading(null); // Clear loading state
      }
    };
  
    const checkModelSelectionRestrictions = (modelId: string) => {
      const model = getModelsForPage().find(m => m.model_uid === modelId);
      const currentContentType = currentPage as keyof typeof getPlanPermissions.contentTypes;
      
      // For custom plans, check if the current content type is included
      // If included, use 'plus' permissions, otherwise use 'free' permissions
      const effectiveUserPlan = 
        userPlan === 'custom' || userPlan === 'pro'
          ? (getPlanPermissions.contentTypes[currentContentType] ? 'plus' : 'free')
          : userPlan;
      
      // Check for premium model restriction
      if ((model?.model_plan === 'standard' && effectiveUserPlan === 'free') || 
          (model?.model_plan === 'plus' && (effectiveUserPlan === 'free' || effectiveUserPlan === 'standard'))) {
        
        // Determine the required plan based on the model's plan
        const requiredPlan = model?.model_plan === 'standard' ? 'Standard' : 'Plus';
        
        setPromptConfig({
          title: `${requiredPlan} Model`,
          message: `Upgrade Plan to use this model`,
          type: `${requiredPlan.toLowerCase() === 'standard' ? 'standard' : 'plus'}`,
          metadata: {
            plan: requiredPlan,
            models: [model.model_name],
          },
          actions: [
            {
              label: "OK",
              onClick: () => setShowPromptModal(false),
              variant: "outline"
            },
            {
              label: "Upgrade Plan",
              onClick: () => {
                setPlansModalOpen(true);
                setShowPromptModal(false);
              },
              variant: "premium",
              icon: <Gem className="h-4 w-4" />
            }
          ]
        });
        setShowPromptModal(true);
        return false;
      }
    
      // Check for model count limit
      const newCount = tempSelectedModels.includes(modelId) 
        ? tempSelectedModels.length - 1 
        : tempSelectedModels.length + 1;
      
      if (newCount > MODEL_LIMITS[effectiveUserPlan]) {
        const planUpgrade = effectiveUserPlan === 'free' ? 'Standard' : 'Plus';
        
        setPromptConfig({
          title: "Model Limit Reached",
          message: (
            <>
              Your current plan allows up to{' '}
              <span className="font-bold text-foreground">{MODEL_LIMITS[effectiveUserPlan]} models</span> per conversation
              {effectiveUserPlan !== 'plus' ? (
                <>
                  . Upgrade to{' '}
                  {effectiveUserPlan === 'free' ? 'Standard or Plus' : 'Plus'} to use more models.
                </>
              ) : (
                '.'
              )}
            </>
          ),
          type: "warning",
          metadata: {
            link: {
              url: '/faq/3742473-others/model-limits',
              text: 'Learn more'
            },
            plan: planUpgrade,
            models: [
              ...tempSelectedModels.map(id => {
                const model = getModelsForPage().find(m => m.model_uid === id);
                return model?.model_name || id;
              }),
              model?.model_name || modelId
            ],
          },
          actions: [
            {
              label: "OK",
              onClick: () => setShowPromptModal(false),
              variant: "outline"
            },
            ...(effectiveUserPlan !== 'plus' ? [
              {
                label: `Upgrade Plan`,
                onClick: () => {
                  setPlansModalOpen(true);
                  setShowPromptModal(false);
                },
                variant: "premium",
                icon: <Gem className="h-4 w-4" />
              }
            ] : [])
          ]
        });
        
        setShowPromptModal(true);
        return false;
      }
    
      return true;
    };
  
    // Initialize tab models when modal opens
    useEffect(() => {
      if (isOpen && currentPage === "audio") {
        // Filter models by category
        const tts = audioModels
          .filter(model => model.model_category === 'tts')
          .map(model => model.model_uid)
          .filter(uid => selectedModels.audio.includes(uid));
        
        const stt = audioModels
          .filter(model => model.model_category === 'stt')
          .map(model => model.model_uid)
          .filter(uid => selectedModels.audio.includes(uid));
        
        const ag = audioModels
          .filter(model => model.model_category === 'ag')
          .map(model => model.model_uid)
          .filter(uid => selectedModels.audio.includes(uid));
        
        setTtsModels(tts);
        setSttModels(stt);
        setAgModels(ag);
        
        // Set temp models based on active tab
        if (activeTab === 'tts') setTempSelectedModels(tts);
        else if (activeTab === 'stt') setTempSelectedModels(stt);
        else if (activeTab === 'ag') setTempSelectedModels(ag);
      } else if (isOpen) {
        // For non-audio pages, just use the regular selection
        setTempSelectedModels(selectedModels[currentPage as keyof typeof selectedModels] || []);
      }
    }, [isOpen, currentPage, activeTab, selectedModels]);
  
    useEffect(() => {
      // console.log('The current page is', currentPage);
      setSearchQuery("");
      setFilterType("all");
    }, [currentPage]);
  
    // Update the tab-specific model arrays when tempSelectedModels changes
    useEffect(() => {
      if (currentPage === "audio") {
        if (activeTab === 'tts') {
          setTtsModels(tempSelectedModels);
        } else if (activeTab === 'stt') {
          setSttModels(tempSelectedModels);
        } else if (activeTab === 'ag') {
          setAgModels(tempSelectedModels);
        }
      }
    }, [tempSelectedModels, currentPage, activeTab]);
  
    const handleSave = () => {
  
      if (tempSelectedModels.length < 1) {
        setShowLessModelPrompt(true);
        return;
      }
      if (currentPage === "audio") {
        // Assume only one model can be selected at a time for each category
        const selectedModelId = tempSelectedModels[0];
        const model = audioModels.find(m => m.model_uid === selectedModelId);
        if (
          model &&
          model.model_category &&
          ['tts', 'stt', 'ag'].includes(model.model_category)
        ) {
          setCategoryModel(model.model_category as 'tts' | 'stt' | 'ag', selectedModelId);
        }
        saveSelectedModels('audio');
      } else {
        saveSelectedModels(currentPage as 'chat' | 'image' | 'audio' | 'video');
      }
      onClose();
    };
  
    const toggleModelSelection = (modelId: string) => {
  
      // Special handling for audio models - only one can be selected at a time
      if (currentPage === "audio") {
        if (tempSelectedModels.includes(modelId)) {
          // If clicking on the already selected model, deselect it
          const updatedModels = tempSelectedModels.filter(id => id !== modelId);
          setTempSelectedModels(updatedModels);
          return;
        } else {
          // Replace the current selection with the new model
          if (checkModelSelectionRestrictions(modelId)) {
            setTempSelectedModels([modelId]);
          }
          return;
        }
      }
  
      if (checkModelSelectionRestrictions(modelId)) {
        setTempSelectedModels(
          tempSelectedModels.includes(modelId)
            ? tempSelectedModels.filter(id => id !== modelId)
            : [...tempSelectedModels, modelId]
        );
      }
    };
  
    const getModelsForPage = () => {
      switch (currentPage) {
        case "chat":
          return chatModels || [];
        case "image":
          return imageModels || [];
        case "audio":
          return audioModels || [];
        case "video":
          return videoModels || [];
        default:
          return [];
      }
    };
  
    // Filter models based on current audio tab when on audio page
    const filteredAudioModels = useMemo(() => {
      if (currentPage !== "audio") return [];
      
      return (audioModels || []).filter(model => 
        model.model_category === activeTab
      );
    }, [audioModels, activeTab, currentPage]);
  
    const models = getModelsForPage();
  
    const filterOptions = [
      {
        value: "all",
        label: "All models",
      },
      {
        value: "free",
        label: "Free",
      },
      {
        value: "standard",
        label: "Standard",
        icon: '/icons/silver-alle-ai.webp'
      },
      {
        value: "plus",
        label: "Plus",
        icon: '/icons/gold-alle-ai.webp'
      },
      {
        value: "favorite",
        label: "My favorite",
      },
    ];
  
    // Filter and search models
    const filteredModels = useMemo(() => {
      if (!models) return [];
  
      // When on audio page, filter by the active tab
      let modelsToFilter = currentPage === "audio" 
        ? filteredAudioModels
        : models;
      
      return modelsToFilter.filter((model) => {
        const matchesSearch =
          model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.model_provider?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
          filterType === "all" || 
          (filterType === "favorite" ? model.favorite : model.model_plan === filterType);
        
        return matchesSearch && matchesFilter;
      });
    }, [models, filteredAudioModels, searchQuery, filterType, currentPage]);
  
    const getModelTypeText = () => {
      switch (currentPage) {
        case "chat":
          return "Select at least 2 Chat Models";
        case "image":
          return "Select at least 1 Image Model";
        case "audio":
          if (activeTab === "tts") return "Select only 1 Text-to-Speech Model";
          if (activeTab === "stt") return "Select only 1 Speech-to-Text Model";
          if (activeTab === "ag") return "Select only 1 Audio Generation Model";
          return "Select only 1 Audio Model";
        case "video":
          return "Select at least 1 Video Model";
        default:
          return "Select Models";
      }
    };
  
    const isSelectionValid = () => {
      switch (currentPage) {
        case "chat":
          return tempSelectedModels.length >= 2;
        case "image":
        case "video":
          return tempSelectedModels.length >= 1;
        case "audio":
          return tempSelectedModels.length === 1;
        default:
          return true;
      }
    };
  
    const getRequiredInfo = (pathname: string): string => {
      switch (true) {
        case pathname.startsWith('/chat'):
          return 'at least 2 models';
        case pathname.startsWith('/image'):
        case pathname.startsWith('/video'):
          return 'at least 1 model';
        case pathname.startsWith('/audio'):
          return '1 model';
        default:
          return 'at least 2 models';
      }
    };
  
    const handleRemoveAll = () => {
      setTempSelectedModels([]);
    };
  
    const pageLabels = {
      image: "Image",
      audio: "Audio",
      video: "Video",
    };
    
    const label = pageLabels[currentPage as keyof typeof pageLabels] || "Chat";
  
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl rounded-md p-2 sm:p-6" id="tooltip-select-menu">
            <DialogHeader className="space-y-4 relative text-start">
              <DialogTitle className="">Model Selection</DialogTitle>
  
              {/* Selected Models */}
              <div className="space-y-2">
                {tempSelectedModels.length > 0 && (
                  <>
                    <label className="text-xs xs:text-sm font-medium">Selected {label} Model(s)</label>
                    <div className="flex flex-wrap gap-2">
                      {tempSelectedModels.map((modelId) => {
                        const model = models.find((m) => m.model_uid === modelId);
                        return (
                          <Badge
                            variant="outline"
                            key={modelId}
                            className={`${model?.model_plan === 'standard' ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' : model?.model_plan === 'plus' ? 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90' : ''  } 
                              px-2 py-1 flex items-center gap-1 border-borderColorPrimary rounded-md cursor-pointer hover:bg-hoverColorPrimary text-accent-foreground`}
                            
                          >
                            <Image
                              src={model?.model_image ?? ''}
                              alt={model?.model_image ?? ''}
                              width={14}
                              height={14}
                              className="rounded-full"
                            />
                            <span>{model?.model_name}</span>
                            {/* {model?.model_plan === 'standard' ? (
                              <Image
                              src={'/svgs/logo-desktop-mini.webp'}
                                height={10}
                                width={10}
                                alt="silver-alle-ai"
                                className="bg-gradient-to-r from-gray-300/90 to-gray-400/90 rounded-sm"
                              />
                            ): model?.model_plan === 'plus' ? (
                              <Image
                              src={'/icons/gold-alle-ai.webp'}
                                height={10}
                                width={10}
                                alt="gold-alle-ai"
                              />
                            ): ''} */}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-700"
                              onClick={() => toggleModelSelection(modelId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
  
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between">
                <div className="text-xs xs:text-sm font-medium inline-flex items-center gap-2">
                  {isSelectionValid() && (
                      <CheckCircle2 className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
                  )}
                  {getModelTypeText()}
                </div>
                <div className="flex flex-row-reverse sm:flex-row items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models"
                      className="h-8 xs:h-10 pl-8 w-[200px] focus-visible:outline-none focus:border-borderColorPrimary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all" onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 xs:h-10 w-[140px] border-borderColorSecondary">
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent className="bg-backgroundSecondary">
                      {filterOptions.map((option) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={option.value}
                          value={option.value}
                        >
                          <div className="flex items-center justify-between w-full">
                            {option.label}
                            {(option.value === 'standard' || option.value === 'plus') && (
                              <div className={`inline-flex items-center ml-1
                                ${option.value === 'standard' 
                                  ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90' 
                                  : 'bg-gradient-to-r from-yellow-500/90 to-yellow-600/90'} 
                                rounded-sm p-0.5`}>
                                <Image
                                  src={'/svgs/logo-desktop-mini.webp'}
                                  height={10}
                                  width={10}
                                  alt={`${option.value}-alle-ai`}
                                />
                              </div>
                            )}
                            {option.value === 'favorite' && (<Heart className ='ml-1 w-4 fill-red-500 text-red-500'/>)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <kbd className="absolute right-4 -top-[1.6rem] pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">esc</span>
              </kbd>
            </DialogHeader>
  
            {/* Audio Tabs - Only show for audio page using shadcn Tabs */}
            {currentPage === "audio" && (
              <Tabs value={activeTab} onValueChange={(value) => {
                // Update the selectedModels.audio with the current tab's models first
                const tabModels = activeTab === 'tts' ? ttsModels : 
                                   activeTab === 'stt' ? sttModels : 
                                   agModels;
                
                // Save the current tab's models
                if (activeTab === 'tts') {
                  setTtsModels(tempSelectedModels);
                } else if (activeTab === 'stt') {
                  setSttModels(tempSelectedModels);
                } else if (activeTab === 'ag') {
                  setAgModels(tempSelectedModels);
                }
                
                // Switch to new tab
                setActiveTab(value as 'tts' | 'stt' | 'ag');
                
                // Set the tempSelectedModels to the models for the new tab
                if (value === 'tts') {
                  setTempSelectedModels(ttsModels);
                } else if (value === 'stt') {
                  setTempSelectedModels(sttModels);
                } else if (value === 'ag') {
                  setTempSelectedModels(agModels);
                }
              }} className="w-full mb-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="tts">Text-to-Speech</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="stt">Speech-to-Text</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-tabBackgroundColor" value="ag">Audio Generation</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
  
            {/* Model Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <AlleAILoader size="sm" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                {error}
              </div>
            ) : models.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No models available
              </div>
            ) : (
              <ScrollArea className="h-[20rem] xs:pr-4 overflow-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 xs:gap-3 mt-4 overflow-hidden">
                  {filteredModels.map((model) => (
                    <div
                      key={model.model_uid}
                      onClick={() => toggleModelSelection(model.model_uid)}
                      title={`${model.model_name}`}
                      className={cn(
                        "group relative flex items-center gap-1 xs:gap-3 p-1 xs:p-4 h-14 xs:h-16 border border-borderColorPrimary rounded-lg cursor-pointer hover:bg-accent/50 transition-colors select-none",
                        tempSelectedModels.includes(model.model_uid) &&
                          "border-primary bg-accent"
                      )}
                    >
                      {/* Capability icons based on valid_inputs */}
                      <div className="pointer-events-none absolute bottom-1 left-4 flex items-center gap-1 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                        {((model as any).valid_inputs as string[] | undefined)?.includes("text") && currentPage !== "chat" && (
                          <BiSolidFileBlank className="h-2.5 w-2.5" />
                        )}
                        {((model as any).valid_inputs as string[] | undefined)?.includes("image") && (
                          <FaImage className="h-2.5 w-2.5" />
                        )}
                        {((model as any).valid_inputs as string[] | undefined)?.includes("audio") && (
                          <FaMicrophone className="h-2.5 w-2.5" />
                        )}
                        {((model as any).valid_inputs as string[] | undefined)?.includes("video") && (
                          <TiVideo className="h-2.5 w-2.5" />
                        )}
                      </div>
                      {model.model_plan === 'standard' ? (
                        <div className="absolute top-0 right-0">
                          <div className="relative flex items-center gap-1 bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-[10px] font-medium text-white px-1.5 py-0.5 rounded-tr-md rounded-bl-lg">
                            {/* <Gem className="h-2.5 w-2.5" /> */}
                            <Image
                              src={'/svgs/logo-desktop-mini.webp'}
                              height={10}
                              width={10}
                              alt="gold-alle-ai"
                            />
                          </div>
                        </div>
                      ): model.model_plan === 'plus' ? (
                        <div className="absolute top-0 right-0">
                          <div className="relative flex items-center gap-1 bg-gradient-to-r from-yellow-500/90 to-yellow-600/90 text-[10px] font-medium text-white pl-2 pr-2 py-0.5 rounded-tr-md rounded-bl-lg">
                            {/* <Gem className="h-2.5 w-2.5" /> */}
                            <Image
                              src={'/svgs/logo-desktop-mini.webp'}
                              height={10}
                              width={10}
                              alt="gold-alle-ai"
                            />
                          </div>
                        </div>
                      ): ''}
                      <Image
                        src={model.model_image}
                        height={8}
                        width={8}
                        alt={model.model_name}
                        className="w-8 h-8 rounded-md mb-1"
                        priority
                      />
                      <div className="overflow-hidden scrollbar-none mb-1 flex-1 min-w-0">
                        <OverflowMarquee 
                          text={model.model_name} 
                          className="font-small text-[11px] xs:text-xs"
                        />
                        <p className="text-xs flex items-center gap-1 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                          {model.model_provider}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleFavoriteToggle(e, model)}
                        className={cn(
                          "absolute bottom-1 right-1 p-1 rounded-full hover:bg-accent/50",
                          model.favorite ? "text-red-500" : "text-gray-400"
                        )}
                        disabled={favoriteLoading === model.model_uid}
                      >
                        {favoriteLoading === model.model_uid ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : (
                          <Heart
                            className={cn(
                              "h-3 w-3",
                              model.favorite && "fill-current"
                            )}
                          />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
  
            {/* Footer: legend + buttons */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="hidden sm:inline text-muted-foreground/80">Supported file types:</span>
                {currentPage !== "chat" && (
                  <div className="flex items-center gap-1">
                    <BiSolidFileBlank  className="h-2.5 w-2.5" />
                    <span>Text file formats</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FaImage className="h-2.5 w-2.5" />
                  <span>Images</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaMicrophone className="h-2.5 w-2.5" />
                  <span>Audios</span>
                </div>
                <div className="flex items-center gap-1">
                  <TiVideo className="h-2.5 w-2.5" />
                  <span>Videos</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleRemoveAll}
                className="hover:text-red-600"
              >
                Remove all
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isSelectionValid()}
                className={!isSelectionValid() ? "opacity-50" : ""}
              >
                Save
              </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
        />
        {promptConfig && (
          <PromptModal
            isOpen={showPromptModal}
            onClose={() => setShowPromptModal(false)}
            {...promptConfig}
          />
        )}
  
        <PromptModal
          isOpen={showLessModelPrompt}
          onClose={() => setShowLessModelPrompt(false)}
          title=""
          message={<>Please select<span className="font-bold text-foreground">${getRequiredInfo(pathname)}</span> to start a conversation</>}
          metadata={{
            link: {
              text: "Learn why",
              url: "/faq/3742473-others/models-selection"
            }
          }}
          actions={[
            {
              label: "Close",
              onClick: () => setShowLessModelPrompt(false),
              variant: "outline"
            },
            {
              label: "Select Models",
              onClick: () => {
                setShowLessModelPrompt(false);
              },
              variant: "default"
            }
          ]}
        />
      </>
    );
  }