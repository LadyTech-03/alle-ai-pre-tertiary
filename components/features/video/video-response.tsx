import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Heart, Loader, Download } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useRef } from "react";
import { Progress } from "@/components/ui/progress";

interface VideoResponse {
    modelId: string;
    videoUrl: string;
    liked?: boolean;
}

interface VideoModelInfo {
  model_uid: string;
  model_name: string;
  model_image: string;
  model_plan?: string;
  model_provider?: string;
}

const useVideoControls = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    return {
      isPlaying,
      setIsPlaying,
      isMuted,
      setIsMuted,
      isFullscreen,
      setIsFullscreen
    };
  };
  
const VideoResponse = React.memo(({ 
    video, 
    onLike,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious,
    videoModels
  }: { 
    video: VideoResponse, 
    onLike: (video: VideoResponse) => void,
    onNext?: () => void,
    onPrevious?: () => void,
    hasNext?: boolean,
    hasPrevious?: boolean,
    videoModels: VideoModelInfo[];
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [downloadingVideo, setDownloadingVideo] = useState(false);

    // Log video URL for debugging
    useEffect(() => {
      // console.log('Video URL in VideoResponse:', video.videoUrl);
    }, [video.videoUrl]);

    const {
      isPlaying,
      setIsPlaying,
      isMuted,
      setIsMuted,
      isFullscreen,
      setIsFullscreen
    } = useVideoControls();
  
  
    // Calculate progress percentage
    const progress = duration ? (currentTime / duration) * 100 : 0;
  
    // Add event listeners for time updates
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
  
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
  
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setVideoLoaded(true);
        // console.log('Video loaded successfully');
      };

      const handleError = (e: Event) => {
        console.error('Video loading error:', e);
        setVideoError(true);
      };
  
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
  
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }, []);
  
    // Handle seeking
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };
  
    // Format time for display
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
  
  
    const togglePlay = useCallback(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }, [isPlaying]);
  
    const toggleMute = useCallback(() => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }, [isMuted]);
  
    const toggleFullscreen = useCallback(() => {
      if (containerRef.current) {
        if (!document.fullscreenElement) {
          containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }, []);

    const mutedModelUids = ['nova-reel', 'ray-2', 'veo-2', 'sora', 'pixverse', 'seedance-1-0-pro'];
    const modelInfo = videoModels.find(m => m.model_uid === video.modelId);
    useEffect(() => {
      const shouldMute = !!(modelInfo?.model_uid && mutedModelUids.includes(modelInfo.model_uid));
      setIsMuted(shouldMute);
    }, [modelInfo?.model_uid]);

    const handleDownload = async (videoUrl: string, modelName: string) => {
      // Create a loading toast that we can dismiss later
      const loadingToast = toast.loading('Downloading video');
      setDownloadingVideo(true);
      try {
        //Fetch video data
        const response = await fetch(videoUrl, { mode: "cors" });
        const blob = await response.blob();

        const filename = videoUrl.split('/').pop() || `Alle-AI-${modelName}-generated-video.mp4`;

        // Create a link for the blob
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        //Cleanup
        window.URL.revokeObjectURL(link.href);

        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        setDownloadingVideo(false);
      } catch (error) {
        // Dismiss the loading toast and show error
        toast.dismiss(loadingToast);
        toast.error('Failed to download video');
        setDownloadingVideo(false);
      }
    };

    if (!modelInfo) {
      console.error('Model info not found for:', video.modelId);
      return null;
    }
  
    if (videoError) {
      return (
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <div className="text-center text-white p-4">
            <p>Error loading video. Please try again.</p>
            <p className="text-xs mt-2 text-gray-400">{video.videoUrl}</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="relative group rounded-lg overflow-hidden bg-black">
        {/* Model Badge */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 select-none">
          <Image
            src={modelInfo.model_image || '/images/images/default.webp'} 
            alt={modelInfo.model_name} 
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm text-white font-medium">
            {modelInfo.model_name}
          </span>
        </div>
  
        {/* Video Element */}
        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full aspect-video object-contain"
          loop
          muted={isMuted}
          preload="auto"
          onLoadedMetadata={() => {}}
          onCanPlay={() => {}}
        />
  
        {/* Navigation controls - shown in both normal and fullscreen modes */}
        {(hasPrevious || hasNext) && (
          <>
            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-40"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-40"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </>
        )}
  
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Seeker Bar */}
          <div className="flex flex-col gap-2 w-full mb-2">
            <div 
              className="relative cursor-pointer" 
              onClick={handleSeek}
            >
              <Progress 
                value={progress} 
                className="h-1 cursor-pointer hover:h-1.5 transition-all"
              />
            </div>
            <div className="flex justify-between text-xs text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
  
          {/* Existing Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={mutedModelUids.includes(modelInfo.model_uid)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={() => onLike(video)}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={video.liked ? "red" : "none"} 
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={() => handleDownload(video.videoUrl, modelInfo.model_name)}
                disabled={downloadingVideo}
              >
                {downloadingVideo ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  });
  VideoResponse.displayName = 'VideoResponse';

  export default VideoResponse;