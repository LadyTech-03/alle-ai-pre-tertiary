// @ts-nocheck
"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { VideoQueueItem } from "@/stores/developer-benchmark";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Download,
  RefreshCw,
  Trash2,
  Film,
  Play,
  Loader2,
  CodeXml,
  ArrowBigDownDash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useChatAPIStore from "@/stores/developer-benchmark";
import VideoStatusPoller from "./videoStatusPoller";
import { toast } from "sonner";

// Helper function to format timestamps
const formatTimeElapsed = (timestamp: Date | string): string => {
  // Convert string timestamp to Date if needed
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const elapsed = Date.now() - date.getTime();

  if (elapsed < 60000) {
    return "Just now";
  } else if (elapsed < 3600000) {
    return `${Math.floor(elapsed / 60000)}m ago`;
  } else if (elapsed < 86400000) {
    return `${Math.floor(elapsed / 3600000)}h ago`;
  } else {
    return `${Math.floor(elapsed / 86400000)}d ago`;
  }
};

// Interface for model status
interface ModelStatus {
  model: string;
  status: "InProgress" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

// Interface for video queue items
// interface VideoQueueItem {
//   id: string;
//   requestId: string;
//   invocationId: string;
//   timestamp: Date;
//   prompt: string;
//   models: string[];
//   status: "processing" | "completed" | "failed";
//   videoUrl?: string;
//   error?: string;
//   requestDetails?: any;
//   progress?: number;
//   modelStatuses?: ModelStatus[];
// }

export default function VideoQueue() {
  // Active filter tab
  const [activeTab, setActiveTab] = useState<
    "all" | "processing" | "completed" | "failed"
  >("all");

  // Get queue items and actions from the store
  const videoQueue = useChatAPIStore((state) => state.videoQueue);
  const removeVideoQueueItem = useChatAPIStore(
    (state) => state.removeVideoQueueItem
  );
  const updateVideoQueueItem = useChatAPIStore(
    (state) => state.updateVideoQueueItem
  );

  // Filter items based on active tab
  const filteredItems = videoQueue.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  // Filter processing items for VideoStatusPoller
  const processingItems = videoQueue.filter(item => item.status === "processing");

  // Handle retry for failed items
  const handleRetry = (id: string) => {
    // Get the item before updating
    const item = videoQueue.find(item => item.id === id);
    if (!item) return;

    // Check if max retries reached
    if (item.retryAttempts && item.retryAttempts >= 3) {
      toast.error("Maximum retry attempts (3) reached for this request");
      return;
    }

    // Update with retry info and status
    updateVideoQueueItem(id, {
      status: "processing",
      isRetry: true,
      retryAttempts: (item.retryAttempts || 0) + 1
    });
  };

  // Handle remove item
  const handleRemove = (id: string) => {
    removeVideoQueueItem(id);
  };

  return (
    <ScrollArea className="h-full">
      {processingItems.length > 0 && (
        <VideoStatusPoller
          items={processingItems}
          onStatusUpdate={(id, status, error, videoUrl, modelStatuses) => {
            updateVideoQueueItem(id, {
              status,
              error,
              videoUrl,
              modelStatuses
            });
          }}
        />
      )}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Video Queue</h2>
        </div>

        <Tabs
          defaultValue="all"
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All{" "}
              <Badge variant="outline" className="ml-1">
                {videoQueue.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="processing" className="text-xs">
              Processing{" "}
              <Badge variant="outline" className="ml-1">
                {videoQueue.filter((i) => i.status === "processing").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed{" "}
              <Badge variant="outline" className="ml-1">
                {videoQueue.filter((i) => i.status === "completed").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="failed" className="text-xs">
              Failed{" "}
              <Badge variant="outline" className="ml-1">
                {videoQueue.filter((i) => i.status === "failed").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <QueueItemList
              items={filteredItems}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="processing" className="mt-0">
            <QueueItemList
              items={filteredItems}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-0">
            <QueueItemList
              items={filteredItems}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="failed" className="mt-0">
            <QueueItemList
              items={filteredItems}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Film className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">
              No video requests found
            </p>
            {activeTab !== "all" ? (
              <p className="text-sm text-muted-foreground">
                {`Switch to "All" to see all requests`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate a video to see it appear here
              </p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// Component to render the list of queue items
function QueueItemList({
  items,
  onRetry,
  onRemove,
}: {
  items: VideoQueueItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QueueItem item={item} onRetry={onRetry} onRemove={onRemove} />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}

// Component for each individual queue item
function QueueItem({
  item,
  onRetry,
  onRemove,
}: {
  item: VideoQueueItem;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const viewHistoryItem = useChatAPIStore((state) => state.viewHistoryItem);

  const handleViewResponse = () => {
    // Create a history item from the video queue item
    const historyItem = {
      id: item.id,
      name: "Video generation request",
      timestamp: item.timestamp,
      statusCode: 200,
      request: item.requestDetails,
      response: JSON.stringify(
        {
          status: "completed",
          prompt: item.prompt,
          models: item.models,
          // Include all model responses
          modelResponses: item.modelStatuses?.map(model => ({
            model: model.model,
            status: model.status,
            url: model.videoUrl
          })) || []
        },
        null,
        2
      ),
      responseStats: {
        statusCode: 200,
        statusText: "OK",
        time: "-",
        size: "-",
      },
    };

    viewHistoryItem(historyItem);
  };

  return (
    <Card
      className={cn(
        "border-borderColorPrimary overflow-hidden transition-all duration-200",
        isExpanded ? "mb-2" : "",
        "hover:border-primary/50",
        "bg-backgroundSecondary/30 dark:bg-backgroundSecondary/30",
        "hover:bg-backgroundSecondary/50 dark:hover:bg-backgroundSecondary/50"
      )}
    >
      <div
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <StatusIndicator status={item.status} />

            <div className="truncate flex-1">
              <p className="text-sm truncate font-medium" title={item.prompt}>
                {item.prompt}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTimeElapsed(item.timestamp)}</span>
                <span className="ml-1">•</span>
                <span>{item.models.join(", ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Only show main download button if there's exactly ONE model */}
            {item.status === "completed" &&
              item.videoUrl &&
              item.models.length === 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.videoUrl, "_blank");
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-borderColorPrimary mt-2">
              {item.status === "failed" && item.error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-2 mb-3 text-sm">
                  Error: {item.error}
                </div>
              )}

              {/* Model-specific statuses */}
              {item.modelStatuses && item.modelStatuses.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Model Status:</p>
                  <div className="space-y-2">
                    {item.modelStatuses.map((modelStatus) => (
                      <div
                        key={modelStatus.model}
                        className="flex items-center justify-between bg-backgroundSecondary/50 p-2 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <ModelStatusIndicator status={modelStatus.status} />
                          <span className="text-sm">{modelStatus.model}</span>
                        </div>
                        <div className="flex gap-1">
                          {/* Individual model download button */}
                          {modelStatus.status === "completed" &&
                            modelStatus.videoUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className=" bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(modelStatus.videoUrl, "_blank");
                                }}
                              >
                                {/* <ArrowBigDownDash className="h-4 w-4 bg-black dark:bg-white" /> */}
                                download
                              </Button>
                            )}
                          {modelStatus.status === "failed" &&
                            modelStatus.error && (
                              <span className="text-xs text-destructive">
                                {modelStatus.error}
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                {/* Show View Response button if any model is completed */}
                {(item.status === "completed" ||
                  item.modelStatuses?.some(
                    (m) => m.status === "completed" && m.videoUrl
                  )) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResponse();
                    }}
                  >
                    <CodeXml className="h-3 w-3 mr-1" />
                    View Response
                  </Button>
                )}
                {item.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry(item.id);
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Animated status indicator component for overall status
function StatusIndicator({ status }: { status: VideoQueueItem["status"] }) {
  if (status === "processing") {
    return (
      <div className="relative w-6 h-6">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        >
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </motion.div>
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
        <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
      </div>
    );
  }

  return null;
}

// Status indicator for model-specific statuses
function ModelStatusIndicator({ status }: { status: ModelStatus["status"] }) {
  if (status === "InProgress") {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-500 rounded-full opacity-75"></div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
      </div>
    );
  }

  return null;
}
