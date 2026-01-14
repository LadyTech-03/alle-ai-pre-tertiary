"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MessageSquare, Image as ImageIcon, Music, Video, ChevronDown, X, LayoutGrid, User, ArrowUp, CheckCircle2, ChevronRight, Copy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from 'next-themes';


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
    id: "dalle-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    icon: "/models/dall-e.webp"
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    provider: "Stability AI",
    icon: "/models/stability-ai.webp"
  },
  {
    id: "midjourney",
    name: "Midjourney",
    provider: "Midjourney",
    icon: "/models/midjourney.webp"
  },
  {
    id: "titan",
    name: "Titan",
    provider: "Amazon",
    icon: "/models/amazon.webp"
  }
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
  imageUrl?: string;
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

// Add new interfaces for image responses
interface ImageResponse {
  modelId: string;
  imageUrl: string;
}

interface PlatformPreviewProps {
  onAnimationComplete?: () => void;
}

// Add these placeholder image URLs at the top with other constants
const defaultImageResponses = {
  'dalle-3': "/placeholders/dalle-placeholder.jpg",
  'stable-diffusion': "/placeholders/sd-placeholder.jpg",
  'midjourney': "/placeholders/midjourney-placeholder.jpg",
  'titan': "/placeholders/titan-placeholder.jpg"
};

export function PlatformImagePreview({ onAnimationComplete }: PlatformPreviewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [modelResponses, setModelResponses] = useState<ModelResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ModelResponse | null>(null);
  const [summary, setSummary] = useState<ModelResponse | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const screenRef = useRef<HTMLDivElement>(null);
  const layoutGridButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    
    // Show loading state for each model
    const loadingResponses = selectedModels.map(modelId => ({
      modelId,
      content: "Generating image...",
      isLoading: true
    }));
    
    setModelResponses(loadingResponses);
    
    // Simulate image generation with different delays for each model
    setTimeout(() => {
      const imageResponses = {
        'dalle-3': "/images/dall-e-3.jpg",
        'stable-diffusion': "/images/stable-diffusion.jpg",
        'midjourney': "/images/midjourney.jpg",
        'titan': "/images/titan-image-generator.jpg"
      };

      const responses = selectedModels.map(modelId => ({
        modelId,
        content: "", // Empty content for image responses
        imageUrl: imageResponses[modelId as keyof typeof imageResponses] || "/fallback-image.jpg"
      }));
      
      setModelResponses(responses);
      setIsLoading(false);
      
      // Select the first response by default
      if (responses.length > 0) {
        setSelectedResponse(responses[0]);
      }
    }, 3000); // Simulate 3 second generation time
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

  // Add a helper function to scroll to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto-start demo on mount
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      if (!screenRef.current) return;
      const screenRect = screenRef.current.getBoundingClientRect();
      
      const centerPosition = {
        x: screenRect.width / 2,
        y: screenRect.height / 2
      };
      
      const modelsToSelect = ['dalle-3', 'stable-diffusion', 'midjourney',   'titan']; // Only select 2 models
      const demoPrompt = "Generate a futuristic cityscape";
      
      // Animation constants
      const CURSOR_ANIMATION_DURATION = 500;
      const HOVER_DURATION = 500;
      const MODEL_INTERVAL = 1200;
      const TYPING_SPEED = 100;
      
      setCursorPosition(centerPosition);
      setIsDemoActive(true);
      
      // Move to LayoutGrid button and select models
      setTimeout(() => {
        const layoutGridButton = layoutGridButtonRef.current;
        if (layoutGridButton) {
          const buttonPosition = getElementPosition(layoutGridButton);
          setCursorPosition(buttonPosition);
          
          setTimeout(() => {
            setIsMenuOpen(true);
            
            // Select models
            modelsToSelect.forEach((modelId, index) => {
              setTimeout(() => {
                const modelElement = document.querySelector(`[data-model-id="${modelId}"]`);
                if (modelElement) {
                  const modelPosition = getElementPosition(modelElement as HTMLElement);
                  setCursorPosition(modelPosition);
                  
                  setTimeout(() => {
                    (modelElement as HTMLElement).click();
                  }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
                }
              }, 500 + (index * MODEL_INTERVAL));
            });

            // Click save after selecting models
            const finalDelay = 500 + (modelsToSelect.length * MODEL_INTERVAL);
            setTimeout(() => {
              const saveButton = document.querySelector('[data-button="save-models"]');
              if (saveButton) {
                const saveButtonPosition = getElementPosition(saveButton as HTMLElement);
                setCursorPosition(saveButtonPosition);
                
                setTimeout(() => {
                  (saveButton as HTMLElement).click();
                  
                  // Move to prompt input
                  setTimeout(() => {
                    const promptInput = document.querySelector('[data-input="prompt"]');
                    if (promptInput) {
                      const promptPosition = getElementPosition(promptInput as HTMLElement);
                      setCursorPosition(promptPosition);
                      
                      // Type the prompt
                      setTimeout(() => {
                        let currentText = '';
                        [...demoPrompt].forEach((char, index) => {
                          setTimeout(() => {
                            currentText += char;
                            setPrompt(currentText);
                          }, index * TYPING_SPEED);
                        });
                        
                        // Click generate after typing
                        const typingDuration = demoPrompt.length * TYPING_SPEED;
                        setTimeout(() => {
                          const generateButton = document.querySelector('[data-button="send"]');
                          if (generateButton) {
                            const generateButtonPosition = getElementPosition(generateButton as HTMLElement);
                            setCursorPosition(generateButtonPosition);
                            
                            setTimeout(() => {
                              (generateButton as HTMLElement).click();
                              
                              // Wait for loading (2s) + images display (2s) + scroll
                              setTimeout(() => {
                                scrollToBottom();
                                // Complete animation after scroll
                                setTimeout(() => {
                                  if (onAnimationComplete) {
                                    onAnimationComplete();
                                  }
                                }, 500); // Short delay after scroll
                              }, 4000); // 2s loading + 2s after images
                            }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
                          }
                        }, typingDuration + HOVER_DURATION);
                      }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
                    }
                  }, CURSOR_ANIMATION_DURATION + 300);
                }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
              }
            }, finalDelay);
          }, CURSOR_ANIMATION_DURATION + HOVER_DURATION);
        }
      }, 300);
    }, 1000);

    return () => clearTimeout(startTimeout);
  }, []);

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
                  <div className="w-full max-w-[200px] h-5 bg-background rounded-md text-start text-xs px-2 text-muted-foreground" >alle-ai.com</div>
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
                <div className="w-full max-w-[200px] h-5 bg-background rounded-md" />
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
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-purple-500/10 text-purple-500"
                  >
                    + NEW IMAGE
                  </Button>

                  {/* LayoutGrid Button */}
                  <Button
                    variant="outline"
                    data-button="layout-grid"
                    ref={layoutGridButtonRef}
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 rounded-md border bg-purple-500/10"
                  >
                    <LayoutGrid size={16} className="text-purple-500" />
                  </Button>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-2 text-sm rounded-md">
                    <MessageSquare size={18} />
                    <span>Chat</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground bg-purple-500/10 text-purple-500 rounded-md">
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
                {/* Selected Models Display - Moved above prompt input */}
                {selectedModels.length > 0 && (
                  <div className="">
                    <div className="p-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
                      {selectedModels.map(modelId => {
                        const model = getModelDetails(modelId);
                        if (!model) return null;
                        
                        return (
                          <div
                            key={modelId}
                            className="flex items-center gap-1 p-0.5 bg-background border border-borderColorPrimary rounded-md text-xs"
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

                {/* Prompt Input - Moved below selected models */}
                <div className="px-6 mt-2">
                  <div className="flex items-center gap-2 rounded-md border border-borderColorPrimary bg-background">
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
                      className="h-8 p-2 bg-black text-white rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div 
                  ref={contentRef}
                  className="flex-1 p-4 space-y-4 overflow-y-auto"
                >
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col space-y-4">
                      {/* User message */}
                      {message.isUser && (
                        <div className="flex justify-between gap-3 py-1 px-8 items-center">
                          <div className="flex-1">
                            <p className="text-xs text-foreground">{message.content}</p>
                          </div>
                          <Copy size={16} className="text-muted-foreground" />
                        </div>
                      )}

                      {/* Generated Images Grid */}
                      <div className="grid grid-cols-2 gap-4 px-8"> {/* Changed to 2 columns */}
                        {isLoading ? (
                          // Loading states
                          selectedModels.map((modelId) => {
                            const model = getModelDetails(modelId);
                            if (!model) return null;
                            
                            return (
                              <div 
                                key={modelId} 
                                className="aspect-square relative border border-borderColorPrimary rounded-lg overflow-hidden w-full" // Removed max-width constraint
                              >
                                <div className="absolute inset-0 flex items-center justify-center bg-background">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 relative">
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
                                        width={32}
                                        height={32}
                                        className="rounded-full absolute inset-0 m-auto"
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Generating...</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Generated images
                          modelResponses.map((response) => {
                            const model = getModelDetails(response.modelId);
                            if (!model) return null;
                            
                            return (
                              <div
                                key={response.modelId}
                                className="aspect-square relative border border-borderColorPrimary rounded-lg overflow-hidden w-full"
                              >
                                {response.imageUrl && (
                                  <Image
                                    src={response.imageUrl}
                                    alt={`Generated by ${model.name}`}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-md px-2 py-1">
                                  <div className="w-4 h-4">
                                    <Image
                                      src={model.icon}
                                      alt={model.provider}
                                      width={16}
                                      height={16}
                                      className="rounded-full"
                                    />
                                  </div>
                                  <span className="text-[10px] text-white">{model.name}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}