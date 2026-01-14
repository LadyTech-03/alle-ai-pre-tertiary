"use client";

import { useEffect, useRef } from 'react';
import { useVideoGenerationStore } from '@/stores';
import { chatApi } from '@/lib/api/chat';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/stores/models';

export const VideoGenerationService = () => {
  const { 
    generatingVideos, 
    updateVideoStatus, 
    removeGeneratingVideo,
    isPolling,
    setPolling 
  } = useVideoGenerationStore();
  const router = useRouter();
  const { setConversationId, setPromptId, setGenerationType } = useConversationStore();
  
  // Keep track of completed videos to prevent duplicate toasts
  const completedVideos = useRef<Set<string>>(new Set());
  // Keep track of failed videos to prevent continued polling
  const failedVideos = useRef<Set<string>>(new Set());
  // Keep track of API failure counts to stop polling after multiple failures
  const apiFailureCount = useRef<Record<string, number>>({});
  // Maximum number of consecutive API failures before giving up
  const MAX_API_FAILURES = 3;

  useEffect(() => {
    // Reset refs when videos change
    completedVideos.current = new Set();
    failedVideos.current = new Set();
    apiFailureCount.current = {};
  }, []);

  useEffect(() => {
    if (Object.keys(generatingVideos).length === 0) {
      setPolling(false);
      return;
    }

    setPolling(true);
    const intervalId = setInterval(async () => {
      const activeVideoIds = Object.keys(generatingVideos).filter(id => !failedVideos.current.has(id));
      
      if (activeVideoIds.length === 0) {
        clearInterval(intervalId);
        setPolling(false);
        return;
      }

      const statusChecks = activeVideoIds.map(async (id) => {
        const video = generatingVideos[id];
        if (!video || completedVideos.current.has(id)) return;

        try {
          const response = await chatApi.checkVideoGenerationStatus(video.responseId);
          
          // Reset API failure count on successful API call
          apiFailureCount.current[id] = 0;
          
          if (response.data.status.toLowerCase() === "completed" && response.data.url) {
            // Only show toast and update if not already completed
            if (!completedVideos.current.has(id)) {
              completedVideos.current.add(id);
              updateVideoStatus(id, { 
                status: 'completed',
                progress: 100 
              });
              
              toast.success(`${video.modelName} has finished generating your video!`, {
                action: {
                  label: "View",
                  onClick: () => {
                    setGenerationType('load');
                    router.push(`/video/res/${video.conversationId}`);
                  },
                },
              });
              
              removeGeneratingVideo(id);
            }
          } else if (response.data.status.toLowerCase() === "failed" || response.data.status.toLowerCase() === "filter_error") {
            // Mark as failed and stop polling for this video
            failedVideos.current.add(id);
            updateVideoStatus(id, { 
              status: 'failed',
              error: response.data.message || 'Generation failed'
            });
            
            toast.error(`Failed to generate video with ${video.modelName}`, {
              action: {
                label: "View",
                onClick: () => {
                  setGenerationType('load');
                  router.push(`/video/res/${video.conversationId}`);
                },
              },
            });
            
            removeGeneratingVideo(id);
          } else {
            // Update progress for active generations
            const currentProgress = video.progress || 0;
            const newProgress = Math.min(95, currentProgress + 5);
            updateVideoStatus(id, { progress: newProgress });
          }
        } catch (error) {
          // console.error(`Error checking status for video ${id}:`, error);
          
          // Increment API failure count
          apiFailureCount.current[id] = (apiFailureCount.current[id] || 0) + 1;
          
          // After MAX_API_FAILURES consecutive failures, stop polling this video
          if (apiFailureCount.current[id] >= MAX_API_FAILURES) {
            failedVideos.current.add(id);
            updateVideoStatus(id, { 
              status: 'failed',
              error: 'Connection error: Failed to check video status'
            });
            
            // toast.error(`Connection error with ${video.modelName} video generation`, {
            //   description: "Failed to check status after multiple attempts",
            //   action: {
            //     label: "View",
            //     onClick: () => {
            //       setGenerationType('load');
            //       router.push(`/video/res/${video.conversationId}`);
            //     },
            //   },
            // });
            
            removeGeneratingVideo(id);
          }
        }
      });

      await Promise.all(statusChecks);
    }, 5000);

    return () => {
      clearInterval(intervalId);
      // Reset refs on cleanup
      completedVideos.current = new Set();
      failedVideos.current = new Set();
      apiFailureCount.current = {};
    };
  }, [generatingVideos]);

  return null;
};