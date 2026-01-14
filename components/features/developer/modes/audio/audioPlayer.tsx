"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AudioPlayerProps {
  audioSrc: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  onRemove?: () => void;
}

export default function AudioPlayer({ 
  audioSrc,
  fileName,
  fileSize,
  fileType,
  onRemove
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    const audio = document.getElementById("audio-player") as HTMLAudioElement;
    if (audio) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-player") as HTMLAudioElement;
    if (audio) {
      const seekTime = parseFloat(e.target.value);
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-2">
      {/* Hidden audio element */}
      <audio
        id="audio-player"
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) =>
          setDuration(
            (e.target as HTMLAudioElement).duration
          )
        }
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Custom player UI */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full bg-primary/20 hover:bg-primary/40 text-primary"
          onClick={togglePlayPause}
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Pause className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Play className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Progress bar */}
        <div className="flex-1 relative h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          {/* Progress track */}
          <div
            className="absolute left-0 top-0 h-full bg-zinc-400 dark:bg-zinc-300 transition-all duration-100"
            style={{
              width: `${
                (currentTime / (duration || 1)) * 100
              }%`,
            }}
          />

          {/* Seek input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Time display */}
        <div className="text-xs text-muted-foreground min-w-[80px] text-right">
          {formatTime(currentTime)} /{" "}
          {formatTime(duration)}
        </div>
      </div>

      {/* Audio info */}
      {(fileType || fileName) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {fileType && `Format: ${fileType}`}
          </span>
          <span>Click progress bar to seek</span>
        </div>
      )}
    </div>
  );
}
