import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader } from "lucide-react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Maximize2 } from "lucide-react";
import { Pause } from "lucide-react";
import { Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";

import { useLikedMediaStore, LikedMediaItem} from "@/stores";
import { likedApi } from "@/lib/api/liked";
import { toast } from "sonner";
import { chatApi } from "@/lib/api/chat";

interface TabContentProps {
  type: "all" | "image" | "video" | "audio";
  searchQuery: string;
  isOpen: boolean;
  onItemSelect: (item: LikedMediaItem) => void;
  onUnlike: (id: string, responseId: string, onSuccess: () => void) => void;
  unlikingResponseId: string | null;
}

function TabContent({ type, searchQuery, isOpen, onItemSelect, onUnlike, unlikingResponseId }: TabContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tabMedia, setTabMedia] = useState<LikedMediaItem[]>([]);
  const { addLikedMedia, clearLikedMedia } = useLikedMediaStore();

  // Fetch data for this specific tab
  useEffect(() => {
    const fetchTabData = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        let response;
        
        switch (type) {
          case 'image':
            response = await likedApi.getLikedImageResponses();
            break;
          case 'video':
            response = await likedApi.getLikedVideoResponses();
            break;
          case 'audio':
            response = await likedApi.getLikedAudioResponses();
            break;
          case 'all':
          default:
            response = await likedApi.getLikedResponses();
            break;
        }

        if (response.data && Array.isArray(response.data)) {
          const mappedItems = response.data.map((item) => ({
            id: `${item.type}-${item.id}-${Date.now()}`,
            type: item.type as "image" | "video" | "audio",
            responseId: item.id.toString(),
            url: item.body,
            modelName: item.model.name,
            modelIcon: item.model.image,
            modelId: item.model.uid,
            prompt: "",
            liked: true,
            timestamp: new Date(),
          }));
          setTabMedia(mappedItems);
        }
      } catch (error) {
        // toast.error("Ooops, something went wrong!", {
        //   description: "Please try again",
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTabData();
  }, [isOpen, type]);

  // Filter media based on search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery) return tabMedia;
    return tabMedia.filter(
      (item) =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modelName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tabMedia, searchQuery]);

  // Remove item from local state when unliked
  const handleLocalRemove = (responseId: string) => {
    setTabMedia(prev => prev.filter(item => item.responseId !== responseId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-4 w-4 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (filteredMedia.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Heart className="h-12 w-12 mb-4" />
        <p>No {type === "all" ? "media" : type + "s"} found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredMedia.map((item) => (
        <div
          key={item.id}
          className="relative group rounded-lg overflow-hidden"
        >
          {item.type === "video" ? (
            <video
              src={item.url}
              className="w-full h-full aspect-video object-cover"
              muted
              loop
              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
              onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
            />
          ) : item.type === "image" ? (
            <Image
              src={item.url}
              alt={item.prompt}
              width={400}
              height={400}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="group w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                    {item.prompt.length > 30
                      ? item.prompt.substring(0, 30) + "..."
                      : item.prompt}
                  </p>
                </div>
              </div>
          )}

          {/* Always visible name and logo */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm mb-2 line-clamp-2 drop-shadow-lg">
              {item.prompt}
            </p>
            <div className="flex items-center gap-2 w-fit bg-black/60 rounded-lg p-1">
              <Image
                src={item.modelIcon}
                alt={item.modelName || ""}
                width={16}
                height={16}
                className="w-4 h-4 rounded-full"
              />
              <span className="text-white/90 text-xs drop-shadow-lg">
                {item.modelName}
              </span>
            </div>
          </div>

          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 right-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => onUnlike(item.id, item.responseId, () => handleLocalRemove(item.responseId))}
                  disabled={unlikingResponseId === item.responseId}
                >
                  {unlikingResponseId === item.responseId ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => onItemSelect(item)}
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
  }


  export function AlbumModal({ isOpen, onClose }: ModalProps) {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<LikedMediaItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [unlikingResponseId, setUnlikingResponseId] = useState<string | null>(null);
    const { likedMedia, removeLikedMedia, addLikedMedia, clearLikedMedia } =
      useLikedMediaStore();
  
    // Audio state management
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
  
    // Handle unlike action
    const handleUnlike = async (id: string, responseId: string, onSuccess: () => void) => {
      setUnlikingResponseId(responseId);
      
      try {
        const response = await chatApi.updateLikeState(responseId, "none");
        
        if (response.status) {
          // Only remove from UI after successful API call
          onSuccess();
          toast.success("Item unliked");
        } else {
          toast.error("Failed to unlike item");
        }
      } catch (error) {
        // console.error("Error unliking item:", error);
        // toast.error("Failed to unlike item");
      } finally {
        setUnlikingResponseId(null);
      }
    };
  
    // Audio control handlers
    const handlePlayPause = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };
  
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
  
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
  
    const handleSliderChange = (value: number[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    };
  
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
  
    // Reset audio state when closing preview
    useEffect(() => {
      if (!isPreviewOpen) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    }, [isPreviewOpen]);
  
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95%] md:max-w-5xl h-[80vh]">
          <DialogHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <DialogTitle className="text-lg font-semibold">Favorite Media</DialogTitle>
  
              {/* Controls Container - properly spaced from close button */}
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4 md:pr-8">
                {/* Search Input */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by model"
                    className="pl-8 border-borderColorPrimary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
  
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="data-[state=active]:bg-purple-500/30 text-xs md:text-sm text-foreground"
              >
                Images
              </TabsTrigger>
              <TabsTrigger
                value="audio"
                className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm text-foreground"
              >
                Audio
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="data-[state=active]:bg-yellow-500/30 text-xs md:text-sm text-foreground"
              >
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <TabContent
                  type="all"
                  searchQuery={searchQuery}
                  isOpen={isOpen}
                  onItemSelect={(item) => {
                    setSelectedItem(item);
                    setIsPreviewOpen(true);
                  }}
                  onUnlike={handleUnlike}
                  unlikingResponseId={unlikingResponseId}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="image" className="flex-1">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <TabContent
                  type="image"
                  searchQuery={searchQuery}
                  isOpen={isOpen}
                  onItemSelect={(item) => {
                    setSelectedItem(item);
                    setIsPreviewOpen(true);
                  }}
                  onUnlike={handleUnlike}
                  unlikingResponseId={unlikingResponseId}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="video" className="flex-1">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <TabContent
                  type="video"
                  searchQuery={searchQuery}
                  isOpen={isOpen}
                  onItemSelect={(item) => {
                    setSelectedItem(item);
                    setIsPreviewOpen(true);
                  }}
                  onUnlike={handleUnlike}
                  unlikingResponseId={unlikingResponseId}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="audio" className="flex-1">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <TabContent
                  type="audio"
                  searchQuery={searchQuery}
                  isOpen={isOpen}
                  onItemSelect={(item) => {
                    setSelectedItem(item);
                    setIsPreviewOpen(true);
                  }}
                  onUnlike={handleUnlike}
                  unlikingResponseId={unlikingResponseId}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
  
        {/* Preview Modal */}
        {selectedItem && (
          <Dialog
            open={isPreviewOpen}
            onOpenChange={() => setIsPreviewOpen(false)}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Preview</DialogTitle>
              </DialogHeader>
              <div className="aspect-video relative rounded-lg overflow-hidden">
                {selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                  />
                ) : selectedItem.type === "image" ? (
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.prompt}
                    fill
                    className="object-contain rounded-lg"
                  />
                ) : (
                  // Enhanced audio player preview
                  <div className="w-full h-full flex flex-col items-center justify-center bg-accent/10 p-8">
                    <Music className="h-24 w-24 mb-8 text-muted-foreground" />
                    <div className="w-full max-w-md space-y-4">
                      {/* Audio Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
  
                      {/* Time and Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={0.1}
                          onValueChange={(value) => handleSliderChange(value)}
                          className="w-full"
                        />
                      </div>
  
                      <audio
                        ref={audioRef}
                        src={selectedItem.url}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedItem.prompt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={selectedItem.modelIcon}
                      alt={selectedItem.modelName || ""}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{selectedItem.modelName}</span>
                  </div>
                  {/* <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(selectedItem.timestamp, { addSuffix: true, locale: enUS })}
                  </span> */}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Dialog>
    );
  }