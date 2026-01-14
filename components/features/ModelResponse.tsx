'use client';

import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, ThumbsUp, ThumbsDown, Copy, RefreshCw, Globe, ZoomIn, X, ChevronLeft, ChevronRight, Circle, Brain, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner"

import { AdCard } from "@/components/features/AdCard";
import { SAMPLE_ADS } from "@/lib/constants"
import { useVoiceStore } from "@/stores/index";
import { motion } from 'framer-motion';
import { SourcesWindow } from "@/components/SourcesWindow";
import { Source } from '@/lib/types';
import { create } from 'zustand';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { CustomLink } from '@/components/markdown/CustomLink'
import { YouTubeEmbed } from '@/components/markdown/YouTubeEmbed';
import { Components } from 'react-markdown';
import { SourcesPill } from '@/components/features/SourcesPill';
import type { HTMLAttributes, ImgHTMLAttributes, AnchorHTMLAttributes } from 'react';
import React from "react";
import { MarkdownImage } from '@/components/markdown/MarkdownImage';
import { cn } from "@/lib/utils";
import { 
  MarkdownTable, 
  MarkdownThead, 
  MarkdownTr, 
  MarkdownTh, 
  MarkdownTd 
} from '@/components/markdown/MarkdownTable';
import { MarkdownCode } from '@/components/markdown/MarkdownCode';


import { SummaryContent } from "./SummaryContent";
import { SUMMARY_DATA } from "@/lib/constants";
import { useSettingsStore, useAuthStore } from "@/stores";
import { chatApi, LikeState } from "@/lib/api/chat";
import { useTextSizeStore } from "@/stores/index";
import { FeedbackTooltip } from "../ui/modals/dislike-feedback-tooltip";

// Import the Shadcn Collapsible components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ModelResponseProps {
  model: string;
  content: string | undefined;
  model_img: string | string[];
  responseId: string | undefined;
  sessionId: string;
  feedback?: 'liked' | 'disliked' | null;
  hasDislikeFeedback?: boolean;
  onFeedbackChange: (responseId: string, feedback: 'liked' | 'disliked' | null, hasDislikeFeedback?: boolean) => void;
  onRegenerate?: (responseId: string) => void;
  webSearchEnabled?: boolean;
  sources?: Source[];
  onSourcesClick: (responseId: string, sources: Source[]) => void;
  settings?: {
    personalizedAds: boolean;
  };
}

interface SourcesWindowState {
  isOpen: boolean;
  activeResponseId: string | null;
  sources: Source[];
  setOpen: (isOpen: boolean) => void;
  setSources: (responseId: string, sources: Source[]) => void;
  close: () => void;
}

export const useSourcesWindowStore = create<SourcesWindowState>((set) => ({
  isOpen: false,
  activeResponseId: null,
  sources: [],
  setOpen: (isOpen) => set({ isOpen }),
  setSources: (responseId, sources) => set({ 
    activeResponseId: responseId, 
    sources,
    isOpen: true 
  }),
  close: () => set({ isOpen: false }),
}));

// Define proper types for the component props
type MarkdownComponentProps = {
  node?: any;
  children?: React.ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>;

type LinkProps = {
  node?: any;
  children?: React.ReactNode;
  href?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & HTMLAttributes<HTMLElement>;

interface ImageGroup {
  id: string;
  images: Array<{ src: string; alt: string; }>;
}

let currentGroup: ImageGroup | null = null;
const imageGroups = new Map<string, ImageGroup>();

// Modify the isImageUrl function to be more robust
function isImageUrl(url: string): boolean {
  // Check for common image file extensions
  return /\.(jpeg|jpg|gif|png|svg|webp|bmp|tiff)(\?.*)?$/i.test(url);
}

// Modify the extractImagesFromMarkdown function to also find linked images
function extractImagesFromMarkdown(content: string): { src: string; alt: string; }[] {
  const images: { src: string; alt: string; }[] = [];
  
  // Extract standard markdown images ![alt](url)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2] || ''
    });
  }
  
  // Extract linked images [alt](image-url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.(jpeg|jpg|gif|png|svg|webp|bmp|tiff)(\?[^)]*)?)\)/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2] || ''
    });
  }
  
  return images;
}

// Add this helper function to extract think content from markdown
function extractThinkContent(content: string): { thinkContent: string | null, restContent: string } {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const match = content?.match(thinkRegex);
  
  if (match) {
    const thinkContent = match[1];
    const restContent = content.replace(thinkRegex, '');
    return { thinkContent, restContent };
  }
  
  return { thinkContent: null, restContent: content || '' };
}

export function ModelResponse({ 
  model, 
  content, 
  model_img, 
  responseId,
  sessionId,
  feedback,
  hasDislikeFeedback = false,
  onFeedbackChange,
  onRegenerate,
  webSearchEnabled = false,
  sources = [],
  onSourcesClick,
  settings
}: ModelResponseProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  ;
  const voiceSettings = useVoiceStore((state) => state.settings);
  const availableVoices = useVoiceStore((state) => state.availableVoices);
  const initVoices = useVoiceStore((state) => state.initVoices);
  const { setSources, close } = useSourcesWindowStore();
  const [showAllImages, setShowAllImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textSize = useTextSizeStore((state) => state.size);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const dislikeButtonRef = useRef<HTMLButtonElement>(null);
  const { token, isAuthenticated } = useAuthStore();


  useEffect(() => {
    // Initialize voices when component mounts
    initVoices();
    
    // Update voices when they become available
    speechSynthesis.onvoiceschanged = initVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [initVoices]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);

    // Remove markdown formatting
    const textToSpeak = content && content
      // Remove image syntax
      .replace(/!\[(.*?)\]\((.*?)\)/g, '')
      // Remove link syntax but keep link text
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
      .replace(/(\*|_)(.*?)(\*|_)/g, '$2')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes
      .replace(/^\s*>\s+/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove think blocks
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      // Replace multiple newlines with a single one
      .replace(/\n\s*\n/g, '\n')
      // Trim whitespace
      .trim();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Apply voice settings
      if (voiceSettings.voice) {
        const selectedVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voice);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      
      utterance.pitch = voiceSettings.pitch;
      utterance.rate = voiceSettings.rate;
      utterance.volume = voiceSettings.volume;
      
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = async () => {
     // Remove markdown formatting
  const textToCopy = content && content
  // Remove image syntax
  .replace(/!\[(.*?)\]\((.*?)\)/g, '')
  // Remove link syntax but keep link text
  .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
  // Remove headers (but keep the text)
  .replace(/^#{1,6}\s+(.*?)$/gm, '$1')
  // Remove bold/italic but keep the text
  .replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
  .replace(/(\*|_)(.*?)(\*|_)/g, '$2')
  // Remove code block syntax but keep the code
  .replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, '$1')
  // Remove inline code backticks but keep the code
  .replace(/`([^`]+)`/g, '$1')
  // Remove blockquotes marker but keep the text
  .replace(/^\s*>\s+(.*?)$/gm, '$1')
  // Remove HTML tags
  .replace(/<[^>]*>/g, '')
  // Remove think blocks
  .replace(/<think>[\s\S]*?<\/think>/g, '')
  // Clean up extra whitespace
  .replace(/\n\s*\n/g, '\n\n')
  .trim();
    await navigator.clipboard.writeText(textToCopy || '' );
    toast.success('Copied');
  };

  const handleFeedback = async (newState: 'liked' | 'disliked' | null) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // If clicking the same button, set to 'none'
      const state = newState === feedback ? 'none' : newState;

      
      const response = await chatApi.updateLikeState(responseId || '', state as LikeState);
      
      if (response.status) {
        onFeedbackChange(
          responseId || '', 
          state === 'none' ? null : state as 'liked' | 'disliked',
          response.hasDislikeFeedback
        );
        
        // If we're setting to disliked and hasDislikeFeedback is false, show modal
        if (state === 'disliked' && !response.hasDislikeFeedback) {
          setShowFeedbackModal(true);
        }
        
        if (state !== 'none') {
          toast.success(`Response ${state === 'liked' ? 'liked' : 'disliked'}`);
        }
      }
    } catch (error) {
      // toast.error('Something went wrong, please try again')
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoize the components object
  const components: Components = useMemo(() => ({
    a: ({ children, href, ...props }: LinkProps) => {
      if (!href) return <>{children}</>;
      
      // Check if the link is a YouTube video
      if (href.match(/youtube\.com|youtu\.be/)) {
        return (
          <>
            <br />
            <YouTubeEmbed key={href} url={href} />
            <br />
          </>
        );
      }
      
      // Check if the link points to an image
      if (isImageUrl(href)) {
        return (
          <MarkdownImage 
            src={href} 
            alt={typeof children === 'string' ? children : 'Image'} 
          />
        );
      }
      
      // Default link rendering
      return <CustomLink href={href} {...props}>{children}</CustomLink>;
    },
    
    p: ({ children, ...props }: MarkdownComponentProps) => {
      const childArray = React.Children.toArray(children);
      const imageCount = childArray.filter(child => 
        React.isValidElement(child) && child.type === 'img'
      ).length;

      if (imageCount > 0) {
        return (
          <div className={cn(
            "my-2 gap-2",
            imageCount > 1 ? "grid grid-cols-3 sm:grid-cols-4 max-w-xl" : "block max-w-[150px]"
          )}>
            {children}
          </div>
        );
      }

      return <p className="my-4 leading-relaxed" style={{ fontSize: `${textSize}px` }} {...props}>{children}</p>;
    },
    
    img: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { node?: any }) => {
      if (!src) return null;
      return <MarkdownImage src={src} alt={alt} />;
    },
    
    code: ({ inline, className, children, ...props }: CodeProps) => {

      
      // Default code handling
      return (
        <MarkdownCode inline={inline} className={className} {...props}>
          {children}
        </MarkdownCode>
      );
    },
    
    blockquote: ({ children, ...props }: MarkdownComponentProps) => (
      <blockquote 
        className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    ),
    
    table: ({ children, ...props }: MarkdownComponentProps) => (
      <MarkdownTable {...props}>{children}</MarkdownTable>
    ),
    
    thead: ({ children, ...props }: MarkdownComponentProps) => (
      <MarkdownThead {...props}>{children}</MarkdownThead>
    ),
    
    tr: ({ children, ...props }: MarkdownComponentProps) => (
      <MarkdownTr {...props}>{children}</MarkdownTr>
    ),
    
    th: ({ children, ...props }: MarkdownComponentProps) => (
      <MarkdownTh {...props}>{children}</MarkdownTh>
    ),
    
    td: ({ children, ...props }: MarkdownComponentProps) => (
      <MarkdownTd {...props}>{children}</MarkdownTd>
    ),

    ul: ({ children, ...props }: MarkdownComponentProps) => (
      <ul className="list-disc list-inside my-4 space-y-2" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }: MarkdownComponentProps) => (
      <ol className="list-decimal list-inside my-4 space-y-2" {...props}>
        {children}
      </ol>
    ),

    li: ({ children, ...props }: MarkdownComponentProps) => (
      <li 
        className="leading-relaxed marker:text-foreground marker:mr-2" 
        style={{ fontSize: `${textSize}px` }}
        {...props}
      >
        {children}
      </li>
    ),

  }), [textSize]);

  // Get display limit based on screen size
  const getDisplayLimit = () => {
    if (typeof window === 'undefined') return 2; // Default for SSR
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3; // md
    return 2; // Default (sm and below)
  };

  // Extract think content and regular content
  const { thinkContent, restContent } = useMemo(() => 
    extractThinkContent(content || ''), 
    [content]
  );

  // Extract images from content (use restContent to avoid extracting from think blocks)
  const images = useMemo(() => extractImagesFromMarkdown(restContent || ''), [restContent]);
  
  // Calculate visible images and remaining count
  const displayLimit = getDisplayLimit();
  const visibleImages = showAllImages ? images : images.slice(0, displayLimit);
  const remainingCount = images.length - displayLimit;

  // Remove images from content to prevent double rendering
  const textContent = useMemo(() => {
    let processedContent = restContent;
    // Remove markdown image syntax
    processedContent = processedContent?.replace(/!\[(.*?)\]\((.*?)\)/g, '');
    // Remove links to images (but keep other links)
    processedContent = processedContent?.replace(/\[([^\]]+)\]\(([^)]+\.(jpeg|jpg|gif|png|svg|webp|bmp|tiff)(\?[^)]*)?)\)/gi, '');
    return processedContent;
  }, [restContent]);

  return (
    <Card className="bg-transparent border-none shadow-none p-4">
      <div className="flex items-start gap-6 mb-3">
        <div className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center">
          {Array.isArray(model_img) ? (
            <div className="flex -space-x-6">
              {model_img
                .filter((img): img is string => Boolean(img) && img !== '')
                .map((img, index) => (
                  <Image 
                    key={index}
                    className="rounded-full hidden sm:flex"
                    src={img} 
                    alt={`${model} model ${index + 1}`}
                    width={32} 
                    height={32}
                    style={{
                      zIndex: model_img.length - index,
                      transform: `translateX(${index * 2}px)`
                    }}
                  />
                ))}
            </div>
          ) : (
            model_img && model_img !== '' ? (
              <Image 
                className="rounded-full hidden sm:flex" 
                src={model_img} 
                alt={model} 
                width={32} 
                height={32} 
              />
            ) : null
          )}
        </div>
        <div className="flex flex-col flex-1">
          <span className={` sm:flex text-sm text-bold mb-2 ${Array.isArray(model_img) ? model_img.length > 3 ? "ml-4 mt-1" : "" : ""}`}>{model}</span>
          
          {/* Render think content if it exists */}
          {thinkContent && (
            <Collapsible
              open={isThinkingOpen}
              onOpenChange={setIsThinkingOpen}
              className="my-4 rounded-lg overflow-hidden border border-borderColorPrimary"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-1 hover:bg-secondary transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  {/* <div className="p-2 rounded-full bg-background/80">
                    <Brain className="h-4 w-4 text-foreground/70" />
                  </div> */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-foreground/90">
                      Thinking Process
                    </h3>
                  </div>
                </div>
                <div className="mr-2">
                  <motion.div
                    animate={{ rotate: isThinkingOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </motion.div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-gradient-to-b from-secondary/30 to-transparent"
                >
                  <div className="space-y-3 italic">
                    {thinkContent.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <div 
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="mt-1.5">
                            <Circle className="h-1.5 w-1.5 text-foreground/30 font-bold" />
                          </div>
                          <p className="flex-1 text-muted-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Render images grid if there are images */}
          {images.length > 0 && (
            <div className={cn(
              "my-4 gap-2",
              showAllImages 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            )}>
              {visibleImages.map((img, index) => {
                const isLastImage = !showAllImages && index === displayLimit - 1;
                const showOverlay = isLastImage && remainingCount > 0;

                return (
                  <div 
                    key={`${img.src}-${index}`}
                    className="relative"
                    onClick={() => showOverlay && setShowAllImages(true)}
                  >
                    <MarkdownImage 
                      src={img.src}
                      alt={img.alt}
                      className={cn(
                        showOverlay && "cursor-pointer"
                      )}
                      showOverlay={showOverlay}
                      overlayContent={`+${remainingCount}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Render markdown content */}
          {model === "AI Summary" ? (
            <SummaryContent
              summary={SUMMARY_DATA.summary}
              consistencies={SUMMARY_DATA.consistencies}
              inconsistencies={SUMMARY_DATA.inconsistencies}
              finalAnswer={SUMMARY_DATA.finalAnswer}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none relative space-y-4">
              <ReactMarkdown
                key={`${responseId}-${textContent}`}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={components}
                className="text-base text-accent-foreground 
                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                          [&_a]:no-underline [&_p>a]:before:content-[''] [&_p>a]:after:content-['']
                          [&_pre]:my-4
                          [&_code]:text-sm
                          space-y-4"
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-8 w-8 relative ${
                isSpeaking ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={handleSpeak}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </>
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8",
                    feedback === 'liked' ? "text-green-500 bg-green-500/10" : "text-muted-foreground",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleFeedback('liked')}
                  disabled={isSubmitting}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                
                <Button
                  ref={dislikeButtonRef}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8",
                    feedback === 'disliked' ? "text-red-500 bg-red-500/10" : "text-muted-foreground",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleFeedback('disliked')}
                  disabled={isSubmitting}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 text-muted-foreground"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 text-muted-foreground"
              onClick={() => onRegenerate?.(responseId || '')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button> */}

            {sources && sources.length > 0 && (
            <div className="">
              <SourcesPill 
                onClick={() => onSourcesClick(responseId || '', sources)} 
                sources={sources}
              />
            </div>
          )}
          </div>
          
          {/* Only render AdCard if personalizedAds is enabled in settings */}
          {settings?.personalizedAds && <AdCard ads={SAMPLE_ADS} />}
        </div>
      </div>
      
      {/* Feedback Tooltip */}
      <FeedbackTooltip
        responseId={responseId || ''}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        triggerRef={dislikeButtonRef}
        onFeedbackSubmitted={() => {
          // Update the feedback state to 'disliked' after successful feedback submission
          if (feedback !== 'disliked') {
            handleFeedback('disliked');
          }
        }}
        onDislikeStateChange={(responseId, state, hasDislikeFeedback) => {
          // Update the feedback state when dislike state changes
          onFeedbackChange(responseId, state, hasDislikeFeedback);
        }}
      />
    </Card>
  );
}