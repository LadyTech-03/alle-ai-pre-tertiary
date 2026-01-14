"use client";

import { useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw as Replay,
  Square,
  FastForward,
  Rewind,
  Download,
  Heart,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  import { toast } from "sonner";
import Image from "next/image";

interface AudioPlayerProps {
  audioUrl: string; // URL of the audio file
  modelId: string; // Unique identifier for the audio model
  modelIcon: string; // URL of the model's icon/image
  modelName: string; // Name of the model
  onLike?: (modelId: string) => void; // Callback for liking the audio
  liked?: boolean; // Whether the audio is liked
}

export function AudioPlayer({
  audioUrl,
  modelId,
  modelIcon,
  modelName,
  onLike,
  liked,
}: AudioPlayerProps) {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  // Format time (e.g., 125 -> "2:05")
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  // Handle stop
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  };

  // Handle replay
  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setAudioState((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioState((prev) => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioState((prev) => ({
        ...prev,
        duration: audioRef.current!.duration,
      }));
    }
  };

  // Handle slider change (seek)
  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setAudioState((prev) => ({ ...prev, currentTime: value[0] }));
    }
  };

  // Handle playback speed change
  const handlePlaybackRateChange = (faster: boolean) => {
    if (audioRef.current) {
      const newRate = faster
        ? Math.min(audioRef.current.playbackRate + 0.5, 2)
        : Math.max(audioRef.current.playbackRate - 0.5, 0.5);

      audioRef.current.playbackRate = newRate;
      setAudioState((prev) => ({ ...prev, playbackRate: newRate }));
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${modelId}-audio.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download audio file.");
    }
  };

  // Handle like
  const handleLikeClick = () => {
    if (onLike) {
      onLike(modelId);
    }
  };

  return (
    <div className="border border-borderColorPrimary rounded-lg p-4 space-y-4">
      {/* Model Icon and Name */}
      <div className="flex items-center gap-2">
        <Image
          src={modelIcon}
          alt={modelName}
          width={34}
          height={34}
          className="w-6 h-6 rounded-full"
        />
        <h3 className="font-medium">{modelName}</h3>
      </div>

      {/* Playback Controls */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={handlePlayPause}
            >
              {audioState.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={handleStop}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={handleReplay}
            >
              <Replay className="h-4 w-4" />
            </Button>

            {/* Speed Controls */}
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={() => handlePlaybackRateChange(false)}
            >
              <Rewind className="h-4 w-4" />
            </Button>
            <span className="text-xs">{audioState.playbackRate}x</span>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={() => handlePlaybackRateChange(true)}
            >
              <FastForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={handleLikeClick}
            >
              <Heart
                className={cn("h-4 w-4", liked && "fill-current text-red-500")}
              />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 focus-visible:outline-none"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time and Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(audioState.currentTime)}</span>
            <span>{formatTime(audioState.duration)}</span>
          </div>
          <Slider
            value={[audioState.currentTime]}
            max={audioState.duration}
            step={0.1}
            onValueChange={handleSliderChange}
            className="focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setAudioState((prev) => ({ ...prev, isPlaying: false }))}
      />
    </div>
  );
}
