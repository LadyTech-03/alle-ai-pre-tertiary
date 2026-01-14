"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MessageSquare, Image as ImageIcon, Music, Video, ChevronDown, X, LayoutGrid, User, ArrowUp, CheckCircle2, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Define our AI models
interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: string; // URL to the icon image
  isPro?: boolean;
}

const aiModels: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    icon: "/models/gpt-4o.webp"
  },
  {
    id: "deepseek",
    name: "DeepSeek V2",
    provider: "DeepSeek",
    icon: "/models/deepseek.webp",
    isPro: false
  },
  {
    id: "gemini-pro",
    name: "Gemini 1.5",
    provider: "Google",
    icon: "/models/gemini.webp",
    isPro: false
  },
  {
      id: "qwen-2-5",
      name: "Qwen 2.5",
      provider: "Alibaba",
      icon: "/models/qwen.webp",
      isPro: false
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5",
    provider: "Anthropic",
    icon: "/models/claude-3.webp",
    isPro: false
  },
  {
    id: "llama-70b",
    name: "Llama 3",
    provider: "Meta",
    icon: "/models/meta.webp",
    isPro: false
  },
  {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    icon: "/models/grok.webp",
    isPro: false
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "Mistral AI",
    icon: "/models/mistral-ai.webp",
    isPro: false
  },
  {
    "id": "claude-3-haiku",
    "name": "Claude 3 Haiku",
    "provider": "Anthropic",
    "icon": "/models/claude-3.webp",
    "isPro": false
  },
  {
    id: "phi",
    name: "Phi",
    provider: "Microsoft",
    icon: "/models/microsoft.webp",
    isPro: false
  },
  {
    id: "yi",
    name: "Yi",
    provider: "01.AI",
    icon: "/models/yi.webp",
    isPro: false
  },
  {
    id: "copilot",
    name: "Copilot",
    provider: "Microsoft",
    icon: "/models/copilot.webp",
    isPro: false
  },
  // ... add more models as needed
];

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

// Add this interface for the loading cards
interface LoadingCard {
  modelId: string;
  task: string;
}

// Add a new interface for model responses
interface ModelResponse {
  modelId: string;
  content: string;
}

// Add these types at the top with your other interfaces
interface SummaryTabs {
  combination: string;
  consistencies: string;
  inconsistencies: string;
  overview: string;
}

// Add this new interface
interface CursorPosition {
  x: number;
  y: number;
}

// Add this new interface for cursor animation steps
interface CursorStep {
  x: number;
  y: number;
  onClick?: boolean;
  duration?: number;
}

interface PlatformPreviewProps {
  onAnimationComplete?: () => void;
}

export function PlatformChatPreview({ onAnimationComplete }: PlatformPreviewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingCards, setLoadingCards] = useState<LoadingCard[]>([]);
  const [modelResponses, setModelResponses] = useState<ModelResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ModelResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<ModelResponse | null>(null);
  const [summaryTabs, setSummaryTabs] = useState<SummaryTabs>({
    combination: "The models have provided various perspectives on building a wall. Here's a comprehensive overview of their responses, highlighting key agreements and differences in their approaches.",
    consistencies: "Common points of agreement among the models...",
    inconsistencies: "Areas where the models differ in their approaches...",
    overview: "Overall summary of the different approaches suggested..."
  });
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const layoutGridButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState("combination");

  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  // Helper function to get model details
  const getModelDetails = (modelId: string) => {
    return aiModels.find(model => model.id === modelId);
  };

  // Modify handleSend to include the summary loading sequence
  const handleSend = () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setModelResponses([]);
    setSummary(null);
    setPrompt("");
    
    setTimeout(() => {
      const modelResponses = {
        'chatgpt-3.5': "Building a wall requires proper planning...",
        'gpt-4o': "To construct a wall, begin with a detailed plan...",
        'gemini-pro': "Wall construction involves several key steps...",
        'claude-3-5-sonnet': "The process of building a wall involves...",
        'llama-70b': "When building a wall, start with foundation..."
      };

      const responses = selectedModels.map(modelId => ({
        modelId,
        content: modelResponses[modelId as keyof typeof modelResponses] || "Let me help you with building a wall..."
      }));
      
      setModelResponses(responses);
      setIsLoading(false);
      
      // Start summary loading immediately after responses appear
      setIsSummaryLoading(true);
      
      // Generate summary after 2 seconds
      const summaryResponse = {
        modelId: 'summary',
        content: "AI models analysis and comparison"
      };

      setTimeout(() => {
        setIsSummaryLoading(false);
        setSummary(summaryResponse);
        setSummaryTabs({
          combination: "The models collectively emphasize the importance of proper planning...",
          consistencies: "All models agree on the importance of proper planning...",
          inconsistencies: "Models differ in their emphasis on professional help...",
          overview: "While each model provides valuable insights..."
        });
      }, 2000);
      
      // Animation constants
      const CURSOR_MOVE_DURATION = 500;
      const HOVER_DURATION = 500;
      const RESPONSE_INTERVAL = 2000;
      
      if (responses.length > 0) {
        setSelectedResponse(responses[0]);
        
        // Click through responses
        responses.slice(1).forEach((response, index) => {
          setTimeout(() => {
            const responseElement = document.querySelector(`[data-response="${response.modelId}"]`);
            if (responseElement && screenRef.current) {
              const responsePosition = getElementPosition(responseElement as HTMLElement);
              setCursorPosition(responsePosition);
              
              setTimeout(() => {
                setSelectedResponse(response);
              }, CURSOR_MOVE_DURATION + HOVER_DURATION);
            }
          }, (index + 1) * RESPONSE_INTERVAL);
        });

        // Calculate when all response clicks will be done
        const allResponsesTime = (responses.length - 1) * RESPONSE_INTERVAL;
        
        // Move cursor to summary button after all responses are clicked
        setTimeout(() => {
          const summaryButton = document.querySelector('[data-button="summary"]');
          if (summaryButton && screenRef.current) {
            const summaryPosition = getElementPosition(summaryButton as HTMLElement);
            setCursorPosition(summaryPosition);
            
            // Click after cursor arrives
            setTimeout(() => {
              setSelectedResponse(summaryResponse);

              // Start clicking through summary tabs after summary is selected
              const tabSequence = ['consistencies', 'inconsistencies', 'overview'];
              tabSequence.forEach((tabValue, index) => {
                setTimeout(() => {
                  const tabTrigger = document.querySelector(`[data-tab="${tabValue}"]`);
                  if (tabTrigger && screenRef.current) {
                    const tabPosition = getElementPosition(tabTrigger as HTMLElement);
                    setCursorPosition(tabPosition);
                    
                    setTimeout(() => {
                      setActiveTab(tabValue);
                      tabTrigger.classList.add('bg-backgroundSecondary');
                      setTimeout(() => {
                        tabTrigger.classList.remove('bg-backgroundSecondary');
                        
                        // Check if this is the last tab
                        if (index === tabSequence.length - 1) {
                          // Wait 2 seconds before triggering the callback
                          setTimeout(() => {
                            onAnimationComplete?.();
                          }, 2000);
                        }
                      }, 200);
                    }, CURSOR_MOVE_DURATION + HOVER_DURATION);
                  }
                }, (index + 1) * RESPONSE_INTERVAL);
              });
            }, CURSOR_MOVE_DURATION + HOVER_DURATION);
          }
        }, allResponsesTime + 2500);
      }
    }, 3000);
  };

  // Function to get element position relative to screen
  const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const screenRect = screenRef.current?.getBoundingClientRect();
    
    if (!screenRect) return { x: 0, y: 0 };
    
    return {
      x: rect.left - screenRect.left + rect.width / 2,
      y: rect.top - screenRect.top + rect.height / 2
    };
  };

  // Auto-start demo on mount
  useEffect(() => {
    // Small delay before starting to ensure everything is rendered
    const startTimeout = setTimeout(() => {
      if (!screenRef.current) return;
      const screenRect = screenRef.current.getBoundingClientRect();
      
      const centerPosition = {
        x: screenRect.width / 2,
        y: screenRect.height / 2
      };
      
      const modelsToSelect = ['gpt-4o', 'deepseek','claude-3-5-sonnet', 'qwen-2-5'];
      const demoPrompt = "How do I build a wall?";
      
      // Animation constants
      const CURSOR_ANIMATION_DURATION = 500;
      const HOVER_DURATION = 500;
      const MODEL_INTERVAL = 1200;
      const TYPING_SPEED = 100;
      
      // Start with cursor in center
      setCursorPosition(centerPosition);
      setIsDemoActive(true);
      
      // Move to LayoutGrid button
      setTimeout(() => {
        if (!layoutGridButtonRef.current) return;
        const layoutGridPosition = getElementPosition(layoutGridButtonRef.current);
        setCursorPosition(layoutGridPosition);
        
        // Rest of the demo sequence...
        setTimeout(() => {
          setIsMenuOpen(true);
          
          // Select models
          modelsToSelect.forEach((modelId, index) => {
            const startTime = 500 + (index * MODEL_INTERVAL);
            
            setTimeout(() => {
              const modelElement = document.querySelector(`[data-model-id="${modelId}"]`);
              if (modelElement) {
                const modelPosition = getElementPosition(modelElement as HTMLElement);
                setCursorPosition(modelPosition);
                
                // Wait for cursor movement + hover before clicking
                setTimeout(() => {
                  (modelElement as HTMLElement).click();
                }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
              }
            }, startTime);
          });

          // Calculate final delay for save button
          const finalDelay = 500 + (modelsToSelect.length * MODEL_INTERVAL);
          setTimeout(() => {
            const saveButton = document.querySelector('[data-button="save-models"]');
            if (saveButton) {
              const saveButtonPosition = getElementPosition(saveButton as HTMLElement);
              setCursorPosition(saveButtonPosition);
              
              // Wait for cursor + hover before clicking save
              setTimeout(() => {
                (saveButton as HTMLElement).click();
                
                // After save, move to prompt input
                setTimeout(() => {
                  const promptInput = document.querySelector('[data-input="prompt"]');
                  if (promptInput) {
                    const promptPosition = getElementPosition(promptInput as HTMLElement);
                    setCursorPosition(promptPosition);
                    
                    // Start typing after cursor arrives
                    setTimeout(() => {
                      let currentText = '';
                      [...demoPrompt].forEach((char, index) => {
                        setTimeout(() => {
                          currentText += char;
                          setPrompt(currentText);
                        }, index * TYPING_SPEED);
                      });
                      
                      // After typing is complete, click send button
                      const typingDuration = demoPrompt.length * TYPING_SPEED;
                      setTimeout(() => {
                        const sendButton = document.querySelector('[data-button="send"]');
                        if (sendButton) {
                          const sendButtonPosition = getElementPosition(sendButton as HTMLElement);
                          setCursorPosition(sendButtonPosition);
                          
                          // Wait for cursor to arrive before clicking send
                          setTimeout(() => {
                            (sendButton as HTMLElement).click();
                          }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
                        }
                      }, typingDuration + HOVER_DURATION);
                    }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
                  }
                }, CURSOR_ANIMATION_DURATION + 300); // Short delay after save closes modal
              }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
            }
          }, finalDelay);
        }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
      }, 300);
    }, 1000); // Wait 1 second before starting the demo

    // Cleanup function
    return () => {
      clearTimeout(startTimeout);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[800px] h-[500px] relative">
        {/* Laptop/Screen Container */}
        <div className="absolute inset-0 bg-background rounded-lg p-2">
          {/* Screen Content */}
          <div ref={screenRef} className="bg-background h-full rounded-md overflow-hidden border border-borderColorPrimary relative">
            {/* Add the cursor */}
            {isDemoActive && (
              <motion.div
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: cursorPosition.x,
                  y: cursorPosition.y
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  x: cursorPosition.x,
                  y: cursorPosition.y
                }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                  x: { duration: 1, ease: "easeInOut" },
                  y: { duration: 1, ease: "easeInOut" }
                }}
                className="absolute w-4 h-4 pointer-events-none z-[9999]"
                style={{
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-ping" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 1L13 8L3 15V1Z"
                      fill="white"
                      stroke="black"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Screen Header */}
            <div className="h-8 bg-muted border-b border-borderColorPrimary flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 ml-4">
                <div className="w-full max-w-[200px] h-5 bg-background rounded-md text-start text-xs px-2 text-muted-foreground" >alle-ai.com</div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="h-[calc(100%-2rem)] flex">
              {/* Sidebar */}
              <div className="w-xl border-r-2 border-borderColorPrimaryColorPrimary bg-background">
                {/* Top Section */}
                <div className="p-2 border-borderColorPrimaryColorPrimary flex items-center gap-1 justify-between">
                  {/* New Chat Button */}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-green-500/10 text-white"
                  >
                    + NEW CHAT
                  </Button>

                  {/* LayoutGrid Button */}
                  <Button
                    variant="outline"
                    data-button="layout-grid"
                    ref={layoutGridButtonRef}
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 rounded-md border bg-green-500/10"
                  >
                    <LayoutGrid size={16} className="text-white" />
                  </Button>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-2 text-sm bg-green-500/10 text-white rounded-md">
                    <MessageSquare size={18} />
                    <span>Chat</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                    <ImageIcon size={18} />
                    <span>Image Generation</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                    <Music size={18} />
                    <span>Audio Generation</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                    <Video size={18} />
                    <span>Video Generation</span>
                  </div>
                </div>

                {/* Chat History Section */}
                <div className="mt-4 px-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>CHAT HISTORY</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No history available
                  </div>
                </div>
              </div>

              {/* Model Selection Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      className="bg-backgroundSecondary border border-borderColorPrimary rounded-lg shadow-lg w-[550px] p-4 max-h-[80vh] overflow-y-auto"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-foreground">Select Chat Models</h3>
                      </div>

                      {/* Grid of Models */}
                      <div className="grid grid-cols-4 gap-2">
                        {aiModels.map(model => (
                          <motion.button
                            key={model.id}
                            data-model-id={model.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleModel(model.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                              selectedModels.includes(model.id)
                                ? 'border-primary bg-accent'
                                : 'border-borderColorPrimary'
                            }`}
                          >
                            <div className="flex-shrink-0 w-6 h-6">
                              <Image
                                src={model.icon}
                                alt={model.provider}
                                width={100}
                                height={100}
                                className="rounded-sm"
                              />
                            </div>
                            <div className="flex-1 text-left overflow-auto scrollbar-none">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{model.name}</span>
                                {model.isPro && (
                                  <span className="text-yellow-500 text-[10px]">⚡</span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                {model.provider}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Footer Buttons */}
                      <div className="flex justify-end gap-2 mt-4 pt-2">
                        <button
                          onClick={() => setSelectedModels([])}
                          className="px-3 py-1.5 text-foreground border border-borderColorPrimary rounded-md transition-colors"
                        >
                          Remove all
                        </button>
                        <button
                          data-button="save-models"
                          onClick={() => setIsMenuOpen(false)}
                          className="px-3 py-1.5 bg-bodyColor text-white dark:text-black rounded-md text-xs font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Selected Models Display */}
                {selectedModels.length > 0 && (
                  <div className="">
                    <div className="p-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
                      {selectedModels.map(modelId => {
                        const model = getModelDetails(modelId);
                        if (!model) return null;
                        
                        return (
                          <div
                            key={modelId}
                            className="flex items-center gap-1 p-1 bg-background border border-borderColorPrimary rounded-md text-xs"
                          >
                            <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                              {model.name}
                            </span>
                            {model.isPro && (
                              <span className="text-yellow-500 text-[8px]">⚡</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col space-y-4">
                      {/* User message */}
                      {message.isUser && (
                        <div className="flex items-start gap-3 bg-backgroundSecondary rounded-lg py-1 px-3 items-center">
                          <div className="w-6 h-6 rounded-full bg-neutral-500 dark:bg-neutral-800 flex items-center justify-center">
                            <User size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-foreground">{message.content}</p>
                          </div>
                        </div>
                      )}

                      {/* Model responses or loading states */}
                      <div className="space-y-4">
                        {!isSummaryLoading && summary && (
                          <div 
                            className={`flex flex-col border ml-8 rounded-lg p-2 bg-transparent cursor-pointer transition-colors max-w-[130px] ${
                              selectedResponse?.modelId === 'summary' 
                                ? 'border-primary bg-primary/10' 
                                : 'border-borderColorPrimary'
                            }`}
                            data-button="summary"
                            onClick={() => setSelectedResponse(summary)}
                          >
                            <div className="flex gap-2 items-center">
                              <div className="w-4 h-4">
                                <Image
                                  src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-mini.webp" : "/svgs/logo-desktop-mini-dark.webp"}
                                  alt="Summary"
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                              </div>
                              <span className="text-xs text-foreground">Summary</span>
                            </div>
                          </div>
                        )}

                        {/* Summary loader */}
                        {isSummaryLoading && (
                          <div className="flex flex-col ml-8 rounded-lg p-2 bg-transparent transition-colors animate-pulse">
                            <div className="flex gap-2 items-center">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              <span className="text-xs text-foreground">Generating Summary...</span>
                            </div>
                          </div>
                        )}

                        {/* Response grid - without summary */}
                        <div className="grid grid-cols-4 gap-2 !mt-2 ml-8">
                          {isLoading && selectedModels.map((modelId) => {
                            const model = getModelDetails(modelId);
                            if (!model) return null;
                            
                            return (
                              <div key={modelId} className="flex flex-col gap-2 border border-borderColorPrimary rounded-lg p-3 bg-transparent">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 relative">
                                    <motion.div
                                      className="absolute inset-0"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <div className="w-full h-full rounded-full border-2 border-borderColorPrimary border-t-neutral-400" />
                                    </motion.div>
                                    <Image
                                      src={model.icon}
                                      alt={model.provider}
                                      width={24}
                                      height={24}
                                      className="rounded-full absolute inset-0 m-auto"
                                    />
                                  </div>
                                  <span className="text-[10px] text-foreground">{model.name}</span>
                                  {model.isPro && <span className="text-yellow-500 text-xs">⚡</span>}
                                </div>
                              </div>
                            );
                          })}
                          {!isLoading && modelResponses.map((response, index) => (
                            <div
                              key={response.modelId}
                              data-response={response.modelId}
                              onClick={() => setSelectedResponse(response)}
                              className={`p-4 rounded-lg border ${
                                selectedResponse?.modelId === response.modelId 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-borderColorPrimary bg-background'
                              } cursor-pointer transition-colors duration-200`}
                            >
                              {/* Loading state */}
                              {isLoading && (
                                <div className="animate-pulse">
                                  <div className="h-2 bg-muted rounded w-3/4 mb-2" />
                                  <div className="h-2 bg-muted rounded w-1/2" />
                                </div>
                              )}

                              {/* Response content */}
                              {!isLoading && (
                                <>
                                  <p className="text-xs text-foreground line-clamp-2">
                                    {response.content.length > 15 ? response.content.slice(0, 12) + '...' : response.content}
                                  </p>

                                  {/* Model info at bottom */}
                                  <div className="flex items-center mt-1">
                                    <div className="w-4 h-4">
                                      <Image
                                        src={getModelDetails(response.modelId)?.icon || ''}
                                        alt={getModelDetails(response.modelId)?.provider || ''}
                                        width={12}
                                        height={12}
                                        className="rounded-full"
                                      />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                      {getModelDetails(response.modelId)?.name}
                                    </span>
                                    {getModelDetails(response.modelId)?.isPro && (
                                      <span className="text-yellow-500 text-[8px]">⚡</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Selected response content (either summary tabs or model response) */}
                        {selectedResponse && (
                          <div className="flex flex-col mt-3 overflow-hidden">
                            {selectedResponse.modelId === 'summary' ? (
                              <div className="">
                                <div className="flex items-center gap-2 p-2">
                                  <div className="w-5 h-5">
                                    <Image
                                      src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-mini.webp" : "/svgs/logo-desktop-mini-dark.webp"}
                                      alt="AI Summary"
                                      width={20}
                                      height={20}
                                      className="rounded-full"
                                    />
                                  </div>
                                  <span className="text-sm font-medium">AI Summary</span>
                                </div>
                                
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                  <TabsList className="h-10 p-0 bg-transparent w-full flex items-center justify-start gap-2 px-4">
                                    <TabsTrigger 
                                      value="combination" 
                                      className="data-[state=active]:bg-backgroundSecondary rounded-md px-3 py-2 text-xs"
                                      data-tab="combination"
                                    >
                                      <span>Combination</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="consistencies"
                                      className="data-[state=active]:bg-backgroundSecondary rounded-md px-3 py-2 text-xs"
                                      data-tab="consistencies"
                                    >
                                      <span>Consistencies</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="inconsistencies"
                                      className="data-[state=active]:bg-backgroundSecondary rounded-md px-3 py-2 text-xs"
                                      data-tab="inconsistencies"
                                    >
                                      <span>Inconsistencies</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="overview"
                                      className="data-[state=active]:bg-backgroundSecondary rounded-md px-3 py-2 text-xs"
                                      data-tab="overview"
                                    >
                                      <span>Overview</span>
                                    </TabsTrigger>
                                  </TabsList>

                                  <div className="py-0 px-2"> {/* Common content area */}
                                    <TabsContent value="combination">
                                      <p className="text-sm text-foreground">{summaryTabs.combination}</p>
                                    </TabsContent>
                                    
                                    <TabsContent value="consistencies" className="flex gap-2">
                                      <CheckCircle2 className="w-5 h-5 text-green-500 text-sm" />
                                      <p className="text-sm text-green-500 bg-green-500/5 rounded-md">{summaryTabs.consistencies}</p>
                                    </TabsContent>
                                    
                                    <TabsContent value="inconsistencies" className="flex gap-2">
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                      <p className="text-sm bg-red-500/5 border-red-500/20 rounded-md">{summaryTabs.inconsistencies}</p>
                                    </TabsContent>
                                    
                                    <TabsContent value="overview">
                                      <p className="text-sm text-foreground">{summaryTabs.overview}</p>
                                    </TabsContent>
                                  </div>
                                </Tabs>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1 p-2">
                                  <div className="w-5 h-5">
                                    <Image
                                      src={getModelDetails(selectedResponse.modelId)?.icon || ''}
                                      alt={getModelDetails(selectedResponse.modelId)?.provider || ''}
                                      width={18}
                                      height={18}
                                      className="rounded-full"
                                    />
                                  </div>
                                  <span className="text-xs text-foreground">
                                    {getModelDetails(selectedResponse.modelId)?.name}
                                  </span>
                                </div>
                                <div className="ml-8">
                                  <p className="text-xs text-foreground">{selectedResponse.content}</p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prompt Input */}
                <div className="p-2">
                  <div className="flex gap-2 rounded-md border border-borderColorPrimary bg-background">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here..."
                      className="flex-1 text-sm px-4 py-2 focus:outline-none text-muted-foreground bg-transparent"
                      data-input="prompt"
                    />
                    <button 
                      data-button="send"
                      onClick={handleSend}
                      disabled={!prompt.trim() || selectedModels.length === 0}
                      className="py-1 px-2 text-white rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={24} className="text-white p-1 bg-black rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}