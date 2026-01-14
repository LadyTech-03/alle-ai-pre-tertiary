"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { ArrowUp, Paperclip, Globe , X, Layers, FileText, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner"

import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { MicButton } from "@/components/ui/MicButton";
import { FileUploadButton } from "@/components/ui/file-upload-button";
import { UploadedFile } from "@/lib/types";
import { ALLOWED_FILE_TYPES, validateFile } from "@/lib/utils";
import { FilePreview } from "../ui/file-preview";
import { processFile } from '@/lib/fileProcessing';
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FooterText } from "../FooterText";
import { useSelectedModelsStore, useWebSearchStore, useCombinedModeStore, useCompareModeStore, usePendingChatStateStore, useProjectStore, useContentStore } from "@/stores";
import { PromptModal } from "@/components/ui/modals";
import { ModelSelectionModal } from "@/components/ui/modals/model-selection-modal";
import { ContentLengthWarning } from "../ui/content-length-warning";
import { useModelsStore } from "@/stores/models";


import { useSettingsStore } from "@/stores";
import { useAuthStore } from "@/stores";
import { PlansModal } from "@/components/ui/modals";
import { AuthRequiredModal } from "@/components/ui/modals/auth-required-modal";
import { chatApi } from "@/lib/api/chat";
import { useTheme } from "next-themes";

import { sendGAEvent } from '@next/third-parties/google'
import { LatencyWarning } from "../ui/latency-warning";
import { RestrictionWarning } from "../ui/restriction-warning";
import { useUsageRestrictionsStore } from "@/stores";
import { ToastDemo } from "../ui/toast-demo";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (fileContent?: {
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: string;
    }>;
  }, fileUUIDs?: string[]) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  isLoading: boolean;
  isSending?: boolean;
  isWeb?: boolean;
  isCombined?: boolean;
  onWebSearchToggle?: (enabled: boolean) => void;
  onCombinedToggle?: (enabled: boolean) => void;
  disableCombined?: boolean;
  otherSytles?: string;
  dynamicPrompts?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  inputRef,
  isLoading,
  isSending,
  isWeb,
  isCombined,
  onWebSearchToggle,
  onCombinedToggle,
  disableCombined,
  dynamicPrompts,
  otherSytles
}: ChatInputProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { isWebSearch, setIsWebSearch } = useWebSearchStore();
  const { isCombinedMode, setIsCombinedMode } = useCombinedModeStore();
  const { isCompareMode, setIsCompareMode } = useCompareModeStore();
  const { selectedModels, inactiveModels, isLoadingLatest } = useSelectedModelsStore();
  const [showModelPrompt, setShowModelPrompt] = useState(false);
  const { chatModels, setChatModels, setLoading: setModelsLoading, setError: setModelsError } = useModelsStore();
  const [modelSelectionModalOpen, setModelSelectionModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<{
    uploaded_files: Array<{
      file_name: string;
      file_size: string;
      file_type: string;
      file_content: any;
    }>;
  } | null>(null);
  const [fileUUIDs, setFileUUIDs] = useState<string[]>([]);
  const [showCombinedPrompt, setShowCombinedPrompt] = useState(false);
  const [contentPercentage, setContentPercentage] = useState<number>(0);
  const [incompatibleModels, setIncompatibleModels] = useState<string[]>([]);
  const [incompatibleModelNames, setIncompatibleModelNames] = useState<string[]>([]);

  

  const pathname = usePathname();

  const { isListening, toggleListening } = useSpeechRecognition({
    onTranscript: onChange,
    inputRef
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CONTENT_LENGTH = 27000;

  // Add this constant at the beginning of the ChatInput component
  const CHAT_ALLOWED_FILE_TYPES = Object.fromEntries(
    Object.entries(ALLOWED_FILE_TYPES).filter(([type]) => 
      !type.startsWith('audio/') && type !== 'video/mp4'
    )
  ) as typeof ALLOWED_FILE_TYPES;

  // Helper function to detect audio files
  const isAudioFile = (file: File): boolean => {
    return file.type.startsWith('audio/') || 
           /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
  };

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/') || 
           /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
  };

  const { personalization, setPersonalizationSetting } = useSettingsStore();
  const { plan, user, isAuthenticated } = useAuthStore();
  const { setPending, pending, clearPending } = usePendingChatStateStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const isFreeUser = plan === 'free' || !plan;
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<any>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const getRandomDelay = () => Math.random() * 8;

  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { currentProject } = useProjectStore();
  const { setContent } = useContentStore();

  const [showLatencyWarning, setShowLatencyWarning] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'combine' | 'compare' | null>(null);
  const { restrictions, isRestricted } = useUsageRestrictionsStore();
  const [placeholder, setPlaceholder] = useState('');
  const [isUploading, setIsUploading] = useState(false)

  // Dynamic placeholders based on current path
  const getPlaceholders = () => {
    if (pathname.includes('/another-image')) {
      return [
        "Describe the image you want to generate",
        "Generate beautiful artwork",
        "Design a logo for a coffee brand",
        "Futuristic city at sunset",
        "Cozy cabin in the woods",
        "Surreal desert landscape",
        "Cyberpunk street at night",
        "Dreamy underwater world",
        "Castle floating in the clouds",
        "Colorful galaxy swirl",
        "Minimalist mountain art",
        "Retro neon diner",
        "Fantasy dragon in flight",
        "Mystical forest with fog",
        "Sunrise over snowy peaks",
        "Whimsical treehouse village",
        "Golden hour beach waves",
        "Steampunk airship",
        "Lush jungle waterfall",
        "Otherworldly alien planet",
        "Abstract shapes and colors",
        "Glowing crystal cave",
        "Peaceful Zen garden",
        "Stormy sea with lighthouse",
        "Retro-futuristic skyline",
        "Fantasy warrior portrait",
        "Gothic cathedral at night",
        "Cute cartoon animals",
        "Otherworldly desert oasis",
        "Aurora lights over mountains",
        "Cybernetic samurai",
        "Tropical island paradise",
        "Neon lights in the rain",
        "Abstract fractal art",
        "Ancient ruins in the jungle",
        "Otherworldly floating islands",
        "Wild west desert town",
        "Glowing mushrooms forest",
        "Futuristic sports car",
        "Space station orbiting Earth",
        "Fantasy castle on a cliff",
        "Abstract watercolor splash",
        "Snowy village at Christmas",
        "Magical glowing butterfly",
        "Retro 80s synthwave scene",
        "Fantasy tavern interior",
        "Lost city under the ocean",
        "Alien desert with twin suns",
        "Minimalist Japanese garden",
        "Mythical phoenix rising",
        "Futuristic robot design",
        "Autumn leaves in the wind",
        "Majestic lion portrait",
        "Colorful hot air balloons",
        "Cozy library with candles",
        "Celestial moon goddess",
        "Cottage by a lake",
        "Cosmic nebula explosion",
        "Ancient stone temple",
        "Surreal melting clock",
        "Retro arcade vibes",
        "Deep space black hole",
        "Mystical mermaid lagoon",
        "Glowing cybernetic city",
        "Peaceful rice terraces",
        "Futuristic flying taxi",
        "Mythical underwater dragon",
        "Whimsical candy land",
        "Aurora over icy mountains",
        "Fantasy knight in armor",
        "Alien jungle with bioluminescence",
        "Desert caravan at dusk",
        "Retro sci-fi poster art",
        "Dreamlike mirror lake",
        "Haunted Victorian mansion",
        "Abstract 3D geometric art",
        "Medieval marketplace scene",
        "Robot exploring Mars",
        "Enchanted forest portal",
        "Celestial constellation art",
        "Minimalist desert dunes",
        "Glowing neon jungle",
        "Otherworldly crystal tower",
        "Giant whale in the sky",
        "Peaceful meadow sunrise",
        "Cyberpunk hacker room",
        "Magical floating lanterns",
        "Surreal staircase to the stars",
        "Ancient samurai battle",
        "Storm over New York",
        "Tropical reef with fish",
        "Retro VHS glitch art",
        "Fantasy ice queen throne",
        "Astronaut walking on Saturn",
        "Mystical desert temple",
        "Underwater city of glass",
        "Celestial eclipse scene",
        "Colorful graffiti wall",
        "Peaceful farmhouse at dawn",
        "Retro flying car highway",
        "Surreal dreamscape painting",
        "Volcanic eruption at night",
        "Magical library of stars",
        "Fantasy elf archer"
      ];
    } else {
      return [
        "Message multiple models at once",
        "Explain how transformers work in simple terms.",
        "Write a poem about humanity and technology.",
        "Write a haiku about the ocean.",
        "Explain quantum physics like I'm 5.",
        "Summarize today's top news.",
        "What's the capital of Brazil?",
        "Generate a random business idea.",
        "Draft a polite resignation letter.",
        "Tell me a joke about programmers.",
        "Translate 'good morning' into French.",
        "How does blockchain work?",
        "Suggest three healthy dinner recipes.",
        "Write a motivational quote.",
        "Create a study plan for exams.",
        "Who invented the telephone?",
        "What is machine learning?",
        "Give me 5 startup name ideas.",
        "Explain photosynthesis simply.",
        "How to stay productive at home?",
        "Summarize the book '1984'.",
        "Write a poem about technology.",
        "What is the fastest animal?",
        "Generate a tagline for a coffee shop.",
        "Explain relativity in simple terms.",
        "Draft a professional email.",
        "What's the difference between AI and ML?",
        "Tell me a bedtime story.",
        "How do airplanes fly?",
        "Give me 10 random trivia facts.",
        "Suggest morning routines for energy.",
        "Explain black holes simply.",
        "Write a short love poem.",
        "What is cloud computing?",
        "Suggest marketing ideas for a bakery.",
        "Give me synonyms for 'happy'.",
        "Explain gravity simply.",
        "Who painted the Mona Lisa?",
        "Write a catchy YouTube title.",
        "What is quantum entanglement?",
        "Suggest weekend activities.",
        "Write a funny tweet.",
        "How does the internet work?",
        "Summarize World War II in 5 points.",
        "Generate a product description for sneakers.",
        "Explain neural networks simply.",
        "What is the tallest mountain?",
        "Write an inspirational speech opener.",
        "How do electric cars work?",
        "List 5 productivity apps.",
        "Draft a short bio for LinkedIn.",
        "What is the meaning of life?",
        "Tell me a riddle.",
        "Explain the stock market in simple terms.",
        "Give me 5 podcast topic ideas.",
        "Write a recipe for banana bread.",
        "Explain climate change simply.",
        "What is the speed of light?",
        "Suggest a daily workout plan.",
        "Write a script for a 30s ad.",
        "What is artificial intelligence?",
        "Give me a packing list for vacation.",
        "Explain evolution in simple terms.",
        "Write a song chorus.",
        "How do magnets work?",
        "List 5 self-care tips.",
        "Summarize the plot of 'Hamlet'.",
        "What is cryptocurrency?",
        "Generate Instagram captions for travel.",
        "Explain DNA in simple words.",
        "Write a scary short story.",
        "How does Wi-Fi work?",
        "Suggest team-building activities.",
        "Give me 5 blog post ideas.",
        "What are Newton's laws of motion?",
        "Write a speech about kindness.",
        "Explain the Big Bang theory.",
        "What is the human brain's capacity?",
        "Write a bedtime lullaby.",
        "How do vaccines work?",
        "Suggest a morning affirmation.",
        "Give me 5 fun science experiments.",
        "Explain time zones simply.",
        "What is renewable energy?",
        "Write a customer thank-you note.",
        "How does GPS work?",
        "List 5 easy hobbies to start.",
        "Write a horror movie plot idea.",
        "What is cybersecurity?",
        "Explain supply and demand.",
        "Write a short rap verse.",
        "What causes rainbows?",
        "Suggest a reading list for 2025.",
        "How does memory work in the brain?",
        "Write a letter to future me.",
        "Explain AI bias simply.",
        "What is the solar system?",
        "Give me 5 icebreaker questions.",
        "Write a tagline for eco products.",
        "Explain tides and the moon.",
        "What are the planets in order?",
        "Generate 3 startup slogans.",
        "Explain recursion simply.",
        "Write a fun fact about space."
      ];
    }
  };
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  const dynamicPlaceholders = getPlaceholders();

    useEffect(() => {
      if (placeholder.length > 0) return;
    
      const interval = setInterval(() => {
        setCurrentPlaceholderIndex((prev) => {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * dynamicPlaceholders.length);
          } while (randomIndex === prev && dynamicPlaceholders.length > 1);
          return randomIndex;
        });
      }, 5000);
    
      return () => clearInterval(interval);
    }, [placeholder]);

  // Simple condition to check if current path is restricted
  const isPathRestricted = pathname.includes('/chat') ? isRestricted('chat') 
                        : pathname.includes('/image') ? isRestricted('image')
                        : false;

  useEffect(() => {
    if ((pathname === '/chat' || pathname === '/image') && inputRef?.current) {
      inputRef.current.focus();
    }

    if (!pathname.includes('/chat')){
      setIsCombinedMode(false);
      setIsCompareMode(false);
      onCombinedToggle?.(false);
      setIsWebSearch(false);
      onWebSearchToggle?.(false);

    }

  }, [pathname]);

  useEffect(() => {
    // Check if there's any uploaded image file
    const hasImageFile = uploadedFiles.some(file => file.type.startsWith('image/'));
    // console.log(chatModels, 'the chat models')
    
    if (hasImageFile) {
      // Get active models (models that are selected but not inactive)
      const activeModelIds = selectedModels.chat.filter(
        modelId => !inactiveModels.includes(modelId)
      );
      
      // Find which active models don't support images
      // Check if model has 'image' in its valid_inputs array
      const incompatibleModelsList = activeModelIds.filter(modelId => {
        const model = chatModels.find(m => m.model_uid === modelId);
        return !((model as any)?.valid_inputs as string[] | undefined)?.includes('image');
      });
      
      // Update state with incompatible models
      setIncompatibleModels(incompatibleModelsList);
      
      // Get model names for display
      const modelNames = incompatibleModelsList.map(modelId => {
        const model = chatModels.find(m => m.model_uid === modelId);
        return model?.model_name || modelId;
      });

      setIncompatibleModelNames(modelNames);
    } else {
      // Clear incompatible models if no image is uploaded
      setIncompatibleModels([]);
      setIncompatibleModelNames([]);
    }
  }, [uploadedFiles, selectedModels.chat, inactiveModels, chatModels]);

  // Function to check if all active models support image uploads
  const checkImageCompatibility = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setIncompatibleModels([]);
      return { compatible: true, incompatibleModels: [] };
    }
    
    // Get active models (models that are selected but not inactive)
    const activeModelIds = selectedModels.chat.filter(
      modelId => !inactiveModels.includes(modelId)
    );
    
    // Find which active models don't support images
    // Check if model has 'image' in its valid_inputs array
    const incompatibleModelsList = activeModelIds.filter(modelId => {
      const model = chatModels.find(m => m.model_uid === modelId);
      return !((model as any)?.valid_inputs as string[] | undefined)?.includes('image');
    });

    setIncompatibleModels(incompatibleModelsList);
    
    return {
      compatible: incompatibleModelsList.length === 0,
      incompatibleModels: incompatibleModelsList
    };
  };
  

  const calculateContentPercentage = (fileContent: any = '', textareaContent: string = ''): number => {
    // If there's no content, return 0
    if (!fileContent && !textareaContent) return 0;
    
      // If fileContent is a File object (image), don't include it in calculation
    if (fileContent instanceof File) {
      return Math.round((textareaContent.length / MAX_CONTENT_LENGTH) * 100);
    }
  
    // For string content
    if (typeof fileContent === 'string') {
      const contentToCount =  fileContent;
      const totalLength = contentToCount.length + textareaContent.length;
      return Math.round((totalLength / MAX_CONTENT_LENGTH) * 100);
    }

    // Default case - just count the textarea content
    return Math.round((textareaContent.length / MAX_CONTENT_LENGTH) * 100);
  };


  // effect to watch both content sources
  useEffect(() => {
    const fileContentLength = fileContent?.uploaded_files?.[0]?.file_content?.length || 0;
    const textareaContentLength = value.length;
    const newPercentage = calculateContentPercentage(
      fileContent?.uploaded_files?.[0]?.file_content || '',
      value
    );
    setContentPercentage(newPercentage);
  }, [fileContent, value]);

  // Add this helper function to check if content is over limit
  const isContentOverLimit = (percentage: number): boolean => {
    return percentage > 100;
  };

  // Add this helper function at the top of your file
  function generateUUID(): string {
  // Check if native crypto.randomUUID is available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

  const handlePaste = async (event: React.ClipboardEvent) => {
    if(pathname.includes('/image')) return;

    const items = event.clipboardData.items;
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        if(isWebSearch) {
          toast.warning("File upload isn't supported with Web Search on");
          return;
        }

        event.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        // Check file upload limit based on plan
        const fileLimit = plan === 'free' ? 3 : plan === 'standard' ? 5 : 10;
        if (uploadedFiles.length >= fileLimit) {
          toast.error(`You can upload a maximum of ${fileLimit} files on the ${plan || 'free'} plan`);
          return;
        }

        const validation = validateFile(file);
        if (!validation.isValid) {
          toast.error(`Error ${validation.error}`);
          return;
        }

        const fileUrl = URL.createObjectURL(file);
        
        const newUploadedFile: UploadedFile = {
          id: generateUUID(),
          name: `IMG ${new Date().toISOString()}.${file.type.split('/')[1]}`,
          type: file.type,
          size: file.size,
          url: fileUrl,
          status: 'loading',
          progress: 0
        };

        // Add to array
        setUploadedFiles(prev => [...prev, newUploadedFile]);

        let progress = 0;
        const progressInterval = setInterval(() => {
          const increment = Math.max(1, (90 - progress) / 10);
          progress = Math.min(90, progress + increment);
          
          setUploadedFiles(prev => 
            prev.map(f => f.id === newUploadedFile.id ? { ...f, progress } : f)
          );
        }, 100);

        try {
          const { text } = await processFile(file);

          clearInterval(progressInterval);
          
          setUploadedFiles(prev => 
            prev.map(f => f.id === newUploadedFile.id ? { ...f, progress: 100 } : f)
          );

          await new Promise(resolve => setTimeout(resolve, 500));
          setUploadedFiles(prev => 
            prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'ready' } : f)
          );

          await handleProcessFile(file, newUploadedFile.id);

          toast.success('file uploaded');
        } catch (error) {
          setUploadedFiles(prev => {
            const fileToUpdate = prev.find(f => f.id === newUploadedFile.id);
            if (fileToUpdate?.url) URL.revokeObjectURL(fileToUpdate.url);
            return prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'error' as const } : f);
          });
          toast.error(`${error instanceof Error ? error.message : "Failed to upload file"}`);
        }
      }
    }
  };

  const handleUploadFromComputer = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFromDrive = async (file: File) => {

    if (!file) return;

    // Check if it's an audio file
    if (isAudioFile(file)) {
    toast.error('Audio files are not supported');
    return;
    }

    // Check if it's a video file
    if (isVideoFile(file)) {
    toast.error('Video files are not supported');
    return;
    }
    // Check file upload limit based on plan
    const fileLimit = plan === 'free' ? 3 : plan === 'standard' ? 5 : 10;
    if (uploadedFiles.length >= fileLimit) {
      toast.error(`You can upload a maximum of ${fileLimit} files on the ${plan || 'free'} plan`);
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(`${validation.error}`);
      return;
    }

    const compatibility = checkImageCompatibility(file);
    const fileUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');
    
    const newUploadedFile: UploadedFile = {
      id: generateUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: isImage ? fileUrl : '',
      status: 'loading',
      progress: 0,
      timestamp: Date.now()
    };

    // Add to array immediately
    setUploadedFiles(prev => [...prev, newUploadedFile]);

    let progress = 0;
    const progressInterval = setInterval(() => {
      const increment = Math.max(1, (90 - progress) / 10);
      progress = Math.min(90, progress + increment);
      
      setUploadedFiles(prev => 
        prev.map(f => f.id === newUploadedFile.id ? { ...f, progress } : f)
      );
    }, 100);

    try {
      // If image: prepare fileContent; else upload and keep UUID
      setIsUploading(true)
      if (isImage) {
        await handleProcessFile(file, newUploadedFile.id);
      } else {
        const uploadRes = await chatApi.uploadFile(file, currentProject?.uuid || null);
        // console.log('uploadRes', uploadRes)
        setFileUUIDs(prev => [...prev, uploadRes.file.uuid]);
        setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, fileUuid: uploadRes.file.uuid } : f));
        setContentPercentage(calculateContentPercentage('', value));
      }

      clearInterval(progressInterval);
      setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, progress: 100 } : f));
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'ready' } : f));

      toast.success(`file uploaded`,{
        dismissible: true,
      });

    } catch (error) {
      if (isImage) {
        setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'error' as const } : f));
      } else {
        // Remove failed text file upload
        setUploadedFiles(prev => {
          const fileToRemove = prev.find(f => f.id === newUploadedFile.id);
          if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);
          return prev.filter(f => f.id !== newUploadedFile.id);
        });
      }
      toast.error(`${error instanceof Error ? error.message : "Failed to upload file"}`);
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (isAudioFile(file)) {
      toast.error('Audio files are not supported');
      return;
    }

    // Check if it's a video file
    if (isVideoFile(file)) {
      toast.error('Video files are not supported');
      return;
    }

    // Check file upload limit based on plan
    const fileLimit = plan === 'free' ? 3 : plan === 'standard' ? 5 : 10;
    if (uploadedFiles.length >= fileLimit) {
      toast.error(`You can upload a maximum of ${fileLimit} files on the ${plan || 'free'} plan`);
      return;
    }


    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(`${validation.error}`);
      return;
    }

    // Check image compatibility
    const compatibility = checkImageCompatibility(file);
    const isImage = file.type.startsWith('image/');
    // Show preview immediately with loading
    const fileUrl = URL.createObjectURL(file);

    const newUploadedFile: UploadedFile = {
      id: generateUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: isImage ? fileUrl : '',
      status: 'loading',
      progress: 0,
      timestamp: Date.now()
    };

    // Add to array immediately
    setUploadedFiles(prev => [...prev, newUploadedFile]);

    let progress = 0;
    const progressInterval = setInterval(() => {
      const increment = Math.max(1, (90 - progress) / 10);
      progress = Math.min(90, progress + increment);
      
      setUploadedFiles(prev => 
        prev.map(f => f.id === newUploadedFile.id ? { ...f, progress } : f)
      );
    }, 100);

    try {
      // If image: prepare fileContent; else upload and keep UUID
      setIsUploading(true)
      if (isImage) {
        await handleProcessFile(file, newUploadedFile.id);
      } else {
        const uploadRes = await chatApi.uploadFile(file, currentProject?.uuid || null);
        // console.log('uploadRes', uploadRes)
        setFileUUIDs(prev => [...prev, uploadRes.file.uuid]);
        setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, fileUuid: uploadRes.file.uuid } : f));
        setContentPercentage(calculateContentPercentage('', value));
      }

      clearInterval(progressInterval);
      setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, progress: 100 } : f));
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'ready' } : f));

      toast.success(`file uploaded`,{
        dismissible: true,
      });

    } catch (error) {
      if (isImage) {
        setUploadedFiles(prev => prev.map(f => f.id === newUploadedFile.id ? { ...f, status: 'error' as const } : f));
      } else {
        // Remove failed text file upload
        setUploadedFiles(prev => {
          const fileToRemove = prev.find(f => f.id === newUploadedFile.id);
          if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);
          return prev.filter(f => f.id !== newUploadedFile.id);
        });
      }
      toast.error(`${error instanceof Error ? error.message : "Failed to upload file"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRemove) return;

    const isImage = fileToRemove.type.startsWith('image/');
    
    if (isImage) {
      // For images: remove from array and fileContent
      if (fileToRemove.url) URL.revokeObjectURL(fileToRemove.url);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      
      // Remove from fileContent
      setFileContent(prev => {
        if (!prev) return null;
        const updatedFiles = prev.uploaded_files.filter(f => {
          // Match by name since we don't have another unique identifier
          return f.file_name !== fileToRemove.name;
        });
        return updatedFiles.length > 0 ? { uploaded_files: updatedFiles } : null;
      });
    } else {
      // For text files: call API to delete, then remove from arrays
      if (!fileToRemove.fileUuid) return;
      
      // Set to loading state
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'loading' as const } : f
      ));
      
      try {
        const response = await chatApi.removeFile(fileToRemove.fileUuid);
        // console.log('response from remove file', response);
        
        // Remove from arrays
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        setFileUUIDs(prev => prev.filter(uuid => uuid !== fileToRemove.fileUuid));
        setContentPercentage(calculateContentPercentage('', value));
      } catch (error) {
        // Revert to ready state on error
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'ready' as const } : f
        ));
        toast.error('Failed to remove file');
      }
    }
    
    // Clear input if no files left
    if (uploadedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
    };
  }, [uploadedFiles]);

  const isInputEmpty = value.trim() === "";

  const handleWebSearchToggle = () => {
    const newValue = !isWebSearch;
    setIsWebSearch(newValue);
    sendGAEvent('buttonClick', 'toggleFeature', { featureName: 'Web-Search', status: newValue});

    
    // If enabling web search, disable combined mode
    // if (newValue && isCombinedMode) {
    //   setIsCombinedMode(false);
    //   onCombinedToggle?.(false);
    // }
    
    onWebSearchToggle?.(newValue);
  };

  const handleCombinedToggle = () => {
    // Check for minimum active models before enabling combined mode
    if (!isCombinedMode && activeModelsCount < 2 && isAuthenticated) {
      setShowCombinedPrompt(true);
      return;
    }

    const newValue = !isCombinedMode;
    sendGAEvent('buttonClick', 'toggleFeature', { featureName: 'Combine', status: newValue});

    // If enabling combined mode, disable web search and compare mode
    if (newValue) {
      // if (isWebSearch) {
      //   setIsWebSearch(false);
      //   onWebSearchToggle?.(false);
      // }
      if (isCompareMode) {
        setIsCompareMode(false);
      }
    }
    
    setIsCombinedMode(newValue);
    onCombinedToggle?.(newValue);
  };

  const getRequiredInfo = (pathname: string): string => {
    switch (true) {
      case pathname.startsWith('/chat'):
        return 'at least 2 models';
      case pathname.startsWith('/image'):
        return 'at least 1 model';
      default:
        return 'at least 2 models';
    }
  };

  const chatCondition = (pathname === "/chat" || (pathname.startsWith("/project/") && pathname.split("/").length === 3)) && selectedModels.chat.length < 2;
  const imageCondition = pathname === "/image" && selectedModels.image.length < 1;
  const audioCondition = pathname === "/audio" && selectedModels.audio.length < 1;
  const videoCondition = pathname === "/video" && selectedModels.video.length < 1;

  const handleSendClick = () => {
    if (!isAuthenticated) {
      setPending({
        link: pathname,
        prompt: value,
        isWebSearch,
        isCombinedMode,
        isCompareMode
      });
      setAuthModalOpen(true);
      return;
    }
    if (chatCondition || imageCondition || audioCondition || videoCondition) {
      setShowModelPrompt(true);
      return;
    }
    onSend(fileContent || undefined, fileUUIDs.length > 0 ? fileUUIDs : undefined);
    
    // Clear all files
    uploadedFiles.forEach(file => {
      if (file.url) URL.revokeObjectURL(file.url);
    });
    setUploadedFiles([]);
    setFileContent(null);
    setFileUUIDs([]);
    setContentPercentage(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset textarea height to default state
    if (inputRef?.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleProcessFile = async (file: File, fileId: string) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isImage = file.type.startsWith('image/') || 
                 /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file.name);

    const fileTypeForBackend = isImage ? "image" : (fileExtension || 'unknown');

    // For images, attach the actual File blob
    if (isImage) {
      const newFileEntry = {
        file_name: file.name,
        file_size: `${(file.size / 1024).toFixed(1)}KB`,
        file_type: fileTypeForBackend,
        file_content: file,
      };

      // Add to existing fileContent or create new
      setFileContent(prev => {
        if (prev) {
          return {
            uploaded_files: [...prev.uploaded_files, newFileEntry]
          };
        }
        return {
          uploaded_files: [newFileEntry]
        };
      });
      setContentPercentage(0);
    }
  };

    // Determine current content type based on pathname
    const getCurrentType = (): 'chat' | 'image' | 'audio' | 'video' => {
      if (pathname.startsWith('/image')) return 'image';
      if (pathname.startsWith('/audio')) return 'audio';
      if (pathname.startsWith('/video')) return 'video';
      return 'chat';
    };
  
    // Here we get the history of the various pages
    const currentType = getCurrentType();
  
    // Add this helper function to get section-specific styles
    const getSectionStyles = (type: 'chat' | 'image' | 'audio' | 'video') => {
      switch (type) {
        case 'image':
          return {
            bgColor: 'bg-purple-500/10',
            hoverBg: 'hover:bg-purple-500/20',
            iconColor: 'text-purple-500'
          };
        case 'audio':
          return {
            bgColor: 'bg-blue-500/10',
            hoverBg: 'hover:bg-blue-500/20',
            iconColor: 'text-blue-500'
          };
        case 'video':
          return {
            bgColor: 'bg-yellow-500/10',
            hoverBg: 'hover:bg-yellow-500/20',
            iconColor: 'text-yellow-500'
          };
        default:
          return {
            bgColor: 'bg-green-500/10',
            hoverBg: 'hover:bg-green-500/20',
            iconColor: 'text-green-500'
          };
      }
    };

  // Calculate active models count
  const activeModelsCount = selectedModels.chat.filter(
    modelId => !inactiveModels.includes(modelId)
  ).length;

  // Add an effect to monitor active models count
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isCombinedMode && activeModelsCount < 2) {
      // Automatically disable combined mode
      setIsCombinedMode(false);
      onCombinedToggle?.(false);      
      // Show notification
      toast.warning('Minimum of 2 models required to enable Combine');
    }
  }, [activeModelsCount, isCombinedMode, onCombinedToggle, isAuthenticated]);

  const handleSummaryToggle = () => {
    if (!isCompareMode && activeModelsCount < 2 && isAuthenticated) {
      setShowSummaryPrompt(true);
      return;
    }

    // Toggle the compareMode state immediately
    const newValue = !isCompareMode;
    
    // If enabling compare mode, disable combined mode
    if (newValue && isCombinedMode) {
      setIsCombinedMode(false);
      onCombinedToggle?.(false);
    }
    
    setIsCompareMode(newValue);
    sendGAEvent('buttonClick', 'toggleFeature', { featureName: 'Comparison', status: newValue});
  };

  // Add this effect to handle latency warning
  useEffect(() => {
    if (isCombinedMode && !isWebSearch) {
      setActiveFeature('combine');
      setShowLatencyWarning(true);

      // Hide warning after 5 seconds
      const timer = setTimeout(() => {
        setShowLatencyWarning(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowLatencyWarning(false);
    }

    if (isWebSearch && (isCombinedMode || isCompareMode)) {
      setActiveFeature(isCombinedMode ? 'combine' : 'compare');
      setShowLatencyWarning(true);
      
      // Hide warning after 5 seconds
      const timer = setTimeout(() => {
        setShowLatencyWarning(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowLatencyWarning(false);
    }
  }, [isWebSearch, isCombinedMode, isCompareMode]);

  return (
    <>
      <div className=" relative py-2 bg-background/95 backdrop-blur transition-all duration-300">

        <div className={`max-w-xl md:max-w-3xl mx-auto ${otherSytles}`}>
          {contentPercentage > 100 && (
            <ContentLengthWarning percentage={contentPercentage} />
          )}

          {/* Add restriction warning based on current path */}
          {(() => {
            const type = pathname.includes('/chat') ? 'chat' 
                      : pathname.includes('/image') ? 'image'
                      : pathname.includes('/project') ? 'chat'
                      : null;
            
            if (type && restrictions[type].isRestricted && restrictions[type].comebackTime) {
              return (
                <RestrictionWarning 
                  message={restrictions[type].message || `You've reached the ${type} limit.`}
                  comebackTime={new Date(restrictions[type].comebackTime).toLocaleTimeString()}
                />
              );
            }
            return null;
          })()}

          {/* Show incompatible models warning if needed */}
          {uploadedFiles.some(f => f.type.startsWith('image/')) && incompatibleModels.length > 0 && (
            <ContentLengthWarning 
              type="incompatible-models"
              message="does not support image uploads at the moment"
              models={incompatibleModelNames}
            />
          )}

          {showLatencyWarning && activeFeature && (
            <LatencyWarning isVisible={showLatencyWarning} feature={activeFeature} isWebSearch={isWebSearch} />
          )}

          {/* <ToastDemo /> */}

          <div className="relative flex flex-col p-3 border border-borderColorPrimary shadow-xl bg-background dark:bg-backgroundSecondary rounded-3xl z-50">
            <div>
              {uploadedFiles.length > 0 && (
                <div className="max-w-xl md:max-w-3xl mx-auto mb-2 flex flex-wrap gap-2">
                  {uploadedFiles.map(file => (
                    <FilePreview key={file.id} file={file} onRemove={() => handleRemoveFile(file.id)} />
                  ))}
                </div>
              )}
            </div>
            {dynamicPrompts && uploadedFiles.length === 0 && (
              <div data-feedback={placeholder ? "true" : "false"} className={`[&[data-feedback='true']]:opacity-0`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span aria-hidden 
                  key={currentPlaceholderIndex}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.2}}
                  className="absolute left-6 top-5 text-muted-foreground">
                    {dynamicPlaceholders[currentPlaceholderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <Textarea 
              ref={inputRef}
              placeholder={`${pathname.includes('/chat') || pathname.includes('/project') ? 'Message multiple models' : 'Create images with multiple models'}`}
              className={`w-full bg-transparent ${(pathname === '/chat' || pathname === '/image') ? 'min-h-[3.5rem]': 'min-h-[3rem]' }  max-h-[10rem] border-none text-base resize-none focus-visible:outline-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 z-50 ${(dynamicPrompts && uploadedFiles.length === 0) ? '[&::placeholder]:opacity-0' : ''}`}
              value={value}
              onChange={(e) => {
                const target = e.target;
                target.style.height = 'auto';
                const newHeight = Math.min(target.scrollHeight, 150);
                target.style.height = `${newHeight}px`;
                setPlaceholder(e.target.value);
                onChange(e.target.value);
                const fileContentLength = fileContent?.uploaded_files?.[0]?.file_content?.length || 0;
                const newPercentage = calculateContentPercentage(
                  fileContent?.uploaded_files?.[0]?.file_content || '',
                  e.target.value
                );
                setContentPercentage(newPercentage);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isInputEmpty && !isLoading && !isSending && !isUploading && contentPercentage < 100 && incompatibleModels.length < 1) {
                  e.preventDefault();
                  handleSendClick();
                  if (inputRef?.current) {
                    inputRef.current.style.height = 'auto';
                  }
                }
              }}
              onPaste={handlePaste}
              rows={1}
              style={{
                overflowY: value.split('\n').length > 4 || (inputRef?.current?.scrollHeight || 0) > 150 ? 'auto' : 'hidden'
              }}
            />
            
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-1">
                {(pathname.startsWith('/chat') || pathname.startsWith('/project')) && 
                  <FileUploadButton
                    onUploadFromComputer={handleUploadFromComputer}
                    onUploadFromDrive={handleUploadFromDrive}
                    disabled={isWebSearch || isPathRestricted}
                  />
                }
                
                {isWeb && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={isLoading || uploadedFiles.length > 0 || isLoadingLatest || isSending || isPathRestricted}
                          onClick={handleWebSearchToggle}
                          className={`relative flex items-center gap-1 rounded-full transition-all duration-300 p-[0.4rem] ${
                            isWebSearch 
                              ? `border border-green-500/10 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor}  hover:bg-green-500/20`
                              : `border border-borderColorPrimary text-muted-foreground ${isPathRestricted ? '' : 'hover:text-foreground'}`
                          } ${uploadedFiles.length > 0 ? 'opacity-50 cursor-pointer' : ''}`}
                        >
                          <Globe size={16} />
                          {isWebSearch ? <span className="hidden sm:flex sm:text-[0.8rem]">Search</span> : ''}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isWebSearch ? "Search the web" : "Search the web"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {isCombined && (
                <>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={isLoading || isSending || isLoadingLatest || isPathRestricted}
                          onClick={() => {
                            if (isRestricted('combine')) {
                              toast.info(`You've reached your combine limit. Upgrade to continue! or try again at ${restrictions.combine.comebackTime ? new Date(restrictions.combine.comebackTime).toLocaleTimeString() : 'later'}`, {
                                action: {
                                  label: "Upgrade",
                                  onClick: () => setPlansModalOpen(true)
                                }
                              });
                              return;
                            }
                            handleCombinedToggle();
                          }}
                          className={`relative flex items-center gap-1 rounded-full transition-all duration-300 p-[0.4rem] overflow-hidden ${
                            isCombinedMode 
                              ? `border border-green-500/10 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor}  hover:bg-green-500/20`
                              : `border border-borderColorPrimary text-muted-foreground ${isPathRestricted ? '' : 'hover:text-foreground'}`
                          }`}
                        >
                          <Layers size={16} />
                          <span className="text-[0.8rem]">Combine</span>
                          
                          {/* Add the animation effect when combined mode is active */}
                          {!isPathRestricted && (
                            <motion.div 
                              className={`absolute inset-0 bg-gradient-to-r ${
                                isDarkMode 
                                  ? "from-transparent via-white/10 to-transparent" 
                                  : "from-transparent via-black/5 to-transparent"
                              }`}
                              initial={{ x: "-100%", opacity: 0 }}
                              animate={{ x: "100%", opacity: [0, 1, 0] }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatDelay:  getRandomDelay(),
                                duration: 2,  // Slower animation
                                ease: "easeInOut" 
                              }}
                            />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent >
                        <p>{isRestricted('combine') ? `3/3 Used. Try again at ${restrictions.combine.comebackTime ? new Date(restrictions.combine.comebackTime).toLocaleTimeString() : 'later'}` : isCombinedMode ? "Combine selected models" : "Combine selected models"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={isLoading || isSending || isLoadingLatest || isPathRestricted}
                          onClick={() => {
                            if (isRestricted('compare')) {
                              toast.info(`You've reached your compare limit. Upgrade to continue! or try again at ${restrictions.compare.comebackTime ? new Date(restrictions.compare.comebackTime).toLocaleTimeString() : 'later'}`, {
                                action: {
                                  label: "Upgrade",
                                  onClick: () => setPlansModalOpen(true)
                                }
                              });
                              return;
                            }
                            handleSummaryToggle();
                          }}
                          className={`relative flex items-center gap-1 rounded-full transition-all duration-300 p-[0.4rem] overflow-hidden ${
                            isCompareMode 
                              ? `border border-green-500/10 ${getSectionStyles(currentType).bgColor} ${getSectionStyles(currentType).iconColor} hover:bg-green-500/20`                              
                              : `border border-borderColorPrimary text-muted-foreground ${isPathRestricted ? '' : 'hover:text-foreground'}`
                          }`}
                        >
                          {!isPathRestricted && (
                            <motion.div 
                              className={`absolute inset-0 bg-gradient-to-r ${
                                isDarkMode 
                                  ? "from-transparent via-white/10 to-transparent" 
                                  : "from-transparent via-black/5 to-transparent"
                              }`}
                              initial={{ x: "-100%", opacity: 0 }}
                              animate={{ x: "100%", opacity: [0, 1, 0] }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatDelay:  getRandomDelay(),
                                duration: 2,  // Slower animation
                                ease: "easeInOut" 
                              }}
                            />
                          )}
                          <Scale size={18} className="" />
                          <span className="text-[0.8rem]">Compare</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRestricted('compare') ? `3/3 Used. Try again at ${restrictions.compare.comebackTime ? new Date(restrictions.compare.comebackTime).toLocaleTimeString() : 'later'}` : isCompareMode ? "Compare AI models" : "Compare AI models"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
                )}
                
              </div>

              <div className="flex items-center gap-2">
                <MicButton 
                  isListening={isListening} 
                  onClick={toggleListening}
                  className={`text-white dark:text-black bg-bodyColor hover:bg-opacity-70 transition-all duration-200 
                    ${ !isInputEmpty && ""}`}
                />
                
                <Button
                  onClick={handleSendClick}
                  size= {(pathname.startsWith('/chat') || pathname.startsWith('/project')) ? `icon` : `default`}
                  className={`flex-shrink-0 h-9 ${(pathname.startsWith('/chat') || pathname.startsWith('/project')) ? "rounded-full w-9" : "rounded-full"} ${
                    isInputEmpty
                      ? ""
                      : "bg-bodyColor hover:bg-opacity-70 transition-all duration-200"
                  }`}
                  disabled={isInputEmpty || isLoading || isSending || isLoadingLatest || 
                           isContentOverLimit(contentPercentage) || 
                           (uploadedFiles.some(f => f.type.startsWith('image/')) && incompatibleModels.length > 0) ||
                           isPathRestricted || isUploading} 
                >
                  {(pathname.startsWith('/chat') || pathname.startsWith('/project')) ? <ArrowUp className="h-4 w-4" /> : 'Generate' }
                </Button>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept={Object.entries(CHAT_ALLOWED_FILE_TYPES)
                .flatMap(([, exts]) => exts)
                .join(',')}
            />
          </div>
        </div>

        {pathname.startsWith("/chat/res") && (
            <FooterText />
        )}      </div>

      <PromptModal
        isOpen={showModelPrompt}
        onClose={() => setShowModelPrompt(false)}
        title="No Models Selected"
        message={<>Please select <span className="font-bold text-foreground">{getRequiredInfo(pathname)}</span> to start a conversation</>}
        metadata={{
          link: {
            text: "Learn why",
            url: "/faq/3742473-others/models-selection"
          }
        }}
        actions={[
          {
            label: "Close",
            onClick: () => setShowModelPrompt(false),
            variant: "outline"
          },
          {
            label: "Select Models",
            onClick: () => {
              setShowModelPrompt(false);
              setModelSelectionModalOpen(true)
            },
            variant: "default"
          }
        ]}
      />

      <PromptModal
        isOpen={showCombinedPrompt}
        onClose={() => setShowCombinedPrompt(false)}
        title="NOTICE"
        message={<>At least <span className="font-bold">2 active models</span> are required to generate compared and combined responses on Alle-AI.</>}
        actions={[
          {
            label: "Select models",
            onClick: () => setModelSelectionModalOpen(true),
            variant: "default"
          },
          {
            label: "Ok",
            onClick: () => setShowCombinedPrompt(false),
            variant: "default"
          }
        ]}
      />

      <PromptModal
        isOpen={showSummaryPrompt}
        onClose={() => setShowSummaryPrompt(false)}
        title="NOTICE"
        message={<>At least <span className="font-bold">2 active models</span> are required to enable Compare feature on Alle-AI.</>}
        actions={[
          {
            label: "Ok",
            onClick: () => setShowSummaryPrompt(false),
            variant: "default"
          }
        ]}
      />

      <ModelSelectionModal
        isOpen={modelSelectionModalOpen}
        onClose={() => setModelSelectionModalOpen(false)}
      />

      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />

      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />


      {promptConfig && (
        <PromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          {...promptConfig}
        />
      )}
    </>
  );
}

