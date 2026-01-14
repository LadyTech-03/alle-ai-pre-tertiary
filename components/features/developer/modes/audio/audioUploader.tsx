"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileAudio, X } from "lucide-react";
import AudioPlayer from "./audioPlayer";
import { validateFileUpload } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedAudioFile {
  file: File;
  duration: number;
  preview: string;
}

interface AudioUploaderProps {
  uploadedAudio: UploadedAudioFile | null;
  onAudioUpload: (file: File) => void;
  onAudioRemove: () => void;
}

export default function AudioUploader({
  uploadedAudio,
  onAudioUpload,
  onAudioRemove,
}: AudioUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationResult = validateFileUpload(file, 'audio');
    
    if (!validationResult.isValid) {
      toast.error(validationResult.error);
      return;
    }

    onAudioUpload(file);
  };

  return (
    <div className="border-2 border-dashed border-borderColorPrimary rounded-lg p-4">
      <div className="text-xs text-muted-foreground mb-3">
        Note: The file will be sent using FormData in an actual
        API call.
      </div>

      {!uploadedAudio ? (
        <div className="flex flex-col items-center justify-center py-4 bg-backgroundSecondary/30 rounded-md">
          <FileAudio className="h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-sm text-muted-foreground text-center">
            <p className="font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs">MP3, WAV, M4A up to 25MB</p>
          </div>
          <Input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-borderColorPrimary"
            onClick={() =>
              document.getElementById("audio-upload")?.click()
            }
          >
            Select Audio File
          </Button>
        </div>
      ) : (
        <div className="relative group">
          <div className="p-4 bg-backgroundSecondary/30 rounded-md">
            <div className="flex flex-col space-y-3">
              {/* File info header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-white">
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">
                      {uploadedAudio.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(
                        uploadedAudio.file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 w-7 rounded-full p-0 opacity-80"
                  onClick={onAudioRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* AudioPlayer component */}
              <AudioPlayer 
                audioSrc={uploadedAudio.preview} 
                fileType={uploadedAudio.file.type || "audio/*"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
