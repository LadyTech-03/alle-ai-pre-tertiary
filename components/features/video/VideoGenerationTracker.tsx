"use client";

import { useVideoGenerationStore } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useConversationStore } from '@/stores/models';

export const VideoGenerationTracker = () => {
  const { generatingVideos } = useVideoGenerationStore();
  const router = useRouter();
  const activeVideos = Object.values(generatingVideos);
  const [showCheck, setShowCheck] = useState(false);
  const [prevCount, setPrevCount] = useState(activeVideos.length);
  const { setConversationId, setPromptId, setGenerationType } = useConversationStore();

  
  // Calculate average progress
  const averageProgress = activeVideos.length > 0
    ? Math.round(activeVideos.reduce((acc, video) => acc + video.progress, 0) / activeVideos.length)
    : 0;

  useEffect(() => {
    // If we had videos and now we don't, show check mark
    if (prevCount > 0 && activeVideos.length === 0) {
      setShowCheck(true);
      const timer = setTimeout(() => {
        setShowCheck(false);
      }, 2000); // Hide after 2 seconds
      return () => clearTimeout(timer);
    }
    setPrevCount(activeVideos.length);
  }, [activeVideos.length, prevCount]);

  if (activeVideos.length === 0 && !showCheck) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center h-8 w-8 rounded-full bg-background border border-primary shadow-lg hover:scale-105 transition-transform group focus:outline-none overflow-hidden"
          aria-label="Show video generation status"
        >
          {/* Circular Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              className={`text-muted stroke-current ${showCheck ? 'border-green-500' : ''}`}
              strokeWidth="2"
              fill="none"
              r="15"
              cx="16"
              cy="16"
            />
            <motion.circle
              className={`text-yellow-500 stroke-current ${showCheck ? 'text-green-500' : ''}`}
              strokeWidth="2"
              fill="none"
              r="15"
              cx="16"
              cy="16"
              initial={{ strokeDashoffset: 94.2477796076938 }} // 2 * π * r
              animate={{
                strokeDashoffset: 94.2477796076938 * (1 - averageProgress / 100),
              }}
              strokeDasharray={94.2477796076938}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          
          <AnimatePresence mode="wait">
            {showCheck ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-primary"
              >
                <Check className="h-4 w-4 text-green-500" />
              </motion.div>
            ) : (
              <motion.span
                key="count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-sm font-semibold text-yellow-500"
              >
                {activeVideos.length}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-xl border border-borderColorPrimary bg-backgroundSecondary shadow-2xl">
        <div className="mb-3 flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-5 w-5 rounded-full border-2 border-yellow-500 border-t-transparent"
          />
          <span className="font-semibold text-base">
            Generating {activeVideos.length} video{activeVideos.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-4">
          {activeVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setGenerationType('load');
                router.push(`/video/res/${video.conversationId}`)
              }}
            >
              <Image
                src={video.modelImage}
                alt={video.modelName}
                width={32}
                height={32}
                className="rounded-full border"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{video.modelName}</span>
                  <span className="text-xs text-muted-foreground">
                    {video.progress}%
                  </span>
                </div>
                <Progress value={video.progress} className={`h-1 mt-2`} indicatorClassName={`bg-yellow-500`} />
              </div>
              {video.status === 'failed' && (
                <span className="text-destructive text-xs font-semibold ml-2">Failed</span>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};