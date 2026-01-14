"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useModelsStore } from "@/stores/models";
import { useVideoGenerationStore } from "@/stores";
import { Loader } from "lucide-react";
import Image from "next/image";

interface VideoSkeletonProps {
  modelId: string;
  progress?: number;
  isGenerating?: boolean;
}

export const VideoSkeleton = ({ modelId, isGenerating = false }: VideoSkeletonProps) => {
  const { videoModels } = useModelsStore();
  const { generatingVideos } = useVideoGenerationStore();
  const modelInfo = videoModels.find(m => m.model_uid === modelId);
  
  // Find the active video generation for this model
  const activeVideo = Object.values(generatingVideos).find(video => video.modelId === modelId);
  const videoProgress = activeVideo?.progress || 0;

  return (
    <div className="border border-borderColorPrimary rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {modelInfo ? (
          <>
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <Image 
                src={modelInfo.model_image || '/images/images/default.webp'} 
                alt={modelInfo.model_name} 
                className="h-full w-full object-cover"
                width={32}
                height={32}
              />
            </div>
            <span className="font-medium">{modelInfo.model_name}</span>
          </>
        ) : (
          <>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </>
        )}
      </div>
      
      <div className="relative">
        <Skeleton className="w-full aspect-video rounded-lg" />
        
        {/* Overlay for generating status */}
        {isGenerating && (
          <div className="absolute inset-0 bg-muted-foreground/10 flex flex-col items-center justify-center rounded-lg">
            <div className="text-white text-center space-y-3 p-4">
              <Loader className="w-4 h-4 animate-spin text-yellow-500 mx-auto" />
              <p className="text-xs text-foreground">This may take a few minutes</p>
              <div className="w-56 mx-auto mt-2">
                <Progress 
                  value={videoProgress} 
                  className="h-1.5" 
                  indicatorClassName="bg-yellow-500"
                />
                {/* <div className="flex justify-end mt-1">
                  <span className="text-xs text-white/70">{videoProgress}%</span>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};