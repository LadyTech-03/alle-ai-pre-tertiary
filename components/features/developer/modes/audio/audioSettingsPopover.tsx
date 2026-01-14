"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Volume2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudioRequestSettings {
  sampleRate?: number;
  audioQuality?: "low" | "medium" | "high";
  duration?: number;
  language?: string;
  voice?: string;
}

interface AudioSettingsPopoverProps {
  mode: "stt" | "tts" | "generate";
  requestSettings: AudioRequestSettings;
  onSettingsChange: (settings: AudioRequestSettings) => void;
}

export default function AudioSettingsPopover({
  mode,
  requestSettings,
  onSettingsChange,
}: AudioSettingsPopoverProps) {
  const updateSettings = (key: string, value: any) => {
    onSettingsChange({
      ...requestSettings,
      [key]: value,
    });
  };

  const isDisabled = mode === "stt" || mode === "generate";
  const buttonText = mode === "tts" ? "Voice Options" : "Audio Options";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 px-2 text-xs border-borderColorPrimary ${
            isDisabled ? "opacity-50 cursor-not-allowed" : "bg-backgroundSecondary/30"
          }`}
          disabled={isDisabled}
        >
          <Volume2 className="w-3 h-3 mr-1" />
          {buttonText}
        </Button>
      </PopoverTrigger>

      {mode === "tts" && (
        <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
          <ScrollArea className="h-[200px] pr-3">
            <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
              <h3 className="font-medium text-sm mb-2">Voice Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="voice-style" className="text-xs">
                  Voice
                </Label>
                <Select
                  value={requestSettings.voice}
                  onValueChange={(value) => updateSettings("voice", value)}
                >
                  <SelectTrigger
                    id="voice-style"
                    className="h-8 text-xs mt-1"
                  >
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">Nova (Default)</SelectItem>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="summit">Summit</SelectItem>
                    <SelectItem value="aurora">Aurora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </ScrollArea>
        </PopoverContent>
      )}

      {mode === "stt" && (
        <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
          <ScrollArea className="h-[300px] pr-3">
            <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
              <h3 className="font-medium text-sm mb-2">
                Transcription Settings
              </h3>

              <div className="space-y-2">
                <Label htmlFor="language-detect" className="text-xs">
                  Language Detection
                </Label>
                <Select
                  defaultValue="auto"
                  onValueChange={(value) => {}}
                >
                  <SelectTrigger
                    id="language-detect"
                    className="h-8 text-xs mt-1"
                  >
                    <SelectValue placeholder="Select language detection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="single">Single Language</SelectItem>
                    <SelectItem value="multi">Multi-Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcription-mode" className="text-xs">
                  Transcription Mode
                </Label>
                <Select
                  defaultValue="standard"
                  onValueChange={(value) => {}}
                >
                  <SelectTrigger
                    id="transcription-mode"
                    className="h-8 text-xs mt-1"
                  >
                    <SelectValue placeholder="Select transcription mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="verbose">
                      Verbose (with timestamps)
                    </SelectItem>
                    <SelectItem value="draft">Draft (faster)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </ScrollArea>
        </PopoverContent>
      )}

      {mode === "generate" && (
        <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
          <ScrollArea className="h-[300px] pr-3">
            <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
              <h3 className="font-medium text-sm mb-2">Generation Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-xs">
                  Genre/Style
                </Label>
                <Select
                  defaultValue="ambient"
                  onValueChange={(value) => {}}
                >
                  <SelectTrigger id="genre" className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo" className="text-xs">
                  Tempo (BPM)
                </Label>
                <Select
                  defaultValue="120"
                  onValueChange={(value) => {}}
                >
                  <SelectTrigger id="tempo" className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Select tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">Slow (60 BPM)</SelectItem>
                    <SelectItem value="120">Medium (120 BPM)</SelectItem>
                    <SelectItem value="140">Fast (140 BPM)</SelectItem>
                    <SelectItem value="180">Very Fast (180 BPM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </ScrollArea>
        </PopoverContent>
      )}
    </Popover>
  );
}
