// components/ui/TutorialModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react';
import { useTutorialStore } from '@/stores';

// Define the slide interface for type safety
export interface TutorialSlide {
  id: string;
  title: string;
  description: string | string[]; // Now accepts a string or array of strings
  imageUrl: string;
  imageAlt: string;
}

// Props for the TutorialModal component
interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: TutorialSlide[];
  onComplete?: () => void;
  showSkip?: boolean;
}

// Sample slides for demonstration
export const sampleTutorialSlides: TutorialSlide[] = [
  {
    id: 'slide-1',
    title: 'Welcome to Alle-AI',
    description: [
        '1. Chat, Generate Images, Audio, and Videos with multiple models simultaneously',
        '2. Open Models menu',
        '3. Select AI Models',
    ],
    imageUrl: '/images/1.webp',
    imageAlt: 'Welcome to Alle-AI'
  },
  {
    id: 'slide-2',
    title: 'Chat, Combine and Compare',
    description: [
      '1. Combine multiple models and get one  bestunified response',
      '2. Compare model responses and fact-check for accuracy and authenticity.',
    ],
    imageUrl: '/images/2.webp',
    imageAlt: 'Chat, Combine and Compare'
  },
  {
    id: 'slide-3',
    title: 'Generate Images',
    description: [
      'Your limitations are only your imagination. Create stunning images with multiple models simultaneously.',
    ],
    imageUrl: '/images/3.webp',
    imageAlt: 'Generate Images'
  },
  {
    id: 'slide-4',
    title: 'Audio (TTS, STT, Audio Generation)',
    description: [
      '1. Convert your text to speech',
      '2. Transcribe audio files',
      '3. Generate audios ( beats, instruments, voices, etc.)'
    ],
    imageUrl: '/images/4.webp',
    imageAlt: 'Generate auido'
  },
  {
    id: 'slide-5',
    title: "Generate Videos",
    description: [
      'Harness the power of multiple Video Generation models and increase your creativity.',
    ],
    imageUrl: '/images/5.webp',
    imageAlt: 'Generate videos'
  },
  {
    id: 'slide-6',
    title: "Projects is here! 😋",
    description: [
      'Organize Your Work with Projects! Group related chats, files, set custom instructions in dedicated workspaces and leverage multiple models for accurate results.',
    ],
    imageUrl: '/images/6.webp',
    imageAlt: 'Projects'
  },
];

export function TutorialModal({ 
  isOpen, 
  onClose, 
  slides = sampleTutorialSlides,
  onComplete,
  showSkip = true 
}: TutorialModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for initial
  const { setCompleted } = useTutorialStore();

  // Get the current slide
  const currentSlide = slides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;

  // Update to mark as completed
  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  // Handle navigation
  const goToNextSlide = () => {
    if (!isLastSlide) {
      setDirection(1);
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // Mark as completed when reaching the last slide
      handleComplete();
    }
  };

  const goToPrevSlide = () => {
    if (!isFirstSlide) {
      setDirection(-1);
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
  };

  // Handle skip button - also mark as completed
  const handleSkip = () => {
    setCompleted(true);
    onClose();
  };

  // Reset slide index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      setDirection(0);
    }
  }, [isOpen]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Helper function to render description
  const renderDescription = (description: string | string[]) => {
    if (typeof description === 'string') {
      return <p className="text-muted-foreground">{description}</p>;
    }
    
    return (
      <div className="space-y-3">
        {description.map((line, index) => (
          <p key={index} className="text-muted-foreground">{line}</p>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={()=> {
    setCompleted(true);
      onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-backgroundSecondary">
        <DialogHeader className='p-2 pb-0'>
          <DialogTitle className='text-lg font-semi-bold'>What&apos;s New?</DialogTitle>
        </DialogHeader>
        <div className="relative w-full">

          {/* Slide indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentSlideIndex 
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide content with animations */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {/* Image section */}
              <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-primary/10 to-background/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-[450px] h-full flex items-center justify-center">
                    <Image 
                      src={currentSlide.imageUrl} 
                      alt={currentSlide.imageAlt}
                      className="object-contain max-h-full rounded-lg shadow-lg"
                      width={450}
                      height={300}
                      onError={(e) => {
                        // Fallback for missing images
                        e.currentTarget.src = '/svgs/logo-desktop-mini.webp';
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Text content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3">{currentSlide.title}</h2>
                {renderDescription(currentSlide.description)}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center p-6 pt-0">
            <div className="flex-1">
              {!isFirstSlide && (
                <Button 
                  variant="ghost" 
                  onClick={goToPrevSlide}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            
            {showSkip && !isLastSlide && (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
            
            <div className="flex-1 flex justify-end">
              <Button 
                onClick={goToNextSlide}
                className="flex items-center"
              >
                {isLastSlide ? 'Get Started' : 'Next'}
                {!isLastSlide && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component to trigger the tutorial
export function TutorialButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="rounded-full"
      title="Show Tutorial"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
}